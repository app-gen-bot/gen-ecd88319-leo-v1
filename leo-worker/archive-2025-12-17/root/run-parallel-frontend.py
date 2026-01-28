#!/usr/bin/env python
"""Run parallel frontend generation with FIS-based approach.

This script implements true parallel page generation using asyncio and
the modular FIS system (master spec + individual page specs).

Usage:
    python run-parallel-frontend.py /path/to/app [--max-concurrency N] [--timeout S]
"""

import argparse
import asyncio
import logging
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent))

from src.app_factory_leonardo_replit.orchestrators.parallel_frontend_generator import (
    ParallelFrontendOrchestrator
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def main():
    """Main entry point for parallel frontend generation."""
    parser = argparse.ArgumentParser(
        description='Generate frontend with true parallel page generation'
    )
    parser.add_argument(
        'app_dir',
        type=Path,
        help='Path to application directory'
    )
    parser.add_argument(
        '--max-concurrency',
        type=int,
        default=5,
        help='Maximum number of concurrent page generations (default: 5)'
    )
    parser.add_argument(
        '--timeout',
        type=int,
        default=1800,
        help='Timeout in seconds per page generation (default: 1800 = 30 minutes)'
    )
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Enable verbose logging'
    )

    args = parser.parse_args()

    # Resolve absolute path
    app_dir = args.app_dir.resolve()

    if not app_dir.exists():
        logger.error(f"ERROR: App directory not found: {app_dir}")
        return 1

    # Verify FIS specs exist
    master_spec = app_dir / "specs" / "frontend-interaction-spec-master.md"
    pages_dir = app_dir / "specs" / "pages"

    if not master_spec.exists():
        logger.error(f"ERROR: Master spec not found: {master_spec}")
        logger.error("   Run modular FIS generation first")
        return 1

    if not pages_dir.exists():
        logger.error(f"ERROR: Page specs directory not found: {pages_dir}")
        logger.error("   Run modular FIS generation first")
        return 1

    page_count = len(list(pages_dir.glob("*.md")))
    if page_count == 0:
        logger.error(f"ERROR: No page specs found in: {pages_dir}")
        return 1

    # Show configuration
    logger.info("=" * 60)
    logger.info("Parallel Frontend Generation Configuration")
    logger.info("=" * 60)
    logger.info(f"App Directory: {app_dir}")
    logger.info(f"Page Specs: {page_count}")
    logger.info(f"Max Concurrency: {args.max_concurrency}")
    logger.info(f"Timeout per Page: {args.timeout}s")
    logger.info("=" * 60)

    # Run the orchestrator
    orchestrator = ParallelFrontendOrchestrator(
        app_dir=app_dir,
        max_concurrency=args.max_concurrency,
        timeout_per_page=args.timeout
    )

    try:
        results = await orchestrator.orchestrate()

        # Display results
        logger.info("\n" + "=" * 60)
        logger.info("Final Results")
        logger.info("=" * 60)

        if results.get('error'):
            logger.error(f"ERROR: {results['error']}")
            return 1

        pages_result = results.get('pages_generated', {})
        validation = results.get('validation', {})

        # Pages summary
        summary = pages_result.get('summary', {})
        logger.info(f"Pages Generated: {summary.get('succeeded', 0)}/{summary.get('total', 0)}")
        logger.info(f"Success Rate: {summary.get('success_rate', 'N/A')}")

        # Failed pages
        failed = pages_result.get('failed', [])
        if failed:
            logger.warning(f"Failed Pages: {len(failed)}")
            for failure in failed:
                logger.warning(f"   - {failure['page']}: {failure.get('error', 'Unknown')}")

        # Validation results
        logger.info(f"Compliance Score: {validation.get('compliance_score', 0)}/100")
        logger.info(f"Validation: {validation.get('decision', 'unknown')}")

        if validation.get('errors'):
            logger.warning("Validation Issues:")
            for error in validation['errors']:
                logger.warning(f"   - {error}")

        # Return appropriate exit code
        if summary.get('succeeded', 0) == summary.get('total', 0) and validation.get('decision') == 'complete':
            logger.info("\nSUCCESS - All pages generated and validated successfully!")
            return 0
        elif summary.get('succeeded', 0) > 0:
            logger.warning(f"\nPARTIAL SUCCESS - {summary.get('succeeded', 0)} pages generated")
            return 2
        else:
            logger.error("\nFAILED - No pages generated successfully")
            return 1

    except Exception as e:
        logger.error(f"ERROR: Unexpected error: {e}")
        if args.verbose:
            import traceback
            traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)