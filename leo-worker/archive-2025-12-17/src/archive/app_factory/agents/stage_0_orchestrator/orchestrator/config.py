"""Configuration for the Orchestrator Agent."""

# Agent metadata
ORCHESTRATOR_NAME = "Orchestrator"
ORCHESTRATOR_DESCRIPTION = "Generates comprehensive Business PRDs through conversation"

# Agent settings
ORCHESTRATOR_MAX_TURNS = 10  # Allow for conversation, but not too long
ORCHESTRATOR_PERMISSION_MODE = "default"  # Default mode to allow automatic operation

# Tools configuration
ORCHESTRATOR_ALLOWED_TOOLS = [
    # File operations for reading examples and saving PRDs
    "Read",
    "Write",
    "Glob",
    
    # Context awareness tools (inherited from ContextAwareAgent)
    # These are automatically included: mem0, graphiti, context_manager, tree_sitter, integration_analyzer
    
    # Web tools for research if needed
    "WebSearch",
    "WebFetch",
    
    # Task management
    "TodoWrite",
    "TodoRead",
]

# PRD generation settings
PRD_FILENAME = "business_prd.md"
PRD_MIN_SECTIONS = 8  # Minimum number of major sections required
PRD_MAX_LENGTH = 10000  # Maximum characters for PRD

# Conversation settings
MAX_QUESTIONS_PER_TURN = 3  # Maximum questions to ask in one turn
MIN_CONVERSATION_TURNS = 2  # Minimum turns before generating PRD
REQUIRE_CONFIRMATION = False  # Whether to require user confirmation before finalizing

# Template settings
USE_STRICT_TEMPLATE = True  # Enforce template structure
TEMPLATE_VERSION = "1.0"

# Memory settings (for context awareness)
MEMORY_NAMESPACE = "orchestrator_prds"
MEMORY_TAGS = ["prd", "requirements", "app_ideas"]

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