# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI App Factory transforms user prompts into fully functional web applications using a multi-stage pipeline of specialized AI agents. The system uses a Writer-Critic pattern where agents generate code, validate it, and iterate until quality standards are met.

## Recent Improvements (Option 3: Long-Term Fix)

### Pipeline Enhancements (January 2025)

**Problem**: The "Missing Pages" issue was caused by information delta - tech spec was generated before schema/contracts were available, resulting in incomplete page detection.

**Solution**: Implemented Option 3 "Long-Term Fix" with the following changes:

#### 1. Pipeline Reordering
- **Tech Spec Generation Moved**: Now runs AFTER API Client Generator (instead of before Build Stage)
- **Location**: `build_stage.py` lines 1405-1444
- **Benefit**: Tech spec now has access to complete schema and API contracts for intelligent page detection

#### 2. LLM-Based Page Extraction
- **Replaced**: Regex-based parsing with intelligent LLM extraction
- **Method**: `FrontendInteractionSpecMasterAgent.extract_pages_from_tech_spec()`
- **Location**: `agents/frontend_interaction_spec_master/agent.py` lines 151-228
- **Benefit**: Handles any format, extracts all page types (CRUD, utility, workflow pages)

#### 3. Enhanced Agent Context
- **TechnicalArchitectureSpecAgent**: Now receives `schema_path` and `contracts_dir` parameters
- **FISPageAgent**: Now receives `schema_content`, `complete_page_list`, `workflow_context`
- **Benefit**: Agents have full context for accurate spec generation

#### 4. Integration Testing
Run validation tests:
```bash
uv run python test-option3-integration.py apps/{app-name}/app
```

Tests validate:
1. ✅ TechnicalArchitectureSpecAgent receives schema and contracts
2. ✅ FISMasterAgent uses LLM-based page extraction (extracts 15+ pages)
3. ✅ FISPageAgent receives full context parameters
4. Tech spec generated AFTER API Client (requires fresh pipeline run)
5. End-to-end flow validation (requires fresh pipeline run)

**Status**: Code changes complete. Tests 1-3 passing (60% success rate). Tests 4-5 require fresh pipeline execution to validate proper ordering.

## Commands

### Initial Setup
```bash
# Authenticate with AWS CodeArtifact (required every 12 hours)
source auth-codeartifact.sh

# Install dependencies
uv sync
```

### Running the Leonardo Pipeline
```bash
# Generate app from prompt
uv run python src/app_factory_leonardo_replit/run.py "Create a todo app"

# With custom workspace
python -m app_factory_leonardo_replit.main /path/to/workspace "App description"

# With custom ports
python -m app_factory_leonardo_replit.main /path/to/workspace "App description" --frontend-port 5173
```

### Frontend Generation Commands
```bash
# Generate FIS specs for an app
./run-modular-fis-timeless-weddings.sh

# Run parallel frontend generation with Writer-Critic
uv run python run-parallel-frontend.py apps/timeless-weddings-phase1/app

# With custom concurrency and timeout
uv run python run-parallel-frontend.py apps/app-dir --max-concurrency 10 --timeout 600
```

### Testing Generated Apps
```bash
# In generated app directory
cd apps/your-app/app
npm install
npm run dev  # Runs on port 5000 (frontend + backend)
```

## Architecture

### Pipeline Flow
```
User Prompt → Plan Stage → Frontend Interaction Spec (FIS) → Build Stage → Validation
                                    ↓
                        Master Spec + Individual Page Specs
                                    ↓
                        Parallel Page Generation (Writer-Critic)
```

### Key Systems

#### 1. Modular FIS Architecture
**Problem**: 32K output token limit prevents generating complete specs in one file.

**Solution**: Master Spec + Page Specs pattern
- `frontend-interaction-spec-master.md` (~7K tokens): Shared patterns, API registry, design system
- `specs/pages/frontend-interaction-spec-{PageName}.md` (~1.2K each): Page-specific details
- Enables parallel generation without redundancy

#### 2. Writer-Critic Pattern
Each code generation follows this loop:
1. **Writer Agent** generates code using FIS specs
2. **Critic Agent** validates against UI consistency rules
3. Loop continues (max 5 iterations) until validation passes
4. TodoWrite tool helps agents track progress

Critical decisions in critic XML:
- `<decision>complete</decision>` - Validation passed
- `<decision>continue</decision>` - Minor issues, iterate
- `<decision>fail</decision>` - Critical failures

#### 3. API Client Standardization
- **Primary**: `client/src/lib/api-client.ts` - Auth-enabled with helpers
- **Legacy**: `client/src/lib/api.ts` - Re-exports from api-client
- Generator creates auth-ready clients with `getAuthToken()`, `setAuthToken()`, `isAuthenticated()`
- Dynamic `baseHeaders` with automatic Authorization header injection

### Agent Configuration Pattern
```python
# config.py - Single source of truth
AGENT_CONFIG = {
    "name": "Agent Name",
    "model": "sonnet",  # or "opus" for complex tasks
    "allowed_tools": ["Read", "Write", "Edit", "TodoWrite"],
    "max_turns": 10
}

# agent.py - Domain-specific wrapper
class SpecificAgent:
    def __init__(self, cwd: str = None):
        self.agent = Agent(
            system_prompt=SYSTEM_PROMPT,
            cwd=cwd,
            **AGENT_CONFIG
        )
```

