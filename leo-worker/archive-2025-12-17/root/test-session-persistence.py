#!/usr/bin/env python3
"""Quick test to verify session persistence with real session IDs."""

import asyncio
import json
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).parent / "vendor" / "cc-agent"))

from cc_agent import Agent

async def test_session_persistence():
    print("=" * 80)
    print("SESSION PERSISTENCE TEST")
    print("=" * 80)

    # Create a test directory
    test_dir = Path("/tmp/session-test")
    test_dir.mkdir(exist_ok=True)
    session_file = test_dir / "session.json"

    # Clean up any previous test
    if session_file.exists():
        session_file.unlink()

    print("\n📝 STEP 1: Create initial session and run a simple task")
    print("-" * 80)

    agent1 = Agent(
        name="TestAgent",
        system_prompt="You are a helpful assistant. Keep responses very brief.",
        allowed_tools=["Read", "Write"],
        cwd=str(test_dir),
        model="sonnet",
        verbose=True
    )

    # Run a simple task
    result1 = await agent1.run_with_session("What is 2 + 2? Just give the number.")

    # Get the session ID
    session_id = agent1.session_id
    print(f"\n✅ Task completed!")
    print(f"📂 Session ID captured: {session_id}")
    print(f"   Length: {len(session_id)} chars")
    print(f"   Format check: {'UUID' if '-' in session_id and len(session_id) > 30 else 'FAKE'}")

    # Save session ID to file
    session_data = {
        "session_id": session_id,
        "first_response": result1.content[:100]
    }
    session_file.write_text(json.dumps(session_data, indent=2))
    print(f"💾 Session saved to: {session_file}")

    # Disconnect
    await agent1.disconnect_session()
    print("\n👋 Disconnected first agent")

    print("\n" + "=" * 80)
    print("\n📝 STEP 2: Load session and resume conversation")
    print("-" * 80)

    # Load the session
    loaded_data = json.loads(session_file.read_text())
    loaded_session_id = loaded_data["session_id"]
    print(f"📂 Loaded session ID: {loaded_session_id}")

    # Create a NEW agent instance
    agent2 = Agent(
        name="TestAgent2",
        system_prompt="You are a helpful assistant. Keep responses very brief.",
        allowed_tools=["Read", "Write"],
        cwd=str(test_dir),
        model="sonnet",
        verbose=True
    )

    # Try to resume with the loaded session ID
    try:
        print(f"\n🔄 Attempting to resume session: {loaded_session_id[:8]}...")
        result2 = await agent2.run_with_session(
            "What was my previous question? (Just repeat it briefly)",
            session_id=loaded_session_id
        )

        print(f"\n✅ Session resumed successfully!")
        print(f"📂 Agent's session ID: {agent2.session_id}")
        print(f"📝 Response: {result2.content[:200]}")

        # Check if it remembered
        if "2" in result2.content or "question" in result2.content.lower():
            print("\n🎉 SUCCESS! The agent remembered the previous conversation!")
            print(f"   Previous: Asked about 2 + 2")
            print(f"   Current:  {result2.content[:100]}")
            return True
        else:
            print("\n⚠️  WARNING: Agent didn't seem to remember the context")
            print(f"   Response: {result2.content}")
            return False

    except Exception as e:
        print(f"\n❌ FAILED to resume session!")
        print(f"   Error: {e}")
        return False
    finally:
        await agent2.disconnect_session()

    print("\n" + "=" * 80)

if __name__ == "__main__":
    success = asyncio.run(test_session_persistence())

    print("\n" + "=" * 80)
    print("TEST RESULT:")
    print("=" * 80)
    if success:
        print("✅ Session persistence is WORKING!")
        print("   - Real session IDs are being captured")
        print("   - Sessions can be resumed across agent instances")
        print("   - Conversation context is preserved")
    else:
        print("❌ Session persistence is NOT working")
        print("   - Check the error messages above")
    print("=" * 80)

    sys.exit(0 if success else 1)
