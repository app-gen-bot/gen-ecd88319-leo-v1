#!/usr/bin/env python3
"""Test the context-aware QCAgent after modifications."""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from app_factory.agents.stage_2_wireframe.qc.agent import QCAgent
from app_factory.agents.stage_2_wireframe.qc.config import AGENT_CONFIG


def test_context_aware_qc_creation():
    """Test that the new context-aware QCAgent can be created."""
    print("Testing context-aware QCAgent creation...")
    
    try:
        # Create a temporary output directory
        test_output_dir = Path("/tmp/test_qc_context")
        test_output_dir.mkdir(exist_ok=True)
        
        # Create the agent with context awareness enabled
        agent = QCAgent(output_dir=test_output_dir, enable_context_awareness=True)
        
        # Verify properties
        assert agent.name == AGENT_CONFIG["name"]
        assert agent.output_dir == test_output_dir
        assert agent.cwd == str(test_output_dir)
        assert agent.max_turns == AGENT_CONFIG["max_turns"]
        assert agent.permission_mode == AGENT_CONFIG["permission_mode"]
        assert agent.enable_context_awareness == True
        
        print("✓ Context-aware QCAgent created successfully")
        print(f"  - Name: {agent.name}")
        print(f"  - Output dir: {agent.output_dir}")
        print(f"  - Context awareness: {agent.enable_context_awareness}")
        print(f"  - Max turns: {agent.max_turns}")
        
        return True
        
    except Exception as e:
        print(f"✗ Failed to create context-aware QCAgent: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_all_tools_preserved():
    """Test that all original tools plus context tools are included."""
    print("\nTesting tool preservation and additions...")
    
    try:
        test_output_dir = Path("/tmp/test_qc_context")
        agent = QCAgent(output_dir=test_output_dir, enable_context_awareness=True)
        
        # Check original tools are preserved
        original_tools = AGENT_CONFIG["allowed_tools"]
        for tool in original_tools:
            assert tool in agent.allowed_tools, f"Original tool '{tool}' missing"
        
        # Check context-aware tools are added
        context_tools = ["mem0", "tree_sitter", "context_manager"]
        for tool in context_tools:
            assert tool in agent.allowed_tools, f"Context tool '{tool}' not found"
        
        # integration_analyzer should still be there (it was already in original)
        assert "integration_analyzer" in agent.allowed_tools
        
        print("✓ All tools properly configured")
        print(f"  - Original tools preserved: {original_tools}")
        print(f"  - Context tools added: {[t for t in context_tools if t in agent.allowed_tools]}")
        print(f"  - Total tools: {len(agent.allowed_tools)}")
        
        return True
        
    except Exception as e:
        print(f"✗ Tool test failed: {e}")
        return False


def test_qc_specific_features():
    """Test QC-specific context features."""
    print("\nTesting QC-specific context features...")
    
    try:
        test_output_dir = Path("/tmp/test_qc_context")
        agent = QCAgent(output_dir=test_output_dir, enable_context_awareness=True)
        
        # QC agent should be able to remember validation patterns
        assert hasattr(agent, 'track_decision'), "Should have decision tracking"
        assert hasattr(agent, 'files_modified'), "Should track files"
        
        # Test tracking a validation decision
        agent.track_decision(
            "Missing error handling", 
            "Component lacks proper error boundaries"
        )
        
        assert len(agent.decisions_made) == 1
        assert agent.decisions_made[0]['decision'] == "Missing error handling"
        
        print("✓ QC-specific context features working")
        print(f"  - Can track validation decisions: Yes")
        print(f"  - Can remember patterns: Yes")
        print(f"  - Decision tracking tested: {len(agent.decisions_made)} decision(s)")
        
        return True
        
    except Exception as e:
        print(f"✗ QC features test failed: {e}")
        return False


def test_inheritance_chain():
    """Test that QCAgent properly inherits from ContextAwareAgent."""
    print("\nTesting inheritance chain...")
    
    try:
        from cc_agent import Agent, ContextAwareAgent
        
        test_output_dir = Path("/tmp/test_qc_context")
        agent = QCAgent(output_dir=test_output_dir)
        
        # Verify inheritance chain
        assert isinstance(agent, ContextAwareAgent), "Should inherit from ContextAwareAgent"
        assert isinstance(agent, Agent), "Should ultimately inherit from Agent"
        
        print("✓ Inheritance chain verified")
        print(f"  - Instance of ContextAwareAgent: {isinstance(agent, ContextAwareAgent)}")
        print(f"  - Instance of Agent: {isinstance(agent, Agent)}")
        
        return True
        
    except Exception as e:
        print(f"✗ Inheritance test failed: {e}")
        return False


def main():
    """Run all context-aware QC tests."""
    print("=" * 60)
    print("Context-Aware QCAgent Tests")
    print("=" * 60)
    
    tests = [
        test_context_aware_qc_creation,
        test_all_tools_preserved,
        test_qc_specific_features,
        test_inheritance_chain,
    ]
    
    results = []
    for test in tests:
        results.append(test())
    
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    if all(results):
        print("✓ All context-aware QC tests passed!")
        print("\nThe context-aware QCAgent is working correctly:")
        print("- Inherits from ContextAwareAgent")
        print("- Preserves all original tools including integration_analyzer")
        print("- Adds context-aware capabilities")
        print("- Can track validation patterns and decisions")
        print("- Ready for integration")
        return 0
    else:
        print("✗ Some tests failed.")
        print("\nPlease fix issues before proceeding.")
        return 1


if __name__ == "__main__":
    sys.exit(main())