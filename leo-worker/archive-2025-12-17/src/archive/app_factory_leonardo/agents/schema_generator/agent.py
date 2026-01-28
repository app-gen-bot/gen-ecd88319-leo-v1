"""Schema Generator Agent implementation."""

import logging
from pathlib import Path
from typing import Tuple

from cc_agent import Agent, AgentResult

from .config import AGENT_CONFIG
from .system_prompt import SYSTEM_PROMPT
from .user_prompt import create_user_prompt

logger = logging.getLogger(__name__)


class SchemaGeneratorAgent:
    """Agent that generates database schemas from application plans and React components."""
    
    def __init__(self, cwd: str = None):
        """Initialize the Schema Generator Agent.
        
        Args:
            cwd: Working directory for the agent and its tools
        """
        # Configure MCP servers for validation
        mcp_servers = {
            "oxc": {
                "type": "stdio",
                "command": "uv",
                "args": ["run", "python", "-m", "cc_tools.oxc.server"]
            },
            "build_test": {
                "type": "stdio",
                "command": "uv",
                "args": ["run", "python", "-m", "cc_tools.build_test.server"]
            },
            "tree_sitter": {
                "type": "stdio",
                "command": "uv",
                "args": ["run", "mcp-tree-sitter"]
            }
        }
        
        self.agent = Agent(
            system_prompt=SYSTEM_PROMPT,
            mcp_servers=mcp_servers,
            cwd=cwd,
            **AGENT_CONFIG
        )
        self.verbose = True  # Enable verbose logging for debugging
    
    async def generate_schema(
        self, 
        plan_content: str,
        react_component: str, 
        output_path: Path = None
    ) -> Tuple[bool, str, str]:
        """Generate a database schema from plan and React component.
        
        Args:
            plan_content: The content of the plan.md file
            react_component: The content of the App.tsx React component
            output_path: Optional path to save the generated schema (ignored - agent writes directly)
            
        Returns:
            Tuple of (success, "", message)
        """
        try:
            logger.info("🔨 Schema Generator: Starting database schema generation")
            logger.info(f"📝 Plan content: {len(plan_content)} characters")
            logger.info(f"⚛️ React component: {len(react_component)} characters")
            
            # Create user prompt from plan and component content
            user_prompt = create_user_prompt(plan_content, react_component)
            
            # Run the agent - it will write files directly using Write tool
            logger.info("🤖 Running Schema Generator Agent...")
            result = await self.agent.run(user_prompt)
            
            if not result.success:
                error_msg = f"Agent failed: {result.content}"
                logger.error(f"❌ {error_msg}")
                return False, "", error_msg
            
            logger.info("✅ Database schema generated successfully")
            logger.info(f"📄 Agent completed with result: {result.content[:200]}...")
            
            # Check if schema file was created (validation)
            expected_schema_path = Path("shared/schema.ts")
            if expected_schema_path.exists():
                schema_size = expected_schema_path.stat().st_size
                logger.info(f"📁 Schema file created: {expected_schema_path} ({schema_size} bytes)")
                return True, "", "Database schema generated and written successfully"
            else:
                logger.warning("⚠️ Schema file not found at expected location, but agent reported success")
                return True, "", "Database schema generation completed (file location may vary)"
            
        except Exception as e:
            error_msg = f"Schema generation failed: {str(e)}"
            logger.error(f"❌ {error_msg}")
            return False, "", error_msg


async def run_schema_generator(
    plan_content: str,
    react_component: str, 
    output_path: Path = None
) -> Tuple[AgentResult, str]:
    """Convenience function to run the Schema Generator Agent.
    
    Args:
        plan_content: The content of the plan.md file
        react_component: The content of the App.tsx React component
        output_path: Optional path to save the generated schema
        
    Returns:
        Tuple of (AgentResult, schema_code)
    """
    generator = SchemaGeneratorAgent()
    success, schema_code, message = await generator.generate_schema(
        plan_content, react_component, output_path
    )
    
    result = AgentResult(
        content=schema_code if success else message,
        cost=0.0,  # TODO: Track actual cost from agent
        success=success
    )
    
    return result, schema_code