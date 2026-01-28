#!/usr/bin/env python3
"""Test the context-aware WireframeAgent after modifications."""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from app_factory.agents.stage_2_wireframe.wireframe.agent import WireframeAgent
from app_factory.agents.stage_2_wireframe.wireframe.config import AGENT_CONFIG
from app_factory.agents.stage_2_wireframe.wireframe.system_prompt import SYSTEM_PROMPT


def test_context_aware_agent_creation():
    """Test that the new context-aware WireframeAgent can be created."""
    print("Testing context-aware WireframeAgent creation...")
    
    try:
        # Create a temporary output directory
        test_output_dir = Path("/tmp/test_wireframe_context")
        test_output_dir.mkdir(exist_ok=True)
        
        # Create the agent with context awareness enabled
        agent = WireframeAgent(output_dir=test_output_dir, enable_context_awareness=True)
        
        # Verify properties
        assert agent.name == AGENT_CONFIG["name"]
        assert agent.output_dir == test_output_dir
        assert agent.cwd == str(test_output_dir)
        assert agent.max_turns == AGENT_CONFIG["max_turns"]
        assert agent.permission_mode == AGENT_CONFIG["permission_mode"]
        assert agent.enable_context_awareness == True
        
        print("✓ Context-aware WireframeAgent created successfully")
        print(f"  - Name: {agent.name}")
        print(f"  - Output dir: {agent.output_dir}")
        print(f"  - Context awareness: {agent.enable_context_awareness}")
        print(f"  - Max turns: {agent.max_turns}")
        
        return True
        
    except Exception as e:
        print(f"✗ Failed to create context-aware WireframeAgent: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_context_tools_included():
    """Test that context-aware tools are included."""
    print("\nTesting context-aware tools inclusion...")
    
    try:
        test_output_dir = Path("/tmp/test_wireframe_context")
        agent = WireframeAgent(output_dir=test_output_dir, enable_context_awareness=True)
        
        # Check for context-aware tools
        context_tools = ["mem0", "tree_sitter", "context_manager", "integration_analyzer"]
        
        for tool in context_tools:
            assert tool in agent.allowed_tools, f"Context tool '{tool}' not found"
        
        # Check original tools are still there
        for tool in AGENT_CONFIG["allowed_tools"]:
            assert tool in agent.allowed_tools, f"Original tool '{tool}' missing"
        
        print("✓ All context-aware tools included")
        print(f"  - Total tools: {len(agent.allowed_tools)}")
        print(f"  - Context tools: {[t for t in context_tools if t in agent.allowed_tools]}")
        print(f"  - Original tools: {AGENT_CONFIG['allowed_tools']}")
        
        return True
        
    except Exception as e:
        print(f"✗ Context tools test failed: {e}")
        return False


def test_mcp_configuration():
    """Test that MCP servers are configured."""
    print("\nTesting MCP configuration...")
    
    try:
        test_output_dir = Path("/tmp/test_wireframe_context")
        agent = WireframeAgent(output_dir=test_output_dir, enable_context_awareness=True)
        
        # Check MCP configuration exists
        assert hasattr(agent, 'mcp_config'), "Agent should have mcp_config"
        assert isinstance(agent.mcp_config, dict), "mcp_config should be a dictionary"
        
        # Check for expected MCP servers
        expected_servers = ["mem0", "tree_sitter", "context_manager", "integration_analyzer"]
        
        for server in expected_servers:
            assert server in agent.mcp_config, f"MCP server '{server}' not configured"
            assert "command" in agent.mcp_config[server], f"MCP server '{server}' missing command"
        
        print("✓ MCP servers properly configured")
        print(f"  - Configured servers: {list(agent.mcp_config.keys())}")
        
        return True
        
    except Exception as e:
        print(f"✗ MCP configuration test failed: {e}")
        return False


def test_backward_compatibility():
    """Test that the agent can be created without context awareness (backward compatibility)."""
    print("\nTesting backward compatibility...")
    
    try:
        test_output_dir = Path("/tmp/test_wireframe_compat")
        test_output_dir.mkdir(exist_ok=True)
        
        # Create agent with context awareness disabled
        agent = WireframeAgent(output_dir=test_output_dir, enable_context_awareness=False)
        
        assert agent.enable_context_awareness == False
        
        print("✓ Backward compatibility maintained")
        print(f"  - Can disable context awareness: {not agent.enable_context_awareness}")
        
        return True
        
    except Exception as e:
        print(f"✗ Backward compatibility test failed: {e}")
        return False


def test_inheritance_chain():
    """Test that WireframeAgent properly inherits from ContextAwareAgent."""
    print("\nTesting inheritance chain...")
    
    try:
        from cc_agent import Agent, ContextAwareAgent
        
        test_output_dir = Path("/tmp/test_wireframe_context")
        agent = WireframeAgent(output_dir=test_output_dir)
        
        # Verify inheritance chain
        assert isinstance(agent, ContextAwareAgent), "Should inherit from ContextAwareAgent"
        assert isinstance(agent, Agent), "Should ultimately inherit from Agent"
        
        # Check for context-aware methods
        assert hasattr(agent, 'track_file_modification'), "Should have context tracking methods"
        assert hasattr(agent, 'track_decision'), "Should have decision tracking"
        
        print("✓ Inheritance chain verified")
        print(f"  - Instance of ContextAwareAgent: {isinstance(agent, ContextAwareAgent)}")
        print(f"  - Instance of Agent: {isinstance(agent, Agent)}")
        print(f"  - Has context methods: True")
        
        return True
        
    except Exception as e:
        print(f"✗ Inheritance test failed: {e}")
        return False


def main():
    """Run all context-aware tests."""
    print("=" * 60)
    print("Context-Aware WireframeAgent Tests")
    print("=" * 60)
    
    tests = [
        test_context_aware_agent_creation,
        test_context_tools_included,
        test_mcp_configuration,
        test_backward_compatibility,
        test_inheritance_chain,
    ]
    
    results = []
    for test in tests:
        results.append(test())
    
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    if all(results):
        print("✓ All context-aware tests passed!")
        print("\nThe context-aware WireframeAgent is working correctly:")
        print("- Inherits from ContextAwareAgent")
        print("- Includes all context-aware tools")
        print("- MCP servers properly configured")
        print("- Backward compatibility maintained")
        print("- Ready for integration testing")
        return 0
    else:
        print("✗ Some tests failed.")
        print("\nPlease fix issues before proceeding.")
        return 1


if __name__ == "__main__":
    sys.exit(main())