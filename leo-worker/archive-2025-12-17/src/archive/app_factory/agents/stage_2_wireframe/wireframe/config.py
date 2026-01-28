"""Configuration for the Wireframe Generator agent."""

AGENT_CONFIG = {
    "name": "Wireframe Generator",
    "allowed_tools": [
        # Core development tools (built-in cc-agent)
        "Read", 
        "Write", 
        "MultiEdit",
        
        # Batch execution for parallel operations
        "BatchTool",        # For parallel tool execution
        "Task",             # For defining batch tasks
        
        # Search and analysis tools
        "Grep",             # For pattern searching during development
        "Glob",             # For file pattern matching
        "LS",               # For directory listing
        
        # Task management
        "TodoWrite",        # For tracking implementation progress
        
        # External resources
        "WebFetch",         # For retrieving documentation/examples
        "WebSearch",        # For searching best practices and solutions
        
        # Specialized MCP tools for deterministic behavior
        "shadcn",           # For ShadCN UI component installation
        "package_manager",  # For npm package management
        "build_test",       # For build verification and error detection
        "dev_server",       # For starting/stopping development server
        "browser",          # For browser testing and runtime validation
    ],
    "max_turns": 500,  # Increased significantly to ensure no artificial limits
    "permission_mode": "bypassPermissions"
    # Note: The 'cwd' (current working directory) parameter is passed dynamically
    # at runtime by stage_2_wireframe.py based on the app-specific output directory.
    # This allows the agent to use relative paths like 'src/App.tsx' instead of
    # absolute paths, reducing errors and improving portability.
}