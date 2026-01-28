#!/usr/bin/env python3
"""Leonardo App Factory - Simple Runner.

This script provides a simple way to run the Leonardo app factory pipeline
with a single command-line argument for the prompt.

Usage:
    uv run python src/app_factory_leonardo/run.py
    uv run python src/app_factory_leonardo/run.py "Create a task management app"
"""

import argparse
import asyncio
import logging
import shutil
import uuid
from datetime import datetime
from pathlib import Path

from app_factory_leonardo.main import run_pipeline
from app_factory_leonardo.utils import Timer
from cc_agent.logging import setup_logging

logger = logging.getLogger(__name__)


def generate_app_workspace_path(prompt: str) -> Path:
    """Generate a workspace path for the app.
    
    Args:
        prompt: User prompt (not used for now)
        
    Returns:
        Path to the workspace directory
    """
    # TEMPORARY: Use a hardcoded workspace name so we can reuse the workspace
    # This allows skipping plan generation if we like the existing plan.md
    workspace_name = "leonardo-todo"
    
    # TO RESTORE LATER:
    # # Generate a unique identifier
    # unique_id = str(uuid.uuid4())[:8]
    # timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    # workspace_name = f"leonardo_todo_{unique_id}_{timestamp}"
    
    workspace_path = Path(__file__).parent.parent.parent / "apps" / workspace_name
    
    return workspace_path


async def main():
    """Main entry point for the Leonardo app factory runner."""
    parser = argparse.ArgumentParser(description="Leonardo App Factory - Simple Runner")
    parser.add_argument(
        "prompt", 
        nargs="?", 
        default="Create a ToDo List app", 
        help="User prompt describing the app to create (default: 'Create a ToDo List app')"
    )
    parser.add_argument("--frontend-port", type=int, default=5000, help="Frontend port (default: 5000)")
    parser.add_argument("--backend-port", type=int, default=8000, help="Backend port (default: 8000)")
    args = parser.parse_args()
    
    # Initialize logging
    log_dir = Path(__file__).parent.parent.parent / "logs"
    setup_logging("leonardo_app_factory", log_dir=log_dir)
    
    # Generate workspace path
    workspace_path = generate_app_workspace_path(args.prompt)
    
    pipeline_timer = Timer("leonardo_pipeline")
    
    logger.info(f"\n🎨 Leonardo App Factory - Simple Runner")
    logger.info("="*60)
    logger.info(f"📝 Prompt: {args.prompt}")
    logger.info(f"📁 Workspace: {workspace_path}")
    logger.info(f"🔌 Frontend Port: {args.frontend_port}, Backend Port: {args.backend_port}")
    
    try:
        # TEMPORARY: Clean up app directory for fresh schema generation testing
        app_dir = workspace_path / "app"
        if app_dir.exists():
            logger.info(f"🧹 Cleaning up app directory for fresh testing: {app_dir}")
            shutil.rmtree(app_dir)
            logger.info("✅ App directory cleaned up")
        
        # Run the Leonardo pipeline
        logger.info(f"\n🚀 Starting Leonardo pipeline...")
        results = await run_pipeline(
            workspace_path=str(workspace_path),
            user_prompt=args.prompt,
            frontend_port=args.frontend_port,
            backend_port=args.backend_port
        )
        
        # Display results summary
        logger.info("\n" + "="*60)
        logger.info("📊 Pipeline Results Summary")
        logger.info("="*60)
        
        success_count = 0
        total_cost = 0.0
        
        for stage_name, result in results.items():
            if result.success:
                cost_str = f"${result.cost:.4f}" if result.cost > 0 else "Free"
                logger.info(f"✅ {stage_name.replace('_', ' ').title()}: Success ({cost_str})")
                success_count += 1
                total_cost += result.cost if result.cost > 0 else 0
            else:
                logger.info(f"❌ {stage_name.replace('_', ' ').title()}: Failed")
                logger.info(f"   Error: {result.content}")
        
        # Overall summary
        logger.info("\n" + "="*60)
        logger.info(f"📈 Overall: {success_count}/{len(results)} stages completed")
        logger.info(f"💰 Total Cost: ${total_cost:.4f}")
        logger.info(f"⏱️ Total Time: {pipeline_timer.elapsed_str()}")
        
        if success_count == len(results):
            logger.info(f"\n🎉 Leonardo app successfully created!")
            logger.info(f"📁 App location: {workspace_path}")
            if workspace_path.exists() and (workspace_path / "frontend").exists():
                logger.info(f"🚀 To run the app:")
                logger.info(f"   cd {workspace_path}/frontend")
                logger.info(f"   npm run dev")
        else:
            logger.warning(f"\n⚠️ Pipeline completed with {len(results) - success_count} failed stage(s)")
            
    except Exception as e:
        logger.error(f"\n❌ Pipeline failed with error: {str(e)}")
        logger.error(f"   See logs for more details")
        raise


if __name__ == "__main__":
    asyncio.run(main())