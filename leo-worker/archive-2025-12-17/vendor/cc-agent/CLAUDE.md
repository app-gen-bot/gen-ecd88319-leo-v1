# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The `cc_agent` module provides a base framework for creating AI agents that work with Claude Code. It offers two main agent types: `Agent` for basic functionality and `ContextAwareAgent` for context management across sessions.

## Agent Architecture

### Base Agent Class

The `Agent` class (`base.py`) provides the foundation for all agents:

- Wraps the Claude Code SDK with structured execution patterns
- Handles API retries with exponential backoff
- Manages tool permissions and MCP server integration
- Provides dual logging (console + file) with appropriate truncation
- Returns structured `AgentResult` objects with content, cost, and metadata

### ContextAwareAgent

The `ContextAwareAgent` (`context/context_aware.py`) extends the base agent with:

- **Automatic MCP Integration**: Pre-configured with context management tools
- **Session Tracking**: Captures file modifications, decisions, and completion states
- **Knowledge Storage**: Transforms code into architectural descriptions for memory storage
- **Context Loading**: Retrieves relevant previous session context before execution

## Key Components

### Agent Execution Pattern

All agents follow this execution flow:
1. Initialize with system prompt, allowed tools, and configuration
2. Call `agent.run(user_prompt)` - MCP config is set at initialization
3. Agent handles MCP server initialization automatically
4. Returns `AgentResult` with structured output

### MCP Configuration (NEW - Simplified)

The framework now provides two ways to configure MCP tools:

#### Option 1: Simplified Configuration (Recommended for New Code)
```python
from cc_agent import Agent

# Just list the tools you want - registry handles the details
agent = Agent(
    name="TypeScript Agent",
    system_prompt="You work with TypeScript",
    mcp_tools=["oxc", "tree_sitter", "build_test"]  # Simple!
)

# No need to pass MCP config to run() - it's already configured
result = await agent.run("Check my code")
```

#### Option 2: Full Control (For Advanced Use Cases)
```python
# Full MCP server configuration (same as before)
mcp_servers = {
    "oxc": {
        "type": "stdio",
        "command": "uv",
        "args": ["run", "python", "-m", "cc_tools.oxc.server"]
    }
}

agent = Agent(
    name="Custom Agent",
    system_prompt="You are custom",
    mcp_servers=mcp_servers
)
```

#### Available MCP Tools

Use these helper methods to discover available tools:

```python
# List all available MCP tools with descriptions
tools = Agent.list_all_mcp_tools()
print("Available tools:", list(tools.keys()))

# Find tools by category
linting_tools = Agent.list_tools_by_tag("linting")  # ['oxc', 'ruff']
memory_tools = Agent.list_tools_by_tag("memory")    # ['mem0', 'graphiti']

# Check if environment is properly configured
missing = Agent.validate_mcp_environment(["graphiti", "mem0"])
if any(missing.values()):
    print("Missing environment variables!")
```

### ContextAwareAgent (Unchanged)

**Important**: ContextAwareAgent continues to work exactly as before for full backward compatibility:

```python
# ContextAwareAgent - unchanged behavior
agent = ContextAwareAgent(
    name="Context Agent", 
    system_prompt="You are a context-aware agent"
    # Automatically includes: tree_sitter, context_manager, graphiti, etc.
    # Uses hardcoded MCP configurations - no changes to existing behavior
)

# Existing code continues to work without modifications
result = await agent.run("task", mcp_servers=agent.mcp_config)
```

### Agent Compatibility

- **New Agent class**: Can use either `mcp_tools` (simplified) or `mcp_servers` (full control)
- **ContextAwareAgent class**: Unchanged - uses hardcoded MCP configurations as before
- **All existing code**: Continues to work without any modifications

### Error Handling and Retries

The retry handler (`retry_handler.py`) provides:
- Exponential backoff for API overload errors (60s, 120s, 240s, 480s, 960s)
- Special handling for async generators (like Claude Code SDK queries)
- User-friendly countdown timers during retry delays
- Automatic detection of retryable vs non-retryable errors

### Logging System

