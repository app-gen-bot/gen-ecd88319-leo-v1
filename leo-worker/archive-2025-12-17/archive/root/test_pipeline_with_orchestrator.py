#!/usr/bin/env python3
"""Test the complete pipeline with the new orchestrator."""

import asyncio
import logging
from pathlib import Path
from cc_agent.logging import setup_logging
from app_factory.main import run_pipeline

# Set up logging
log_dir = Path(__file__).parent / "logs"
setup_logging("test_pipeline", log_dir=log_dir)
logger = logging.getLogger(__name__)


async def test_pipeline():
    """Test the complete pipeline with orchestrator."""
    
    user_prompt = "I want to build a simple note-taking app with folders and tags"
    
    logger.info(f"\n{'='*60}")
    logger.info(f"Testing complete pipeline")
    logger.info(f"User prompt: {user_prompt}")
    logger.info("="*60)
    
    try:
        # Run the pipeline
        results = await run_pipeline(user_prompt)
        
        # Log results
        logger.info(f"\n{'='*60}")
        logger.info("Pipeline Results:")
        logger.info("="*60)
        
        for stage, result in results.items():
            if result.success:
                logger.info(f"✅ {stage}: Success (Cost: ${result.cost:.4f})")
            else:
                logger.info(f"❌ {stage}: Failed")
                
        # Check if PRD was generated
        if "prd" in results and results["prd"].success:
            logger.info(f"\nGenerated PRD preview:")
            logger.info("-" * 40)
            preview = results["prd"].content[:800] + "..."
            logger.info(preview)
            
    except Exception as e:
        logger.error(f"❌ Pipeline test failed: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_pipeline())