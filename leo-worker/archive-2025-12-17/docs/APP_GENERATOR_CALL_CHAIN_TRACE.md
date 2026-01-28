# App Generator Complete Call Chain Trace

## Executive Summary

The App Factory is a sophisticated AI-powered application generator that transforms natural language prompts into complete full-stack web applications. The system uses a **Writer-Critic pattern** for code generation, ensuring high quality through iterative validation and improvement cycles.

**Key Architecture Principles:**
- Schema-first development (database schema is source of truth)
- Writer-Critic loops (generation + validation)
- Never-Broken pipeline (stops on first critical failure)
- Parallel execution (pages generated concurrently)
- Session-aware (context persistence across modifications)

---

## Entry Point: run-app-generator.py

**Location:** `/Users/labheshpatel/apps/app-factory/run-app-generator.py`

### Main Function Flow

```python
async def main():
    # 1. Parse command line arguments
    parser = argparse.ArgumentParser(...)
    args = parser.parse_args()
    
    # 2. Validate inputs (prompt + app-name for new apps, or app-path for resume)
    # 3. Create AppGeneratorAgent with expansion and subagent settings
    agent = create_app_generator(
        output_dir=args.output_dir,
        enable_expansion=enable_expansion,
        enable_subagents=enable_subagents
    )
    
    # 4. Route to either new generation or resume
    if args.resume:
        result_path, expansion = await agent.resume_generation(app_path, instructions)
    else:
        result_path, expansion = await agent.generate_app(user_prompt, app_name=args.app_name)
    
    # 5. Optional: Enter interactive loop for continued modifications
    if interactive_mode:
        await interactive_loop(agent, result_path, mode=reprompter_mode)
```

### Modes Supported

1. **New App Generation** (requires `--app-name`)
   - `uv run python run-app-generator.py "Create a todo app" --app-name todo-app`

2. **Resume/Modify** (requires `--resume`)
   - `uv run python run-app-generator.py --resume /path/to/app "Add dark mode"`

3. **Interactive Loop** (post-generation)
   - Interactive: User-driven prompts
   - Confirm-first: Agent suggests tasks, user approves
   - Autonomous: Fully automatic with reprompter guidance

---

## Layer 1: Agent Initialization

### `create_app_generator()` Factory Function

**Location:** `src/app_factory_leonardo_replit/agents/app_generator/agent.py:1413-1433`

```python
def create_app_generator(
    output_dir: Optional[str] = None,
    enable_expansion: bool = True,
    enable_subagents: bool = True
) -> AppGeneratorAgent:
    return AppGeneratorAgent(
        output_dir=output_dir,
        enable_expansion=enable_expansion,
        enable_subagents=enable_subagents
    )
```

### `AppGeneratorAgent.__init__()`

**Location:** `src/app_factory_leonardo_replit/agents/app_generator/agent.py:32-114`

#### Key Initialization Steps

1. **Load Pipeline Prompt**
   - Reads `docs/pipeline-prompt.md` (system prompt)
   - ~50K+ character comprehensive system prompt defining all stages

2. **Initialize Prompt Expander** (if enabled)
   - `PromptExpander(PROMPTING_GUIDE_PATH)`
   - Uses LLM to expand user prompts following best practices

3. **Initialize Git Helper**
   - Tracks commits and repository state
   - Used for checkpoint creation during resume

4. **Load Subagents** (if enabled)
   - Get all available subagents from `subagents` module
   - Convert to SDK format (dataclass instances)
   - Write to `.claude/agents/` as fallback

5. **Initialize Base Agent**
   ```python
   self.agent = Agent(
       system_prompt=self.pipeline_prompt,
       allowed_tools=AGENT_CONFIG["allowed_tools"],
       mcp_tools=[
           "chrome_devtools",    # Browser automation
           "build_test",         # TypeScript verification
           "package_manager",    # npm management
           "dev_server",         # Dev server control
           "shadcn",            # Component library
           "cwd_reporter",      # Working directory info
           "mem0",              # Memory system
           "graphiti",          # Knowledge graph
           "context_manager",   # Context tracking
           "integration_analyzer", # Template analysis
           "supabase",          # Database management
       ],
       cwd=self.output_dir,
       name=AGENT_CONFIG["name"],
       model=AGENT_CONFIG["model"],  # "claude-3-5-sonnet-20241022"
       max_turns=AGENT_CONFIG["max_turns"],  # 50+
       agents=sdk_agents,  # Subagents for delegation
   )
   ```

