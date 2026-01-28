# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI App Factory transforms user prompts into fully functional web applications using a single main agent (`AppGeneratorAgent`) with 8 specialized subagents.

**Architecture**: Agent-based with intelligent subagent delegation
**Goal**: "Prompt to App" - minimal intervention from idea to deployable application

**NEW (Nov 2025)**: Legacy multi-stage pipeline has been archived. The system now uses `AppGeneratorAgent` with 8 specialized subagents instead of the old stages/ approach.

## Pipeline Architecture

**NEW Architecture (Active)**:
```
User Prompt → AppGeneratorAgent → Plan → Build → Verify → App Generated
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

The main agent (`AppGeneratorAgent`) uses `docs/pipeline-prompt.md` as its system prompt and intelligently delegates tasks to specialized subagents via the Task tool.

**Legacy Architecture (Archived)**: The old multi-stage pipeline (stages/, main.py, run.py) has been moved to `legacy_archive/`. It is no longer used.

See `docs/APP_GENERATOR_PIPELINE_ARCHITECTURE.md` for complete documentation.

## Code Structure

```
src/leo/
├── run_app_generator.py       # NEW: Simple runner using AppGeneratorAgent
├── agents/                    # Agent implementations
│   ├── app_generator/         # Main agent (orchestrator)
│   │   ├── agent.py          # AppGeneratorAgent class
│   │   ├── config.py         # Agent configuration
│   │   ├── prompt_expander.py # LLM-based prompt expansion
│   │   ├── git_helper.py     # Git integration
│   │   └── subagents/        # 8 specialized subagents
│   │       ├── research_agent.py
│   │       ├── schema_designer.py
│   │       ├── api_architect.py
│   │       ├── code_writer.py
│   │       ├── ui_designer.py
│   │       ├── quality_assurer.py
│   │       ├── error_fixer.py
│   │       └── ai_integration.py
│   └── reprompter/            # Auxiliary agent for autonomous iteration
└── legacy_archive/            # OLD: Archived multi-stage pipeline (not used)
    ├── stages/               # Old stage-based approach
    ├── main.py.legacy        # Old entry point
    ├── run.py.legacy         # Old runner
    └── standalone/           # Old standalone scripts
```

## Running the Pipeline

### Primary Commands (NEW)

```bash
# Generate new app
uv run python src/leo/run_app_generator.py "Create a todo app" --app-name todo-app

# Resume existing app with modifications
uv run python src/leo/run_app_generator.py "Add dark mode" --resume apps/todo-app/app

# Disable prompt expansion (faster, less processing)
uv run python src/leo/run_app_generator.py "Create a blog" --app-name blog --no-expansion

# Disable subagents (use main agent only)
uv run python src/leo/run_app_generator.py "Create a notes app" --app-name notes --no-subagents
```

### Python API (Advanced)

```python
from leo.agents.app_generator import AppGeneratorAgent

# Create agent
agent = AppGeneratorAgent()

# Generate new app
app_path, expansion = await agent.generate_app(
    user_prompt="Create a todo app with authentication",
    app_name="todo-app"
)

# Resume existing app
app_path, expansion = await agent.resume_generation(
    app_path="apps/todo-app/app",
    additional_instructions="Add dark mode support"
)
```

### Command Options

- `--workspace-name`: Workspace name for the app (default: 'timeless-weddings')
- `--frontend-port`: Frontend development server port (default: 5173 - Vite's default)
- `--backend-port`: Backend development server port (default: 8000)

### Development Notes

- The pipeline is **stateless** - it auto-detects existing work and resumes
- Generated apps go to `/workspace/app/` (see Container Workspace Structure below)
- Changelog/summaries go to `/workspace/changelog/` and `/workspace/summary_changes/`
- Plan artifacts are created in `/workspace/app/plan/`

## Key Components

### Stage Implementation Pattern

All stages follow this pattern:
```python
async def run_stage(input_params) -> Tuple[AgentResult, additional_outputs]:
    # Stage logic
    return result, outputs
