"""Configuration for the Interaction Specification Critic Agent."""

AGENT_CONFIG = {
    "name": "InteractionSpecCritic",
    "description": "Evaluates interaction specifications for completeness and quality",
    "max_turns": 10,
    "permission_mode": "default",
    "compliance_threshold": 90,  # Higher threshold than wireframe (85%)
    
    "allowed_tools": [
        # Document analysis tools
        "Read",        # Read and analyze the interaction spec
        "Grep",        # Search for specific patterns
        "Glob",        # Find related files
        
        # Context awareness tools (inherited from ContextAwareAgent)
        # These are automatically included: mcp__mem0, mcp__graphiti, 
        # mcp__context_manager, mcp__tree_sitter, mcp__integration_analyzer
        
        # Task management
        "TodoWrite",   # Track evaluation tasks
        "TodoRead",    # Review evaluation progress
        
        # Report generation
        "Write",       # Create evaluation reports
        
        # Web search for best practices (if needed)
        "WebSearch",   # Research interaction patterns
    ]
}

# Evaluation weights for scoring
EVALUATION_WEIGHTS = {
    "prd_coverage": 0.30,          # 30% - Most critical
    "template_compliance": 0.20,    # 20% - Structure matters
    "detail_completeness": 0.20,    # 20% - Implementation clarity
    "user_flow_coverage": 0.15,     # 15% - All paths defined
    "edge_case_handling": 0.10,     # 10% - Error/edge cases
    "mobile_responsiveness": 0.05   # 5%  - Mobile considerations
}

# Required sections that must be present
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

# Critical user flows that must be defined
CRITICAL_FLOWS = [
    "user_registration",
    "user_login", 
    "main_feature_flow",
    "error_recovery",
    "data_submission"
]

# Edge cases that should be covered
REQUIRED_EDGE_CASES = [
    "network_errors",
    "validation_errors",
    "empty_states",
    "loading_states", 
    "permission_errors",
    "session_timeout",
    "data_conflicts"
]