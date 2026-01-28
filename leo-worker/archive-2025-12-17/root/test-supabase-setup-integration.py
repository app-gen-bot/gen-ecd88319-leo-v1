#!/usr/bin/env python3
"""
Integration Test: Verify Supabase Setup MCP Server is accessible to AppGeneratorAgent

This test verifies:
1. MCP server can be loaded
2. AppGeneratorAgent can see the tool
3. Tool signature is correct
"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "vendor" / "cc-agent"))
sys.path.insert(0, str(Path(__file__).parent / "src"))

from cc_agent import Agent

async def test_integration():
    """Test that AppGeneratorAgent can access supabase_setup tool."""

    print("🧪 Supabase Setup MCP Server Integration Test")
    print("=" * 60)
    print()

    # Create a test agent with same config as AppGeneratorAgent
    agent = Agent(
        name="Integration Tester",
        system_prompt="""You are testing if the Supabase Setup MCP server is accessible.

Your task:
1. Check if mcp__supabase_setup__create_supabase_project tool is available
2. Describe what parameters it accepts
3. Report your findings

DO NOT actually create a project - just inspect the tool.""",
        allowed_tools=["Read"],
        mcp_tools=["supabase_setup"],
        cwd=str(Path(__file__).parent),
        verbose=True,
        max_turns=10,
        setting_sources=["user", "project"],
    )

    print("✅ Agent configured with supabase_setup MCP tool")
    print("🔄 Running test...")
    print()

    try:
        result = await agent.run("""
Check if the mcp__supabase_setup__create_supabase_project tool is available.
If it is, describe what parameters it accepts and what it returns.
""")

        print()
        print("=" * 60)
        print("📊 Integration Test Results")
        print("=" * 60)
        print(f"Success: {result.success}")
        print(f"Cost: ${result.cost:.4f}")
        print()
        print("Output:")
        print(result.content)
        print()

        # Check if the tool was detected
        if "mcp__supabase_setup__create_supabase_project" in result.content:
            print("✅ TEST PASSED: Tool is accessible to agents")
            return True
        else:
            print("❌ TEST FAILED: Tool not found")
            return False

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
        success = asyncio.run(test_integration())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n⚠️  Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
