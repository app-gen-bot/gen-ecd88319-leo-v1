# AI App Factory - User Guide

The AI App Factory is an intelligent system that transforms user prompts into fully functional web applications through a multi-stage pipeline powered by specialized AI agents.

## Quick Start

### Basic Usage

Generate an app from a prompt:
```bash
uv run python -m app_factory.main_v2 --user-prompt "Create a task management app with user authentication"
```

### Recommended Usage (with all features)

```bash
uv run python -m app_factory.main_v2 \
  --user-prompt "Your app description here" \
  --iterative-stage-1 \
  --skip-questions
```

- `--iterative-stage-1`: Enables Writer-Critic pattern for better interaction specifications
- `--skip-questions`: Skips interactive questions (useful for testing)

### Sprint Mode (MVP-focused development)

Generate just the MVP (Sprint 1):
```bash
uv run python -m app_factory.main_v2 \
  --user-prompt "Your app description here" \
  --app-name "my-app-mvp" \
  --iterative-stage-1 \
  --skip-questions \
  --enable-sprints \
  --sprint 1
```

For complete CLI reference, see [CLI Reference](./cli-reference.md)

## Prerequisites

### 1. Environment Setup

Create a `.env` file in the project root with:
```env
# MCP Tools Path (required if using MCP tools)
MCP_TOOLS=/path/to/mcp-tools

# Browser Configuration
BROWSER_HEADLESS=false  # Set to true for headless mode

# Neo4j Configuration (for context awareness)
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=cc-core-password

# Qdrant Configuration (for memory)
QDRANT_URL=http://localhost:6333

# OpenAI API Key (for embeddings)
OPENAI_API_KEY=your-api-key-here
```

### 2. Install Dependencies

```bash
# Install uv if not already installed
pip install uv

# Install project dependencies
uv pip install -e .
```

### 3. Optional: Set up Context Services

For full context awareness features (optional):
```bash
# Start Neo4j
docker run -d \
  --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/cc-core-password \
  neo4j:latest

# Start Qdrant
docker run -d \
  --name qdrant \
  -p 6333:6333 \
  qdrant/qdrant
```

## Pipeline Stages

The App Factory uses a 6-stage pipeline:

1. **Stage 0: PRD Generation** - Transforms user prompt into a detailed Product Requirements Document
2. **Stage 1: Interaction Specification** - Creates comprehensive frontend interaction specifications
3. **Stage 2: Wireframe Generation** - Builds a fully functional frontend with mock data
4. **Stage 3: Technical Specification** (TODO) - Defines backend architecture and APIs
5. **Stage 4: Backend Implementation** (TODO) - Implements the backend services
6. **Stage 5: Deployment** (TODO) - Deploys the application

Currently, Stages 0-2 are fully implemented.

## Advanced Features

### Checkpoint System

The pipeline automatically saves checkpoints after each stage, allowing you to resume if interrupted.

List checkpoints:
```bash
uv run python -m app_factory.checkpoint_cli list
```

Resume from checkpoint:
```bash
uv run python -m app_factory.main_v2 --checkpoint <checkpoint_id>
```

Show checkpoint details:
```bash
uv run python -m app_factory.checkpoint_cli show <checkpoint_id>
```

### Real-time Monitoring

Monitor pipeline execution in real-time:
```bash
# In a separate terminal
uv run python -m app_factory.monitor

# Or monitor a specific checkpoint
uv run python -m app_factory.monitor --checkpoint <checkpoint_id>
```

### Navigation Completeness

Stage 1 now ensures complete navigation mapping:
- Every route is documented
- All interactive elements have destinations
- No broken links or 404 errors
- Complete dropdown menus and modals

### Frontend-Only Context

Stage 2 generates a frontend-only application:
- Uses mock data and stubbed APIs
- No real backend (yet)
- Browser opens in visible mode for testing
- Critic focuses on UI/UX, not backend functionality

## Example Prompts

### Simple Task Manager
```bash
uv run python -m app_factory.main_v2 \
  --user-prompt "Create a simple task management app with user authentication, task CRUD operations, and a dashboard" \
  --iterative-stage-1
```

### E-commerce Store
```bash
uv run python -m app_factory.main_v2 \
  --user-prompt "Build an e-commerce store with product catalog, shopping cart, user accounts, and checkout flow" \
  --iterative-stage-1
```

### Team Collaboration Tool
```bash
uv run python -m app_factory.main_v2 \
  --user-prompt "Create a Slack-like team collaboration tool with channels, direct messages, file sharing, and user presence" \
  --iterative-stage-1
```

## Output Structure

Generated applications are saved in the `apps/` directory:
```
apps/
└── YourAppName/
    ├── specs/
    │   ├── business_prd.md          # Product Requirements Document
    │   └── frontend-interaction-spec.md  # Interaction Specification
    └── frontend/                    # Next.js application
        ├── app/                     # App router pages
        ├── components/              # React components
        └── lib/                     # Utilities and types
```

## Troubleshooting

### Browser doesn't open
- Check `BROWSER_HEADLESS=false` in your `.env` file
- Ensure you have Chrome/Chromium installed

### Pipeline seems stuck
- Check the monitor for progress: `uv run python -m app_factory.monitor`
- Look for the heartbeat messages (every 30 seconds)
- MCP tools have a 1-minute timeout

### Navigation errors (404s)
- Stage 1 with `--iterative-stage-1` ensures complete navigation
- Check the interaction spec for the Navigation Map section
- All routes should be explicitly defined

### Memory/Context errors
- Context services (Neo4j, Qdrant) are optional
- The pipeline will work without them
- Check service URLs in `.env` if using them

## Testing

Run a test with the provided LoveyTasks example:
```bash
./test_lovey_tasks.sh
```

This creates a family task management app that transforms mundane tasks into loving messages!

## Tips for Better Results

1. **Be Specific**: Provide detailed descriptions of features
2. **Include Examples**: Give examples of user interactions
3. **Mention Tech Preferences**: Although the stack is opinionated, you can mention specific UI preferences
4. **List All Features**: Include authentication, navigation, and data management details
5. **Describe User Types**: Mention different user roles if applicable

## Development

### Running Tests
```bash
# Test navigation improvements
uv run python test_navigation_prompts.py

# Test Stage 2 context understanding
uv run python test_stage2_critic_context.py

# Test checkpoint system
uv run python test_checkpoint_system.py
```

### Key Files
- `src/app_factory/main_v2.py` - Main entry point
- `src/app_factory/stages/` - Pipeline stage implementations
- `src/app_factory/agents/` - AI agent configurations
- `docs/ai-app-factory/templates/` - Document templates

## Current Limitations

- Only Stages 0-2 are implemented (frontend only)
- No real backend or database yet
- No deployment automation yet
- Fixed tech stack (Next.js, FastAPI, DynamoDB)

## Coming Soon

- Stage 3: Technical specification generation
- Stage 4: Backend implementation with FastAPI
- Stage 5: AWS deployment automation
- Custom tech stack options
- Multi-language support