6. **Session Management Variables**
   - `current_session_id`: UUID of current session
   - `current_app_path`: Path to app being worked on
   - `generation_context`: Features, entities, last action

---

## Layer 2: App Generation Entry Points

### Path A: New App Generation

**Function:** `AppGeneratorAgent.generate_app()`
**Location:** `agent.py:293-434`

#### Steps

1. **Expand Prompt** (if enabled)
   ```python
   expansion_result = await self.expand_prompt(user_prompt)
   prompt_to_use = expansion_result["expanded"]
   ```

2. **Build Generation Prompt**
   ```python
   generation_prompt = self._build_generation_prompt(prompt_to_use, app_name)
   ```
   
   Includes:
   - User request
   - App directory requirement
   - Pipeline instructions (Stage 1, 2, 3)
   - Critical requirements (schema-first, CRUD coverage, real API)

3. **Run Agent with Session Support**
   ```python
   result = await self.agent.run_with_session(generation_prompt)
   ```
   
   The pipeline prompt in the system message guides the agent through:
   - **Plan Stage**: Create plan.md
   - **Build Stage**: Schema, routes, storage, pages
   - **Validate Stage**: Type check, lint, build test

4. **Extract App Path**
   ```python
   app_path = self._extract_app_path(result, app_name)
   # Returns: {output_dir}/{app_name}/app
   ```

5. **Initialize Git**
   - Create initial commit with generated app
   - Commit hash saved for changelog

6. **Save Session**
   - Captures session ID from agent
   - Saves to `{app_path}/.agent_session.json`
   - Includes app name, features, entities

7. **Update Changelogs**
   - Full changelog: Complete agent output
   - Summary changelog: Concise summary
   - Generate CLAUDE.md for context persistence

### Path B: Resume/Modify Existing App

**Function:** `AppGeneratorAgent.resume_generation()`
**Location:** `agent.py:531-569`

#### Steps

1. **Load App's Existing Session**
   ```python
   session_data = self.load_session(app_path)
   session_id = session_data.get("session_id")  # If exists
   ```

2. **Delegate to `resume_with_session()`**
   ```python
   return await self.resume_with_session(
       app_path, 
       additional_instructions, 
       session_id=session_id
   )
   ```

**Function:** `AppGeneratorAgent.resume_with_session()`
**Location:** `agent.py:645-839`

#### Steps

1. **Validate Session** (if provided)
   - Check if UUID format valid
   - Clear if invalid

2. **Expand Instructions**
   ```python
   expansion_result = await self.expand_prompt(additional_instructions, app_path)
   instructions_to_use = expansion_result["expanded"]
   ```

3. **Create Checkpoint Commit**
   - If uncommitted changes exist
   - Records original instructions + expanded version

4. **Change Working Directory**
   ```python
   original_cwd = self.agent.cwd
   self.agent.cwd = app_path  # Switch to app directory
   ```

5. **Build Context-Aware Resume Prompt**
   - Include previous app features/entities
   - Include last action for context
   - New instructions for what to modify

6. **Run Agent with Session**
   ```python
   result = await self.agent.run_with_session(resume_prompt, session_id=session_id)
   ```
   
   With error handling for expired sessions:
   - Detect session errors (expired, not found, terminated)
   - Clear invalid session
   - Create fresh session as fallback
   - Support multiple retry attempts

7. **Update Context**
   - Record last action
   - Update timestamp
   - Save session to app directory

8. **Restore Working Directory**
   ```python
   self.agent.cwd = original_cwd
   ```

---

## Layer 3: The Pipeline System Prompt

**Location:** `docs/pipeline-prompt.md`

The system prompt is a comprehensive guide (~50K+ characters) that instructs the agent to:

### Stage 1: Plan Creation
- Analyze user prompt
- Create `plan/plan.md` with:
  - Feature requirements
  - Entity definitions
  - User workflows
  - API specifications
  - UI/UX requirements

### Stage 2: Build Application
This is the most complex stage, implemented via the **build_stage.py** orchestrator:

