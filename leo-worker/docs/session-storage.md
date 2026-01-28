# Session Storage

This document describes how Leo and Claude each manage sessions, and how they interrelate.

---

## Leo Session Tracking

Leo tracks sessions to enable resuming generation across iterations.

### Storage Location

```
{app_path}/.agent_session.json
```

Example: `/workspace/app/SurveySmith/app/.agent_session.json`

### File Contents

```json
{
  "session_id": "9349495b-09de-4e64-a938-411801bc6473",
  "app_path": "/workspace/app/SurveySmith/app",
  "timestamp": "2025-12-17T02:58:23.456Z",
  "context": {
    "last_phase": "BUILD",
    "entities_completed": ["users", "surveys"]
  }
}
```

### Key Functions

| Function | Location | Purpose |
|----------|----------|---------|
| `save_session()` | `agent.py:574` | Write session ID + context to `.agent_session.json` |
| `load_session()` | `agent.py:606` | Read session from app directory (or legacy location) |
| `get_app_session_file()` | `agent.py:570` | Returns `Path(app_path) / ".agent_session.json"` |

### Session Flow

```
generate_app()
    │
    ├─► run_with_session() → Claude creates session
    │
    ├─► agent.session_id captured
    │
    └─► save_session() → writes .agent_session.json

resume_generation()
    │
    ├─► load_session() → reads .agent_session.json
    │
    ├─► session_id extracted
    │
    └─► resume_with_session(session_id) → tells Claude to resume
```

---

## Claude Session Storage

Claude stores conversations in a cwd-based directory structure.

### Storage Location

```
~/.claude/
├── projects/                              # Per-project conversations
│   ├── {sanitized-cwd-1}/                 # e.g., -workspace-app
│   │   ├── {session-uuid}.jsonl           # Full conversation history
│   │   └── agent-{short-id}.jsonl         # Sub-agent conversations
│   └── {sanitized-cwd-2}/                 # e.g., -workspace-app-SurveySmith-app
│       └── ...
├── todos/                                 # Todo state per session
│   └── {session-uuid}-agent-{uuid}.json
├── session-env/                           # Shell environment state
├── shell-snapshots/                       # Bash state between invocations
└── statsig/                               # Analytics/feature flags
```

### Path Sanitization

Claude converts the working directory to a directory name:

| CWD | Sanitized Path |
|-----|----------------|
| `/workspace/app` | `-workspace-app` |
| `/workspace/app/SurveySmith/app` | `-workspace-app-SurveySmith-app` |

### Session Files

**Conversation JSONL** (`{uuid}.jsonl`):
- Each line is a JSON object (message, tool call, or result)
- Contains full conversation history
- Enables `claude --resume {session-id}`

**Size Examples** (from running container):
```
84352fa0-....jsonl   428KB   (active session, many turns)
e88f2285-....jsonl   101KB   (previous session)
79ce29fa-....jsonl   139B    (failed/short session)
```

### Resume Mechanism

```bash
# Resume most recent conversation
claude --continue

# Resume specific session
claude --resume 84352fa0-6506-4097-80ae-20a6a803d350
```

Claude looks for `{session-id}.jsonl` in `~/.claude/projects/{sanitized-cwd}/`.

---

## Interrelation: The CWD Mismatch Problem

Leo stores a session ID, but Claude uses **cwd-based paths** to locate sessions.

### The Problem

```
1. Generation starts with cwd=/workspace/app
   └─► Claude creates: ~/.claude/projects/-workspace-app/9349495b.jsonl

2. App created at /workspace/app/SurveySmith/app
   └─► Leo saves: /workspace/app/SurveySmith/app/.agent_session.json
       └─► Contains: session_id = "9349495b"

3. Resume with cwd=/workspace/app/SurveySmith/app
   └─► Leo reads session_id = "9349495b"
   └─► Claude looks for: ~/.claude/projects/-workspace-app-SurveySmith-app/9349495b.jsonl
   └─► NOT FOUND (it's in -workspace-app/, not -workspace-app-SurveySmith-app/)
   └─► Error: "No conversation found with session ID: 9349495b"
```

### Why This Happens

| Component | What It Tracks | Indexed By |
|-----------|----------------|------------|
| Leo | Session ID (UUID) | App path |
| Claude | Conversation JSONL | CWD at creation time |

When cwd changes between generation start and resume, the lookup fails.

### Current Behavior

Leo's `resume_with_session()` has fallback logic:

1. Try stored session ID → may fail if cwd changed
2. Search for sessions in current cwd via `find_sessions_for_cwd()`
3. Try older sessions
4. Start fresh session if all fail

### Potential Solutions

| Solution | Description | Trade-offs |
|----------|-------------|------------|
| **Consistent CWD** | Always use same cwd (e.g., `/workspace/app`) | App paths become relative |
| **Store CWD with session** | Leo saves original cwd, restores before resume | More complex session file |
| **Symlink Claude storage** | Point `~/.claude` to persistent location | Enables cross-container resume |
| **Copy sessions** | Save Claude sessions to artifacts area | Manual sync required |

---

## Container Considerations

In Docker containers, Claude's storage is ephemeral:

```
Container: /home/leouser/.claude/
           └─► Lost when container stops
```

### For Persistence

**Option A**: Mount volume
```yaml
volumes:
  - ./artifacts/claude-sessions:/home/leouser/.claude
```

**Option B**: Copy on completion
```bash
cp -r /home/leouser/.claude/ /workspace/leo-artifacts/claude-sessions/
```

**Option C**: Symlink at startup
```bash
ln -s /workspace/leo-artifacts/claude-sessions /home/leouser/.claude
```

---

## Summary

| Aspect | Leo | Claude |
|--------|-----|--------|
| **Storage** | `.agent_session.json` in app dir | `~/.claude/projects/{cwd}/` |
| **Format** | JSON (session ID + context) | JSONL (full conversation) |
| **Index** | App path | CWD at creation |
| **Persistence** | With app code | Ephemeral in container |
| **Resume** | Pass session ID to Claude | `--resume {session-id}` |

**Key insight**: Leo and Claude use different indexing strategies. Leo indexes by app path, Claude indexes by cwd. When these diverge, session lookup fails.
