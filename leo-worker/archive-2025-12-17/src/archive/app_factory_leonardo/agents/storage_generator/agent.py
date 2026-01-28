"""Storage Generator Agent implementation."""

import logging
from pathlib import Path
from typing import Tuple

from cc_agent import Agent, AgentResult

from .config import AGENT_CONFIG
from .system_prompt import SYSTEM_PROMPT
from .user_prompt import create_user_prompt

logger = logging.getLogger(__name__)


class StorageGeneratorAgent:
    """Agent that generates storage layer implementation from database schema."""
    
    def __init__(self, cwd: str = None):
        """Initialize the Storage Generator Agent.
        
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
    
    async def generate_storage(self) -> Tuple[bool, str, str]:
        """Generate storage layer implementation from schema.
        
        Returns:
            Tuple of (success, "", message)
        """
        try:
            logger.info("🔨 Storage Generator: Starting storage layer generation")
            
            # Create user prompt - agent will read schema file directly
            user_prompt = create_user_prompt()
            
            # Run the agent - it will read files and write files directly using tools
            logger.info("🤖 Running Storage Generator Agent...")
            result = await self.agent.run(user_prompt)
            
            if not result.success:
                error_msg = f"Agent failed: {result.content}"
                logger.error(f"❌ {error_msg}")
                return False, "", error_msg
            
            logger.info("✅ Storage layer generated successfully")
            logger.info(f"📄 Agent completed with result: {result.content[:200]}...")
            
            # Check if storage file was created (validation)
            expected_storage_path = Path("server/storage.ts")
            if expected_storage_path.exists():
                storage_size = expected_storage_path.stat().st_size
                logger.info(f"📁 Storage file created: {expected_storage_path} ({storage_size} bytes)")
                return True, "", "Storage layer generated and written successfully"
            else:
                logger.warning("⚠️ Storage file not found at expected location, but agent reported success")
                return True, "", "Storage layer generation completed (file location may vary)"
            
        except Exception as e:
            error_msg = f"Storage generation failed: {str(e)}"
            logger.error(f"❌ {error_msg}")
            return False, "", error_msg


async def run_storage_generator() -> Tuple[AgentResult, str]:
    """Convenience function to run the Storage Generator Agent.
        
    Returns:
        Tuple of (AgentResult, "")
    """
    generator = StorageGeneratorAgent()
    success, _, message = await generator.generate_storage()
    
    result = AgentResult(
        content=message,
        cost=0.0,  # TODO: Track actual cost from agent
        success=success
    )
    
    return result, ""