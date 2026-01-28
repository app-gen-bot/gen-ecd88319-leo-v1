#!/usr/bin/env python3
"""Test the baseline WireframeAgent before modifications."""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from app_factory.agents.stage_2_wireframe.wireframe.agent import WireframeAgent
from app_factory.agents.stage_2_wireframe.wireframe.config import AGENT_CONFIG
from app_factory.agents.stage_2_wireframe.wireframe.system_prompt import SYSTEM_PROMPT


def test_wireframe_agent_creation():
    """Test that the current WireframeAgent can be created."""
    print("Testing baseline WireframeAgent creation...")
    
    try:
        # Create a temporary output directory
        test_output_dir = Path("/tmp/test_wireframe_output")
        test_output_dir.mkdir(exist_ok=True)
        
        # Create the agent
        agent = WireframeAgent(output_dir=test_output_dir)
        
        # Verify properties
        assert agent.name == AGENT_CONFIG["name"]
        assert agent.output_dir == test_output_dir
        assert agent.cwd == str(test_output_dir)
        assert agent.max_turns == AGENT_CONFIG["max_turns"]
        assert agent.permission_mode == AGENT_CONFIG["permission_mode"]
        
        # Check allowed tools
        for tool in AGENT_CONFIG["allowed_tools"]:
            assert tool in agent.allowed_tools, f"Tool {tool} not in allowed_tools"
        
        print("✓ WireframeAgent created successfully")
        print(f"  - Name: {agent.name}")
        print(f"  - Output dir: {agent.output_dir}")
        print(f"  - CWD: {agent.cwd}")
        print(f"  - Max turns: {agent.max_turns}")
        print(f"  - Allowed tools: {agent.allowed_tools}")
        
        return True
        
    except Exception as e:
        print(f"✗ Failed to create WireframeAgent: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_agent_inheritance():
    """Test that WireframeAgent properly inherits from Agent."""
    print("\nTesting agent inheritance...")
    
    try:
        from cc_agent import Agent
        
        test_output_dir = Path("/tmp/test_wireframe_output")
        agent = WireframeAgent(output_dir=test_output_dir)
        
        # Verify inheritance
        assert isinstance(agent, Agent), "WireframeAgent should inherit from Agent"
        assert hasattr(agent, 'run'), "Agent should have run method"
        assert hasattr(agent, 'system_prompt'), "Agent should have system_prompt"
        
        print("✓ Inheritance verified")
        print(f"  - Instance of Agent: {isinstance(agent, Agent)}")
        print(f"  - Has run method: {hasattr(agent, 'run')}")
        print(f"  - System prompt length: {len(agent.system_prompt)} chars")
        
        return True
        
    except Exception as e:
        print(f"✗ Inheritance test failed: {e}")
        return False


def test_system_prompt():
    """Test that system prompt is properly set."""
    print("\nTesting system prompt configuration...")
    
    try:
        test_output_dir = Path("/tmp/test_wireframe_output")
        agent = WireframeAgent(output_dir=test_output_dir)
        
        # Check that system prompt contains expected content
        expected_keywords = ["Next.js", "ShadCN", "dark mode", "wireframe"]
        
        for keyword in expected_keywords:
            assert keyword in agent.system_prompt, f"System prompt missing '{keyword}'"
        
        print("✓ System prompt properly configured")
        print(f"  - Contains all expected keywords")
        print(f"  - First 100 chars: {agent.system_prompt[:100]}...")
        
        return True
        
    except Exception as e:
        print(f"✗ System prompt test failed: {e}")
        return False


def main():
    """Run all baseline tests."""
    print("=" * 60)
    print("Baseline WireframeAgent Tests")
    print("=" * 60)
    
    tests = [
        test_wireframe_agent_creation,
        test_agent_inheritance,
        test_system_prompt,
    ]
    
    results = []
    for test in tests:
        results.append(test())
    
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    if all(results):
        print("✓ All baseline tests passed!")
        print("\nThe current WireframeAgent is working correctly.")
        print("Safe to proceed with context-aware conversion.")
        return 0
    else:
        print("✗ Some tests failed.")
        print("\nPlease fix issues before proceeding with conversion.")
        return 1


if __name__ == "__main__":
    sys.exit(main())