## Tech Stack

### Frontend
- React 18 + TypeScript + Vite
- Wouter (routing), TanStack Query (server state)
- Tailwind CSS + shadcn/ui components
- Single port deployment (5000)

### Backend
- Node.js + Express + TypeScript
- PostgreSQL + Drizzle ORM
- RESTful API with ts-rest contracts

### Development Tools
- OXC linting (50-100x faster than ESLint)
- MCP tools for code analysis and validation
- Templates in `~/.mcp-tools/templates/`

## Key Directories

```
src/app_factory_leonardo_replit/
├── agents/                  # Specialized AI agents
│   ├── page_generator/      # Page generation with Writer-Critic
│   ├── frontend_interaction_spec/  # FIS generation agents
│   └── */critic/            # Validation agents
├── orchestrators/           # Parallel execution managers
├── stages/                  # Pipeline stage implementations
└── utilities/               # Shared utilities (fix_api_client.py)

apps/{app-name}/
├── plan/                    # PRD and business specs
├── specs/                   # Backend specifications
│   └── pages/              # Individual page FIS specs
└── app/                    # Generated application
    ├── client/             # React frontend
    ├── server/             # Express backend
    └── shared/             # Shared contracts and types
```

## Critical Implementation Details

### Page Generation Reliability
- Complex pages may fail initial generation attempts
- TodoWrite tool added to help agents track file writing
- Critic accepts both `@/lib/api-client` and `@/lib/api` imports
- Max 5 Writer-Critic iterations per page

### FIS Token Management
- Master spec must stay under 8K tokens
- Each page spec targets 1.2K tokens
- Total can exceed 32K across files (separate generations)
- Parallel generation with 10 concurrent pages by default

### API Client Generation
The `fix_api_client.py` utility generates:
1. `api-client.ts` with full auth support (primary)
2. `api.ts` as simple re-export (backward compatibility)

Always prefer `@/lib/api-client` in new code.

## Environment Variables

Required in `.env`:
```bash
OPENAI_API_KEY=your-key
ANTHROPIC_API_KEY=your-key
# For MCP tools (optional)
QDRANT_URL=http://localhost:6333
NEO4J_URI=bolt://localhost:7687
```

## Library Dependencies

Uses PRIVATE libraries from AWS CodeArtifact:
- `cc-agent` v1.10.0 - Agent framework
- `cc-tools` v1.7.0 - MCP development tools

Authentication expires every 12 hours - run `source auth-codeartifact.sh` daily.
- Always remember that the app-factory is responsible for generating arbitrary apps. As such, let's not hard code anything for a particular app that we might be using as a running example.

## Auth Architecture (Supabase Integration - January 2025)

### Overview
Implementing a **scaffolding-first approach** for authentication:
- **80% Scaffolding**: Generic auth components in template (MockAuthAdapter, SupabaseAuthAdapter, middleware)
- **20% Generation**: App-specific auth integration (users table, auth routes, context provider)
- **Same IStorage Interface**: SupabaseStorage implements existing IStorage - no separate code paths

### Key Components

#### Template Scaffolding (Pre-built):
- `server/lib/auth/`: Auth adapters (Mock for dev, Supabase for production)
- `server/lib/storage/supabase-storage.ts`: Supabase implementation of IStorage
- `server/middleware/auth.ts`: Auth middleware for route protection
- `client/src/components/auth/`: ProtectedRoute, UserMenu, LoadingScreen
- `client/src/lib/auth-helpers.ts`: Token management utilities

#### Generated Components (Per-app):
- Users table in schema (always added)
- Auth routes (`/api/auth/login`, `/signup`, `/logout`, `/me`)
- AuthContext provider with app-specific user type
- Protected route wrapping in App.tsx
- User menu integration in AppLayout

### Environment Modes
```bash
# Development (AI testing)
AUTH_MODE=mock        # No auth barriers
STORAGE_MODE=memory   # In-memory storage

# Production
AUTH_MODE=supabase    # Real authentication
STORAGE_MODE=database # Drizzle ORM with pooler (NOT 'supabase')
```

### Pipeline Updates
New stages added to build pipeline:
1. **Auth Routes Generation** (after Routes Generation)
2. **Context Provider Generation** (after API Client, before App Shell)

### Critic Updates Required
All critics updated to accept auth patterns:
- SchemaGeneratorCritic: Accept users table even if not in Zod schema
- StorageGeneratorCritic: Validate factory pattern usage
- RoutesGeneratorCritic: Check for authMiddleware on protected routes
- AppShellGeneratorCritic: Verify AuthProvider wrapping
- LayoutGeneratorCritic: Validate user menu and auth UI

**Full Analysis**: See `docs/auth-supabase-scaffolding-revised-analysis.md`
- Sorry, the only agents that are in play are app-generator and its subagents. routes_generator etc are relics of the past. The ONLY thing you should worry about from app generator persective is app-generator, its subagents, which have their patterns in docs/patterns and the skills that are in ~/.claude/skills, that's it