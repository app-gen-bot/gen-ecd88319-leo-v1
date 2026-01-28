# MCP Tool Configuration in Agents - Detailed Explanation

This document explains both the NEW simplified MCP configuration system and the existing detailed configuration system.

## NEW: Simplified MCP Configuration (Recommended)

The framework now provides a centralized MCP registry that dramatically simplifies tool configuration.

### Quick Start - Just List the Tools You Want

```python
from cc_agent import Agent

# Simple approach - just list tool names
agent = Agent(
    name="TypeScript Developer",
    system_prompt="You develop TypeScript applications",
    mcp_tools=["oxc", "tree_sitter", "build_test", "heroicons"]  # That's it!
)

# MCP servers are automatically configured from the registry
result = await agent.run("Check my TypeScript code")
```

### Discovering Available Tools

```python
# List all available MCP tools with descriptions
all_tools = Agent.list_all_mcp_tools()
print("Available tools:")
for name, description in all_tools.items():
    print(f"  - {name}: {description}")

# Find tools by category/tag
linting_tools = Agent.list_tools_by_tag("linting")        # ['oxc', 'ruff']
memory_tools = Agent.list_tools_by_tag("memory")          # ['mem0', 'graphiti']
typescript_tools = Agent.list_tools_by_tag("typescript") # ['oxc', 'build_test']

# Check environment setup
missing_env = Agent.validate_mcp_environment(["graphiti", "mem0"])
for tool, missing_vars in missing_env.items():
    if missing_vars:
        print(f"{tool} is missing: {', '.join(missing_vars)}")
```

### Available MCP Tools

| Tool | Description | Tags | Env Vars |
|------|-------------|------|----------|
| `oxc` | Ultra-fast TypeScript/JavaScript linting (50-100x faster than ESLint) | linting, typescript, javascript | None |
| `ruff` | Ultra-fast Python linting (10-150x faster than Pylint/Flake8) | linting, python | None |
| `build_test` | TypeScript compilation testing and validation | compilation, typescript, testing | None |
| `tree_sitter` | AST analysis for code understanding | ast, parsing, analysis | None |
| `heroicons` | React Heroicons components for consistent UI | icons, react, ui | None |
| `graphiti` | Knowledge graph for storing relationships | knowledge-graph, memory | OPENAI_API_KEY, FALKORDB_HOST |
| `mem0` | Vector memory with graph features | memory, vector-search | OPENAI_API_KEY, QDRANT_URL |
| `browser` | Browser automation for testing | browser, automation, testing | BROWSER_HEADLESS |
| `unsplash` | Stock photos for professional imagery | images, stock-photos | UNSPLASH_ACCESS_KEY |
| `dalle` | Generate custom images using DALL-E | images, generation, ai | OPENAI_API_KEY |

### Migration from Old Approach

**Old way (still works):**
```python
# Complex manual configuration
mcp_servers = {
    "oxc": {
        "type": "stdio",
        "command": "uv",
        "args": ["run", "python", "-m", "cc_tools.oxc.server"]
    },
    "tree_sitter": {
        "type": "stdio", 
        "command": "uv",
        "args": ["run", "mcp-tree-sitter"]
    }
}

agent = Agent(name="Agent", ..., mcp_servers=mcp_servers)
```

**New way (much simpler):**
```python
# Simple tool list - registry handles the details
agent = Agent(
    name="Agent", 
    ..., 
    mcp_tools=["oxc", "tree_sitter"]
)
```

### ContextAwareAgent Remains Unchanged

**Important**: The new simplified configuration is only available for the base `Agent` class. `ContextAwareAgent` continues to work exactly as before to maintain 100% backward compatibility:

```python
# ContextAwareAgent - unchanged behavior
from cc_agent.context import ContextAwareAgent

agent = ContextAwareAgent(
    name="Context Agent",
    system_prompt="You are context-aware"
    # Automatically includes pre-configured MCP tools
    # No code changes needed - works exactly as before
)

result = await agent.run("task", mcp_servers=agent.mcp_config)
```

---

## Detailed Configuration System (Advanced)

Based on my analysis of the codebase, here's a comprehensive explanation of how MCP tools are configured in agents:

## Three-Layer Tool System

1. **Standard Tools (Claude Code SDK Built-ins)** - Available to all agents by default:
   - `Task` - Launch sub-agents for complex tasks
   - `Bash` - Execute shell commands
   - `Glob` - File pattern matching
   - `Grep` - Search file contents
   - `LS` - List directory contents
   - `exit_plan_mode` - Exit planning mode
   - `Read` - Read file contents
   - `Edit` - Edit files with find/replace
   - `MultiEdit` - Multiple edits in one operation
   - `Write` - Write files
   - `NotebookRead` / `NotebookEdit` - Jupyter notebook operations
   - `WebFetch` - Fetch web content
   - `TodoRead` / `TodoWrite` - Task management
   - `WebSearch` - Web search functionality

