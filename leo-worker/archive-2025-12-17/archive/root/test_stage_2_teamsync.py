#!/usr/bin/env python
"""Test Stage 2: Wireframe Generation with Critic for TeamSync"""

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

async def test_stage_2_teamsync():
    """Test Stage 2 wireframe generation with the TeamSync specs."""
    try:
        # Check if TeamSync specs exist
        app_name = "teamsync"
        specs_dir = Path(f"/Users/labheshpatel/apps/app-factory/apps/{app_name}/specs")
        
        # Read the interaction spec
        interaction_spec_path = specs_dir / "frontend-interaction-spec.md"
        if not interaction_spec_path.exists():
            # Try test outputs if not in apps directory
            test_outputs = Path("/Users/labheshpatel/apps/app-factory/test_outputs/stage_1")
            if test_outputs.exists():
                # Get the most recent interaction spec
                specs = sorted(test_outputs.glob("interaction_spec_*.md"), key=lambda p: p.stat().st_mtime, reverse=True)
                if specs:
                    interaction_spec_path = specs[0]
                    logger.info(f"Using interaction spec from test outputs: {interaction_spec_path.name}")
                else:
                    logger.error("No interaction spec found in test outputs")
                    return
            else:
                logger.error(f"Interaction spec not found at {interaction_spec_path}")
                return
                
        interaction_spec = interaction_spec_path.read_text()
        logger.info(f"✅ Loaded interaction spec ({len(interaction_spec)} characters)")
        
        # Read technical spec if available
        tech_spec = ""
        tech_spec_path = specs_dir / "technical-implementation-spec.md"
        if tech_spec_path.exists():
            tech_spec = tech_spec_path.read_text()
            logger.info(f"✅ Loaded technical spec ({len(tech_spec)} characters)")
        else:
            logger.info("ℹ️ No technical spec found, proceeding without it")
        
        # Import Stage 2
        from app_factory.stages.stage_2_wireframe_v2 import run_stage
        
        # Run Stage 2 (Wireframe with Critic-Writer pattern)
        logger.info("\n" + "="*80)
        logger.info("🎨 Running Stage 2: Wireframe Generation (Critic-Writer Pattern)")
        logger.info("="*80)
        logger.info("This will:")
        logger.info("  1. Generate the complete Next.js application")
        logger.info("  2. Use build_test to verify compilation")
        logger.info("  3. Use dev_server + browser for runtime testing")
        logger.info("  4. Iterate with Critic feedback if needed")
        
        start_time = datetime.now()
        
        result = await run_stage(app_name)
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        # Log results
        if result.success:
            logger.info(f"\n✅ Stage 2 completed successfully in {duration:.2f} seconds")
            logger.info(f"💰 Total Cost: ${result.cost:.4f}")
            
            # Log metadata if available
            metadata = result.metadata or {}
            if metadata:
                logger.info("\n📊 Generation Details:")
                for key, value in metadata.items():
                    logger.info(f"   {key}: {value}")
            
            # Output location
            output_dir = Path(f"/Users/labheshpatel/apps/app-factory/apps/{app_name}/frontend")
            if output_dir.exists():
                logger.info(f"\n📁 Wireframe generated at: {output_dir}")
                logger.info("\n🚀 To run the application:")
                logger.info(f"   cd {output_dir}")
                logger.info("   npm install")
                logger.info("   npm run dev")
                logger.info("\nThen open http://localhost:3000 in your browser")
                
                # Check for key files
                key_files = ["package.json", "app/page.tsx", "components/ui/button.tsx"]
                logger.info("\n📄 Key files generated:")
                for file in key_files:
                    file_path = output_dir / file
                    if file_path.exists():
                        logger.info(f"   ✅ {file}")
                    else:
                        logger.info(f"   ❌ {file} (missing)")
                        
        else:
            logger.error(f"❌ Stage 2 failed: {result.error or 'Unknown error'}")
            
    except Exception as e:
        logger.error(f"❌ Error running Stage 2 test: {e}", exc_info=True)

if __name__ == "__main__":
    logger.info("=" * 80)
    logger.info("Testing Stage 2: Wireframe Generation for TeamSync")
    logger.info("=" * 80)
    asyncio.run(test_stage_2_teamsync())