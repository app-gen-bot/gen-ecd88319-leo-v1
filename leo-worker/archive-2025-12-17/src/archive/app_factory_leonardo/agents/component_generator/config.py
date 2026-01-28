"""Configuration for Component Generator Agent."""

AGENT_CONFIG = {
    "name": "Component Generator",
    "model": "opus",  # Use most capable model for code generation
    "allowed_tools": [
        # Core development tools
        "Write",
        "Read", 
        
        # MCP tools are auto-added by base Agent class:
        # - mcp__oxc (Ultra-fast TypeScript linting)
        # - mcp__build_test (TypeScript compilation verification) 
        # - mcp__tree_sitter (AST analysis of generated TypeScript)
        
        # Pattern searching for validation
        "Grep",
    ],
    "max_turns": 12,  # Increased for multiple component generation
    "permission_mode": "default"
}