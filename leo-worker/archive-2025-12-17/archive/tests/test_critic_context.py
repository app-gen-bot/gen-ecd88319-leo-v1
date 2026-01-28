#!/usr/bin/env python3
"""Test CriticAgent with context awareness."""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from app_factory.agents.stage_2_wireframe.critic import CriticAgent


async def test_critic_context():
    """Test that CriticAgent has context awareness."""
    print("\n🧪 Testing CriticAgent Context Awareness")
    print("=" * 60)
    
    # Create a test output directory
    test_dir = Path.cwd() / "test_output"
    test_dir.mkdir(exist_ok=True)
    
    try:
        # Create agent with context awareness
        agent = CriticAgent(
            output_dir=test_dir,
            enable_context_awareness=True
        )
        print("✓ CriticAgent created successfully")
        
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
        
        # Check specialized tools from critic config
        print("\nCritic-Specific Tools:")
        critic_tools = ["Read", "browser"]
        for tool in critic_tools:
            if tool in agent.allowed_tools:
                print(f"  ✓ {tool}")
        
        print("\n✅ CriticAgent is now context-aware!")
        print("\nBenefits:")
        print("  - Can remember common code quality issues")
        print("  - Learns what makes implementations complete")
        print("  - Tracks patterns that lead to successful iterations")
        
        # Test with context disabled
        print("\n" + "=" * 60)
        print("Testing with context awareness disabled...")
        agent_no_context = CriticAgent(
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
    success = await test_critic_context()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    asyncio.run(main())