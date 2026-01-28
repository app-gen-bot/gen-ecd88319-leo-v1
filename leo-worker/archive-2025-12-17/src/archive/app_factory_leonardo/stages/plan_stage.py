"""Plan Stage: Simple Application Plan Generation.

This stage takes the user's initial request and generates a simple plan
document following Replit's three-step approach.
"""

import logging
from pathlib import Path
from typing import Tuple
from cc_agent import AgentResult
from app_factory_leonardo.agents.plan_orchestrator import orchestrator_agent, PLAN_FILENAME
from app_factory_leonardo.utils import Timer

logger = logging.getLogger(__name__)


async def run_stage(user_prompt: str, output_dir: Path = None, app_name: str = None) -> Tuple[AgentResult, str, Path]:
    """Generate Application Plan from user prompt using the simplified orchestrator.
    
    Args:
        user_prompt: Initial user request
        output_dir: Optional output directory for the Plan
        app_name: Optional app name to use instead of auto-generated
        
    Returns:
        Tuple of (AgentResult, app_name, plan_path)
    """
    timer = Timer("plan_stage")
    
    logger.info(f"Starting Plan generation for prompt: {user_prompt[:100]}...")
    
    # Generate Plan using the orchestrator agent
    # For testing, use skip_questions=True
    result_dict = await orchestrator_agent.generate_plan(user_prompt, skip_questions=True)
    
    # Create AgentResult from the response
    result = AgentResult(
        success=result_dict["success"],
        content=result_dict.get("plan_content", ""),
        cost=result_dict.get("cost", 0.0),
        metadata={
            "turns": result_dict.get("conversation_turns", 1),
            "error": result_dict.get("error")
        }
    )
    
    if not result.success:
        error_msg = result.metadata.get("error", "Unknown error")
        logger.error(f"Failed to generate Plan: {error_msg}")
        return result, None, None
    
    # Validate Plan content is not empty
    if not result.content or not result.content.strip():
        error_msg = "Plan content is empty. The orchestrator agent may have written to a file instead of returning content."
        logger.error(error_msg)
        result = AgentResult(
            success=False,
            content="",
            cost=result.cost,
            metadata={
                "turns": result.metadata.get("turns", 1),
                "error": error_msg
            }
        )
        return result, None, None
    
    # Extract app name with better default
    if app_name:
        # Use provided app name
        logger.info(f"Using provided app name: {app_name}")
    else:
        # Try to get from orchestrator result
        app_name = result_dict.get("app_name")
        if not app_name or app_name == "custom-app":
            # Generate a default name based on timestamp
            from datetime import datetime
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            app_name = f"app_{timestamp}"
            logger.info(f"No specific app name found, using: {app_name}")
        else:
            logger.info(f"Generated Plan for app: {app_name}")
    
    # Save Plan to file if output directory provided
    plan_path = None
    if output_dir:
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        plan_path = output_dir / PLAN_FILENAME
        
        with open(plan_path, 'w') as f:
            f.write(result.content)
        
        logger.info(f"Plan saved to: {plan_path}")
    
    # Log summary
    logger.info(f"✅ Plan generated successfully in {timer.elapsed_str()}")
    logger.info(f"   - App name: {app_name}")
    logger.info(f"   - Conversation turns: {result.metadata.get('turns', 1)}")
    logger.info(f"   - Cost: ${result.cost:.4f}")
    if plan_path:
        logger.info(f"   - Saved to: {plan_path}")
        
    return result, app_name, plan_path