#!/usr/bin/env python3
"""Test the baseline QCAgent before modifications."""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from app_factory.agents.stage_2_wireframe.qc.agent import QCAgent
from app_factory.agents.stage_2_wireframe.qc.config import AGENT_CONFIG


def test_qc_agent_creation():
    """Test that the current QCAgent can be created."""
    print("Testing baseline QCAgent creation...")
    
    try:
        # Create a temporary output directory
        test_output_dir = Path("/tmp/test_qc_output")
        test_output_dir.mkdir(exist_ok=True)
        
        # Create the agent
        agent = QCAgent(output_dir=test_output_dir)
        
        # Verify properties
        assert agent.name == AGENT_CONFIG["name"]
        assert agent.output_dir == test_output_dir
        assert agent.cwd == str(test_output_dir)
        assert agent.max_turns == AGENT_CONFIG["max_turns"]
        assert agent.permission_mode == AGENT_CONFIG["permission_mode"]
        
        # Check allowed tools
        for tool in AGENT_CONFIG["allowed_tools"]:
            assert tool in agent.allowed_tools, f"Tool {tool} not in allowed_tools"
        
        # Verify integration_analyzer is included
        assert "integration_analyzer" in agent.allowed_tools, "integration_analyzer should be in tools"
        
        print("✓ QCAgent created successfully")
        print(f"  - Name: {agent.name}")
        print(f"  - Output dir: {agent.output_dir}")
        print(f"  - CWD: {agent.cwd}")
        print(f"  - Max turns: {agent.max_turns}")
        print(f"  - Allowed tools: {agent.allowed_tools}")
        print(f"  - Has integration_analyzer: Yes")
        
        return True
        
    except Exception as e:
        print(f"✗ Failed to create QCAgent: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_qc_specific_tools():
    """Test that QC-specific tools are present."""
    print("\nTesting QC-specific tools...")
    
    try:
        test_output_dir = Path("/tmp/test_qc_output")
        agent = QCAgent(output_dir=test_output_dir)
        
        # QC agent should have integration_analyzer
        assert "integration_analyzer" in agent.allowed_tools
        
        # Should also have standard tools
        standard_tools = ["Read", "Write", "MultiEdit"]
        for tool in standard_tools:
            assert tool in agent.allowed_tools
        
        # Should have test tools
        test_tools = ["build_test", "browser"]
        for tool in test_tools:
            assert tool in agent.allowed_tools
        
        print("✓ All QC-specific tools present")
        print(f"  - Integration analyzer: ✓")
        print(f"  - File tools: {[t for t in standard_tools if t in agent.allowed_tools]}")
        print(f"  - Test tools: {[t for t in test_tools if t in agent.allowed_tools]}")
        
        return True
        
    except Exception as e:
        print(f"✗ QC tools test failed: {e}")
        return False


def main():
    """Run all baseline tests."""
    print("=" * 60)
    print("Baseline QCAgent Tests")
    print("=" * 60)
    
    tests = [
        test_qc_agent_creation,
        test_qc_specific_tools,
    ]
    
    results = []
    for test in tests:
        results.append(test())
    
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    if all(results):
        print("✓ All baseline tests passed!")
        print("\nThe current QCAgent is working correctly.")
        print("Already includes integration_analyzer tool.")
        print("Safe to proceed with context-aware conversion.")
        return 0
    else:
        print("✗ Some tests failed.")
        print("\nPlease fix issues before proceeding with conversion.")
        return 1


if __name__ == "__main__":
    sys.exit(main())