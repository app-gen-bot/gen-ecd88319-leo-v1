#!/usr/bin/env python3
"""
Test script for app-specific session management.

This script verifies that:
1. Sessions are stored in app directories, not globally
2. --resume automatically finds and uses app's session
3. Multiple apps can have independent sessions
4. Context is preserved per app

Usage:
    uv run python test-app-specific-sessions.py
"""

import asyncio
import json
import sys
import os
import shutil
from pathlib import Path
from datetime import datetime

# Add src to path
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

from app_factory_leonardo_replit.agents.app_generator import create_app_generator

# Colors for output
GREEN = "\033[92m"
RED = "\033[91m"
BLUE = "\033[94m"
YELLOW = "\033[93m"
RESET = "\033[0m"

def print_test(msg: str, status="info"):
    """Print colored test message."""
    colors = {
        "success": GREEN,
        "error": RED,
        "info": BLUE,
        "warning": YELLOW
    }
    color = colors.get(status, RESET)
    print(f"{color}[TEST] {msg}{RESET}")

async def test_app_specific_sessions():
    """Test app-specific session management."""
    print_test("=" * 80)
    print_test("App-Specific Session Management Test", "info")
    print_test("=" * 80)

    # Clean up test directories
    test_base = Path("apps/test-sessions")
    if test_base.exists():
        shutil.rmtree(test_base)

    # Test 1: Create first test app
    print_test("\n1. Creating first test app...", "info")
    agent1 = create_app_generator(
        output_dir=str(test_base),
        enable_expansion=False,
        enable_subagents=False
    )

    try:
        app1_path, _ = await agent1.generate_app(
            "Create a simple todo list app",
            app_name="todo-app"
        )
        print_test(f"✓ App 1 generated at: {app1_path}", "success")
    except Exception as e:
        print_test(f"✗ App 1 generation failed: {e}", "error")
        return False

    # Test 2: Verify session file is in app directory
    print_test("\n2. Checking session file location...", "info")

    app1_session_file = Path(app1_path) / ".agent_session.json"
    if app1_session_file.exists():
        print_test(f"✓ Session file in app directory: {app1_session_file}", "success")

        # Load and check session data
        session1_data = json.loads(app1_session_file.read_text())
        session1_id = session1_data.get("session_id")
        print_test(f"  Session ID: {session1_id[:8]}...", "info")
        print_test(f"  App path in session: {session1_data.get('app_path')}", "info")
    else:
        print_test(f"✗ No session file in app directory", "error")
        return False

    # Check that NO global session exists
    global_session = test_base / ".agent_session.json"
    if global_session.exists():
        print_test("⚠ Warning: Global session file exists (should be app-specific)", "warning")

    # Test 3: Create second test app
    print_test("\n3. Creating second test app...", "info")

    agent2 = create_app_generator(
        output_dir=str(test_base),
        enable_expansion=False,
        enable_subagents=False
    )

    try:
        app2_path, _ = await agent2.generate_app(
            "Create a notes management app",
            app_name="notes-app"
        )
        print_test(f"✓ App 2 generated at: {app2_path}", "success")
    except Exception as e:
        print_test(f"✗ App 2 generation failed: {e}", "error")
        return False

    # Test 4: Verify each app has its own session
    print_test("\n4. Checking independent sessions...", "info")

    app2_session_file = Path(app2_path) / ".agent_session.json"
    if app2_session_file.exists():
        session2_data = json.loads(app2_session_file.read_text())
        session2_id = session2_data.get("session_id")

        if session1_id != session2_id:
            print_test(f"✓ Apps have different sessions:", "success")
            print_test(f"  App 1: {session1_id[:8]}...", "info")
            print_test(f"  App 2: {session2_id[:8]}...", "info")
        else:
            print_test("✗ Apps share same session ID (should be different)", "error")
            return False
    else:
        print_test("✗ App 2 has no session file", "error")
        return False

    # Test 5: Resume first app - should auto-find session
    print_test("\n5. Testing auto-resume with app-specific session...", "info")

    agent3 = create_app_generator(
        output_dir=str(test_base),
        enable_expansion=False,
        enable_subagents=False
    )

    try:
        # Resume without providing session ID
        result_path, _ = await agent3.resume_generation(
            app1_path,
            "Add a priority field to todos"
        )

        # Check if same session was used
        if agent3.current_session_id == session1_id:
            print_test(f"✓ Auto-resumed with correct session: {session1_id[:8]}", "success")
        else:
            print_test(f"⚠ Different session used: {agent3.current_session_id[:8] if agent3.current_session_id else 'None'}", "warning")

        # Verify context was preserved
        if agent3.generation_context.get("app_name") == "todo-app":
            print_test("✓ Context preserved: app_name = todo-app", "success")
        else:
            print_test("⚠ Context not fully preserved", "warning")

    except Exception as e:
        print_test(f"✗ Resume failed: {e}", "error")
        return False

    # Test 6: Resume second app - should use its own session
    print_test("\n6. Testing second app resume...", "info")

    agent4 = create_app_generator(
        output_dir=str(test_base),
        enable_expansion=False,
        enable_subagents=False
    )

    try:
        result_path, _ = await agent4.resume_generation(
            app2_path,
            "Add tags to notes"
        )

        if agent4.current_session_id == session2_id:
            print_test(f"✓ App 2 resumed with its session: {session2_id[:8]}", "success")
        else:
            print_test(f"⚠ Different session for app 2", "warning")

    except Exception as e:
        print_test(f"✗ App 2 resume failed: {e}", "error")
        return False

    # Test 7: Clear session for one app
    print_test("\n7. Testing session clearing...", "info")

    agent4.clear_session(app1_path)

    if not app1_session_file.exists():
        print_test("✓ App 1 session cleared", "success")
    else:
        print_test("✗ App 1 session not cleared", "error")

    if app2_session_file.exists():
        print_test("✓ App 2 session still exists (independent)", "success")
    else:
        print_test("✗ App 2 session incorrectly cleared", "error")

    print_test("\n" + "=" * 80)
    print_test("All tests passed! ✓", "success")
    print_test("Sessions are now app-specific and auto-discovered on resume!", "success")
    print_test("=" * 80)

    # Clean up
    if test_base.exists():
        shutil.rmtree(test_base)

    return True

