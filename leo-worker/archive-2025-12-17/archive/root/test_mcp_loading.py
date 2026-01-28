#!/usr/bin/env python3
"""Test MCP server loading and tool availability."""

import asyncio
import sys
import os
from pathlib import Path

# Add the src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from cc_agent import Agent


async def test_mcp_tools_visibility():
    """Test what MCP tools are visible to the agent."""
    
    print("\n🔍 Testing MCP Tools Visibility")
    print("=" * 80)
    
    # Create agent with both mem0 and graphiti
    agent = Agent(
        name="MCPToolsTest",
        system_prompt="List all available tools, especially MCP tools.",
        allowed_tools=["mcp__mem0", "mcp__graphiti", "ListMcpResourcesTool"],
        permission_mode="bypassPermissions"
    )
    
    print("✅ Created Agent with mem0 and graphiti access")
    
    # Ask agent to list tools
    prompt = """Please:
    1. List all available MCP tools (tools starting with mcp__)
    2. Use ListMcpResourcesTool to check MCP resources
    3. Report what you find"""
    
    mcp_config = {
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
    
    print(f"\n📋 MCP Configuration:")
    print(f"  - mem0: {mcp_config['mem0']['command']} {' '.join(mcp_config['mem0']['args'])}")
    print(f"  - graphiti: {mcp_config['graphiti']['command']} {' '.join(mcp_config['graphiti']['args'])}")
    
    result = await agent.run(
        user_prompt=prompt,
        mcp_servers=mcp_config
    )
    
    if result.success:
        print("\n✅ Result:")
        print(result.content)
        
        if result.tool_uses:
            print(f"\n🔧 Tools used: {[t.get('name', 'unknown') for t in result.tool_uses]}")
    else:
        print(f"\n❌ Failed: {result.content}")


async def test_mem0_direct_call():
    """Try to call mem0 tools directly."""
    
    print("\n\n🔍 Testing Direct mem0 Tool Call")
    print("=" * 80)
    
    agent = Agent(
        name="Mem0DirectTest",
        system_prompt="You must use mem0 tools.",
        allowed_tools=["mcp__mem0"],
        permission_mode="bypassPermissions"
    )
    
    prompt = """Directly call the mcp__mem0__add_memory tool with these parameters:
    - content: "Direct test of mem0 MCP tool"
    - user_id: "direct_test"
    
    Report exactly what happens."""
    
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
    
    # Test MCP tools visibility
    await test_mcp_tools_visibility()
    
    # Test direct mem0 call
    await test_mem0_direct_call()


if __name__ == "__main__":
    asyncio.run(main())