#### 2.1: Template Extraction
- Extract pre-built Vite-Express template
- Initialize `client/`, `server/`, `shared/` structure

#### 2.2: Backend Specification (Backend Spec Stage)
- **Schema Designer**: Generate `schema.zod.ts` (Zod validation)
- **Contracts Designer**: Generate ts-rest contracts in `shared/contracts/`

#### 2.3: Backend Implementation (Build Stage)
Multi-part Writer-Critic pipeline:

1. **Schema Generator** (Writer + Critic)
   - Generates: `shared/schema.ts` (Drizzle ORM)
   - Validates: Types, relationships, completeness

2. **Storage Generator** (Writer + Critic)
   - Generates: `server/storage.ts` (IStorage implementation)
   - Validates: Database schema alignment

3. **Routes Generator** (Writer + Critic)
   - Generates: `server/routes.ts` (Express routes)
   - Validates: All CRUD endpoints, error handling

4. **API Client Generator** (Writer + Critic)
   - Generates: `client/src/lib/api-client.ts`
   - Validates: Type-safe API consumption

5. **App Shell Generator** (Writer + Critic)
   - Generates: `client/src/App.tsx` (routing + layout)
   - Validates: Page routes registration

#### 2.4: Frontend Specification
6. **Frontend Interaction Spec Master**
   - Generates: `specs/frontend-interaction-spec-master.md`
   - Contains: Design patterns, API registry, shared components

7. **Frontend Interaction Spec Pages** (Parallel)
   - Generates: `specs/pages/frontend-interaction-spec-{PageName}.md`
   - One spec per page type (CRUD, workflow, utility)
   - Generated in parallel (5 concurrent by default)

#### 2.5: Frontend Implementation (Parallel)
8. **Layout Generator** (Writer + Critic)
   - Generates: `client/src/components/layout/AppLayout.tsx`
   - Validates: Layout structure and navigation

9. **Frontend Implementation** (Parallel Orchestrator)
   - Generates: All pages in parallel
   - Each page: Component + data hooks + form handling
   - Parallel count: 5-10 concurrent pages

### Stage 3: Validation
- Type checking (TypeScript)
- Linting (OXC - 50-100x faster than ESLint)
- Build testing
- Browser automation verification

---

## Layer 4: Build Stage Orchestration

**Location:** `src/app_factory_leonardo_replit/stages/build_stage.py`

### `run_stage()` Function (Main Orchestrator)

**Signature:** `async def run_stage(plan_path, react_component_path, output_dir, phase, **kwargs)`

### Execution Flow

#### Step 1: Template Extraction
```python
app_dir = extract_template(workspace_dir)
# Creates: app/client/, app/server/, app/shared/
```

#### Step 2: Backend Spec Generation
```python
backend_spec_result = await backend_spec_stage.run_stage(
    plan_path=plan_path,
    output_dir=backend_output_dir
)
```
Produces: `schema.zod.ts`, `contracts/`

#### Step 3: TypeScript Configuration
```python
setup_typescript_configuration(app_dir)
```

#### Step 4: Copy Plan and Artifacts
- Copy `plan.md` → `app/specs/plan.md`
- Copy `App.tsx` → `app/specs/App.tsx` (if exists)
- Backup all phase files to `app/_planning/`

#### Step 5: Define Agent Pipeline

Creates `agent_pairs` list with Writer-Critic pairs:

```python
agent_pairs = [
    {
        "name": "Schema Generator",
        "writer": SchemaGeneratorAgent(...),
        "critic": SchemaGeneratorCritic(...),
        "critical": True
    },
    {
        "name": "Storage Generator",
        "writer": StorageGeneratorAgent(...),
        "critic": StorageGeneratorCritic(...),
        "critical": True
    },
    {
        "name": "Routes Generator",
        "writer": RoutesGeneratorAgent(...),
        "critic": RoutesGeneratorCritic(...),
        "critical": True
    },
    {
        "name": "API Client Generator",
        "writer": TsRestApiClientGeneratorAgent(...),
        "critic": TsRestApiClientGeneratorCritic(...),
        "critical": True
    },
    {
        "name": "App Shell Generator",
        "writer": AppShellGeneratorAgent(...),
        "critic": AppShellGeneratorCritic(...),
        "critical": True
    },
    {
        "name": "Frontend Interaction Spec (Master)",
        "writer": FrontendInteractionSpecMasterAgent(...),
        "critic": None,
        "critical": True,
        "special_handler": "frontend_interaction_spec_master"
    },
    {
        "name": "Layout Generator",
        "writer": LayoutGeneratorAgent(...),
        "critic": LayoutGeneratorCritic(...),
        "critical": False
    },
    {
        "name": "Frontend Implementation",
        "writer": None,
        "critic": None,
        "critical": True,
        "special_handler": "frontend_implementation"
    }
]
```

