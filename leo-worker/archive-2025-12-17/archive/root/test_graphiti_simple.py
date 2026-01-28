#!/usr/bin/env python3
"""Simple test to check if Graphiti MCP tool is working."""

import asyncio
import sys
import os
from pathlib import Path

# Add the src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from cc_agent import Agent


async def test_graphiti_simple():
    """Simple test of Graphiti functionality."""
    
    print("\n🔗 Simple Graphiti Test")
    print("=" * 80)
    
    # Create a basic agent (not ContextAware) to reduce complexity
    agent = Agent(
        name="SimpleGraphitiTest",
        system_prompt="You are a test agent. Use the graphiti tools when asked.",
        allowed_tools=["mcp__graphiti"],
        permission_mode="default"
    )
    
    print("✅ Created agent with graphiti access")
    
    # Simple test prompt
    prompt = """Use the graphiti add_knowledge_episode tool to add this simple episode:
    
    {
        "name": "Test Episode",
        "content": "This is a test episode to verify Graphiti is working.",
        "timestamp": "2025-07-11T18:00:00Z"
    }
    
    Then use get_graph_insights to show what's in the graph."""
    
    result = await agent.run(
        user_prompt=prompt,
        mcp_servers={
            "graphiti": {
                "command": "uv",
                "args": ["run", "mcp-graphiti"],
                "env": {
                    "NEO4J_URI": os.getenv("NEO4J_URI", "bolt://localhost:7687"),
                    "NEO4J_USER": os.getenv("NEO4J_USER", "neo4j"),
                    "NEO4J_PASSWORD": os.getenv("NEO4J_PASSWORD", "cc-core-password")
                }
            }
        }
    )
    
    if result.success:
        print("\n✅ Result:")
        print(result.content)
        
        # Check what tools were used
        if result.tool_uses:
            print(f"\n🔧 Tools used: {[t.get('name', 'unknown') for t in result.tool_uses]}")
    else:
        print(f"\n❌ Failed: {result.content}")


async def check_graphiti_server():
    """Check if Graphiti MCP server is running properly."""
    
    print("\n🔍 Checking Graphiti MCP Server")
    print("=" * 80)
    
    # Test if we can even start the server
    import subprocess
    
    env = os.environ.copy()
    env.update({
        "NEO4J_URI": os.getenv("NEO4J_URI", "bolt://localhost:7687"),
        "NEO4J_USER": os.getenv("NEO4J_USER", "neo4j"),
        "NEO4J_PASSWORD": os.getenv("NEO4J_PASSWORD", "cc-core-password")
    })
    
    try:
        # Try to run the graphiti server and get its info
        result = subprocess.run(
            ["uv", "run", "mcp-graphiti", "--help"],
            capture_output=True,
            text=True,
            env=env,
            timeout=10
        )
        
        if result.returncode == 0:
            print("✅ Graphiti MCP server is available")
            print(f"Output: {result.stdout[:200]}...")
        else:
            print("❌ Graphiti MCP server failed to run")
            print(f"Error: {result.stderr}")
            
    except Exception as e:
        print(f"❌ Error checking server: {e}")


async def main():
    """Run the tests."""
    # Load environment variables
    from dotenv import load_dotenv
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        load_dotenv(env_path)
        print(f"✅ Loaded environment from {env_path}")
    
    # Check server first
    await check_graphiti_server()
    
    # Then run simple test
    await test_graphiti_simple()
    
    # Finally check what's in the database
    print("\n📊 Checking Neo4j database...")
    os.system("uv run python check_graphiti_direct.py")


if __name__ == "__main__":
    asyncio.run(main())