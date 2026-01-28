#!/usr/bin/env python3
"""
Safe script to run only the Critic evaluation on existing PawsFlow code.
This will NOT modify any generated files - it only evaluates and provides feedback.
"""

import asyncio
import logging
from pathlib import Path
import sys

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from app_factory.agents.stage_2_wireframe.critic.agent import CriticAgent
from app_factory.utils import Timer

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def run_critic_only():
    """Run Critic evaluation on existing PawsFlow wireframe."""
    
    # Configuration
    app_name = "app_20250716_074453"
    app_dir = Path("apps") / app_name
    output_dir = app_dir / "frontend"
    
    # Verify the app exists
    if not output_dir.exists():
        logger.error(f"❌ App directory not found: {output_dir}")
        logger.error("Make sure you're running this from the app-factory root directory")
        return
    
    # Count existing files
    ts_files = list(output_dir.rglob("*.ts"))
    tsx_files = list(output_dir.rglob("*.tsx"))
    total_files = len(ts_files) + len(tsx_files)
    logger.info(f"📁 Found existing app with {total_files} TypeScript/React files")
    
    # Load specifications
    specs_dir = app_dir / "specs"
    interaction_spec_path = specs_dir / "frontend-interaction-spec.md"
    technical_spec_path = specs_dir / "technical-implementation-spec.md"
    
    if not interaction_spec_path.exists() or not technical_spec_path.exists():
        logger.error("❌ Required specification files not found")
        return
    
    interaction_spec = interaction_spec_path.read_text()
    technical_spec = technical_spec_path.read_text()
    
    logger.info(f"📋 Loaded interaction spec ({len(interaction_spec)} chars)")
    logger.info(f"📋 Loaded technical spec ({len(technical_spec)} chars)")
    
    # Initialize the Critic agent
    logger.info("\n🔍 Initializing Critic agent...")
    logger.info("🚨 REMINDER: Critic will ONLY evaluate, not modify any files")
    
    critic_timer = Timer("critic_evaluation")
    
    try:
        # Initialize critic with output directory
        critic_agent = CriticAgent(output_dir, logger=logger)
        
        # Run the evaluation
        logger.info("\n🔍 Starting Critic evaluation...")
        logger.info("This may take 10-30 minutes for thorough analysis...")
        
        # Import the prompt creator
        from app_factory.agents.stage_2_wireframe.critic.user_prompt import create_critic_prompt
        
        # Create the critic prompt
        critic_prompt = create_critic_prompt(
            interaction_spec=interaction_spec,
            tech_spec=technical_spec,
            output_dir=str(output_dir),
            app_name=app_name,
            iteration=1,
            compliance_threshold=85
        )
        
        # Run the critic agent
        result = await critic_agent.run(critic_prompt)
        
        # Parse the result - it should contain JSON
        import json
        critic_decision = "complete"  # Default
        critic_json = {}
        
        try:
            # Try to extract JSON from the content
            content = result.content
            # Look for JSON block in the content
            start = content.find('{')
            end = content.rfind('}') + 1
            if start != -1 and end > start:
                critic_json = json.loads(content[start:end])
                critic_decision = critic_json.get("decision", "complete")
            else:
                logger.error("No JSON found in critic result")
                logger.info(f"Raw result: {content[:500]}...")
                return
        except Exception as e:
            logger.error(f"Failed to parse critic result as JSON: {e}")
            logger.info(f"Raw result: {result.content[:500]}...")
            return
        
        # Display results
        logger.info(f"\n✅ Critic evaluation completed in {critic_timer.elapsed_str()}")
        logger.info(f"💰 Critic cost: ${result.cost:.4f}")
        
        evaluation = critic_json.get("evaluation", {})
        logger.info(f"\n📊 Evaluation Results:")
        logger.info(f"   Compliance Score: {evaluation.get('compliance_score', 'N/A')}%")
        logger.info(f"   Decision: {critic_decision.upper()}")
        logger.info(f"   Reasoning: {critic_json.get('reasoning', 'N/A')}")
        
        if critic_json.get("priority_fixes"):
            logger.info(f"\n🔧 Priority Fixes Identified:")
            for i, fix in enumerate(critic_json["priority_fixes"][:5], 1):
                logger.info(f"   {i}. {fix}")
        
        # Check if detailed report was created
        detailed_report = evaluation.get("detailed_report_path")
        if detailed_report:
            report_path = output_dir / detailed_report
            if report_path.exists():
                logger.info(f"\n📝 Detailed analysis saved to: {report_path}")
                logger.info("   Review this file for comprehensive feedback")
        
        # Save the evaluation result
        eval_result_path = specs_dir / "critic_evaluation_result.json"
        critic_json['total_cost'] = result.cost
        critic_json['agent_success'] = result.success
        with open(eval_result_path, 'w') as f:
            json.dump(critic_json, f, indent=2)
        logger.info(f"\n💾 Evaluation result saved to: {eval_result_path}")
        
        # Summary
        logger.info("\n" + "="*60)
        logger.info("🎯 Next Steps:")
        if critic_decision == 'continue':
            logger.info("   1. Review the priority fixes listed above")
            logger.info("   2. Review the detailed report if created")
            logger.info("   3. Decide whether to run another Writer iteration")
            logger.info("   4. If yes, the Writer will use this feedback to improve")
        else:
            logger.info("   ✅ The implementation meets quality standards!")
            logger.info("   Proceed with QC and Integration analysis")
        
    except Exception as e:
        logger.error(f"❌ Error during critic evaluation: {str(e)}")
        import traceback
        traceback.print_exc()
        
    logger.info("\n✅ Critic-only evaluation complete. No files were modified.")

if __name__ == "__main__":
    logger.info("🚀 PawsFlow Critic-Only Evaluation")
    logger.info("="*60)
    asyncio.run(run_critic_only())