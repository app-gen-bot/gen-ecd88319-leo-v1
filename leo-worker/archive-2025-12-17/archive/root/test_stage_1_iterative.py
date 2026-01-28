#!/usr/bin/env python
"""Test Stage 1 Iterative Mode: Writer-Critic Pattern for Interaction Spec Generation."""

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

async def test_stage_1_iterative():
    """Test Stage 1 with Writer-Critic iterative mode."""
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
        
        # Run Stage 1 in iterative mode
        logger.info("🚀 Running Stage 1: Interaction Spec Generation (Iterative Mode)")
        logger.info("   Using Writer-Critic pattern for refinement")
        start_time = datetime.now()
        
        result = await run_stage(
            prd_content, 
            iterative_mode=True,
            app_name="teamsync"
        )
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        # Log results
        if result.success:
            logger.info(f"✅ Stage 1 completed successfully in {duration:.2f} seconds")
            logger.info(f"📊 Total Cost: ${result.cost:.4f}")
            logger.info(f"📝 Output length: {len(result.content)} characters")
            
            # Log iterative details from metadata
            metadata = result.metadata or {}
            logger.info(f"🔄 Iterations: {metadata.get('iterations', 'N/A')}")
            logger.info(f"📋 Mode: {metadata.get('mode', 'N/A')}")
            
            # Log final evaluation if available
            final_eval = metadata.get('final_evaluation', {})
            if final_eval:
                logger.info("\n📊 Final Evaluation Scores:")
                logger.info(f"   Overall Quality: {final_eval.get('overall_quality_score', 'N/A')}%")
                logger.info(f"   PRD Coverage: {final_eval.get('prd_coverage_score', 'N/A')}%")
                logger.info(f"   Template Compliance: {final_eval.get('template_compliance_score', 'N/A')}%")
                logger.info(f"   Detail Completeness: {final_eval.get('detail_completeness_score', 'N/A')}%")
            
            # Save the output
            output_dir = Path("/Users/labheshpatel/apps/app-factory/test_outputs/stage_1_iterative")
            output_dir.mkdir(parents=True, exist_ok=True)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = output_dir / f"interaction_spec_iterative_{timestamp}.md"
            output_file.write_text(result.content)
            
            logger.info(f"💾 Saved interaction spec to: {output_file}")
            
            # Save evaluation report
            if final_eval:
                eval_file = output_dir / f"evaluation_report_{timestamp}.json"
                import json
                eval_file.write_text(json.dumps(final_eval, indent=2))
                logger.info(f"📋 Saved evaluation report to: {eval_file}")
            
            # Display first 1000 characters of output
            logger.info("\n📄 Interaction Spec Preview:")
            logger.info("-" * 80)
            preview = result.content[:1000] + "..." if len(result.content) > 1000 else result.content
            print(preview)
            logger.info("-" * 80)
            
        else:
            logger.error(f"❌ Stage 1 failed: {result.error or 'Unknown error'}")
            
    except Exception as e:
        logger.error(f"❌ Error running Stage 1 iterative test: {e}", exc_info=True)

if __name__ == "__main__":
    logger.info("=" * 80)
    logger.info("Testing Stage 1 Writer-Critic Iterative Mode")
    logger.info("=" * 80)
    asyncio.run(test_stage_1_iterative())