"""User prompt creation for the Retrospective agent."""


def create_retrospective_prompt(
    app_name: str,
    stage_name: str,
    log_content: str,
    qc_report: str = "",
    generated_files_list: str = "",
    execution_metrics: dict = None
) -> str:
    """Create the prompt for the retrospective agent.
    
    Args:
        app_name: Name of the application analyzed
        stage_name: Name of the stage executed (e.g., "Stage 2: Wireframe")
        log_content: Execution logs to analyze
        qc_report: Optional QC report if available
        generated_files_list: List of files created/modified
        execution_metrics: Dict with timing, cost, etc.
        
    Returns:
        Formatted prompt for the retrospective agent
    """
    metrics_section = ""
    if execution_metrics:
        metrics_section = f"""
## Execution Metrics
- Start Time: {execution_metrics.get('start_time', 'Unknown')}
- End Time: {execution_metrics.get('end_time', 'Unknown')}
- Duration: {execution_metrics.get('duration', 'Unknown')}
- Total Cost: ${execution_metrics.get('cost', 0):.4f}
- Agent Turns: {execution_metrics.get('turns', 'Unknown')}
"""

    qc_section = ""
    if qc_report:
        if qc_report.endswith(".md"):
            # It's a file path
            qc_section = f"""
## Quality Control Report
Read the full QC analysis from: {qc_report}
"""
        else:
            # It's inline content or empty
            qc_section = f"""
## Quality Control Report
{qc_report if qc_report else "No QC report available"}
"""

    files_section = ""
    if generated_files_list:
        if "integration_analyzer" in generated_files_list:
            # Instruction to use tool
            files_section = f"""
## Generated Files
{generated_files_list}
"""
        else:
            # It's a list
            files_section = f"""
## Generated Files
{generated_files_list}
"""

    return f"""Analyze the execution of {stage_name} for the "{app_name}" application and generate a comprehensive retrospective report.

## Execution Logs
{log_content}
<!-- TODO: In future, pass actual execution logs for deep behavioral analysis -->
{metrics_section}{qc_section}{files_section}
## Analysis Requirements

1. **Gather Information**
   - Read the QC report file if provided
   - Read the integration analysis report from apps/{app_name}/specs/integration-analysis.md
   - Use integration_analyzer tool to discover modified/added files if needed

2. **Log Analysis**
   - Identify all tool usage attempts (successful and failed)
   - Track the execution flow and decision points
   - Note any errors, warnings, or unusual patterns
   - Measure time spent on different phases

3. **Quality Assessment**
   - Compare implementation against specifications
   - Identify missing features and their root causes
   - Evaluate code quality and patterns used
   - Assess compliance with design principles

4. **Tool Usage Analysis**
   - Which tools were attempted vs available
   - Tool usage efficiency and appropriateness
   - Missed opportunities for tool usage
   - Fallback strategies when tools failed

5. **Process Evaluation**
   - Did the agent follow the prescribed workflow?
   - Were validation phases executed?
   - How well did the agent adapt to challenges?
   - Was the output deterministic and consistent?

6. **Improvement Opportunities**
   - Specific prompt improvements needed
   - Tool configuration issues to address
   - Process changes to implement
   - Logging enhancements required

Generate a retrospective report following the structure defined in your system prompt. Focus on actionable insights that will improve future executions.

Important: Base all findings on evidence from the logs and outputs provided. When suggesting improvements, be specific about what to change and why."""