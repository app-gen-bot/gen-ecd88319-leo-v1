#!/usr/bin/env python3
"""AI App Factory - Multi-agent system for generating applications."""

import argparse
import anyio
import shutil
import tempfile
import logging
from pathlib import Path
from typing import Tuple
from cc_agent import AgentResult
from cc_agent.logging import setup_logging
from app_factory import stages
from app_factory.utils import scaffold_project, Timer

# Set up module logger
logger = logging.getLogger(__name__)


# temp_stage_0 removed - now using real orchestrator agent


async def temp_stage_1(app_name: str) -> bool:
    """Temporary Stage 1 implementation for development.
    
    Simulates interaction spec generation by copying an example.
    
    Args:
        app_name: Name of the app (e.g., "slack-clone")
        
    Returns:
        bool: Success status
    """
    timer = Timer("temp_stage_1")
    logger.info("\n" + "="*60)
    logger.info("🖱️ Stage 1: Generating Frontend Interaction Specification (Temporary)")
    logger.info("="*60)
    
    # Derive paths by convention
    project_root = Path(__file__).parent.parent.parent
    app_dir = project_root / "apps" / app_name
    
    # Source and destination paths
    source_spec = project_root / "examples" / "slack-clone" / "orchestrator" / "output" / "frontend-interaction-spec-from-prd.md"
    dest_spec = app_dir / "specs" / "frontend-interaction-spec.md"
    
    # Copy the example spec
    if source_spec.exists():
        shutil.copy2(source_spec, dest_spec)
        logger.info("✅ Interaction spec generated (copied from example)")
    else:
        logger.error(f"❌ Example interaction spec not found at: {source_spec}")
        return False
    
    logger.info(f"⏱️ Stage 1 completed in {timer.elapsed_str()}")
    return True


async def run_pipeline(user_prompt: str) -> dict[str, AgentResult]:
    """Run the complete App Factory pipeline.
    
    Args:
        user_prompt: Initial user request
        
    Returns:
        Dictionary of results from each pipeline stage
    """
    results = {}
    
    # Stage 0: Generate PRD using the real orchestrator agent
    logger.info("\n" + "="*60)
    logger.info("🏭 Stage 0: Generating Business PRD")
    logger.info("="*60)
    
    # Create temp directory for PRD
    temp_dir = Path(tempfile.mkdtemp(prefix="app_factory_stage0_"))
    
    # Run the orchestrator to generate PRD
    prd_result, app_name, prd_path = await stages.stage_0_prd.run_stage(user_prompt, temp_dir)
    results["prd"] = prd_result
    
    if not prd_result.success:
        logger.error("❌ Stage 0 failed")
        return results
    
    # Scaffold the project (handles PRD moving internally)
    app_dir = scaffold_project(app_name, prd_path)

    # Stage 1: Generate Frontend Interaction Spec (temporary implementation)
    stage1_success = await temp_stage_1(app_name)
    if not stage1_success:
        logger.error("❌ Stage 1 failed")
        return results
    
    # Stage 2: Interaction Spec to Wireframe
    wireframe_result = await stages.stage_2_wireframe.run_stage(app_name)
    results["wireframe"] = wireframe_result
    
    if not wireframe_result.success:
        logger.error("❌ Stage 2 failed")
        return results
    
    # TODO: Stage 3 - Wireframe to Technical Specs
    # wireframe_path = "/output/frontend"  # Adjust based on actual output
    # specs_result = await stages.stage_3_technical_spec.run_stage(wireframe_path)
    # results["technical_specs"] = specs_result
    
    # TODO: Stage 4 - Technical Specs to Backend
    # # Parse the specs_result to extract API contract and data models
    # backend_result = await stages.stage_4_backend.run_stage(api_contract, data_models)
    # results["backend"] = backend_result
    
    # TODO: Stage 5 - Deployment
    # deployment_result = await stages.stage_5_deployment.run_stage("/output/frontend", "/output/backend", "my-app")
    # results["deployment"] = deployment_result
    
    return results


async def main():
    """Main entry point for the App Factory."""
    # Set up centralized logging
    log_dir = Path(__file__).parent.parent.parent / "logs"
    setup_logger = setup_logging("app_factory", log_dir=log_dir)
    
    pipeline_timer = Timer("pipeline")
    
    logger.info("\n🏭 AI App Factory v0.1.0")
    logger.info("=" * 60)
    
    # Example user prompt (in practice, this would come from command line or API)
    user_prompt = "I want a Slack clone for my team"
    
    logger.info(f"\n📝 User request: {user_prompt}")
    
    # Run the pipeline
    results = await run_pipeline(user_prompt)
    
    # Display results summary
    logger.info("\n" + "="*60)
    logger.info("📊 Pipeline Results Summary")
    logger.info("="*60)
    
    total_cost = 0.0
    for stage, result in results.items():
        status = "✅" if result.success else "❌"
        logger.info(f"{status} {stage}: ${result.cost:.4f}")
        total_cost += result.cost
        
    logger.info(f"\n💰 Total cost: ${total_cost:.4f}")
    
    # Show generated PRD
    if "prd" in results and results["prd"].success:
        logger.info("\n" + "="*60)
        logger.info("📋 Generated Business PRD (Preview)")
        logger.info("="*60)
        # Show first 500 characters
        preview = results["prd"].content[:500] + "..." if len(results["prd"].content) > 500 else results["prd"].content
        logger.info(preview)
        logger.info("\n🎯 Next: Implement remaining pipeline agents to complete the app generation")

    logger.info(f"\n⏱️ Total time: {pipeline_timer.elapsed_str()}")

if __name__ == "__main__":
    anyio.run(main)