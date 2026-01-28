#!/usr/bin/env python3
"""Minimal test of context aware agent."""

import os
import asyncio
from pathlib import Path
from dotenv import load_dotenv

# Load environment FIRST
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path, override=True)

from cc_agent.context import ContextAwareAgent

async def test_minimal():
    """Test minimal context aware agent."""
    print("Creating minimal context aware agent...")
    
    agent = ContextAwareAgent(
        name="Test Agent",
        system_prompt="""You are a test agent. When asked to test memory:
        1. Use search_memories to search for 'test' 
        2. Use add_memory to add 'Test memory working' with context 'test:minimal'
        3. Report what you did""",
        allowed_tools=["mem0"],
        permission_mode="default",
        verbose=True
    )
    
    print(f"\nMCP config: {list(agent.mcp_config.keys())}")
    
    result = await agent.run(
        "Please test the memory system by searching and then adding a test memory",
        mcp_servers=agent.mcp_config
    )
    
    print(f"\nSuccess: {result.success}")
    print(f"Tools used: {[t.get('name', 'unknown') for t in result.tool_uses] if result.tool_uses else 'None'}")
    print(f"Content preview: {result.content[:200]}...")

if __name__ == "__main__":
    asyncio.run(test_minimal())