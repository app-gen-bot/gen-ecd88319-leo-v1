"""Configuration for the Self-Improvement Agent."""

AGENT_CONFIG = {
    "name": "Self-Improvement Agent",
    "allowed_tools": [
        # File system tools
        "Read", 
        "Write", 
        "MultiEdit",
        # Analysis tools
        "Grep",
        "Glob"
    ],
    "max_turns": 50,  # Less than others since mainly analyzing
    "permission_mode": "acceptEdits"
}