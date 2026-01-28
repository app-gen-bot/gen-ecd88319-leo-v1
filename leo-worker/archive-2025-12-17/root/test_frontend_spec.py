#!/usr/bin/env python3
"""Test script to verify Frontend Interaction Spec generation works correctly."""

import asyncio
import logging
from pathlib import Path

from app_factory_leonardo_replit.stages import frontend_interaction_spec_stage
from cc_agent import AgentResult

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


async def test_frontend_spec():
    """Test the Frontend Interaction Spec generation with an existing app."""

    # Use the latest app that has contracts already generated
    workspace = Path("/Users/labheshpatel/apps/app-factory/apps/app-phase2-20250927-134730")

    plan_path = workspace / "plan" / "plan.md"
    ui_component_spec_path = workspace / "plan" / "ui-component-spec.md"
    schema_path = workspace / "app" / "shared" / "schema.ts"
    contracts_dir = workspace / "app" / "shared" / "contracts"
    output_dir = workspace / "plan"

    # Check if all required files exist
    if not plan_path.exists():
        logger.error(f"Plan not found: {plan_path}")
        return

    if not ui_component_spec_path.exists():
        logger.error(f"UI component spec not found: {ui_component_spec_path}")
        return

    if not schema_path.exists():
        logger.error(f"Schema not found: {schema_path}")
        return

    if not contracts_dir.exists():
        logger.error(f"Contracts directory not found: {contracts_dir}")
        return

    logger.info("All required files found!")
    logger.info(f"Workspace: {workspace}")

    # Remove existing spec if it exists (for testing)
    spec_path = output_dir / "frontend-interaction-spec.md"
    if spec_path.exists():
        logger.info(f"Removing existing spec: {spec_path}")
        spec_path.unlink()

    # Run the Frontend Interaction Spec stage
    logger.info("\n" + "="*60)
    logger.info("Running Frontend Interaction Spec Stage")
    logger.info("="*60)

    result, filename = await frontend_interaction_spec_stage.run_stage(
        plan_path=plan_path,
        ui_component_spec_path=ui_component_spec_path,
        schema_path=schema_path,
        contracts_dir=contracts_dir,
        output_dir=output_dir,
        max_iterations=3
    )

    if result.success:
        logger.info(f"✅ SUCCESS: {result.content}")
        if spec_path.exists():
            size = spec_path.stat().st_size
            logger.info(f"✅ Spec file created: {spec_path} ({size:,} bytes)")

            # Show first 500 chars of the spec
            content = spec_path.read_text()[:500]
            logger.info(f"\nFirst 500 chars of spec:\n{content}...")
        else:
            logger.error("❌ Spec file was not created!")
    else:
        logger.error(f"❌ FAILED: {result.content}")

    return result


if __name__ == "__main__":
    result = asyncio.run(test_frontend_spec())
    if result and result.success:
        print("\n✅ Test passed!")
    else:
        print("\n❌ Test failed!")