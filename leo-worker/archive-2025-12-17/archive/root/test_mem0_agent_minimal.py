#!/usr/bin/env python3
"""Minimal test of mem0 through agent."""

import asyncio
import sys
import os
from pathlib import Path

# Add the src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from cc_agent import Agent
from dotenv import load_dotenv

# Load environment
load_dotenv()


async def test_mem0_minimal():
    """Minimal test of mem0."""
    
    print("\n🔍 Minimal mem0 Test")
    print("=" * 80)
    
    # Create the simplest possible agent
    agent = Agent(
        name="Mem0Min",
        system_prompt="Use mem0 tools only.",
        allowed_tools=["mcp__mem0__add_memory", "mcp__mem0__search_memories"],
        permission_mode="bypassPermissions"
    )
    
    print("✅ Created Agent")
    
    # Very simple prompt
    prompt = "Add a memory with content 'test memory' for user 'test_user'"
    
    print(f"📝 Prompt: {prompt}")
    
    # MCP configuration
    mcp_servers = {
        "mem0": {
            "command": "uv",
            "args": ["run", "mcp-mem0"]
        }
    }
    
    print("🔌 Starting with MCP servers...")
    
    try:
        result = await agent.run(
            user_prompt=prompt,
            mcp_servers=mcp_servers
        )
        
        print(f"\n{'✅' if result.success else '❌'} Success: {result.success}")
        print(f"📄 Content: {result.content[:200]}...")
        
        if result.tool_uses:
            print(f"🔧 Tools: {result.tool_uses}")
            
    except Exception as e:
        print(f"❌ Exception: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_mem0_minimal())