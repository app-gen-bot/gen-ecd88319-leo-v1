#!/usr/bin/env python
"""
Quick test to resume RunIQ app generation with the working API key.
"""

import asyncio
import sys
import os

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from app_factory_leonardo_replit.agents.app_generator.agent import AppGeneratorAgent

async def test_resume():
    """Test resuming the RunIQ app."""
    print("=" * 80)
    print("TESTING RUNIQ APP RESUME WITH API KEY")
    print("=" * 80)

    try:
        # Create agent
        agent = AppGeneratorAgent(
            output_dir="/Users/labheshpatel/apps/app-factory/apps",
            enable_expansion=False,  # Skip expansion for quick test
            enable_subagents=True
        )

        print("\n✅ Agent created successfully")
        print(f"📁 Output directory: {agent.output_dir}")

        # Test resume with a simple task
        app_path = "/Users/labheshpatel/apps/app-factory/apps/RunIQ/app"
        test_prompt = "Check the current status of the app and verify all components are working"

        print(f"\n🔄 Resuming app at: {app_path}")
        print(f"📝 Test prompt: {test_prompt}")

        # Resume generation
        result = await agent.resume_generation(app_path, test_prompt)

        print("\n✅ Resume test completed successfully!")
        print(f"📂 App path: {result[0]}")

        return True

    except Exception as e:
        print(f"\n❌ Error during resume: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_resume())
    sys.exit(0 if success else 1)