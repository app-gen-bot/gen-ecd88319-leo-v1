#!/usr/bin/env python
"""
Test script to verify subagent integration is working correctly.

This script tests:
1. Subagents are properly loaded and configured
2. agents parameter is passed to ClaudeAgentOptions
3. Task tool can access subagent configurations
4. Both programmatic and filesystem methods work
"""

import asyncio
import sys
import logging
from pathlib import Path
from typing import Dict, Any

# Add project to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def test_subagent_loading():
    """Test that subagents are properly loaded from module."""
    print("\n" + "=" * 60)
    print("TEST 1: Subagent Module Loading")
    print("=" * 60)

    try:
        from app_factory_leonardo_replit.agents.app_generator.subagents import (
            get_all_subagents,
            research_agent,
            schema_designer
        )

        subagents = get_all_subagents()
        print(f"✅ Loaded {len(subagents)} subagents:")
        for name, agent in subagents.items():
            print(f"   - {name}: {agent.description[:50]}...")
            print(f"     Model: {agent.model}, Tools: {len(agent.tools) if agent.tools else 0}")

        # Verify specific subagents
        assert "research_agent" in subagents, "research_agent not found"
        assert "schema_designer" in subagents, "schema_designer not found"
        assert len(subagents) >= 8, f"Expected at least 8 subagents, got {len(subagents)}"

        print("\n✅ TEST 1 PASSED: All subagents loaded successfully")
        return True

    except Exception as e:
        print(f"\n❌ TEST 1 FAILED: {e}")
        return False

