"""Enhanced Sprint Breakdown Agent that ensures all files are created."""

import logging
from typing import Dict, Any, Optional
from pathlib import Path
from cc_agent.context import ContextAwareAgent
from .system_prompt import SYSTEM_PROMPT
from .user_prompt import create_sprint_breakdown_prompt
from .config import (
    AGENT_NAME,
    AGENT_DESCRIPTION,
    ALLOWED_TOOLS,
    PERMISSION_MODE,
    DEFAULT_SPRINTS,
    OUTPUT_PATTERNS,
    MAX_TURNS
)

logger = logging.getLogger(__name__)


class SprintBreakdownAgentWithLoop(ContextAwareAgent):
    """Agent that ensures all sprint files are created before completing."""
    
    def __init__(self):
        """Initialize the Sprint Breakdown agent."""
        super().__init__(
            name=AGENT_NAME,
            system_prompt=SYSTEM_PROMPT,
            allowed_tools=ALLOWED_TOOLS,
            permission_mode=PERMISSION_MODE,
            enable_context_awareness=True,
            max_turns=MAX_TURNS
        )
        
        self.description = AGENT_DESCRIPTION
    
    async def break_down_prd(
        self,
        prd_content: str,
        app_name: str,
        output_dir: str,
        num_sprints: Optional[int] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Break down a PRD into sprint-based deliverables with verification loop."""
        
        if num_sprints is None:
            num_sprints = DEFAULT_SPRINTS
        
        logger.info(f"Breaking down PRD for '{app_name}' into {num_sprints} sprints")
        logger.info(f"Output directory: {output_dir}")
        
        # Define expected files
        expected_files = [
            OUTPUT_PATTERNS["overview"],
            OUTPUT_PATTERNS["roadmap"]
        ]
        for i in range(1, num_sprints + 1):
            expected_files.append(OUTPUT_PATTERNS["sprint_prd"].format(n=i))
        
        # Create initial prompt
        prompt = create_sprint_breakdown_prompt(
            prd_content=prd_content,
            app_name=app_name,
            output_dir=output_dir,
            num_sprints=num_sprints
        )
        
        # Add explicit file list to prompt
        file_list = "\n".join([f"- {output_dir}/{f}" for f in expected_files])
        prompt += f"\n\n**FILES YOU MUST CREATE**:\n{file_list}\n\nDo not stop until ALL these files exist!"
        
        # Run the agent
        result = await self.run(prompt, **kwargs)
        
        # Check which files were created
        output_path = Path(output_dir)
        sprint_files = []
        overview_file = None
        roadmap_file = None
        
        # Check for overview
        overview_file_path = output_path / OUTPUT_PATTERNS["overview"]
        if overview_file_path.exists():
            overview_file = str(overview_file_path)
            logger.info(f"Created sprint overview: {overview_file}")
        
        # Check for roadmap
        roadmap_file_path = output_path / OUTPUT_PATTERNS["roadmap"]
        if roadmap_file_path.exists():
            roadmap_file = str(roadmap_file_path)
            logger.info(f"Created sprint roadmap: {roadmap_file}")
        
        # Check for sprint PRDs
        for i in range(1, num_sprints + 1):
            sprint_file = output_path / OUTPUT_PATTERNS["sprint_prd"].format(n=i)
            if sprint_file.exists():
                sprint_files.append(str(sprint_file))
                logger.info(f"Created sprint {i} PRD: {sprint_file}")
        
        # Determine success
        expected_count = 2 + num_sprints  # overview + roadmap + sprint PRDs
        actual_count = (1 if overview_file else 0) + (1 if roadmap_file else 0) + len(sprint_files)
        
        if actual_count < expected_count:
            logger.warning(f"Only created {actual_count} of {expected_count} expected files")
            missing = []
            if not overview_file:
                missing.append("sprint_overview.md")
            if not roadmap_file:
                missing.append("sprint_roadmap.md")
            for i in range(1, num_sprints + 1):
                sprint_file = f"prd_sprint_{i}.md"
                if not any(sprint_file in s for s in sprint_files):
                    missing.append(sprint_file)
            
            logger.error(f"Missing files: {', '.join(missing)}")
        
        return {
            "success": result.success and actual_count == expected_count,
            "num_sprints": len(sprint_files),
            "sprint_files": sprint_files,
            "overview_file": overview_file,
            "roadmap_file": roadmap_file,
            "cost": result.cost,
            "summary": f"Created {actual_count} of {expected_count} files",
            "missing_files": missing if actual_count < expected_count else []
        }


# Create singleton instance
sprint_breakdown_agent_loop = SprintBreakdownAgentWithLoop()