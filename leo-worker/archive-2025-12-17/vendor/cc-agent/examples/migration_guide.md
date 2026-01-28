# Migration Guide: Adopting Simplified MCP Configuration

This guide helps you understand how to adopt the new simplified MCP configuration system in your agents while maintaining compatibility with existing code.

## Key Changes Summary

✅ **What's New:**
- `mcp_tools` parameter for simplified tool configuration
- Central MCP registry with automatic server setup
- Helper methods for tool discovery and validation
- Environment variable handling with defaults

✅ **What's Unchanged:**
- `ContextAwareAgent` works exactly as before
- Existing `mcp_servers` parameter still works
- All existing code continues to function

## Migration Scenarios

### Scenario 1: New Agent Development (Recommended)

**Use the simplified approach for all new agents:**

```python
# NEW - Recommended for new code
from cc_agent import Agent

agent = Agent(
    name="My New Agent",
    system_prompt="...",
    mcp_tools=["oxc", "tree_sitter", "build_test"]  # Simple!
)

result = await agent.run("task")  # MCP already configured
```

### Scenario 2: Existing Agent Migration (Optional)

**Existing agents can be gradually migrated:**

```python
# OLD - Current approach (still works)
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

agent = Agent(
    name="Existing Agent",
    system_prompt="...",
    mcp_servers=mcp_servers
)

# NEW - Simplified equivalent
agent = Agent(
    name="Existing Agent", 
    system_prompt="...",
    mcp_tools=["oxc", "tree_sitter"]  # Much simpler!
)
```

### Scenario 3: ContextAwareAgent (No Changes)

**ContextAwareAgent users don't need to change anything:**

```python
# This continues to work exactly as before
from cc_agent.context import ContextAwareAgent

agent = ContextAwareAgent(
    name="Context Agent",
    system_prompt="..."
    # Pre-configured MCP tools automatically included
)

result = await agent.run("task", mcp_servers=agent.mcp_config)
```

## Step-by-Step Migration Process

### Step 1: Identify Your Current Configuration

Look at your existing agent configurations:

```python
# If you have this pattern - you can simplify it
mcp_servers = {
    "tool1": {"type": "stdio", "command": "uv", "args": [...]},
    "tool2": {"type": "stdio", "command": "uv", "args": [...]},
    # ...
}
```

### Step 2: Find the Equivalent Tool Names

Use the tool discovery methods:

```python
# Discover what tools are available
available_tools = Agent.list_all_mcp_tools()
for name, description in available_tools.items():
    print(f"{name}: {description}")

# Find tools by category
linting_tools = Agent.list_tools_by_tag("linting")
print(f"Linting tools: {linting_tools}")
```

### Step 3: Replace with Simplified Configuration

```python
# Replace your mcp_servers dict with a simple list
agent = Agent(
    name="Your Agent",
    system_prompt="...",
    mcp_tools=["oxc", "tree_sitter", "build_test"]  # Just the names!
)
```

### Step 4: Remove MCP Config from run() Calls

```python
# OLD - Had to pass MCP config at runtime
result = await agent.run("task", mcp_servers=mcp_config)

# NEW - MCP already configured at init
result = await agent.run("task")
```

## Common Migration Patterns

### Pattern 1: TypeScript/JavaScript Development

```python
# OLD
mcp_servers = {
    "oxc": {"type": "stdio", "command": "uv", "args": ["run", "python", "-m", "cc_tools.oxc.server"]},
    "build_test": {"type": "stdio", "command": "uv", "args": ["run", "python", "-m", "cc_tools.build_test.server"]},
    "tree_sitter": {"type": "stdio", "command": "uv", "args": ["run", "mcp-tree-sitter"]}
}

# NEW
mcp_tools = ["oxc", "build_test", "tree_sitter"]
```

### Pattern 2: Python Development

```python
# OLD  
mcp_servers = {
    "ruff": {"type": "stdio", "command": "uv", "args": ["run", "python", "-m", "cc_tools.ruff.server"]},
    "tree_sitter": {"type": "stdio", "command": "uv", "args": ["run", "mcp-tree-sitter"]}
}

# NEW
mcp_tools = ["ruff", "tree_sitter"]
```

### Pattern 3: Memory/Context-Aware Development

```python
# OLD
mcp_servers = {
    "mem0": {"type": "stdio", "command": "uv", "args": ["run", "mcp-mem0"]},
    "graphiti": {"type": "stdio", "command": "uv", "args": ["run", "mcp-graphiti"]}
}

# NEW
mcp_tools = ["mem0", "graphiti"]
# Environment variables automatically handled!
```

## Environment Variables

### Before: Manual Environment Handling

