#!/usr/bin/env python3
"""Test that Stage 2 critic and QC understand frontend-only context."""

import sys
from pathlib import Path

# Add the src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))


def test_critic_frontend_context():
    """Test that Stage 2 critic understands frontend-only context."""
    print("\n🧪 Testing Stage 2 Critic Frontend Context")
    print("=" * 80)
    
    from app_factory.agents.stage_2_wireframe.critic.system_prompt import SYSTEM_PROMPT
    
    checks = {
        "CRITICAL CONTEXT: Frontend-Only Implementation": False,
        "ONLY the frontend has been implemented": False,
        "All data is MOCKED/STUBBED": False,
        "NO real backend exists yet": False,
        "DO NOT critique or penalize for": False,
        "Using mock data instead of real data": False,
        "API calls that return static/fake responses": False,
        "You are a CRITIC, not a FIXER": False,
        "You must NOT:": False,
        "Write or modify any code": False,
        "The Writer agent will receive your feedback": False
    }
    
    for check_item in checks:
        if check_item in SYSTEM_PROMPT:
            checks[check_item] = True
            print(f"✅ Found: {check_item}")
        else:
            print(f"❌ Missing: {check_item}")
    
    success = all(checks.values())
    print(f"\n{'✅' if success else '❌'} Critic context test {'PASSED' if success else 'FAILED'}")
    return success


def test_qc_frontend_context():
    """Test that QC agent understands frontend-only context."""
    print("\n🧪 Testing QC Agent Frontend Context")
    print("=" * 80)
    
    from app_factory.agents.stage_2_wireframe.qc.system_prompt import SYSTEM_PROMPT
    
    checks = {
        "CRITICAL CONTEXT: Frontend-Only Implementation": False,
        "ONLY the frontend has been implemented": False,
        "All data is MOCKED/STUBBED": False,
        "NO real backend exists yet": False,
        "Your QC report should NOT flag as issues": False,
        "Mock data being used instead of real data": False,
        "API calls that don't hit real endpoints": False,
        "Your QC report SHOULD flag as issues": False,
        "Missing UI components": False,
        "Broken navigation links": False
    }
    
    for check_item in checks:
        if check_item in SYSTEM_PROMPT:
            checks[check_item] = True
            print(f"✅ Found: {check_item}")
        else:
            print(f"❌ Missing: {check_item}")
    
    success = all(checks.values())
    print(f"\n{'✅' if success else '❌'} QC context test {'PASSED' if success else 'FAILED'}")
    return success


def test_writer_mock_guidance():
    """Test that the writer has proper mock data guidance."""
    print("\n🧪 Testing Stage 2 Writer Mock Data Guidance")
    print("=" * 80)
    
    from app_factory.agents.stage_2_wireframe.wireframe.system_prompt import SYSTEM_PROMPT
    
    checks = {
        "Mock API calls with setTimeout": False,
        "mock data and stubbed API calls": False,
        "fully-styled, interactive Next.js application with stubbed integrations": False,
        "Future phases will connect the real backend": False
    }
    
    for check_item in checks:
        if check_item in SYSTEM_PROMPT:
            checks[check_item] = True
            print(f"✅ Found: {check_item}")
        else:
            print(f"❌ Missing: {check_item}")
    
    success = all(checks.values())
    print(f"\n{'✅' if success else '❌'} Writer mock guidance test {'PASSED' if success else 'FAILED'}")
    return success


def main():
    """Run all Stage 2 context tests."""
    print("\n🏗️ AI App Factory - Stage 2 Frontend Context Test")
    print("=" * 80)
    print("Testing that Stage 2 agents understand frontend-only context")
    
    tests = [
        test_critic_frontend_context,
        test_qc_frontend_context,
        test_writer_mock_guidance
    ]
    
    results = []
    for test in tests:
        try:
            results.append(test())
        except Exception as e:
            print(f"\n❌ Test {test.__name__} failed with error: {e}")
            results.append(False)
    
    print("\n" + "=" * 80)
    print("📊 Test Summary")
    print("=" * 80)
    
    passed = sum(results)
    total = len(results)
    
    print(f"Passed: {passed}/{total}")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    
    if passed == total:
        print("\n✅ All Stage 2 context tests PASSED!")
        print("\nThe Stage 2 agents now understand:")
        print("- Critic won't complain about mock data or missing backend")
        print("- Critic provides feedback only, doesn't fix code")
        print("- QC focuses on frontend issues, not backend functionality")
        print("- Writer knows to use mock data and stubbed APIs")
    else:
        print("\n❌ Some tests FAILED - review the output above")


if __name__ == "__main__":
    main()