Dual logging setup (`logging.py`):
- **Console**: Clean output without timestamps for user readability
- **File**: Detailed logs with timestamps in `logs/` directory
- **Truncation**: Different length limits for console vs file output
- **Daily Rotation**: Log files named with date stamps

## Usage Patterns

### Basic Agent Usage

```python
from cc_agent import Agent

agent = Agent(
    name="File Processor",
    system_prompt="You process files efficiently",
    allowed_tools=["Read", "Write", "Edit"],
    cwd="/workspace"
)

result = await agent.run("Process the config files")
print(f"Success: {result.success}, Cost: ${result.cost:.4f}")
```

### Agent with MCP Tools (NEW - Simplified)

```python
from cc_agent import Agent

# NEW: Use mcp_tools for simplified configuration
agent = Agent(
    name="TypeScript Developer",
    system_prompt="You develop TypeScript applications",
    mcp_tools=["oxc", "tree_sitter", "build_test", "heroicons"],  # Simple!
    cwd="/workspace"
)

# MCP tools are automatically configured - just run the agent
result = await agent.run("Create a React component with proper linting")
print(f"Success: {result.success}, Cost: ${result.cost:.4f}")

# You can also check what tools are available
print("Available tools:", agent.list_available_tools())
print("MCP servers configured:", agent.list_mcp_servers())
```

### Context-Aware Agent Usage (Unchanged)

```python
from cc_agent.context import ContextAwareAgent

# ContextAwareAgent works exactly as before - no code changes needed
agent = ContextAwareAgent(
    name="Development Assistant",
    system_prompt="You help with development tasks",
    cwd="/workspace"
)

result = await agent.run(
    "Implement user authentication",
    mcp_servers=agent.mcp_config  # Uses pre-configured MCP servers
)
```

### Working Directory Handling

Agents automatically create working directories if they don't exist:
- Prevents misleading "Claude Code not found" errors
- Uses absolute paths for consistency
- Creates parent directories as needed

## Environment Variables

Context-aware agents require these environment variables:

```bash
# Core functionality
OPENAI_API_KEY=your-key-here

# Context storage
CONTEXT_STORAGE_PATH=~/.cc_context_manager

# Knowledge graph (Graphiti)
FALKORDB_HOST=localhost
FALKORDB_PORT=6379
FALKORDB_DATABASE=default_db

# Optional: Browser automation
BROWSER_HEADLESS=false

# Optional: Image services
UNSPLASH_ACCESS_KEY=your-key-here
UNSPLASH_SAVE_DIR=./stock_photos
```

## Memory and Context Management

### Knowledge Transformation

ContextAwareAgent automatically transforms content for memory storage:

```python
# ✅ Good - Will be stored
"Authentication service validates JWT tokens using RSA-256 algorithm with 24-hour expiration"

# ❌ Bad - Will be rejected  
"def auth(): return jwt.verify(token)"
```

### Context Patterns

Use consistent context patterns for knowledge storage:
- `architecture:*` - High-level design decisions
- `implementation:*` - Specific implementation details
- `decision:*` - Technical choices and trade-offs
- `file:*` - File-specific knowledge
- `function:*` - Function-specific knowledge

### Session Persistence

Sessions are automatically tracked in `.agent_context/session_*.json` files containing:
- Task description and timing
- Files modified during session
- Decisions made and rationale
- Tool usage patterns

## Testing and Development

### Running Tests

This module does not include tests. When creating agents, test them using:

```python
# Test basic functionality
result = await agent.run("Simple task")
assert result.success

# Test with MCP servers
result = await agent.run("Complex task", mcp_servers=config)
assert result.tool_uses  # Verify tools were used
```

### Debugging

Enable verbose logging and check log files:
- Console output shows progress and results
- File logs contain detailed debugging information
- MCP server logs available in individual log files

## Integration with App Factory

This module is used throughout the AI App Factory pipeline:
- Each stage uses specialized agents built on this framework
- Context awareness enables continuity across pipeline stages
- MCP integration provides access to development tools
- Retry handling ensures reliability during long-running pipeline operations