# Leo Platform Architecture Analysis

**Generated**: 2025-01-28
**Purpose**: Deep analysis of the Leo app generation platform, documenting architecture, data flow, and key systems.

---

## 1. System Overview

Leo is an AI-powered web application generator platform consisting of two primary components:

| Component | Technology | Purpose |
|-----------|------------|---------|
| **leo-web** | Node.js + React | SaaS orchestrator and user-facing UI |
| **leo-worker** | Python (Claude Agent SDK) | AI agent running in containers |

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
└─────────────────────┬───────────────────────────────────────────┘
                      │ WebSocket (browser-to-orchestrator)
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                     leo-web (Node.js/Express)                    │
│  ┌─────────────┐  ┌──────────────────┐  ┌────────────────────┐  │
│  │ WSI Server  │  │ Container Manager│  │ Storage/Auth/DB    │  │
│  └──────┬──────┘  └────────┬─────────┘  └────────────────────┘  │
└─────────┼──────────────────┼────────────────────────────────────┘
          │                  │
          │ WSI Protocol     │ Container Lifecycle
          ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Docker Container / Fly Machine               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    leo-worker (Python)                     │  │
│  │  ┌──────────┐  ┌──────────────┐  ┌────────────────────┐   │  │
│  │  │WSI Client│  │AppGenerator  │  │    Reprompter      │   │  │
│  │  │          │  │   Agent      │  │                    │   │  │
│  │  └────┬─────┘  └──────┬───────┘  └─────────┬──────────┘   │  │
│  │       │               │                    │               │  │
│  │       │        ┌──────┴───────────────────┘               │  │
│  │       │        │                                          │  │
│  │       │        ▼                                          │  │
│  │       │   ┌──────────────────────────────────────────┐   │  │
│  │       │   │        Claude Agent SDK (cc-agent)        │   │  │
│  │       │   │  - Tool execution (file ops, bash, etc.) │   │  │
│  │       │   │  - MCP server communication              │   │  │
│  │       │   │  - Subagent orchestration                │   │  │
│  │       │   └──────────────────────────────────────────┘   │  │
│  └───────┼───────────────────────────────────────────────────┘  │
│          │                                                       │
│  ┌───────▼────────────────────────────────────────────────────┐ │
│  │ /workspace/app - Generated application code                 │ │
│  │ /efs/{app_id}/workspace - EFS persistent storage (optional)│ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. leo-web (Node.js Orchestrator)

### 2.1 Key Components

| File | Responsibility |
|------|----------------|
| `server/index.ts` | Express app entry point, route registration |
| `server/lib/wsi/wsi-server.ts` | WebSocket server for browser & container connections |
| `server/lib/wsi/container-manager-factory.ts` | Factory for container lifecycle management |
| `server/lib/orchestrator/docker-manager.ts` | Docker container lifecycle (local dev) |
| `server/lib/websocket-server.ts` | Legacy WebSocket handling (being replaced by WSI) |
| `server/lib/github-manager.ts` | GitHub repo creation and push operations |
| `server/lib/fly-deployment-manager.ts` | Fly.io deployment orchestration |
| `server/lib/credentials-manager.ts` | Secure credential storage (AWS Secrets Manager/Vault) |

### 2.2 Frontend Pages

Located in `client/src/pages/`:

| Page | Purpose |
|------|---------|
| `ConsolePage.tsx` | Main generation console with real-time logs, screenshots, conversation view |
| `AppsPage.tsx` | Dashboard listing user's generated apps |
| `AppDetailPage.tsx` | Individual app management (resume, deploy, delete) |
| `SettingsPage.tsx` | User settings including OAuth token configuration |
| `BillingPage.tsx` | Stripe integration for subscription management |
| `HomePage.tsx` | Landing page with app prompt input |
| `LoginPage.tsx` / `RegisterPage.tsx` | Authentication flows |

### 2.3 Database Schema

Located in `shared/schema.ts` - Uses Drizzle ORM with PostgreSQL (Supabase):

