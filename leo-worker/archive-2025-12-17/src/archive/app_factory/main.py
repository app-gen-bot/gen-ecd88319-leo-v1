#!/usr/bin/env python3
"""AI App Factory - Simplified Pipeline.

Usage:
    python -m app_factory.main /path/to/workspace "Create a todo app"
    python -m app_factory.main /path/to/workspace "Create a todo app" --frontend-port 5001
"""

import argparse
import logging
import shutil
import tempfile
from pathlib import Path

import anyio
from app_factory import stages
from app_factory.initialization.frontend import initialize_frontend
from app_factory.stages import stage_2_wireframe
from app_factory.utils import Timer
from cc_agent import AgentResult
from cc_agent.logging import setup_logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


async def run_pipeline(
    workspace_path: str,
    user_prompt: str,
    frontend_port: int = 5000,
    backend_port: int = 8000
) -> dict[str, AgentResult]:
    """Simplified, stateless pipeline that auto-detects existing work.
    
    Args:
        workspace_path: Full path to workspace directory
        user_prompt: User's app description (for PRD generation if needed)
        frontend_port: Port for frontend development server
        backend_port: Port for backend development server
        
    Returns:
        Dictionary of results from executed stages
    """
    results = {}
    workspace = Path(workspace_path)
    specs_dir = workspace / "specs"
    
    # Ensure workspace and specs directory exist
    workspace.mkdir(parents=True, exist_ok=True)
    specs_dir.mkdir(exist_ok=True)
    
    # Development optimization: Copy template specs if they exist
    template_specs_dir = Path(__file__).parent.parent.parent / "template-specs"
    prd_path = specs_dir / "business_prd.md"
    interaction_spec_path = specs_dir / "frontend-interaction-spec.md"
    
    if template_specs_dir.exists():
        template_prd = template_specs_dir / "business_prd.md"
        template_fis = template_specs_dir / "frontend-interaction-spec.md"
        
        if template_prd.exists() and not prd_path.exists():
            shutil.copy(template_prd, prd_path)
            logger.info(f"📋 Copied template PRD to {prd_path}")
        
        if template_fis.exists() and not interaction_spec_path.exists():
            shutil.copy(template_fis, interaction_spec_path)
            logger.info(f"📋 Copied template FIS to {interaction_spec_path}")
    
    # Extract app name from workspace path
    app_name = workspace.name
    logger.info(f"\n🏭 Simplified Pipeline for {app_name}")
    logger.info(f"📁 Workspace: {workspace_path}")
    logger.info(f"🔌 Frontend Port: {frontend_port}, Backend Port: {backend_port}")
    
    # Stage 0: PRD Generation (if needed)
    if not prd_path.exists():
        logger.info(f"\n⚡ Stage 0: PRD not found, generating from prompt...")
        logger.info(f"📝 User prompt: {user_prompt[:100]}...")
        
        # Run PRD generation
        temp_dir = Path(tempfile.mkdtemp(prefix="app_factory_stage0_"))
        prd_result, returned_app_name, temp_prd_path = await stages.stage_0_prd.run_stage(
            user_prompt, temp_dir, app_name=app_name
        )
        results["prd"] = prd_result
        
        if prd_result.success and temp_prd_path.exists():
            # Move PRD to specs directory
            shutil.move(str(temp_prd_path), str(prd_path))
            logger.info(f"✅ PRD saved to {prd_path}")
        else:
            logger.error(f"❌ Stage 0 failed: {prd_result.content}")
            return results
            
        # Clean up temp directory
        shutil.rmtree(temp_dir)
    else:
        logger.info(f"\n⏭️ Stage 0: PRD exists at {prd_path}, skipping")
    
    # Stage 1: Interaction Spec (if needed)
    if not interaction_spec_path.exists():
        logger.info(f"\n⚡ Stage 1: Interaction spec not found, generating...")
        
        # Read PRD content
        prd_content = prd_path.read_text()
        
        # Run interaction spec generation (always use iterative mode)
        interaction_result = await stages.stage_1_interaction_spec.run_stage(
            prd_content, 
            iterative_mode=True,
            app_name=app_name,
            app_dir=workspace
        )
        results["interaction_spec"] = interaction_result
        
        if not interaction_result.success:
            logger.error(f"❌ Stage 1 failed: {interaction_result.content}")
            return results
        else:
            logger.info(f"✅ Interaction spec saved to {interaction_spec_path}")
    else:
        logger.info(f"\n⏭️ Stage 1: Interaction spec exists at {interaction_spec_path}, skipping")
    
    # Stage 2: Wireframe (always run if specs exist)
    if prd_path.exists() and interaction_spec_path.exists():
        logger.info(f"\n⚡ Stage 2: Generating wireframe...")
        
        # Initialize frontend with assigned port
        logger.info(f"🎨 Initializing frontend project on port {frontend_port}...")
        success, message = initialize_frontend(workspace, app_name, frontend_port)
        
        if success:
            logger.info(f"✅ {message}")
        else:
            logger.error(f"❌ Frontend initialization failed: {message}")
            return results
        
        # Run wireframe generation
        wireframe_result = await stage_2_wireframe.run_stage(app_name, specs_dir, workspace)
        results["wireframe"] = wireframe_result
        
        if not wireframe_result.success:
            logger.error(f"❌ Stage 2 failed: {wireframe_result.content}")
        else:
            logger.info(f"✅ Wireframe generation completed")
    else:
        logger.warning("⚠️ Cannot run Stage 2: Missing PRD or interaction spec")
    
    logger.info(f"\n🎉 Simplified pipeline completed for {app_name}")
    return results


async def main():
    """Simplified main entry point for the App Factory."""
    parser = argparse.ArgumentParser(description="AI App Factory - Simplified Pipeline")
    parser.add_argument("workspace_path", help="Path to the workspace directory")
    parser.add_argument("user_prompt", help="User prompt describing the app to create")
    parser.add_argument("--frontend-port", type=int, default=5000, help="Frontend port (default: 5000)")
    parser.add_argument("--backend-port", type=int, default=8000, help="Backend port (default: 8000)")
    args = parser.parse_args()
    
    # Initialize logging
    log_dir = Path(__file__).parent.parent.parent / "logs"
    setup_logging("app_factory", log_dir=log_dir)
    
    pipeline_timer = Timer("simplified_pipeline")
    
    logger.info(f"\n🏭 AI App Factory - Simplified Pipeline")
    logger.info("="*60)
    
    # Run the simplified pipeline
    results = await run_pipeline(
        workspace_path=args.workspace_path,
        user_prompt=args.user_prompt,
        frontend_port=args.frontend_port,
        backend_port=args.backend_port
    )
    
    # Display results summary
    logger.info("\n" + "="*60)
    logger.info("📊 Pipeline Results Summary")
    logger.info("="*60)
    
    for stage_name, result in results.items():
        if result.success:
            cost_str = f"${result.cost:.4f}" if result.cost > 0 else "Free"
            logger.info(f"✅ {stage_name.replace('_', ' ').title()}: Success ({cost_str})")
        else:
            logger.info(f"❌ {stage_name.replace('_', ' ').title()}: Failed")
    
    # Calculate total cost
    total_cost = sum(result.cost for result in results.values() if result.cost > 0)
    logger.info(f"\n💰 Total Cost: ${total_cost:.4f}")
    logger.info(f"⏱️ Total time: {pipeline_timer.elapsed_str()}")
    logger.info(f"\n🎉 App available at: {args.workspace_path}")


if __name__ == "__main__":
    anyio.run(main)