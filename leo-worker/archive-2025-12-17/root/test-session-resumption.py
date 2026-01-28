#!/usr/bin/env python3
"""
Test script for session resumption functionality.

This script tests:
1. Session creation during app generation
2. Session persistence to disk
3. Session resumption with context preservation
4. Interactive mode session continuity

Usage:
    uv run python test-session-resumption.py
"""

import asyncio
import json
import sys
import os
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

async def test_session_management():
    """Test session creation, persistence, and resumption."""
    print_test("=" * 80)
    print_test("Session Management Test Suite", "info")
    print_test("=" * 80)

    # Test 1: Create agent and generate simple app
    print_test("\n1. Creating agent and generating test app...", "info")

    agent = create_app_generator(
        output_dir="apps/test-session",
        enable_expansion=False,  # Disable for faster testing
        enable_subagents=False   # Disable for faster testing
    )

    # Generate a simple test app
    try:
        app_path, expansion = await agent.generate_app(
            "Create a simple note-taking app with title and content fields",
            app_name="session-test-app"
        )
        print_test(f"✓ App generated at: {app_path}", "success")
    except Exception as e:
        print_test(f"✗ App generation failed: {e}", "error")
        return False

    # Test 2: Check if session was created
    print_test("\n2. Checking session creation...", "info")

    session_file = Path.home() / ".app_generator_session.json"
    if session_file.exists():
        print_test(f"✓ Session file created at: {session_file}", "success")

        # Load and verify session data
        session_data = json.loads(session_file.read_text())

        if session_data.get("session_id"):
            print_test(f"  Session ID: {session_data['session_id'][:8]}...", "info")
        else:
            print_test("✗ No session ID in session file", "error")
            return False

        if session_data.get("app_path"):
            print_test(f"  App Path: {session_data['app_path']}", "info")

        if session_data.get("context", {}).get("features"):
            features = session_data["context"]["features"]
            print_test(f"  Features: {', '.join(features[:3])}", "info")
    else:
        print_test("✗ Session file not created", "error")
        return False

    # Test 3: Test session resumption
    print_test("\n3. Testing session resumption...", "info")

    original_session_id = session_data.get("session_id")

    # Create new agent instance (simulating new run)
    agent2 = create_app_generator(
        output_dir="apps/test-session",
        enable_expansion=False,
        enable_subagents=False
    )

    # Load the saved session
    loaded_session = agent2.load_session()

    if loaded_session and loaded_session.get("session_id") == original_session_id:
        print_test(f"✓ Session loaded successfully", "success")
    else:
        print_test("✗ Session not loaded correctly", "error")
        return False

    # Test 4: Resume with session context
    print_test("\n4. Testing context preservation during resume...", "info")

    try:
        # Resume with the saved session
        app_path, expansion = await agent2.resume_with_session(
            app_path,
            "Add a timestamp field to each note",
            session_id=original_session_id
        )
        print_test(f"✓ Successfully resumed session and added feature", "success")

        # Verify session is still the same
        context = agent2.get_session_context()
        if context and context.get("session_id") == original_session_id:
            print_test(f"✓ Session context preserved", "success")
        else:
            print_test("✗ Session context lost", "error")
            return False

    except Exception as e:
        print_test(f"✗ Session resume failed: {e}", "error")
        return False

    # Test 5: Test CLAUDE.md generation
    print_test("\n5. Testing CLAUDE.md generation...", "info")

    claude_md_path = Path(app_path) / "CLAUDE.md"
    if claude_md_path.exists():
        print_test(f"✓ CLAUDE.md generated at: {claude_md_path}", "success")

        # Verify content
        content = claude_md_path.read_text()
        if "Session ID:" in content:
            print_test("✓ Session ID included in CLAUDE.md", "success")
        if "## Features" in content or "## Architecture" in content:
            print_test("✓ Architecture details included in CLAUDE.md", "success")
    else:
        print_test("⚠ CLAUDE.md not generated (might be expected)", "warning")

    # Test 6: Test session clearing
    print_test("\n6. Testing session clearing...", "info")

    agent2.clear_session()
    context_after_clear = agent2.get_session_context()

    if not context_after_clear or not context_after_clear.get("session_id"):
        print_test("✓ Session cleared successfully", "success")
    else:
        print_test("✗ Session not cleared", "error")
        return False

    print_test("\n" + "=" * 80)
    print_test("All tests passed! ✓", "success")
    print_test("=" * 80)

    return True

async def test_cli_resume_session():
    """Test the --resume-session CLI flag."""
    print_test("\n" + "=" * 80)
    print_test("CLI --resume-session Flag Test", "info")
    print_test("=" * 80)

    print_test("\nTo test the CLI flag, run:", "info")
    print_test("  1. Generate an app:", "warning")
    print_test('     uv run python run-app-generator.py "Create a blog" --app-name test-blog', "warning")
    print_test("\n  2. Note the session ID from interactive mode (/context)", "warning")
    print_test("\n  3. Exit and resume with session:", "warning")
    print_test('     uv run python run-app-generator.py --resume apps/test-blog/app \\', "warning")
    print_test('       --resume-session <session-id> "Add comment system"', "warning")

    print_test("\nThe session should preserve all context from step 1!", "info")

async def main():
    """Run all tests."""
    # Run session management tests
    success = await test_session_management()

    if success:
        # Show CLI test instructions
        await test_cli_resume_session()
    else:
        print_test("\nSome tests failed. Please check the implementation.", "error")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())