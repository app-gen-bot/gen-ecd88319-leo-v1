# MCP Setup Guide for AI App Factory

## Overview
This guide explains how to properly set up MCP (Model Context Protocol) servers in the AI App Factory to enable context-aware agents with memory, knowledge graphs, and session tracking.

## Prerequisites

### 1. Docker Services
Ensure Docker containers are running:
```bash
docker-compose up -d
```

This starts:
- **Neo4j** (port 7687) - For knowledge graphs
- **Qdrant** (port 6333) - For vector storage

### 2. Environment Variables
Create/update `.env` file in project root:
```bash
# Neo4j Configuration (for graphiti)
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=cc-core-password

# Qdrant Configuration (for mem0)
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION_NAME=app_factory_memories

# OpenAI API Key (for mem0 embeddings)
OPENAI_API_KEY=your-openai-api-key-here

# Session tracking
CONTEXT_STORAGE_PATH=/Users/your-username/.cc_context_manager

# Logging
MCP_LOG_LEVEL=INFO
```

## Setting Up MCP Servers in Agents

### 1. Create a Context-Aware Agent

```python
from cc_agent.context import ContextAwareAgent

class MyAgent(ContextAwareAgent):
    def __init__(self):
        super().__init__(
            name="MyAgent",
            system_prompt="Your agent prompt here",
            allowed_tools=[
                # Regular tools
                "Read", "Write", "Glob",
                # MCP tools (use mcp__ prefix!)
                "mcp__mem0",           # All memory tools
                "mcp__graphiti",       # Knowledge graph tools
                "mcp__context_manager" # Session tracking
            ],
            enable_context_awareness=True
        )
```

### 2. Configure MCP Servers Properly

The ContextAwareAgent automatically configures MCP servers, but if you need custom configuration:

```python
import os

# Load environment first!
from dotenv import load_dotenv
load_dotenv(override=True)

# Configure MCP servers
mcp_config = {
    "mem0": {
        "command": "uv",
        "args": ["run", "mcp-mem0"],
        "env": {
            "OPENAI_API_KEY": os.getenv("OPENAI_API_KEY"),
            "NEO4J_URI": os.getenv("NEO4J_URI"),
            "NEO4J_USER": os.getenv("NEO4J_USER"),
            "NEO4J_PASSWORD": os.getenv("NEO4J_PASSWORD"),
            "QDRANT_URL": os.getenv("QDRANT_URL"),
            "QDRANT_COLLECTION_NAME": os.getenv("QDRANT_COLLECTION_NAME"),
            "MEM0_USER_ID": "app_factory",
            "MEM0_DEFAULT_CONTEXT": "app_factory"
        }
    },
    "graphiti": {
        "command": "uv",
        "args": ["run", "mcp-graphiti"],
        "env": {
            "NEO4J_URI": os.getenv("NEO4J_URI"),
            "NEO4J_USER": os.getenv("NEO4J_USER"),
            "NEO4J_PASSWORD": os.getenv("NEO4J_PASSWORD")
        }
    }
}
```

### 3. Key Requirements

#### ✅ DO:
1. **Always use `uv run`** as the command
2. **Pass environment variables explicitly** in the `env` dict
3. **Use correct tool naming**: `mcp__<server>__<tool>` or just `mcp__<server>`
4. **Load dotenv before imports** that use env vars
5. **Check logs** in `logs/<server>_server.log` for debugging

#### ❌ DON'T:
1. Don't hardcode API keys or passwords
2. Don't use bare commands like `mcp-mem0` (always use `uv run`)
3. Don't forget the `mcp__` prefix for tool names
4. Don't assume env vars are automatically passed

## Testing MCP Integration

### 1. Test with Claude CLI
```bash
# Create test config
cat > test-mcp.json << EOF
{
  "mcpServers": {
    "mem0": {
      "command": "uv",
      "args": ["run", "mcp-mem0"]
    }
  }
}
EOF

# Test memory addition
claude -p "Add a memory: Testing MCP setup" \
  --mcp-config test-mcp.json \
  --allowedTools "mcp__mem0__add_memory"

# Test memory search
claude -p "Search for memories about MCP" \
  --mcp-config test-mcp.json \
  --allowedTools "mcp__mem0__search_memories"
```

### 2. Test with Python SDK
```python
import asyncio
from claude_code_sdk import query, ClaudeCodeOptions

async def test_mcp():
    options = ClaudeCodeOptions(
        system_prompt="Test MCP tools",
        allowed_tools=["mcp__mem0"],
        mcp_servers={
            "mem0": {
                "command": "uv",
                "args": ["run", "mcp-mem0"]
            }
        }
    )
    
    async for msg in query("Search for test memories", options):
        print(msg)

asyncio.run(test_mcp())
```

### 3. Check Server Logs
```bash
# Watch mem0 server logs
tail -f logs/mem0_server.log

# Check for tool calls
grep -E "(ADD_MEMORY|SEARCH_MEMORIES)" logs/mem0_server.log
```

## Common Issues and Solutions

### Issue 1: "No MCP servers configured"
**Solution**: Ensure you're passing `mcp_servers` to the agent's run method

### Issue 2: Tools not being called
**Symptoms**: Server starts but no tool calls in logs
**Solution**: 
- Check tool naming (must use `mcp__` prefix)
- Verify allowed_tools includes MCP tools
- Ensure env vars are set correctly

### Issue 3: "Environment variable X is required but not set"
**Solution**: 
- Check `.env` file exists and has the variable
- Ensure `load_dotenv()` is called before using env vars
- Pass env vars explicitly in MCP config

### Issue 4: Timeouts or hanging
**Symptoms**: Pipeline hangs after "Running base agent with MCP servers"
**Note**: This is a known issue with stdio transport, but tools still execute. Check logs to confirm.

## Debugging Checklist

1. ✅ Docker containers running? (`docker ps`)
2. ✅ Environment variables set? (`cat .env`)
3. ✅ MCP servers in logs? (`grep "Starting.*MCP" logs/*.log`)
4. ✅ Tool calls in logs? (`grep "Called" logs/*_server.log`)
5. ✅ Correct tool naming? (must have `mcp__` prefix)
6. ✅ Using `uv run`? (not bare commands)
7. ✅ Env vars passed in config? (not relying on inheritance)

## Example: Complete Context-Aware Agent

```python
from cc_agent.context import ContextAwareAgent
import os

class SmartPRDAgent(ContextAwareAgent):
    def __init__(self):
        super().__init__(
            name="SmartPRDAgent",
            system_prompt="""You are a PRD writer with memory.
            Before writing:
            1. Search memories for similar projects
            2. Check for existing implementations
            3. Learn from past decisions
            After writing:
            1. Store key decisions as memories
            2. Update knowledge graph
            """,
            allowed_tools=[
                "Read", "Write", "Glob",
                "mcp__mem0",
                "mcp__graphiti",
                "mcp__context_manager"
            ],
            enable_context_awareness=True
        )

# Usage
agent = SmartPRDAgent()
result = await agent.run("Create a chat application")
# Agent will automatically search memories, create session, track tools
```

## Verification

After setup, you should see in logs:
```
[SERVER_INIT] Mem0 MCP server module loaded
[INIT] Mem0 initialized with Qdrant at http://localhost:6333
[SEARCH_MEMORIES] Called with query='...', user_id=None, limit=10
[ADD_MEMORY] Created memory <uuid>
[START_SESSION] Starting session for workspace: /path/to/project
```

This confirms MCP integration is working correctly!