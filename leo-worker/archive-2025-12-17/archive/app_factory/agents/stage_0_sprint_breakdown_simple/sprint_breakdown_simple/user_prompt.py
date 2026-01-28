"""User prompt templates for the Simplified Sprint Breakdown Agent."""

def create_sprint_breakdown_prompt(prd_content: str, app_name: str, output_dir: str) -> str:
    """Create the user prompt for sprint breakdown.
    
    Args:
        prd_content: The full PRD content
        app_name: Name of the application
        output_dir: Directory where the breakdown should be written
        
    Returns:
        Formatted prompt for the agent
    """
    return f"""Please analyze this Product Requirements Document and create a comprehensive sprint breakdown.

Application Name: {app_name}
Output File: {output_dir}/sprints_breakdown.md

You must create EXACTLY ONE markdown file that contains the complete sprint breakdown for this project.

Determine the optimal number of sprints (between 2-6) based on the complexity of the PRD. 

Remember:
- Sprint 1 must be a true MVP that solves the core problem
- Each sprint should be 4-10 weeks
- Include concrete deliverables for each sprint
- Make the document self-contained and actionable

PRD Content:
================
{prd_content}
================

Now create the sprint breakdown document using the Write tool. The file must be created at: {output_dir}/sprints_breakdown.md"""