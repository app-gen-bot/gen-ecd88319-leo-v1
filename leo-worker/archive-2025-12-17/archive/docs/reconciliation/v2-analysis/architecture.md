# V2 Architecture Analysis

## Overview

V2 (found in `v1_appfactory/app-factory`) implements a sophisticated multi-agent system using the Model Context Protocol (MCP). The architecture is well-designed but uses different patterns than our new Critic-Writer-Judge approach.

## Core Architecture

### 1. Multi-Agent Workflow
```
YAML Specs → Spec Analyzer → Init Project → Frontend Developer → Complete Application
```

### 2. Agent Structure
Each agent follows a consistent pattern:
- `agent.py` - Main agent implementation
- `mcp_agent.config.yaml` - MCP server configuration
- System prompts embedded in code
- Tool configuration through MCP servers

### 3. MCP Server Integration
V2 extensively uses MCP servers for specialized capabilities:
- `editor_frontend` - File editing in frontend workspace
- `editor_input` - File editing in input/docs workspace  
- `thinking` - Planning and task breakdown
- `browser` - Browser testing with dev server management
- `package_manager` - Secure npm dependency management
- `frontend_init` / `backend_init` - Project scaffolding
- `build_test` - Build verification and error detection
- `shadcn` - ShadCN/ui component installation

### 4. Frontend Spec v2.0 Architecture
Two-layer specification system:
- **Shared Foundation** (`00-shared/`) - Reusable configuration and contracts
- **Implementation Chunks** (`01-*.yaml, 02-*.yaml`) - Self-contained feature implementations

## Key Design Decisions

### 1. Artifact-Driven Workflow Detection
Agents check for existing artifacts to determine if they should run:
- Spec Analyzer: Skips if `input/chunked/` contains YAML files
- Init + Frontend: Skip if `application/` directory exists

### 2. Multi-Phase Validation
Frontend Developer Agent v2 has three phases:
1. **Development Phase** - Process chunks sequentially
2. **Build Validation Phase** - Ensure compilation success
3. **Browser Testing Phase** - Validate runtime behavior

### 3. Selective Context Loading
Uses `index.yaml` to load only required foundation files per chunk:
```yaml
chunks:
  infrastructure:
    file: "01-infrastructure.yaml"
    includes: ["tech-stack.yaml", "copy.yaml"]
```

### 4. Template Resolution
Chunks use `{{foundation-file.key.path}}` syntax to reference shared values.

## Strengths

1. **Modular Design** - Clear separation of concerns between agents
2. **MCP Integration** - Leverages specialized tools effectively
3. **Error Recovery** - Multi-phase validation catches and fixes issues
4. **Performance Optimization** - Cache setup, selective loading
5. **Multi-Provider Support** - Works with Anthropic, OpenAI, Google

## Differences from New Design

1. **Agent Pattern**: V2 uses sequential Writer→Critic, not iterative Critic-Writer-Judge
2. **Terminology**: Uses "steps" instead of "stages"
3. **No Judge Role**: Lacks final arbitration/decision-making agent
4. **No Iteration**: Linear flow without retry loops

## Technical Implementation

### Core Components
- `app_factory/core/` - Base utilities (env_app.py, simple_agent.py)
- `app_factory/top_down_modular/` - Main multi-agent implementation
- Uses `mcp-agent` framework for STDIO-based tool communication
- Python with `uv` package manager

### Configuration
- Environment variables: `LLM_PROVIDER`, `ANTHROPIC_API_KEY`, `MCP_TOOLS_PATH`
- YAML configuration with `${ENV_VAR}` substitution
- Per-agent MCP server configuration