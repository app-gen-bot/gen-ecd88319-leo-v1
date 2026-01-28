"""Configuration for the Simplified Sprint Breakdown Agent."""

# Agent metadata
AGENT_NAME = "SimplifiedSprintBreakdownAgent"
AGENT_DESCRIPTION = "Creates a single comprehensive sprint breakdown document from PRD"

# Agent settings
MAX_TURNS = 10  # Should only need 1-2 turns
PERMISSION_MODE = "default"

# Tools configuration - Minimal tools to force focus on writing
ALLOWED_TOOLS = [
    "Read",      # To read the PRD if provided as a file path
    "Write",     # To create the sprint breakdown document
    "TodoWrite", # To track progress
]

# Output configuration
OUTPUT_FILENAME = "sprints_breakdown.md"

# Sprint settings
MIN_SPRINTS = 2
MAX_SPRINTS = 6
DEFAULT_SPRINTS = 3

# Sprint duration guidelines
SPRINT_DURATIONS = {
    1: "8-10 weeks",  # MVP needs more time
    2: "6-8 weeks",   # Enhancement sprint
    3: "6-8 weeks",   # Advanced features
    4: "4-6 weeks",   # Polish and optimization
    5: "4-6 weeks",   # Additional features
    6: "4-6 weeks",   # Final improvements
}

# Sprint focus areas
SPRINT_THEMES = {
    1: "MVP - Core Functionality",
    2: "Enhanced User Experience",
    3: "Advanced Features & Integrations",
    4: "Polish & Performance",
    5: "Extended Capabilities",
    6: "Final Optimizations",
}