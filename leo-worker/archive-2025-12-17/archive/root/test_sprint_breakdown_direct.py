#!/usr/bin/env python3
"""Direct test of Sprint Breakdown Agent without pipeline overhead."""

import asyncio
import logging
from pathlib import Path
import sys

# Add project root to path
sys.path.append(str(Path(__file__).parent))

from app_factory.agents.stage_0_sprint_breakdown.sprint_breakdown import sprint_breakdown_agent

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def test_direct():
    """Test Sprint Breakdown Agent directly."""
    
    # Path to PawsFlow PRD
    prd_path = Path("apps/app_20250716_074453/specs/business_prd.md")
    
    if not prd_path.exists():
        logger.error(f"PRD not found at {prd_path}")
        return
    
    # Read PRD content
    prd_content = prd_path.read_text()
    logger.info(f"Loaded PRD from {prd_path}")
    
    # Create output directory
    output_dir = Path("test_output/pawsflow_sprints_direct")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    logger.info("\n🚀 Running Sprint Breakdown Agent directly...")
    
    # Run the agent
    result = await sprint_breakdown_agent.break_down_prd(
        prd_content=prd_content,
        app_name="pawsflow",
        output_dir=str(output_dir),
        num_sprints=3
    )
    
    # Display results
    if result["success"]:
        logger.info("\n✅ Sprint breakdown completed!")
        logger.info(f"📋 Summary: {result.get('summary', 'No summary')}")
        logger.info(f"💰 Cost: ${result.get('cost', 0):.4f}")
        logger.info(f"📄 Sprints created: {result.get('num_sprints', 0)}")
        
        logger.info("\n📁 Generated files:")
        if result.get("sprint_files"):
            for file in result["sprint_files"]:
                logger.info(f"   - {Path(file).name}")
        if result.get("overview_file"):
            logger.info(f"   - {Path(result['overview_file']).name}")
        if result.get("roadmap_file"):
            logger.info(f"   - {Path(result['roadmap_file']).name}")
            
        # Show brief preview of each sprint
        logger.info("\n📝 Sprint Previews:")
        for i, sprint_file in enumerate(result.get("sprint_files", []), 1):
            sprint_path = Path(sprint_file)
            if sprint_path.exists():
                content = sprint_path.read_text()
                lines = content.split('\n')
                logger.info(f"\n--- Sprint {i} Preview ---")
                for j, line in enumerate(lines[:20]):
                    if line.strip():
                        logger.info(f"   {line}")
                    if j > 15 and ("##" in line or "Features" in line):
                        logger.info("   ...")
                        break
    else:
        logger.error(f"❌ Failed: {result.get('error', 'Unknown error')}")


if __name__ == "__main__":
    asyncio.run(test_direct())