**Core Tables**:
- `profiles` - User profiles with OAuth tokens, billing info, role
- `generation_requests` - App generation jobs with status tracking
- `apps` - Generated apps with GitHub URLs, deployment status
- `subscriptions` - Stripe subscription management
- `credits` - Credit-based billing system

---

## 3. leo-worker (Python Agent)

### 3.1 Entry Point

**`src/main.py`** - Container startup sequence:
1. Load/create `.env` file from environment variables (BYOT credentials)
2. Load platform secrets from AWS Secrets Manager
3. Validate required credentials (CLAUDE_CODE_OAUTH_TOKEN or ANTHROPIC_API_KEY)
4. Start WSI Client connection to orchestrator

### 3.2 Core Architecture

```
src/
├── main.py                          # Container entry point
├── runtime/
│   ├── wsi/
│   │   ├── client.py               # WSI Protocol client (1500+ lines)
│   │   ├── protocol.py             # Message types and serialization
│   │   ├── state_machine.py        # Connection state management
│   │   ├── log_streamer.py         # Real-time log streaming to UI
│   │   └── screenshot_watcher.py   # Screenshot detection and streaming
│   └── managers/
│       ├── git_manager.py          # Git operations and GitHub push
│       └── artifact_detector.py    # Detect generated artifacts
└── leo/
    ├── agents/
    │   ├── app_generator/
    │   │   ├── agent.py            # AppGeneratorAgent class
    │   │   ├── pipeline-prompt-v2.md # Main system prompt
    │   │   ├── prompt_expander.py  # User prompt enhancement
    │   │   └── subagents/          # Specialized subagents
    │   │       ├── code_writer/
    │   │       ├── quality_assurer/
    │   │       ├── error_fixer/
    │   │       └── research_agent.py
    │   └── reprompter/
    │       ├── agent.py            # SimpleReprompter class
    │       ├── context_gatherer.py # Read app state for next prompt
    │       ├── prompts.py          # Reprompter system prompt
    │       └── master-plan.md      # Strategic guidance document
    ├── monitor/                     # Process monitoring with Haiku
    └── prompts/                     # Prompt saving for audit trail
```

### 3.3 AppGeneratorAgent

**Location**: `src/leo/agents/app_generator/agent.py`

The main agent that generates full-stack applications:

```python
class AppGeneratorAgent:
    def __init__(self, output_dir, enable_expansion=True, enable_subagents=True):
        # Loads pipeline-prompt-v2.md as system prompt
        # Configures MCP tools: chrome_devtools, build_test, package_manager, supabase_setup
        # Initializes subagents for delegation

    async def generate_app(self, user_prompt, app_name) -> (app_path, expansion_info):
        # New app generation

    async def resume_generation(self, app_path, additional_instructions) -> (app_path, expansion_info):
        # Resume existing app with new instructions
```

**Key Features**:
- Uses Claude Agent SDK (`cc-agent`) for tool execution
- Programmatic subagent configuration (SDK v0.1.4+)
- MCP tool integration (Chrome DevTools, Supabase setup, etc.)
- Skills discovery from filesystem (`setting_sources=["user", "project"]`)

### 3.4 SimpleReprompter

**Location**: `src/leo/agents/reprompter/agent.py`

LLM-first reprompter that analyzes app state and suggests next tasks:

```python
class SimpleReprompter:
    def __init__(self, app_path):
        # Loads REPROMPTER_SYSTEM_PROMPT + master-plan.md
        # Uses Haiku model for cost efficiency

    async def get_next_prompt(self, strategic_guidance=None, original_prompt=None) -> str:
        # 1. Gather context (changelog, plans, errors, git status)
        # 2. Build user message with context
        # 3. Ask LLM to generate next prompt
        # 4. Return multi-paragraph prompt for main agent

    def record_task(self, task, success):
        # Track task history for loop detection
```

**Context Gathering** (`context_gatherer.py`):
- Session context from `.agent_session.json`
- Architecture overview from `CLAUDE.md`
- Recent changelog entries (summary_changes/ preferred)
- Plan files with header extraction
- Error logs from dev server
- Git status and recent changes
- Task history for loop detection

---

## 4. WSI Protocol (WebSocket Interface)

