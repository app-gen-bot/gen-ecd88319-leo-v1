#!/usr/bin/env python3
"""Test script to verify Graphiti integration in context-aware Stage 2 agents."""

import asyncio
import json
import os
import sys
from pathlib import Path
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app_factory.agents.stage_2_wireframe.wireframe import WireframeAgent
from app_factory.agents.stage_2_wireframe.wireframe.config import AGENT_CONFIG


async def test_graphiti_integration():
    """Test that Graphiti is properly integrated in context-aware agents."""
    
    results = {
        "test_time": datetime.now().isoformat(),
        "tests_passed": 0,
        "tests_failed": 0,
        "details": {}
    }
    
    print("=" * 80)
    print("Testing Graphiti Integration in Context-Aware Stage 2 Agents")
    print("=" * 80)
    
    # Test 1: Create context-aware wireframe agent
    print("\n1. Creating context-aware wireframe agent...")
    try:
        # Create a temporary output directory
        output_dir = Path("/tmp/test_graphiti_wireframe")
        output_dir.mkdir(parents=True, exist_ok=True)
        
        agent = WireframeAgent(
            output_dir=output_dir,
            enable_context_awareness=True
        )
        
        print("✓ Successfully created context-aware wireframe agent")
        results["tests_passed"] += 1
        results["details"]["agent_creation"] = "PASSED"
    except Exception as e:
        print(f"✗ Failed to create agent: {e}")
        results["tests_failed"] += 1
        results["details"]["agent_creation"] = f"FAILED: {str(e)}"
        return results
    
    # Test 2: Verify Graphiti in allowed tools
    print("\n2. Checking if 'graphiti' is in allowed_tools...")
    graphiti_found = 'graphiti' in agent.allowed_tools
    
    if graphiti_found:
        print(f"✓ Found 'graphiti' in allowed_tools")
        print(f"   All allowed tools: {agent.allowed_tools}")
        results["tests_passed"] += 1
        results["details"]["graphiti_in_tools"] = "PASSED"
    else:
        print(f"✗ 'graphiti' not found in allowed_tools: {agent.allowed_tools}")
        results["tests_failed"] += 1
        results["details"]["graphiti_in_tools"] = f"FAILED: allowed_tools = {agent.allowed_tools}"
    
    # Test 3: Check MCP configuration
    print("\n3. Inspecting MCP configuration...")
    try:
        if hasattr(agent, 'mcp_config'):
            mcp_servers = list(agent.mcp_config.keys())
            print(f"   MCP servers configured: {mcp_servers}")
            
            # Check if graphiti is in the MCP config
            if 'graphiti' in agent.mcp_config:
                print("✓ Graphiti MCP server is configured")
                print(f"   Graphiti config: {agent.mcp_config['graphiti']}")
                results["tests_passed"] += 1
                results["details"]["graphiti_mcp_config"] = "PASSED"
            else:
                print("✗ Graphiti MCP server not configured")
                results["tests_failed"] += 1
                results["details"]["graphiti_mcp_config"] = "FAILED: Not in MCP config"
                
            results["details"]["mcp_servers"] = mcp_servers
        else:
            print("✗ No MCP configuration found on agent")
            results["tests_failed"] += 1
            results["details"]["graphiti_mcp_config"] = "FAILED: No mcp_config attribute"
            
    except Exception as e:
        print(f"✗ Failed to inspect MCP config: {e}")
        results["tests_failed"] += 1
        results["details"]["mcp_config_inspection"] = f"FAILED: {str(e)}"
    
    # Test 4: Verify context tools are included
    print("\n4. Verifying all context-aware tools...")
    context_tools = ["mem0", "tree_sitter", "context_manager", "integration_analyzer", "graphiti"]
    all_present = True
    
    for tool in context_tools:
        if tool in agent.allowed_tools:
            print(f"   ✓ {tool} is included")
        else:
            print(f"   ✗ {tool} is missing")
            all_present = False
    
    if all_present:
        print("✓ All context-aware tools are included")
        results["tests_passed"] += 1
        results["details"]["context_tools"] = "PASSED"
    else:
        print("✗ Some context-aware tools are missing")
        results["tests_failed"] += 1
        results["details"]["context_tools"] = f"FAILED: Missing some tools"
    
    # Test 5: Run a simple wireframe generation with potential for knowledge graph
    print("\n5. Testing wireframe generation with knowledge graph potential...")
    try:
        # Create a prompt that might benefit from knowledge graph features
        test_prompt = """Create a simple user profile page that shows:
        - User name and avatar
        - A section showing the user's connections/network
        - A knowledge graph visualization of the user's interests and how they relate
        
        This should demonstrate potential use of graph-based data."""
        
        print("   Running agent with test prompt...")
        
        # Run the agent
        result = await agent.run(
            user_prompt=test_prompt,
            max_turns=3  # Limit turns for testing
        )
        
        if result.success:
            print("✓ Agent completed successfully")
            results["tests_passed"] += 1
            results["details"]["agent_run"] = "PASSED"
            
            # Check if any files were created
            created_files = list(output_dir.rglob("*"))
            if created_files:
                print(f"   Created {len(created_files)} files")
                results["details"]["created_files"] = [str(f) for f in created_files if f.is_file()]
            
            # Check agent's turn history for tool usage
            if hasattr(result, 'turn_history') and result.turn_history:
                tools_used = []
                for turn in result.turn_history:
                    if hasattr(turn, 'tool_calls') and turn.tool_calls:
                        for tool_call in turn.tool_calls:
                            tools_used.append(tool_call.tool_name)
                
                results["details"]["tools_used"] = list(set(tools_used))
                print(f"   Tools used during execution: {results['details']['tools_used']}")
                
                # Check if graphiti was used
                if 'graphiti' in tools_used:
                    print("✓ Graphiti tool was used during execution!")
                    results["details"]["graphiti_used"] = True
                else:
                    print("   Note: Graphiti was not used in this test run")
                    results["details"]["graphiti_used"] = False
        else:
            print(f"✗ Agent failed: {result.error}")
            results["tests_failed"] += 1
            results["details"]["agent_run"] = f"FAILED: {result.error}"
            
    except Exception as e:
        print(f"✗ Failed to run agent: {e}")
        results["tests_failed"] += 1
        results["details"]["agent_run"] = f"FAILED: {str(e)}"
    
    # Test 6: Verify agent configuration
    print("\n6. Verifying agent configuration...")
    try:
        agent_config = {
            "name": agent.name,
            "model": agent.model if hasattr(agent, 'model') else 'N/A',
            "allowed_tools": agent.allowed_tools,
            "permission_mode": agent.permission_mode,
            "enable_db_logging": agent.enable_db_logging if hasattr(agent, 'enable_db_logging') else 'N/A',
            "enable_context_awareness": getattr(agent, 'enable_context_awareness', False)
        }
        
        print(f"   Agent configuration:")
        for key, value in agent_config.items():
            if key == 'allowed_tools':
                print(f"     - {key}: {len(value)} tools")
            else:
                print(f"     - {key}: {value}")
        
        results["details"]["agent_config"] = agent_config
        results["tests_passed"] += 1
        
    except Exception as e:
        print(f"✗ Failed to get agent config: {e}")
        results["tests_failed"] += 1
        results["details"]["agent_config"] = f"FAILED: {str(e)}"
    
    # Summary
    print("\n" + "=" * 80)
    print("Test Summary")
    print("=" * 80)
    print(f"Tests Passed: {results['tests_passed']}")
    print(f"Tests Failed: {results['tests_failed']}")
    print(f"Total Tests: {results['tests_passed'] + results['tests_failed']}")
    
    # Save results
    results_file = Path(__file__).parent / "graphiti_integration_results.json"
    with open(results_file, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"\nResults saved to: {results_file}")
    
    return results


def main():
    """Main entry point."""
    try:
        results = asyncio.run(test_graphiti_integration())
        
        # Exit with appropriate code
        if results["tests_failed"] > 0:
            sys.exit(1)
        else:
            sys.exit(0)
            
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nTest failed with error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()