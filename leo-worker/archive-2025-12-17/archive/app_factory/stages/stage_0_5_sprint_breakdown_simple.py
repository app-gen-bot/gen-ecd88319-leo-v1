"""Stage 0.5: Simplified Sprint Breakdown - Creates a single comprehensive sprint breakdown document.

This simplified version creates one document containing all sprint information,
rather than multiple separate files.
"""

import logging
from pathlib import Path
from typing import Tuple, Optional
from cc_agent import AgentResult
from app_factory.agents.stage_0_sprint_breakdown_simple import simplified_sprint_breakdown_agent
from app_factory.agents.stage_0_sprint_breakdown_simple.sprint_breakdown_simple import OUTPUT_FILENAME
from app_factory.utils import print_stage_header, Timer

logger = logging.getLogger(__name__)


async def run_stage(
    prd_content: str,
    app_name: str,
    output_dir: Path,
    **kwargs
) -> Tuple[AgentResult, Optional[Path]]:
    """Create a comprehensive sprint breakdown document from PRD.
    
    Args:
        prd_content: The full PRD content from Stage 0
        app_name: Name of the application
        output_dir: Directory where the breakdown should be written (should be specs dir)
        **kwargs: Additional options passed to the agent
        
    Returns:
        Tuple of (AgentResult, Path to sprint breakdown document or None)
    """
    timer = Timer("stage_0_5_sprint_breakdown_simple")
    print_stage_header("0.5", "Sprint Breakdown (Simplified)", "📋")
    
    logger.info(f"Creating sprint breakdown for '{app_name}'")
    logger.info(f"PRD size: {len(prd_content)} characters")
    logger.info(f"Output directory: {output_dir}")
    
    # Ensure output directory exists
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Run the agent to create the sprint breakdown
    try:
        result = await simplified_sprint_breakdown_agent.create_sprint_breakdown(
            prd_content=prd_content,
            app_name=app_name,
            output_dir=str(output_dir),
            **kwargs
        )
        
        if result["success"]:
            sprint_doc_path = Path(result["file_path"])
            
            # Create AgentResult
            agent_result = AgentResult(
                success=True,
                content=f"Successfully created sprint breakdown document",
                cost=result["cost"],
                metadata={
                    "file_path": str(sprint_doc_path),
                    "file_size": result["file_size"]
                }
            )
            
            # Log success
            logger.info(f"✅ Sprint breakdown completed in {timer.elapsed_str()}")
            logger.info(f"   - Document: {sprint_doc_path.name}")
            logger.info(f"   - Size: {result['file_size']:,} bytes")
            logger.info(f"   - Cost: ${result['cost']:.4f}")
            
            # Read and log a preview of the document
            preview_lines = 20
            try:
                content = sprint_doc_path.read_text()
                lines = content.split('\n')
                logger.info("\n📄 Document Preview (first %d lines):", preview_lines)
                logger.info("-" * 50)
                for i, line in enumerate(lines[:preview_lines]):
                    logger.info(f"{i+1:3}: {line}")
                if len(lines) > preview_lines:
                    logger.info("... (document continues)")
            except Exception as e:
                logger.warning(f"Could not read document preview: {e}")
            
            return agent_result, sprint_doc_path
            
        else:
            # Create failure result
            agent_result = AgentResult(
                success=False,
                content=result["error"],
                cost=result["cost"],
                metadata={"error": result["error"]}
            )
            
            logger.error(f"❌ Failed to create sprint breakdown: {result['error']}")
            logger.info(f"   - Cost: ${result['cost']:.4f}")
            
            return agent_result, None
            
    except Exception as e:
        error_msg = f"Exception during sprint breakdown: {str(e)}"
        logger.error(error_msg, exc_info=True)
        
        agent_result = AgentResult(
            success=False,
            content=error_msg,
            cost=0.0,
            metadata={"error": error_msg}
        )
        
        return agent_result, None


def read_sprint_breakdown(file_path: Path) -> Optional[str]:
    """Read the sprint breakdown document.
    
    Args:
        file_path: Path to the sprint breakdown file
        
    Returns:
        Content of the file or None if not found
    """
    try:
        if file_path.exists():
            return file_path.read_text()
        else:
            logger.error(f"Sprint breakdown file not found: {file_path}")
            return None
    except Exception as e:
        logger.error(f"Error reading sprint breakdown: {e}")
        return None


def extract_sprint_count(content: str) -> int:
    """Extract the number of sprints from the breakdown document.
    
    Args:
        content: Sprint breakdown document content
        
    Returns:
        Number of sprints found (default 3 if not found)
    """
    import re
    
    # Look for "Total Sprints: X" pattern
    match = re.search(r'Total Sprints?:\s*(\d+)', content, re.IGNORECASE)
    if match:
        return int(match.group(1))
    
    # Count sprint sections
    sprint_headers = re.findall(r'^#{1,3}\s*Sprint\s*(\d+)', content, re.MULTILINE | re.IGNORECASE)
    if sprint_headers:
        return len(set(sprint_headers))
    
    # Default
    return 3