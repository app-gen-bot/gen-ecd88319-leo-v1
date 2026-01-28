#!/usr/bin/env python3
"""
Simple Agent Example - Using the NEW simplified MCP configuration.

This example shows how to create an agent with MCP tools using the new
simplified `mcp_tools` parameter instead of manually configuring MCP servers.
"""

import asyncio
from cc_agent import Agent


async def typescript_development_agent():
    """Create and use an agent for TypeScript development with simplified MCP config."""
    
    # NEW: Simple approach - just list the tools you want
    agent = Agent(
        name="TypeScript Developer",
        system_prompt="""You are an expert TypeScript developer. You help with:
        - Writing clean, well-structured TypeScript code
        - Linting code with fast tools
        - Validating TypeScript compilation
        - Adding appropriate icons to React components
        - Analyzing code structure for improvements
        """,
        mcp_tools=[
            "oxc",         # Ultra-fast TypeScript/JavaScript linting
            "build_test",  # TypeScript compilation testing
            "tree_sitter", # Code analysis and AST parsing
            "heroicons"    # React icons for UI components
        ],
        cwd="/tmp/demo",  # Working directory
        verbose=True      # Show detailed logs
    )
    
    # Show what tools were automatically configured
    print("🔧 Configured MCP tools:", agent.list_mcp_servers())
    print("📋 All available tools:", agent.list_available_tools())
    
    # Run the agent - MCP tools are already configured!
    task = """
    I need to create a simple React component for a user profile card.
    The component should:
    1. Accept props for name, email, and avatar URL
    2. Use proper TypeScript types
    3. Include appropriate icons from heroicons
    4. Be properly linted and validated
    
    Please create the component and ensure it compiles correctly.
    """
    
    print("🚀 Running TypeScript development task...")
    result = await agent.run(task)
    
    if result.success:
        print("✅ Task completed successfully!")
        print(f"💰 Cost: ${result.cost:.4f}")
        print(f"🛠️  Tools used: {len(result.tool_uses)} tool calls")
        
        # Show a preview of the result
        if len(result.content) > 500:
            print("📄 Result preview:")
            print(result.content[:500] + "...")
        else:
            print("📄 Result:")
            print(result.content)
    else:
        print("❌ Task failed")
        print("Error:", result.metadata.get("error", "Unknown error"))


async def python_development_agent():
    """Create and use an agent for Python development."""
    
    # Different tools for Python development
    agent = Agent(
        name="Python Developer",
        system_prompt="You are a Python expert focused on clean, well-linted code.",
        mcp_tools=[
            "ruff",        # Ultra-fast Python linting
            "tree_sitter"  # Code analysis
        ]
    )
    
    print("🐍 Python agent configured with tools:", agent.list_mcp_servers())
    
    task = "Create a Python function to validate email addresses with proper type hints and docstrings."
    
    result = await agent.run(task)
    print("✅ Python task result:", "Success" if result.success else "Failed")


async def discover_available_tools():
    """Demonstrate tool discovery features."""
    
    print("\n🔍 DISCOVERING AVAILABLE MCP TOOLS")
    print("=" * 50)
    
    # List all available tools
    all_tools = Agent.list_all_mcp_tools()
    print(f"📦 Total available tools: {len(all_tools)}")
    
    for name, description in all_tools.items():
        print(f"  • {name:15} - {description}")
    
    print("\n🏷️  TOOLS BY CATEGORY:")
    print("-" * 30)
    
    # Find tools by tags
    categories = ["linting", "memory", "typescript", "ui", "testing"]
    for category in categories:
        tools = Agent.list_tools_by_tag(category)
        if tools:
            print(f"  {category:12}: {', '.join(tools)}")
    
    print("\n🔧 ENVIRONMENT VALIDATION:")
    print("-" * 30)
    
    # Check environment for tools that need it
    tools_needing_env = ["graphiti", "mem0", "unsplash", "dalle"]
    missing_env = Agent.validate_mcp_environment(tools_needing_env)
    
    for tool, missing_vars in missing_env.items():
        if missing_vars:
            print(f"  ⚠️  {tool}: Missing {', '.join(missing_vars)}")
        else:
            print(f"  ✅ {tool}: Environment OK")


async def main():
    """Run all examples."""
    
    print("🎯 CC-AGENT SIMPLE CONFIGURATION EXAMPLES")
    print("=" * 60)
    
    # Show available tools first
    await discover_available_tools()
    
    print("\n" + "=" * 60)
    print("🔨 TYPESCRIPT DEVELOPMENT EXAMPLE")
    print("=" * 60)
    
    try:
        await typescript_development_agent()
    except Exception as e:
        print(f"❌ TypeScript example failed: {e}")
    
    print("\n" + "=" * 60)
    print("🐍 PYTHON DEVELOPMENT EXAMPLE")
    print("=" * 60)
    
    try:
        await python_development_agent()
    except Exception as e:
        print(f"❌ Python example failed: {e}")
    
    print("\n✨ Examples completed!")


if __name__ == "__main__":
    # Run the examples
    asyncio.run(main())