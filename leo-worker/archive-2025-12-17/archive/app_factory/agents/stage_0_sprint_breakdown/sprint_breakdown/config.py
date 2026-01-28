"""Configuration for the Sprint Breakdown Agent."""

# Agent metadata
AGENT_NAME = "SprintBreakdownAgent"
AGENT_DESCRIPTION = "Breaks comprehensive PRDs into sprint-based deliverables with MVP focus"

# Agent settings
MAX_TURNS = 100  # Plenty of turns to complete all sprint files
PERMISSION_MODE = "default"

# Tools configuration
ALLOWED_TOOLS = [
    # File operations for reading PRD and writing sprint PRDs
    "Read",
    "Write",
    
    # Research tools for MVP best practices and sprint planning
    "WebSearch",
    "WebFetch",
    
    # Task management for tracking sprint breakdown progress
    "TodoWrite",
    "TodoRead",
    
    # Context awareness tools for learning from past breakdowns
    "mcp__context_manager",
    "mcp__graphiti",
]

# Sprint breakdown settings
MIN_SPRINTS = 1  # Minimum number of sprints
MAX_SPRINTS = 6  # Maximum number of sprints (increased for complex projects)
DEFAULT_SPRINTS = 3  # Default if not specified
INITIAL_SPRINTS = 3  # Always create at least 3 sprints before asking for more

# Feature prioritization weights
PRIORITY_WEIGHTS = {
    "user_value": 0.4,      # How much value it delivers to users
    "technical_dependency": 0.3,  # Technical prerequisites
    "business_impact": 0.2,  # Business/revenue impact
    "complexity": 0.1,      # Implementation complexity (lower is better for MVP)
}

# MVP criteria
MVP_REQUIREMENTS = [
    "Core user journey must be complete",
    "Primary pain point must be solved",
    "Must be usable by real users",
    "Minimal but functional implementation",
    "No nice-to-have features",
]

# Output file patterns
OUTPUT_PATTERNS = {
    "sprint_prd": "prd_sprint_{n}.md",
    "overview": "sprint_overview.md",
    "roadmap": "sprint_roadmap.md",
}

# Feature categorization keywords
CORE_FEATURE_KEYWORDS = [
    "must have", "critical", "essential", "core", "primary",
    "main", "key", "fundamental", "basic", "required"
]

ANCILLARY_FEATURE_KEYWORDS = [
    "nice to have", "optional", "future", "enhancement",
    "admin", "settings", "analytics", "reporting", "dashboard",
    "configuration", "customization", "advanced", "premium"
]