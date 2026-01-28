#!/usr/bin/env python3
"""Monitor Sprint Breakdown Agent execution to see why sprint PRDs aren't created."""

import asyncio
import logging
from pathlib import Path
import sys

# Add project root to path
sys.path.append(str(Path(__file__).parent))

from app_factory.agents.stage_0_sprint_breakdown.sprint_breakdown import sprint_breakdown_agent

# Set up detailed logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Also log agent messages
agent_logger = logging.getLogger("cc_agent.SprintBreakdownAgent")
agent_logger.setLevel(logging.DEBUG)


async def monitor_sprint_breakdown():
    """Monitor the Sprint Breakdown Agent execution."""
    
    # Use a simpler PRD for testing
    test_prd = """# TaskMaster Pro - Business Requirements Document

## Executive Summary
TaskMaster Pro is a task management application designed for small teams. It allows users to create tasks, assign them to team members, track progress, and generate reports.

## Core Features

### Must Have (MVP)
1. User authentication (login/logout)
2. Create, read, update, delete tasks
3. Assign tasks to users
4. Mark tasks as complete
5. Basic task list view

### Should Have
1. Task priorities (high, medium, low)
2. Due dates for tasks
3. Task comments
4. Email notifications
5. Search and filter tasks
6. Basic dashboard with stats

### Nice to Have
1. File attachments
2. Task templates
3. Recurring tasks
4. Advanced reporting
5. Mobile app
6. Calendar integration
7. Time tracking
8. Gantt charts

## Target Users
- Small teams (5-20 people)
- Project managers
- Team leads
- Individual contributors

## Technical Requirements
- Web-based application
- Real-time updates
- Secure authentication
- Responsive design
- Fast performance"""

    # Create output directory
    output_dir = Path("test_output/monitor_sprints")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    logger.info("🚀 Starting monitored sprint breakdown...")
    logger.info(f"Output directory: {output_dir}")
    
    # Run the agent
    result = await sprint_breakdown_agent.break_down_prd(
        prd_content=test_prd,
        app_name="taskmaster",
        output_dir=str(output_dir),
        num_sprints=3
    )
    
    # Log detailed results
    logger.info("\n📊 Detailed Results:")
    logger.info(f"Success: {result.get('success')}")
    logger.info(f"Summary: {result.get('summary')}")
    logger.info(f"Cost: ${result.get('cost', 0):.4f}")
    logger.info(f"Number of sprints: {result.get('num_sprints')}")
    logger.info(f"Sprint files: {result.get('sprint_files')}")
    logger.info(f"Overview file: {result.get('overview_file')}")
    logger.info(f"Roadmap file: {result.get('roadmap_file')}")
    
    # Check what files were actually created
    logger.info("\n📁 Files in output directory:")
    for file in output_dir.iterdir():
        if file.is_file():
            logger.info(f"   - {file.name} ({file.stat().st_size} bytes)")
    
    # If overview exists, show a snippet
    overview_path = output_dir / "sprint_overview.md"
    if overview_path.exists():
        content = overview_path.read_text()
        logger.info(f"\n📄 Overview snippet (first 500 chars):")
        logger.info(content[:500] + "...")


if __name__ == "__main__":
    asyncio.run(monitor_sprint_breakdown())