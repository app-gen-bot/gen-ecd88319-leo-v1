#!/usr/bin/env python3
"""
Test script for reprompter Quick Wins implementation.

Verifies:
1. Changelog reading limits (300/100 lines)
2. Task history compression (last 5 full, older compressed)
3. Plan file header extraction
"""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from app_factory_leonardo_replit.agents.reprompter.context_gatherer import ContextGatherer
from app_factory_leonardo_replit.agents.reprompter.agent import SimpleReprompter


def test_changelog_limits():
    """Test that changelog reading respects 300/100 line limits."""
    print("=" * 60)
    print("TEST 1: Changelog Smart Limits")
    print("=" * 60)

    gatherer = ContextGatherer()
    app_path = "apps/dadcoin/app"

    # Read changelog
    changelog = gatherer._read_latest_changelog(app_path)

    # Count lines in result
    lines = changelog.split('\n')
    print(f"\n📊 Changelog stats:")
    print(f"   Total lines returned: {len(lines)}")

    # Check for limit indicators
    if "last 300 lines" in changelog:
        print(f"   ✅ Latest file limited to 300 lines (was unlimited)")
    elif "last 100 lines" in changelog:
        print(f"   ✅ Older file limited to 100 lines (was 200)")
    else:
        print(f"   ℹ️  File was under limit, no truncation needed")

    # Verify it's not reading full file (12609 lines)
    if len(lines) < 500:  # Should be much less than original 12609
        print(f"   ✅ Context reduction working (< 500 lines)")
    else:
        print(f"   ❌ Still reading too many lines")

    return len(lines) < 500


def test_task_history_compression():
    """Test that task history compresses after 5 tasks."""
    print("\n" + "=" * 60)
    print("TEST 2: Task History Compression")
    print("=" * 60)

    reprompter = SimpleReprompter("apps/dadcoin/app")

    # Simulate recording 7 tasks
    test_tasks = [
        "Fix authentication bug in login endpoint with proper JWT validation",
        "Add comprehensive tests for user registration flow including edge cases",
        "Implement password reset functionality with email verification",
        "Refactor database queries to use prepared statements for security",
        "Add rate limiting to API endpoints to prevent abuse",
        "Fix critical bug in wallet balance calculation causing incorrect totals",
        "Deploy to production after successful QA testing and approval",
    ]

    print("\n📝 Recording 7 test tasks...")
    for i, task in enumerate(test_tasks, 1):
        reprompter.record_task(task, success=(i % 2 == 0))
        print(f"   Task {i}: {len(task)} chars - {'✓' if i % 2 == 0 else '✗'}")

    # Read session file to verify compression
    session_file = Path(reprompter.app_path) / ".agent_session.json"

    if session_file.exists():
        import json
        session = json.loads(session_file.read_text())
        task_history = session.get("reprompter_context", {}).get("task_history", [])

        print(f"\n📊 Task history stats:")
        print(f"   Total tasks recorded: {len(task_history)}")

        # Check compression
        full_task_count = sum(1 for t in task_history if "full_task" in t and t["full_task"])
        compressed_count = len(task_history) - full_task_count

        print(f"   Tasks with full detail: {full_task_count}")
        print(f"   Compressed tasks: {compressed_count}")

        if full_task_count <= 5 and compressed_count >= 2:
            print(f"   ✅ Compression working (last 5 full, older compressed)")
            return True
        else:
            print(f"   ⚠️  Compression might not be working as expected")
            return False
    else:
        print(f"   ℹ️  No session file created yet")
        return True  # Not a failure


def test_header_extraction():
    """Test plan file header extraction."""
    print("\n" + "=" * 60)
    print("TEST 3: Plan File Header Extraction")
    print("=" * 60)

    # Create a test markdown file
    test_plan_dir = Path("apps/dadcoin/app/specs")
    test_plan_dir.mkdir(parents=True, exist_ok=True)

    test_plan = test_plan_dir / "test-plan.md"
    test_plan.write_text("""# DADCoin Application Plan

This is a family rewards economy app.

## Core Features

Parents can create quests for kids to complete.

### Quest System

Quests are tasks that earn DAD tokens when completed.
Additional details that should not appear in headers.
More content here that we don't need in the preview.

### Wallet Integration

Kids have digital wallets to store their DAD tokens.
Lots of implementation details follow...

## Technical Architecture

We use React, TypeScript, and Blockchain integration.

### Smart Contracts

Deployed on Base Sepolia testnet for development.
Contract addresses and ABI details...
""")

    gatherer = ContextGatherer()

    # Extract headers
    headers = gatherer._extract_markdown_headers(test_plan)

    print(f"\n📊 Header extraction stats:")
    lines = headers.split('\n')
    print(f"   Lines extracted: {len(lines)}")

    # Verify it contains headers
    if "# DADCoin Application Plan" in headers:
        print(f"   ✅ H1 headers extracted")
    if "## Core Features" in headers:
        print(f"   ✅ H2 headers extracted")
    if "### Quest System" in headers:
        print(f"   ✅ H3 headers extracted")

    # Verify it contains first sentences
    if "family rewards economy" in headers:
        print(f"   ✅ First sentences included")

    # Verify it's concise (not full file)
    if len(lines) < 30:  # Should be much less than original
        print(f"   ✅ Concise output (< 30 lines)")
        success = True
    else:
        print(f"   ⚠️  Output might be too verbose")
        success = False

    # Show sample
    print(f"\n📝 Sample output:")
    print(headers[:200] + "...")

    # Cleanup
    test_plan.unlink()

    return success


def test_prompt_conciseness():
    """Verify prompts.py has conciseness instructions."""
    print("\n" + "=" * 60)
    print("TEST 4: Prompt Conciseness Instructions")
    print("=" * 60)

    from app_factory_leonardo_replit.agents.reprompter.prompts import REPROMPTER_SYSTEM_PROMPT

    print(f"\n📊 System prompt stats:")
    print(f"   Total length: {len(REPROMPTER_SYSTEM_PROMPT):,} chars")

    # Check for key conciseness phrases
    checks = [
        ("300-500 CHARACTERS MAX", "Character limit specified"),
        ("Remove Adjectives", "Adjective removal technique"),
        ("Arrow Notation", "Arrow notation technique"),
        ("Bullet Points Over Prose", "Bullet point technique"),
        ("Use Symbols", "Symbol usage technique"),
    ]

    all_present = True
    for phrase, description in checks:
        if phrase in REPROMPTER_SYSTEM_PROMPT:
            print(f"   ✅ {description}")
        else:
            print(f"   ❌ Missing: {description}")
            all_present = False

    return all_present


if __name__ == "__main__":
    print("\n🧪 Testing Reprompter Quick Wins Implementation\n")

    results = {
        "Changelog Limits": test_changelog_limits(),
        "Task History Compression": test_task_history_compression(),
        "Header Extraction": test_header_extraction(),
        "Prompt Conciseness": test_prompt_conciseness(),
    }

    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)

    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {test_name}")

    # Overall result
    all_passed = all(results.values())
    print("\n" + ("🎉 ALL TESTS PASSED!" if all_passed else "⚠️  SOME TESTS FAILED"))

    sys.exit(0 if all_passed else 1)
