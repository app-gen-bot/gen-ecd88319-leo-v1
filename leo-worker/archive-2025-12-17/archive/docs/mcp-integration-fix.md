# MCP Integration Fix Documentation

## Problem Summary
MCP (Model Context Protocol) servers were not working with the AI App Factory. The servers would start but no tool calls were reaching them when invoked through the claude-code-sdk.

## Root Cause
The issue was with how the SDK communicates with MCP servers over stdio transport. The servers were starting correctly but the bidirectional communication was not established properly.

## What We Fixed

### 1. Removed Hardcoded Environment Variables
**File**: `src/cc_tools/mem0/server.py`

We removed the hardcoded OpenAI API key and made the configuration load from environment variables properly:

```python
# BEFORE (with hardcoded values):
hardcoded_openai_key = "sk-proj-..."
if not os.getenv("OPENAI_API_KEY"):
    os.environ["OPENAI_API_KEY"] = hardcoded_openai_key

# AFTER (loading from env):
config = MemoryConfig(
    qdrant_url=os.getenv("QDRANT_URL", "http://localhost:6333"),
    qdrant_api_key=os.getenv("QDRANT_API_KEY"),
    qdrant_collection=os.getenv("QDRANT_COLLECTION_NAME", "app_factory_memories"),
    neo4j_uri=os.getenv("NEO4J_URI", "bolt://localhost:7687"),
    neo4j_username=os.getenv("NEO4J_USER", "neo4j"),
    neo4j_password=os.getenv("NEO4J_PASSWORD", "cc-core-password"),
    user_id=os.getenv("MEM0_USER_ID", "app_factory"),
    default_context=os.getenv("MEM0_DEFAULT_CONTEXT", "app_factory")
)
```

### 2. Fixed MCP Tool Naming Convention
**File**: `src/cc_agent/context/context_aware.py`

MCP tools must follow the naming pattern `mcp__<serverName>__<toolName>`. We updated the allowed_tools to use the correct pattern:

```python
# BEFORE:
context_tools = ["mem0", "tree_sitter", "context_manager", "integration_analyzer", "graphiti"]

# AFTER:
context_tools = [
    "mcp__mem0",  # All mem0 tools
    "mcp__tree_sitter",  # All tree_sitter tools
    "mcp__context_manager",  # All context_manager tools
    "mcp__integration_analyzer",  # All integration_analyzer tools
    "mcp__graphiti"  # All graphiti tools
]
```

### 3. Updated MCP Server Configuration
**File**: `src/cc_agent/context/context_aware.py`

We updated how MCP servers are configured to use `uv run` and pass environment variables explicitly:

```python
# Configure MCP servers with proper command and env vars
self.mcp_config.update({
    "mem0": {
        "command": "uv",
        "args": ["run", "mcp-mem0"],
        "env": env_vars  # Pass required env vars
    },
    "tree_sitter": {
        "command": "uv",
        "args": ["run", "mcp-tree-sitter"]
    },
    # ... other servers
})
```

### 4. Added Proper Logging
We added extensive logging to debug MCP server initialization and tool calls:

```python
logger.info(f"MCP servers configured for {self.name}: {list(mcp_servers.keys())}")
logger.info(f"Allowed tools: {self.allowed_tools}")
```

## Testing and Verification

### 1. Direct CLI Test
We verified MCP servers work correctly when called through Claude CLI:
```bash
claude -p "Please add a memory..." --mcp-config mcp-config.json --allowedTools "mcp__mem0__add_memory"
```

### 2. SDK Integration Test
Created test scripts to verify SDK can communicate with MCP servers:
- `test_mcp_simple.py` - Basic MCP integration test
- `test_mcp_minimal.py` - Minimal test for tool usage

### 3. Pipeline Verification
Confirmed MCP tools are being called in the production pipeline by checking logs:
- Memory searches are performed
- Sessions are created
- Tool usage is recorded

## Key Learnings

1. **MCP Tool Naming**: Always use `mcp__<serverName>__<toolName>` pattern
2. **Environment Variables**: Must be passed explicitly in the MCP server config
3. **Command Format**: Use `uv run` to ensure proper Python environment
4. **Stdio Transport**: Can have timing issues but tools still execute
5. **Logging**: Essential for debugging MCP communication issues

## Current Status

✅ MCP servers start correctly
✅ Context awareness tools are accessible
✅ Memory search and storage works
✅ Session tracking works
✅ Tool usage recording works (with minor enum issue)

## Remaining Issues

1. Occasional timeouts with stdio transport (tools still execute)
2. ToolCategory enum error in context_manager (minor issue)