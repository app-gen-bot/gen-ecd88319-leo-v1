"""Sprint Breakdown Agent - Breaks comprehensive PRDs into sprint-based deliverables."""

import logging
from typing import Dict, Any, List, Optional
from pathlib import Path
from cc_agent.context import ContextAwareAgent
from .system_prompt import SYSTEM_PROMPT
from .user_prompt import create_sprint_breakdown_prompt
from .chained_prompts import (
    create_overview_roadmap_prompt,
    create_sprint_prd_prompt,
    create_sprint_decision_prompt,
    extract_sprint_summary,
    build_previous_sprints_context
)
from .config import (
    AGENT_NAME,
    AGENT_DESCRIPTION,
    ALLOWED_TOOLS,
    PERMISSION_MODE,
    MAX_SPRINTS,
    MIN_SPRINTS,
    DEFAULT_SPRINTS,
    OUTPUT_PATTERNS
)

logger = logging.getLogger(__name__)


class SprintBreakdownAgent(ContextAwareAgent):
    """Agent that breaks down comprehensive PRDs into sprint-based deliverables."""
    
    def __init__(self):
        """Initialize the Sprint Breakdown agent."""
        super().__init__(
            name=AGENT_NAME,
            system_prompt=SYSTEM_PROMPT,
            allowed_tools=ALLOWED_TOOLS,
            permission_mode=PERMISSION_MODE,
            enable_context_awareness=True
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
        """Break down a PRD into sprint-based deliverables.
        
        Args:
            prd_content: The full PRD content to break down
            app_name: Name of the application
            output_dir: Directory where sprint PRDs should be written
            num_sprints: Target number of sprints (1-4, default from config)
            **kwargs: Additional options
            
        Returns:
            Dictionary containing:
                - success: Whether breakdown was successful
                - num_sprints: Number of sprints created
                - sprint_files: List of created sprint PRD files
                - overview_file: Path to sprint overview
                - roadmap_file: Path to sprint roadmap
                - cost: Total cost of operation
                - summary: Brief summary of the breakdown
        """
        # Validate number of sprints
        if num_sprints is None:
            num_sprints = DEFAULT_SPRINTS
        else:
            num_sprints = max(MIN_SPRINTS, min(num_sprints, MAX_SPRINTS))
        
        logger.info(f"Breaking down PRD for '{app_name}' into {num_sprints} sprints")
        logger.info(f"Output directory: {output_dir}")
        
        # Create the prompt
        prompt = create_sprint_breakdown_prompt(
            prd_content=prd_content,
            app_name=app_name,
            output_dir=output_dir,
            num_sprints=num_sprints
        )
        
        # Run the agent
        result = await self.run(prompt, **kwargs)
        
        if result.success:
            # Parse created files from agent output
            sprint_files = []
            overview_file = None
            roadmap_file = None
            
            # Check for expected output files
            output_path = Path(output_dir)
            for i in range(1, num_sprints + 1):
                sprint_file = output_path / OUTPUT_PATTERNS["sprint_prd"].format(n=i)
                if sprint_file.exists():
                    sprint_files.append(str(sprint_file))
                    logger.info(f"Created sprint {i} PRD: {sprint_file}")
            
            overview_file_path = output_path / OUTPUT_PATTERNS["overview"]
            if overview_file_path.exists():
                overview_file = str(overview_file_path)
                logger.info(f"Created sprint overview: {overview_file}")
            
            roadmap_file_path = output_path / OUTPUT_PATTERNS["roadmap"]
            if roadmap_file_path.exists():
                roadmap_file = str(roadmap_file_path)
                logger.info(f"Created sprint roadmap: {roadmap_file}")
            
            # Extract summary from result
            summary = self._extract_summary(result.content)
            
            return {
                "success": True,
                "num_sprints": len(sprint_files),
                "sprint_files": sprint_files,
                "overview_file": overview_file,
                "roadmap_file": roadmap_file,
                "cost": result.cost,
                "summary": summary
            }
        else:
            error_msg = result.metadata.get("error", "Unknown error")
            logger.error(f"Failed to break down PRD: {error_msg}")
            
            return {
                "success": False,
                "num_sprints": 0,
                "sprint_files": [],
                "overview_file": None,
                "roadmap_file": None,
                "cost": result.cost,
                "summary": None,
                "error": error_msg
            }
    
    def _extract_summary(self, content: str) -> str:
        """Extract a brief summary from the agent's output.
        
        Args:
            content: The agent's output content
            
        Returns:
            Brief summary of the sprint breakdown
        """
        # Look for summary section in the output
        lines = content.split('\n')
        summary_lines = []
        in_summary = False
        
        for line in lines:
            if any(keyword in line.lower() for keyword in ['summary', 'overview', 'breakdown']):
                in_summary = True
                continue
            elif in_summary and line.strip() == '':
                break
            elif in_summary:
                summary_lines.append(line.strip())
        
        if summary_lines:
            return ' '.join(summary_lines[:3])  # First 3 lines of summary
        else:
            # Fallback: return first non-empty line
            for line in lines:
                if line.strip():
                    return line.strip()
            return "Sprint breakdown completed"
    
    async def create_overview_and_roadmap(
        self,
        prd_content: str,
        app_name: str,
        output_dir: str,
        target_sprints: int = 3,
        **kwargs
    ) -> Dict[str, Any]:
        """Create sprint overview and roadmap documents."""
        logger.info(f"Creating overview and roadmap for {app_name}")
        
        prompt = create_overview_roadmap_prompt(
            prd_content=prd_content,
            app_name=app_name,
            output_dir=output_dir,
            target_sprints=target_sprints
        )
        
        result = await self.run(prompt, **kwargs)
        
        # Check which files were created
        output_path = Path(output_dir)
        overview_exists = (output_path / OUTPUT_PATTERNS["overview"]).exists()
        roadmap_exists = (output_path / OUTPUT_PATTERNS["roadmap"]).exists()
        
        return {
            "success": result.success,
            "overview_created": overview_exists,
            "roadmap_created": roadmap_exists,
            "overview_path": str(output_path / OUTPUT_PATTERNS["overview"]) if overview_exists else None,
            "roadmap_path": str(output_path / OUTPUT_PATTERNS["roadmap"]) if roadmap_exists else None,
            "cost": result.cost
        }
    
    async def create_overview(
        self,
        prd_content: str,
        app_name: str,
        output_dir: str,
        target_sprints: int = 3,
        **kwargs
    ) -> Dict[str, Any]:
        """Create only the sprint overview file."""
        logger.info(f"Creating sprint overview for {app_name}")
        
        prompt = f"""Analyze this Product Requirements Document and create a sprint overview.

Application Name: {app_name}
Target Number of Sprints: {target_sprints}
Output File: {output_dir}/sprint_overview.md

Create a comprehensive sprint overview that includes:
- High-level goals and themes for each sprint
- Brief description of what each sprint delivers
- Target users and value proposition per sprint
- MVP focus for Sprint 1

PRD Content:
================
{prd_content}
================

Create the sprint overview file now."""
        
        result = await self.run(prompt, **kwargs)
        overview_path = Path(output_dir) / OUTPUT_PATTERNS["overview"]
        
        return {
            "success": result.success and overview_path.exists(),
            "cost": result.cost,
            "file_created": overview_path.exists(),
            "file_path": str(overview_path) if overview_path.exists() else None
        }
    
    async def create_roadmap(
        self,
        prd_content: str,
        app_name: str,
        output_dir: str,
        overview_content: str = "",
        **kwargs
    ) -> Dict[str, Any]:
        """Create only the sprint roadmap file."""
        logger.info(f"Creating sprint roadmap for {app_name}")
        
        context = ""
        if overview_content:
            context = f"\nBased on the sprint overview that breaks down the project into sprints,\n"
        
        prompt = f"""Create a sprint roadmap document for {app_name}.

{context}You need to create a file at: {output_dir}/sprint_roadmap.md

The roadmap should include:
1. Timeline for Sprint 1 (MVP): 8-10 weeks
2. Timeline for Sprint 2 (Enhanced): 6-8 weeks  
3. Timeline for Sprint 3 (Extended): 8-10 weeks

For each sprint include:
- Start and end dates (relative, e.g., "Week 1-8")
- Key features and deliverables
- Dependencies between sprints
- Critical milestones

Format it as a clear roadmap showing progression from MVP to full product.

PRD Content for reference:
================
{prd_content}
================

Use the Write tool to create the sprint roadmap file now at: {output_dir}/sprint_roadmap.md"""
        
        result = await self.run(prompt, **kwargs)
        roadmap_path = Path(output_dir) / OUTPUT_PATTERNS["roadmap"]
        
        return {
            "success": result.success and roadmap_path.exists(),
            "cost": result.cost,
            "file_created": roadmap_path.exists(),
            "file_path": str(roadmap_path) if roadmap_path.exists() else None
        }
    
    async def create_single_sprint_prd(
        self,
        prd_content: str,
        app_name: str,
        output_dir: str,
        sprint_number: int,
        previous_sprints_summary: str = "",
        **kwargs
    ) -> Dict[str, Any]:
        """Create a single sprint PRD with context from previous sprints."""
        logger.info(f"Creating Sprint {sprint_number} PRD for {app_name}")
        
        prompt = create_sprint_prd_prompt(
            prd_content=prd_content,
            app_name=app_name,
            output_dir=output_dir,
            sprint_number=sprint_number,
            previous_sprints_summary=previous_sprints_summary
        )
        
        result = await self.run(prompt, **kwargs)
        
        # Check if file was created
        output_path = Path(output_dir)
        sprint_file = output_path / OUTPUT_PATTERNS["sprint_prd"].format(n=sprint_number)
        file_created = sprint_file.exists()
        
        sprint_content = ""
        if file_created:
            sprint_content = sprint_file.read_text()
        
        return {
            "success": result.success and file_created,
            "file_created": file_created,
            "sprint_path": str(sprint_file) if file_created else None,
            "sprint_content": sprint_content,
            "cost": result.cost
        }
    
    async def should_create_more_sprints(
        self,
        prd_content: str,
        app_name: str,
        completed_sprints_summary: str,
        current_sprint_count: int,
        **kwargs
    ) -> Dict[str, Any]:
        """Determine if more sprints are needed."""
        logger.info(f"Determining if more sprints needed after {current_sprint_count} sprints")
        
        prompt = create_sprint_decision_prompt(
            prd_content=prd_content,
            app_name=app_name,
            completed_sprints_summary=completed_sprints_summary,
            current_sprint_count=current_sprint_count
        )
        
        result = await self.run(prompt, **kwargs)
        
        # Parse decision from response
        response = result.content.upper()
        decision = "COMPLETE"  # Default
        
        if "ADD_SPRINT" in response:
            decision = "ADD_SPRINT"
        elif "COMBINE_REMAINING" in response:
            decision = "COMBINE_REMAINING"
        elif "COMPLETE" in response:
            decision = "COMPLETE"
        
        return {
            "success": result.success,
            "decision": decision,
            "explanation": result.content,
            "cost": result.cost
        }


# Create singleton instance
sprint_breakdown_agent = SprintBreakdownAgent()