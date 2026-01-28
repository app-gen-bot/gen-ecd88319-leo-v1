#!/usr/bin/env python3
"""Test MCP integration with claude-code-sdk."""

import asyncio
import os
from claude_code_sdk import query, ClaudeCodeOptions

async def test_mcp_integration():
    """Test if MCP servers work with the SDK."""
    
    # Ensure environment is loaded
    from dotenv import load_dotenv
    load_dotenv(override=True)
    
    # Configure MCP servers
    mcp_servers = {
        "mem0": {
            "command": "uv",
            "args": ["run", "mcp-mem0"],
            "env": {
                "OPENAI_API_KEY": os.getenv("OPENAI_API_KEY", ""),
                "NEO4J_URI": "bolt://localhost:7687",
                "NEO4J_USER": "neo4j",
                "NEO4J_PASSWORD": "cc-core-password",
                "QDRANT_URL": "http://localhost:6333",
                "QDRANT_COLLECTION_NAME": "app_factory_memories",
                "MEM0_USER_ID": "app_factory",
                "MEM0_DEFAULT_CONTEXT": "app_factory"
            }
        }
    }
    
    # Test prompt that uses MCP tools
    test_prompt = """Please use the mem0 tools to:
1. First, use mcp__mem0__add_memory to save this memory: "Testing MCP integration with claude-code-sdk"
2. Then, use mcp__mem0__search_memories to search for "MCP integration"
3. Report what you found"""
    
    options = ClaudeCodeOptions(
        system_prompt="You are a test agent. Use the MCP tools as requested.",
        allowed_tools=["mcp__mem0"],  # Allow all mem0 tools
        mcp_servers=mcp_servers,
        max_turns=3
    )
    
    print("Starting MCP integration test...")
    print(f"MCP servers configured: {list(mcp_servers.keys())}")
    print(f"Allowed tools: {options.allowed_tools}")
    print("\nSending prompt to Claude...")
    
    try:
        async for message in query(prompt=test_prompt, options=options):
            print(f"Message type: {type(message).__name__}")
            print(f"Content: {message}")
            print("-" * 50)
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_mcp_integration())