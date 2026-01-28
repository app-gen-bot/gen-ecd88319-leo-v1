#!/usr/bin/env python3
"""Run the AI App Factory pipeline specifically for the project management app."""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

from src.app_factory.stages.stage_0_prd import run_stage_0_prd
from src.app_factory.stages.stage_1_interaction_spec import run_stage_1_interaction_spec
from src.app_factory.stages.stage_2_wireframe import run_stage_2_wireframe

async def main():
    """Run the pipeline for project management app."""
    
    # Define the user prompt
    user_prompt = """
    Build a project management application similar to Asana with the following features:
    
    1. Projects and Workspaces
       - Create and manage multiple workspaces
       - Create projects within workspaces
       - Set project status (active, archived, on-hold)
       - Project templates for common workflows
    
    2. Task Management
       - Create, edit, and delete tasks
       - Assign tasks to team members
       - Set due dates and priorities
       - Add task descriptions with rich text
       - Subtasks and task dependencies
       - Task status (todo, in-progress, review, done)
       - Custom fields for tasks
    
    3. Team Collaboration
       - Team member management
       - Role-based permissions (admin, member, guest)
       - Comments on tasks
       - @mentions in comments
       - Activity feed showing updates
       - File attachments on tasks
    
    4. Views and Organization
       - List view of tasks
       - Kanban board view
       - Calendar view for due dates
       - Timeline/Gantt view for project planning
       - Filter and search functionality
       - Save custom views
    
    5. Notifications and Integrations
       - Email notifications for task updates
       - In-app notifications
       - Daily/weekly digest emails
       - Slack integration basics
    
    6. Analytics and Reporting
       - Project progress tracking
       - Team productivity metrics
       - Task completion rates
       - Burndown charts
       - Export reports
    
    Use modern UI/UX with a clean, professional design. The app should be fast, 
    responsive, and intuitive for teams of all sizes.
    """
    
    output_dir = Path("apps/project-management-app")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print("🚀 Starting AI App Factory Pipeline for Project Management App")
    print("=" * 60)
    print(f"Output directory: {output_dir}")
    print("=" * 60)
    
    # Stage 0: Generate PRD
    print("\n📋 Stage 0: Generating PRD...")
    prd_result = await run_stage_0_prd(user_prompt, output_dir)
    if not prd_result.success:
        print(f"❌ Stage 0 failed: {prd_result.error}")
        return
    print("✅ PRD generated successfully!")
    
    # Stage 1: Generate Interaction Spec
    print("\n🎯 Stage 1: Generating Interaction Spec...")
    interaction_result = await run_stage_1_interaction_spec(output_dir)
    if not interaction_result.success:
        print(f"❌ Stage 1 failed: {interaction_result.error}")
        return
    print("✅ Interaction spec generated successfully!")
    
    # Stage 2: Generate Wireframe
    print("\n🎨 Stage 2: Generating Wireframe (with context-aware agent)...")
    print("  📊 This stage uses the context-aware WireframeAgent with Graphiti integration")
    wireframe_result = await run_stage_2_wireframe(output_dir)
    if not wireframe_result.success:
        print(f"❌ Stage 2 failed: {wireframe_result.error}")
        return
    print("✅ Wireframe generated successfully!")
    
    print("\n✨ Pipeline completed successfully!")
    print(f"\n📁 Generated files in: {output_dir}")
    print("  - specs/prd.md")
    print("  - specs/interaction_spec.md")
    print("  - frontend/ (Next.js application)")

if __name__ == "__main__":
    asyncio.run(main())