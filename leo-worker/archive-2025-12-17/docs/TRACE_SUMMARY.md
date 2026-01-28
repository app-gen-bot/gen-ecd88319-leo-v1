# App Generator Call Chain Trace - Executive Summary

## Quick Navigation

- **Full Detailed Trace**: `docs/APP_GENERATOR_CALL_CHAIN_TRACE.md` (70+ sections)
- **Architecture Diagrams**: `docs/APP_GENERATOR_ARCHITECTURE_DIAGRAM.md` (Visual flowcharts)
- **Entry Point**: `/run-app-generator.py`
- **Main Agent**: `src/app_factory_leonardo_replit/agents/app_generator/agent.py`
- **Build Orchestrator**: `src/app_factory_leonardo_replit/stages/build_stage.py`

---

## What is App Generator?

The App Generator is an **AI-powered full-stack application generator** that transforms natural language prompts into complete, working web applications. It uses:

- **Claude 3.5 Sonnet** with extended context (50K+ system prompt)
- **Writer-Critic pattern** for iterative code generation and validation
- **Parallel execution** for faster generation (5-10 concurrent pages)
- **Schema-first development** (database schema is the source of truth)
- **Never-Broken pipeline** (stops on critical failures, no partial apps)
- **Session persistence** (maintains context across modifications)

---

## Three Entry Modes

### 1. New App Generation
```bash
uv run python run-app-generator.py "Create a todo app" --app-name todo-app
```

**Flow:**
- Prompt expansion (LLM enhances user request)
- Agent generates complete app from scratch
- Git initialized, session saved
- Interactive loop available

### 2. Resume/Modify Existing App
```bash
uv run python run-app-generator.py --resume apps/todo-app/app "Add dark mode"
```

**Flow:**
- Load previous session context
- Expand modification request
- Create checkpoint commit
- Agent modifies existing app
- Session updated

### 3. Interactive Loop (Post-Generation)
Three modes:
- **Interactive**: User enters prompts manually
- **Confirm-first**: Agent suggests tasks, user approves
- **Autonomous**: Agent auto-continues for N iterations

---

## The Pipeline: 9 Stages

### Stage 1: Plan Creation
- User prompt → Plan (plan.md)
- Features, entities, workflows, API spec
- Duration: ~2-3 minutes

### Stage 2: Build Application (9 Sub-Stages)

#### 2.1: Template Extraction
- Extract Vite-Express template
- Create client/, server/, shared/ directories

#### 2.2: Backend Specification
- Schema Designer: Generate schema.zod.ts
- Contracts Designer: Generate ts-rest contracts

#### 2.3-2.9: Writer-Critic Chains (Sequential)

