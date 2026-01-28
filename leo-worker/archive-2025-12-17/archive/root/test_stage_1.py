#!/usr/bin/env python
"""Test Stage 1: Interaction Spec Generation with TeamSync PRD."""

import asyncio
import logging
from pathlib import Path
from datetime import datetime
import sys

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root / "src"))

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def test_stage_1():
    """Test Stage 1 with the TeamSync PRD."""
    try:
        # Read the TeamSync PRD
        prd_path = Path("/Users/labheshpatel/apps/app-factory/apps/teamsync/specs/business_prd.md")
        if not prd_path.exists():
            logger.error(f"PRD not found at {prd_path}")
            return
            
        prd_content = prd_path.read_text()
        logger.info(f"✅ Loaded TeamSync PRD ({len(prd_content)} characters)")
        
        # Import Stage 1
        from app_factory.stages.stage_1_interaction_spec import run_stage
        
        # Run Stage 1
        logger.info("🚀 Running Stage 1: Interaction Spec Generation...")
        logger.info("   Using new ContextAwareAgent implementation")
        start_time = datetime.now()
        
        result = await run_stage(prd_content)
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        # Log results
        if result.success:
            logger.info(f"✅ Stage 1 completed successfully in {duration:.2f} seconds")
            logger.info(f"📊 Cost: ${result.cost:.4f}")
            logger.info(f"📝 Output length: {len(result.content)} characters")
            
            # Log validation details
            metadata = result.metadata or {}
            logger.info(f"📋 Sections: {metadata.get('sections_count', 'N/A')}")
            logger.info(f"📈 Coverage: {metadata.get('coverage_score', 0):.1f}%")
            logger.info(f"✓ Validation: {'Passed' if metadata.get('validation_passed', False) else 'Failed'}")
            
            # Save the output
            output_dir = Path("/Users/labheshpatel/apps/app-factory/test_outputs/stage_1")
            output_dir.mkdir(parents=True, exist_ok=True)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = output_dir / f"interaction_spec_{timestamp}.md"
            output_file.write_text(result.content)
            
            logger.info(f"💾 Saved interaction spec to: {output_file}")
            
            # Display first 1000 characters of output
            logger.info("\n📄 Interaction Spec Preview:")
            logger.info("-" * 80)
            preview = result.content[:1000] + "..." if len(result.content) > 1000 else result.content
            print(preview)
            logger.info("-" * 80)
            
            # Show validation details if available
            validation_details = metadata.get('validation_details', {})
            if validation_details:
                logger.info("\n🔍 Validation Details:")
                if validation_details.get('missing_sections'):
                    logger.warning(f"   Missing sections: {validation_details['missing_sections']}")
                if validation_details.get('missing_features'):
                    logger.warning(f"   Missing features: {len(validation_details['missing_features'])}")
                    for feature in validation_details['missing_features'][:3]:
                        logger.warning(f"     - {feature[:50]}...")
            
        else:
            logger.error(f"❌ Stage 1 failed: {result.error or 'Unknown error'}")
            
    except Exception as e:
        logger.error(f"❌ Error running Stage 1 test: {e}", exc_info=True)

if __name__ == "__main__":
    asyncio.run(test_stage_1())