```python
mcp_servers = {
    "graphiti": {
        "type": "stdio",
        "command": "uv", 
        "args": ["run", "mcp-graphiti"],
        "env": {
            "OPENAI_API_KEY": os.getenv("OPENAI_API_KEY"),
            "FALKORDB_HOST": os.getenv("FALKORDB_HOST", "localhost"),
            "FALKORDB_PORT": os.getenv("FALKORDB_PORT", "6379")
        }
    }
}
```

### After: Automatic Environment Handling

```python
# Environment variables handled automatically with sensible defaults
mcp_tools = ["graphiti"]

# Optional: Validate environment beforehand
missing = Agent.validate_mcp_environment(["graphiti"])
if missing["graphiti"]:
    print(f"Missing env vars: {missing['graphiti']}")
```

## When NOT to Migrate

Keep the existing approach if:

1. **Using ContextAwareAgent**: No migration needed or possible
2. **Custom Server Configurations**: You need non-standard server setups
3. **Working Fine**: Your existing code works and you don't want to change it
4. **Complex Environment**: You have complex environment variable needs

```python
# Keep existing approach for custom configurations
custom_mcp_servers = {
    "custom_oxc": {
        "type": "stdio",
        "command": "custom-command",
        "args": ["custom", "args"],
        "env": {"CUSTOM_CONFIG": "special_value"}
    }
}
```

## Testing Your Migration

### 1. Validate Tool Availability

```python
# Check that tools exist in registry
tools_wanted = ["oxc", "tree_sitter", "build_test"]
try:
    agent = Agent(name="Test", system_prompt="test", mcp_tools=tools_wanted)
    print("✅ All tools available")
except KeyError as e:
    print(f"❌ Missing tool: {e}")
```

### 2. Compare Configurations

```python
# Old approach
old_agent = Agent(name="Old", system_prompt="test", mcp_servers=old_config)
print("Old tools:", old_agent.list_mcp_servers())

# New approach  
new_agent = Agent(name="New", system_prompt="test", mcp_tools=["oxc", "tree_sitter"])
print("New tools:", new_agent.list_mcp_servers())

# Should be identical
assert old_agent.list_mcp_servers() == new_agent.list_mcp_servers()
```

### 3. Test Environment Variables

```python
# Validate environment setup
missing_env = Agent.validate_mcp_environment(["graphiti", "mem0"])
for tool, missing_vars in missing_env.items():
    if missing_vars:
        print(f"⚠️ {tool} needs: {', '.join(missing_vars)}")
    else:
        print(f"✅ {tool} environment OK")
```

## Best Practices for New Code

### 1. Always Use Tool Discovery

```python
# Don't guess - discover what's available
available_tools = Agent.list_all_mcp_tools()
print("Available:", list(available_tools.keys()))

# Find tools by purpose
linting_tools = Agent.list_tools_by_tag("linting")
memory_tools = Agent.list_tools_by_tag("memory")
```

### 2. Validate Environment Early

```python
desired_tools = ["graphiti", "mem0", "dalle"]
missing_env = Agent.validate_mcp_environment(desired_tools)

# Remove tools with missing environment
available_tools = [
    tool for tool, missing in missing_env.items() 
    if not missing
]

if not available_tools:
    # Fallback to tools that don't need env vars
    available_tools = ["tree_sitter", "oxc"]
```

### 3. Use Descriptive Agent Names

```python
# Good - describes purpose
agent = Agent(
    name="TypeScript Linter and Builder", 
    mcp_tools=["oxc", "build_test"]
)

# Bad - generic name
agent = Agent(name="Agent", mcp_tools=["oxc", "build_test"])
```

### 4. Group Related Tools

```python
# Logical groupings
typescript_tools = ["oxc", "build_test", "tree_sitter"]
python_tools = ["ruff", "tree_sitter"]
ui_tools = ["heroicons", "unsplash"]
memory_tools = ["mem0", "graphiti"]

# Use appropriate group for your agent's purpose
agent = Agent(name="TS Dev", mcp_tools=typescript_tools)
```

## Troubleshooting

### Common Issues

1. **"Tool not found" error**
   ```python
   # Check available tools
   available = Agent.list_all_mcp_tools()
   print("Available tools:", list(available.keys()))
   ```

2. **"Cannot specify both mcp_tools and mcp_servers" error**
   ```python
   # Choose one approach, not both
   # Either:
   agent = Agent(mcp_tools=["oxc"])
   # Or:
   agent = Agent(mcp_servers={"oxc": {...}})
   ```

3. **Environment variables not working**
   ```python
   # Validate environment setup
   missing = Agent.validate_mcp_environment(["graphiti"])
   if missing["graphiti"]:
       print("Set these env vars:", missing["graphiti"])
   ```

## Summary

The new simplified MCP configuration system:
- ✅ Reduces boilerplate by 80%+
- ✅ Provides tool discovery and validation
- ✅ Handles environment variables automatically
- ✅ Is 100% backward compatible
- ✅ Makes agent creation much more intuitive

Start using `mcp_tools` for all new agents, and optionally migrate existing ones when convenient.