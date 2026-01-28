"""Stage 0.5: Sprint Breakdown - Splits PRD into sprint-based deliverables.

This stage takes the comprehensive PRD from Stage 0 and breaks it down into
multiple sprint-based PRDs, with Sprint 1 focusing on the absolute MVP.
"""

import logging
from pathlib import Path
from typing import Tuple, List, Optional
from cc_agent import AgentResult
from app_factory.agents.stage_0_sprint_breakdown import sprint_breakdown_agent
from app_factory.utils import print_stage_header, Timer

logger = logging.getLogger(__name__)


async def run_stage(
    prd_content: str,
    app_name: str,
    output_dir: Path,
    num_sprints: Optional[int] = None
) -> Tuple[AgentResult, List[Path]]:
    """Break down PRD into sprint-based deliverables.
    
    Args:
        prd_content: The full PRD content from Stage 0
        app_name: Name of the application
        output_dir: Directory where sprint PRDs should be written (specs folder)
        num_sprints: Target number of sprints (1-4, default 3)
        
    Returns:
        Tuple of (AgentResult, List of sprint PRD paths)
    """
    timer = Timer("stage_0_5_sprint_breakdown")
    print_stage_header("0.5", "Sprint Breakdown", "📅")
    
    logger.info(f"Breaking down PRD for '{app_name}' into sprints")
    logger.info(f"PRD size: {len(prd_content)} characters")
    logger.info(f"Output directory: {output_dir}")
    
    # Ensure output directory exists
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Run the sprint breakdown agent
    result_dict = await sprint_breakdown_agent.break_down_prd(
        prd_content=prd_content,
        app_name=app_name,
        output_dir=str(output_dir),
        num_sprints=num_sprints
    )
    
    # Create AgentResult from the response
    result = AgentResult(
        success=result_dict["success"],
        content=result_dict.get("summary", ""),
        cost=result_dict.get("cost", 0.0),
        metadata={
            "num_sprints": result_dict.get("num_sprints", 0),
            "sprint_files": result_dict.get("sprint_files", []),
            "overview_file": result_dict.get("overview_file"),
            "roadmap_file": result_dict.get("roadmap_file"),
            "error": result_dict.get("error")
        }
    )
    
    if not result.success:
        error_msg = result.metadata.get("error", "Unknown error")
        logger.error(f"Failed to break down PRD: {error_msg}")
        return result, []
    
    # Convert sprint file paths to Path objects
    sprint_paths = [Path(f) for f in result.metadata.get("sprint_files", [])]
    
    # Log summary
    logger.info(f"✅ Sprint breakdown completed in {timer.elapsed_str()}")
    logger.info(f"   - Number of sprints: {result.metadata.get('num_sprints', 0)}")
    logger.info(f"   - Cost: ${result.cost:.4f}")
    
    if result.metadata.get("overview_file"):
        logger.info(f"   - Overview: {Path(result.metadata['overview_file']).name}")
    
    if result.metadata.get("roadmap_file"):
        logger.info(f"   - Roadmap: {Path(result.metadata['roadmap_file']).name}")
    
    for i, sprint_path in enumerate(sprint_paths, 1):
        logger.info(f"   - Sprint {i}: {sprint_path.name}")
    
    return result, sprint_paths


def get_sprint_prd_content(sprint_path: Path) -> str:
    """Read the content of a sprint PRD file.
    
    Args:
        sprint_path: Path to the sprint PRD file
        
    Returns:
        Content of the sprint PRD
    """
    try:
        return sprint_path.read_text()
    except Exception as e:
        logger.error(f"Failed to read sprint PRD at {sprint_path}: {e}")
        return ""


def get_sprint_number(sprint_path: Path) -> int:
    """Extract sprint number from file path.
    
    Args:
        sprint_path: Path to sprint PRD file (e.g., prd_sprint_1.md)
        
    Returns:
        Sprint number (1-based)
    """
    try:
        # Extract number from filename like "prd_sprint_1.md"
        name = sprint_path.stem  # "prd_sprint_1"
        parts = name.split('_')
        if len(parts) >= 3 and parts[-1].isdigit():
            return int(parts[-1])
    except Exception:
        pass
    return 1  # Default to 1 if parsing fails