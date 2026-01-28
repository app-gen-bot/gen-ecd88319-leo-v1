#!/usr/bin/env python3
"""
POC: Test Supabase MCP Server for Project Setup

This script tests if we can use the official Supabase MCP server
to replace the bash-based supabase-project-setup skill.

Requirements:
- Supabase account with at least one organization
- Claude Agent SDK with MCP support
"""

import asyncio
import os
from pathlib import Path

# Add parent directory to path to import cc_agent
import sys
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "vendor" / "cc-agent"))

from cc_agent import Agent

# Configuration
TEST_PROJECT_NAME = "mcp-test-project"
TEST_REGION = "us-east-1"

async def test_supabase_mcp():
    """Test the Supabase MCP server capabilities."""

    print("🧪 Supabase MCP Server POC")
    print("=" * 60)
    print()

    # Create agent with Supabase MCP server
    agent = Agent(
        name="Supabase MCP Tester",
        system_prompt="""You are testing the Supabase MCP server.

Your tasks:
1. List all Supabase organizations and show their details
2. List all existing projects
3. (Optional) Create a test project if user confirms
4. (Optional) Apply a simple migration to the project
5. Retrieve API keys for the project

Be thorough and report all results clearly.""",
        allowed_tools=[
            "Read",
            "Write",
        ],
        mcp_tools=[
            "supabase",  # Official Supabase MCP server
        ],
        cwd=str(Path(__file__).parent),
        verbose=True,
        max_turns=20,
        setting_sources=["user", "project"],  # Enable skills if any
    )

    print("✅ Agent configured with Supabase MCP server")
    print()

    # Test 1: List organizations
    print("📋 Test 1: List Organizations")
    print("-" * 60)

    result1 = await agent.run("""
List all Supabase organizations I have access to.
Show the organization slug/ID and name for each.
""")

    print("\n✅ Test 1 Complete")
    print(f"Cost: ${result1.cost:.4f}")
    print(f"Success: {result1.success}")
    print("\nResult:")
    print(result1.content)
    print()

    # Test 2: List projects
    print("📋 Test 2: List Existing Projects")
    print("-" * 60)

    result2 = await agent.run("""
List all existing Supabase projects.
Show the project name, reference ID, region, and status for each.
""")

    print("\n✅ Test 2 Complete")
    print(f"Cost: ${result2.cost:.4f}")
    print(f"Success: {result2.success}")
    print("\nResult:")
    print(result2.content)
    print()

    # Test 3: Get project details (if any exist)
    print("📋 Test 3: Get Project API Configuration")
    print("-" * 60)

    result3 = await agent.run("""
For the first project in my account (if any exist):
1. Get the API URL
2. Get the publishable keys (anon and service_role)
3. Show what database connection string format would be used

If no projects exist, just say so.
""")

    print("\n✅ Test 3 Complete")
    print(f"Cost: ${result3.cost:.4f}")
    print(f"Success: {result3.success}")
    print("\nResult:")
    print(result3.content)
    print()

    # Summary
    print()
    print("=" * 60)
    print("📊 POC Summary")
    print("=" * 60)
    print()
    print(f"✅ Test 1 (List Organizations): {'Success' if result1.success else 'Failed'}")
    print(f"✅ Test 2 (List Projects): {'Success' if result2.success else 'Failed'}")
    print(f"✅ Test 3 (Get API Config): {'Success' if result3.success else 'Failed'}")
    print()
    print(f"Total Cost: ${result1.cost + result2.cost + result3.cost:.4f}")
    print()

    # Write results to file
    results_file = Path(__file__).parent / "test-results.md"
    with open(results_file, "w") as f:
        f.write("# Supabase MCP Server POC Results\n\n")
        f.write(f"**Date**: {asyncio.get_event_loop().time()}\n\n")
        f.write("## Test 1: List Organizations\n\n")
        f.write(f"**Status**: {'✅ Success' if result1.success else '❌ Failed'}\n\n")
        f.write(f"**Cost**: ${result1.cost:.4f}\n\n")
        f.write(f"**Result**:\n```\n{result1.content}\n```\n\n")
        f.write("## Test 2: List Projects\n\n")
        f.write(f"**Status**: {'✅ Success' if result2.success else '❌ Failed'}\n\n")
        f.write(f"**Cost**: ${result2.cost:.4f}\n\n")
        f.write(f"**Result**:\n```\n{result2.content}\n```\n\n")
        f.write("## Test 3: Get API Configuration\n\n")
        f.write(f"**Status**: {'✅ Success' if result3.success else '❌ Failed'}\n\n")
        f.write(f"**Cost**: ${result3.cost:.4f}\n\n")
        f.write(f"**Result**:\n```\n{result3.content}\n```\n\n")
        f.write(f"## Summary\n\n")
        f.write(f"**Total Cost**: ${result1.cost + result2.cost + result3.cost:.4f}\n\n")
        f.write(f"**All Tests Passed**: {result1.success and result2.success and result3.success}\n")

    print(f"📄 Results written to: {results_file}")
    print()

    return result1.success and result2.success and result3.success

if __name__ == "__main__":
    try:
        success = asyncio.run(test_supabase_mcp())
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