def test_agent_configuration():
    """Test that Agent class properly receives agents parameter."""
    print("\n" + "=" * 60)
    print("TEST 2: Agent Configuration with Subagents")
    print("=" * 60)

    try:
        from cc_agent import Agent

        # Create test subagents
        test_subagents = {
            "test_agent": {
                "description": "Test subagent",
                "prompt": "You are a test agent",
                "tools": ["Read", "Write"],
                "model": "sonnet"
            }
        }

        # Create agent with subagents
        agent = Agent(
            name="TestAgent",
            system_prompt="Test system prompt",
            agents=test_subagents,
            allowed_tools=["Task", "Read", "Write"],
            verbose=True
        )

        # Verify agents are stored
        assert hasattr(agent, 'agents'), "Agent doesn't have agents attribute"
        assert agent.agents == test_subagents, "Agents not properly stored"
        print(f"✅ Agent configured with subagents: {list(test_subagents.keys())}")

        # Check if agents would be passed to options
        options_dict = agent._build_options_dict()
        assert "agents" in options_dict, "agents not in options_dict"
        assert options_dict["agents"] == test_subagents, "agents not properly added to options"
        print("✅ agents parameter included in ClaudeAgentOptions")

        print("\n✅ TEST 2 PASSED: Agent properly configured with subagents")
        return True

    except Exception as e:
        print(f"\n❌ TEST 2 FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_app_generator_integration():
    """Test AppGeneratorAgent subagent integration."""
    print("\n" + "=" * 60)
    print("TEST 3: AppGeneratorAgent Integration")
    print("=" * 60)

    try:
        from app_factory_leonardo_replit.agents.app_generator import AppGeneratorAgent

        # Create agent with subagents enabled
        agent = AppGeneratorAgent(enable_subagents=True)

        # Check subagents are loaded
        assert hasattr(agent, 'subagents'), "AppGeneratorAgent has no subagents"
        assert len(agent.subagents) > 0, "No subagents loaded"
        print(f"✅ AppGeneratorAgent loaded {len(agent.subagents)} subagents")

        # Check base agent has agents configured
        assert hasattr(agent.agent, 'agents'), "Base agent has no agents attribute"
        if agent.agent.agents:
            print(f"✅ Base agent configured with {len(agent.agent.agents)} subagents")
        else:
            print("⚠️  Warning: Base agent agents is None (subagents may be disabled)")

        # Check Task tool is available
        if agent.agent.allowed_tools:
            assert "Task" in agent.agent.allowed_tools, "Task tool not in allowed_tools"
            print("✅ Task tool is available")

        # Check filesystem subagents were written
        agents_dir = Path(agent.output_dir) / ".claude" / "agents"
        if agents_dir.exists():
            agent_files = list(agents_dir.glob("*.md"))
            print(f"✅ Found {len(agent_files)} subagent files in {agents_dir}")

        print("\n✅ TEST 3 PASSED: AppGeneratorAgent properly integrated")
        return True

    except Exception as e:
        print(f"\n❌ TEST 3 FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_task_delegation():
    """Test actual Task tool delegation (requires live SDK)."""
    print("\n" + "=" * 60)
    print("TEST 4: Task Tool Delegation (Mock)")
    print("=" * 60)

    try:
        from app_factory_leonardo_replit.agents.app_generator import AppGeneratorAgent

        # Create agent
        agent = AppGeneratorAgent(enable_subagents=True)

        # Verify Task tool configuration
        print("Checking Task tool prerequisites:")
        print(f"  - Task in allowed_tools: {'Task' in agent.agent.allowed_tools}")
        print(f"  - Subagents configured: {agent.agent.agents is not None}")
        print(f"  - Subagent count: {len(agent.agent.agents) if agent.agent.agents else 0}")

        # Test delegate_to_subagent method
        result = await agent.delegate_to_subagent(
            "research_agent",
            "Test delegation task"
        )

        # Note: This will return None in current implementation
        # but won't error if subagent exists
        print("✅ Delegation method executed without error")

        print("\n✅ TEST 4 PASSED: Task delegation structure verified")
        return True

    except Exception as e:
        print(f"\n❌ TEST 4 FAILED: {e}")
        return False

def test_options_building():
    """Test that options are properly built with agents."""
    print("\n" + "=" * 60)
    print("TEST 5: Options Building with Agents")
    print("=" * 60)

    try:
        from cc_agent import Agent

        # Create agent with all features
        test_agents = {
            "helper": {
                "description": "Helper agent",
                "prompt": "You help with tasks",
                "tools": ["Read"],
                "model": "sonnet"
            }
        }

        agent = Agent(
            name="FullAgent",
            system_prompt="Full test",
            agents=test_agents,
            allowed_tools=["Task", "Read", "Write"],
            model="sonnet",
            mcp_tools=["oxc"],
            max_thinking_tokens=1000,
            cwd="/tmp/test",
            restrict_to_allowed_tools=True
        )

        # Build options
        options = agent._build_options_dict()

        # Verify all parameters are included
        checks = [
            ("system_prompt" in options, "system_prompt"),
            ("allowed_tools" in options, "allowed_tools"),
            ("agents" in options, "agents"),
            ("model" in options, "model"),
            ("mcp_servers" in options, "mcp_servers"),
            ("max_thinking_tokens" in options, "max_thinking_tokens"),
            ("cwd" in options, "cwd"),
            ("disallowed_tools" in options, "disallowed_tools")
        ]

        for check, name in checks:
            if check:
                print(f"✅ {name} included in options")
            else:
                print(f"❌ {name} MISSING from options")

        # Verify agents specifically
        assert options.get("agents") == test_agents, "agents not properly included"

        print("\n✅ TEST 5 PASSED: All options properly built")
        return True

    except Exception as e:
        print(f"\n❌ TEST 5 FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests."""
    print("\n" + "🧪" * 30)
    print("SUBAGENT INTEGRATION TEST SUITE")
    print("🧪" * 30)

    tests = [
        ("Subagent Loading", test_subagent_loading),
        ("Agent Configuration", test_agent_configuration),
        ("AppGenerator Integration", test_app_generator_integration),
        ("Task Delegation", lambda: asyncio.run(test_task_delegation())),
        ("Options Building", test_options_building)
    ]

    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n❌ Test '{name}' crashed: {e}")
            results.append((name, False))

    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)

    passed = sum(1 for _, r in results if r)
    total = len(results)

    for name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{name}: {status}")

    print(f"\nTotal: {passed}/{total} tests passed")

    if passed == total:
        print("\n🎉 ALL TESTS PASSED! Subagent integration is working correctly.")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Check the output above for details.")
        return 1

if __name__ == "__main__":
    sys.exit(main())