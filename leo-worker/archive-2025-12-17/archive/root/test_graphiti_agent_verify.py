#!/usr/bin/env python3
"""Verify graphiti works through ContextAwareAgent after FalkorDB fix."""

import asyncio
import sys
import os
from pathlib import Path

# Add the src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from cc_agent import ContextAwareAgent


async def test_graphiti_after_fix():
    """Test graphiti MCP with FalkorDB through ContextAwareAgent."""
    
    print("\n🔍 Verifying Graphiti MCP with FalkorDB through ContextAwareAgent")
    print("=" * 80)
    
    agent = ContextAwareAgent(
        name="GraphitiVerifyAgent",
        system_prompt="You are a test agent. Use the graphiti tools to verify the FalkorDB integration is working.",
        allowed_tools=["mcp__graphiti"],
        permission_mode="bypassPermissions",
        enable_context_awareness=True
    )
    
    print("✅ Created ContextAwareAgent with graphiti access")
    
    # Test prompt
    prompt = """Use the graphiti tools to:
    
    1. Add a knowledge episode with content: "Graphiti integration verified after migrating from Neo4j to FalkorDB. The system is now working correctly with the ContextAwareAgent."
    episode_name: "Integration Verification"
    
    2. Search for "FalkorDB migration verified"
    
    3. Get graph insights
    
    Report what you find."""
    
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
    
    await test_graphiti_after_fix()


if __name__ == "__main__":
    asyncio.run(main())