#!/usr/bin/env python3
"""Simple test for the orchestrator agent - single prompt."""

import asyncio
import logging
from pathlib import Path
from cc_agent.logging import setup_logging
from app_factory.stages import stage_0_prd
import tempfile

# Set up logging
log_dir = Path(__file__).parent / "logs"
setup_logging("test_orchestrator_simple", log_dir=log_dir)
logger = logging.getLogger(__name__)


async def test_simple():
    """Test the orchestrator with a single prompt."""
    
    user_prompt = "I want to build a simple task management app like Todoist"
    
    logger.info(f"\n{'='*60}")
    logger.info(f"Testing orchestrator with: {user_prompt}")
    logger.info("="*60)
    
    try:
        # Create temp directory for output
        temp_dir = Path(tempfile.mkdtemp(prefix="test_orchestrator_"))
        logger.info(f"Output directory: {temp_dir}")
        
        # Run stage 0
        result, app_name, prd_path = await stage_0_prd.run_stage(user_prompt, temp_dir)
        
        if result.success:
            logger.info(f"\n✅ SUCCESS!")
            logger.info(f"App name: {app_name}")
            logger.info(f"PRD saved to: {prd_path}")
            logger.info(f"Cost: ${result.cost:.4f}")
            logger.info(f"Turns: {result.metadata.get('turns', 1)}")
            
            # Show PRD preview
            if prd_path and prd_path.exists():
                with open(prd_path, 'r') as f:
                    content = f.read()
                logger.info(f"\nPRD Preview (first 1000 chars):")
                logger.info("-" * 60)
                logger.info(content[:1000] + "..." if len(content) > 1000 else content)
        else:
            logger.error(f"❌ FAILED: {result.metadata.get('error', 'Unknown error')}")
            
    except Exception as e:
        logger.error(f"❌ Exception: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_simple())