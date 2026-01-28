"""Stage 4: Backend Implementation.

This stage implements the backend API based on the technical specifications,
including database models, API endpoints, and business logic.
"""

import logging
from app_factory.agents import BACKEND_AGENT, create_backend_prompt
from app_factory.utils import print_stage_header
from cc_agent import AgentResult

logger = logging.getLogger(__name__)


async def run_stage(api_contract: str, data_models: str) -> AgentResult:
    """Generate backend implementation from technical specs.
    
    Args:
        api_contract: The API contract specification
        data_models: The data model definitions
        
    Returns:
        AgentResult containing the backend implementation
    """
    print_stage_header(4, "Implementing Backend", "⚙️")
    
    backend_prompt = create_backend_prompt(api_contract, data_models)
    result = await BACKEND_AGENT.run(backend_prompt)
    
    if not result.success:
        logger.error("Failed to implement backend")
    else:
        logger.info("Backend implemented successfully")
        
    return result