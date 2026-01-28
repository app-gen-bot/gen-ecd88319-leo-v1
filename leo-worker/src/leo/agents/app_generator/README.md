# App Generator Agent

**Prompt to URL** - Generate complete full-stack applications from natural language descriptions.

## Overview

The App Generator Agent uses `pipeline-prompt.md` as its system prompt and has access to all necessary tools to build complete applications end-to-end:

- **MCP Tools**: Chrome DevTools automation, build testing, package management, dev server, shadcn/ui
- **File Operations**: Read, Write, Edit, Glob, Grep
- **Task Management**: TodoWrite for progress tracking, Task for delegation
- **System**: Bash, WebSearch, WebFetch

## Features

✅ **Complete App Generation**: From prompt to working application
✅ **1000 Max Turns**: Extended context for complex applications
✅ **Claude Sonnet 4.5**: Latest model for best code generation
✅ **Pipeline-First**: Follows proven pipeline-prompt.md workflow
✅ **Auto-Testing**: Uses Chrome DevTools to verify app works (console, network, UI)
✅ **Resume Support**: Modify or enhance existing apps

## Quick Start

### Generate a New App

```bash
# Simple app generation
uv run python run-app-generator.py "Create a todo app"

# With custom app name
uv run python run-app-generator.py "Travel planner" --app-name travel-buddy

# With custom output directory
uv run python run-app-generator.py "Recipe app" --output-dir ~/projects/apps
```

### Resume/Modify Existing App

```bash
# Add features to existing app
uv run python run-app-generator.py --resume /workspace/app "Add dark mode"

# Fix issues
uv run python run-app-generator.py --resume /workspace/app "Fix the login page styling"
```

## Generated App Structure

Apps are created directly in `/workspace/app/` (per CONTAINER-STRUCTURE.md):

```
/workspace/app/                    # Generated app root
├── plan/                          # Stage 1: Plan
│   └── plan.md                    # Feature specification
├── client/                        # React + Vite frontend
│   ├── src/
│   │   ├── components/            # shadcn/ui components
│   │   ├── contexts/              # Auth context
│   │   ├── lib/                   # API client, auth helpers
│   │   ├── pages/                 # All app pages
│   │   └── App.tsx
│   └── package.json
├── server/                        # Express backend
│   ├── lib/
│   │   ├── auth/                  # Auth adapters
│   │   ├── storage/               # Storage layer
│   │   └── ai-agent.ts            # AI integration (if needed)
│   ├── routes/                    # API routes
│   └── index.ts
├── shared/                        # Shared types
│   ├── schema.zod.ts              # Zod schemas (source of truth)
│   ├── schema.ts                  # Drizzle schemas
│   └── contracts/                 # ts-rest contracts
├── .env                           # Environment config
├── .git/                          # Git repo for pushing to GitHub
└── package.json
```

## Pipeline Stages

The agent follows the pipeline from `pipeline-prompt.md`:

### Stage 1: Plan (Product Thinking)
- Analyzes user prompt for entities, features, workflows
- Creates comprehensive `plan/plan.md`
- Always includes users table and authentication

### Stage 2: Build (Code Generation)

**Backend:**
1. **Schema** (`shared/schema.zod.ts`) - Single source of truth
2. **Contracts** (`shared/contracts/`) - API contracts
3. **Drizzle Schema** (`shared/schema.ts`) - Database schema
4. **Auth Scaffolding** - Factory pattern (mock/supabase)
5. **Storage Scaffolding** - Factory pattern (memory/database)
6. **API Routes** - Complete CRUD for all entities
7. **AI Agent** - If prompt mentions AI features

**Frontend:**
1. **API Client** - Type-safe with auto-auth
2. **Auth Context** - Authentication state management
3. **Protected Routes** - Route protection component
4. **Layout** - Consistent AppLayout across pages
5. **Pages** - All pages with real API integration
6. **Forms** - With validation and error handling

### Stage 3: Validate
- Type checking (`tsc --noEmit`)
- Linting (OXC)
- Build test (`npm run build`)
- Chrome DevTools testing:
  - Console error analysis (zero errors required)
  - Network request validation (all requests succeed)
  - UI interaction testing

## Configuration

### Agent Configuration (`config.py`)

```python
AGENT_CONFIG = {
    "name": "AppGeneratorAgent",
    "model": "sonnet",              # Claude Sonnet 4.5
    "max_turns": 1000,              # Extended turns
    "allowed_tools": [              # 80+ tools available
        # File operations
        "Read", "Write", "Edit", "Glob", "Grep",

        # Task management
        "TodoWrite", "Task",

        # System
        "Bash", "WebSearch", "WebFetch",

        # MCP tools (Chrome DevTools, build, packages, etc.)
        "mcp__chrome_devtools__*",
        "mcp__build_test__*",
        # ... and many more
    ],
}
```

### Paths (Container)

- **Pipeline Prompt**: `/factory/leo/agents/app_generator/pipeline-prompt-v2.md`
- **Output Directory**: `/workspace/app`

## Usage Examples

### Example 1: Todo App with Authentication

```bash
uv run python run-app-generator.py "Create a todo app with user authentication and task categories"
```

**Generated Features:**
- User signup/login
- CRUD operations for todos
- Task categories
- Protected routes
- Real-time updates with TanStack Query

