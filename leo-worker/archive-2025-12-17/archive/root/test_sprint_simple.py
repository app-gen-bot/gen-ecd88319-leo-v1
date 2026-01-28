#!/usr/bin/env python3
"""Simple direct test of Sprint Breakdown Agent."""

import asyncio
from pathlib import Path
from app_factory.agents.stage_0_sprint_breakdown.sprint_breakdown import sprint_breakdown_agent

async def main():
    # Simple test PRD
    test_prd = """# Simple Task App PRD

## Overview
A task management app for small teams.

## Core Features
1. User authentication
2. Create/edit/delete tasks
3. Assign tasks to users
4. Mark tasks complete
5. Task list view
6. Due dates
7. Priorities
8. Comments
9. Search
10. Reports"""

    # Output directory
    output_dir = Path("test_output/simple_sprint_test")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print("🚀 Running simplified sprint breakdown test...")
    print(f"📁 Output: {output_dir}")
    
    # Create a very explicit prompt
    prompt = f"""I need you to break down this PRD into 3 sprints and create the following files:

1. {output_dir}/sprint_overview.md - Overview of all 3 sprints
2. {output_dir}/sprint_roadmap.md - Roadmap showing progression
3. {output_dir}/prd_sprint_1.md - Complete Sprint 1 PRD (MVP with only auth + basic tasks)
4. {output_dir}/prd_sprint_2.md - Complete Sprint 2 PRD (add assignments, priorities, due dates)
5. {output_dir}/prd_sprint_3.md - Complete Sprint 3 PRD (add comments, search, reports)

PRD to break down:
{test_prd}

IMPORTANT: Create ALL 5 files. Use the Write tool 5 times total."""

    # Run directly
    result = await sprint_breakdown_agent.run(prompt)
    
    print(f"\n✅ Agent completed: {result.success}")
    print(f"💰 Cost: ${result.cost:.4f}")
    
    # Check files
    print("\n📁 Files created:")
    for file in sorted(output_dir.iterdir()):
        if file.is_file():
            print(f"   ✓ {file.name}")
    
    # Count files
    files = list(output_dir.glob("*.md"))
    print(f"\n📊 Total files: {len(files)} of 5 expected")

if __name__ == "__main__":
    asyncio.run(main())