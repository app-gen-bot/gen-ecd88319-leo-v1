#!/usr/bin/env python3
"""AI App Factory - Simplified Pipeline.

Usage:
    python -m app_factory.main /path/to/workspace "Create a todo app"
    python -m app_factory.main /path/to/workspace "Create a todo app" --frontend-port 5001
"""

import argparse
import logging
import shutil
from pathlib import Path

import anyio
from app_factory_leonardo import stages
from app_factory_leonardo.stages import plan_stage, preview_stage, build_stage
from app_factory_leonardo.initialization.frontend import initialize_frontend
from app_factory_leonardo.stages import stage_2_wireframe
from app_factory_leonardo.utils import Timer
from cc_agent import AgentResult
from cc_agent.logging import setup_logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def copy_template_specs_if_available(specs_dir: Path) -> None:
    """Development optimization: Copy template specs if they exist.
    
    This is a temporary function that copies pre-made specs from template-specs/
    into the workspace's specs directory to skip generation during development.
    """
    # Source paths (static template location)
    template_specs_dir = Path(__file__).parent.parent.parent / "template-specs"
    
    if not template_specs_dir.exists():
        return
    
    # Define source templates
    template_prd = template_specs_dir / "business_prd.md"
    template_fis = template_specs_dir / "frontend-interaction-spec.md"
    
    # Define destination paths in workspace
    prd_path = specs_dir / "business_prd.md"
    interaction_spec_path = specs_dir / "frontend-interaction-spec.md"
    
    # Copy if templates exist and destinations don't
    if template_prd.exists() and not prd_path.exists():
        shutil.copy(template_prd, prd_path)
        logger.info(f"📋 Copied template PRD to {prd_path}")
    
    if template_fis.exists() and not interaction_spec_path.exists():
        shutil.copy(template_fis, interaction_spec_path)
        logger.info(f"📋 Copied template FIS to {interaction_spec_path}")


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
    
    # Define stage directories
    plan_dir = workspace / "plan"
    preview_html_dir = workspace / "preview-html"
    preview_react_dir = workspace / "preview-react"
    app_dir = workspace / "app"
    build_dir = app_dir / "shared"
    
    # Ensure workspace and stage directories exist
    workspace.mkdir(parents=True, exist_ok=True)
    plan_dir.mkdir(exist_ok=True)
    preview_html_dir.mkdir(exist_ok=True)
    preview_react_dir.mkdir(exist_ok=True)
    app_dir.mkdir(exist_ok=True)
    build_dir.mkdir(exist_ok=True)
    
    # Define paths for artifacts in their respective directories
    plan_path = plan_dir / "plan.md"
    preview_path = preview_html_dir / "preview.html"
    react_component_path = preview_react_dir / "App.tsx"
    schema_path = build_dir / "schema.ts"
    interaction_spec_path = plan_dir / "frontend-interaction-spec.md"  # Future: may move to separate stage
    
    # Development optimization: Copy template specs if they exist
    # copy_template_specs_if_available(specs_dir)
    
    # Extract app name from workspace path
    app_name = workspace.name
    logger.info(f"\n🏭 Leonardo Pipeline for {app_name}")
    logger.info(f"📁 Workspace: {workspace_path}")
    logger.info(f"🔌 Frontend Port: {frontend_port}, Backend Port: {backend_port}")
    
    # Plan Stage: Application Plan Generation (if needed)
    if not plan_path.exists():
        logger.info(f"\n⚡ Plan Stage: Plan not found, generating from prompt...")
        logger.info(f"📝 User prompt: {user_prompt[:100]}...")
        
        # Run Plan generation - write directly to plan directory
        plan_result, returned_app_name, plan_path_result = await plan_stage.run_stage(
            user_prompt, plan_dir, app_name=app_name
            # enable_research=True  # Uncomment for complex apps
        )
        results["plan"] = plan_result
        
        if plan_result.success:
            logger.info(f"✅ Plan saved to {plan_path}")
        else:
            logger.error(f"❌ Plan Stage failed: {plan_result.content}")
            return results
    else:
        logger.info(f"\n⏭️ Plan Stage: Plan exists at {plan_path}, skipping")
    
    # Preview Stage: HTML Preview Generation (if needed)
    if not preview_path.exists():
        logger.info(f"\n⚡ Preview Stage: Preview not found, generating from plan...")
        
        # Run Preview generation with both HTML and React output directories
        preview_result, preview_filename = await preview_stage.run_stage(
            plan_path=plan_path,
            output_dir=preview_html_dir,
            react_output_dir=preview_react_dir
        )
        results["preview"] = preview_result
        
        if preview_result.success:
            logger.info(f"✅ Preview saved to {preview_path}")
        else:
            logger.error(f"❌ Preview Stage failed: {preview_result.content}")
            return results
    else:
        logger.info(f"\n⏭️ Preview Stage: Preview exists at {preview_path}, skipping")
    
    # Build Stage: Database Schema Generation (if needed)
    if not schema_path.exists():
        # Only run build stage if we have both plan and React component
        if plan_path.exists() and react_component_path.exists():
            logger.info(f"\n⚡ Build Stage: Schema not found, generating from plan and React component...")
            
            # Run Schema generation
            build_result, schema_filename = await build_stage.run_stage(
                plan_path=plan_path,
                react_component_path=react_component_path,
                output_dir=build_dir
            )
            results["build"] = build_result
            
            if build_result.success:
                logger.info(f"✅ Schema saved to {schema_path}")
            else:
                logger.error(f"❌ Build Stage failed: {build_result.content}")
                return results
        else:
            logger.warning("⚠️ Cannot run Build Stage: Missing plan.md or App.tsx files")
    else:
        logger.info(f"\n⏭️ Build Stage: Schema exists at {schema_path}, skipping")

    # TEMPORARY: Exit after Build Stage for Leonardo development  
    logger.info(f"\n🔬 Leonardo Mode: Exiting after Build Stage")
    return results
    
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