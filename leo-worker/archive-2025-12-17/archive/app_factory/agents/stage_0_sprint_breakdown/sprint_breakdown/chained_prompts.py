"""Specialized prompts for chained sprint breakdown approach."""


def create_overview_roadmap_prompt(
    prd_content: str,
    app_name: str,
    output_dir: str,
    target_sprints: int = 3
) -> str:
    """Create prompt for generating sprint overview and roadmap."""
    return f"""Analyze this Product Requirements Document and create a sprint breakdown overview and roadmap.

Application Name: {app_name}
Target Number of Sprints: {target_sprints} (may be adjusted to 4-6 if needed)

Your task is to create TWO files:

1. FIRST FILE - Sprint Overview: {output_dir}/sprint_overview.md
   - High-level goals and themes for each sprint
   - Brief description of what each sprint delivers
   - Target users and value proposition per sprint

2. SECOND FILE - Sprint Roadmap: {output_dir}/sprint_roadmap.md  
   - Timeline and duration for each sprint
   - Feature list organized by sprint
   - Dependencies and progression between sprints
   - Visual/textual representation of the development path

IMPORTANT: You MUST create BOTH files using the Write tool twice. 

Focus on Sprint 1 being the absolute MVP - only core features that deliver immediate value.

PRD Content:
================
{prd_content}
================

Now analyze this PRD and create BOTH the overview and roadmap files. Use the Write tool two times."""


def create_sprint_prd_prompt(
    prd_content: str,
    app_name: str,
    output_dir: str,
    sprint_number: int,
    previous_sprints_summary: str = ""
) -> str:
    """Create prompt for generating a single sprint PRD."""
    
    sprint_focus = {
        1: "MVP - Core Clinical Operations (appointment scheduling, basic EHR, billing)",
        2: "Enhanced Client Experience (client portal, automated reminders, inventory management)",
        3: "Advanced Features & Integration (insurance claims, lab integration, voice-to-text)"
    }
    
    context = ""
    if previous_sprints_summary:
        context = f"""
Previous Sprints have covered:
{previous_sprints_summary}

Now, """
    
    return f"""{context}Create a complete PRD document for Sprint {sprint_number}.

Application Name: {app_name}
Sprint Focus: {sprint_focus.get(sprint_number, f'Sprint {sprint_number} deliverables')}

YOU MUST create this file: {output_dir}/prd_sprint_{sprint_number}.md

The PRD should be a complete, standalone document with:

1. Sprint Overview
   - Sprint name and theme
   - Duration (8-10 weeks for Sprint 1, 6-8 weeks for Sprint 2, 8-10 weeks for Sprint 3)
   - High-level goals

2. Feature List (detailed)
   - Each feature with complete user stories
   - Acceptance criteria
   - Priority (P0, P1, P2)

3. Technical Requirements
   - Architecture decisions
   - API endpoints needed
   - Database schema changes
   - Integration points

4. Success Metrics
   - Quantifiable KPIs
   - User adoption targets
   - Performance benchmarks

5. Dependencies
   - What's needed from previous sprints
   - External dependencies

Full PRD for reference:
================
{prd_content}
================

Use the Write tool to create the Sprint {sprint_number} PRD file at: {output_dir}/prd_sprint_{sprint_number}.md"""


def create_sprint_decision_prompt(
    prd_content: str,
    app_name: str,
    completed_sprints_summary: str,
    current_sprint_count: int
) -> str:
    """Create prompt to decide if more sprints are needed."""
    return f"""You have created {current_sprint_count} sprints for {app_name}.

Completed Sprints Summary:
{completed_sprints_summary}

Original PRD:
================
{prd_content}
================

Analyze what features from the original PRD have not yet been included in any sprint.

Answer with one of these options:
1. "COMPLETE" - All important features have been allocated
2. "ADD_SPRINT" - There are enough remaining features for another sprint
3. "COMBINE_REMAINING" - Remaining features should be added to Sprint {current_sprint_count}

Consider:
- Are there significant features not yet included?
- Would they warrant a separate sprint or can they fit in the last sprint?
- Maximum allowed sprints is 6

Respond with your decision and a brief explanation."""


def extract_sprint_summary(sprint_prd_content: str, sprint_number: int) -> str:
    """Extract a summary from a sprint PRD for context building."""
    lines = sprint_prd_content.split('\n')
    summary_parts = [f"**Sprint {sprint_number} Summary:**"]
    
    # Extract key sections
    current_section = ""
    feature_count = 0
    goals_found = False
    
    for i, line in enumerate(lines):
        line = line.strip()
        
        # Look for sprint goals/overview
        if not goals_found and any(keyword in line.lower() for keyword in ['goal', 'overview', 'theme', 'focus']):
            if '#' in line:
                current_section = "goals"
                goals_found = True
            elif current_section == "goals" and line:
                summary_parts.append(f"Goal: {line}")
                current_section = ""
        
        # Look for features
        if 'feature' in line.lower() and '#' in line:
            current_section = "features"
            summary_parts.append("\nKey Features:")
        elif current_section == "features" and line and feature_count < 6:
            if line.startswith(('-', '*', '•')) or (len(line) > 0 and line[0].isdigit() and '.' in line[:3]):
                feature = line.lstrip('-*•').strip()
                if feature.find('.') > 0 and feature[0].isdigit():
                    feature = feature[feature.find('.')+1:].strip()
                if len(feature) > 10:
                    summary_parts.append(f"  - {feature}")
                    feature_count += 1
        
        # Stop after finding enough content
        if feature_count >= 6 and goals_found:
            break
    
    # If we didn't find much, add a generic summary
    if len(summary_parts) < 3:
        summary_parts.append(f"Sprint {sprint_number} PRD has been created with features and requirements.")
    
    return '\n'.join(summary_parts)


def build_previous_sprints_context(sprint_prds: dict) -> str:
    """Build context from previous sprint PRDs."""
    if not sprint_prds:
        return ""
    
    context_parts = []
    for sprint_num, content in sorted(sprint_prds.items()):
        summary = extract_sprint_summary(content, sprint_num)
        context_parts.append(summary)
        context_parts.append("")  # Empty line between sprints
    
    return '\n'.join(context_parts)