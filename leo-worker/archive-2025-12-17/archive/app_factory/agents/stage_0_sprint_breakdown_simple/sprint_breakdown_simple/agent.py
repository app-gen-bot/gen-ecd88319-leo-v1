"""Simplified Sprint Breakdown Agent - Creates a single comprehensive sprint breakdown document."""

import logging
from typing import Dict, Any
from pathlib import Path
from cc_agent import Agent
from .system_prompt import SYSTEM_PROMPT
from .user_prompt import create_sprint_breakdown_prompt
from .config import (
    AGENT_NAME,
    AGENT_DESCRIPTION,
    ALLOWED_TOOLS,
    PERMISSION_MODE,
    MAX_TURNS,
    OUTPUT_FILENAME
)

logger = logging.getLogger(__name__)


class SimplifiedSprintBreakdownAgent(Agent):
    """Agent that creates a single comprehensive sprint breakdown document."""
    
    def __init__(self):
        """Initialize the Simplified Sprint Breakdown agent."""
        super().__init__(
            name=AGENT_NAME,
            system_prompt=SYSTEM_PROMPT,
            allowed_tools=ALLOWED_TOOLS,
            permission_mode=PERMISSION_MODE,
            max_turns=MAX_TURNS
        )
        
        self.description = AGENT_DESCRIPTION
    
    async def create_sprint_breakdown(
        self,
        prd_content: str,
        app_name: str,
        output_dir: str,
        **kwargs
    ) -> Dict[str, Any]:
        """Create a comprehensive sprint breakdown document.
        
        Args:
            prd_content: The full PRD content to analyze
            app_name: Name of the application
            output_dir: Directory where the breakdown should be written
            **kwargs: Additional options for the agent
            
        Returns:
            Dictionary containing:
                - success: Whether the breakdown was created successfully
                - file_path: Path to the created file (if successful)
                - cost: Cost of the operation
                - error: Error message (if failed)
        """
        logger.info(f"Creating sprint breakdown for '{app_name}'")
        logger.info(f"Output directory: {output_dir}")
        logger.info(f"PRD size: {len(prd_content)} characters")
        
        # Ensure output directory exists
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Create the prompt
        prompt = create_sprint_breakdown_prompt(
            prd_content=prd_content,
            app_name=app_name,
            output_dir=output_dir
        )
        
        # Run the agent
        logger.info("Running sprint breakdown agent...")
        result = await self.run(prompt, **kwargs)
        
        # Check if file was created
        expected_file = output_path / OUTPUT_FILENAME
        
        if result.success and expected_file.exists():
            file_size = expected_file.stat().st_size
            logger.info(f"✅ Successfully created sprint breakdown: {expected_file}")
            logger.info(f"   File size: {file_size:,} bytes")
            
            return {
                "success": True,
                "file_path": str(expected_file),
                "file_size": file_size,
                "cost": result.cost
            }
        else:
            error_msg = "Failed to create sprint breakdown document"
            if not result.success:
                error_msg = f"Agent failed: {result.metadata.get('error', 'Unknown error')}"
            elif not expected_file.exists():
                error_msg = f"File was not created at expected location: {expected_file}"
                # Log what files were created in the directory
                created_files = list(output_path.glob("*.md"))
                if created_files:
                    logger.warning(f"Files found in output directory: {[f.name for f in created_files]}")
                else:
                    logger.warning("No files were created in the output directory")
            
            logger.error(f"❌ {error_msg}")
            
            return {
                "success": False,
                "file_path": None,
                "cost": result.cost,
                "error": error_msg
            }


# Create singleton instance
simplified_sprint_breakdown_agent = SimplifiedSprintBreakdownAgent()