**Documentation**: `leo-web/docs/wsi-protocol.md`

### 4.1 Protocol Overview

WSI v2.1 defines bidirectional communication between:
- **Browser** ↔ **leo-web** (orchestrator)
- **leo-web** ↔ **leo-worker** (container)

### 4.2 Key Message Types

**From Container to Orchestrator**:

| Message Type | Purpose |
|--------------|---------|
| `ready` | Container ready, awaiting start_generation |
| `log` | Real-time log line (info/warn/error/debug) |
| `progress` | Stage/step/percentage updates |
| `iteration_complete` | Iteration finished with metrics and credentials |
| `all_work_complete` | Generation finished with GitHub URL, costs, warnings |
| `error` | Error with optional recovery hint |
| `decision_prompt` | Ask user for confirmation (confirm_first mode) |
| `conversation_log` | Real-time agent conversation entries |
| `screenshot` | Base64-encoded screenshot for live preview |
| `credential_request` | Mid-generation credential request (v2.2) |

**From Browser to Container**:

| Message Type | Purpose |
|--------------|---------|
| `start_generation` | Begin app generation with prompt, mode, settings |
| `decision_response` | User response to decision_prompt |
| `user_input` | Mid-generation user input |
| `control_command` | pause/resume/cancel/prepare_shutdown |

### 4.3 Generation Modes

| Mode | Behavior |
|------|----------|
| `autonomous` | Reprompter runs until max_iterations |
| `confirm_first` | User confirms each iteration task |

---

## 5. Iteration/Generation Loop

### 5.1 Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    start_generation                          │
│  (prompt, mode, max_iterations, app_name/app_path)          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Setup Phase                                                 │
│  - Setup EFS workspace if available                          │
│  - Setup conversation logging                                │
│  - Clone from GitHub if resume mode                          │
│  - Restore credentials from Vault                            │
│  - Initialize artifacts repo                                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  First Iteration (Iteration 1)                               │
│  - AppGeneratorAgent.generate_app() or resume_generation()  │
│  - Send iteration_complete with duration, cost, credentials │
│  - Initialize reprompter                                     │
│  - Push to GitHub after iteration                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Autonomous Loop (iterations 2 to max_iterations)           │
│                                                              │
│  while iteration < max_iterations:                           │
│    1. Reprompter.get_next_prompt()                          │
│    2. AppGeneratorAgent.resume_generation(app_path, prompt) │
│    3. Track cost per iteration                               │
│    4. Send iteration_complete                                │
│    5. Record task for loop detection                         │
│    6. Push to GitHub periodically                            │
│                                                              │
│    On recoverable error: continue to next iteration          │
│    On fatal error: finish_generation("error")               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Finish Generation                                           │
│  - Push final changes to GitHub                              │
│  - Push artifacts repo (changelog, sessions)                 │
│  - Check RLS warnings                                        │
│  - Detect deployment artifacts (Dockerfile, fly.toml)        │
│  - Deploy to Fly.io if artifacts present                     │
│  - Send all_work_complete with URLs, costs, warnings        │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Key Code Locations

| Step | File | Method |
|------|------|--------|
| Start Generation | `wsi/client.py` | `_handle_start_generation()` |
| Autonomous Loop | `wsi/client.py` | `_run_autonomous_loop()` |
| Finish Generation | `wsi/client.py` | `_finish_generation()` |
| Get Next Prompt | `reprompter/agent.py` | `get_next_prompt()` |
| Generate App | `app_generator/agent.py` | `generate_app()` / `resume_generation()` |

---

## 6. Skills System

### 6.1 Overview

Skills are specialized, auto-invoked knowledge modules in `.claude/skills/`:

```
.claude/skills/
├── drizzle-orm-setup/          # Drizzle ORM patterns (55% bug prevention)
├── supabase-storage/           # PostgREST patterns when needed
├── supabase-auth-setup/        # Supabase Auth dual-user architecture
├── schema-designer/            # Zod + Drizzle schema patterns
├── api-architect/              # ts-rest contract patterns
├── ui-designer/                # OKLCH colors, accessibility, responsive
├── type-safe-queries/          # Drizzle vs PostgREST decision guide
├── storage-factory-validation/ # LSP contract validation
├── factory-lazy-init/          # Lazy Proxy pattern for env vars
├── production-smoke-test/      # Docker smoke tests before Fly.io
└── schema-query-validator/     # Schema-frontend mismatch prevention
```

