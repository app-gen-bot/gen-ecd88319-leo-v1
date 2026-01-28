#!/usr/bin/env python3
"""Test script for Heroicons MCP Server"""

import asyncio
import json
from cc_agent import Agent

async def test_heroicons():
    """Test Heroicons MCP server functionality"""
    
    # Create an agent with Heroicons MCP server
    agent = Agent(
        name="HeroiconsTest",
        system_prompt="You are testing the Heroicons MCP server. Use the available tools to test icon functionality.",
        allowed_tools=["mcp__heroicons"],
        verbose=True
    )
    
    # Test prompts
    test_prompts = [
        "Use mcp__heroicons__search_icons to search for 'user' icons",
        "Use mcp__heroicons__get_icon to get the 'user-circle' icon in outline variant",
        "Use mcp__heroicons__list_categories to see all available categories",
        "Use mcp__heroicons__generate_react_component to create a button with a plus icon",
        "Use mcp__heroicons__suggest_icon to suggest icons for a 'delete' button"
    ]
    
    # MCP server config
    mcp_config = {
        "heroicons": {
            "command": "uv",
            "args": ["run", "python", "-m", "cc_tools.heroicons.server"]
        }
    }
    
    print("Testing Heroicons MCP Server...\n")
    
    for i, prompt in enumerate(test_prompts, 1):
        print(f"\n{'='*60}")
        print(f"Test {i}: {prompt}")
        print('='*60)
        
        result = await agent.run(
            user_prompt=prompt,
            mcp_servers=mcp_config
        )
        
        if result.success:
            print("\n✅ Test passed!")
            print(f"Response: {result.content[:500]}...")  # First 500 chars
        else:
            print("\n❌ Test failed!")
            print(f"Error: {result.content}")
        
        # Small delay between tests
        await asyncio.sleep(1)
    
    print("\n\nAll tests completed!")

if __name__ == "__main__":
    asyncio.run(test_heroicons())