#!/usr/bin/env python3
"""Simple test to check if Agent and MCP tools are working."""

import sys
from pathlib import Path

# Add parent directory to path to import cc_agent
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "vendor" / "cc-agent"))

print("🔍 Testing imports...")

try:
    from cc_agent import Agent
    print("✅ cc_agent.Agent imported successfully")
except Exception as e:
    print(f"❌ Failed to import cc_agent.Agent: {e}")
    sys.exit(1)

print("\n🔍 Testing Agent initialization...")

try:
    agent = Agent(
        name="Simple Test",
        system_prompt="You are a test agent. Just say hello.",
        allowed_tools=["Read"],
        cwd=str(Path(__file__).parent),
        verbose=True,
        max_turns=1,
        setting_sources=["user", "project"],
    )
    print("✅ Agent initialized successfully")
except Exception as e:
    print(f"❌ Failed to initialize Agent: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n🔍 Testing Agent with MCP tools...")

try:
    agent_with_mcp = Agent(
        name="MCP Test",
        system_prompt="You are a test agent with MCP tools.",
        allowed_tools=["Read"],
        mcp_tools=["supabase"],
        cwd=str(Path(__file__).parent),
        verbose=True,
        max_turns=1,
        setting_sources=["user", "project"],
    )
    print("✅ Agent with MCP tools initialized successfully")
except Exception as e:
    print(f"❌ Failed to initialize Agent with MCP tools: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n✅ All basic tests passed!")
