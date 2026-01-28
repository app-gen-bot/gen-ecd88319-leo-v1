"""Configuration for the Integration Analyzer agent."""

AGENT_CONFIG = {
    "name": "Integration Analyzer",
    "allowed_tools": [
        # Core analysis tools
        "Read", 
        "Write",  # For writing analysis reports
        "Grep",   # For searching patterns in code
        "Glob",   # For finding files by pattern
        # Integration analyzer for understanding changes
        "integration_analyzer"
    ],
    "max_turns": 50,  # Focused analysis task
    "permission_mode": "bypassPermissions"
    # Note: The 'cwd' (current working directory) parameter is passed dynamically
    # at runtime based on the app-specific output directory.
}