2. **MCP Server Tools** - From `cc_tools` directory, require explicit configuration:
   - `browser` - Browser automation
   - `build_test` - TypeScript compilation testing
   - `dev_server` - Development server management
   - `package_manager` - npm/yarn operations
   - `shadcn` - ShadCN UI components
   - `integration_analyzer` - Code analysis
   - `cwd_reporter` - Working directory reporting
   - `context_manager` - Session management
   - `graphiti` - Knowledge graph operations
   - `mem0` - Memory storage
   - `tree_sitter` - AST analysis
   - `oxc` - Ultra-fast JS/TS linting
   - `ruff` - Ultra-fast Python linting
   - `heroicons` - Icon generation
   - `dalle` - Image generation
   - `unsplash` - Stock photos

3. **MCP Resource Tools** - For managing MCP resources:
   - `ListMcpResourcesTool`
   - `ReadMcpResourceTool`

## Configuration Components

### 1. Allowed Tools List
Specifies which tools the agent can use:

```python
allowed_tools = [
    "Read",           # Standard tool
    "Write",          # Standard tool
    "mcp__oxc",       # MCP tool (automatically added when MCP server configured)
]
```

### 2. MCP Server Configuration Dictionary
Defines how to spawn MCP server processes:

```python
mcp_servers = {
    "oxc": {
        "type": "stdio",     # Communication type (always stdio)
        "command": "uv",     # Command to run (always uv for Python env)
        "args": ["run", "python", "-m", "cc_tools.oxc.server"],
        "env": {             # Optional environment variables
            "SOME_KEY": "value"
        }
    }
}
```

### 3. Automatic Tool Naming Convention
When MCP servers are configured, tools are automatically added with the pattern:
- `mcp__<server_name>` - Allows ALL tools from that server
- `mcp__<server_name>__<tool_name>` - Allows specific tool only

## How It Works Together

1. **Agent Initialization**:
   ```python
   agent = Agent(
       name="My Agent",
       system_prompt="...",
       allowed_tools=["Read", "Write"],  # Explicit allowed tools
       mcp_servers=mcp_servers            # MCP configuration
   )
   ```

2. **Automatic MCP Tool Addition** (base.py:84-89):
   - When `mcp_servers` is provided, the Agent automatically adds `mcp__<server_name>` to `allowed_tools`
   - This happens in the Agent constructor

3. **MCP Server Spawning**:
   - The SDK uses the `mcp_servers` config to spawn STDIO processes
   - `uv run` ensures proper Python environment activation
   - Each server communicates via JSON-RPC over STDIO

4. **Tool Invocation**:
   - Standard tools are directly available
   - MCP tools are accessed through the spawned server processes
   - The SDK handles the communication protocol

## Configuration Examples

### Basic Agent (Standard Tools Only):
```python
agent = Agent(
    name="Simple Agent",
    system_prompt="You help with files",
    allowed_tools=["Read", "Write", "Edit"]
)
```

### Agent with MCP Tools:
```python
mcp_servers = {
    "oxc": {
        "type": "stdio",
        "command": "uv",
        "args": ["run", "python", "-m", "cc_tools.oxc.server"]
    },
    "build_test": {
        "type": "stdio",
        "command": "uv",
        "args": ["run", "python", "-m", "cc_tools.build_test.server"]
    }
}

agent = Agent(
    name="TypeScript Agent",
    system_prompt="You work with TypeScript",
    allowed_tools=["Read", "Write"],  # Standard tools
    mcp_servers=mcp_servers           # MCP tools auto-added
)
# Result: allowed_tools = ["Read", "Write", "mcp__oxc", "mcp__build_test"]
```

### ContextAwareAgent (Auto-configured):
```python
agent = ContextAwareAgent(
    name="Smart Agent",
    system_prompt="You are context-aware"
)
# Automatically includes:
# - Standard tools for context
# - mcp__tree_sitter, mcp__context_manager, mcp__graphiti, etc.
# - Pre-configured MCP servers with environment variables
```

## Key Implementation Details

1. **STDIO Process Management**:
   - All MCP servers use `type: "stdio"` for communication
   - `uv run` ensures consistent Python environment
   - Servers run as child processes of the agent

2. **Environment Variables**:
   - Can be passed in the `env` field of MCP config
   - ContextAwareAgent auto-configures common env vars (OPENAI_API_KEY, FALKORDB_HOST, etc.)

3. **Tool Restriction**:
   - Use `restrict_to_allowed_tools=True` to limit agent to ONLY specified tools
   - This populates `disallowed_tools` with everything except `allowed_tools`

4. **Logging**:
   - MCP server configuration is logged during agent initialization
   - Tool usage is tracked in `AgentResult.tool_uses`

This architecture provides flexibility - you can use simple agents with just standard tools, or create sophisticated agents with multiple MCP servers for specialized functionality.