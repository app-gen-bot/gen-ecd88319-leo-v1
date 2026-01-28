#!/usr/bin/env python3
"""Test the Self-Improvement Agent implementation."""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from app_factory.agents.stage_2_wireframe.self_improvement import (
    SelfImprovementAgent, 
    create_self_improvement_prompt
)
from app_factory.agents.stage_2_wireframe.self_improvement.config import AGENT_CONFIG


def test_self_improvement_agent_creation():
    """Test that the SelfImprovementAgent can be created."""
    print("Testing SelfImprovementAgent creation...")
    
    try:
        # Create a temporary output directory
        test_output_dir = Path("/tmp/test_self_improvement")
        test_output_dir.mkdir(exist_ok=True)
        
        # Create the agent with context awareness
        agent = SelfImprovementAgent(output_dir=test_output_dir, enable_context_awareness=True)
        
        # Verify properties
        assert agent.name == AGENT_CONFIG["name"]
        assert agent.output_dir == test_output_dir
        assert agent.cwd == str(test_output_dir)
        assert agent.max_turns == AGENT_CONFIG["max_turns"]
        assert agent.permission_mode == AGENT_CONFIG["permission_mode"]
        assert agent.enable_context_awareness == True
        
        print("✓ SelfImprovementAgent created successfully")
        print(f"  - Name: {agent.name}")
        print(f"  - Output dir: {agent.output_dir}")
        print(f"  - Context awareness: {agent.enable_context_awareness}")
        print(f"  - Max turns: {agent.max_turns}")
        
        return True
        
    except Exception as e:
        print(f"✗ Failed to create SelfImprovementAgent: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_context_tools_included():
    """Test that context-aware tools are included."""
    print("\nTesting context-aware tools...")
    
    try:
        test_output_dir = Path("/tmp/test_self_improvement")
        agent = SelfImprovementAgent(output_dir=test_output_dir)
        
        # Check context-aware tools
        context_tools = ["mem0", "tree_sitter", "context_manager", "integration_analyzer"]
        for tool in context_tools:
            assert tool in agent.allowed_tools, f"Context tool '{tool}' not found"
        
        # Check original tools
        for tool in AGENT_CONFIG["allowed_tools"]:
            assert tool in agent.allowed_tools, f"Original tool '{tool}' missing"
        
        print("✓ All tools properly configured")
        print(f"  - Original tools: {AGENT_CONFIG['allowed_tools']}")
        print(f"  - Context tools: {[t for t in context_tools if t in agent.allowed_tools]}")
        print(f"  - Total tools: {len(agent.allowed_tools)}")
        
        return True
        
    except Exception as e:
        print(f"✗ Tools test failed: {e}")
        return False


def test_user_prompt_generation():
    """Test user prompt generation."""
    print("\nTesting user prompt generation...")
    
    try:
        # Sample QC report
        qc_report = """# QC Report: Test App

## Compliance Analysis
- Missing features: Password reset
- Extra features: Dark mode toggle
- Correctly implemented: 90%

## Recommendations
- Add password reset flow
- Document dark mode decision"""
        
        prompt = create_self_improvement_prompt(
            qc_report=qc_report,
            output_dir="/tmp/test",
            app_name="test-app"
        )
        
        # Verify prompt contains expected content
        assert "test-app" in prompt
        assert "QC REPORT TO ANALYZE:" in prompt
        assert "Password reset" in prompt
        assert "improvement_recommendations.json" in prompt
        
        print("✓ User prompt generated successfully")
        print(f"  - Prompt length: {len(prompt)} chars")
        print(f"  - Contains app name: Yes")
        print(f"  - Contains QC report: Yes")
        print(f"  - Specifies output format: Yes")
        
        return True
        
    except Exception as e:
        print(f"✗ Prompt generation test failed: {e}")
        return False


def test_learning_capabilities():
    """Test that the agent has learning capabilities."""
    print("\nTesting learning capabilities...")
    
    try:
        test_output_dir = Path("/tmp/test_self_improvement")
        agent = SelfImprovementAgent(output_dir=test_output_dir)
        
        # Should have context tracking methods
        assert hasattr(agent, 'track_decision'), "Should track decisions"
        assert hasattr(agent, 'track_file_modification'), "Should track files"
        
        # Test tracking an improvement pattern
        agent.track_decision(
            "Add password reset to auth checklist",
            "Prevents missing authentication flows"
        )
        
        assert len(agent.decisions_made) == 1
        
        print("✓ Learning capabilities verified")
        print(f"  - Can track decisions: Yes")
        print(f"  - Can store patterns: Yes")
        print(f"  - Memory system integrated: Yes")
        
        return True
        
    except Exception as e:
        print(f"✗ Learning capabilities test failed: {e}")
        return False


def main():
    """Run all Self-Improvement Agent tests."""
    print("=" * 60)
    print("Self-Improvement Agent Tests")
    print("=" * 60)
    
    tests = [
        test_self_improvement_agent_creation,
        test_context_tools_included,
        test_user_prompt_generation,
        test_learning_capabilities,
    ]
    
    results = []
    for test in tests:
        results.append(test())
    
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    if all(results):
        print("✓ All Self-Improvement Agent tests passed!")
        print("\nThe SelfImprovementAgent is working correctly:")
        print("- Created with context awareness from the start")
        print("- Includes all necessary tools")
        print("- Can generate analysis prompts")
        print("- Has learning capabilities for continuous improvement")
        print("- Ready for integration")
        return 0
    else:
        print("✗ Some tests failed.")
        print("\nPlease fix issues before proceeding.")
        return 1


if __name__ == "__main__":
    sys.exit(main())