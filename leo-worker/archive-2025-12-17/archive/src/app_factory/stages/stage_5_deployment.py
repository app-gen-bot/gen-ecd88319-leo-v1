"""Stage 5: Deployment Configuration.

This stage creates deployment configurations and scripts for deploying
both frontend and backend components to production.
"""

import logging
from app_factory.agents import DEPLOYMENT_AGENT, create_deployment_prompt
from app_factory.utils import print_stage_header
from cc_agent import AgentResult

logger = logging.getLogger(__name__)


async def run_stage(frontend_path: str, backend_path: str, app_name: str) -> AgentResult:
    """Generate deployment configuration.
    
    Args:
        frontend_path: Path to the frontend application
        backend_path: Path to the backend application
        app_name: Name of the application for deployment
        
    Returns:
        AgentResult containing deployment configuration
    """
    print_stage_header(5, "Configuring Deployment", "🚀")
    
    deployment_prompt = create_deployment_prompt(frontend_path, backend_path, app_name)
    result = await DEPLOYMENT_AGENT.run(deployment_prompt)
    
    if not result.success:
        logger.error("Failed to configure deployment")
    else:
        logger.info("Deployment configured successfully")
        
    return result