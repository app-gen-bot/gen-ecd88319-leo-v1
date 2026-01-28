"""Configuration for Main Page Generator Agent."""

AGENT_CONFIG = {
    "name": "Main Page Generator",
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
    "max_turns": 10,  # Increased for validation cycles
    "permission_mode": "default"
}