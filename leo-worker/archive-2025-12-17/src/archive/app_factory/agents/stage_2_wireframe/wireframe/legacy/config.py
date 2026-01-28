"""Configuration for the Wireframe Generator agent."""

AGENT_CONFIG = {
    "name": "Wireframe Generator",
    "allowed_tools": ["Read", "Write", "MultiEdit", "build_test", "browser"],
    "max_turns": 100,  # Increased to allow for verification steps
    "permission_mode": "acceptEdits"
    # Note: The 'cwd' (current working directory) parameter is passed dynamically
    # at runtime by stage_2_wireframe.py based on the app-specific output directory.
    # This allows the agent to use relative paths like 'src/App.tsx' instead of
    # absolute paths, reducing errors and improving portability.
}