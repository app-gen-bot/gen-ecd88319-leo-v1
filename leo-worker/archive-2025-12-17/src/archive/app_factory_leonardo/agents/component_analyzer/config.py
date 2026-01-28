"""Configuration for Component Analyzer Agent."""

AGENT_CONFIG = {
    "name": "Component Analyzer",
    "allowed_tools": [
        # Core development tools
        "Write",
        "Read", 
        
        # MCP tools are auto-added by base Agent class:
        # - mcp__tree_sitter (AST analysis of React components)
        
        # Pattern searching for analysis
        "Grep",
    ],
    "max_turns": 8,  # Analysis focused, fewer turns needed
    "permission_mode": "default"
}