"""User prompt creation for the Sprint Breakdown Agent."""


def create_sprint_breakdown_prompt(
    prd_content: str,
    app_name: str,
    output_dir: str,
    num_sprints: int = 3
) -> str:
    """Create the prompt for the sprint breakdown agent.
    
    Args:
        prd_content: The full PRD content to break down
        app_name: Name of the application
        output_dir: Directory where sprint PRDs should be written
        num_sprints: Target number of sprints (1-4, default 3)
        
    Returns:
        Formatted prompt for the sprint breakdown agent
    """
    return f"""Break down the following Product Requirements Document into {num_sprints} sprint-based PRDs for incremental development and delivery.

Application Name: {app_name}
Output Directory: {output_dir}

IMPORTANT INSTRUCTIONS:
1. Read and analyze the complete PRD below
2. Break it down into exactly {num_sprints} sprints
3. Sprint 1 MUST be the absolute minimum viable product (MVP)
4. Each sprint must be fully functional and releasable
5. Write each sprint PRD to: {output_dir}/prd_sprint_{{n}}.md
6. Create a sprint overview at: {output_dir}/sprint_overview.md
7. Create a visual roadmap at: {output_dir}/sprint_roadmap.md

Remember:
- Sprint 1 is the MOST CRITICAL - it must deliver immediate value with minimal features
- Remove ALL nice-to-have features from Sprint 1
- Each subsequent sprint builds on the previous one
- Think "What's the absolute minimum to make this useful?"

Full PRD Content:
================
{prd_content}
================

Now analyze this PRD and create {num_sprints} sprint-based PRDs that follow the incremental delivery philosophy. 

**CRITICAL COMPLETION CHECKLIST** - You are NOT done until ALL of these files exist:
1. ✅ {output_dir}/sprint_overview.md - Overview of all sprints
2. ✅ {output_dir}/sprint_roadmap.md - Visual/textual roadmap
3. ✅ {output_dir}/prd_sprint_1.md - Complete Sprint 1 PRD (MOST IMPORTANT)
4. ✅ {output_dir}/prd_sprint_2.md - Complete Sprint 2 PRD
5. ✅ {output_dir}/prd_sprint_3.md - Complete Sprint 3 PRD (if 3 sprints requested)

Start by writing the sprint overview document, then the roadmap, then create EACH individual sprint PRD as a complete, standalone document.

Focus especially on Sprint 1 - make it as minimal as possible while still delivering the core value proposition. If you're debating whether a feature belongs in Sprint 1, it probably doesn't.

REMEMBER: You must create ALL files listed above. Do not stop after creating just the overview!"""