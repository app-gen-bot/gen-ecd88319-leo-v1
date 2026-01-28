#!/usr/bin/env python3
"""Test script to run Sprint Breakdown Agent on existing PRD."""

import asyncio
import logging
from pathlib import Path
import sys

# Add project root to path
sys.path.append(str(Path(__file__).parent))

from app_factory.stages import stage_0_5_sprint_breakdown

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def test_sprint_breakdown():
    """Test the Sprint Breakdown Agent on PawsFlow PRD."""
    
    # Path to PawsFlow PRD
    prd_path = Path("apps/app_20250716_074453/specs/business_prd.md")
    
    if not prd_path.exists():
        logger.error(f"PRD not found at {prd_path}")
        return
    
    # Read PRD content
    prd_content = prd_path.read_text()
    logger.info(f"Loaded PRD from {prd_path}")
    logger.info(f"PRD size: {len(prd_content)} characters")
    
    # Create output directory for sprint PRDs
    output_dir = Path("test_output/pawsflow_sprints")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Run the sprint breakdown
    logger.info("\n" + "="*60)
    logger.info("🚀 Running Sprint Breakdown on PawsFlow PRD")
    logger.info("="*60)
    
    result, sprint_paths = await stage_0_5_sprint_breakdown.run_stage(
        prd_content=prd_content,
        app_name="pawsflow",
        output_dir=output_dir,
        num_sprints=3  # Break into 3 sprints
    )
    
    # Display results
    if result.success:
        logger.info("\n✅ Sprint breakdown completed successfully!")
        logger.info(f"💰 Cost: ${result.cost:.4f}")
        logger.info(f"📄 Number of sprints created: {len(sprint_paths)}")
        
        # Show file paths
        logger.info("\n📁 Generated files:")
        for file in output_dir.iterdir():
            if file.is_file():
                logger.info(f"   - {file.name}")
        
        # Display sprint summaries
        logger.info("\n📋 Sprint Summaries:")
        for i, sprint_path in enumerate(sprint_paths, 1):
            logger.info(f"\n--- Sprint {i}: {sprint_path.name} ---")
            content = sprint_path.read_text()
            # Extract first few lines for summary
            lines = content.split('\n')
            for line in lines[:15]:  # Show first 15 lines
                if line.strip():
                    logger.info(f"   {line}")
                if "## Features" in line or "## Scope" in line:
                    break
    else:
        logger.error(f"❌ Sprint breakdown failed: {result.content}")
        if result.metadata and result.metadata.get('error'):
            logger.error(f"Error details: {result.metadata['error']}")


if __name__ == "__main__":
    asyncio.run(test_sprint_breakdown())