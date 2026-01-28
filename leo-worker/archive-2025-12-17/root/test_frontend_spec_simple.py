#!/usr/bin/env python3
"""Simple test for Frontend Interaction Spec Writer agent only."""

import asyncio
import logging
from pathlib import Path

from app_factory_leonardo_replit.agents.frontend_interaction_spec import FrontendInteractionSpecAgent

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


async def test_writer_only():
    """Test just the Writer agent."""

    workspace = Path("/Users/labheshpatel/apps/app-factory/apps/app-phase2-20250927-134730")
    output_dir = workspace / "plan"

    # Create a minimal test
    plan_content = "Create a wedding chapel booking platform"
    ui_component_spec = "Basic UI components for the app"
    schema_content = "// Minimal schema\nexport const chapels = pgTable('chapels', { id: text('id') });"
    contracts_content = {"chapels.contract.ts": "export const chapelsContract = { getChapels: {} };"}
    common_contract_content = "export const commonResponses = {};"

    # Initialize writer agent
    writer_agent = FrontendInteractionSpecAgent(cwd=str(output_dir))

    logger.info("Testing Writer Agent with minimal inputs...")

    success, spec_content, message = await writer_agent.generate_interaction_spec(
        plan_content=plan_content,
        ui_component_spec=ui_component_spec,
        schema_content=schema_content,
        contracts_content=contracts_content,
        common_contract_content=common_contract_content,
        previous_critic_response=""
    )

    if success:
        logger.info(f"✅ Writer succeeded: {message}")
        logger.info(f"Spec content length: {len(spec_content)} chars")

        # Check if file was created
        spec_path = output_dir / "frontend-interaction-spec.md"
        if spec_path.exists():
            logger.info(f"✅ File created: {spec_path}")
        else:
            logger.info("❌ File was NOT created")

            # Save the content manually for inspection
            test_path = output_dir / "frontend-interaction-spec-test.md"
            test_path.write_text(spec_content)
            logger.info(f"Saved content to: {test_path}")
    else:
        logger.error(f"❌ Writer failed: {message}")

    return success


if __name__ == "__main__":
    success = asyncio.run(test_writer_only())
    if success:
        print("\n✅ Test passed!")
    else:
        print("\n❌ Test failed!")