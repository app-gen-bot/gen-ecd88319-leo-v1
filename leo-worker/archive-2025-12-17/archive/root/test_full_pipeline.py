#!/usr/bin/env python
"""Test Full Pipeline: Stage 0 (PRD) → Stage 1 (Interaction Spec) → Stage 2 (Wireframe with validation)"""

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

async def test_full_pipeline():
    """Test the complete pipeline with focus on wireframe validation tools."""
    try:
        from app_factory.main_v2 import run_pipeline_v2
        
        # Test prompt
        user_prompt = "Create a simple todo list app with add, edit, delete, and mark complete features"
        
        logger.info("=" * 80)
        logger.info("🏭 Testing Full Pipeline with Wireframe Validation")
        logger.info("=" * 80)
        logger.info(f"📝 User request: {user_prompt}")
        
        start_time = datetime.now()
        
        # Run the pipeline with iterative Stage 1
        results = await run_pipeline_v2(
            user_prompt=user_prompt,
            iterative_stage_1=True  # Use Writer-Critic for Stage 1
        )
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        # Log results
        logger.info("\n" + "="*60)
        logger.info("📊 Pipeline Results Summary")
        logger.info("="*60)
        
        total_cost = 0.0
        for stage, result in results.items():
            if result:
                status = "✅" if result.success else "❌"
                logger.info(f"{status} {stage}: ${result.cost:.4f}")
                total_cost += result.cost
                
                # Log stage-specific details
                if stage == "prd" and result.success:
                    logger.info(f"   PRD length: {len(result.content)} chars")
                elif stage == "interaction_spec" and result.success:
                    metadata = result.metadata or {}
                    logger.info(f"   Mode: {metadata.get('mode', 'N/A')}")
                    logger.info(f"   Iterations: {metadata.get('iterations', 'N/A')}")
                elif stage == "wireframe" and result.success:
                    logger.info("   Wireframe generated with validation")
                    
        logger.info(f"\n💰 Total cost: ${total_cost:.4f}")
        logger.info(f"⏱️ Total time: {duration:.1f} seconds")
        
        # Check if wireframe was generated
        if "wireframe" in results and results["wireframe"].success:
            logger.info("\n✅ Wireframe generation completed successfully!")
            logger.info("The wireframe should have used:")
            logger.info("  - build_test for compilation verification")
            logger.info("  - dev_server for runtime testing")
            logger.info("  - browser for user flow validation")
            
            # Try to find the generated app
            apps_dir = Path(project_root / "apps")
            if apps_dir.exists():
                app_dirs = [d for d in apps_dir.iterdir() if d.is_dir() and "todo" in d.name.lower()]
                if app_dirs:
                    app_dir = app_dirs[0]
                    logger.info(f"\n📁 Generated app at: {app_dir}")
                    logger.info("You can run the app with:")
                    logger.info(f"  cd {app_dir}/frontend")
                    logger.info("  npm run dev")
        
    except Exception as e:
        logger.error(f"❌ Error running full pipeline test: {e}", exc_info=True)

if __name__ == "__main__":
    asyncio.run(test_full_pipeline())