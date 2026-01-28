#!/usr/bin/env python3
"""Test Stage 2 (Wireframe Generation) in isolation."""

import asyncio
import logging
from pathlib import Path
import sys

# Add the src directory to the path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from app_factory.stages import stage_2_wireframe_v2
from cc_agent import AgentResult

# Set up detailed logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('stage2_test.log')
    ]
)

logger = logging.getLogger(__name__)


async def test_stage2():
    """Test Stage 2 with the interaction spec from iterative mode."""
    
    # Use the iterative output which has better quality
    spec_path = Path("/Users/labheshpatel/apps/app-factory/stage1_output_iterative.md")
    
    if not spec_path.exists():
        logger.error(f"Interaction spec not found at: {spec_path}")
        return
    
    # For Stage 2, we need to set up the proper app structure
    # Let's use the existing app directory from the pipeline run
    app_name = "app_20250713_181421"
    app_dir = Path(f"/Users/labheshpatel/apps/app-factory/apps/{app_name}")
    
    # Copy the interaction spec to the proper location
    specs_dir = app_dir / "specs"
    specs_dir.mkdir(parents=True, exist_ok=True)
    
    target_spec_path = specs_dir / "frontend-interaction-spec.md"
    
    # Copy the good spec to the app directory
    import shutil
    shutil.copy(spec_path, target_spec_path)
    logger.info(f"Copied interaction spec to: {target_spec_path}")
    
    logger.info(f"Testing Stage 2 with app: {app_name}")
    logger.info("=" * 60)
    
    try:
        # Run Stage 2 v2 (Critic-Writer pattern)
        result = await stage_2_wireframe_v2.run_stage(app_name)
        
        logger.info(f"\nResult summary:")
        logger.info(f"- Success: {result.success}")
        logger.info(f"- Cost: ${result.cost:.4f}")
        
        if result.success:
            logger.info(f"- Content preview: {result.content[:200]}...")
            logger.info(f"- Metadata: {result.metadata}")
            
            # Check what files were created
            wireframes_dir = app_dir / "specs" / "wireframes"
            if wireframes_dir.exists():
                wireframe_files = list(wireframes_dir.glob("*.md"))
                logger.info(f"\nWireframe files created: {len(wireframe_files)}")
                for wf in wireframe_files[:5]:  # Show first 5
                    logger.info(f"  - {wf.name}")
                    
        else:
            logger.error(f"- Error: {result.error}")
            logger.error(f"- Content: {result.content}")
            
    except Exception as e:
        logger.error(f"Exception in Stage 2: {e}", exc_info=True)
    
    logger.info("\n" + "="*60)
    logger.info("Stage 2 testing complete")
    logger.info("Check stage2_test.log for detailed output")


if __name__ == "__main__":
    asyncio.run(test_stage2())