#### Step 6: Execute Writer-Critic Loops

```python
for agent_pair in agent_pairs:
    # Skip if output already exists
    if output_file.exists():
        continue
    
    # Run Writer-Critic loop
    success, eval_data = await run_writer_critic_loop(
        writer_agent=agent_pair["writer"],
        critic_agent=agent_pair["critic"],
        agent_name=agent_pair["name"],
        max_iterations=3,  # Default max iterations
        app_dir=app_dir
    )
    
    # Stop pipeline on critical failure
    if not success and agent_pair["critical"]:
        return AgentResult(success=False, content=error_msg, cost=total_cost)
```

---

## Layer 5: Writer-Critic Loop Pattern

**Function:** `run_writer_critic_loop()`
**Location:** `build_stage.py:73-420`

### Loop Structure

```python
async def run_writer_critic_loop(
    writer_agent: Any,
    critic_agent: Any,
    agent_name: str,
    max_iterations: int = 3,
    app_dir: Path = None
) -> Tuple[bool, Dict[str, Any]]:
```

### Per-Iteration Flow

For each iteration (max 3 by default):

#### Phase 1: Writer Generation
1. Call appropriate writer method based on agent type:
   - `generate_schema()` → Schema Generator
   - `generate_storage()` → Storage Generator
   - `generate_routes()` → Routes Generator
   - `generate_api_client()` → API Client Generator
   - `generate_interaction_spec()` → FIS Agent
   - `generate_context_providers()` → Context Provider
   - `generate_app_shell()` → App Shell
   - `generate_app_layout()` → Layout Generator
   - `generate_frontend()` → Frontend Implementation

2. Pass previous iteration's critic response as context
   ```python
   previous_critic_response = evaluation_history[-1]["raw_response"]
   writer_result = await writer_agent.generate_schema(previous_critic_response)
   ```

3. Writer self-tests (internally uses build_test, linting)

4. Return: `(success: bool, data: dict, message: str)`

#### Phase 2: Critic Inspection
1. Call appropriate critic method:
   - `inspect_schema()` → Schema Critic
   - `inspect_storage()` → Storage Critic
   - `inspect_routes()` → Routes Critic
   - `inspect_api_client()` → API Client Critic
   - `evaluate_specification()` → FIS Critic
   - `inspect_app_shell()` → App Shell Critic
   - `inspect_app_layout()` → Layout Critic

2. Critic decision returned as: `(decision: str, eval_data: dict)`

3. Decision options:
   - **`"complete"`**: Validation passed, stop loop
   - **`"continue"`**: Issues found, iterate again
   - **`"fail"`**: Critical failure, stop pipeline

#### Phase 3: Decision Handling
```python
if decision == "complete":
    # Success! Move to next agent
    return True, {"agent": agent_name, "iterations": iteration}

elif decision == "continue":
    if iteration >= max_iterations:
        # Max iterations reached
        return False, {"error": "Max iterations exceeded"}
    # Loop again - Writer gets critic feedback

else:
    # Invalid decision
    return False, {"error": f"Invalid decision: {decision}"}
```

### Never-Broken Principle

- **Critical Failure**: Stops entire pipeline immediately
- **Non-Critical Failure**: Logs but continues to next agent
- **Iteration Limit**: Returns failure if not resolved in max iterations
- **No Rollback**: Once a stage completes, previous stages not re-run

---

## Layer 6: Agent Hierarchy

### Backend Agents (Schema, Routes, Storage)

Each has:
- **Writer**: Generates code + self-tests
- **Critic**: Validates output
- **Paths**: Receives absolute paths to files/directories
- **Context**: Plan content for requirements

