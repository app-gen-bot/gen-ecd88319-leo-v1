#!/usr/bin/env python3
"""Test script to verify MCP tools are working correctly."""

import asyncio
import json
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

# Test basic imports
try:
    from cc_agent import Agent, ContextAwareAgent
    print("✓ Successfully imported cc_agent components")
except ImportError as e:
    print(f"✗ Failed to import cc_agent: {e}")
    sys.exit(1)


async def test_context_aware_agent():
    """Test basic ContextAwareAgent functionality."""
    print("\nTesting ContextAwareAgent creation...")
    
    try:
        agent = ContextAwareAgent(
            name="Test Context Agent",
            system_prompt="You are a test agent for verifying context awareness.",
            cwd=str(Path.cwd()),
            enable_context_awareness=True,
            verbose=True
        )
        print("✓ ContextAwareAgent created successfully")
        
        # Check MCP configuration
        print("\nMCP Configuration:")
        for tool, config in agent.mcp_config.items():
            print(f"  - {tool}: {config}")
        
        # Check allowed tools
        print("\nContext-aware tools included:")
        context_tools = ["mem0", "tree_sitter", "context_manager", "integration_analyzer", "graphiti"]
        for tool in context_tools:
            if tool in agent.allowed_tools:
                print(f"  ✓ {tool}")
            else:
                print(f"  ✗ {tool} (missing)")
        
        # Check that specialized tools are NOT automatically added
        print("\nSpecialized tools (should be added by specific agents):")
        specialized_tools = ["browser", "build_test", "dev_server"]
        for tool in specialized_tools:
            if tool in agent.allowed_tools:
                print(f"  ✗ {tool} (should not be automatically added)")
            else:
                print(f"  ✓ {tool} (correctly not added)")
        
        # Test that mcp_config is passed correctly
        print("\nTesting MCP server passing...")
        if hasattr(agent, 'mcp_config') and agent.mcp_config:
            print(f"  ✓ MCP config exists with {len(agent.mcp_config)} servers")
        else:
            print("  ✗ MCP config missing")
        
        return True
        
    except Exception as e:
        print(f"✗ Failed to create ContextAwareAgent: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_mcp_executables():
    """Test that MCP executables are accessible."""
    print("\nTesting MCP executables...")
    
    tools = [
        "mcp-mem0",
        "mcp-tree-sitter",
        "mcp-context-manager",
        "mcp-graphiti",
        "mcp-integration-analyzer"
    ]
    
    import subprocess
    
    all_found = True
    for tool in tools:
        try:
            result = subprocess.run(
                ["which", tool],
                capture_output=True,
                text=True
            )
            if result.returncode == 0:
                print(f"  ✓ {tool}: {result.stdout.strip()}")
            else:
                print(f"  ✗ {tool}: not found")
                all_found = False
        except Exception as e:
            print(f"  ✗ {tool}: error checking - {e}")
            all_found = False
    
    return all_found


async def test_environment_variables():
    """Test that required environment variables are set."""
    print("\nChecking environment variables...")
    
    env_vars = {
        "MCP_TOOLS": "Path to MCP tools",
        "MCP_LOG_LEVEL": "Logging level",
        "OPENAI_API_KEY": "OpenAI API key (for embeddings)",
        "NEO4J_URI": "Neo4j connection URI",
        "NEO4J_USER": "Neo4j username",
        "NEO4J_PASSWORD": "Neo4j password"
    }
    
    from dotenv import load_dotenv
    load_dotenv()
    
    for var, description in env_vars.items():
        value = os.getenv(var)
        if value:
            if "KEY" in var or "PASSWORD" in var:
                print(f"  ✓ {var}: ****** ({description})")
            else:
                print(f"  ✓ {var}: {value} ({description})")
        else:
            print(f"  ⚠ {var}: not set ({description})")


async def main():
    """Run all tests."""
    print("=" * 60)
    print("MCP Tools Integration Test")
    print("=" * 60)
    
    # Run tests
    results = []
    
    # Test 1: ContextAwareAgent
    results.append(await test_context_aware_agent())
    
    # Test 2: MCP executables
    results.append(await test_mcp_executables())
    
    # Test 3: Environment variables
    await test_environment_variables()
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    if all(results):
        print("✓ All critical tests passed!")
        print("\nNext steps:")
        print("1. Set OPENAI_API_KEY in .env for memory embeddings")
        print("2. Configure Neo4j if using Graphiti")
        print("3. Run a simple context-aware agent test")
    else:
        print("✗ Some tests failed. Please check the output above.")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())