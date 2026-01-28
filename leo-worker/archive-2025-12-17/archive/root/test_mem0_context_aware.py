#!/usr/bin/env python3
"""Test mem0 through ContextAwareAgent MCP integration."""

import asyncio
import sys
import os
from pathlib import Path

# Add the src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from cc_agent import ContextAwareAgent


async def test_mem0_mcp():
    """Test mem0 MCP functionality through ContextAwareAgent."""
    
    print("\n🔍 Testing mem0 MCP with ContextAwareAgent")
    print("=" * 80)
    
    agent = ContextAwareAgent(
        name="Mem0TestAgent",
        system_prompt="You are a test agent. Use the mem0 tools to store and retrieve memories.",
        allowed_tools=["mcp__mem0"],
        permission_mode="bypassPermissions",
        enable_context_awareness=True
    )
    
    print("✅ Created ContextAwareAgent with mem0 access")
    
    # Test prompt to add and search memories
    prompt = """Use the mem0 tools to:
    
    1. First, add this memory: "The App Factory now supports two memory systems: mem0 (using Qdrant for vector search) and graphiti (using FalkorDB for knowledge graphs). Both are accessible through MCP servers."
    
    2. Then search for memories about "memory systems App Factory"
    
    3. Finally, get all memories for the current user
    
    Report what you find at each step."""
    
    result = await agent.run(
        user_prompt=prompt,
        mcp_servers={
            "mem0": {
                "command": "uv",
                "args": ["run", "mcp-mem0"]
            }
        }
    )
    
    if result.success:
        print("\n✅ Result:")
        print(result.content)
        
        # Check tool usage
        if result.tool_uses:
            print(f"\n🔧 Tools used: {[t.get('name', 'unknown') for t in result.tool_uses]}")
    else:
        print(f"\n❌ Failed: {result.content}")


async def test_both_memory_systems():
    """Test both mem0 and graphiti together."""
    
    print("\n\n🔍 Testing Both Memory Systems Together")
    print("=" * 80)
    
    agent = ContextAwareAgent(
        name="DualMemoryAgent",
        system_prompt="You are a test agent with access to both memory systems.",
        allowed_tools=["mcp__mem0", "mcp__graphiti"],
        permission_mode="bypassPermissions",
        enable_context_awareness=True
    )
    
    print("✅ Created ContextAwareAgent with both mem0 and graphiti access")
    
    prompt = """You have access to two memory systems:
    1. mem0 - for vector-based memory search
    2. graphiti - for knowledge graph storage
    
    Please:
    1. Add a memory to mem0 about "FalkorDB integration completed successfully"
    2. Add a knowledge episode to graphiti about "Memory systems integration test"
    3. Search both systems for "integration"
    
    Compare what each system returns."""
    
    result = await agent.run(
        user_prompt=prompt,
        mcp_servers={
            "mem0": {
                "command": "uv",
                "args": ["run", "mcp-mem0"]
            },
            "graphiti": {
                "command": "uv",
                "args": ["run", "mcp-graphiti"],
                "env": {
                    "FALKORDB_HOST": "localhost",
                    "FALKORDB_PORT": "6379"
                }
            }
        }
    )
    
    if result.success:
        print("\n✅ Result:")
        print(result.content)
        
        if result.tool_uses:
            print(f"\n🔧 Tools used: {[t.get('name', 'unknown') for t in result.tool_uses]}")
    else:
        print(f"\n❌ Failed: {result.content}")


async def main():
    """Run all tests."""
    # Load environment variables
    from dotenv import load_dotenv
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        load_dotenv(env_path)
        print(f"✅ Loaded environment from {env_path}")
    
    # Test mem0 alone
    await test_mem0_mcp()
    
    # Test both systems together
    await test_both_memory_systems()


if __name__ == "__main__":
    asyncio.run(main())