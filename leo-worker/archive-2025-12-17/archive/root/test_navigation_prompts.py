#!/usr/bin/env python3
"""Test that navigation prompts and templates have been updated correctly."""

import sys
from pathlib import Path

# Add the src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))


def test_interaction_spec_template():
    """Test that the interaction spec template has navigation completeness section."""
    print("\n🧪 Testing Interaction Spec Template")
    print("=" * 80)
    
    template_path = Path("docs/ai-app-factory/templates/interaction-spec.md")
    
    if not template_path.exists():
        print(f"❌ Template not found at: {template_path}")
        return False
    
    content = template_path.read_text()
    
    checks = {
        "## Complete Navigation & Interaction Map": False,
        "### Route Inventory": False,
        "### Interactive Element Catalog": False,
        "### Modal & Dialog Actions": False,
        "### Navigation Validation Checklist": False,
        "Public Routes": False,
        "Protected Routes": False,
        "Utility Routes": False,
        "/404": False  # Check for actual 404 route in template
    }
    
    for check_item in checks:
        if check_item in content:
            checks[check_item] = True
            print(f"✅ Found: {check_item}")
        else:
            print(f"❌ Missing: {check_item}")
    
    success = all(checks.values())
    print(f"\n{'✅' if success else '❌'} Template test {'PASSED' if success else 'FAILED'}")
    return success


def test_stage1_system_prompt():
    """Test that Stage 1 system prompt includes navigation requirements."""
    print("\n🧪 Testing Stage 1 System Prompt")
    print("=" * 80)
    
    from app_factory.agents.stage_1_interaction_spec.interaction_spec.system_prompt import SYSTEM_PROMPT
    
    checks = {
        "Navigation & Interaction Completeness": False,
        "Complete Navigation & Interaction Map": False,
        "Route Inventory": False,
        "Interactive Element Catalog": False,
        "EVERY interactive element needs an explicit destination": False,
        "404 error": False
    }
    
    for check_item in checks:
        if check_item in SYSTEM_PROMPT:
            checks[check_item] = True
            print(f"✅ Found: {check_item}")
        else:
            print(f"❌ Missing: {check_item}")
    
    success = all(checks.values())
    print(f"\n{'✅' if success else '❌'} System prompt test {'PASSED' if success else 'FAILED'}")
    return success


def test_stage1_user_prompt():
    """Test that Stage 1 user prompt emphasizes navigation completeness."""
    print("\n🧪 Testing Stage 1 User Prompt")
    print("=" * 80)
    
    from app_factory.agents.stage_1_interaction_spec.interaction_spec.user_prompt import create_user_prompt
    
    test_prd = "Test PRD content"
    prompt = create_user_prompt(test_prd)
    
    checks = {
        "Complete Navigation Mapping": False,
        "Create exhaustive route inventory": False,
        "List EVERY interactive element": False,
        "Define 404 behavior": False,
        "If an interaction isn't specified here, it will be broken": False
    }
    
    for check_item in checks:
        if check_item in prompt:
            checks[check_item] = True
            print(f"✅ Found: {check_item}")
        else:
            print(f"❌ Missing: {check_item}")
    
    success = all(checks.values())
    print(f"\n{'✅' if success else '❌'} User prompt test {'PASSED' if success else 'FAILED'}")
    return success


def test_stage1_critic_prompt():
    """Test that Stage 1 critic checks for navigation completeness."""
    print("\n🧪 Testing Stage 1 Critic System Prompt")
    print("=" * 80)
    
    from app_factory.agents.stage_1_interaction_spec.critic.system_prompt import SYSTEM_PROMPT
    
    checks = {
        "Navigation & Interaction Completeness": False,
        "navigation_completeness": False,
        "all_routes_defined": False,
        "all_interactions_mapped": False,
        "missing_destinations": False,
        "vague_actions": False,
        "dropdown_coverage": False
    }
    
    for check_item in checks:
        if check_item in SYSTEM_PROMPT:
            checks[check_item] = True
            print(f"✅ Found: {check_item}")
        else:
            print(f"❌ Missing: {check_item}")
    
    success = all(checks.values())
    print(f"\n{'✅' if success else '❌'} Critic prompt test {'PASSED' if success else 'FAILED'}")
    return success


