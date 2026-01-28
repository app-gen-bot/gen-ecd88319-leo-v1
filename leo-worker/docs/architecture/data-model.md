# Leo Data Model & Workflows

## Core Entities

### User
- **Identity**: UUID (from Supabase Auth / OAuth)
- **Owns**: Multiple Apps
- **Has**: GitHub connection (optional, for pushing to user's repo)

### App
- **Identity**: UUID
- **Belongs to**: User
- **Tracks**: Current commit SHA, repo URLs
- **State**: `pending` | `generating` | `ready` | `failed`

### Commit
- **Identity**: Git SHA
- **Represents**: Point-in-time snapshot
- **Relationship**: `leo-state.json` in artifacts records corresponding app commit SHA
- **Enables**: Resume from any historical point

### Two Repos Per App

| Repo | Path | Owner | Purpose |
|------|------|-------|---------|
| **App** | `/workspace/app` | User's GitHub OR our hosted | Deliverable code, schema, migrations |
| **Artifacts** | `/workspace/leo-artifacts` | Always ours (internal) | Sessions, plans, state, history |

---

## Unified Workflow

There is ONE workflow with parameters. The "source" is just configuration.

### Inputs
```
user_id         - Who owns this
app_id          - null (new) or existing UUID
app_repo_url    - null (new hosted), our URL, or user's GitHub URL
commit_sha      - null (HEAD) or specific SHA to resume from
prompt          - What to build/modify
```

### Resolution Logic
```
If app_id is null:
  → NEW APP (create fresh)
Else:
  → RESUME (clone existing at commit_sha or HEAD)
```

### Setup Phase

**New App:**
```
Create App record in DB (state: pending)
Init empty /workspace/app/.git
Init empty /workspace/leo-artifacts/.git
Configure remotes (our hosted org or user's GitHub)
```

**Resume:**
```
Lookup App record → get both repo URLs
Clone app repo → checkout commit_sha (or HEAD)
Clone artifacts repo → checkout corresponding commit
Load leo-state.json for context
```

### Generation Phase
```
Agent receives: prompt + workspace + state
Agent works:
  - Generates/modifies code
  - Makes LOCAL commits (granular, semantic)
  - Updates leo-state.json

Orchestrator triggers PUSH at:
  - iteration_complete → push both repos (safety checkpoint)
  - all_work_complete → push both repos (final state)
  - checkpoint command → push both repos (intentional pause)
  - error/failure → push artifacts (debugging state)
```

### Teardown Phase
```
Update App record (state: ready/failed, current_commit: SHA)
Container removed
State persists in Git + DB
```

---

## Use Cases

### 1. Start Fresh
User provides prompt, no existing app.
- `app_id: null, app_repo_url: null, commit_sha: null`
- Creates new app, new repos, generates from scratch

### 2. Resume Latest
User selects existing app, continues from current state.
- `app_id: <uuid>, commit_sha: null` (defaults to HEAD)
- Clones both repos at HEAD, loads state, accepts new prompt

### 3. Resume from Specific Commit
User selects existing app + picks historical commit.
- `app_id: <uuid>, commit_sha: <sha>`
- Clones both repos, checks out that point
- Creates new branch/divergent history from there
- Useful for: "go back to before I broke it"

### 4. Import External Repo
User provides their own GitHub URL (not previously managed by Leo).
- `app_id: null, app_repo_url: <user-github-url>`
- Clone their repo, init fresh artifacts
- Analyze existing code, build initial state
- Accept prompt for modifications

### 5. Checkpoint & Resume (Future)
Mid-generation, orchestrator sends `checkpoint` command via WSI.
- Agent commits current work
- Push both repos
- Container can be torn down
- Resume later with `app_id + commit_sha`

---

## Git Operations

### Who Does What

| Operation | Actor | When |
|-----------|-------|------|
| `git init` | Workflow (setup) | New app |
| `git clone` | Workflow (setup) | Resume |
| `git checkout` | Workflow (setup) | Resume from specific commit |
| `git commit` | Agent | After significant work units |
| `git push` | Workflow (programmatic) | iteration_complete, all_work_complete, checkpoint |

### Push Strategy

**Why push at intervals (not just at end)?**
- Container can die mid-generation
- User can see progress in real-time
- Enables checkpoint/resume
- Debugging failed generations

**Push triggers:**
1. `iteration_complete` → Push both repos
2. `all_work_complete` → Push both repos + update DB
3. `checkpoint` (WSI command) → Push both repos + mark pausable
4. `error` → Push artifacts only (preserve debug state)

---

## State Coordination

### leo-state.json (in artifacts repo)
```json
{
  "app_id": "uuid",
  "app_commit": "sha",
  "generation_id": "uuid",
  "phase": "planning|generating|validating|complete",
  "iteration": 3,
  "last_prompt": "...",
  "files_generated": [...],
  "errors": [...]
}
```

This file is the bridge between commits. When resuming:
1. Clone artifacts repo
2. Read `leo-state.json`
3. Know which app commit corresponds
4. Know what phase/iteration we were in
5. Continue intelligently

---

## SaaS DB Schema

```sql
users (
  id              UUID PRIMARY KEY,
  auth_provider_id TEXT NOT NULL,
  github_token    TEXT,  -- encrypted, for pushing to user repos
  created_at      TIMESTAMPTZ
)

apps (
  id                  UUID PRIMARY KEY,
  user_id             UUID REFERENCES users,
  name                TEXT,
  state               TEXT,  -- pending, generating, ready, failed
  app_repo_url        TEXT,  -- our hosted or user's GitHub
  app_repo_owner      TEXT,  -- 'hosted' or 'user'
  artifacts_repo_url  TEXT,  -- always our internal org
  current_commit      TEXT,  -- latest app commit SHA
  created_at          TIMESTAMPTZ,
  updated_at          TIMESTAMPTZ
)

generations (
  id              UUID PRIMARY KEY,
  app_id          UUID REFERENCES apps,
  prompt          TEXT,
  status          TEXT,  -- running, completed, failed, stopped
  start_commit    TEXT,
  end_commit      TEXT,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ
)
```

---

## Design Principles

1. **Git is the source of truth** for code and artifacts
2. **DB is the index** - metadata, lookups, relationships
3. **Loose coupling** between app and artifacts commits (linked via state file)
4. **Idempotent resume** - can always reconstruct state from repos
5. **Agent commits, workflow pushes** - separation of concerns
6. **One workflow, parameterized** - no special cases for hosted vs user repos
