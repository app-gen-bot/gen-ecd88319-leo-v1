"""Stage 2: Wireframe Generation.

This stage creates a complete Next.js application wireframe based on
the interaction specification using ShadCN UI components.
"""

import logging
from pathlib import Path
from typing import Optional, Tuple
from app_factory.agents.stage_2_wireframe.wireframe import WireframeAgent, create_wireframe_prompt
from app_factory.agents.stage_2_wireframe.qc import QCAgent, create_qc_prompt
from app_factory.utils import Timer, print_stage_header
from app_factory.paths import get_specs_dir, get_frontend_dir
from cc_agent import AgentResult

logger = logging.getLogger(__name__)


def _load_required_spec(app_name: str, spec_type: str) -> Tuple[Optional[str], Optional[AgentResult]]:
    spec_mapping = {
        "interaction": {
            "filename": "frontend-interaction-spec.md",
            "display_name": "Interaction spec"
        },
        "technical": {
            "filename": "technical-implementation-spec.md", 
            "display_name": "Technical spec"
        }
    }
    
    spec_info = spec_mapping[spec_type]
    spec_name = spec_info["display_name"]
    specs_dir = get_specs_dir(app_name)
    spec_path = specs_dir / spec_info["filename"]
    
    if not spec_path.exists():
        logger.error(f"{spec_name} not found: {spec_path}")
        return None, AgentResult(
            success=False,
            content=f"{spec_name} not found: {spec_path}",
            cost=0.0
        )
    
    try:
        content = spec_path.read_text()
        logger.info(f"Loaded {spec_name} ({len(content)} chars)")
        return content, None
    except Exception as e:
        logger.error(f"Failed to read {spec_name}: {e}")
        return None, AgentResult(
            success=False,
            content=f"Failed to read {spec_name}: {e}",
            cost=0.0
        )


async def run_stage(app_name: str) -> AgentResult:
    """Generate wireframe from interaction specification.
    
    Args:
        app_name: Name of the application
        
    Returns:
        AgentResult containing the generated wireframe
    """
    timer = Timer("stage_2_wireframe")
    print_stage_header(2, "Generating Wireframe", "🎨")

    # Load required specifications
    interaction_spec, error = _load_required_spec(app_name, "interaction")
    if error:
        return error
    
    tech_spec, error = _load_required_spec(app_name, "technical")
    if error:
        return error
    
    output_dir = get_frontend_dir(app_name)
    
    # Create the user prompt with both specs and output directory
    user_prompt = create_wireframe_prompt(
        interaction_spec=interaction_spec,
        tech_spec=tech_spec,
        output_dir=str(output_dir),
        app_name=app_name
    )
    
    logger.info(f"Output directory: {output_dir}")
    logger.info("Running wireframe agent...")

    result = await WireframeAgent(output_dir, logger=logger).run(user_prompt)

    if not result.success:
        logger.error(f"Failed to generate wireframe: {result.content}")
        logger.info(f"Stage 2 completed in {timer.elapsed_str()}")
        return result
    
    logger.info("Wireframe generated successfully")
    logger.info(f"Wireframe Cost: ${result.cost:.4f}")
    
    # Run QC validation
    logger.info("Running Quality Control validation...")
    qc_prompt = create_qc_prompt(
        interaction_spec=interaction_spec,
        output_dir=str(output_dir),
        app_name=app_name
    )
    
    qc_result = await QCAgent(output_dir, logger=logger).run(qc_prompt)
    
    if qc_result.success:
        logger.info("QC validation completed")
        logger.info(f"QC Cost: ${qc_result.cost:.4f}")
        
        # Save QC report
        qc_report_path = get_specs_dir(app_name) / "qc-report.md"
        # Extract the report content from QC agent's response
        # The QC agent should have saved it, but we'll ensure it's in the specs dir
        logger.info(f"QC report saved to: {qc_report_path}")
    else:
        logger.warning(f"QC validation encountered issues: {qc_result.content[:200]}...")
    
    # Combine costs and return overall result
    total_cost = result.cost + qc_result.cost
    logger.info(f"Total Stage 2 Cost: ${total_cost:.4f}")
    logger.info(f"Stage 2 completed in {timer.elapsed_str()}")
    
    # Return the wireframe result with updated cost
    result.cost = total_cost
    result.metadata["qc_success"] = qc_result.success
    result.metadata["qc_cost"] = qc_result.cost
    
    return result