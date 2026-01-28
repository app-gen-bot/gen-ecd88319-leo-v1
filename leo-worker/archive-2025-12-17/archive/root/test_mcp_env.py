#!/usr/bin/env python3
"""Test MCP server environment variable passing."""

import os
import asyncio
import json
from pathlib import Path
from dotenv import load_dotenv
from cc_agent.context import ContextAwareAgent

# Load environment variables
env_path = Path(__file__).parent / ".env"
print(f"Loading .env from: {env_path}")
load_dotenv(env_path, override=True)

# Check if environment variables are loaded
print("\nEnvironment Variables Check:")
print(f"NEO4J_URI: {os.getenv('NEO4J_URI', 'not set')}")
print(f"NEO4J_USER: {os.getenv('NEO4J_USER', 'not set')}")
print(f"NEO4J_PASSWORD: {'set' if os.getenv('NEO4J_PASSWORD') else 'not set'}")
print(f"QDRANT_URL: {os.getenv('QDRANT_URL', 'not set')}")
print(f"OPENAI_API_KEY: {'set' if os.getenv('OPENAI_API_KEY') else 'not set'}")

async def test_mcp_servers():
    """Test MCP server configuration with environment variables."""
    print("\nCreating ContextAwareAgent...")
    
    agent = ContextAwareAgent(
        name="Test Agent",
        system_prompt="You are a test agent. Use add_memory to store 'Test memory: MCP servers are working with proper environment variables' with context 'test:mcp_env'",
        allowed_tools=["mem0", "graphiti"],
        permission_mode="default",
        verbose=True
    )
    
    print("\nMCP Server Configuration:")
    print(json.dumps(agent.mcp_config, indent=2))
    
    print("\nRunning agent to test memory storage...")
    result = await agent.run(
        "Please store a test memory to verify MCP servers are working with environment variables",
        mcp_servers=agent.mcp_config
    )
    
    print(f"\nResult success: {result.success}")
    print(f"Tools used: {[t.get('name', 'unknown') for t in result.tool_uses] if result.tool_uses else 'None'}")
    
    return result

if __name__ == "__main__":
    asyncio.run(test_mcp_servers())