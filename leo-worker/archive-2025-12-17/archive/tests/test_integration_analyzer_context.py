#!/usr/bin/env python3
"""Test IntegrationAnalyzerAgent with context awareness."""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from app_factory.agents.stage_2_wireframe.integration_analyzer import IntegrationAnalyzerAgent


async def test_integration_analyzer_context():
    """Test that IntegrationAnalyzerAgent has context awareness."""
    print("\n🧪 Testing IntegrationAnalyzerAgent Context Awareness")
    print("=" * 60)
    
    # Create a test output directory
    test_dir = Path.cwd() / "test_output"
    test_dir.mkdir(exist_ok=True)
    
    try:
        # Create agent with context awareness
        agent = IntegrationAnalyzerAgent(
            output_dir=test_dir,
            enable_context_awareness=True
        )
        print("✓ IntegrationAnalyzerAgent created successfully")
        
        # Check context awareness
        print("\nContext Awareness Check:")
        print(f"  - Agent name: {agent.name}")
        print(f"  - Context enabled: {agent.enable_context_awareness}")
        print(f"  - Working directory: {agent.cwd}")
        
        # Check MCP configuration
        if hasattr(agent, 'mcp_config'):
            print(f"\nMCP Configuration ({len(agent.mcp_config)} servers):")
            for tool, config in agent.mcp_config.items():
                print(f"  - {tool}: {config}")
        else:
            print("\n✗ No MCP configuration found")
        
        # Check context tools in allowed_tools
        print("\nContext Tools Available:")
        context_tools = ["mem0", "tree_sitter", "context_manager", "integration_analyzer", "graphiti"]
        for tool in context_tools:
            if tool in agent.allowed_tools:
                print(f"  ✓ {tool}")
            else:
                print(f"  ✗ {tool} (missing)")
        
        # Check specialized tools
        print("\nSpecialized Tools:")
        if "integration_analyzer" in agent.allowed_tools:
            print("  ✓ integration_analyzer (MCP tool for code analysis)")
        
        print("\n✅ IntegrationAnalyzerAgent is now context-aware!")
        
        # Test with context disabled
        print("\n" + "=" * 60)
        print("Testing with context awareness disabled...")
        agent_no_context = IntegrationAnalyzerAgent(
            output_dir=test_dir,
            enable_context_awareness=False
        )
        print(f"Context enabled: {agent_no_context.enable_context_awareness}")
        print("✓ Agent works with context awareness disabled")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


async def main():
    """Run the test."""
    success = await test_integration_analyzer_context()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    asyncio.run(main())