#### Schema Generator
- Input: Plan content
- Output: `shared/schema.ts` (Drizzle ORM types)
- Self-tests: TypeScript compilation
- Critic checks: Type completeness, relationships

#### Storage Generator
- Input: Plan, schema.ts
- Output: `server/storage.ts` (IStorage implementation)
- Self-tests: TypeScript compilation
- Critic checks: Schema alignment, CRUD methods

#### Routes Generator
- Input: Plan, schema.ts, contracts, storage.ts
- Output: `server/routes.ts` (Express endpoints)
- Self-tests: TypeScript compilation
- Critic checks: All CRUD endpoints, validation

#### API Client Generator
- Input: Contracts directory
- Output: `client/src/lib/api-client.ts`
- Self-tests: TypeScript compilation
- Critic checks: Type-safe API contract alignment

### Frontend Agents (Specs, Implementation)

#### Frontend Interaction Spec Master
- No critic (straightforward generation)
- Generates: `specs/frontend-interaction-spec-master.md`
- Contains: Design patterns, API registry, shared components
- Triggers: Parallel page spec generation afterward

#### Frontend Interaction Spec Pages
- **Orchestrator**: `ParallelFISOrchestrator`
- Generates: One `.md` spec per page
- Parallel execution: 5 pages at a time
- Location: `specs/pages/`

#### App Shell Generator
- Input: Plan, master spec, layout
- Output: `client/src/App.tsx`
- Self-tests: TypeScript compilation
- Critic checks: Routes registered, layout imported

#### Layout Generator
- Input: Master spec
- Output: `client/src/components/layout/AppLayout.tsx`
- Self-tests: TypeScript compilation
- Critic checks: Navigation structure

#### Frontend Implementation
- **Orchestrator**: `ParallelFrontendOrchestrator`
- Generates: Page components + hooks
- Parallel execution: 5-10 pages at a time
- Uses: FIS specs + schema + contracts
- Critic: Browser Visual Critic (tests in browser)

### Subagents (Optional)

**Location:** `agents/app_generator/subagents/`

When enabled:
- API Architect: Reviews API design
- Quality Assurer: Validates code quality
- Error Fixer: Fixes compilation errors
- Schema Designer: Validates schema design
- Code Writer: Writes code fragments
- Frontend Designer: Reviews UI implementation
- UI Designer: Reviews design systems
- Integration Validator: Tests integrations

---

## Layer 7: Data Flow Between Stages

### File Dependencies

```
Plan (plan.md)
├── Backend Spec Stage
│   ├── Schema Designer → schema.zod.ts
│   └── Contracts Designer → shared/contracts/*.ts
│
├── Build Stage
│   ├── Schema Generator
│   │   ├── Input: plan.md, schema.zod.ts
│   │   └── Output: shared/schema.ts (Drizzle)
│   │
│   ├── Storage Generator
│   │   ├── Input: plan.md, schema.ts
│   │   └── Output: server/storage.ts
│   │
│   ├── Routes Generator
│   │   ├── Input: plan.md, schema.ts, contracts/
│   │   └── Output: server/routes.ts
│   │
│   ├── API Client Generator
│   │   ├── Input: contracts/
│   │   └── Output: client/src/lib/api-client.ts
│   │
│   ├── App Shell Generator
│   │   ├── Input: plan.md, master spec
│   │   └── Output: client/src/App.tsx
│   │
│   ├── FIS Master Generator
│   │   ├── Input: plan.md, schema.ts, contracts/, routes.ts
│   │   ├── Output: specs/frontend-interaction-spec-master.md
│   │   └── Triggers: FIS Page Generation (parallel)
│   │
│   ├── FIS Page Generators (Parallel)
│   │   ├── Input: plan.md, master spec
│   │   └── Output: specs/pages/*.md
│   │
│   ├── Layout Generator
│   │   ├── Input: plan.md, master spec
│   │   └── Output: client/src/components/layout/AppLayout.tsx
│   │
│   └── Frontend Implementation (Parallel)
│       ├── Input: master spec, page specs, schema.ts, contracts/
│       └── Output: client/src/pages/*.tsx, hooks/
│
└── Validation Stage
    ├── Type check: tsc --noEmit
    ├── Lint: oxc
    └── Build test: npm run build
```

