"""User prompt generation for the Quality Control agent."""

from datetime import datetime


def create_qc_prompt(
    interaction_spec: str,
    output_dir: str,
    app_name: str
) -> str:
    """Create the user prompt for the QC agent.
    
    Args:
        interaction_spec: The interaction specification to validate against
        output_dir: Directory containing the generated wireframe
        app_name: Name of the application being validated
        
    Returns:
        Formatted prompt for the QC agent
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    return f"""Validate the wireframe implementation against the interaction specification.

Application: {app_name}
Implementation Directory: {output_dir}
Validation Time: {timestamp}

IMPORTANT FIRST STEP:
1. Use integration_analyzer to analyze the project at "{output_dir}"
2. This will identify which files were added/modified vs the template
3. Focus your review ONLY on these changed files

INTERACTION SPECIFICATION TO VALIDATE AGAINST:
{interaction_spec}

VALIDATION TASKS:
1. Run the integration analyzer to identify changed files
2. Extract all features from the interaction specification above
3. For each feature, verify it exists in the implementation
4. Check for any extra features not in the specification
5. Run build_test to ensure the implementation compiles
6. Use browser tool to check for runtime errors
7. Generate a comprehensive QC report

QC REPORT TEMPLATE:
```markdown
# QC Report: {app_name}
Generated: {timestamp}

## Executive Summary
- Compliance Score: [X]%
- Missing Features: [count]
- Extra Features: [count]
- Build Status: [Pass/Fail]
- Runtime Status: [Pass/Fail]

## Scope Analysis
- Total Project Files: [count]
- Added Files: [count]
- Modified Files: [count]
- Files Reviewed: [count] ([X]% scope reduction)

## Compliance Details

### ✅ Correctly Implemented ([count] features)
[List each correctly implemented feature with file location]

### ❌ Missing Features ([count])
[For each missing feature:
- Feature name and description
- Expected location
- Severity: High/Medium/Low
- Root Cause: [Spec ambiguity/Implementation oversight/etc]]

### ➕ Extra Features ([count])
[For each extra feature:
- Feature description and location
- Impact: Positive/Neutral/Negative
- Recommendation: Keep/Remove]

### 🔧 Technical Pattern Compliance
[Review key patterns: auth, state management, error handling, etc]

## Root Cause Analysis
[Categorize issues by: Specification Issues, Implementation Issues, Enhancement Opportunities]

## Recommendations
[Provide 3-5 specific, actionable recommendations]
```

Save the QC report to: ../specs/qc-report.md (relative to the frontend directory)

Remember:
- Be objective and fact-based
- Focus on spec compliance, not subjective quality
- Provide specific file locations for all findings
- Balance criticism with recognition of good implementations"""