### 6.2 How Skills Work

1. **Auto-invocation**: Claude loads relevant skills based on context matching
2. **Progressive disclosure**: Only loads what's needed for current task
3. **Validation scripts**: Many skills include scripts to verify correct implementation
4. **Templates**: Provide copy-paste correct patterns

### 6.3 Pipeline Prompt Integration

The main system prompt (`pipeline-prompt-v2.md`) mandates reading specific skills:

| Phase | Required Skill |
|-------|----------------|
| 2. Schema | `schema-designer/SKILL.md` |
| 3. Contracts | `api-architect/SKILL.md` |
| 5. DB & Storage | `drizzle-orm-setup/SKILL.md` |
| 6. Auth | `supabase-auth-setup/SKILL.md` |
| 9. Frontend | `ui-designer/SKILL.md` |

---

## 7. Prompts and Configuration

### 7.1 Main System Prompt

**Location**: `src/leo/agents/app_generator/pipeline-prompt-v2.md`

Defines the 9-phase pipeline for app generation:

1. **Plan** - Create `plan/plan.md` with entities, features, flows
2. **Schema** - `shared/schema.zod.ts` and `shared/schema.ts`
3. **Contracts** - `shared/contracts/*.contract.ts`
4. **Supabase** - MCP tool creates project, `.env`
5. **DB & Storage** - `server/lib/db.ts`, `server/lib/storage/`
6. **Auth** - `server/lib/auth/`, `supabase/seed.ts`
7. **Routes** - `server/routes/*.ts`, `server/index.ts`
8. **API Client** - `client/src/lib/api-client.ts`
9. **Frontend** - `client/src/pages/*.tsx`, `client/src/App.tsx`

**Key Features**:
- Incremental execution (skip existing artifacts)
- Typecheck gates at 3.5, 7.5, and 9.5
- Single DATABASE_URL with pooler (port 6543)
- Mandatory skill reading before each phase

### 7.2 Reprompter System Prompt

**Location**: `src/leo/agents/reprompter/prompts.py`

Key principles:
- **Use subagents liberally** (research, error_fixer, quality_assurer, code)
- **Encourage planning before implementing** for non-trivial tasks
- **Context efficiency** through delegation
- **Concise prompts** (300-500 characters max)
- **Always include testing** via quality_assurer
- **Detect loops** and escalate appropriately

### 7.3 Reprompter Master Plan

**Location**: `src/leo/agents/reprompter/master-plan.md`

Defines strategic behavior for two modes:

**NEW Mode** (fresh app):
- Signal-based phase transitions (not iteration counts)
- BUILD → UI_QUALITY_GATE → STABILIZE → MVP_DEPLOY → TEST → ITERATE
- Deploy MVP early when signals indicate readiness

**RESUME Mode** (existing app):
- Focus on completing specific resume prompt intent
- Create written plan (TASK_PLAN_*.md) for non-trivial tasks
- Execute plan systematically with verification

---

## 8. MCP Tool Integration

### 8.1 MCP Servers Configured

**Location**: `leo-worker/.claude/settings.json`

| Server | Purpose |
|--------|---------|
| `supabase_setup` | Autonomous Supabase project creation |
| `chrome_devtools` | Browser automation for testing (via xvfb-run) |

### 8.2 Additional MCP Tools (via cc-agent)

| Tool | Purpose |
|------|---------|
| `build_test` | Verify project builds and passes tests |
| `package_manager` | npm package management |
| `cwd_reporter` | Current working directory utilities |
| `integration_analyzer` | Analyze code integrations |

---

## 9. Subagents

### 9.1 Available Subagents

**Location**: `src/leo/agents/app_generator/subagents/`

