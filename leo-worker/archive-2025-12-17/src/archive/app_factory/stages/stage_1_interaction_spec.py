"""Stage 1: Frontend Interaction Specification Generation.

This stage transforms the Business PRD into a detailed interaction
specification that defines how users will interact with the application.

Supports both single-pass and iterative (Writer-Critic) modes.
"""

import logging
from pathlib import Path
from typing import Optional, Tuple
from app_factory.agents.stage_1_interaction_spec import interaction_spec_agent
from app_factory.agents.stage_1_interaction_spec.critic import CriticAgent
from cc_agent import AgentResult

logger = logging.getLogger(__name__)


async def run_stage(prd_content: str, iterative_mode: bool = False, app_name: str = "", app_dir: Optional[Path] = None) -> AgentResult:
    """Generate interaction specification from PRD.
    
    Args:
        prd_content: The Business PRD content
        iterative_mode: Whether to use Writer-Critic iterative refinement
        app_name: Name of the application (for iterative mode)
        app_dir: Directory for the application (for file-based iteration)
        
    Returns:
        AgentResult containing the interaction specification
    """
    if iterative_mode and app_name:
        logger.info("🔄 Using Writer-Critic iterative mode")
        return await _run_iterative_mode(prd_content, app_name, app_dir)
    else:
        logger.info("📝 Using single-pass mode")
        return await _run_single_pass_mode(prd_content)


async def _run_single_pass_mode(prd_content: str) -> AgentResult:
    """Run Stage 1 in single-pass mode (no iteration)."""
    # Use the new context-aware agent
    result_dict = await interaction_spec_agent.generate_interaction_spec(prd_content)
    
    # Convert to AgentResult format
    if result_dict["success"]:
        logger.info(f"✅ Interaction specification generated successfully")
        logger.info(f"   Sections: {result_dict['sections_count']}")
        logger.info(f"   Coverage: {result_dict['coverage_score']:.1f}%")
        logger.info(f"   Validation: {'Passed' if result_dict['validation_passed'] else 'Failed'}")
        
        # Create AgentResult
        result = AgentResult(
            success=True,
            content=result_dict["spec_content"],
            cost=result_dict["cost"],
            metadata={
                "sections_count": result_dict["sections_count"],
                "coverage_score": result_dict["coverage_score"],
                "validation_passed": result_dict["validation_passed"],
                "validation_details": result_dict.get("validation_details", {})
            }
        )
    else:
        logger.error(f"❌ Failed to generate interaction specification: {result_dict.get('error', 'Unknown error')}")
        result = AgentResult(
            success=False,
            content="",
            cost=result_dict["cost"],
            error=result_dict.get("error", "Unknown error")
        )
        
    return result


async def _run_iterative_mode(prd_content: str, app_name: str, app_dir: Optional[Path] = None) -> AgentResult:
    """Run Stage 1 with Writer-Critic iterative refinement."""
    from app_factory.agents.stage_1_interaction_spec.critic.config import AGENT_CONFIG
    
    # Initialize critic agent
    # Use app_dir/specs if provided for file-based iteration, otherwise project root
    if app_dir:
        app_dir = Path(app_dir) if not isinstance(app_dir, Path) else app_dir
        spec_dir = app_dir / "specs"
        spec_dir.mkdir(exist_ok=True)
        spec_file_path = spec_dir / "frontend-interaction-spec.md"
        logger.info(f"📁 Using file-based iteration with spec at: {spec_file_path}")
    else:
        spec_dir = Path(__file__).parent.parent.parent
        spec_file_path = None
        logger.info("💾 Using memory-based iteration")
    
    critic_agent = CriticAgent(spec_dir, logger=logger)
    compliance_threshold = AGENT_CONFIG.get("compliance_threshold", 90)
    
    # Writer-Critic iterative loop
    max_iterations = 3  # Fewer iterations than wireframe since this is upstream
    total_cost = 0.0
    critic_result = None  # No critic feedback on first iteration
    spec_content = ""
    
    logger.info(f"🔄 Starting Writer-Critic iterative loop (max {max_iterations} iterations)...")
    
    for iteration in range(max_iterations):
        logger.info(f"\n--- Iteration {iteration + 1}/{max_iterations} ---")
        
        # Writer: Create/improve specification
        logger.info("🖊️ Running Writer agent...")
        
        # Pass critic feedback if available and file path if using file-based iteration
        writer_kwargs = {}
        if critic_result and iteration > 0:
            writer_kwargs['critic_feedback'] = critic_result
        
        # Add file path for file-based iteration
        if spec_file_path:
            writer_kwargs['output_file_path'] = str(spec_file_path)
            
        writer_result = await interaction_spec_agent.generate_interaction_spec(
            prd_content, 
            **writer_kwargs
        )
        
        if not writer_result["success"]:
            logger.error(f"❌ Writer failed on iteration {iteration + 1}")
            return AgentResult(
                success=False,
                content="",
                cost=total_cost + writer_result["cost"],
                error=writer_result.get("error", "Writer failed")
            )
            
        spec_content = writer_result["spec_content"]
        total_cost += writer_result["cost"]
        
        logger.info(f"✅ Writer completed iteration {iteration + 1}")
        logger.info(f"   Cost: ${writer_result['cost']:.4f}")
        logger.info(f"   Coverage: {writer_result['coverage_score']:.1f}%")
        
        # Critic: Evaluate specification and decide
        logger.info("🔍 Running Critic agent...")
        
        # Read from file if using file-based iteration
        if spec_file_path and spec_file_path.exists():
            spec_content = spec_file_path.read_text()
            logger.info(f"📖 Critic reading spec from file: {spec_file_path}")
        
        critic_eval = await critic_agent.evaluate_spec(
            prd_content=prd_content,
            interaction_spec=spec_content,
            app_name=app_name,
            iteration=iteration + 1,
            writer_result=critic_result  # Pass previous evaluation if any
        )
        
        if not critic_eval["success"]:
            logger.warning("⚠️ Critic evaluation failed, using writer output")
            break
            
        total_cost += critic_eval["cost"]
        
        # Log critic evaluation
        evaluation = critic_eval["evaluation"]
        logger.info(f"🔍 Critic evaluation:")
        logger.info(f"   Overall score: {evaluation.get('overall_quality_score', 'N/A')}%")
        logger.info(f"   PRD coverage: {evaluation.get('prd_coverage_score', 'N/A')}%")
        logger.info(f"   Decision: {critic_eval['decision']}")
        
        if critic_eval["decision"] == "complete":
            logger.info(f"✅ Critic approved after {iteration + 1} iterations")
            break
        else:
            logger.info(f"🔄 Critic requested improvements:")
            for fix in critic_eval.get("priority_fixes", [])[:3]:
                logger.info(f"   - {fix}")
            critic_result = critic_eval
    
    logger.info(f"\n🔄 Writer-Critic loop completed")
    logger.info(f"   Total iterations: {iteration + 1}")
    logger.info(f"   Total cost: ${total_cost:.4f}")
    
    # Return the final specification
    return AgentResult(
        success=True,
        content=spec_content,
        cost=total_cost,
        metadata={
            "iterations": iteration + 1,
            "mode": "iterative",
            "final_evaluation": critic_eval.get("evaluation", {}) if 'critic_eval' in locals() else {}
        }
    )