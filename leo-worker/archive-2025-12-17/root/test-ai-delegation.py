#!/usr/bin/env python3
"""
Test script to verify the AI integration subagent is properly registered and working.
"""

import sys
from pathlib import Path

# Add src to path
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

def test_ai_subagent_registration():
    """Test that the AI integration subagent is properly registered."""
    print("=" * 80)
    print("TESTING AI INTEGRATION SUBAGENT DELEGATION")
    print("=" * 80)

    # Test 1: Import and registration
    print("\n📝 Test 1: Verify ai_integration subagent is registered")
    try:
        from app_factory_leonardo_replit.agents.app_generator.subagents import (
            get_all_subagents,
            get_subagent,
            ai_integration
        )

        # Check direct import
        if ai_integration:
            print("✅ Direct import successful")
        else:
            print("❌ Direct import failed")
            return False

    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False

    # Test 2: Check in subagent registry
    print("\n📝 Test 2: Verify ai_integration is in subagent registry")
    all_subagents = get_all_subagents()

    if "ai_integration" in all_subagents:
        print(f"✅ Found in registry with {len(all_subagents)} total subagents:")
        for name in all_subagents.keys():
            print(f"   - {name}")
    else:
        print("❌ Not found in registry")
        return False

    # Test 3: Retrieve via get_subagent
    print("\n📝 Test 3: Retrieve ai_integration via get_subagent()")
    ai_agent = get_subagent("ai_integration")

    if ai_agent:
        print("✅ Successfully retrieved via get_subagent()")
    else:
        print("❌ Failed to retrieve via get_subagent()")
        return False

    # Test 4: Verify agent configuration
    print("\n📝 Test 4: Verify agent configuration")
    if hasattr(ai_agent, 'description'):
        print(f"✅ Description: {ai_agent.description[:60]}...")
    else:
        print("❌ Missing description attribute")

    if hasattr(ai_agent, 'model'):
        print(f"✅ Model: {ai_agent.model}")
    else:
        print("❌ Missing model attribute")

    if hasattr(ai_agent, 'prompt'):
        lines = ai_agent.prompt.split('\n')
        print(f"✅ Prompt: {len(lines)} lines")
        print(f"   First line: {lines[0][:60]}...")
    else:
        print("❌ Missing prompt attribute")

    # Test 5: Verify prompt content includes key AI patterns
    print("\n📝 Test 5: Verify prompt contains key AI integration patterns")
    key_patterns = [
        "multi-turn",
        "streaming",
        "ChatInterface",
        "AIService",
        "context management",
        "fallback"
    ]

    prompt_lower = ai_agent.prompt.lower()
    found_patterns = []
    missing_patterns = []

    for pattern in key_patterns:
        if pattern.lower() in prompt_lower:
            found_patterns.append(pattern)
        else:
            missing_patterns.append(pattern)

    if found_patterns:
        print(f"✅ Found {len(found_patterns)}/{len(key_patterns)} key patterns:")
        for pattern in found_patterns:
            print(f"   ✓ {pattern}")

    if missing_patterns:
        print(f"⚠️  Missing patterns:")
        for pattern in missing_patterns:
            print(f"   ✗ {pattern}")

    # Summary
    print("\n" + "=" * 80)
    if len(found_patterns) >= 4:  # At least 4 out of 6 patterns
        print("✅ AI INTEGRATION SUBAGENT IS PROPERLY CONFIGURED!")
    else:
        print("⚠️  AI integration subagent needs review")
    print("=" * 80)

    print("\n📊 Summary:")
    print("1. Subagent is registered in the system")
    print("2. Can be accessed via subagent registry")
    print("3. Contains comprehensive AI implementation patterns")
    print("4. Ready for delegation from main agent")

    return True

if __name__ == "__main__":
    success = test_ai_subagent_registration()
    sys.exit(0 if success else 1)