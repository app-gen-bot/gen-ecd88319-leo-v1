"""Stage 0.5: Sprint Breakdown - Chained approach for reliable file creation.

This version breaks down the PRD using multiple agent calls to ensure
all files are created reliably.
"""

import logging
from pathlib import Path
from typing import Tuple, List, Optional
from cc_agent import AgentResult
from app_factory.agents.stage_0_sprint_breakdown import sprint_breakdown_agent
from app_factory.agents.stage_0_sprint_breakdown.sprint_breakdown.chained_prompts import (
    build_previous_sprints_context
)
from app_factory.agents.stage_0_sprint_breakdown.sprint_breakdown.config import (
    INITIAL_SPRINTS,
    MAX_SPRINTS,
    OUTPUT_PATTERNS
)
from app_factory.utils import print_stage_header, Timer

logger = logging.getLogger(__name__)


async def run_stage(
    prd_content: str,
    app_name: str,
    output_dir: Path,
    num_sprints: Optional[int] = None
) -> Tuple[AgentResult, List[Path]]:
    """Break down PRD into sprint-based deliverables using chained approach.
    
    Args:
        prd_content: The full PRD content from Stage 0
        app_name: Name of the application
        output_dir: Directory where sprint PRDs should be written (specs folder)
        num_sprints: Target number of sprints (if specified, won't ask for more)
        
    Returns:
        Tuple of (AgentResult, List of sprint PRD paths)
    """
    timer = Timer("stage_0_5_sprint_breakdown_chained")
    print_stage_header("0.5", "Sprint Breakdown (Chained)", "📅")
    
    logger.info(f"Breaking down PRD for '{app_name}' into sprints")
    logger.info(f"PRD size: {len(prd_content)} characters")
    logger.info(f"Output directory: {output_dir}")
    
    # Ensure output directory exists
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    total_cost = 0.0
    sprint_paths = []
    sprint_contents = {}
    
    # Phase 1: Create overview and roadmap separately
    logger.info("📋 Phase 1: Creating sprint overview and roadmap...")
    
    # Step 1: Create overview
    logger.info("   📄 Creating sprint overview...")
    overview_result = await sprint_breakdown_agent.create_overview(
        prd_content=prd_content,
        app_name=app_name,
        output_dir=str(output_dir),
        target_sprints=num_sprints or INITIAL_SPRINTS
    )
    
    total_cost += overview_result["cost"]
    
    if not overview_result["file_created"]:
        error_msg = "Failed to create sprint overview"
        logger.error(error_msg)
        return AgentResult(
            success=False,
            content=error_msg,
            cost=total_cost
        ), []
    
    logger.info(f"   ✅ Created overview: {overview_result['file_path']}")
    
    # Read overview content for roadmap context
    overview_content = ""
    if overview_result["file_path"]:
        overview_path = Path(overview_result["file_path"])
        if overview_path.exists():
            overview_content = overview_path.read_text()
    
    # Step 2: Create roadmap with overview context
    logger.info("   📍 Creating sprint roadmap...")
    roadmap_result = await sprint_breakdown_agent.create_roadmap(
        prd_content=prd_content,
        app_name=app_name,
        output_dir=str(output_dir),
        overview_content=overview_content
    )
    
    total_cost += roadmap_result["cost"]
    
    if roadmap_result["file_created"]:
        logger.info(f"   ✅ Created roadmap: {roadmap_result['file_path']}")
    else:
        logger.warning("   ⚠️ Failed to create roadmap, continuing anyway...")
    
    # Phase 2: Create initial sprints (1 to INITIAL_SPRINTS)
    logger.info(f"\n📝 Phase 2: Creating Sprint PRDs (1-{INITIAL_SPRINTS})...")
    
    for sprint_num in range(1, INITIAL_SPRINTS + 1):
        # Build context from previously created sprint files
        previous_context = ""
        if sprint_num > 1:
            # Read previous sprint files to build context
            for prev_num in range(1, sprint_num):
                prev_path = output_dir / f"prd_sprint_{prev_num}.md"
                if prev_path.exists():
                    prev_content = prev_path.read_text()
                    prev_summary = extract_sprint_summary(prev_content, prev_num)
                    previous_context += f"\n{prev_summary}\n"
        
        logger.info(f"\n🏃 Creating Sprint {sprint_num} PRD...")
        sprint_result = await sprint_breakdown_agent.create_single_sprint_prd(
            prd_content=prd_content,
            app_name=app_name,
            output_dir=str(output_dir),
            sprint_number=sprint_num,
            previous_sprints_summary=previous_context
        )
        
        total_cost += sprint_result["cost"]
        
        if sprint_result["success"] and sprint_result["file_created"]:
            sprint_path = Path(sprint_result["sprint_path"])
            sprint_paths.append(sprint_path)
            # Read the created file content for context building
            if sprint_path.exists():
                sprint_contents[sprint_num] = sprint_path.read_text()
            logger.info(f"✅ Created {sprint_path.name}")
        else:
            logger.warning(f"⚠️ Failed to create Sprint {sprint_num} PRD")
    
    # Phase 3: Determine if more sprints are needed (unless num_sprints was specified)
    current_sprint_count = len(sprint_paths)
    
    if num_sprints and current_sprint_count >= num_sprints:
        # User specified exact number, don't create more
        logger.info(f"\n✅ Created requested {num_sprints} sprints")
    elif current_sprint_count >= INITIAL_SPRINTS and current_sprint_count < MAX_SPRINTS:
        # Ask if more sprints are needed
        logger.info(f"\n🤔 Phase 3: Determining if more sprints are needed...")
        
        completed_context = build_previous_sprints_context(sprint_contents)
        decision_result = await sprint_breakdown_agent.should_create_more_sprints(
            prd_content=prd_content,
            app_name=app_name,
            completed_sprints_summary=completed_context,
            current_sprint_count=current_sprint_count
        )
        
        total_cost += decision_result["cost"]
        
        if decision_result["success"]:
            decision = decision_result["decision"]
            logger.info(f"📊 Decision: {decision}")
            logger.info(f"💭 Reasoning: {decision_result['explanation'][:200]}...")
            
            # Continue creating sprints if needed
            if decision == "ADD_SPRINT":
                while current_sprint_count < MAX_SPRINTS:
                    sprint_num = current_sprint_count + 1
                    previous_context = build_previous_sprints_context(sprint_contents)
                    
                    logger.info(f"\n🏃 Creating Sprint {sprint_num} PRD...")
                    sprint_result = await sprint_breakdown_agent.create_single_sprint_prd(
                        prd_content=prd_content,
                        app_name=app_name,
                        output_dir=str(output_dir),
                        sprint_number=sprint_num,
                        previous_sprints_summary=previous_context
                    )
                    
                    total_cost += sprint_result["cost"]
                    
                    if sprint_result["success"] and sprint_result["file_created"]:
                        sprint_path = Path(sprint_result["sprint_path"])
                        sprint_paths.append(sprint_path)
                        sprint_contents[sprint_num] = sprint_result["sprint_content"]
                        current_sprint_count += 1
                        logger.info(f"✅ Created {sprint_path.name}")
                        
                        # Ask again if we should continue (unless at max)
                        if current_sprint_count < MAX_SPRINTS:
                            completed_context = build_previous_sprints_context(sprint_contents)
                            decision_result = await sprint_breakdown_agent.should_create_more_sprints(
                                prd_content=prd_content,
                                app_name=app_name,
                                completed_sprints_summary=completed_context,
                                current_sprint_count=current_sprint_count
                            )
                            
                            total_cost += decision_result["cost"]
                            
                            if decision_result["decision"] != "ADD_SPRINT":
                                logger.info("📊 No more sprints needed")
                                break
                    else:
                        logger.warning(f"⚠️ Failed to create Sprint {sprint_num} PRD")
                        break
    
    # Create final result
    result = AgentResult(
        success=len(sprint_paths) > 0,
        content=f"Created {len(sprint_paths)} sprint PRDs",
        cost=total_cost,
        metadata={
            "num_sprints": len(sprint_paths),
            "sprint_files": [str(p) for p in sprint_paths],
            "overview_file": str(output_dir / OUTPUT_PATTERNS["overview"]) if (output_dir / OUTPUT_PATTERNS["overview"]).exists() else None,
            "roadmap_file": str(output_dir / OUTPUT_PATTERNS["roadmap"]) if (output_dir / OUTPUT_PATTERNS["roadmap"]).exists() else None
        }
    )
    
    # Log summary
    logger.info(f"\n✅ Sprint breakdown completed in {timer.elapsed_str()}")
    logger.info(f"   - Number of sprints: {len(sprint_paths)}")
    logger.info(f"   - Total cost: ${total_cost:.4f}")
    
    if result.metadata.get("overview_file"):
        logger.info(f"   - Overview: {Path(result.metadata['overview_file']).name}")
    
    if result.metadata.get("roadmap_file"):
        logger.info(f"   - Roadmap: {Path(result.metadata['roadmap_file']).name}")
    
    for i, sprint_path in enumerate(sprint_paths, 1):
        logger.info(f"   - Sprint {i}: {sprint_path.name}")
    
    return result, sprint_paths


# Re-export the helper functions from the original module
from app_factory.stages.stage_0_5_sprint_breakdown import (
    get_sprint_prd_content,
    get_sprint_number
)