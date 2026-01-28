#!/usr/bin/env python
"""
Test the RunIQ app generator with the fixed session handling.
"""

import asyncio
import sys
import os

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from app_factory_leonardo_replit.agents.app_generator.agent import AppGeneratorAgent

async def test_runiq():
    """Test RunIQ app generation or resumption."""
    print("=" * 80)
    print("TESTING RUNIQ APP WITH FIXED SESSION HANDLING")
    print("=" * 80)

    try:
        # Create agent
        agent = AppGeneratorAgent(
            output_dir="/Users/labheshpatel/apps/app-factory/apps",
            enable_expansion=False,  # Skip expansion for testing
            enable_subagents=True
        )

        print("\n✅ Agent created successfully")

        app_path = "/Users/labheshpatel/apps/app-factory/apps/RunIQ/app"

        # Check if the app directory has any content
        from pathlib import Path
        app_dir = Path(app_path)

        if not app_dir.exists():
            print(f"\n📁 App directory doesn't exist: {app_path}")
            print("❌ The RunIQ app hasn't been generated yet.")
            return False

        # Count files in the app directory
        files = list(app_dir.glob("*"))
        if not files:
            print(f"\n📁 App directory exists but is empty: {app_path}")
            print("❌ The RunIQ app directory is empty - no app generated yet.")
            print("\n💡 To generate the RunIQ app, run:")
            print("   uv run python run-app-generator.py 'Create a running IQ app' --app-name RunIQ")
            return False

        print(f"\n📁 App directory has {len(files)} items")

        # Try to resume with a simple check
        test_prompt = "List the current features and status of the app"

        print(f"\n🔄 Testing resume at: {app_path}")
        print(f"📝 Test prompt: {test_prompt}")

        # Resume generation (this will now handle expired sessions gracefully)
        result = await agent.resume_generation(app_path, test_prompt)

        print("\n✅ Resume test completed successfully!")
        print(f"📂 App path: {result[0]}")

        return True

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_runiq())

    print("\n" + "=" * 80)
    if success:
        print("✅ RUNIQ APP TEST SUCCESSFUL!")
    else:
        print("❌ RUNIQ APP TEST FAILED")
    print("=" * 80)

    sys.exit(0 if success else 1)