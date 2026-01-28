#!/usr/bin/env python3
"""
Advanced Agent Example - Custom MCP configurations and advanced scenarios.

This example shows:
1. Custom MCP server configurations (when you need full control)
2. Combining simplified and advanced approaches
3. Environment variable handling
4. Error handling and validation
"""

import asyncio
import os
from cc_agent import Agent
from cc_agent.context import ContextAwareAgent


async def custom_mcp_configuration():
    """Example using custom MCP server configuration for full control."""
    
    print("🔧 CUSTOM MCP CONFIGURATION EXAMPLE")
    print("-" * 40)
    
    # Custom MCP configuration - full control over servers
    custom_mcp_servers = {
        "oxc": {
            "type": "stdio",
            "command": "uv",
            "args": ["run", "python", "-m", "cc_tools.oxc.server"],
            # Custom environment variables if needed
            "env": {
                "CUSTOM_OXC_CONFIG": "strict_mode"
            }
        },
        "custom_tree_sitter": {
            "type": "stdio", 
            "command": "uv",
            "args": ["run", "mcp-tree-sitter"],
            "env": {
                "TREE_SITTER_DEBUG": "true"
            }
        }
    }
    
    agent = Agent(
        name="Custom Configuration Agent",
        system_prompt="You use custom MCP configurations for specialized needs.",
        mcp_servers=custom_mcp_servers,  # Full control
        verbose=True
    )
    
    print("🛠️  Custom MCP servers configured:", agent.list_mcp_servers())
    
    task = "Analyze the structure of a TypeScript interface and suggest improvements."
    result = await agent.run(task)
    
    return result.success


async def environment_aware_agent():
    """Example showing environment variable validation and handling."""
    
    print("🌍 ENVIRONMENT-AWARE AGENT EXAMPLE")
    print("-" * 40)
    
    # Tools that require environment variables
    env_dependent_tools = ["graphiti", "mem0", "unsplash"]
    
    # Check environment first
    print("🔍 Checking environment variables...")
    missing_env = Agent.validate_mcp_environment(env_dependent_tools)
    
    available_tools = []
    unavailable_tools = []
    
    for tool, missing_vars in missing_env.items():
        if missing_vars:
            unavailable_tools.append(tool)
            print(f"  ⚠️  {tool}: Missing {', '.join(missing_vars)}")
        else:
            available_tools.append(tool)
            print(f"  ✅ {tool}: Environment OK")
    
    if not available_tools:
        print("❌ No environment-dependent tools available. Setting up basic tools instead.")
        available_tools = ["tree_sitter", "oxc"]  # Fallback to tools that don't need env vars
    
    # Create agent with only properly configured tools
    agent = Agent(
        name="Environment Aware Agent",
        system_prompt="You adapt to available environmental resources.",
        mcp_tools=available_tools
    )
    
    print(f"🎯 Using tools: {agent.list_mcp_servers()}")
    
    if "mem0" in available_tools:
        task = "Store and retrieve information about TypeScript best practices using memory."
    elif "graphiti" in available_tools:
        task = "Build a knowledge graph of JavaScript framework relationships."
    else:
        task = "Analyze code structure and provide optimization suggestions."
    
    result = await agent.run(task)
    return result.success


async def context_aware_vs_regular_agent():
    """Compare ContextAwareAgent (unchanged) vs regular Agent (new features)."""
    
    print("🔄 CONTEXT-AWARE vs REGULAR AGENT COMPARISON")
    print("-" * 50)
    
    # ContextAwareAgent - works exactly as before (unchanged)
    print("1️⃣  ContextAwareAgent (unchanged behavior):")
    context_agent = ContextAwareAgent(
        name="Context Agent",
        system_prompt="You are context-aware and use pre-configured tools."
    )
    
    print(f"   📦 Pre-configured tools: {len(context_agent.list_mcp_servers())}")
    print(f"   🔧 Tools: {', '.join(context_agent.list_mcp_servers())}")
    
    # Regular Agent - new simplified configuration
    print("\n2️⃣  Regular Agent (new simplified config):")
    regular_agent = Agent(
        name="Regular Agent",
        system_prompt="You use simplified MCP configuration.",
        mcp_tools=["oxc", "ruff", "tree_sitter", "heroicons"]
    )
    
    print(f"   📦 Configured tools: {len(regular_agent.list_mcp_servers())}")
    print(f"   🔧 Tools: {', '.join(regular_agent.list_mcp_servers())}")
    
    # Both can accomplish similar tasks
    task = "Create a well-structured code example with proper linting."
    
    print("\n🏃‍♂️ Running same task with both agents...")
    
    try:
        # ContextAwareAgent - use existing pattern
        context_result = await context_agent.run(task, mcp_servers=context_agent.mcp_config)
        print(f"   ✅ ContextAwareAgent: {'Success' if context_result.success else 'Failed'}")
    except Exception as e:
        print(f"   ❌ ContextAwareAgent failed: {e}")
    
    try:
        # Regular Agent - new simplified pattern
        regular_result = await regular_agent.run(task)
        print(f"   ✅ Regular Agent: {'Success' if regular_result.success else 'Failed'}")
    except Exception as e:
        print(f"   ❌ Regular Agent failed: {e}")


