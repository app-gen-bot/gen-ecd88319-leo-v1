"""Configuration for the Retrospective agent."""

AGENT_CONFIG = {
    "name": "Retrospective Analyst",
    "allowed_tools": [
        # Core analysis tools
        "Read",
        "Write",
        "Grep",
        "WebSearch",  # For researching best practices
        "integration_analyzer",  # To discover modified files
    ],
    "max_turns": 500,
    "permission_mode": "bypassPermissions"
}