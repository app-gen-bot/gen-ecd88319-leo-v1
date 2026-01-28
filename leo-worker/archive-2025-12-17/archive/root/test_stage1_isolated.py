#!/usr/bin/env python3
"""Test Stage 1 (Interaction Spec Generation) in isolation."""

import asyncio
import logging
from pathlib import Path
import sys

# Add the src directory to the path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from app_factory.stages import stage_1_interaction_spec
from cc_agent import AgentResult

# Set up detailed logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('stage1_test.log')
    ]
)

logger = logging.getLogger(__name__)


async def test_stage1():
    """Test Stage 1 with the existing PRD."""
    
    # Read the PRD
    prd_path = Path("/Users/labheshpatel/apps/app-factory/apps/app_20250713_181421/specs/business_prd.md")
    
    if not prd_path.exists():
        logger.error(f"PRD not found at: {prd_path}")
        return
    
    prd_content = prd_path.read_text()
    logger.info(f"Loaded PRD with {len(prd_content)} characters")
    logger.info(f"PRD starts with: {prd_content[:200]}...")
    
    # Test both modes
    modes = [
        ("single-pass", False),
        ("iterative", True)
    ]
    
    for mode_name, iterative in modes:
        logger.info(f"\n{'='*60}")
        logger.info(f"Testing Stage 1 in {mode_name} mode")
        logger.info(f"{'='*60}")
        
        try:
            # Run Stage 1
            result = await stage_1_interaction_spec.run_stage(
                prd_content=prd_content,
                iterative_mode=iterative,
                app_name="flyra_test"
            )
            
            logger.info(f"\nResult summary:")
            logger.info(f"- Success: {result.success}")
            logger.info(f"- Cost: ${result.cost:.4f}")
            
            if result.success:
                logger.info(f"- Content length: {len(result.content)} characters")
                logger.info(f"- Metadata: {result.metadata}")
                
                # Save the output
                output_path = Path(f"stage1_output_{mode_name}.md")
                output_path.write_text(result.content)
                logger.info(f"- Output saved to: {output_path}")
                
                # Show first part of content
                logger.info(f"\nFirst 500 characters of output:")
                logger.info(f"{result.content[:500]}...")
                
                # Count sections
                sections = [line for line in result.content.split('\n') if line.strip().startswith('## ')]
                logger.info(f"\nSections found: {len(sections)}")
                for section in sections[:10]:  # Show first 10 sections
                    logger.info(f"  {section}")
                    
            else:
                logger.error(f"- Error: {result.error}")
                logger.error(f"- Content: {result.content}")
                
        except Exception as e:
            logger.error(f"Exception in {mode_name} mode: {e}", exc_info=True)
    
    logger.info("\n" + "="*60)
    logger.info("Stage 1 testing complete")
    logger.info("Check stage1_test.log for detailed debug output")


if __name__ == "__main__":
    asyncio.run(test_stage1())