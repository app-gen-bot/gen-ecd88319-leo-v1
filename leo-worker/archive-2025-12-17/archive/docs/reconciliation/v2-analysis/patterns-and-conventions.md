# V2 Patterns and Conventions

## Code Organization

### 1. Agent Structure Pattern
Each agent follows a consistent directory structure:
```
agent_name/
├── __init__.py
├── agent.py           # Main agent implementation
├── mcp_agent.config.yaml  # MCP server configuration
└── README.md         # Agent documentation
```

### 2. Base Classes
- **EnvApp**: Environment-aware MCPApp wrapper (`core/env_app.py`)
- **SimpleAgent**: Simplified interface combining Agent + AugmentedLLM (`core/simple_agent.py`)

### 3. Configuration Management
- YAML-based configuration with environment variable substitution
- Pattern: `${ENV_VAR}` or `${ENV_VAR:/default/value}`
- Centralized in `mcp_agent.config.yaml` per agent

## Coding Patterns

### 1. Agent Initialization
```python
class FrontendDeveloperAgent:
    def __init__(self, args):
        self.workspace = args.workspace
        self.mcp_servers = self._load_mcp_servers()
        self.llm_provider = os.getenv("LLM_PROVIDER", "openai")
```

### 2. Phase Execution Pattern
```python
async def run(self):
    # Phase 1
    if self.should_run_phase1():
        await self.run_phase1()
    
    # Phase 2
    if self.should_run_phase2():
        await self.run_phase2()
    
    # Phase 3
    if self.should_run_phase3():
        await self.run_phase3()
```

### 3. Tool Usage Pattern
V2 uses MCP tools through system prompts:
```python
system_prompt = f"""
You have access to the following tools:
- read_file: Read file contents
- write_file: Write content to file
- run_command: Execute shell commands

{additional_context}
"""
```

### 4. Error Handling
- Try-catch blocks around agent execution
- Graceful degradation (skip phases if prerequisites fail)
- Detailed error messages in output

## Specification Patterns

### 1. Two-Layer Architecture
```
00-shared/               # Foundation layer
├── tech-stack.yaml     # Deterministic config
├── design-tokens.yaml  # Design system
├── typescript-types.yaml  # Data models
└── api-contracts.yaml  # API definitions

01-infrastructure.yaml   # Implementation chunks
02-shared-components.yaml
03-public-pages.yaml
```

### 2. Chunk Independence
Each chunk is self-contained:
```yaml
infrastructure:
  routing:
    implementation: |
      // All code needed for routing
      // No external dependencies
```

### 3. Template References
```yaml
dependencies: "{{tech-stack.dependencies}}"
theme: "{{design-tokens.colors.primary}}"
```

## Testing Patterns

### 1. Multi-Phase Validation
- **Development**: Implement features
- **Build**: Compile-time validation
- **Browser**: Runtime validation

### 2. Artifact Detection
```python
def should_run(self):
    # Check if artifacts already exist
    if os.path.exists(self.output_path):
        return False
    return True
```

### 3. Mock Data Strategy
Comprehensive mock data in implementation:
```typescript
const MOCK_USERS = [
  { id: '1', name: 'John Doe', ... },
  { id: '2', name: 'Jane Smith', ... }
];
```

## Conventions

### 1. Naming Conventions
- Agents: `{function}_agent` (e.g., `frontend_developer`)
- MCP servers: PascalCase (e.g., `EditorFrontend`)
- Spec files: kebab-case (e.g., `tech-stack.yaml`)

### 2. File Organization
```
src/app_factory/
├── core/              # Shared utilities
├── {agent_name}/      # Individual agents
└── top_down_modular/  # Multi-agent orchestration
```

### 3. Environment Variables
- `LLM_PROVIDER`: anthropic|openai|google
- `{PROVIDER}_API_KEY`: API credentials
- `MCP_TOOLS_PATH`: Path to MCP tools
- `APP_WORKSPACE_PATH`: Output directory

### 4. Logging
- Structured logging with agent name prefixes
- Progress indicators for long operations
- Minimal stdout unless `--verbose` flag

## Best Practices Observed

### 1. Modularity
- Clear separation between agents
- Reusable core components
- Plugin-style MCP server integration

### 2. Resilience
- Graceful handling of missing dependencies
- Fallback behaviors
- Clear error messages

### 3. Performance
- Cache optimization (pnpm cache setup)
- Selective file loading
- Parallel tool execution where possible

### 4. Developer Experience
- CLI with sensible defaults
- Progress indicators
- Helpful error messages
- Demo/test data included

## Areas for Improvement

### 1. Type Safety
- More TypeScript-style type hints in Python
- Runtime type validation
- Better error types

### 2. Testing
- No unit tests observed
- Could benefit from integration tests
- Mock MCP servers for testing

### 3. Documentation
- Inline code documentation sparse
- Could use more docstrings
- API documentation missing

### 4. Configuration Validation
- No schema validation for YAML files
- Could catch config errors earlier
- Better default handling