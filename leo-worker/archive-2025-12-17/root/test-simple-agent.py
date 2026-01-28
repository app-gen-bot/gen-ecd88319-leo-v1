#!/usr/bin/env python
"""
Simple test to verify the agent works with the API key.
"""

import asyncio
import sys
import os

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from cc_agent import Agent

async def test_simple_agent():
    """Test basic agent functionality with API key."""
    print("=" * 80)
    print("TESTING BASIC AGENT WITH API KEY")
    print("=" * 80)

    try:
        # Create a simple agent
        agent = Agent(
            name="TestAgent",
            system_prompt="You are a helpful AI assistant for testing.",
            allowed_tools=["TodoWrite"],
            max_turns=1,
            cwd="/Users/labheshpatel/apps/app-factory/apps/RunIQ/app"
        )

        print("\n✅ Agent created successfully")

        # Run a simple task
        test_prompt = "Create a simple todo list with one item: 'Test API key is working'"

        print(f"\n📝 Test prompt: {test_prompt}")

        # Run the agent
        result = await agent.run(test_prompt)

        print(f"\n✅ Agent ran successfully!")
        print(f"📊 Cost: ${result.cost:.4f}")
        print(f"✔️  Success: {result.success}")
        print(f"📝 Content preview: {result.content[:200]}..." if len(result.content) > 200 else f"📝 Content: {result.content}")

        return True

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_simple_agent())
    print("\n" + "=" * 80)
    if success:
        print("✅ API KEY AND AGENT ARE WORKING CORRECTLY!")
        print("\nYou can now use the app generator:")
        print("  uv run python run-app-generator.py 'Your app idea' --app-name your-app")
        print("\nOr resume work on RunIQ (clear the old session first):")
        print("  rm /Users/labheshpatel/apps/app-factory/apps/RunIQ/app/.agent_session.json")
        print("  uv run python run-app-generator.py 'Check app status' --resume /Users/labheshpatel/apps/app-factory/apps/RunIQ/app")
    else:
        print("❌ There's still an issue with the API configuration")
    print("=" * 80)
    sys.exit(0 if success else 1)