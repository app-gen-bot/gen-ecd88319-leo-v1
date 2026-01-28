#!/usr/bin/env python
"""
Standalone runner for Frontend Implementation Binary to watch convergence.

This runs the full Writer-Critic loop until convergence or max iterations.
"""

import asyncio
import sys
import logging
from pathlib import Path
from datetime import datetime

# Add source to path
sys.path.append('/Users/labheshpatel/apps/app-factory/src')

from app_factory_leonardo_replit.agents.frontend_implementation.binary import FrontendImplementationBinary

# Configure detailed logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(f'frontend_convergence_{datetime.now():%Y%m%d_%H%M%S}.log')
    ]
)
logger = logging.getLogger(__name__)


async def run_frontend_convergence():
    """Run Frontend Implementation Binary until convergence."""

    # Use the existing Chapel Elegance app workspace
    workspace = Path('/Users/labheshpatel/apps/app-factory/apps/app-phase2-20250928-011324/app')

    if not workspace.exists():
        logger.error(f"❌ Workspace not found: {workspace}")
        return False

    print("="*80)
    print("🚀 FRONTEND IMPLEMENTATION BINARY - CONVERGENCE TEST")
    print("="*80)
    print(f"📁 Workspace: {workspace}")
    print(f"📝 This will run Writer-Critic iterations until convergence")
    print(f"⏱️  Starting at: {datetime.now():%Y-%m-%d %H:%M:%S}")
    print("="*80)
    print()

    # Check existing state
    state_file = workspace / '.iteration' / 'frontend_implementation_state.yaml'
    if state_file.exists():
        import yaml
        with open(state_file) as f:
            state = yaml.safe_load(f)
        print(f"📊 Existing State Found:")
        print(f"   • Current iteration: {state.get('iteration', 0)}")
        print(f"   • Compliance score: {state.get('compliance_score', 0)}%")
        print(f"   • Issues remaining: {len(state.get('issues_remaining', []))}")
        print(f"   • Working files: {len(state.get('working_files', []))}")
        print(f"   • Stable files: {len(state.get('stable_files', []))}")
        print()

    # Create the Frontend Implementation Binary
    print("🤖 Initializing Frontend Implementation Binary...")
    frontend_binary = FrontendImplementationBinary(
        workspace=str(workspace),
        verbose=True
    )

    # Show configuration
    print(f"⚙️  Configuration:")
    print(f"   • Max iterations: {frontend_binary.max_iterations}")
    print(f"   • Starting from iteration: {frontend_binary.iteration}")
    print(f"   • Git tracking: {'Enabled' if frontend_binary.use_git else 'Disabled'}")
    print()

    print("🔄 Starting Writer-Critic Loop...")
    print("="*80)

    # Run the full convergence loop
    try:
        success = await frontend_binary.run()

        print()
        print("="*80)
        print("📊 FINAL RESULTS")
        print("="*80)

        if success:
            print(f"✅ CONVERGED SUCCESSFULLY!")
        else:
            print(f"⚠️  Reached max iterations without full convergence")

        print(f"   • Total iterations: {frontend_binary.iteration}")
        print(f"   • Final compliance: {frontend_binary.state.get('compliance_score', 0)}%")
        print(f"   • Issues remaining: {len(frontend_binary.state.get('issues_remaining', []))}")

        # Show convergence history
        history = frontend_binary.get_convergence_history()
        if history:
            print()
            print("📈 Convergence History:")
            for point in history:
                bar = '█' * (point['compliance_score'] // 5)
                print(f"   Iteration {point['iteration']:2d}: [{bar:20s}] {point['compliance_score']:3d}% ({point['issues_count']} issues)")

        # Show top remaining issues if any
        if frontend_binary.state.get('issues_remaining'):
            print()
            print("🔧 Top Remaining Issues:")
            for i, issue in enumerate(frontend_binary.state.get('issues_remaining', [])[:5], 1):
                print(f"   {i}. {issue}")

        # Show working files
        if frontend_binary.state.get('working_files'):
            print()
            print(f"✅ Working Files ({len(frontend_binary.state.get('working_files', []))} total):")
            for file in frontend_binary.state.get('working_files', [])[:10]:
                print(f"   • {file}")

        # Show stable files
        if frontend_binary.state.get('stable_files'):
            print()
            print(f"🔒 Stable Files (Do Not Touch):")
            for file in frontend_binary.state.get('stable_files', [])[:5]:
                print(f"   • {file}")

        print()
        print("="*80)
        print(f"⏱️  Completed at: {datetime.now():%Y-%m-%d %H:%M:%S}")
        print("="*80)

        return success

    except KeyboardInterrupt:
        print()
        print("⚠️  Interrupted by user")
        print(f"   • Stopped at iteration: {frontend_binary.iteration}")
        print(f"   • Current compliance: {frontend_binary.state.get('compliance_score', 0)}%")
        print(f"   • State saved to: {state_file}")
        print()
        print("💡 You can resume from this point by running the script again")
        return False

    except Exception as e:
        logger.error(f"❌ Error during convergence: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return False


if __name__ == "__main__":
    print("🎯 Frontend Implementation Binary - Convergence Runner")
    print("This will run multiple Writer-Critic iterations until convergence.")
    print("Press Ctrl+C at any time to interrupt (state will be saved).")
    print()

    success = asyncio.run(run_frontend_convergence())
    sys.exit(0 if success else 1)