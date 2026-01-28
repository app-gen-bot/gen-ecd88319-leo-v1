# Leo Container Code Walkthrough

A guided tour of the `leo-container/src/` codebase, organized by execution flow.

## Entry Point

### main.py (~150 lines)

Container entry point. Startup flow:

1. Load AWS secrets (Supabase credentials, GitHub token)
2. Load environment config
3. Create `WSIClient` with config
4. Run client (connects to orchestrator, handles generation)

```
main.py → load_secrets() → load_config() → WSIClient.run()
```

## Runtime Layer

### runtime/utils/

| File | Lines | Purpose |
|------|-------|---------|
| `environment.py` | 93 | `Config` dataclass, `load_config()` from env vars |
| `health.py` | ~100 | Health check endpoints for K8s probes |
| `metrics.py` | 284 | Prometheus metrics (mostly unused - see BACKLOG) |
| `logging_config.py` | 60 | Structlog JSON logging for CloudWatch |
| `http_server.py` | ~80 | HTTP server for health/metrics endpoints |
| `aws_secrets.py` | ~100 | AWS Secrets Manager integration |

### runtime/wsi/ - WebSocket Interface

| File | Lines | Purpose |
|------|-------|---------|
| `state_machine.py` | 255 | Connection state management (7 states) |
| `client.py` | 1625 | Core orchestration - WS handling, agent execution |
| `protocol.py` | 567 | Pydantic message types for WSI Protocol v2.1 |
| `log_streamer.py` | 378 | Captures Python logs + stdout → streams to orchestrator |

**State Machine States:**
- `CONNECTING` → `READY` → `ACTIVE` → `PROMPTING` → `COMPLETED` → `DISCONNECTED`
- `ERROR` reachable from any state
- See `docs/wsi-state-diagram.png` for visual

**protocol.py defines:**
- Server→Client: `ready`, `log`, `conversation_log`, `progress`, `decision_prompt`, `iteration_complete`, `all_work_complete`, `error`
- Client→Server: `start_generation`, `decision_response`, `control_command`
- `MessageParser` and `MessageSerializer` for JSON ↔ Pydantic

**log_streamer.py handles:**
- `LogFileWriter` - writes to `/workspace/leo-artifacts/logs/generation.log`
- `StdoutCapture` - intercepts `print()` calls from cc-agent
- `LogCaptureHandler` - attaches to root logger, sends via WebSocket
- Global `log_streamer` instance used by client

### runtime/managers/

| File | Lines | Purpose |
|------|-------|---------|
| `git_manager.py` | 606 | GitHub repo creation and code pushing |
| `db_reset_manager.py` | 151 | Reset shared Supabase before each generation |
| `artifact_detector.py` | 120 | Detect GitHub/Fly.io from generated app |

**git_manager.py:**
- Creates private repos under `app-gen-bot` account
- Repo naming: `gen-{user_id_short}-{app_id_short}` (last 8 chars of UUIDs)
- Separate artifacts repo (`-artifacts` suffix) for logs/state
- `init_repo_for_generation()` - sets up git before generation starts

**db_reset_manager.py:**
- Drops all user tables in `public` schema
- Preserves Supabase system tables
- Uses `DATABASE_URL_POOLING` (port 6543) for Docker compatibility
- Sends `NOTIFY pgrst, 'reload schema'` to refresh PostgREST cache

## Leo Agents

### leo/agents/app_generator/

| File | Lines | Purpose |
|------|-------|---------|
| `agent.py` | 1460 | Main AppGeneratorAgent class |
| `config.py` | 123 | Agent configuration (model, tools, paths) |
| `prompt_expander.py` | ~200 | LLM-based prompt expansion |
| `git_helper.py` | ~150 | Git operations for generated apps |

**AppGeneratorAgent (agent.py):**

Core methods:
| Method | Purpose |
|--------|---------|
| `generate_app()` | Generate new app from prompt |
| `resume_generation()` | Resume/modify existing app |
| `resume_with_session()` | Resume with Claude session context |
| `expand_prompt()` | LLM-based prompt expansion |

Session management:
| Method | Purpose |
|--------|---------|
| `save_session()` | Save session ID to `.agent_session.json` |
| `load_session()` | Load session for resume |

Changelog/documentation:
| Method | Purpose |
|--------|---------|
| `append_to_changelog()` | Full changelog with agent output |
| `append_to_summary_changelog()` | Concise summary changelog |
| `generate_claude_md()` | Create CLAUDE.md for context |

**config.py:**
- Model: `claude-opus-4-5`
- Max turns: 1000
- MCP tools: chrome_devtools, build_test, package_manager, dev_server, shadcn, mem0, graphiti, etc.
- 8 subagents: research, schema_designer, api_architect, code_writer, ui_designer, quality_assurer, error_fixer, ai_integration

### leo/agents/reprompter/

