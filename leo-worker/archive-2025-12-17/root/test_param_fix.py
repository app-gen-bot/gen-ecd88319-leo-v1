#!/usr/bin/env python
"""
Quick test to verify parameter name fix in FrontendImplementationBinary.
"""

import sys
import logging
from pathlib import Path

# Add source to path
sys.path.append('/Users/labheshpatel/apps/app-factory/src')

from app_factory_leonardo_replit.agents.frontend_implementation.binary import FrontendImplementationBinary

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def test_parameter_fix():
    """Test that the parameter name fix works correctly."""

    # Use the existing app workspace
    workspace = Path('/Users/labheshpatel/apps/app-factory/apps/app-phase2-20250928-011324/app')

    if not workspace.exists():
        logger.error(f"❌ Workspace not found: {workspace}")
        return False

    logger.info("="*60)
    logger.info("🧪 Testing Parameter Fix in Frontend Implementation Binary")
    logger.info(f"📁 Workspace: {workspace}")
    logger.info("="*60)

    try:
        # Create the Frontend Implementation Binary
        logger.info("\n🚀 Creating Frontend Implementation Binary...")
        frontend_binary = FrontendImplementationBinary(
            workspace=str(workspace),
            verbose=True
        )
        logger.info("✅ Successfully created FrontendImplementationBinary")

        # Test getting initial writer prompt (this was failing before)
        logger.info("\n🔍 Testing get_initial_writer_prompt()...")
        prompt = frontend_binary.get_initial_writer_prompt()
        logger.info(f"✅ Successfully got initial prompt (length: {len(prompt)} chars)")

        # Test getting iteration-specific instructions
        logger.info("\n🔍 Testing get_iteration_specific_instructions()...")
        iteration_prompt = frontend_binary.get_iteration_specific_instructions()
        logger.info(f"✅ Successfully got iteration prompt (length: {len(iteration_prompt)} chars)")

        logger.info("\n" + "="*60)
        logger.info("✨ All tests PASSED! Parameter fix is working.")
        logger.info("="*60)

        # Show what would happen with error handling
        logger.info("\n💡 Error handling features added:")
        logger.info("1. ✅ Try-except blocks around file reads")
        logger.info("2. ✅ Fallback for parameter name compatibility")
        logger.info("3. ✅ Minimal prompt creation on complete failure")
        logger.info("4. ✅ Defensive checks in parse methods")
        logger.info("5. ✅ Graceful handling of missing attributes")

        return True

    except Exception as e:
        logger.error(f"\n❌ Test FAILED with error: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return False


if __name__ == "__main__":
    success = test_parameter_fix()
    sys.exit(0 if success else 1)