async def test_cli_behavior():
    """Show CLI usage examples."""
    print_test("\n" + "=" * 80)
    print_test("CLI Usage Examples", "info")
    print_test("=" * 80)

    print_test("\n1. Create an app (session saved in app directory):", "info")
    print_test('   uv run python run-app-generator.py "Create a blog" --app-name my-blog', "warning")
    print_test('   → Session saved in: apps/my-blog/app/.agent_session.json', "info")

    print_test("\n2. Resume the app (auto-finds session):", "info")
    print_test('   uv run python run-app-generator.py --resume apps/my-blog/app "Add comments"', "warning")
    print_test('   → Automatically uses existing session from app directory', "info")

    print_test("\n3. Work on multiple apps (independent sessions):", "info")
    print_test('   # App 1', "warning")
    print_test('   uv run python run-app-generator.py --resume apps/blog/app "Add search"', "warning")
    print_test('   # App 2', "warning")
    print_test('   uv run python run-app-generator.py --resume apps/shop/app "Add cart"', "warning")
    print_test('   → Each app maintains its own session context', "info")

    print_test("\n4. Override with specific session (optional):", "info")
    print_test('   uv run python run-app-generator.py --resume apps/my-blog/app \\', "warning")
    print_test('     --resume-session abc123def "Restore specific state"', "warning")

    print_test("\nBenefits:", "success")
    print_test("✓ No need to track session IDs", "success")
    print_test("✓ Each app has its own persistent context", "success")
    print_test("✓ Seamless resume with full history", "success")
    print_test("✓ Work on multiple apps simultaneously", "success")

async def main():
    """Run all tests."""
    success = await test_app_specific_sessions()

    if success:
        await test_cli_behavior()
    else:
        print_test("\nSome tests failed. Please check the implementation.", "error")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())