| File | Lines | Purpose |
|------|-------|---------|
| `agent.py` | 349 | SimpleReprompter class |
| `config.py` | ~50 | Reprompter configuration |
| `context_gatherer.py` | ~150 | Gathers app context for LLM |
| `prompts.py` | ~100 | System prompts |

**SimpleReprompter** - LLM-first approach:
1. `ContextGatherer` reads: `.agent_session.json`, `CLAUDE.md`, changelog, plan files, error logs, git status
2. LLM generates next task prompt based on context
3. Master plan (`docs/reprompter-master-plan.md`) provides strategic guidance

Used by WSI client in `_run_autonomous_loop()` between iterations.

## Agent Framework

### cc_agent/

| File | Lines | Purpose |
|------|-------|---------|
| `base.py` | 756 | `Agent` class - wraps Claude Agent SDK |
| `conversation_logger.py` | 433 | Logs conversations to JSONL + text files |
| `retry_handler.py` | 206 | Exponential backoff for API overload errors |
| `session_utils.py` | 156 | Session discovery in `~/.claude/projects/` |
| `logging.py` | 161 | Logger configuration |
| `utils.py` | 92 | Helper functions |
| `context/context_aware.py` | 523 | `ContextAwareAgent` with knowledge graph |
| `context/memory_formatter.py` | 295 | Format memories for context injection |

**session_utils.py:**
- Sessions stored at `~/.claude/projects/<encoded-cwd>/<session-id>.jsonl`
- `encode_cwd_for_session_path()` - `/Users/foo/bar` → `-Users-foo-bar`
- `find_sessions_for_cwd()` - discover sessions, filter out subagent sessions
- `find_latest_meaningful_session()` - find session with >5KB content

**retry_handler.py:**
- `retry_with_exponential_backoff()` - wraps async functions
- Delays: [60, 120, 240, 480, 960] seconds
- Retryable errors: overload, rate_limit, timeout
- `retry_async_generator()` - for streaming responses

**conversation_logger.py:**
- Logs to both JSONL (forensics) and text (human-readable)
- `on_log` callback for real-time streaming (used by WSI client)
- Sanitizes large tool inputs (>1MB) to prevent buffer overflow

**ContextAwareAgent (context_aware.py):**
- Extends `Agent` with automatic context awareness
- Integrates with graphiti knowledge graph
- Adds CONTEXT_AWARENESS_PROMPT to system prompt
- Knowledge transformation rules (code → architecture descriptions)

## MCP Tools

### cc_tools/

MCP (Model Context Protocol) tool servers. Configured in `mcp_registry.py`.

**Actively Used:**
| Tool | Purpose |
|------|---------|
| `chrome_devtools/` | Browser automation via DevTools (replaces legacy `browser`) |
| `build_test/` | TypeScript compilation verification |
| `dev_server/` | Start/stop/check dev servers |
| `package_manager/` | npm/pnpm operations |
| `shadcn/` | shadcn/ui component installation |
| `supabase/` | Supabase database management |
| `supabase_setup/` | Autonomous Supabase project creation |
| `cwd_reporter/` | Working directory utilities |
| `integration_analyzer/` | Template comparison |

**Linting:**
| Tool | Purpose |
|------|---------|
| `oxc/` | Fast TypeScript/JS linting (50-100x faster than ESLint) |
| `ruff/` | Fast Python linting |

**Archived (in `archive/cc_tools/`):**
| Tool | Why Archived |
|------|--------------|
| `mem0/` | Pipeline prompt never instructs use |
| `graphiti/` | Pipeline prompt never instructs use |
| `context_manager/` | Pipeline prompt never instructs use |
| `tree_sitter/` | Depends on mem0, also unused |

These tools were designed for `ContextAwareAgent` (also archived to `archive/cc_agent/context/`) which adds prompting to use them.

## Resources

### leo/resources/

Prompts and patterns loaded by agents:

| Path | Purpose |
|------|---------|
| `agents/orchestrator/pipeline-prompt-v2.md` | Main agent system prompt |
| `agents/orchestrator/PROMPTING-GUIDE.md` | Prompt expansion guide |
| `agents/reprompter/master-plan.md` | Reprompter strategic guidance |
| `agents/subagents/*/patterns/*.md` | Subagent-specific patterns |
| `skills/*/SKILL.md` | Skill definitions |

## Critical Path

The main execution flow:

```
main.py
  └→ WSIClient.run()
       └→ _handle_start_generation()
            ├→ AppGeneratorAgent.generate_app() or resume_generation()
            │    └→ Agent.run_with_session() (cc_agent)
            │         └→ Claude Agent SDK
            │
            └→ _run_autonomous_loop() (if autonomous mode)
                 └→ SimpleReprompter.get_next_prompt()
                      └→ Agent.run() → next task prompt
```

## Related Docs

- `specs/wsi-protocol.md` - WSI Protocol v2.1 specification
- `docs/wsi-state-diagram.png` - Visual state machine
- `docs/wsi-cli-parity-analysis.md` - WSI vs CLI comparison
- `docs/BACKLOG.md` - Technical debt and improvements
