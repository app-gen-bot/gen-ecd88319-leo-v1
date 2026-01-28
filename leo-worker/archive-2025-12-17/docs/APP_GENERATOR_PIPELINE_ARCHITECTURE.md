# App Generator Pipeline Architecture

**Last Updated**: November 17, 2025
**Status**: Active (Legacy code exists but not used)

## Executive Summary

The AI App Factory transforms user prompts into fully functional web applications using a **single main agent** (`app_generator`) with **8 specialized subagents** and **8 reusable skills**.

**High-Level Flow**:
```
User Prompt → (Optional: Reprompter) → app_generator → Plan → Build → Verify → App Generated
                                              ↓
                                        8 Subagents:
                                        - research_agent
                                        - schema_designer
                                        - api_architect
                                        - code_writer
                                        - ui_designer
                                        - quality_assurer
                                        - error_fixer
                                        - ai_integration
```

---

## ⚠️ CRITICAL: What's Legacy vs Active

### ✅ ACTIVE CODE (This is what actually runs)

**Location**: `src/app_factory_leonardo_replit/agents/`

1. **app_generator/** - Main agent that orchestrates entire pipeline
2. **reprompter/** - Auxiliary agent for analyzing state and suggesting next steps
3. **~/.claude/skills/** - 8 reusable knowledge modules

### ❌ LEGACY CODE (Not used - ignore)

**Location**: `src/app_factory_leonardo_replit/stages/`

- `build_stage.py` - Old multi-stage pipeline (deprecated)
- `plan_stage.py`, `preview_stage.py`, etc. - All deprecated
- Any "Writer-Critic" loops in stages/ directory - Old approach

**Why Legacy Exists**: Historical evolution - the system moved from multi-stage pipeline to agent-based architecture but old code wasn't deleted.

---

## The Main Agent: app_generator

**Location**: `src/app_factory_leonardo_replit/agents/app_generator/agent.py`

**System Prompt**: `docs/pipeline-prompt.md` (~850 lines of comprehensive instructions)

**Role**: Single agent responsible for generating complete applications end-to-end

### Key Capabilities

1. **Prompt Expansion** (optional)
   - Uses LLM to expand short prompts into detailed requirements
   - Considers git history for existing apps
   - Can be disabled with `enable_expansion=False`

2. **Subagent Orchestration**
   - Delegates specialized tasks to 8 subagents via Task tool
   - Uses `agents` parameter (claude-agent-sdk v0.1.4+)
   - Writes subagent definitions to `.claude/agents/` as fallback

3. **Session Management**
   - Maintains conversation context across modifications
   - Saves session to `.agent_session.json` per app
   - Enables resume functionality for iterative development

4. **Git Integration**
   - Initializes repos automatically
   - Creates commits with detailed messages
   - Tracks file changes per operation

5. **Changelog Generation**
   - Full changelog: `changelog/changelog-001.md` (5MB rotation)
   - Summary changelog: `summary_changes/summary-001.md` (1MB rotation, LLM-condensed)
   - README files for navigation

### MCP Tools Available

```python
mcp_tools = [
    "chrome_devtools",      # Browser automation & testing
    "build_test",           # Build verification
    "package_manager",      # Secure npm operations
    "dev_server",           # Server management
    "shadcn",               # UI component installation
    "cwd_reporter",         # Path resolution debugging
    "mem0",                 # Memory management
    "graphiti",             # Knowledge graphs
    "context_manager",      # Context orchestration
    "integration_analyzer", # Template comparison
    "supabase",             # Database management
]
```

### Core Methods

#### `generate_app(user_prompt: str, app_name: str) -> tuple`
Initial app generation from prompt:
1. Expands prompt if enabled
2. Builds generation prompt with app_name requirement
3. Calls `agent.run_with_session()`
4. Initializes git repo
5. Creates initial commit
6. Saves session for resume capability
7. Appends to changelog (full + summary)
8. Generates CLAUDE.md for context persistence

#### `resume_generation(app_path: str, instructions: str) -> tuple`
Modify existing app with automatic session support:
1. Loads app-specific session from `.agent_session.json`
2. Expands modification instructions
3. Creates checkpoint commit if uncommitted changes
4. Changes working directory to app path
5. Calls `agent.run_with_session(resume_prompt, session_id=session_id)`
6. Updates session and changelog
7. Returns to original working directory

---

## The 8 Specialized Subagents

**Location**: `src/app_factory_leonardo_replit/agents/app_generator/subagents/`

Each subagent is an `AgentDefinition` dataclass with:
- `description`: What the subagent does
- `prompt`: System prompt with pattern file references
- `tools`: MCP tools available to this subagent
- `model`: "sonnet", "opus", "haiku", or "inherit"

### 1. research_agent

**File**: `subagents/research_agent.py`
**Model**: sonnet
**Purpose**: Research complex app requirements and create implementation strategy

**When to Use**:
- ONLY for truly unknown technologies (payment gateways, AI services, 3rd party APIs)
- NOT for routine web app patterns (CRUD, auth, basic UI)

**Tools**:
- TodoWrite, WebSearch, WebFetch
- Read, Write
- mcp__mem0__add_memory, mcp__context_manager__analyze_query
- mcp__chrome_devtools__ (fallback for JS-heavy documentation sites)

**Output**: Structured research report with:
- Executive summary
- Core technologies required
- Architecture recommendations (backend, frontend, data storage)
- Implementation challenges and solutions
- Code patterns
- External APIs/services
- Timeline estimate
- Risk assessment

**Key Instruction**: Must align research with pipeline stages and tech stack (Node.js, Express, PostgreSQL, Drizzle, React, Vite, Tailwind, shadcn/ui)

---

### 2. schema_designer

**File**: `subagents/schema_designer.py`
**Model**: sonnet
**Purpose**: Design type-safe database schemas with Zod and Drizzle ORM

**Pattern Files Referenced** (7 total):
1. `docs/patterns/schema_designer/CORE_IDENTITY.md`
2. `docs/patterns/schema_designer/ZOD_TRANSFORM_ORDER.md`
3. `docs/patterns/schema_designer/AUTO_INJECTED_FIELDS.md`
4. `docs/patterns/schema_designer/FIXED_UUIDS.md`
5. `docs/patterns/schema_designer/QUERY_SCHEMA_PLACEMENT.md`
6. `docs/patterns/schema_designer/TYPE_SAFETY.md`
7. `docs/patterns/schema_designer/VALIDATION_CHECKLIST.md`

**MUST READ ALL 7 patterns before designing schemas** - prevents production failures

**Responsibilities**:
1. **Zod Schema Design** (`shared/schema.zod.ts`)
   - Validation schemas as single source of truth
   - Both table schemas and insert schemas
   - ALL query/body schemas (pagination, filters, search)

2. **Drizzle ORM Conversion** (`shared/schema.ts`)
   - Convert Zod to Drizzle format
   - Maintain EXACT field parity (names must match precisely)
   - Add indexes for performance
   - Define foreign key relationships

3. **Users Table** (ALWAYS REQUIRED)
   - id, email (unique), name, role (enum: user/admin)
   - createdAt, updatedAt timestamps

**Critical Rules**:
- ✅ Read ALL 6 pattern files before starting
- ✅ Field names match EXACTLY between Zod and Drizzle
- ✅ Omit auto-injected fields from insert schemas (id, userId, timestamps)
- ✅ Use transform order: omit/partial BEFORE refine
- ✅ Define ALL query/body schemas in schema.zod.ts (NEVER inline)
- ❌ NEVER use different field names in Zod vs Drizzle
- ❌ NEVER include auto-injected fields in insert schemas (security issue)
- ❌ NEVER use .refine() before .omit() or .partial() (breaks type system)

**Tools**: Read, Write, Edit, TodoWrite, Bash, mcp__tree_sitter, mcp__supabase

---

### 3. api_architect

**File**: `subagents/api_architect.py`
**Model**: sonnet
**Purpose**: Design RESTful APIs with proper contracts and authentication

**Pattern Files Referenced** (7 total):
1. `docs/patterns/api_architect/CORE_IDENTITY.md`
2. `docs/patterns/api_architect/CONTRACT_PATH_CONSISTENCY.md`
3. `docs/patterns/api_architect/DYNAMIC_AUTH_HEADERS.md`
4. `docs/patterns/api_architect/RESPONSE_SERIALIZATION.md`
5. `docs/patterns/api_architect/HTTP_STATUS_CODES.md`
6. `docs/patterns/api_architect/CONTRACT_REGISTRATION.md`
7. `docs/patterns/api_architect/VALIDATION_CHECKLIST.md`

**MUST READ ALL 7 patterns before designing contracts** - prevents EdVisor Issues #3, #11, #12, #16

**Responsibilities**:
1. **Contract Design** (`shared/contracts/*.contract.ts`)
   - ts-rest contracts for type safety
   - Import types from schema.zod.ts (NEVER redefine)
   - All CRUD operations (GET, POST, PUT, DELETE)
   - Query parameters for filtering/pagination
   - Proper HTTP status codes (200, 201, 204, 400, 401, 404, 500)

2. **Route Architecture** (`server/routes/*.ts`)
   - Logical endpoint structure
   - RESTful conventions
   - Authentication middleware where needed
   - Grouped related endpoints

3. **Route Coverage** - For EVERY entity in schema.zod.ts:
   - GET /api/{{entity}} - List all
   - GET /api/{{entity}}/:id - Get one
   - POST /api/{{entity}} - Create
   - PUT /api/{{entity}}/:id - Update
   - DELETE /api/{{entity}}/:id - Delete
   - Register in server/routes/index.ts

**Critical Rules**:
- ✅ Create ONE contract file per entity
- ✅ Contract paths NEVER include /api prefix (added at mount point)
- ✅ Auth header uses getter property, NOT arrow function (ts-rest v3)
- ✅ Include ALL possible HTTP status codes (200-500)
- ✅ Import query/body schemas from schema.zod.ts
- ❌ NEVER include /api prefix in contract paths (double prefix issue)
- ❌ NEVER use arrow functions for auth headers (ts-rest v3 incompatible)
- ❌ NEVER define schemas inline (causes drift)

**Tools**: Read, Write, Edit, TodoWrite, Grep, Bash, mcp__tree_sitter

---

### 4. code_writer

**File**: `subagents/code_writer.py`
**Model**: sonnet
**Purpose**: Write production-ready TypeScript/React code

**Pattern Files Referenced** (15 total):
1. `docs/patterns/code_writer/CORE_IDENTITY.md`
2. `docs/patterns/code_writer/STORAGE_COMPLETENESS.md`
3. `docs/patterns/code_writer/INTERACTIVE_STATE.md`
4. `docs/patterns/code_writer/AUTH_HELPERS.md`
5. `docs/patterns/code_writer/ESM_IMPORTS.md`
6. `docs/patterns/code_writer/WOUTER_ROUTING.md`
7. `docs/patterns/code_writer/WOUTER_LINK.md`
8. `docs/patterns/code_writer/DATE_CALCULATIONS.md`
9. `docs/patterns/code_writer/ID_FLEXIBILITY.md`
10. `docs/patterns/code_writer/TS_REST_V3_API.md`
11. `docs/patterns/code_writer/REACT_QUERY_PROVIDER.md`
12. `docs/patterns/code_writer/PROXY_METHOD_BINDING.md`
13. `docs/patterns/code_writer/SHADCN_EXPORTS.md`
14. `docs/patterns/code_writer/CODE_PATTERNS.md`
15. `docs/patterns/code_writer/VALIDATION_CHECKLIST.md`

**MUST READ ALL 13 patterns before writing code** - prevents EdVisor Issues #3, #5, #6, #7, #11, #12, #16, #17, #18, #22, #23

**Responsibilities**:
1. **Backend Implementation**
   - Async/await with try/catch error handling
   - Zod schema validation (import from schema.zod.ts)
   - Storage factory pattern
   - Appropriate HTTP status codes

2. **Frontend Implementation**
   - apiClient for ALL API calls (no fetch)
   - NO mock/placeholder data - use real APIs
   - Loading states for all async operations
   - User-friendly error messages
   - Proper form validation

3. **Code Quality**
   - Clean, typed TypeScript (no 'any')
   - ESLint/Prettier conventions
   - JSDoc for complex functions
   - Graceful error handling

4. **React Best Practices**
   - Functional components with hooks
   - Proper state management
   - Loading states with skeletons
   - Error boundaries
   - Optimize re-renders (memo/callback)

**Critical Rules**:
- ✅ Import types from shared files (schema.zod.ts, contracts)
- ✅ Use storage factory pattern (never direct database calls)
- ✅ Add loading states for all async operations
- ✅ Run linting and type checking before completion
- ❌ NEVER redefine types that exist in schemas
- ❌ NEVER use placeholder/mock data in components
- ❌ NEVER skip validation checklist

**Tools**: Read, Write, Edit, TodoWrite, Bash, mcp__build_test__verify_project, mcp__oxc, mcp__supabase

---

### 5. ui_designer

**File**: `subagents/ui_designer.py`
**Model**: sonnet
**Purpose**: Design modern, minimalist dark mode interfaces

**Pattern Files Referenced** (8 total):
1. `docs/patterns/ui_designer/CORE_IDENTITY.md`
2. `docs/patterns/ui_designer/DESIGN_TOKENS.md`
3. `docs/patterns/ui_designer/OKLCH_CONFIGURATION.md`
4. `docs/patterns/ui_designer/COMPONENT_PATTERNS.md`
5. `docs/patterns/ui_designer/RESPONSIVE_DESIGN.md`
6. `docs/patterns/ui_designer/ACCESSIBILITY.md`
7. `docs/patterns/ui_designer/VISUAL_POLISH.md`
8. `docs/patterns/ui_designer/VALIDATION_CHECKLIST.md`

**MUST READ ALL 7 patterns before designing UI** - ensures reference-quality UIs (EchoLens, FunnelSight, AdFlux standards)

**Responsibilities**:
1. **Design System**
   - Tailwind CSS + shadcn/ui components
   - Modern, minimalistic, clean dark mode
   - OKLCH color space for superior dark mode
   - Unsplash images via `https://source.unsplash.com/`

2. **Component Architecture**
   - Select appropriate shadcn/ui components
   - Design custom components where needed
   - Animations and micro-interactions
   - ALL states: loading (skeletons), error (retry), empty (CTA), success (data)

3. **Layout Patterns**
   - Glass effect navigation header
   - Sidebar navigation for complex apps
   - Card-based content layout
   - Responsive 375px mobile to desktop

4. **Accessibility**
   - WCAG 2.2 Level AA compliance (4.5:1 contrast)
   - Keyboard navigation
   - ARIA labels and screen reader support
   - 44px minimum touch targets for mobile

**Critical Rules**:
- ✅ Design a page for EVERY entity (list, detail, create/edit)
- ✅ Use OKLCH dark mode color palette
- ✅ Include ALL states for every component
- ✅ 44px minimum touch targets for mobile
- ✅ WCAG 2.2 Level AA compliance
- ❌ NEVER use HSL/RGB colors (use OKLCH)
- ❌ NEVER skip mobile responsiveness (must work from 375px)
- ❌ NEVER create touch targets smaller than 44px

**Tools**: Read, Write, TodoWrite, WebSearch

---

### 6. quality_assurer

**File**: `subagents/quality_assurer.py`
**Model**: haiku (fast model for testing)
**Purpose**: Test, validate, and ensure code quality

**Pattern Files Referenced** (5 total):
1. `docs/patterns/quality_assurer/CORE_IDENTITY.md`
2. `docs/patterns/quality_assurer/CHROME_DEVTOOLS_TESTING.md`
3. `docs/patterns/quality_assurer/API_TESTING.md`
4. `docs/patterns/quality_assurer/EDVISOR_PATTERN_CHECKS.md`
5. `docs/patterns/quality_assurer/VALIDATION_CHECKLIST.md`

**MUST READ ALL 4 patterns before testing** - prevents EdVisor Issues #3, #5, #11, #18, #23

**Testing Modes**:
1. **Local (localhost:*)**: Run builds + tests + Chrome DevTools
2. **Production (https://*)**: Chrome DevTools ONLY (skip builds/tests)

**Responsibilities**:
1. **Code Quality Checks**
   - TypeScript compilation (`tsc --noEmit`)
   - Linting (OXC or ESLint)
   - Build verification (`npm run build`)
   - Console error checks
   - No TypeScript 'any' types

2. **Schema Validation**
   - Zod and Drizzle field names match EXACTLY
   - Enums consistent across files
   - Foreign key relationships valid
   - All entities have insert schemas
   - Timestamps on all tables

3. **API Testing** (local mode only)
   - Test EVERY endpoint with curl
   - Verify correct status codes
   - Check auth flows
   - Test CRUD operations
   - Validate error responses

4. **Chrome DevTools Testing** (both modes)
   - Open page (local OR production URL)
   - Check console messages (ZERO errors required)
   - Verify network requests (all should succeed)
   - Test user flows (login, CRUD, navigation)
   - Take screenshots if issues found

5. **EdVisor Pattern Checks** (automated validations)
   - Storage method completeness (Issue #5)
   - ESM import extensions (Issue #18)
   - Contract path validation (Issue #3)
   - Dynamic auth headers (Issue #11)
   - Database connection validation (Issue #23)

**Success Criteria**:
- ✅ Zero TypeScript errors
- ✅ All API endpoints return correct status codes
- ✅ Frontend displays real data (no mocks)
- ✅ Auth flow works completely
- ✅ CRUD operations successful
- ✅ No console errors
- ✅ Build completes successfully
- ✅ ALL 5 EdVisor pattern checks PASS

**Critical Rules**:
- ✅ ALWAYS use Chrome DevTools for URL testing
- ✅ Local mode: Run builds + tests + Chrome DevTools
- ✅ Production mode: Chrome DevTools ONLY
- ✅ Test EVERY API endpoint with curl (local)
- ✅ ZERO console errors required
- ❌ NEVER declare success if any test fails
- ❌ NEVER skip EdVisor pattern checks
- ❌ NEVER test production URLs with npm run build

**Tools**: TodoWrite, Bash, mcp__build_test__verify_project, mcp__chrome_devtools__* (all), Grep, Read

---

### 7. error_fixer

**File**: `subagents/error_fixer.py`
**Model**: sonnet (powerful model for complex debugging)
**Purpose**: Fix errors and resolve issues in generated code

**Pattern Files Referenced** (5 total):
1. `docs/patterns/error_fixer/CORE_IDENTITY.md`
2. `docs/patterns/error_fixer/ERROR_ANALYSIS.md`
3. `docs/patterns/error_fixer/COMMON_ERROR_PATTERNS.md`
4. `docs/patterns/error_fixer/DIAGNOSTIC_WORKFLOWS.md`
5. `docs/patterns/error_fixer/FIX_STRATEGY.md`

**MUST READ ALL 5 patterns before fixing** - provides systematic debugging workflows (4-24x faster)

**Responsibilities**:
1. **Error Analysis Process**
   - Read complete error message carefully
   - Identify exact file and line number
   - Understand error type (syntax, type, runtime)
   - Check for related errors with same cause
   - Trace error back to root cause

2. **Common Error Patterns**
   - TypeScript errors: imports, types, property mismatches
   - Runtime errors: null checks, API failures, auth issues
   - Build errors: missing dependencies, syntax errors
   - Schema mismatches: field name inconsistencies
   - Import/export issues: path errors, wrong syntax

3. **Diagnostic Workflows** (proven step-by-step procedures)
   - Module resolution errors (ERR_MODULE_NOT_FOUND): 24x faster (5 min vs 2 hours)
   - Database connection errors (Supabase pooler): 12x faster (10 min vs 2 hours)
   - Authentication flow errors (stale tokens): 4x faster (15 min vs 1 hour)

4. **Fix Implementation Strategy**
   - Make MINIMAL changes only
   - Preserve existing functionality
   - Fix only the reported issue
   - Don't introduce new patterns
   - Maintain code style consistency

5. **Verification Process**
   - Run the failing command again
   - Check for new errors introduced
   - Verify fix doesn't break other features
   - Test related functionality
   - Document what was changed

**Critical Rules**:
- ✅ Read complete error message and stack trace
- ✅ Find exact file and line number
- ✅ Use diagnostic workflows for common errors (24x faster)
- ✅ Make minimal changes only (no refactoring)
- ✅ Test fix immediately after applying
- ✅ Document what was changed and why
- ❌ NEVER make changes without understanding root cause
- ❌ NEVER refactor working code while fixing errors
- ❌ NEVER skip verification after applying fix
- ❌ NEVER apply fix if can't identify root cause (investigate more)

**Tools**: TodoWrite, Read, Edit, Bash, Grep

---

### 8. ai_integration

**File**: `subagents/ai_integration.py`
**Model**: sonnet
**Purpose**: AI features, chat interfaces, ML integration, intelligent behaviors

**Pattern Files Referenced** (7 total):
1. `docs/patterns/ai_integration/CORE_IDENTITY.md`
2. `docs/patterns/ai_integration/CONVERSATION_CONTEXT.md`
3. `docs/patterns/ai_integration/STREAMING_RESPONSES.md`
4. `docs/patterns/ai_integration/FALLBACK_STRATEGIES.md`
5. `docs/patterns/ai_integration/RATE_LIMITING.md`
6. `docs/patterns/ai_integration/CHAT_UI_PATTERNS.md`
7. `docs/patterns/ai_integration/VALIDATION_CHECKLIST.md`

**MUST READ ALL 6 patterns before implementing AI** - ensures reliable AI integration

**Responsibilities**:
1. **Backend AI Service**
   - Multi-turn conversation with context preservation (last 20 messages)
   - Streaming support for real-time responses
   - Session management (save/load/clear conversations)
   - Schema-based generation for structured output
   - Intelligent fallback when API unavailable

2. **API Routes**
   - Chat endpoint with session management
   - Streaming endpoint using Server-Sent Events (SSE)
   - Generation endpoint for specific tasks
   - Session management (clear/export/import)
   - Rate limiting middleware

3. **Frontend Components**
   - Feature-rich chat interface with message history
   - Streaming UI updates in real-time
   - Loading states and error handling
   - Session persistence across refreshes
   - Mobile-responsive design

4. **Integration Hook**
   - Reusable `useAI` hook for components
   - Session ID management
   - Error handling and retries
   - Loading state management

5. **Production Readiness**
   - Rate limiting (100 requests/hour default per user)
   - Environment variable configuration
   - Fallback mode for testing without API key
   - Comprehensive error messages

**Environment Variables Required**:
```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
AI_MODEL=claude-sonnet-4-5-20250929
AI_MAX_TOKENS=4000
AI_TEMPERATURE=0.7
AI_RATE_LIMIT=100  # requests per hour per user
AI_STREAMING_ENABLED=true
AI_FALLBACK_ENABLED=true
```

**Critical Rules**:
- ✅ Implement multi-turn conversation with context (last 20 messages)
- ✅ Add streaming support using Server-Sent Events
- ✅ Provide fallback responses when API unavailable
- ✅ Implement per-user rate limiting (100 req/hour default)
- ✅ Create comprehensive chat UI with all states
- ✅ Test with and without API key (mock mode)
- ❌ NEVER lose conversation context between messages
- ❌ NEVER skip fallback implementation
- ❌ NEVER allow unlimited API usage
- ❌ NEVER skip testing in mock mode

**Tools**: Read, Write, Edit, TodoWrite, WebSearch, WebFetch, Bash

---

## The Reprompter Agent (Auxiliary)

**Location**: `src/app_factory_leonardo_replit/agents/reprompter/`

**Role**: Analyzes current app state and generates next development task prompt

**NOT part of the main pipeline** - used for autonomous iteration/refinement

### How It Works

1. **Context Gathering**
   - Latest changelog entries
   - Plan files (plan.md, specs, etc.)
   - Recent error logs
   - Git status (uncommitted changes)
   - Recent task history (last N tasks for loop detection)

2. **LLM Analysis**
   - Sends context to LLM with simple prompt: "What should we do next?"
   - Detects stuck loops (same task 2+ times) and escalates
   - Generates multi-paragraph prompt for main agent

3. **Strategic Guidance Mode**
   - User can provide strategic direction to regenerate prompt
   - LLM smartly merges original suggestion with user's guidance
   - Supports pivots: keep+add, completely change, refine original

4. **Task Tracking**
   - Records tasks in `.agent_session.json` under `reprompter_context`
   - Smart compression: Last 5 tasks at full detail, older tasks summarized
   - Enables loop detection

**When to Use**: For autonomous multi-iteration development where agent suggests next steps based on current state (not commonly used in normal workflow)

---

## The 8 Reusable Skills

**Location**: `~/.claude/skills/`

Skills are knowledge modules that agents can access for domain-specific guidance.

### 1. drizzle-orm-setup

**Purpose**: Drizzle ORM configuration and best practices

- Database client initialization
- Migration setup
- Query patterns
- Performance optimization

---

### 2. factory-lazy-init

**Purpose**: Prevent eager factory initialization bugs (Fizzcard Issue #3)

**Problem Solved**: Factory initialized before `dotenv/config` → always uses memory storage despite `STORAGE_MODE=database`

**Solution**: Lazy Proxy pattern
```typescript
// ❌ WRONG: Eager initialization
export const storage = createStorage();  // Runs BEFORE dotenv!

// ✅ CORRECT: Lazy Proxy pattern
let instance: IStorage | null = null;
export const storage = new Proxy({} as IStorage, {
  get(target, prop) {
    if (!instance) {
      instance = createStorage();  // Only runs when first accessed
    }
    return instance[prop as keyof IStorage];
  }
});
```

**When to Invoke**: BEFORE generating `server/lib/auth/factory.ts` or `server/lib/storage/factory.ts`

**Teaches**:
- Module hoisting and import order issues
- Why eager initialization breaks environment variable reading
- Step-by-step Proxy implementation
- Type safety patterns
- Complete examples for auth and storage factories

---

### 3. production-smoke-test

**Purpose**: Catch production deployment failures before deploying to Fly.io

**What It Validates**:
- Environment variables loaded correctly
- Database connections work
- Auth adapters initialize properly
- API endpoints respond
- No startup crashes

**When to Use**: Before `fly deploy` to production

---

### 4. schema-query-validator

**Purpose**: Prevent schema-frontend mismatches by teaching schema constraints

**Problem Solved**: Pages query data that doesn't exist in schema → 404 errors, crashes

**What It Checks**:
- All frontend queries match schema entities
- Pagination schemas defined
- Filter schemas defined
- Search schemas defined
- Contract endpoints exist for all queries

**When to Use**: Before generating pages that display data

---

### 5. storage-factory-validation

**Purpose**: Validate factory pattern usage

**What It Checks**:
- Storage factory uses lazy Proxy pattern
- Auth factory uses lazy Proxy pattern
- Factories read environment variables inside functions (not at top level)
- Correct storage method implementation

---

### 6. supabase-full-stack

**Purpose**: Full-stack Supabase integration patterns

**Covers**:
- Supabase client setup
- Row Level Security (RLS) policies
- Real-time subscriptions
- Storage integration
- Auth integration

---

### 7. supabase-storage

**Purpose**: Supabase Storage adapter implementation

**Teaches**:
- SupabaseStorage implementing IStorage interface
- Connection pooling for serverless
- Query patterns with Supabase client
- Error handling
- Transaction support

---

### 8. type-safe-queries

**Purpose**: Type-safe database queries with Drizzle

**Teaches**:
- Drizzle query builder patterns
- Type inference from schema
- Joins and relations
- Transactions
- Prepared statements
- Performance optimization

---

## Pipeline Flow in Detail

### 1. Initial Generation

```
User runs:
  uv run python src/app_factory_leonardo_replit/run.py "Create a todo app"

↓

run.py calls:
  await run_pipeline(workspace_path, user_prompt, ...)

↓

main.py calls:
  app_generator_agent = AppGeneratorAgent(output_dir=workspace_path)
  app_path, expansion = await app_generator_agent.generate_app(user_prompt, app_name)

↓

AppGeneratorAgent.generate_app():
  1. Expands prompt (if enabled) using LLM
  2. Builds generation prompt with:
     - User requirements
     - Required app_name directory
     - Pipeline instructions (Plan → Build → Validate)
     - Critical requirements (schema-first, complete routes, no mocks, testing)
  3. Calls agent.run_with_session(generation_prompt)

↓

agent uses pipeline-prompt.md as system prompt and:
  1. Creates plan/plan.md
  2. Delegates to subagents using Task tool:
     - schema_designer → shared/schema.zod.ts, shared/schema.ts
     - api_architect → shared/contracts/*.contract.ts, server/routes/*.routes.ts
     - code_writer → server/lib/storage/, server/lib/auth/, client/src/
     - ui_designer → client/src/pages/, client/src/components/
  3. Invokes skills before critical tasks:
     - factory-lazy-init BEFORE generating factories
     - schema-query-validator BEFORE generating pages
  4. Validates with quality_assurer subagent
  5. Fixes errors with error_fixer subagent if needed

↓

AppGeneratorAgent.generate_app() (continued):
  6. Initializes git repo
  7. Creates initial commit
  8. Saves session to .agent_session.json
  9. Appends to changelog (full + summary)
  10. Generates CLAUDE.md
  11. Returns (app_path, expansion_result)
```

### 2. Resume/Modification

```
User runs:
  app_path, expansion = await app_generator_agent.resume_generation(
    "/Users/user/apps/app-factory/apps/todo-app/app",
    "Add dark mode support"
  )

↓

AppGeneratorAgent.resume_generation():
  1. Loads existing session from .agent_session.json
  2. Expands modification instructions (if enabled)
  3. Creates checkpoint commit if uncommitted changes
  4. Changes working directory to app path
  5. Builds resume prompt with:
     - App location
     - Previous context (app_name, features, last action)
     - Modification instructions
     - Quality standards
  6. Calls agent.run_with_session(resume_prompt, session_id=session_id)

↓

agent resumes with conversation history and:
  1. Understands existing code from session context
  2. Makes targeted modifications
  3. Delegates to subagents as needed
  4. Tests changes
  5. Fixes any issues

↓

AppGeneratorAgent.resume_generation() (continued):
  7. Updates session and generation context
  8. Saves session
  9. Appends to changelog
  10. Returns (app_path, expansion_result)
```

---

## Subagent Invocation Pattern

When the main agent wants to delegate a task:

```python
# Main agent uses Task tool
result = await Task(
  subagent_type="schema_designer",
  description="Design database schemas",
  prompt="""Read the plan.md file and create:
  1. shared/schema.zod.ts with Zod validation schemas
  2. shared/schema.ts with Drizzle ORM schemas

  Entities: users, todos, categories

  Follow all patterns in docs/patterns/schema_designer/
  """
)
```

The subagent:
1. Receives its specialized system prompt
2. Has access only to its designated tools
3. Uses its assigned model (sonnet/opus/haiku)
4. MUST READ all referenced pattern files
5. Executes task autonomously
6. Returns result to main agent

---

## Pattern Files: The Knowledge Base

**Location**: `docs/patterns/{subagent_name}/`

Each subagent references 4-15 pattern files that provide:
- **Core Identity**: What the subagent does and why
- **Domain Patterns**: Specific implementation patterns (e.g., ZTHE_TRANSFORM_ORDER.md)
- **Common Pitfalls**: Anti-patterns and issues to avoid (e.g., EdVisor Issues)
- **Validation Checklist**: Pre-completion checks

**Why They Exist**: These patterns were learned from real production failures across apps like EdVisor, Fizzcard, asana-clone, EchoLens, etc.

**Time Savings**: Following these patterns saves 1-6+ hours per app by preventing issues that would otherwise require debugging.

**Critical Rule**: All subagents MUST read their pattern files before starting work. If validation fails, fix immediately before marking complete.

---

## Tech Stack (Generated Apps)

### Frontend
- **React 18** with TypeScript
- **Vite** - Development server and build tool
- **Wouter** - Client-side routing (lightweight React Router alternative)
- **Tailwind CSS** - Utility-first styling with OKLCH dark mode
- **shadcn/ui** - Component library
- **TanStack Query** - Server state management
- **react-hook-form** with Zod validation

### Backend
- **Node.js** with TypeScript
- **Express.js** - Web framework
- **ts-rest** - Type-safe REST API contracts
- **Zod** - Runtime validation
- **Single Process** - Frontend and backend on same port (5000)

### Database
- **PostgreSQL** (Supabase compatible)
- **Drizzle ORM** - Type-safe SQL
- **IStorage Pattern** - MemStorage for dev, PostgresStorage/SupabaseStorage for production

### Architecture
- Schema-first development (shared/schema.zod.ts is source of truth)
- Type safety across full stack (schemas → contracts → API → UI)
- Factory pattern for auth and storage (mock/production modes)
- Single port deployment (5000 default)
- Development-to-production with one-line switch (environment variables)

---

## Development Commands

### Run the Pipeline

```bash
# Simple runner (recommended)
uv run python src/app_factory_leonardo_replit/run.py "Create a todo app"

# With custom workspace
python -m app_factory_leonardo_replit.main /path/to/workspace "App description"

# With custom ports
python -m app_factory_leonardo_replit.main /path/to/workspace "App description" --frontend-port 5173
```

### Test Generated Apps

```bash
cd apps/your-app/app
npm install
npm run dev  # Runs on port 5000 (frontend + backend)
```

### Environment Variables

**Required in .env**:
```bash
# Required
ANTHROPIC_API_KEY=your-key

# Optional (defaults work fine)
AUTH_MODE=mock          # or supabase for production
STORAGE_MODE=memory     # or database/supabase for production
PORT=5000               # Server port
VITE_API_URL=/api       # API endpoint for client
```

---

## Summary: What's Essential

### ✅ Essential Components (Active)

1. **app_generator agent** (`agents/app_generator/agent.py`)
   - Main orchestrator
   - Uses pipeline-prompt.md as system prompt
   - Delegates to 8 subagents

2. **8 Subagents** (`agents/app_generator/subagents/`)
   - research_agent: Research unknown tech
   - schema_designer: Zod + Drizzle schemas
   - api_architect: ts-rest contracts + routes
   - code_writer: Backend + Frontend code
   - ui_designer: UI/UX with Tailwind + shadcn
   - quality_assurer: Testing + validation
   - error_fixer: Debugging + fixes
   - ai_integration: AI features + chat

3. **8 Skills** (`~/.claude/skills/`)
   - factory-lazy-init: Prevent eager initialization
   - schema-query-validator: Prevent schema mismatches
   - production-smoke-test: Pre-deployment validation
   - storage-factory-validation: Factory pattern validation
   - drizzle-orm-setup: Drizzle best practices
   - supabase-full-stack: Supabase integration
   - supabase-storage: Storage adapter
   - type-safe-queries: Query patterns

4. **Pattern Files** (`docs/patterns/{subagent}/`)
   - 50+ markdown files with proven patterns
   - Prevent production failures
   - Save 1-6+ hours per app

5. **reprompter agent** (auxiliary, optional)
   - Analyzes state and suggests next steps
   - Used for autonomous iteration
   - Not part of normal generation flow

### ❌ Legacy Components (Ignore)

1. **stages/** directory - Old multi-stage pipeline
2. **build_stage.py** - Deprecated orchestrator
3. Any "Writer-Critic" loops in stages/ - Old approach

---

## Quick Reference: Subagent Responsibilities

| Subagent | Creates | Key Patterns |
|----------|---------|--------------|
| research_agent | Research reports | Research ONLY unknown tech (not CRUD/auth) |
| schema_designer | schema.zod.ts, schema.ts | Exact field parity, transform order, auto-injected fields |
| api_architect | contracts/*.contract.ts, routes/*.routes.ts | No /api prefix, dynamic auth headers, complete status codes |
| code_writer | Backend logic, React pages/components | Import from schemas, no mocks, storage factory, loading states |
| ui_designer | UI design specs, component patterns | OKLCH colors, all states, 44px touch targets, WCAG 2.2 |
| quality_assurer | Test reports | Chrome DevTools for all URLs, EdVisor pattern checks |
| error_fixer | Bug fixes | Diagnostic workflows (24x faster), minimal changes |
| ai_integration | AI service, chat UI | Multi-turn context, streaming SSE, rate limiting, fallbacks |

---

## Time Savings by Following Patterns

| Pattern Category | Time Saved | Issue Prevented |
|------------------|------------|-----------------|
| Schema patterns | ~3 hours/app | Zod transform errors, auto-injection security |
| API patterns | ~4 hours/app | EdVisor #3, #11, #12, #16 |
| Code patterns | ~11+ hours/app | EdVisor #5, #6, #7, #17, #18, #22, #23 |
| UI patterns | ~2 hours/app | Accessibility failures, mobile issues |
| QA patterns | ~6 hours/app | Runtime errors, console issues |
| Error patterns | ~1-2 hours/error | Module errors (24x faster diagnosis) |
| AI patterns | ~3 hours/app | Context loss, streaming issues, cost overruns |
| **TOTAL** | **~30+ hours/app** | Prevents 20+ common production issues |

---

## Next Steps for Simplification

Now that we've documented the actual pipeline, we can identify what's extraneous:

1. **Keep** (Essential):
   - app_generator agent
   - 8 subagents
   - 8 skills
   - Pattern files
   - pipeline-prompt.md

2. **Consider Removing** (Legacy):
   - stages/ directory (build_stage.py, plan_stage.py, etc.)
   - Any orchestrators in stages/
   - Old Writer-Critic code in stages/

3. **Consider Simplifying** (Potentially):
   - reprompter agent (useful but not essential for normal flow)
   - Some pattern files may overlap (consolidation opportunity)
   - Prompt expansion (optional feature, could be opt-in)

The core pipeline is actually quite clean: **1 main agent + 8 subagents + 8 skills + pattern files**. The complexity comes from the legacy code that's no longer used.
