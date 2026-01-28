"""Configuration for the Critic agent."""

AGENT_CONFIG = {
    "name": "Wireframe Critic",
    "allowed_tools": [
        # Core analysis tools
        "Read", 
        "Write",  # For writing evaluation reports
        "Grep",   # For searching patterns in code
        "Glob",   # For finding files by pattern
        "LS",     # For verifying file structure
        
        # Batch execution for parallel analysis
        "BatchTool",        # For parallel tool execution
        "Task",             # For defining batch tasks
        
        # Task management
        "TodoWrite",        # For tracking evaluation progress
        
        # Validation tools for testing implementation
        "build_test",       # For checking if code compiles
        "browser",          # For runtime testing
        "dev_server",       # For starting server during tests
        # Integration analyzer for understanding changes
        "integration_analyzer"
    ],
    "max_turns": 75,  # Fewer than Writer since evaluating, not creating
    "permission_mode": "bypassPermissions",
    "compliance_threshold": 90  # Minimum compliance score for completion
    # Note: The 'cwd' (current working directory) parameter is passed dynamically
    # at runtime based on the app-specific output directory.
}