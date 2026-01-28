"""User prompt creation for the Critic agent."""


def create_critic_prompt(
    interaction_spec: str,
    tech_spec: str = "",
    output_dir: str = "",
    app_name: str = "",
    iteration: int = 1,
    compliance_threshold: int = 85
) -> str:
    """Create the prompt for the critic agent.
    
    Args:
        interaction_spec: The interaction specification content
        tech_spec: The technical implementation spec content
        output_dir: Directory where the implementation was generated
        app_name: Name of the application being evaluated
        iteration: Current iteration number
        
    Returns:
        Formatted prompt for the critic agent
    """
    tech_spec_section = ""
    if tech_spec:
        tech_spec_section = f"""
## Technical Implementation Specification
{tech_spec}

**Note**: Ensure the implementation follows all technical patterns specified above.
"""

    return f"""Evaluate the wireframe implementation for "{app_name}" (Iteration {iteration}) against the specifications below.

## Working Directory
Your current working directory is: {output_dir}
All file analysis should use relative paths from this directory.

## Interaction Specification (Requirements)
{interaction_spec}
{tech_spec_section}
## Evaluation Task

You must systematically evaluate the implementation and decide whether it's ready for completion or needs further iteration.

### Step 1: Analyze Implementation
1. **Extract EVERY feature from the specification** - create a checklist
2. **Examine the file structure** using Read tool
3. **Review key components** for React/Next.js best practices
4. **Check specification compliance** - verify EACH feature on your checklist
5. **Identify extra features** - note anything NOT in the specification
6. **Assess code quality** - TypeScript usage, component patterns, error handling

### Step 2: Validate Functionality
1. **Run build verification** using `build_test(action="verify")`
2. **Test critical user flows** using browser tools if needed:
   - Start server with `dev_server(action="start-server")`
   - Test with `browser(action="open")` and navigation
   - Stop server with `dev_server(action="stop-server")`

### Step 3: Generate Evaluation
Create a comprehensive evaluation including:
- **Compliance Score** (0-100): How well implementation matches specifications
- **Missing Features**: List of unimplemented requirements
- **Implementation Issues**: Code quality problems, bugs, anti-patterns
- **Build Status**: Whether code compiles successfully
- **Critical Flow Status**: Whether key user interactions work

### Step 4: Make Decision
Based on your evaluation:
- **COMPLETE**: If compliance ≥ {compliance_threshold}%, builds successfully, and critical flows work
- **CONTINUE**: If significant issues need addressing

## Output Format

**IMPORTANT**: Check the codebase size first. If analyzing >1000 files, use file-based reporting to avoid buffer limits.

### For Large Codebases (>1000 files):
1. Write detailed analysis to: `../specs/critic_analysis_iteration_{iteration}.md`
2. Include ALL findings, code snippets, and recommendations in the markdown file
3. Return a concise JSON summary (<100KB) with counts and top priorities only

### For Small Codebases (<1000 files):
Include full details directly in the JSON response.

Provide your evaluation in this exact JSON format:

```json
{{
  "evaluation": {{
    "compliance_score": 85,
    "summary": "Brief 1-2 sentence summary",
    "detailed_report_path": "../specs/critic_analysis_iteration_{iteration}.md",  // Only if >1000 files
    "file_count_analyzed": 127,
    "critical_issues_count": 5,
    "missing_features_count": 8,  // Count only, details in report file if large
    "navigation_report": {{
      "total_links_tested": 45,
      "broken_links_count": 3,
      "dropdown_coverage": "90%",
      "has_404_page": true,
      "routes_specified": 25,
      "routes_implemented": 23,
      "missing_routes": ["List first 3-5 missing routes here"]
    }},
    "code_quality_score": 90,
    "build_status": "success|failure",
    "critical_flows_working": true
  }},
  "decision": "complete|continue",
  "reasoning": "Concise explanation (2-3 sentences max)",
  "priority_fixes": [
    "Top 5 most critical fixes only (even if more exist in report file)"
  ]
}}
```

## Important Guidelines

1. **Be thorough but efficient** - Focus on critical aspects that impact user experience
2. **Test strategically** - Don't test every feature, focus on core functionality
3. **Consider iteration context** - This is iteration {iteration}, expect iterative improvement
4. **Quality threshold** - {compliance_threshold}% compliance is the minimum for completion
5. **Provide actionable feedback** - If continuing, give specific, fixable issues

Remember: You are the quality gatekeeper for this wireframe implementation. Your decision directly impacts whether this iteration cycle continues or completes."""