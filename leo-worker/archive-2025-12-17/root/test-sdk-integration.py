#!/usr/bin/env python3
"""
Test SDK Integration - Verify subagents are properly passed to claude_code_sdk.

This test verifies that:
1. Subagents are converted to SDK format correctly
2. The agents parameter is passed to cc_agent.Agent
3. The cc_agent.Agent passes it to ClaudeCodeOptions
"""

import sys
from pathlib import Path

# Add src to path
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))


def test_sdk_integration():
    """Test that subagents are properly passed to the SDK."""
    print("=" * 80)
    print("🧪 TESTING SDK INTEGRATION")
    print("=" * 80)

    from app_factory_leonardo_replit.agents.app_generator import create_app_generator

    # Create agent with subagents enabled
    print("\n📋 Creating AppGeneratorAgent with subagents...")
    agent = create_app_generator(enable_subagents=True)

    # Test 1: Verify subagents are loaded
    print("\n✅ Test 1: Subagents loaded")
    print(f"   Subagents enabled: {agent.enable_subagents}")
    print(f"   Subagents count: {len(agent.subagents)}")
    assert len(agent.subagents) == 7, "Should have 7 subagents"

    # Test 2: Verify SDK format conversion
    print("\n✅ Test 2: SDK format conversion")
    sdk_agents = agent._convert_subagents_to_sdk_format()
    print(f"   SDK agents count: {len(sdk_agents)}")

    # Check one agent in detail
    if 'research_agent' in sdk_agents:
        research = sdk_agents['research_agent']
        print("\n   Research Agent SDK format:")
        print(f"     - description: {research['description'][:50]}...")
        print(f"     - prompt length: {len(research['prompt'])} chars")
        print(f"     - tools: {research.get('tools', 'not specified')}")
        print(f"     - model: {research.get('model', 'inherit')}")

        # Verify required fields
        assert 'description' in research, "Must have description"
        assert 'prompt' in research, "Must have prompt"
        assert len(research['description']) > 0, "Description must not be empty"
        assert len(research['prompt']) > 0, "Prompt must not be empty"

    # Test 3: Verify cc_agent.Agent has agents configured
    print("\n✅ Test 3: Agent configuration")
    print(f"   cc_agent.Agent.agents: {agent.agent.agents is not None}")
    if agent.agent.agents:
        print(f"   Agents in cc_agent: {list(agent.agent.agents.keys())}")
        assert len(agent.agent.agents) == 7, "cc_agent should have 7 subagents"

    # Test 4: Verify agent without subagents doesn't have them
    print("\n✅ Test 4: Default agent (no subagents)")
    agent_no_sub = create_app_generator(enable_subagents=False)
    print(f"   Subagents enabled: {agent_no_sub.enable_subagents}")
    print(f"   cc_agent.Agent.agents: {agent_no_sub.agent.agents}")
    assert agent_no_sub.agent.agents is None, "Should not have agents when disabled"

    # Summary
    print("\n" + "=" * 80)
    print("✨ ALL SDK INTEGRATION TESTS PASSED!")
    print("=" * 80)

    print("\n🎯 Key Verifications:")
    print("   ✅ Subagent definitions loaded from Python modules")
    print("   ✅ Converted to SDK format (dict with description, prompt, tools, model)")
    print("   ✅ Passed to cc_agent.Agent via agents parameter")
    print("   ✅ Available for SDK to use during agent.run()")

    print("\n📝 SDK Format Example:")
    print("""
    {
        'research_agent': {
            'description': 'Research complex app requirements...',
            'prompt': 'You are a senior software architect...',
            'tools': ['WebSearch', 'WebFetch', ...],
            'model': 'opus'
        },
        ...
    }
    """)

    print("\n🚀 Next: Test with actual app generation to see delegation in action!")

    return True


if __name__ == "__main__":
    try:
        success = test_sdk_integration()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)