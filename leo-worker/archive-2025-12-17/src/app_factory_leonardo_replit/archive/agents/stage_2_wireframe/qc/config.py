"""Configuration for the Quality Control agent."""

AGENT_CONFIG = {
    "name": "Quality Control Agent",
    "allowed_tools": [
        # File system tools
        "Read", 
        "Write", 
        "MultiEdit",
        
        # Search and analysis tools
        "Grep",             # For compliance pattern searching
        "Glob",             # For finding test files
        
        # Batch execution for parallel validation
        "BatchTool",        # For parallel tool execution
        "Task",             # For defining batch tasks
        
        # Task management
        "TodoWrite",        # For tracking QC checklist
        
        # Build and test tools (same as wireframe)
        "build_test", 
        "browser",
        "dev_server",       # For runtime validation
        # Integration analyzer tools for efficient review
        "integration_analyzer"
    ],
    "max_turns": 100,  # Less than wireframe since analyzing, not creating
    "permission_mode": "bypassPermissions"
    # Note: The 'cwd' (current working directory) parameter is passed dynamically
    # at runtime based on the app-specific output directory.
}