```

### Agent Architecture

Leonardo follows a three-layer agent pattern documented in `/agents/docs/AGENT_PATTERN.md`:

1. **Agent Wrapper Class**: Domain-specific methods wrapping `cc_agent.Agent`
2. **Configuration**: Separated into `config.py` with tools and settings
3. **Prompts**: System and user prompts in separate files

Agents use the `cc_agent.Agent` base class with:
- **System prompts**: Define agent behavior and expertise
- **MCP tools**: Simplified tool configuration (e.g., `["oxc", "tree_sitter"]`)
- **Working directory**: Use `cwd` parameter for relative path operations
- **Domain methods**: Specific methods like `generate_schema()` instead of generic `run()`

### Writer-Critic Pattern

The Build Stage implements a Writer-Critic loop for code generation:
- **Writers**: Generate code and self-test with linting tools
- **Critics**: Independently validate and decide continue/complete
- **Never Broken**: Pipeline stops on first real failure, no broken code propagates

### MCP Tool Integration

Leonardo uses simplified MCP tool configuration:

```python
# Modern approach - simple tool list
self.agent = Agent(
    system_prompt=SYSTEM_PROMPT,
    mcp_tools=["oxc", "tree_sitter", "build_test"],
    cwd=cwd,
    **AGENT_CONFIG
)
```

**Available MCP Tools**:
- `oxc`: Ultra-fast TypeScript/JavaScript linting
- `tree_sitter`: AST analysis for code structure
- `build_test`: TypeScript compilation verification
- `ruff`: Ultra-fast Python linting
- `heroicons`: React icon component generation

## Container Workspace Structure

The container workspace has two git repos: artifacts (at root) and app (nested):

```
/workspace/                   # ← Artifacts repo root (.git)
├── .gitignore                # Contains: app/
├── changelog/                # Full changelog entries (auto-rotated at 5MB)
│   └── changelog-001.md
├── summary_changes/          # Concise summaries for reprompter (1MB rotation)
│   └── summary-001.md
├── leo-artifacts/            # Internal logs, state, sessions
│   ├── logs/
│   ├── state/
│   └── sessions/
└── app/                      # ← App repo root (.git) - EXCLUDED from artifacts
    ├── plan/                 # Plan stage outputs
    │   └── plan.md
    ├── client/               # Vite React frontend
    │   └── src/
    │       ├── components/   # shadcn/ui components
    │       ├── contexts/     # Auth context
    │       ├── lib/          # API client, auth helpers
    │       ├── pages/        # All app pages
    │       └── App.tsx
    ├── server/               # Express backend
    │   ├── lib/
    │   │   ├── auth/         # Auth adapters
    │   │   └── storage/      # Storage layer
    │   ├── routes/           # API routes
    │   └── index.ts
    ├── shared/               # Shared types/schema
    │   ├── schema.zod.ts     # Zod schemas (source of truth)
    │   ├── schema.ts         # Drizzle schemas
    │   └── contracts/        # ts-rest contracts
    ├── .env                  # Environment config
    └── package.json
```

**Git repos:**
- Artifacts repo (`gen-XXX-YYY-artifacts`): `/workspace/` - changelog, summaries, sessions
- App repo (`gen-XXX-YYY`): `/workspace/app/` - generated code only

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Development server and build tool
- **Wouter** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **shadcn/UI** - Component library
- **TanStack Query** - Server state management
- **react-hook-form** with Zod validation

### Backend
- **Node.js** with TypeScript
- **Express.js** - Web framework
- **RESTful API** with Zod validation
- **Single Process** - Frontend and backend on port 5000

### Database
- **PostgreSQL** (Supabase compatible)
- **Drizzle ORM** - Type-safe SQL
- **IStorage Pattern** - MemStorage for dev, PostgresStorage for production

### Architecture
- Schema-first development (shared/schema.ts)
- Type safety across full stack
- Single port deployment (5000)
- Development-to-production with one-line switch

### Development Tools
- **OXC linting** (50-100x faster than ESLint) via MCP tools
- **Templates**: Pre-built application templates (`vite-express-template-v2.1.0.tar.gz`)

### Required Integrations
- **Happy Llama Attribution**: "Powered by Happy Llama" footer link required
- **Demo Authentication**: demo@example.com / DemoRocks2025! using AuthAdapter pattern

## Development Workflow

1. **Plan Generation**: Orchestrator agent creates application plan
2. **UI Specification**: Generate component specs optimized for preview speed
3. **Design System**: Create design tokens and styling from UI specs
4. **Preview Generation**: Fast HTML/React preview for user approval
5. **Template Extraction**: Extract from pre-built template after approval
6. **Writer-Critic Loops**: Generate schema, storage, routes, pages with validation
7. **Final Validation**: Ensure application works correctly

## Current Development Status

- Leonardo pipeline is actively developed and tested
- Implements Writer-Critic pattern for reliable code generation
- Template version: `vite-express-template-v2.1.0.tar.gz`
- All stages (Plan → Validator) are implemented and working
- Focus on "Never Broken" principle - pipeline stops on first failure

## Troubleshooting

### Common Issues

1. **Path Resolution**: Use absolute paths for workspace directories
2. **Template Extraction**: Ensure template files exist in expected locations
3. **Port Conflicts**: Verify frontend/backend ports are available
4. **MCP Tools**: Check MCP server configuration and environment variables

### File Locations

- **Logs**: Generated in `/logs/` directory (relative to project root)
- **Templates**: Expected at `~/.mcp-tools/templates/`
- **Apps Output**: Generated in `/apps/` directory relative to project root
- **Agent Documentation**: `/agents/docs/AGENT_PATTERN.md` for agent development
- **Architecture Docs**: `/docs/LEONARDO_PIPELINE_ARCHITECTURE_2025_01_15.md`

## Key Implementation Details

### Stage Auto-Detection
- Each stage checks for existing artifacts and skips if present
- Enables resume-from-anywhere capability
- Fast iteration during development

### Writer-Critic Architecture
- Writers generate code and self-test with linting tools
- Critics independently validate using domain expertise
- Maximum 3 iterations per Writer-Critic pair
- "Never Broken" principle ensures quality

### Agent Development
- Follow three-layer pattern in `/agents/docs/AGENT_PATTERN.md`
- Use domain-specific methods, not generic `run()`
- Separate business logic from pipeline stages
- MCP tools for ultra-fast linting and analysis

### Template System
- Pre-built templates eliminate setup time
- Template extraction happens only after user approval
- Version-controlled templates ensure consistency
