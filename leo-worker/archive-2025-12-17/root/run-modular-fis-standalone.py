#!/usr/bin/env python3
"""Standalone script to run modular FIS generation on existing app artifacts.

This script generates:
1. Master Frontend Interaction Spec with reusable patterns
2. Individual page specs for each page in pages-and-routes.md

Prerequisites (must exist in app directory):
- app/specs/plan.md
- app/specs/pages-and-routes.md
- app/shared/schema.zod.ts
- app/shared/contracts/*.contract.ts
"""

import asyncio
import logging
from pathlib import Path
import sys

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent / "src"))

from app_factory_leonardo_replit.orchestrators.parallel_fis_generator import ParallelFISOrchestrator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def generate_modular_fis(
    app_dir: Path,
    max_concurrency: int = 5,
    timeout_per_page: int = 1800,
    retry_attempts: int = 3,
    no_parallel: bool = False,
    resume: bool = False
):
    """Generate modular FIS (master + page specs) for an existing app.

    Args:
        app_dir: Path to the app directory (e.g., apps/timeless-weddings-phase1/app)
        max_concurrency: Maximum concurrent page generations (default: 5)
        timeout_per_page: Timeout per page in seconds (default: 1800 = 30 minutes)
        retry_attempts: Number of retry attempts per page (default: 3)
        no_parallel: Disable parallelization (sequential generation)
        resume: Resume from previous partial generation
    """
    logger.info(f"🚀 Starting modular FIS generation for: {app_dir}")

    # Validate prerequisites
    specs_dir = app_dir / "specs"
    plan_path = specs_dir / "plan.md"
    tech_spec_path = specs_dir / "pages-and-routes.md"
    schema_path = app_dir / "shared" / "schema.zod.ts"
    contracts_dir = app_dir / "shared" / "contracts"

    missing_prereqs = []
    if not plan_path.exists():
        missing_prereqs.append(str(plan_path))
    if not tech_spec_path.exists():
        missing_prereqs.append(str(tech_spec_path))
    if not schema_path.exists():
        missing_prereqs.append(str(schema_path))
    if not contracts_dir.exists():
        missing_prereqs.append(str(contracts_dir))

    if missing_prereqs:
        logger.error(f"❌ Missing prerequisites:")
        for prereq in missing_prereqs:
            logger.error(f"   - {prereq}")
        return False

    logger.info(f"✅ All prerequisites found")
    logger.info(f"   📄 Plan: {plan_path.name}")
    logger.info(f"   📄 Tech Spec: {tech_spec_path.name}")
    logger.info(f"   📄 Schema: {schema_path.name}")
    logger.info(f"   📁 Contracts: {len(list(contracts_dir.glob('*.contract.ts')))} files")

    # Use parallel orchestrator (or sequential if requested)
    if no_parallel:
        logger.warning("⚠️  Sequential mode enabled (--no-parallel)")
        max_concurrency = 1

    logger.info(f"\n{'='*60}")
    logger.info(f"Parallel FIS Generation")
    logger.info(f"{'='*60}")
    logger.info(f"   Max concurrency: {max_concurrency}")
    logger.info(f"   Timeout per page: {timeout_per_page}s")
    logger.info(f"   Retry attempts: {retry_attempts}")
    logger.info(f"   Resume mode: {'enabled' if resume else 'disabled'}")

    # Create orchestrator
    orchestrator = ParallelFISOrchestrator(
        app_dir=app_dir,
        max_concurrency=max_concurrency,
        timeout_per_page=timeout_per_page,
        retry_attempts=retry_attempts
    )

    # Run orchestrated generation
    results = await orchestrator.generate_all_specs(resume=resume)

    # Process results
    if results.get('error'):
        logger.error(f"❌ Generation failed: {results['error']}")
        return False

    master_result = results['master']
    pages_result = results['pages']

    # Display summary
    logger.info(f"\n{'='*60}")
    logger.info(f"SUMMARY")
    logger.info(f"{'='*60}")

    logger.info(f"✅ Master Spec: {master_result['message']}")

    summary = pages_result['summary']
    logger.info(f"📊 Page Specs: {summary['succeeded']}/{summary['total']} successful")
    logger.info(f"   Success Rate: {summary['success_rate']}")

    # Show failures
    if pages_result['failed']:
        logger.warning(f"\n⚠️  Failed pages:")
        for failure in pages_result['failed']:
            logger.warning(f"   - {failure['page']}: {failure['error']}")
        logger.warning(f"\n💡 Tip: Use --resume to retry failed pages")

    # Show generated files
    logger.info(f"\n📁 Generated files:")
    master_spec_path = specs_dir / "frontend-interaction-spec-master.md"
    if master_spec_path.exists():
        logger.info(f"   {master_spec_path}")

    pages_dir = specs_dir / "pages"
    if pages_dir.exists():
        for spec_file in sorted(pages_dir.glob("*.md")):
            logger.info(f"   {spec_file}")

    return summary['succeeded'] == summary['total']


async def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Generate modular FIS (master + page specs) for an existing app with parallel processing"
    )
    parser.add_argument(
        "app_dir",
        type=Path,
        help="Path to app directory (e.g., apps/timeless-weddings-phase1/app)"
    )
    parser.add_argument(
        "--max-concurrency",
        type=int,
        default=5,
        help="Maximum concurrent page generations (default: 5)"
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=1800,
        help="Timeout per page in seconds (default: 1800 = 30 minutes)"
    )
    parser.add_argument(
        "--retry-attempts",
        type=int,
        default=3,
        help="Number of retry attempts per page (default: 3)"
    )
    parser.add_argument(
        "--no-parallel",
        action="store_true",
        help="Disable parallelization (sequential generation for debugging)"
    )
    parser.add_argument(
        "--resume",
        action="store_true",
        help="Resume from previous partial generation"
    )

    args = parser.parse_args()

    app_dir = args.app_dir.resolve()

    if not app_dir.exists():
        logger.error(f"❌ App directory not found: {app_dir}")
        sys.exit(1)

    if not app_dir.is_dir():
        logger.error(f"❌ Not a directory: {app_dir}")
        sys.exit(1)

    logger.info(f"🎯 Target app directory: {app_dir}")

    success = await generate_modular_fis(
        app_dir=app_dir,
        max_concurrency=args.max_concurrency,
        timeout_per_page=args.timeout,
        retry_attempts=args.retry_attempts,
        no_parallel=args.no_parallel,
        resume=args.resume
    )

    if success:
        logger.info(f"\n🎉 Modular FIS generation completed successfully!")
        sys.exit(0)
    else:
        logger.error(f"\n❌ Modular FIS generation failed")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