| Stage | Input | Output | Iterations | Critical |
|-------|-------|--------|-----------|----------|
| Schema Generator | plan, schema.zod.ts | shared/schema.ts | ≤3 | YES |
| Storage Generator | plan, schema.ts | server/storage.ts | ≤3 | YES |
| Routes Generator | plan, schema.ts, contracts | server/routes.ts | ≤3 | YES |
| API Client Generator | contracts/ | client/lib/api-client.ts | ≤3 | YES |
| App Shell Generator | plan, FIS | client/src/App.tsx | ≤3 | YES |
| FIS Master Generator | plan, schema, contracts | specs/frontend-interaction-spec-master.md | 1 | YES |
| FIS Page Generators | plan, FIS master | specs/pages/*.md | ≤3 | (Parallel) |
| Layout Generator | plan, FIS | client/components/layout/AppLayout.tsx | ≤3 | NO |
| Frontend Pages | FIS, schema, contracts | client/pages/*.tsx, hooks/ | ≤3 | (Parallel) |

### Stage 3: Validation
- TypeScript type checking
- OXC linting (50-100x faster than ESLint)
- Build testing (npm run build)
- Browser automation verification

---

## Writer-Critic Pattern

The core quality mechanism:

```
Iteration N:
  1. WRITER generates code
  2. WRITER self-tests (TypeScript, linting)
  3. CRITIC validates output
  4. CRITIC decision:
     - "complete" → Move to next agent
     - "continue" → Iterate again (pass feedback to Writer)
     - "fail" → Critical error, stop pipeline

Max iterations: 3 per agent
If not resolved in 3 → Agent fails
If critical agent fails → Pipeline stops
If non-critical fails → Log and continue
```

**Key**: Feedback passed as raw XML from Critic to Writer, providing context for improvement.

---

## Data Flow Architecture

### File Dependencies
```
plan.md (source)
  ├── schema.zod.ts (Zod validation)
  │   ├── schema.ts (Drizzle ORM) ←─┬─ Storage Generator
  │   │                            ├─ Routes Generator
  │   │                            └─ API Client uses contracts
  │   │
  │   └── contracts/ (ts-rest)
  │       ├── Routes endpoint types
  │       └── API Client types
  │
  ├── FIS Master Spec
  │   └── depends on: schema, contracts, routes
  │
  ├── FIS Page Specs (generated from master)
  │   └── 5 specs generated in parallel
  │
  └── Frontend Pages
      ├── depend on: FIS pages, schema, contracts
      └── 5-10 pages generated in parallel
```

### Agent Context
- Agents read from absolute file paths
- Specs stored in `app/specs/` directory
- Each agent gets plan, schema, contracts as needed
- Reduces token usage (files not embedded in every request)

---

## Parallel Execution

### FIS Page Specs
- **Concurrency**: 5 pages at a time
- **Timeout**: 30 minutes per page
- **Retry**: 3 attempts

### Frontend Pages
- **Concurrency**: 5-10 pages at a time
- **Timeout**: Configurable (default 10 minutes)
- **Retry**: On failure
- **Savings**: Generates 10 pages in ~20 min vs 200 min sequential

---

## Agent Hierarchy

### Main Agent
**AppGeneratorAgent**: Entry point, orchestrates entire pipeline

**Location**: `agents/app_generator/agent.py`

**Key Methods**:
- `generate_app()`: New app generation
- `resume_generation()`: Load session, delegate to resume_with_session
- `resume_with_session()`: Modify existing app with context
- `expand_prompt()`: LLM-based prompt enhancement

### Specialized Agents (25+ total)

**Backend Agents**:
- SchemaGeneratorAgent + Critic
- StorageGeneratorAgent + Critic
- RoutesGeneratorAgent + Critic
- TsRestApiClientGeneratorAgent + Critic

**Frontend Agents**:
- FrontendInteractionSpecMasterAgent (no critic)
- FrontendInteractionSpecPageAgent (parallel)
- AppShellGeneratorAgent + Critic
- LayoutGeneratorAgent + Critic
- FrontendImplementationAgent (parallel) + Browser Critic

**Subagents** (Optional, 8 total):
- API Architect
- Quality Assurer
- Error Fixer
- Schema Designer
- Code Writer
- Frontend Designer
- UI Designer
- Integration Validator

---

## Session Management

### What's Saved
```json
{
    "session_id": "uuid-here",
    "app_path": "/path/to/app",
    "timestamp": "2025-01-08T...",
    "context": {
        "app_name": "todo-app",
        "original_request": "Create a todo app...",
        "features": ["CRUD", "Authentication"],
        "entities": ["users", "todos"],
        "last_action": "Add dark mode",
        "last_modified": "2025-01-08T..."
    }
}
```

### Where It's Stored
- **Location**: `{app_path}/.agent_session.json`
- **Purpose**: Context persistence across modifications
- **Timeout**: ~1 hour (Claude session limit)
- **Recovery**: Automatic with fallback to fresh session

### Reprompter Integration
- Analyzes current app state
- Suggests next improvements
- User can approve, redirect, add guidance, or exit
- Strategic guidance affects all remaining iterations (autonomous mode)

---

## Error Handling & Resilience

### Critical Failures (Pipeline Stops)
- Schema Generator fails
- Storage Generator fails
- Routes Generator fails
- API Client Generator fails
- App Shell Generator fails

### Non-Critical Failures (Log & Continue)
- Layout Generator fails (non-essential)
- Individual page generation fails
- FIS page spec fails (can be generated later)

### Session Recovery
1. Session expires → Create fresh UUID
2. Process terminates → Retry with new session
3. Multiple fallbacks → Try up to 3 times
4. Final fallback → Start new session without ID

---

## MCP Tools (11+)

| Tool | Purpose | Used For |
|------|---------|----------|
| **chrome_devtools** | Browser automation | UI testing, verification |
| **build_test** | TypeScript verification | Self-testing in writers |
| **package_manager** | npm management | Dependency management |
| **dev_server** | Dev server control | Live testing |
| **shadcn** | UI components | Component library |
| **cwd_reporter** | Working directory info | Path management |
| **mem0** | Memory system | Context storage |
| **graphiti** | Knowledge graph | Entity relationships |
| **context_manager** | Context tracking | Session management |
| **integration_analyzer** | Template analysis | Template comparison |
| **supabase** | Database management | Auth & storage |

---

## Performance Characteristics

| Task | Duration | Notes |
|------|----------|-------|
| New app generation | 10-20 min | Depends on complexity |
| Plan creation | 2-3 min | Stage 1 |
| Backend spec | 3-5 min | Schema + contracts |
| Writer-Critic chain | 5-7 min | 5 agents × 1 iteration avg |
| FIS specs (parallel) | 30 min | 5 concurrent pages |
| Frontend pages (parallel) | 10-15 min | 10 concurrent pages |
| Validation | 2-3 min | Type check, lint, build |
| **Total** | **20-40 min** | Typical app |

---

## Critical Success Factors

1. **Schema-First**: Schema generated before routes/storage
2. **Type Safety**: Full TypeScript across stack
3. **Real API**: No mock data in frontend
4. **Validation**: Each stage validates independently
5. **Iteration**: Writer-Critic refines until quality achieved
6. **Parallel**: Frontend generation is parallelized
7. **Context**: Session preserves app knowledge

---

## Known Limitations & Edge Cases

### Handled Well
✅ Simple CRUD apps (perfect)
✅ Apps with 5-10 pages
✅ Standard authentication flows
✅ Typical database schemas (20-30 tables max)
✅ Resume after interruption

### Challenging
⚠️ Very complex apps (100+ pages)
⚠️ Custom algorithms (agents struggle)
⚠️ External integrations (need guidance)
⚠️ Real-time features (WebSockets)
⚠️ Machine learning models

---

## Debugging & Development

### Enable Logging
- Logs go to `logs/` directory
- Console shows progress with emojis
- File logs contain full agent turn outputs
- Log levels: INFO (console), DEBUG (file)

### View Generated Files
```
apps/{app-name}/
├── plan/                    # Stage 1 outputs
│   └── plan.md
├── app/                     # Stage 2 outputs
│   ├── client/             # React frontend
│   ├── server/             # Express backend
│   └── shared/             # Schemas, contracts
├── .agent_session.json      # Session context
└── CHANGELOG.md            # Generation history
```

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| "Max iterations exceeded" | Writer can't fix issues | Check critic feedback |
| Session expired | 1+ hour elapsed | Use fresh session |
| Type errors | Schema mismatch | Verify schema.zod.ts |
| Missing pages | FIS generation failed | Check page spec generation |
| Build failures | Missing dependencies | Manual npm install |

---

## Code Entry Points

### 1. Start Here
```python
# /run-app-generator.py
async def main():
    agent = create_app_generator(...)
    if resume_mode:
        result = await agent.resume_generation(...)
    else:
        result = await agent.generate_app(...)
```

### 2. Agent Initialization
```python
# agents/app_generator/agent.py
class AppGeneratorAgent:
    def __init__(self, output_dir, enable_expansion, enable_subagents):
        self.agent = Agent(
            system_prompt=pipeline_prompt,
            mcp_tools=[...],
            ...
        )
```

### 3. Build Stage Orchestration
```python
# stages/build_stage.py
async def run_stage(plan_path, ...):
    for agent_pair in agent_pairs:
        success, eval_data = await run_writer_critic_loop(
            writer_agent, critic_agent, ...
        )
        if not success and critical:
            return failure
```

### 4. Writer-Critic Loop
```python
# stages/build_stage.py
async def run_writer_critic_loop(...):
    for iteration in range(1, max_iterations + 1):
        # Phase 1: Writer generates
        writer_result = await writer_agent.generate_*()
        # Phase 2: Critic validates
        decision, eval_data = await critic_agent.inspect_*()
        # Phase 3: Decision handling
        if decision == "complete": return True
        if decision == "continue": continue
        else: return False
```

---

## Next Steps for Users

### Generate a New App
```bash
uv run python run-app-generator.py "Your app idea" --app-name app-name
```

### Resume an Existing App
```bash
uv run python run-app-generator.py --resume apps/app-name/app "Your modification"
```

### Enter Interactive Loop
```bash
# During generation, app enters interactive loop by default
# Choose mode: interactive, confirm-first (default), or autonomous
```

### Explore Generated Code
```bash
cd apps/app-name/app
npm install
npm run dev
# Open http://localhost:5000
```

---

## Document Structure

This trace consists of:

1. **APP_GENERATOR_CALL_CHAIN_TRACE.md** (70+ sections)
   - Complete layer-by-layer breakdown
   - Every agent, method, and decision point
   - Data flow diagrams
   - Design patterns explained
   - Performance characteristics

2. **APP_GENERATOR_ARCHITECTURE_DIAGRAM.md**
   - Visual flowcharts
   - ASCII diagrams
   - Timeline visualizations
   - Dependency graphs
   - Error recovery flows

3. **TRACE_SUMMARY.md** (this document)
   - Quick reference guide
   - High-level overview
   - Key concepts and terminology
   - Performance table
   - Common issues & solutions

---

## Key Concepts Glossary

| Term | Meaning |
|------|---------|
| **Writer-Critic** | Generation + validation loop |
| **Schema-First** | Database schema is source of truth |
| **Never-Broken** | Pipeline stops on critical failure |
| **FIS** | Frontend Interaction Specification |
| **Critical Agent** | Failure stops entire pipeline |
| **Non-Critical Agent** | Failure logged but pipeline continues |
| **Master Spec** | Shared design patterns for frontend |
| **Page Spec** | Individual page requirements |
| **Parallel Orchestrator** | Concurrent execution manager |
| **Session** | Context persistence across runs |

---

## Statistics

- **Total Agents**: 25+
- **Backend Agents**: 5 (with critics)
- **Frontend Agents**: 5+ (with critics)
- **Optional Subagents**: 8
- **MCP Tools**: 11+
- **Pipeline Stages**: 3 (Plan, Build, Validate)
- **Build Sub-Stages**: 9
- **Writer-Critic Loops**: 9
- **Max Parallel Pages**: 10
- **System Prompt Size**: 50K+ characters
- **Max Agent Turns**: 50+
- **Max Iterations per Agent**: 3

---

## Questions?

Refer to:
- **Full details**: APP_GENERATOR_CALL_CHAIN_TRACE.md
- **Diagrams**: APP_GENERATOR_ARCHITECTURE_DIAGRAM.md
- **Code**: View agent implementations in `src/app_factory_leonardo_replit/agents/`

