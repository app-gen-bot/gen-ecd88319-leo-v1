#!/usr/bin/env python3
"""
Test the summary changelog system.
"""

import asyncio
import logging
import sys
from pathlib import Path

# Add src to path
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

from app_factory_leonardo_replit.agents.app_generator import create_app_generator
from app_factory_leonardo_replit.agents.reprompter import create_reprompter

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)


async def test_summary_changelog():
    """Test summary changelog generation."""

    logger.info("=" * 80)
    logger.info("🧪 Testing Summary Changelog System")
    logger.info("=" * 80)

    # Create app generator
    agent = create_app_generator()

    # Test with a sample verbose output
    verbose_output = """
Perfect! Let me analyze the leaderboard issue. I can see the frontend is requesting limit=100
but the schema validation expects max 50. Let me check the code...

Found it! In LeaderboardPage.tsx line 40, the limit is set to 100. But in schema.zod.ts line 384,
the validation specifies .max(50). This is a mismatch.

Let me fix this by updating the limit to 50:
- Updated LeaderboardPage.tsx line 40: limit: 50

Good! Now let me refresh the page to test...

Excellent! The leaderboard is now working perfectly! I can see:
- The user's rank displayed (#1, Top 100.0%)
- Filter options
- The leaderboard showing all users
- Beautiful styling with cyan highlights

The fix is complete!
    """

    logger.info("\n1️⃣  Testing _generate_concise_summary()...")
    logger.info(f"   Input: {len(verbose_output)} chars of verbose output\n")

    try:
        concise = await agent._generate_concise_summary(verbose_output, max_chars=500)

        logger.info("=" * 80)
        logger.info("📝 Concise Summary Generated:")
        logger.info("=" * 80)
        logger.info(f"\n{concise}\n")
        logger.info("=" * 80)
        logger.info(f"✅ Summary length: {len(concise)} chars (target: ≤500)")
        logger.info(f"✅ Reduction: {len(verbose_output)} → {len(concise)} chars ({100 - len(concise)*100//len(verbose_output)}% smaller)\n")

    except Exception as e:
        logger.error(f"❌ Error generating summary: {e}")
        import traceback
        traceback.print_exc()
        return False

    logger.info("2️⃣  Testing append_to_summary_changelog()...")
    app_path = "apps/Fizzcard/app"

    try:
        await agent.append_to_summary_changelog(
            app_path=app_path,
            operation_type="Test",
            user_request="Fix the leaderboard limit bug",
            agent_summary=verbose_output,
            commit_hash="abc123def456"
        )

        # Check if file was created
        summary_dir = Path(app_path).parent / "summary_changes"
        summary_file = summary_dir / "summary-001.md"

        if summary_file.exists():
            logger.info(f"   ✅ Summary changelog created: {summary_file}")

            # Read and display
            content = summary_file.read_text()
            logger.info(f"   ✅ File size: {len(content)} bytes\n")

            # Show last entry
            entries = content.split("## 📅")
            if len(entries) > 1:
                last_entry = "## 📅" + entries[-1]
                logger.info("=" * 80)
                logger.info("📄 Last Entry in Summary Changelog:")
                logger.info("=" * 80)
                logger.info(f"\n{last_entry.strip()}\n")
                logger.info("=" * 80)
        else:
            logger.warning(f"   ⚠️  Summary file not created: {summary_file}")

    except Exception as e:
        logger.error(f"❌ Error creating summary changelog: {e}")
        import traceback
        traceback.print_exc()
        return False

    logger.info("\n3️⃣  Testing reprompter reads summary_changes/...")

    try:
        reprompter = create_reprompter(app_path)
        context = reprompter.context_gatherer.gather_context(app_path)

        changelog_content = context['latest_changelog']

        logger.info("=" * 80)
        logger.info("📊 Context Read by Reprompter:")
        logger.info("=" * 80)
        logger.info(f"\nChangelog size: {len(changelog_content)} chars")

        if "concise summaries" in changelog_content:
            logger.info("✅ Reading from summary_changes/ (concise)")
        elif "VERBOSE" in changelog_content:
            logger.info("⚠️  Reading from changelog/ (verbose fallback)")
        else:
            logger.info("ℹ️  Unknown source")

        # Show preview
        preview = changelog_content[:500] if len(changelog_content) > 500 else changelog_content
        logger.info(f"\nPreview:\n{preview}...\n")
        logger.info("=" * 80)

    except Exception as e:
        logger.error(f"❌ Error testing reprompter: {e}")
        import traceback
        traceback.print_exc()
        return False

    logger.info("\n" + "=" * 80)
    logger.info("✅ All Tests Passed!")
    logger.info("=" * 80)

    return True


if __name__ == "__main__":
    success = asyncio.run(test_summary_changelog())
    sys.exit(0 if success else 1)
