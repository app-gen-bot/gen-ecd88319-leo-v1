#!/usr/bin/env python3
"""Test creating individual sprint PRDs only."""

import asyncio
from pathlib import Path
from app_factory.agents.stage_0_sprint_breakdown.sprint_breakdown import sprint_breakdown_agent

async def main():
    # Assume overview and roadmap already exist
    output_dir = Path("test_output/sprint_prds_only")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Copy existing overview to this directory for reference
    overview_content = """# Task App Sprint Overview
    
Sprint 1: Core MVP - Basic task CRUD with auth
Sprint 2: Team Features - Assignments, priorities, due dates  
Sprint 3: Advanced - Comments, search, reports"""
    
    overview_path = output_dir / "sprint_overview.md"
    overview_path.write_text(overview_content)
    
    print("🚀 Testing individual sprint PRD creation...")
    print(f"📁 Output: {output_dir}")
    
    # Very focused prompt
    prompt = f"""Based on this sprint overview:

{overview_content}

Create THREE individual sprint PRD files:

1. Write to: {output_dir}/prd_sprint_1.md
   Content: Complete PRD for Sprint 1 MVP with:
   - Title: "Sprint 1: Core Task Management MVP"
   - Features: User auth, Create/Read/Update/Delete tasks, task list, mark complete
   - User stories and acceptance criteria for each feature
   - Technical requirements

2. Write to: {output_dir}/prd_sprint_2.md
   Content: Complete PRD for Sprint 2 with:
   - Title: "Sprint 2: Team Collaboration Features"
   - Features: Task assignment, due dates, priorities, filtering
   - User stories and acceptance criteria for each feature
   - Technical requirements

3. Write to: {output_dir}/prd_sprint_3.md
   Content: Complete PRD for Sprint 3 with:
   - Title: "Sprint 3: Advanced Features"
   - Features: Comments, search, reports, activity history
   - User stories and acceptance criteria for each feature
   - Technical requirements

IMPORTANT: You must create exactly 3 files using the Write tool. Each PRD should be a complete, standalone document."""

    # Run the agent
    result = await sprint_breakdown_agent.run(prompt)
    
    print(f"\n✅ Agent completed: {result.success}")
    print(f"💰 Cost: ${result.cost:.4f}")
    
    # Check files
    print("\n📁 Files created:")
    expected = ["prd_sprint_1.md", "prd_sprint_2.md", "prd_sprint_3.md"]
    for filename in expected:
        filepath = output_dir / filename
        if filepath.exists():
            size = filepath.stat().st_size
            print(f"   ✓ {filename} ({size:,} bytes)")
        else:
            print(f"   ❌ {filename} - MISSING!")

if __name__ == "__main__":
    asyncio.run(main())