### Content Flow

1. **Plan** contains feature descriptions and entity definitions
2. **Schema.zod.ts** (source of truth) defines data model
3. **Schema.ts** (Drizzle) implements ORM tables
4. **Contracts** define API request/response types
5. **Routes** implement API endpoints
6. **API Client** types against contracts
7. **FIS Master** documents design patterns
8. **FIS Pages** detail specific page requirements
9. **App Shell** imports Layout + Pages
10. **Pages** implement using API Client + hooks

---

## Layer 8: Orchestration Patterns

### Sequential Execution
- Schema → Storage → Routes → API Client → App Shell
- Each depends on previous stage's output

### Parallel Execution
- **FIS Page Generation**: 5 pages concurrently
  - Timeout: 30 minutes per page
  - Retry: 3 attempts per page
  
- **Frontend Page Generation**: 5-10 pages concurrently
  - Timeout: Configurable
  - Retry: On failure

### Orchestrator Classes

#### `ParallelFISOrchestrator`
```python
orchestrator = ParallelFISOrchestrator(
    app_dir=app_dir,
    max_concurrency=5,      # 5 pages at a time
    timeout_per_page=1800,  # 30 minutes
    retry_attempts=3
)
results = await orchestrator.generate_all_specs()
```

#### `ParallelFrontendOrchestrator`
```python
orchestrator = ParallelFrontendOrchestrator(
    app_dir=app_dir,
    max_concurrency=10,     # 10 pages at a time
    timeout_per_page=600,   # 10 minutes
    retry_attempts=2
)
results = await orchestrator.generate_all_pages()
```

---

## Layer 9: Session Management

### Session Persistence

When generating or modifying an app, session is automatically saved:

```json
{
    "session_id": "uuid-here",
    "app_path": "/path/to/app",
    "timestamp": "2025-01-08T...",
    "context": {
        "app_name": "todo-app",
        "original_request": "Create a todo app with...",
        "features": ["CRUD", "Authentication"],
        "entities": ["users", "todos"],
        "last_action": "Add dark mode",
        "last_modified": "2025-01-08T..."
    }
}
```

**Storage Location:** `{app_path}/.agent_session.json`

### Session Recovery

When resuming:
1. Load session file for app
2. Validate UUID format
3. If valid, use for `run_with_session(session_id)`
4. If invalid or expired, create new session
5. Fallback: Multiple retry attempts with fresh sessions

---

## Complete Example Trace: "Create a Todo App"

### 1. Entry
```bash
uv run python run-app-generator.py "Create a todo app with user authentication" --app-name todo-app
```

### 2. Initialization
- Parse args: prompt, app_name=todo-app
- Create AppGeneratorAgent (expansion enabled, subagents enabled)
- Load pipeline-prompt.md system prompt

### 3. Prompt Expansion
- User: "Create a todo app with user authentication"
- Expander analyzes + enhances with best practices
- Result: Detailed spec including CRUD, schema, API design

### 4. Agent Generation Call
- System prompt: pipeline-prompt.md (50K+ chars)
- User prompt: Expanded todo app specification
- Agent processes all stages automatically

### 5. Stage 1: Plan
- Agent creates `plan/plan.md`
- Contains: Features, entities (users, todos, categories), workflows, API spec

### 6. Stage 2: Build (Orchestrated)

#### 6a: Backend Spec
- **Schema Designer**: Creates Zod types
- **Contracts Designer**: Creates ts-rest contracts

#### 6b: Template Extraction
- Extracts vite-express-template
- Creates app/client/, app/server/, app/shared/

#### 6c: Writer-Critic Chain
1. Schema Generator iterates until Critic approves
2. Storage Generator iterates
3. Routes Generator iterates
4. API Client Generator iterates
5. App Shell Generator iterates

#### 6d: Frontend Specs
6. FIS Master generates design patterns
7. FIS Page Generators (parallel):
   - TodoList page spec
   - TodoDetail page spec
   - TodoForm page spec
   - UserProfile page spec

