# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Leonardo App Factory is a simplified AI app generation pipeline that transforms user prompts into working web applications using a multi-stage approach. It generates complete full-stack applications with Next.js frontend and Express backend.

**Goal**: "Prompt to App" - minimal intervention from idea to deployable application

## Pipeline Architecture

The Leonardo pipeline uses a simplified three-stage approach:

```
User Prompt → Plan Stage → Preview Stage → Build Stage
```

### Pipeline Stages

1. **Plan Stage**: Converts user prompt into structured application plan (`plan.md`)
2. **Preview Stage**: Generates HTML preview and React component (`preview.html`, `App.tsx`)
3. **Build Stage**: Extracts template, generates database schema and full app structure

Each stage auto-detects existing work and skips if artifacts already exist.

## Code Structure

```
src/app_factory_leonardo/
├── main.py                    # Main pipeline entry point
├── run.py                     # Simple runner script
├── stages/                    # Pipeline stage implementations
│   ├── plan_stage.py         # Plan generation
│   ├── preview_stage.py      # HTML/React preview
│   └── build_stage.py        # Database schema & app generation
├── agents/                    # Specialized AI agents
│   ├── plan_orchestrator/    # Plan generation agent
│   ├── preview_generator/    # Preview generation agent
│   ├── schema_generator/     # Database schema generation
│   ├── component_generator/  # React component generation
│   └── [other generators]/  # Various code generators
└── initialization/           # Frontend project setup
    └── frontend/             # Next.js project initialization
```

## Running the Pipeline

### Primary Commands

```bash
# Simple runner (recommended for development)
uv run python src/app_factory_leonardo/run.py "Create a todo app"
uv run python src/app_factory_leonardo/run.py  # Uses default prompt

# Direct main.py usage
python -m app_factory_leonardo.main /path/to/workspace "App description"
python -m app_factory_leonardo.main /path/to/workspace "App description" --frontend-port 5001
```

### Command Options

- `--frontend-port`: Frontend development server port (default: 5000)
- `--backend-port`: Backend development server port (default: 8000)

### Development Notes

- The pipeline is **stateless** - it auto-detects existing work and resumes
- Workspace is currently hardcoded to `leonardo-todo` for development consistency
- Generated apps go to `/apps/leonardo-todo/` directory
- Each stage creates specific directories: `plan/`, `preview-html/`, `preview-react/`, `app/`

## Key Components

### Stage Implementation Pattern

All stages follow this pattern:
```python
async def run_stage(input_params) -> Tuple[AgentResult, additional_outputs]:
    # Stage logic
    return result, outputs
```

### Agent Architecture

Agents use the `cc_agent.Agent` base class with:
- **System prompts**: Define agent behavior and expertise
- **Allowed tools**: Specify which tools the agent can use
- **MCP configuration**: Model Context Protocol setup for enhanced capabilities
- **Working directory**: Use `cwd` parameter for relative path operations

### MCP Tool Integration

Leonardo uses MCP (Model Context Protocol) tools for enhanced capabilities:

```python
# Configure MCP tools with working directory
options = ClaudeCodeOptions(
    cwd=str(output_dir),  # All operations relative to this path
    allowed_tools=["Read", "Write", "MultiEdit", "build_test", "browser"],
    system_prompt=system_prompt
)
```

**Benefits of cwd approach**:
- Shorter, relative paths reduce errors
- Agent stays scoped to its directory
- Cleaner prompts and better maintainability

## Generated Application Structure

Apps are created in `/apps/{workspace_name}/` with:

```
apps/leonardo-todo/
├── plan/                     # Plan stage outputs
│   └── plan.md
├── preview-html/             # HTML preview
│   └── preview.html
├── preview-react/            # React preview
│   └── App.tsx
└── app/                      # Full application
    ├── client/               # Next.js frontend
    ├── server/               # Express backend
    └── shared/               # Shared types/schema
        └── schema.ts
```

## Tech Stack

- **Frontend**: Next.js 14, React 18, ShadCN UI, Tailwind CSS
- **Backend**: Express.js, TypeScript
- **Database**: Schema-driven approach (TypeScript interfaces)
- **Development**: Vite for fast builds, ESLint + TypeScript
- **Templates**: Pre-built application templates for consistency

## Development Workflow

1. **Frontend Initialization**: Uses template-based approach instead of npm installation
2. **Template Extraction**: Pre-built templates stored in AWS S3 or local paths
3. **Code Generation**: Specialized agents generate components, routes, storage layer
4. **File Cleanup**: Removes template placeholders that agents will regenerate

## Current Development Status

- Leonardo pipeline is in development/testing mode
- Main pipeline (parent app-factory) exists separately with more stages
- Leonardo focuses on simplified, reliable app generation
- Build stage extracts from template: `vite-express-template-v1.0.0.tar.gz`

## Troubleshooting

### Common Issues

1. **Path Resolution**: Use absolute paths for workspace directories
2. **Template Extraction**: Ensure template files exist in expected locations
3. **Port Conflicts**: Verify frontend/backend ports are available
4. **MCP Tools**: Check MCP server configuration and environment variables

### File Locations

- **Logs**: Generated in `/logs/` directory
- **Templates**: Expected at `/home/ec2-user/.mcp-tools/templates/`
- **Apps Output**: Generated in `/apps/` directory relative to project root

## Key Differences from Main App Factory

- **Simplified Pipeline**: 3 stages vs 6 stages in main app-factory
- **Template-Based**: Uses pre-built templates instead of from-scratch generation
- **Development Focus**: Optimized for rapid iteration and testing
- **Stateless Design**: Auto-resumes from existing work without complex state management