#!/usr/bin/env python3
"""Test the AI App Factory pipeline with a project management app."""

import asyncio
import logging
from pathlib import Path
from app_factory.main import process_user_prompt

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

async def main():
    """Run the AI App Factory pipeline for a project management app."""
    
    # Define the user prompt for an Asana replacement
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
    
    print("🚀 Starting AI App Factory Pipeline for Project Management App")
    print("=" * 60)
    print(f"Output directory: {output_dir}")
    print("=" * 60)
    
    # Run the pipeline
    result = await process_user_prompt(user_prompt, str(output_dir))
    
    if result.get("success"):
        print("\n✅ Pipeline completed successfully!")
        print(f"Generated app in: {output_dir}")
        print("\nStages completed:")
        for stage, stage_result in result.get("stages", {}).items():
            status = "✅" if stage_result.get("success") else "❌"
            print(f"  {status} {stage}")
    else:
        print("\n❌ Pipeline failed!")
        print(f"Error: {result.get('error', 'Unknown error')}")

if __name__ == "__main__":
    asyncio.run(main())