"""Configuration for the Interaction Specification Agent."""

# Agent metadata
INTERACTION_SPEC_NAME = "InteractionSpecGenerator"
INTERACTION_SPEC_DESCRIPTION = "Transforms Business PRDs into detailed Frontend Interaction Specifications"

# Agent settings
INTERACTION_SPEC_MAX_TURNS = 5  # Should complete in fewer turns
INTERACTION_SPEC_PERMISSION_MODE = "default"  # Default mode for automatic operation

# Tools configuration
INTERACTION_SPEC_ALLOWED_TOOLS = [
    # File operations for reading PRDs and writing specs
    "Read",
    "Write",
    "Glob",
    
    # Context awareness tools (inherited from ContextAwareAgent)
    # These are automatically included: mem0, graphiti, context_manager, tree_sitter, integration_analyzer
    
    # Web tools for UI/UX pattern research if needed
    "WebSearch",
    "WebFetch",
    
    # Task management for planning complex specs
    "TodoWrite",
    "TodoRead",
]

# Specification generation settings
SPEC_FILENAME = "frontend-interaction-spec.md"
SPEC_MIN_SECTIONS = 10  # Minimum major sections required
SPEC_MAX_LENGTH = 20000  # Maximum characters for spec

# Template enforcement
USE_STRICT_TEMPLATE = True  # Enforce template structure
TEMPLATE_VERSION = "1.0"
REQUIRE_ALL_FLOWS = True  # Every PRD feature must have a user flow

# Memory settings (for context awareness)
MEMORY_NAMESPACE = "interaction_specs"
MEMORY_TAGS = ["interaction", "ui", "ux", "flows", "frontend"]

# Key sections that must be present
REQUIRED_SECTIONS = [
    "Overview",
    "Global Navigation",
    "Pages",
    "User Flows",
    "State Management",
    "Error Handling",
    "Accessibility",
    "Responsive Behavior",
    "Validation Checklist"
]

# Common UI patterns to consider
COMMON_PATTERNS = {
    "authentication": ["login", "signup", "logout", "password-reset", "two-factor"],
    "navigation": ["header", "sidebar", "breadcrumbs", "tabs", "menu"],
    "forms": ["validation", "error-messages", "success-feedback", "auto-save"],
    "lists": ["pagination", "filtering", "sorting", "search", "bulk-actions"],
    "modals": ["confirmation", "forms", "alerts", "full-screen", "nested"],
    "states": ["loading", "empty", "error", "success", "offline"],
    "interactions": ["hover", "click", "drag-drop", "keyboard", "touch"]
}

# Validation criteria
VALIDATION_RULES = {
    "completeness": "All PRD features must have corresponding interactions",
    "navigation": "Every page must be reachable from navigation",
    "error_handling": "All user actions must have error states defined",
    "accessibility": "Keyboard navigation must be specified",
    "responsive": "Mobile behavior must be defined for all features"
}