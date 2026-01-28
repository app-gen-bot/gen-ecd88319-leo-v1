#!/usr/bin/env python
"""
Test script for Frontend Implementation Binary on existing app.

This tests the BinaryAgent implementation on the real Chapel Elegance app
that's been running for hours, showing how it can pick up where things left off.
"""

import asyncio
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


async def test_frontend_binary():
    """Test the Frontend Implementation Binary on existing app."""

    # Use the existing app workspace
    workspace = Path('/Users/labheshpatel/apps/app-factory/apps/app-phase2-20250928-011324/app')

    if not workspace.exists():
        logger.error(f"❌ Workspace not found: {workspace}")
        return False

    logger.info("="*60)
    logger.info("🧪 Testing Frontend Implementation Binary")
    logger.info(f"📁 Workspace: {workspace}")
    logger.info("="*60)

    # Check what's already there
    client_dir = workspace / 'client'
    if client_dir.exists():
        pages_count = len(list((client_dir / 'src' / 'pages').glob('*.tsx')))
        hooks_count = len(list((client_dir / 'src' / 'hooks').glob('*.ts')))
        logger.info(f"📊 Existing work found:")
        logger.info(f"   • Pages: {pages_count}")
        logger.info(f"   • Hooks: {hooks_count}")

    # Check git history
    import subprocess
    try:
        git_log = subprocess.run(
            ['git', 'log', '--oneline', '-5'],
            cwd=workspace,
            capture_output=True,
            text=True
        )
        if git_log.returncode == 0:
            logger.info(f"📝 Recent git commits:")
            for line in git_log.stdout.strip().split('\n'):
                logger.info(f"   {line}")
    except:
        pass

    # Create the Frontend Implementation Binary
    logger.info("\n" + "="*60)
    logger.info("🚀 Starting Frontend Implementation Binary")
    logger.info("="*60)

    frontend_binary = FrontendImplementationBinary(
        workspace=str(workspace),
        verbose=True
    )

    # Check if there's existing state
    if frontend_binary.iteration > 0:
        logger.info(f"♻️ Resuming from iteration {frontend_binary.iteration}")
        logger.info(f"   Previous compliance: {frontend_binary.state.get('compliance_score', 0)}%")
        logger.info(f"   Issues remaining: {len(frontend_binary.state.get('issues_remaining', []))}")

    # Run just ONE iteration to test (not full convergence)
    logger.info("\n🔬 Running ONE test iteration...")
    decision, evaluation = await frontend_binary.run_iteration()

    # Show results
    logger.info("\n" + "="*60)
    logger.info("📊 Test Results")
    logger.info("="*60)
    logger.info(f"Decision: {decision}")
    logger.info(f"Compliance Score: {evaluation.get('compliance_score', 0)}%")
    logger.info(f"Issues Found: {len(evaluation.get('issues', []))}")

    if evaluation.get('issues'):
        logger.info("Top Issues:")
        for i, issue in enumerate(evaluation.get('issues', [])[:3], 1):
            logger.info(f"  {i}. {issue}")

    # Check state persistence
    state_file = workspace / '.iteration' / 'frontend_implementation_state.yaml'
    if state_file.exists():
        logger.info(f"\n✅ State file created: {state_file}")

        # Show state contents
        import yaml
        with open(state_file) as f:
            state = yaml.safe_load(f)
            logger.info(f"   Iteration: {state.get('iteration', 0)}")
            logger.info(f"   Compliance: {state.get('compliance_score', 0)}%")
            logger.info(f"   Working files: {len(state.get('working_files', []))}")
            logger.info(f"   Stable files: {len(state.get('stable_files', []))}")

    # Show convergence history
    history = frontend_binary.get_convergence_history()
    if history:
        logger.info(f"\n📈 Convergence History:")
        for point in history:
            logger.info(f"   Iteration {point['iteration']}: {point['compliance_score']}% ({point['issues_count']} issues)")

    logger.info("\n" + "="*60)
    logger.info("✨ Test Complete!")
    logger.info("="*60)

    # Explain what would happen in full run
    logger.info("\n💡 What BinaryAgent provides:")
    logger.info("1. ♻️ Picks up from existing work (no re-discovery)")
    logger.info("2. 📝 Git commits track progress")
    logger.info("3. 💾 State persists between iterations")
    logger.info("4. 🎯 Focuses on critic feedback")
    logger.info("5. 🛡️ Protects stable files from modification")

    return True


if __name__ == "__main__":
    success = asyncio.run(test_frontend_binary())
    sys.exit(0 if success else 1)