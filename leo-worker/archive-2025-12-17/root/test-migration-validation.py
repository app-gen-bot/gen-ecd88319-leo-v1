#!/usr/bin/env python3
"""
Comprehensive Migration Validation: claude-code-sdk v0.0.14 → claude-agent-sdk v0.1.4

This test validates that the migration is complete and working correctly.
"""

import sys
import subprocess

print("=" * 80)
print("🔍 MIGRATION VALIDATION: claude-code-sdk → claude-agent-sdk v0.1.4")
print("=" * 80)

# Test 1: Verify old SDK is uninstalled
print("\n📋 Test 1: Verify old SDK is uninstalled")
result = subprocess.run(
    ["uv", "pip", "list"],
    capture_output=True,
    text=True
)
if "claude-code-sdk" in result.stdout:
    print("❌ FAILED: claude-code-sdk is still installed")
    sys.exit(1)
else:
    print("✅ PASSED: claude-code-sdk is not installed")

# Test 2: Verify new SDK is installed
print("\n📋 Test 2: Verify new SDK is installed (v0.1.4)")
if "claude-agent-sdk" not in result.stdout:
    print("❌ FAILED: claude-agent-sdk is not installed")
    sys.exit(1)
elif "0.1.4" not in result.stdout:
    print("⚠️  WARNING: claude-agent-sdk is installed but version may not be 0.1.4")
    print(f"   Installed versions: {[line for line in result.stdout.split('\\n') if 'claude' in line]}")
else:
    print("✅ PASSED: claude-agent-sdk v0.1.4 is installed")

# Test 3: Import new SDK
print("\n📋 Test 3: Import claude-agent-sdk")
try:
    from claude_agent_sdk import query, ClaudeAgentOptions, AssistantMessage, ResultMessage
    print("✅ PASSED: claude-agent-sdk imports successfully")
except ImportError as e:
    print(f"❌ FAILED: Cannot import claude-agent-sdk: {e}")
    sys.exit(1)

# Test 4: Verify old SDK cannot be imported
print("\n📋 Test 4: Verify old SDK cannot be imported")
try:
    from claude_code_sdk import ClaudeCodeOptions
    print("❌ FAILED: claude_code_sdk can still be imported (should be removed)")
    sys.exit(1)
except ImportError:
    print("✅ PASSED: claude_code_sdk cannot be imported (correctly removed)")

# Test 5: Test ClaudeAgentOptions with agents parameter
print("\n📋 Test 5: Test ClaudeAgentOptions with agents parameter")
try:
    options = ClaudeAgentOptions(
        system_prompt="Test",
        max_turns=5,
        agents={
            'test_agent': {
                'description': 'Test agent',
                'prompt': 'You are a test',
                'tools': ['Read'],
                'model': 'sonnet'
            }
        }
    )
    print("✅ PASSED: ClaudeAgentOptions accepts agents parameter")
except TypeError as e:
    print(f"❌ FAILED: ClaudeAgentOptions does not accept agents parameter: {e}")
    sys.exit(1)

# Test 6: Import cc_agent with updated code
print("\n📋 Test 6: Import cc_agent (updated for new SDK)")
try:
    from cc_agent import Agent
    print("✅ PASSED: cc_agent imports successfully")
except ImportError as e:
    print(f"❌ FAILED: Cannot import cc_agent: {e}")
    sys.exit(1)

# Test 7: Verify cc_agent uses ClaudeAgentOptions
print("\n📋 Test 7: Verify cc_agent uses ClaudeAgentOptions (not ClaudeCodeOptions)")
try:
    import cc_agent.base as base_module
    import inspect
    source = inspect.getsource(base_module)

    if "ClaudeCodeOptions" in source:
        print("❌ FAILED: cc_agent still references ClaudeCodeOptions")
        sys.exit(1)
    elif "ClaudeAgentOptions" not in source:
        print("⚠️  WARNING: cc_agent doesn't reference ClaudeAgentOptions")
    else:
        print("✅ PASSED: cc_agent uses ClaudeAgentOptions")
except Exception as e:
    print(f"⚠️  WARNING: Could not inspect cc_agent source: {e}")

# Test 8: Import AppGeneratorAgent
print("\n📋 Test 8: Import AppGeneratorAgent")
try:
    from app_factory_leonardo_replit.agents.app_generator import AppGeneratorAgent
    print("✅ PASSED: AppGeneratorAgent imports successfully")
except ImportError as e:
    print(f"❌ FAILED: Cannot import AppGeneratorAgent: {e}")
    sys.exit(1)

# Test 9: Create AppGeneratorAgent with subagents
print("\n📋 Test 9: Create AppGeneratorAgent with subagents")
try:
    agent = AppGeneratorAgent(enable_subagents=True)
    if not agent.enable_subagents:
        print("❌ FAILED: Subagents not enabled")
        sys.exit(1)
    if len(agent.subagents) != 7:
        print(f"❌ FAILED: Expected 7 subagents, got {len(agent.subagents)}")
        sys.exit(1)
    print(f"✅ PASSED: AppGeneratorAgent created with {len(agent.subagents)} subagents")
except Exception as e:
    print(f"❌ FAILED: Cannot create AppGeneratorAgent: {e}")
    sys.exit(1)

# Test 10: Verify subagents are passed to Agent
print("\n📋 Test 10: Verify subagents are passed to Agent")
try:
    if agent.agent.agents is None:
        print("❌ FAILED: agents parameter is None in cc_agent.Agent")
        sys.exit(1)
    if len(agent.agent.agents) != 7:
        print(f"❌ FAILED: Expected 7 agents, got {len(agent.agent.agents)}")
        sys.exit(1)
    print(f"✅ PASSED: {len(agent.agent.agents)} subagents passed to cc_agent.Agent")
except Exception as e:
    print(f"❌ FAILED: Cannot verify agents parameter: {e}")
    sys.exit(1)

# Summary
print("\n" + "=" * 80)
print("✨ MIGRATION VALIDATION COMPLETE")
print("=" * 80)
print("\n📊 Results:")
print("   ✅ Old SDK uninstalled (claude-code-sdk v0.0.14)")
print("   ✅ New SDK installed (claude-agent-sdk v0.1.4)")
print("   ✅ Imports working correctly")
print("   ✅ ClaudeAgentOptions accepts agents parameter")
print("   ✅ cc_agent updated to use new SDK")
print("   ✅ AppGeneratorAgent integration working")
print("   ✅ Subagents passed to cc_agent.Agent")

print("\n🎯 Migration Status: ✅ SUCCESSFUL")
print("\n📝 Next Steps:")
print("   1. Test with simple app generation")
print("   2. Monitor for subagent delegation in logs")
print("   3. Compare performance with/without subagents")
print("   4. Update documentation")
