"""User prompt creation for the Interaction Specification Critic agent."""

from pathlib import Path


def create_critic_prompt(
    prd_content: str,
    interaction_spec: str,
    app_name: str = "",
    iteration: int = 1,
    compliance_threshold: int = 90,
    writer_result: dict = None
) -> str:
    """Create the prompt for the interaction spec critic agent.
    
    Args:
        prd_content: The Business PRD content to validate against
        interaction_spec: The generated interaction specification to evaluate
        app_name: Name of the application being evaluated
        iteration: Current iteration number
        compliance_threshold: Minimum score for completion (default: 90)
        writer_result: Previous evaluation results if this is a re-evaluation
        
    Returns:
        Formatted prompt for the critic agent
    """
    previous_feedback = ""
    if writer_result and iteration > 1:
        previous_feedback = f"""
## Previous Evaluation
The writer has attempted to address issues from the previous evaluation.
Focus on verifying that the priority fixes have been implemented and 
reassess the overall quality.

Previous Priority Fixes:
{writer_result.get('priority_fixes', 'No previous fixes recorded')}
"""

    return f"""Evaluate the Frontend Interaction Specification for "{app_name}" (Iteration {iteration}) against the Business PRD.

## Business PRD (Requirements Source)
{prd_content}

## Interaction Specification to Evaluate
{interaction_spec}
{previous_feedback}
## Evaluation Task

You must systematically evaluate the interaction specification to determine if it's ready for wireframe implementation or needs refinement.

### Step 1: PRD Coverage Analysis
1. **List all features from the PRD** that need interaction definitions
2. **Check each feature** for corresponding interaction specifications
3. **Identify gaps** where PRD features lack interaction details
4. **Calculate coverage percentage** of features with complete interactions

### Step 2: Template Compliance
1. **Verify all required sections** are present:
   - Overview
   - Global Navigation  
   - Pages (with all screens defined)
   - User Flows (for every major feature)
   - State Management
   - Error Handling
   - Accessibility
   - Responsive Behavior
   - Validation Checklist
2. **Check section completeness** - no placeholder text or TODOs
3. **Ensure consistent formatting** throughout the document

### Step 3: Interaction Detail Quality
1. **Assess specificity** of interaction descriptions:
   - Exact button labels (not "submit button")
   - Specific error messages (not "show error")
   - Clear navigation paths (not "go to next page")
   - Defined validation rules (not "validate input")
2. **Check for ambiguity** in user actions and system responses
3. **Verify completeness** of form fields, states, and behaviors

### Step 4: User Flow Coverage
1. **Identify all critical user journeys** from the PRD
2. **Verify each flow** has step-by-step interactions defined
3. **Check edge cases** for each flow:
   - Error scenarios
   - Empty states
   - Loading states
   - Timeout handling
   - Offline behavior
4. **Ensure back navigation** and exit points are clear

### Step 5: Mobile and Accessibility
1. **Check mobile-specific behaviors** are defined:
   - Touch interactions
   - Gesture support
   - Responsive breakpoints
   - Mobile navigation patterns
2. **Verify accessibility requirements**:
   - Keyboard navigation paths
   - Screen reader descriptions
   - Focus management
   - Error announcements

### Step 6: Generate Evaluation
Create a comprehensive evaluation including:
- **PRD Coverage Score** (0-100): Percentage of features with complete interactions
- **Template Compliance Score** (0-100): Completeness of required sections
- **Detail Completeness Score** (0-100): Specificity and clarity of descriptions
- **User Flow Coverage**: List of covered and missing flows
- **Edge Case Handling**: Which cases are covered/missing
- **Overall Quality Score**: Weighted average of all scores

### Step 7: Make Decision
Based on your evaluation:
- **COMPLETE**: If overall quality score ≥ {compliance_threshold}% and no critical gaps
- **CONTINUE**: If significant issues need addressing

## Output Format

Provide your evaluation in this exact JSON format:

```json
{{
  "evaluation": {{
    "prd_coverage_score": 95,
    "missing_features": ["List of PRD features without interaction specs"],
    "template_compliance_score": 100,
    "missing_sections": ["List of missing required sections"],
    "detail_completeness_score": 90,
    "unclear_interactions": ["List of vague or ambiguous interactions"],
    "user_flow_coverage": {{
      "covered_flows": ["login", "registration", "main_feature"],
      "missing_flows": ["password_reset"],
      "coverage_percentage": 95
    }},
    "edge_case_coverage": {{
      "error_states": true,
      "loading_states": true,
      "empty_states": false,
      "offline_behavior": false,
      "missing_cases": ["offline mode handling", "empty search results"]
    }},
    "mobile_specification": {{
      "responsive_behaviors": true,
      "touch_interactions": false,
      "missing_mobile_specs": ["swipe gestures", "touch target sizes"]
    }},
    "overall_quality_score": 88
  }},
  "decision": "continue",
  "reasoning": "Detailed explanation of your decision based on the evaluation",
  "priority_fixes": [
    "Most critical issues that must be fixed (if decision is continue)"
  ]
}}
```

## Important Guidelines

1. **Be systematic** - Check every PRD feature for corresponding interactions
2. **Focus on implementation blockers** - Issues that would prevent wireframe creation
3. **Consider iteration {iteration}** - Expect progressive improvement
4. **Quality threshold is {compliance_threshold}%** - High bar for interaction specs
5. **Provide specific feedback** - Exact items to fix, not general comments

Remember: A thorough interaction specification here prevents major rework in wireframe and development stages. Your evaluation ensures the spec is truly implementation-ready."""