def test_stage2_wireframe_prompt():
    """Test that Stage 2 wireframe prompt includes navigation verification."""
    print("\n🧪 Testing Stage 2 Wireframe System Prompt")
    print("=" * 80)
    
    from app_factory.agents.stage_2_wireframe.wireframe.system_prompt import SYSTEM_PROMPT
    
    checks = {
        "Phase 0: Navigation Verification": False,
        "Complete Navigation & Interaction Map": False,
        "EVERY route defined in the navigation map": False,
        "Navigation Implementation Guidelines": False,
        "Every Link Must Work": False,
        "404 Handling": False,
        "browser(action=\"open\", headless=false)": False
    }
    
    for check_item in checks:
        if check_item in SYSTEM_PROMPT:
            checks[check_item] = True
            print(f"✅ Found: {check_item}")
        else:
            print(f"❌ Missing: {check_item}")
    
    success = all(checks.values())
    print(f"\n{'✅' if success else '❌'} Wireframe prompt test {'PASSED' if success else 'FAILED'}")
    return success


def test_stage2_critic_prompt():
    """Test that Stage 2 critic includes navigation testing."""
    print("\n🧪 Testing Stage 2 Critic System Prompt")
    print("=" * 80)
    
    from app_factory.agents.stage_2_wireframe.critic.system_prompt import SYSTEM_PROMPT
    
    checks = {
        "Navigation Completeness": False,
        "Navigation Testing": False,
        "Navigation Testing Protocol": False,
        "browser(action=\"open\", headless=false)": False,
        "navigation_report": False,
        "broken_links": False,
        "missing_routes": False
    }
    
    for check_item in checks:
        if check_item in SYSTEM_PROMPT:
            checks[check_item] = True
            print(f"✅ Found: {check_item}")
        else:
            print(f"❌ Missing: {check_item}")
    
    success = all(checks.values())
    print(f"\n{'✅' if success else '❌'} Critic prompt test {'PASSED' if success else 'FAILED'}")
    return success


def test_qc_agent_prompt():
    """Test that QC agent includes navigation audit."""
    print("\n🧪 Testing QC Agent System Prompt")
    print("=" * 80)
    
    from app_factory.agents.stage_2_wireframe.qc.system_prompt import SYSTEM_PROMPT
    
    checks = {
        "COMPREHENSIVE NAVIGATION AUDIT": False,
        "Navigation Audit Protocol": False,
        "NAVIGATION AUDIT RESULTS": False,
        "Complete Navigation & Interaction Map": False,
        "Navigation completeness percentage": False,
        "Dropdown menu coverage": False
    }
    
    for check_item in checks:
        if check_item in SYSTEM_PROMPT:
            checks[check_item] = True
            print(f"✅ Found: {check_item}")
        else:
            print(f"❌ Missing: {check_item}")
    
    success = all(checks.values())
    print(f"\n{'✅' if success else '❌'} QC agent prompt test {'PASSED' if success else 'FAILED'}")
    return success


def test_browser_config():
    """Test that browser is configured for visible mode."""
    print("\n🧪 Testing Browser Configuration")
    print("=" * 80)
    
    from app_factory.config import BROWSER_HEADLESS
    
    print(f"BROWSER_HEADLESS = {BROWSER_HEADLESS}")
    
    if not BROWSER_HEADLESS:
        print("✅ Browser configured for visible mode (headless=False)")
        return True
    else:
        print("❌ Browser still in headless mode")
        return False


def main():
    """Run all prompt and configuration tests."""
    print("\n🏗️ AI App Factory - Navigation Improvements Test")
    print("=" * 80)
    print("Testing that all prompts and templates have been updated for navigation completeness")
    
    tests = [
        test_interaction_spec_template,
        test_stage1_system_prompt,
        test_stage1_user_prompt,
        test_stage1_critic_prompt,
        test_stage2_wireframe_prompt,
        test_stage2_critic_prompt,
        test_qc_agent_prompt,
        test_browser_config
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
        print("\n✅ All navigation improvement tests PASSED!")
    else:
        print("\n❌ Some tests FAILED - review the output above")


if __name__ == "__main__":
    main()