### Example 2: Marketplace Application

```bash
uv run python run-app-generator.py \
  "Build a marketplace for advisory boards where companies post opportunities and advisors can apply" \
  --app-name advisory-marketplace
```

**Generated Features:**
- Multi-entity schema (companies, advisors, opportunities, applications)
- Complete CRUD routes for all entities
- Role-based access (company vs advisor views)
- Application workflow
- Modern UI with Tailwind + shadcn/ui

### Example 3: AI-Powered App

```bash
uv run python run-app-generator.py "Create a travel itinerary planner with AI recommendations"
```

**Generated Features:**
- AI agent using Anthropic SDK
- Structured JSON generation
- Fallback logic for reliability
- Integration with backend routes
- Rich frontend displaying AI results

### Example 4: Resume Existing App

```bash
# Add a new feature
uv run python run-app-generator.py \
  --resume /workspace/app \
  "Add a calendar view for tasks with due dates"

# Fix issues
uv run python run-app-generator.py \
  --resume /workspace/app \
  "Fix the schema mismatch in opportunities - field names don't match"
```

## Critical Requirements

The agent enforces these rules from `pipeline-prompt.md`:

✅ **Schema-First Development**
- `schema.zod.ts` is single source of truth
- All field names must match exactly
- Verify schema before creating seed data

✅ **Complete Route Coverage**
- Every entity gets full CRUD routes
- All routes registered in `routes/index.ts`
- Storage methods for each route

✅ **NO Mock Data in Frontend**
- Every page uses `apiClient`
- Loading states with skeletons
- Error handling
- No hardcoded arrays

✅ **Integration Verification**
- End-to-end data flow tested
- All routes respond correctly
- Chrome DevTools testing before completion:
  - Console errors checked
  - Network requests validated
  - UI interactions tested

## Environment Modes

Generated apps support two modes via `.env`:

### Development Mode (Default)
```bash
AUTH_MODE=mock
STORAGE_MODE=memory
PORT=5000
```

- No authentication barriers (instant testing)
- In-memory storage (no database needed)
- `npm run dev` works immediately

### Production Mode
```bash
AUTH_MODE=supabase
STORAGE_MODE=database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://user:pass@host:5432/db
```

- Real Supabase authentication
- PostgreSQL database
- Production-ready

## Troubleshooting

### Pipeline Prompt Not Found

```bash
❌ ERROR: Pipeline prompt not found at: /Users/.../pipeline-prompt.md
```

**Solution**: Ensure `pipeline-prompt-v2.md` exists at:
```bash
/factory/leo/agents/app_generator/pipeline-prompt-v2.md
```

### Agent Timeout

If generation takes too long, the agent will use its full 1000 turns. Monitor progress via TodoWrite output.

### Port Conflicts

Generated apps use port 5000. If in use:
```bash
# Change port in generated app
cd /workspace/app
# Edit .env: PORT=5001
npm run dev
```

## Development

### Modifying the Agent

**Configuration**: Edit `config.py`
- Change model (sonnet, opus)
- Adjust max_turns
- Add/remove tools

**Agent Logic**: Edit `agent.py`
- Modify `generate_app()` method
- Change prompt structure
- Add new capabilities

**System Prompt**: Edit `pipeline-prompt.md`
- Update pipeline stages
- Add new patterns
- Change requirements

### Testing

```python
# Python REPL
from leo.agents.app_generator import create_app_generator

agent = create_app_generator()
app_path = agent.generate_app("Create a simple blog")
```

## Architecture

```
run-app-generator.py          # CLI entry point
    ↓
AppGeneratorAgent             # Main agent class
    ↓
    ├── Loads pipeline-prompt.md as system prompt
    ├── Initializes cc_agent.Agent with 1000 max_turns
    ├── Has access to 80+ tools
    └── Generates complete apps
```

**Key Design Decisions:**

1. **System Prompt = Pipeline**: The entire `pipeline-prompt.md` becomes the agent's instructions
2. **Extended Turns**: 1000 turns allows for complex apps with multiple iterations
3. **Tool-Rich**: Agent has everything needed (browser, build test, package manager, etc.)
4. **Working Directory**: Agent works in the apps output directory
5. **TodoWrite Integration**: Agent tracks progress through pipeline stages

## Related Documentation

- **Pipeline Prompt**: `docs/pipeline-prompt.md` - The agent's system prompt
- **Prompting Guide**: `docs/PROMPTING-GUIDE.md` - How to avoid common mistakes
- **Leonardo Architecture**: `docs/LEONARDO_PIPELINE_ARCHITECTURE_2025_01_15.md`
- **Agent Pattern**: `agents/docs/AGENT_PATTERN.md`

## Success Criteria

A successfully generated app:

✅ Runs immediately with `npm install && npm run dev`
✅ Has complete backend (schema, auth, storage, routes)
✅ Has complete frontend (layout, pages, real API calls)
✅ Passes type checking, linting, build test
✅ Works in browser (verified by agent)
✅ Production-ready (change 2 env vars to deploy)

## Support

For issues or questions:

1. Check `pipeline-prompt.md` for pipeline details
2. Review `PROMPTING-GUIDE.md` for common mistakes
3. Check agent logs for detailed execution info
4. Review generated app's `plan/plan.md` for feature spec
