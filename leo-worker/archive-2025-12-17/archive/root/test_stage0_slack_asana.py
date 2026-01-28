#!/usr/bin/env python3
"""Test Stage 0 orchestrator with Slack + Asana prompt."""

import asyncio
import logging
from pathlib import Path
from cc_agent.logging import setup_logging
from app_factory.stages import stage_0_prd

# Set up logging
log_dir = Path(__file__).parent / "logs"
setup_logging("test_stage0_slack_asana", log_dir=log_dir)
logger = logging.getLogger(__name__)


async def test_stage0():
    """Test Stage 0 with Slack + Asana prompt."""
    
    user_prompt = "I'd like to create an app that mixes the best features of Slack and Asana together"
    
    logger.info(f"\n{'='*60}")
    logger.info("Testing Stage 0: PRD Generation")
    logger.info(f"Prompt: {user_prompt}")
    logger.info("="*60)
    
    try:
        # Create output directory
        output_dir = Path("test_outputs") / "slack_asana_hybrid"
        output_dir.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"\nOutput directory: {output_dir}")
        logger.info("\nStarting PRD generation...")
        
        # Run Stage 0 with skip_questions mode
        # We need to call the orchestrator directly to pass skip_questions
        from app_factory.agents.stage_0_orchestrator import orchestrator_agent
        
        # Generate PRD
        result_dict = await orchestrator_agent.generate_prd(user_prompt, skip_questions=True)
        
        # Save the PRD
        if result_dict["success"]:
            app_name = result_dict["app_name"]
            prd_content = result_dict["prd_content"]
            
            # Save to file
            prd_path = output_dir / "business_prd.md"
            prd_path.write_text(prd_content)
            
            # Create result object for compatibility
            from cc_agent import AgentResult
            result = AgentResult(
                success=True,
                content=prd_content,
                cost=result_dict["cost"],
                metadata={"turns": result_dict["conversation_turns"]}
            )
        else:
            app_name = None
            prd_path = None
            result = AgentResult(
                success=False,
                content="",
                cost=result_dict.get("cost", 0),
                metadata={"error": result_dict.get("error", "Unknown error")}
            )
        
        if result.success:
            logger.info(f"\n✅ PRD Generated Successfully!")
            logger.info(f"   App name: {app_name}")
            logger.info(f"   Cost: ${result.cost:.4f}")
            logger.info(f"   Turns: {result.metadata.get('turns', 1)}")
            logger.info(f"   PRD saved to: {prd_path}")
            
            # Read and display the full PRD
            if prd_path and prd_path.exists():
                with open(prd_path, 'r') as f:
                    prd_content = f.read()
                
                logger.info(f"\n{'='*60}")
                logger.info("GENERATED PRD:")
                logger.info("="*60)
                print(prd_content)  # Print to stdout for easy reading
                
                # Also save to a more permanent location
                final_output = Path("generated_prds") / f"{app_name}_prd.md"
                final_output.parent.mkdir(exist_ok=True)
                final_output.write_text(prd_content)
                logger.info(f"\n✅ PRD also saved to: {final_output}")
        else:
            logger.error(f"\n❌ PRD Generation Failed!")
            logger.error(f"   Error: {result.metadata.get('error', 'Unknown error')}")
            
    except Exception as e:
        logger.error(f"\n❌ Exception: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    # Run the test
    asyncio.run(test_stage0())