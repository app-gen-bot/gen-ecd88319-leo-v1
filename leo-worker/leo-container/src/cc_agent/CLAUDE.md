# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`cc_agent` is a Python wrapper around the `claude-agent-sdk` that provides a simplified interface for building multi-agent systems on top of Claude Code CLI. It handles session management, retry logic, conversation logging, and MCP tool configuration.

## Architecture

```
cc_agent/
├── base.py              # Agent class - core wrapper around claude_agent_sdk
├── session_utils.py     # Session discovery and management utilities
├── retry_handler.py     # Exponential backoff for API errors
├── conversation_logger.py # Full conversation logging (JSONL + text)
├── utils.py             # Message extraction helpers
└── logging.py           # Dual console/file logging setup
```

### Core Components

**Agent** (`base.py`): The main class wrapping `claude_agent_sdk.query()`. Provides:
- `run(prompt)` - One-shot execution, creates new session each call
- `run_with_session(prompt, session_id)` - Persistent session with context preservation
- Returns `AgentResult` with content, cost, success status, tool uses, and termination reason

**Session Storage**: Claude CLI stores sessions at `~/.claude/projects/<encoded-cwd>/<session-id>.jsonl`. The `session_utils.py` module provides utilities to discover and resume these sessions.

## Usage Pattern

```python
from cc_agent import Agent, AgentResult

# Define an agent
agent = Agent(
    name="My Agent",
    system_prompt="You are a helpful assistant...",
    allowed_tools=["Read", "Write", "Bash"],  # Tool whitelist
    max_turns=10,
    cwd="/path/to/workspace",
    model="claude-sonnet-4-20250514",  # Optional
    mcp_tools=["oxc", "tree_sitter"],   # Auto-configure MCP servers
)

# One-shot execution
result: AgentResult = await agent.run("Do something")
print(result.content, result.cost, result.success)

# Session-based execution (preserves context across calls)
result1 = await agent.run_with_session("First task")
session_id = result1.metadata["session_id"]
result2 = await agent.run_with_session("Follow-up task", session_id=session_id)
```

## Key Configuration Options

| Parameter | Description |
|-----------|-------------|
| `allowed_tools` | List of tools the agent can use |
| `restrict_to_allowed_tools` | If True, auto-populates `disallowed_tools` for strict whitelisting |
| `max_turns` | Maximum conversation turns before termination |
| `permission_mode` | Default: `"bypassPermissions"` - runs without user confirmation |
| `mcp_tools` | Simplified MCP config - auto-builds from `cc_tools.mcp_registry` |
| `mcp_servers` | Full MCP server config (takes precedence over `mcp_tools`) |
| `agents` | Subagent configurations for automatic task delegation (SDK v0.1.4+) |
| `setting_sources` | Sources for settings (e.g., `["user", "project"]` for Skills) |

## AgentResult Structure

```python
@dataclass
class AgentResult:
    content: str           # Combined text output
    cost: float            # Total cost in USD
    success: bool          # True if completed normally
    tool_uses: list[dict]  # All tools used with inputs
    termination_reason: str  # "completed", "max_turns_reached", or "error"
    turns_used: int
    max_turns: int
    error_details: Optional[dict]
```

## Session Management

Sessions are stored per-cwd. The path encoding replaces `/` with `-`:
```
/Users/jake/my-project → ~/.claude/projects/-Users-jake-my-project/
```

```python
from cc_agent import find_sessions_for_cwd, find_latest_meaningful_session

# List all sessions for a directory
sessions = find_sessions_for_cwd("/path/to/project")
for s in sessions:
    print(f"{s.session_id}: {s.size} bytes, modified {s.modified}")

# Find resumable session (filters tiny/failed sessions)
session_id = find_latest_meaningful_session("/path/to/project", min_size_bytes=5000)
```

## Retry Handling

The `retry_handler.py` module provides automatic retry with exponential backoff for:
- API overload errors (500, rate limits)
- Timeout errors

Default delays: 60s, 120s, 240s, 480s, 960s (max 5 retries)

## Conversation Logging

Enable via environment variable:
```bash
export ENABLE_CONVERSATION_LOGGING=true
export AGENT_LOG_DIR=logs
```

Logs to:
- `logs/conversations/conversation_<agent>_<timestamp>.jsonl` - Machine-readable
- `logs/conversations/conversation_<agent>_<timestamp>.txt` - Human-readable

Real-time streaming via callback:
```python
from cc_agent.base import set_global_conversation_callback

def my_callback(entry: dict):
    print(f"[{entry['type']}] {entry.get('agent')}")

set_global_conversation_callback(my_callback)
```

## Dependencies

- `claude-agent-sdk>=0.1.4` - Core SDK for Claude Code CLI interaction
- `cc_tools` (sibling package) - MCP registry for `mcp_tools` parameter

## Common Patterns

### Subagent Configuration (SDK v0.1.4+)

```python
agent = Agent(
    name="Orchestrator",
    system_prompt="...",
    agents={
        "code-reviewer": {
            "description": "Reviews code for quality",
            "prompt": "Review this code...",
            "tools": ["Read", "Grep"],
            "model": "claude-sonnet-4-20250514"
        }
    }
)
```

### Tool Restriction

```python
# Strict whitelist - agent can ONLY use these tools
agent = Agent(
    allowed_tools=["Read", "Grep"],
    restrict_to_allowed_tools=True  # Auto-disallows all others
)
```

### MCP Tools

```python
# Simplified - auto-configures from cc_tools registry
agent = Agent(mcp_tools=["oxc", "tree_sitter", "supabase"])

# Full control
agent = Agent(mcp_servers={
    "oxc": {"command": "...", "args": [...], "env": {...}}
})
```