| Subagent | Purpose | Model |
|----------|---------|-------|
| `code_writer` | Writing/refactoring code | claude-sonnet-4 |
| `quality_assurer` | Testing and validation | claude-sonnet-4 |
| `error_fixer` | Diagnosing and fixing errors | claude-sonnet-4 |
| `research_agent` | Deep research on topics | claude-sonnet-4 |
| `ai_integration` | AI/ML integration patterns | claude-sonnet-4 |

### 9.2 Subagent Orchestration Pattern

```
1. Plan/Research (if needed) → research subagent
2. Implement → code subagent
3. Test → quality_assurer subagent
4. Fix Issues → error_fixer subagent → back to step 3
```

---

## 10. Pain Points and Areas of Complexity

### 10.1 Identified Complexity Areas

1. **WSI Client Size**: `client.py` is 2500+ lines handling many responsibilities
   - EFS setup, git operations, credential management, artifact repos, iteration loop
   - Could benefit from further decomposition

2. **Dual Repository Structure**: App code and artifacts in separate repos
   - App repo: generated application code
   - Artifacts repo: changelog, sessions, logs
   - Complexity in managing both during generation

3. **EFS vs Local Storage**: Different code paths for EFS-mounted vs ephemeral storage
   - Symlink disabled for performance (sessions restored from artifacts)
   - Potential for divergent behavior

4. **Session Management**: Claude sessions need preservation across resume
   - Sessions saved to artifacts repo
   - Restored on resume from artifacts
   - Potential for session loss if artifacts push fails

5. **Credential Flow**: Multiple sources (BYOT, AWS Secrets Manager, Vault)
   - CLAUDE_CODE_OAUTH_TOKEN vs ANTHROPIC_API_KEY
   - SUPABASE_ACCESS_TOKEN for project creation
   - App credentials persisted in Vault for resume

### 10.2 Potential Documentation Discrepancies

1. **S3 References**: Code mentions S3 but comments indicate it's "deprecated - Git is source of truth"
   - S3Manager import commented out
   - `s3_url` in messages marked as deprecated

2. **Dev Server MCP Tool**: Commented out as "hangs frequently, unreliable"
   - May need investigation or documentation update

3. **UI Quality Score Threshold**: Master plan says 71%, skill docs may vary
   - Need to verify consistent thresholds

---

## 11. Key Takeaways

1. **Architecture is solid**: Clear separation between orchestrator (leo-web) and agent (leo-worker)

2. **WSI Protocol is well-defined**: Comprehensive message types for all generation states

3. **Skills system is powerful**: Modular, auto-invoked expertise prevents common bugs

4. **Reprompter is LLM-first**: No brittle parsing, just context → LLM → prompt

5. **EFS provides persistence**: But with fallback to ephemeral storage

6. **Credit-based billing**: Per-iteration cost tracking with Stripe integration

7. **Multi-modal output**: Real-time logs, screenshots, conversation view in browser

---

## Appendix: File Quick Reference

### leo-web Key Files
```
server/
├── index.ts                    # Express app entry
├── lib/wsi/wsi-server.ts      # WebSocket server
├── lib/orchestrator/          # Container management
├── lib/github-manager.ts      # GitHub integration
├── lib/fly-deployment-manager.ts # Fly.io deployment
└── routes/                    # API endpoints

client/src/
├── pages/ConsolePage.tsx      # Main generation UI
├── pages/AppsPage.tsx         # App dashboard
└── components/console/        # Console components
```

### leo-worker Key Files
```
src/
├── main.py                    # Container entry point
├── runtime/wsi/client.py      # WSI client (iteration loop)
├── leo/agents/app_generator/  # Main agent
│   ├── agent.py              # AppGeneratorAgent
│   └── pipeline-prompt-v2.md # System prompt
└── leo/agents/reprompter/     # Reprompter
    ├── agent.py              # SimpleReprompter
    ├── prompts.py            # System prompt
    └── master-plan.md        # Strategic guidance
```

### Skills
```
.claude/skills/
├── drizzle-orm-setup/SKILL.md
├── supabase-auth-setup/SKILL.md
├── schema-designer/SKILL.md
├── api-architect/SKILL.md
├── ui-designer/SKILL.md
└── [other skills...]/SKILL.md
```
