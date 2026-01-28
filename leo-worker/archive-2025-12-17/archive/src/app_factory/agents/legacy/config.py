"""Configuration for the Quality Control agent."""

AGENT_CONFIG = {
    "name": "Quality Control Agent",
    "allowed_tools": [
        # File system tools
        "Read", 
        "Write", 
        "MultiEdit",
        # Build and test tools (same as wireframe)
        "build_test", 
        "browser",
        # Integration analyzer tools for efficient review
        "integration_analyzer"
    ],
    "max_turns": 100,  # Less than wireframe since analyzing, not creating
    "permission_mode": "acceptEdits"
    # Note: The 'cwd' (current working directory) parameter is passed dynamically
    # at runtime based on the app-specific output directory.
}