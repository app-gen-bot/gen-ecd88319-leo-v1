"""User prompt generation for the Self-Improvement Agent."""

from datetime import datetime


def create_self_improvement_prompt(
    qc_report: str,
    output_dir: str,
    app_name: str,
    wireframe_system_prompt: str = None,
    wireframe_config: dict = None
) -> str:
    """Create the user prompt for the self-improvement agent.
    
    Args:
        qc_report: The QC report to analyze
        output_dir: Directory for saving improvements
        app_name: Name of the application
        wireframe_system_prompt: Current wireframe agent system prompt
        wireframe_config: Current wireframe agent configuration
        
    Returns:
        Formatted prompt for the self-improvement agent
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    prompt = f"""Analyze the QC report and generate improvement recommendations.

Application: {app_name}
Analysis Time: {timestamp}
Output Directory: {output_dir}

QC REPORT TO ANALYZE:
{qc_report}

TASK:
1. Analyze the QC report for patterns of success and failure
2. Identify root causes of any issues
3. Generate specific improvements for:
   - System prompt modifications
   - Configuration changes
   - Process enhancements
4. Save your recommendations to: {output_dir}/improvement_recommendations.json

FORMAT YOUR OUTPUT AS JSON:
{{
    "app_name": "{app_name}",
    "timestamp": "{timestamp}",
    "analysis": {{
        "key_issues": [...],
        "positive_patterns": [...],
        "root_causes": {{...}}
    }},
    "recommendations": {{
        "prompt_improvements": {{...}},
        "config_improvements": {{...}},
        "process_improvements": {{...}}
    }},
    "predicted_impact": {{
        "issues_addressed": [...],
        "improvement_confidence": "high|medium|low"
    }}
}}"""

    # Add current configuration if provided
    if wireframe_system_prompt:
        prompt += f"\n\nCURRENT WIREFRAME SYSTEM PROMPT:\n{wireframe_system_prompt[:500]}..."
    
    if wireframe_config:
        prompt += f"\n\nCURRENT WIREFRAME CONFIG:\n{wireframe_config}"
    
    return prompt