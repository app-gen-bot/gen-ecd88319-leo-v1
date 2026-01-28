#!/usr/bin/env python3
"""Test that ClaudeAgentOptions accepts agents parameter."""

from claude_agent_sdk import ClaudeAgentOptions

# Test 1: Basic options without agents
print("Test 1: Creating ClaudeAgentOptions without agents...")
try:
    options = ClaudeAgentOptions(
        system_prompt="You are a helpful assistant",
        max_turns=5
    )
    print("✅ Basic options work")
except Exception as e:
    print(f"❌ Basic options failed: {e}")
    exit(1)

# Test 2: Options with agents parameter
print("\nTest 2: Creating ClaudeAgentOptions WITH agents parameter...")
try:
    options = ClaudeAgentOptions(
        system_prompt="You are a coordinator",
        max_turns=5,
        agents={
            'research_agent': {
                'description': 'Research complex requirements',
                'prompt': 'You are a senior architect',
                'tools': ['WebSearch', 'WebFetch'],
                'model': 'opus'
            },
            'code_writer': {
                'description': 'Write code based on specifications',
                'prompt': 'You are an expert developer',
                'tools': ['Read', 'Write', 'Edit'],
                'model': 'sonnet'
            }
        }
    )
    print("✅ Agents parameter accepted!")
    print(f"   Options object created: {type(options)}")

    # Check if agents are accessible
    if hasattr(options, 'agents'):
        print(f"   Agents attribute exists: {bool(options.agents)}")
        if options.agents:
            print(f"   Number of agents: {len(options.agents)}")
            print(f"   Agent names: {list(options.agents.keys())}")
    else:
        print("   Note: agents attribute not accessible (may be internal)")

except TypeError as e:
    print(f"❌ Agents parameter NOT accepted: {e}")
    print("\nThis means claude-agent-sdk v0.1.4 still doesn't support agents parameter")
    exit(1)
except Exception as e:
    print(f"❌ Unexpected error: {e}")
    exit(1)

print("\n✅ All tests passed! ClaudeAgentOptions accepts agents parameter.")
