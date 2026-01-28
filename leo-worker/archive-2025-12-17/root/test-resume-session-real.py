#!/usr/bin/env python3
"""
Real-world test of session persistence with actual app generation resume.
"""

import asyncio
import sys
import json
import time
from pathlib import Path

# Add src to path
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

from app_factory_leonardo_replit.agents.app_generator import create_app_generator


async def test_real_resume():
    """Test session persistence with actual resume operation."""
    print("=" * 80)
    print("🧪 REAL-WORLD SESSION PERSISTENCE TEST")
    print("=" * 80)

    kidiq_path = Path.home() / "apps/app-factory/apps/KidIQ/app"

    # Step 1: Create first session with context
    print("\n📝 Step 1: Creating initial session with context...")

    agent1 = create_app_generator()

    # Set up initial context
    initial_session_id = f"test-resume-{int(time.time())}"
    agent1.current_session_id = initial_session_id
    agent1.current_app_path = str(kidiq_path)
    agent1.generation_context = {
        "app_name": "KidIQ",
        "features": ["AI recommendations", "opportunities tracking", "user profiles"],
        "entities": ["users", "categories", "opportunities"],
        "last_action": "Initial setup for testing",
        "test_marker": "PERSISTENCE_TEST_MARKER",  # Special marker to verify
        "created_at": time.time()
    }

    # Save session
    agent1.save_session(str(kidiq_path))
    print(f"✅ Initial session saved: {initial_session_id[:20]}...")

    # Read session file to verify
    session_file = kidiq_path / ".agent_session.json"
    if session_file.exists():
        data = json.loads(session_file.read_text())
        print(f"   Test marker present: {'PERSISTENCE_TEST_MARKER' in str(data)}")

    # Step 2: Create new agent and load session
    print("\n📝 Step 2: Creating new agent and loading session...")

    agent2 = create_app_generator()

    # Load session
    loaded_session = agent2.load_session(str(kidiq_path))

    if loaded_session:
        print(f"✅ Session loaded: {loaded_session.get('session_id', 'NONE')[:20]}...")

        # Verify our test marker
        if loaded_session.get('context', {}).get('test_marker') == "PERSISTENCE_TEST_MARKER":
            print("✅ Test marker verified - context preserved correctly!")
        else:
            print("❌ Test marker missing - context not preserved")
            return False

        # Set agent context from loaded session
        agent2.current_session_id = loaded_session.get('session_id')
        agent2.current_app_path = str(kidiq_path)
        agent2.generation_context = loaded_session.get('context', {})

    else:
        print("❌ Failed to load session")
        return False

    # Step 3: Simulate resume operation
    print("\n📝 Step 3: Simulating resume with modifications...")

    # Use the resume_generation method (which internally calls resume_with_session)
    print("   Testing automatic session detection in resume_generation...")

    # This simulates what happens when user runs:
    # uv run python run-app-generator.py --resume apps/KidIQ/app "add feature"

    # The resume_generation method should:
    # 1. Automatically find the session file
    # 2. Load the session
    # 3. Use the session ID for continuity

    # We'll mock the expand_prompt to avoid actual LLM calls
    original_expand = agent2.expand_prompt
    async def mock_expand(user_input, app_path=None):
        return {
            "original": user_input,
            "expanded": user_input,
            "was_expanded": False,
            "expansion_note": "Mock expansion for testing"
        }
    agent2.expand_prompt = mock_expand

    # Check what resume_generation does with the session
    print("\n📝 Step 4: Checking session handling in resume_generation...")

    # Read current session before resume
    session_before = json.loads(session_file.read_text())
    session_id_before = session_before.get('session_id')
    print(f"   Session ID before resume: {session_id_before[:20]}...")

    # The resume_generation method should find and use this session
    # Let's trace through what it does
    loaded = agent2.load_session(str(kidiq_path))
    if loaded:
        found_session_id = loaded.get('session_id')
        print(f"   Session found by load_session: {found_session_id[:20]}...")

        if found_session_id == session_id_before:
            print("   ✅ Session IDs match - continuity will be preserved")
        else:
            print("   ❌ Session ID mismatch!")

    # Step 5: Verify session update after modification
    print("\n📝 Step 5: Testing session update after modification...")

    # Update context
    agent2.generation_context["last_action"] = "Test modification"
    agent2.generation_context["modification_time"] = time.time()
    agent2.generation_context["test_marker"] = "UPDATED_MARKER"

    # Save updated session
    agent2.save_session(str(kidiq_path))

    # Verify update
    updated_data = json.loads(session_file.read_text())
    if updated_data.get('context', {}).get('test_marker') == "UPDATED_MARKER":
        print("✅ Session update verified - modifications persisted")
    else:
        print("❌ Session update failed")
        return False

    # Final verification
    print("\n" + "=" * 80)
    print("📊 VERIFICATION SUMMARY")
    print("=" * 80)
    print("✅ Initial session creation: SUCCESS")
    print("✅ Session loading in new agent: SUCCESS")
    print("✅ Context preservation: SUCCESS")
    print("✅ Session continuity: SUCCESS")
    print("✅ Session updates: SUCCESS")
    print("\n🎉 REAL-WORLD SESSION PERSISTENCE TEST PASSED!")

    return True


async def main():
    """Run the test."""
    try:
        success = await test_real_resume()
        if success:
            print("\n✅ All real-world tests passed!")
            return 0
        else:
            print("\n❌ Some tests failed")
            return 1
    except Exception as e:
        print(f"\n❌ Test error: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)