#!/usr/bin/env python3
"""Test Graphiti MCP with FalkorDB through ContextAwareAgent."""

import asyncio
import sys
import os
from pathlib import Path

# Add the src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from cc_agent import ContextAwareAgent


async def test_graphiti_mcp_with_falkordb():
    """Test Graphiti MCP functionality with FalkorDB backend."""
    
    print("\n🔍 Testing Graphiti MCP with FalkorDB")
    print("=" * 80)
    
    agent = ContextAwareAgent(
        name="GraphitiFalkorTest",
        system_prompt="You are a test agent. Use the graphiti tools to add and search knowledge.",
        allowed_tools=["mcp__graphiti"],
        permission_mode="bypassPermissions",
        enable_context_awareness=True
    )
    
    print("✅ Created ContextAwareAgent with graphiti access")
    
    # Test prompt to add an episode
    prompt = """Use the graphiti add_knowledge_episode tool to add this episode:
    
    content: "The App Factory project now uses FalkorDB as the graph database backend for Graphiti. FalkorDB is a Redis-based graph database that supports the default_db database name that graphiti expects. This resolves the previous compatibility issues with Neo4j Community Edition."
    episode_name: "FalkorDB Integration Success"
    context: "infrastructure_update"
    
    Then use search_knowledge_graph to search for "FalkorDB App Factory" and report what you find."""
    
    result = await agent.run(
        user_prompt=prompt,
        mcp_servers={
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
        
        # Check tool usage
        if result.tool_uses:
            print(f"\n🔧 Tools used: {[t.get('name', 'unknown') for t in result.tool_uses]}")
    else:
        print(f"\n❌ Failed: {result.content}")


async def main():
    """Run the test."""
    # Load environment variables
    from dotenv import load_dotenv
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        load_dotenv(env_path)
        print(f"✅ Loaded environment from {env_path}")
    
    await test_graphiti_mcp_with_falkordb()


if __name__ == "__main__":
    asyncio.run(main())