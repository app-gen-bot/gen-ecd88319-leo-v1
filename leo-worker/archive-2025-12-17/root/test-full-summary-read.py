#!/usr/bin/env python3
"""
Test that reprompter reads ENTIRE latest summary file (no line limit).
"""

import asyncio
import logging
import sys
from pathlib import Path

# Add src to path
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

from app_factory_leonardo_replit.agents.reprompter import create_reprompter

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)


async def test_full_summary_read():
    """Test reading entire latest summary file."""

    logger.info("=" * 80)
    logger.info("🧪 Testing Full Summary File Reading")
    logger.info("=" * 80)

    app_path = "apps/Fizzcard/app"
    summary_file = Path(app_path).parent / "summary_changes" / "summary-001.md"

    # Check current file size
    if summary_file.exists():
        content = summary_file.read_text()
        lines = content.splitlines()
        logger.info(f"\n📄 Current summary file:")
        logger.info(f"   File: {summary_file.name}")
        logger.info(f"   Lines: {len(lines)}")
        logger.info(f"   Size: {len(content)} bytes\n")

        # Create reprompter and read context
        reprompter = create_reprompter(app_path)
        context = reprompter.context_gatherer.gather_context(app_path)

        changelog_content = context['latest_changelog']

        # Check if it says "FULL"
        logger.info("=" * 80)
        logger.info("📊 What Reprompter Read:")
        logger.info("=" * 80)
        logger.info(f"\nTotal size: {len(changelog_content)} chars")
        logger.info(f"Total lines: {len(changelog_content.splitlines())}\n")

        if "FULL - latest session" in changelog_content:
            logger.info("✅ Reading in FULL mode (no line limit)")
        elif "last 200 lines - older" in changelog_content:
            logger.info("✅ Reading in PREVIEW mode (200 lines)")
        else:
            logger.info("❓ Unknown reading mode")

        # Verify it read everything
        if len(changelog_content.splitlines()) >= len(lines) - 5:  # Allow small diff for headers
            logger.info(f"✅ Read complete file: {len(changelog_content.splitlines())} / {len(lines)} lines")
        else:
            logger.warning(f"⚠️  Partial read: {len(changelog_content.splitlines())} / {len(lines)} lines")

        # Show first and last entry to confirm
        entries = changelog_content.split("## 📅")
        if len(entries) > 1:
            logger.info(f"\n📋 Entries found: {len(entries) - 1}")

            # First entry (skip header)
            if len(entries) > 1:
                first_entry_preview = ("## 📅" + entries[1])[:200]
                logger.info(f"\n🔹 First entry preview:\n{first_entry_preview}...")

            # Last entry
            if len(entries) > 1:
                last_entry_preview = ("## 📅" + entries[-1])[:200]
                logger.info(f"\n🔹 Last entry preview:\n{last_entry_preview}...")

        logger.info("\n" + "=" * 80)
        logger.info("✅ Test Complete")
        logger.info("=" * 80)

    else:
        logger.error(f"❌ Summary file not found: {summary_file}")
        return False

    return True


if __name__ == "__main__":
    success = asyncio.run(test_full_summary_read())
    sys.exit(0 if success else 1)