async def error_handling_and_validation():
    """Demonstrate error handling and validation scenarios."""
    
    print("🚨 ERROR HANDLING AND VALIDATION")
    print("-" * 35)
    
    # 1. Invalid tool name
    print("1️⃣  Testing invalid tool name...")
    try:
        agent = Agent(
            name="Invalid Tools Agent",
            system_prompt="Testing error handling",
            mcp_tools=["invalid_tool", "oxc"]  # invalid_tool doesn't exist
        )
        print("   ❌ Should have failed but didn't")
    except Exception as e:
        print(f"   ✅ Correctly caught error: {type(e).__name__}")
    
    # 2. Conflicting parameters
    print("\n2️⃣  Testing conflicting parameters...")
    try:
        agent = Agent(
            name="Conflicting Agent",
            system_prompt="Testing conflicts",
            mcp_tools=["oxc"],
            mcp_servers={"oxc": {"type": "stdio"}}  # Can't specify both
        )
        print("   ❌ Should have failed but didn't")
    except ValueError as e:
        print(f"   ✅ Correctly caught conflict: {e}")
    
    # 3. Working configuration
    print("\n3️⃣  Testing valid configuration...")
    try:
        agent = Agent(
            name="Valid Agent",
            system_prompt="Testing valid config",
            mcp_tools=["oxc", "ruff"]
        )
        print(f"   ✅ Valid agent created with tools: {agent.list_mcp_servers()}")
    except Exception as e:
        print(f"   ❌ Unexpected error: {e}")


async def performance_comparison():
    """Compare configuration complexity between old and new approaches."""
    
    print("⚡ CONFIGURATION COMPLEXITY COMPARISON")
    print("-" * 45)
    
    # Old approach - lots of boilerplate
    old_approach = '''
# OLD APPROACH - Manual configuration (still works)
mcp_servers = {
    "oxc": {
        "type": "stdio",
        "command": "uv", 
        "args": ["run", "python", "-m", "cc_tools.oxc.server"]
    },
    "tree_sitter": {
        "type": "stdio",
        "command": "uv",
        "args": ["run", "mcp-tree-sitter"] 
    },
    "build_test": {
        "type": "stdio",
        "command": "uv",
        "args": ["run", "python", "-m", "cc_tools.build_test.server"]
    }
}
agent = Agent(name="Agent", ..., mcp_servers=mcp_servers)
'''
    
    # New approach - much simpler
    new_approach = '''
# NEW APPROACH - Simplified configuration
agent = Agent(
    name="Agent", 
    ..., 
    mcp_tools=["oxc", "tree_sitter", "build_test"]
)
'''
    
    print("📊 Lines of code comparison:")
    print(f"   Old approach: {len(old_approach.strip().split(chr(10)))} lines")
    print(f"   New approach: {len(new_approach.strip().split(chr(10)))} lines")
    print(f"   Reduction: {100 - (len(new_approach.strip().split(chr(10))) * 100 // len(old_approach.strip().split(chr(10))))}% fewer lines!")
    
    print("\n📋 Complexity comparison:")
    print("   Old: Requires knowledge of command paths, args, server types")
    print("   New: Just list tool names - registry handles the rest")
    
    print("\n🔧 Maintenance comparison:")
    print("   Old: Must update configs when tools change")
    print("   New: Central registry updates automatically")


async def main():
    """Run all advanced examples."""
    
    print("🎯 CC-AGENT ADVANCED CONFIGURATION EXAMPLES")
    print("=" * 65)
    
    examples = [
        ("Custom MCP Configuration", custom_mcp_configuration),
        ("Environment Validation", environment_aware_agent),
        ("Agent Comparison", context_aware_vs_regular_agent),
        ("Error Handling", error_handling_and_validation),
        ("Performance Comparison", performance_comparison)
    ]
    
    for name, example_func in examples:
        print(f"\n{'=' * 65}")
        print(f"🔨 {name.upper()}")
        print("=" * 65)
        
        try:
            if asyncio.iscoroutinefunction(example_func):
                await example_func()
            else:
                await example_func()
        except Exception as e:
            print(f"❌ Example '{name}' failed: {e}")
        
        print("✅ Example completed")
    
    print(f"\n{'=' * 65}")
    print("✨ All advanced examples completed!")
    print("=" * 65)


if __name__ == "__main__":
    # Run the advanced examples
    asyncio.run(main())