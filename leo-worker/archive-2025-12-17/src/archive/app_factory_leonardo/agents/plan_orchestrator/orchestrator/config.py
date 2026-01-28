"""Configuration for the Plan Orchestrator Agent."""

# Agent metadata
ORCHESTRATOR_NAME = "PlanOrchestrator"
ORCHESTRATOR_DESCRIPTION = "Generates simple application plans following Replit's approach"

# Agent settings
ORCHESTRATOR_MAX_TURNS = 3  # Keep conversations brief
ORCHESTRATOR_PERMISSION_MODE = "default"  # Default mode to allow automatic operation

# Research configuration
ENABLE_RESEARCH = False  # Set to True for complex apps that need research

# Tools configuration - Keep minimal for simple plan generation
ORCHESTRATOR_ALLOWED_TOOLS = [
    # No tools needed for simple plan generation
    # When ENABLE_RESEARCH is True, add:
    # "WebSearch", "WebFetch", "Read", "Glob"
]

# Plan generation settings
PLAN_FILENAME = "plan.md"
PLAN_MIN_SECTIONS = 3  # Understanding, Initial Version, Feature List
PLAN_MAX_LENGTH = 2000  # Maximum characters for Plan (much shorter than PRD)

# Conversation settings
MAX_QUESTIONS_PER_TURN = 2  # Maximum questions to ask in one turn
MIN_CONVERSATION_TURNS = 1  # Minimum turns before generating Plan
REQUIRE_CONFIRMATION = False  # Whether to require user confirmation before finalizing

# Template settings
USE_STRICT_TEMPLATE = False  # Allow flexible plan structure
TEMPLATE_VERSION = "1.0"

# Memory settings (for context awareness)
MEMORY_NAMESPACE = "orchestrator_plans"
MEMORY_TAGS = ["plan", "features", "app_ideas"]

# Common app types for pattern matching
COMMON_APP_TYPES = [
    "slack-clone",
    "project-management",
    "e-commerce",
    "social-media",
    "crm",
    "inventory-management",
    "booking-system",
    "learning-platform",
    "marketplace",
    "dashboard",
    "chat-application",
    "task-tracker",
    "note-taking",
    "file-sharing",
    "calendar-app"
]

# Default assumptions by app type
DEFAULT_FEATURES = {
    "authentication": ["login", "signup", "logout", "password-reset", "session-management"],
    "user-management": ["profile", "settings", "preferences", "avatar"],
    "admin": ["dashboard", "user-management", "analytics", "system-settings"],
    "search": ["global-search", "filters", "sorting", "pagination"],
    "notifications": ["in-app", "email", "push", "notification-center"],
    "api": ["rest-api", "rate-limiting", "authentication", "documentation"],
    "security": ["https", "encryption", "csrf-protection", "input-validation"],
}