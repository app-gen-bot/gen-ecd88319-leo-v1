#!/usr/bin/env python3
"""
POC: Test Custom Supabase Setup MCP Server

This script tests if we can use our custom MCP server to automate
Supabase project setup using the skill's recipe.
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path to import cc_agent
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "vendor" / "cc-agent"))

from cc_agent import Agent

async def test_custom_supabase_mcp():
    """Test the custom Supabase Setup MCP server."""

    print("🧪 Custom Supabase Setup MCP Server POC")
    print("=" * 60)
    print()

    # Get the supabase_setup_server directory
    mcp_server_path = str(Path(__file__).parent / "supabase_setup_server")

    print(f"📁 MCP Server path: {mcp_server_path}")
    print()

    # Create agent with custom Supabase MCP server
    agent = Agent(
        name="Supabase Setup Tester",
        system_prompt="""You are testing a custom Supabase Setup MCP server.

Your task:
1. Check what tools are available from the mcp__supabase_setup server
2. Report what you find

DO NOT actually create a project - just inspect the available tools.""",
        allowed_tools=["Read"],
        mcp_servers={
            "supabase_setup": {
                "type": "stdio",
                "command": "uv",
                "args": ["run", "python", f"{mcp_server_path}/server.py"]
            }
        },
        cwd=str(Path(__file__).parent),
        verbose=True,
        max_turns=10,
        setting_sources=["user", "project"],
    )

    print("✅ Agent configured with custom MCP server")
    print("🔄 Running test...")
    print()

    try:
        result = await agent.run("""
Check what tools are available from the Supabase Setup MCP server.
List the tool names and describe what they do.
""")

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
        success = asyncio.run(test_custom_supabase_mcp())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n⚠️  Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
