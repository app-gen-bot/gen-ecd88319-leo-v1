"""Stage 3: Technical Specification Generation.

This stage analyzes the wireframe and generates detailed technical
specifications including API contracts and data models.
"""

import logging
from app_factory.agents import TECHNICAL_SPEC_AGENT, create_technical_spec_prompt
from app_factory.utils import print_stage_header
from cc_agent import AgentResult

logger = logging.getLogger(__name__)


async def run_stage(wireframe_path: str) -> AgentResult:
    """Generate technical specifications from wireframe.
    
    Args:
        wireframe_path: Path to the generated wireframe
        
    Returns:
        AgentResult containing the technical specifications
    """
    print_stage_header(3, "Generating Technical Specifications", "📋")
    
    specs_prompt = create_technical_spec_prompt(wireframe_path)
    result = await TECHNICAL_SPEC_AGENT.run(specs_prompt)
    
    if not result.success:
        logger.error("Failed to generate technical specifications")
    else:
        logger.info("Technical specifications generated successfully")
        
    return result