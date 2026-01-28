#!/usr/bin/env python3
"""Quick POC test for Supabase MCP Server."""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path to import cc_agent
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "vendor" / "cc-agent"))

from cc_agent import Agent

async def test_quick():
    """Quick test of Supabase MCP server."""

    print("🧪 Quick Supabase MCP Server Test")
    print("=" * 60)
    print()

    # Create agent with Supabase MCP server
    agent = Agent(
        name="Supabase Quick Test",
        system_prompt="""You are testing the Supabase MCP server.

Your task: List all Supabase organizations I have access to.
Show the organization slug/ID and name for each.

Be concise and just report what you find.""",
        allowed_tools=["Read"],
        mcp_servers={
            "supabase": {
                "type": "http",
                "url": "https://mcp.supabase.com/mcp"
            }
        },
        cwd=str(Path(__file__).parent),
        verbose=True,
        max_turns=100,
        setting_sources=["user", "project"],
    )

    print("✅ Agent configured")
    print("🔄 Running test...")
    print()

    try:
        result = await agent.run("List all Supabase organizations.")

        print()
        print("=" * 60)
        print("📊 Test Results")
        print("=" * 60)
        print(f"Success: {result.success}")
        print(f"Cost: ${result.cost:.4f}")
        print()
        print("Output:")
        print(result.content)
        print()

        return result.success

    except Exception as e:
        print()
        print("=" * 60)
        print(f"❌ Error: {e}")
        print("=" * 60)
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    try:
        success = asyncio.run(test_quick())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n⚠️  Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
