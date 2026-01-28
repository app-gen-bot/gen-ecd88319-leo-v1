#!/usr/bin/env python3
"""Test all agents to verify they are context-aware."""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from app_factory.agents.stage_2_wireframe.wireframe import WireframeAgent
from app_factory.agents.stage_2_wireframe.qc import QCAgent
from app_factory.agents.stage_2_wireframe.self_improvement import SelfImprovementAgent
from app_factory.agents.stage_2_wireframe.integration_analyzer import IntegrationAnalyzerAgent
from app_factory.agents.stage_2_wireframe.critic import CriticAgent
from app_factory.agents.retrospective import RetrospectiveAgent


async def test_agent_context_awareness(agent_class, agent_name):
    """Test a single agent for context awareness."""
    print(f"\n🧪 Testing {agent_name}")
    print("-" * 40)
    
    test_dir = Path.cwd() / "test_output"
    test_dir.mkdir(exist_ok=True)
    
    try:
        # Create agent
        agent = agent_class(output_dir=test_dir)
        
        # Check context awareness
        has_context = hasattr(agent, 'enable_context_awareness') and agent.enable_context_awareness
        has_mcp = hasattr(agent, 'mcp_config') and len(agent.mcp_config) > 0
        has_context_tools = any(tool in agent.allowed_tools for tool in ["mem0", "graphiti", "context_manager"])
        
        print(f"  ✓ Agent created: {agent.name}")
        print(f"  {'✓' if has_context else '✗'} Context awareness: {has_context}")
        print(f"  {'✓' if has_mcp else '✗'} MCP config: {len(agent.mcp_config) if has_mcp else 0} servers")
        print(f"  {'✓' if has_context_tools else '✗'} Context tools: {has_context_tools}")
        
        return has_context and has_mcp and has_context_tools
        
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False


async def main():
    """Test all agents."""
    print("=" * 60)
    print("🔍 AI App Factory - All Agents Context Awareness Test")
    print("=" * 60)
    
    agents_to_test = [
        (WireframeAgent, "WireframeAgent"),
        (QCAgent, "QCAgent"),
        (SelfImprovementAgent, "SelfImprovementAgent"),
        (IntegrationAnalyzerAgent, "IntegrationAnalyzerAgent"),
        (CriticAgent, "CriticAgent"),
        (RetrospectiveAgent, "RetrospectiveAgent"),
    ]
    
    results = []
    for agent_class, agent_name in agents_to_test:
        result = await test_agent_context_awareness(agent_class, agent_name)
        results.append((agent_name, result))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Summary")
    print("=" * 60)
    
    all_passed = True
    for agent_name, passed in results:
        status = "✅ Context-Aware" if passed else "❌ Not Context-Aware"
        print(f"{agent_name:<30} {status}")
        if not passed:
            all_passed = False
    
    print("\n" + "=" * 60)
    if all_passed:
        print("✅ All agents are context-aware!")
        print("\nContext Awareness Features:")
        print("  - Automatic memory storage (mem0)")
        print("  - Knowledge graph tracking (graphiti)")
        print("  - Session management (context_manager)")
        print("  - Code understanding (tree_sitter)")
        print("  - Pattern analysis (integration_analyzer)")
        print("\nBenefits:")
        print("  - Agents learn from past executions")
        print("  - Prevent duplicate work")
        print("  - Build knowledge over time")
        print("  - Share insights across sessions")
    else:
        print("❌ Some agents are not context-aware")
    
    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))