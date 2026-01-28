#!/usr/bin/env python3
"""
Test the reprompter system with the Fizzcard app.
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


async def test_reprompter():
    """Test the reprompter with Fizzcard app."""

    app_path = "apps/Fizzcard/app"

    logger.info("=" * 80)
    logger.info("🧪 Testing Reprompter System")
    logger.info("=" * 80)
    logger.info(f"App Path: {app_path}\n")

    # Create reprompter
    logger.info("1️⃣  Creating reprompter...")
    reprompter = create_reprompter(app_path)
    logger.info("   ✅ Reprompter created\n")

    # Test get_next_prompt
    logger.info("2️⃣  Asking reprompter for next prompt...")
    logger.info("   (This uses LLM to analyze context and generate prompt)\n")

    try:
        next_prompt = await reprompter.get_next_prompt()

        logger.info("=" * 80)
        logger.info("📝 Generated Prompt:")
        logger.info("=" * 80)
        logger.info(f"\n{next_prompt}\n")
        logger.info("=" * 80)
        logger.info(f"✅ Prompt length: {len(next_prompt)} characters")
        logger.info(f"✅ Lines: {len(next_prompt.split(chr(10)))}")

        # Test record_task
        logger.info("\n3️⃣  Testing task recording...")
        reprompter.record_task(next_prompt, success=True)
        logger.info("   ✅ Task recorded successfully\n")

        logger.info("=" * 80)
        logger.info("✅ All tests passed!")
        logger.info("=" * 80)

    except Exception as e:
        logger.error(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

    return True


if __name__ == "__main__":
    success = asyncio.run(test_reprompter())
    sys.exit(0 if success else 1)