#### 6e: Frontend Implementation (parallel)
8. Layout Generator creates AppLayout.tsx
9. Frontend Implementation parallel generates:
   - pages/TodoList.tsx
   - pages/TodoDetail.tsx
   - pages/TodoForm.tsx
   - pages/UserProfile.tsx
   - pages/Login.tsx
   - hooks/useTodos.ts
   - hooks/useAuth.ts

### 7. Stage 3: Validation
- TypeScript type check
- OXC linting
- Build test
- Browser automation verification

### 8. Completion
- Git initial commit created
- Session saved to `.agent_session.json`
- App ready at `apps/todo-app/app`
- Changelog and CLAUDE.md generated

### 9. Interactive Loop
- Enters confirm-first mode
- Reprompter suggests next tasks
- User can: approve, redirect, add, or exit

---

## Key Design Patterns

### 1. **Writer-Critic Pattern**
- Writer generates and self-tests
- Critic validates independently
- Loop continues until critic says "complete"
- Max 3 iterations per agent (fail if not resolved)

### 2. **Schema-First Development**
- Database schema (schema.zod.ts) is source of truth
- All backend agents depend on schema
- Frontend relies on schema + contracts for types

### 3. **Never-Broken Pipeline**
- Critical agents stop pipeline on failure
- Non-critical agents can fail without stopping
- No rollback of previous stages
- Early detection of issues

### 4. **Parallel Execution**
- Frontend specs generated in parallel (5 concurrent)
- Frontend pages generated in parallel (5-10 concurrent)
- Reduces total generation time

### 5. **Session-Aware Context**
- Session ID maintained across modifications
- Context persisted (features, entities, last actions)
- Enables intelligent reprompter suggestions

### 6. **File-Based Context**
- Agents read absolute file paths
- Plans, specs, schemas available in app directory
- Reduces token usage vs. embedding full content

### 7. **MCP Tool Integration**
- Build_test: TypeScript verification
- OXC linting: Fast code quality
- Chrome DevTools: Browser automation
- Dev server: Live testing

---

## Critical Success Factors

1. **Schema-First Approach**: Schema is generated before routes/storage
2. **Type Safety**: Full TypeScript type checking across stack
3. **Real API**: Frontend pages use actual API client (no mocks)
4. **Validation**: Each stage validates independently
5. **Iteration**: Writer-Critic loops refine until quality achieved
6. **Parallel**: Frontend generation is parallelized
7. **Context**: Session preserves app knowledge for modifications

---

## Performance Characteristics

- **New App Generation**: 10-20 minutes (depends on complexity)
- **FIS Page Specs**: 30 min (5 concurrent pages)
- **Frontend Implementation**: 10-15 min (5-10 concurrent pages)
- **Writer-Critic Iterations**: 1-3 per agent (usually completes in 1)
- **Total Build Time**: 20-40 minutes for typical app

---

## Error Handling

1. **Session Expired**: Clear session, create fresh
2. **Writer Failure**: Log error, critical stops pipeline
3. **Critic Failure**: Log error, don't advance iteration
4. **Max Iterations**: Fail if quality not achieved
5. **File Not Found**: Return error, stop pipeline
6. **Type Check Failure**: Return error, stop pipeline

---

## Testing & Validation

The agent validates through:

1. **Self-Testing** (Writer)
   - TypeScript compilation
   - linting with OXC

2. **Critic Validation**
   - Domain-specific checks
   - Compliance scoring
   - Error detection

3. **Build Testing**
   - npm run build verification
   - Type checking completeness

4. **Browser Testing** (Frontend)
   - Chrome DevTools automation
   - Visual regression checking
   - Functionality verification

---

## Summary

The App Generator implements a sophisticated multi-stage pipeline that:

1. **Takes** a natural language prompt
2. **Expands** it following best practices
3. **Generates** a complete application through:
   - Plan creation
   - Schema-first backend design
   - Writer-Critic code generation
   - Parallel frontend generation
4. **Validates** through type checking, linting, and browser testing
5. **Persists** context for continued modifications
6. **Never breaks** the app through careful stage ordering and validation

The system uses **Claude 3.5 Sonnet** with access to 11+ MCP tools and supports delegating to specialized subagents for complex tasks. The Writer-Critic pattern ensures code quality, while parallel execution reduces generation time. Session support enables iterative improvements through an interactive loop.

