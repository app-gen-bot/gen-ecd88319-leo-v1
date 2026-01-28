"""Central registry of all MCP server configurations.

This module provides a centralized location for all MCP tool configurations,
making it easy for agents to request tools without knowing the implementation details.
"""

import os
from typing import Dict, List, Any, Optional


# Central registry of all available MCP tools
MCP_REGISTRY = {
    "oxc": {
        "type": "stdio",
        "command": "uv",
        "args": ["run", "python", "-m", "cc_tools.oxc.server"],
        "env_vars": [],
        "env_defaults": {},
        "description": "Ultra-fast TypeScript/JavaScript linting (50-100x faster than ESLint)",
        "tags": ["linting", "typescript", "javascript", "validation"]
    },
    
    "ruff": {
        "type": "stdio",
        "command": "uv", 
        "args": ["run", "python", "-m", "cc_tools.ruff.server"],
        "env_vars": [],
        "env_defaults": {},
        "description": "Ultra-fast Python linting (10-150x faster than Pylint/Flake8)",
        "tags": ["linting", "python", "validation"]
    },
    
    "build_test": {
        "type": "stdio",
        "command": "uv",
        "args": ["run", "python", "-m", "cc_tools.build_test.server"],
        "env_vars": [],
        "env_defaults": {},
        "description": "TypeScript compilation testing and validation",
        "tags": ["compilation", "typescript", "testing", "validation"]
    },
    
    # ARCHIVED: tree_sitter moved to archive/cc_tools/tree_sitter/ (depends on mem0)
    # "tree_sitter": {
    #     "type": "stdio",
    #     "command": "uv",
    #     "args": ["run", "mcp-tree-sitter"],
    #     "env_vars": [],
    #     "env_defaults": {},
    #     "description": "AST analysis for code understanding and parsing",
    #     "tags": ["ast", "parsing", "analysis", "code-understanding"]
    # },

    # ARCHIVED: context_manager moved to archive/cc_tools/context_manager/
    # "context_manager": {
    #     "type": "stdio",
    #     "command": "uv",
    #     "args": ["run", "mcp-context-manager"],
    #     "env_vars": ["CONTEXT_STORAGE_PATH"],
    #     "env_defaults": {
    #         "CONTEXT_STORAGE_PATH": "~/.cc_context_manager"
    #     },
    #     "description": "Session and context management for multi-turn conversations",
    #     "tags": ["context", "session", "memory", "management"]
    # },

    "integration_analyzer": {
        "type": "stdio",
        "command": "uv",
        "args": ["run", "mcp-integration-analyzer"],
        "env_vars": [],
        "env_defaults": {},
        "description": "Code integration analysis and template comparison",
        "tags": ["analysis", "integration", "templates", "comparison"]
    },
    
    # ARCHIVED: graphiti moved to archive/cc_tools/graphiti/
    # "graphiti": {
    #     "type": "stdio",
    #     "command": "uv",
    #     "args": ["run", "mcp-graphiti"],
    #     "env_vars": ["OPENAI_API_KEY", "FALKORDB_HOST", "FALKORDB_PORT", "FALKORDB_DATABASE"],
    #     "env_defaults": {
    #         "FALKORDB_HOST": "localhost",
    #         "FALKORDB_PORT": "6379",
    #         "FALKORDB_DATABASE": "default_db"
    #     },
    #     "description": "Knowledge graph for storing relationships and complex data structures",
    #     "tags": ["knowledge-graph", "memory", "relationships", "storage"]
    # },

    # ARCHIVED: mem0 moved to archive/cc_tools/mem0/
    # "mem0": {
    #     "type": "stdio",
    #     "command": "uv",
    #     "args": ["run", "mcp-mem0"],
    #     "env_vars": ["OPENAI_API_KEY", "QDRANT_URL", "QDRANT_COLLECTION", "NEO4J_URI", "NEO4J_USER", "NEO4J_PASSWORD"],
    #     "env_defaults": {
    #         "QDRANT_URL": "http://localhost:6333",
    #         "QDRANT_COLLECTION": "app_factory_memories",
    #         "NEO4J_URI": "bolt://localhost:7687",
    #         "NEO4J_USER": "neo4j",
    #         "NEO4J_PASSWORD": "cc-core-password"
    #     },
    #     "description": "Vector memory with graph features for semantic storage and retrieval",
    #     "tags": ["memory", "vector-search", "semantic", "storage"]
    # },

    "heroicons": {
        "type": "stdio",
        "command": "uv",
        "args": ["run", "python", "-m", "cc_tools.heroicons.server"],
        "env_vars": [],
        "env_defaults": {},
        "description": "Search and generate React Heroicons components for consistent UI",
        "tags": ["icons", "react", "ui", "components"]
    },
    
    "unsplash": {
        "type": "stdio",
        "command": "uv",
        "args": ["run", "python", "-m", "cc_tools.unsplash.server"],
        "env_vars": ["UNSPLASH_ACCESS_KEY", "UNSPLASH_SAVE_DIR"],
        "env_defaults": {
            "UNSPLASH_SAVE_DIR": "./stock_photos"
        },
        "description": "Access Unsplash stock photos for professional imagery in applications",
        "tags": ["images", "stock-photos", "unsplash", "media"]
    },
    
    "browser": {
        # DEPRECATED: Use "chrome_devtools" instead for advanced capabilities
        "type": "stdio",
        "command": "uv",
        "args": ["run", "python", "-m", "cc_tools.browser.server"],
        "env_vars": ["BROWSER_HEADLESS"],
        "env_defaults": {
            "BROWSER_HEADLESS": "false"
        },
        "description": "Browser automation for testing, validation, and web interactions",
        "tags": ["browser", "automation", "testing", "web"]
    },

    "chrome_devtools": {
        "type": "stdio",
        "command": "xvfb-run",
        "args": [
            "--auto-servernum",
            "--server-args=-screen 0 1920x1080x24",
            "chrome-devtools-mcp",
            "--executablePath", "/usr/bin/chromium",
            "--chromeArg=--no-sandbox",
            "--chromeArg=--disable-dev-shm-usage",
        ],
        "env_vars": [],
        "env_defaults": {},
        "description": "Chrome DevTools Protocol for advanced debugging, performance analysis, and browser automation (full browser via Xvfb)",
        "tags": ["browser", "devtools", "debugging", "performance", "network", "automation", "testing"],
        # Tool-specific constraints for preventing common errors
        "tool_constraints": {
            "take_screenshot": {
                "required_params": ["filePath"],
                "reason": "Without filePath, screenshot returns as base64 (>1MB) causing JSON buffer overflow. ALWAYS save to disk.",
                "example": 'mcp__chrome_devtools__take_screenshot(filePath="./screenshots/page.png", fullPage=True)'
            },
            "take_snapshot": {
                "avoid": True,
                "reason": "Returns massive DOM trees that exceed 1MB buffer limit on complex apps. Use take_screenshot with filePath instead."
            }
        }
    },

    # DEPRECATED: dev_server removed - hangs frequently and unreliable
    # "dev_server": {
    #     "type": "stdio",
    #     "command": "uv",
    #     "args": ["run", "python", "-m", "cc_tools.dev_server.server"],
    #     "env_vars": [],
    #     "env_defaults": {},
    #     "description": "Development server management for running and testing applications",
    #     "tags": ["dev-server", "development", "testing", "server"]
    # },
    
    "package_manager": {
        "type": "stdio",
        "command": "uv",
        "args": ["run", "python", "-m", "cc_tools.package_manager.server"],
        "env_vars": [],
        "env_defaults": {},
        "description": "Package management operations (npm, yarn, etc.) for project dependencies",
        "tags": ["packages", "npm", "yarn", "dependencies"]
    },
    
    # DEPRECATED: shadcn MCP removed
    # "shadcn": {
    #     "type": "stdio",
    #     "command": "uv",
    #     "args": ["run", "python", "-m", "cc_tools.shadcn.server"],
    #     "env_vars": [],
    #     "env_defaults": {},
    #     "description": "ShadCN UI component integration and management",
    #     "tags": ["ui", "components", "shadcn", "react"]
    # },
    
    "cwd_reporter": {
        "type": "stdio",
        "command": "uv",
        "args": ["run", "python", "-m", "cc_tools.cwd_reporter.server"],
        "env_vars": [],
        "env_defaults": {},
        "description": "Working directory reporting and file system navigation",
        "tags": ["filesystem", "navigation", "directory", "reporting"]
    },
    
    "dalle": {
        "type": "stdio",
        "command": "uv",
        "args": ["run", "python", "-m", "cc_tools.dalle.server"],
        "env_vars": ["OPENAI_API_KEY", "DALLE_SAVE_DIR"],
        "env_defaults": {
            "DALLE_SAVE_DIR": "./generated_images"
        },
        "description": "Generate custom images using OpenAI's DALL-E for professional visuals",
        "tags": ["images", "dalle", "generation", "ai"]
    },

    # DEPRECATED: Official Supabase MCP removed - conflicts with supabase_setup
    # "supabase": {
    #     "type": "stdio",
    #     "command": "npx",
    #     "args": ["-y", "@supabase/mcp-server-supabase@latest"],
    #     "env_vars": ["SUPABASE_ACCESS_TOKEN"],
    #     "env_defaults": {},
    #     "description": "Supabase database management, schema design, migrations, and debugging",
    #     "tags": ["database", "supabase", "postgres", "schema", "migrations", "debugging"]
    # },

    "supabase_setup": {
        "type": "stdio",
        "command": "uv",
        "args": ["run", "python", "-m", "cc_tools.supabase_setup.server"],
        "env_vars": [],
        "env_defaults": {},
        "description": "Autonomous Supabase project setup with complete credential generation (org detection, project creation, migrations, pooler detection)",
        "tags": ["infrastructure", "supabase", "database", "setup", "automation", "credentials"]
    }
}


def get_mcp_config(tool_names: List[str]) -> Dict[str, Dict[str, Any]]:
    """Build MCP server configuration from tool names.
    
    Args:
        tool_names: List of MCP tool names to configure
        
    Returns:
        Dictionary of MCP server configurations ready for Agent initialization
        
    Raises:
        KeyError: If any tool name is not found in the registry
        
    Example:
        >>> config = get_mcp_config(["oxc", "tree_sitter"])
        >>> agent = Agent(name="My Agent", ..., mcp_servers=config)
    """
    config = {}
    
    for name in tool_names:
        if name not in MCP_REGISTRY:
            available_tools = list(MCP_REGISTRY.keys())
            raise KeyError(
                f"MCP tool '{name}' not found in registry. "
                f"Available tools: {', '.join(sorted(available_tools))}"
            )
        
        tool_config = MCP_REGISTRY[name].copy()
        
        # Remove metadata fields - only keep config fields
        tool_config.pop("env_vars", None)
        tool_config.pop("env_defaults", None)
        tool_config.pop("description", None)
        tool_config.pop("tags", None)
        
        config[name] = tool_config
    
    return config


def get_mcp_config_with_env(tool_names: List[str]) -> Dict[str, Dict[str, Any]]:
    """Build MCP server configuration with environment variable handling.
    
    This function automatically adds environment variables and defaults
    for tools that require them.
    
    Args:
        tool_names: List of MCP tool names to configure
        
    Returns:
        Dictionary of MCP server configurations with env vars applied
        
    Example:
        >>> config = get_mcp_config_with_env(["graphiti", "unsplash"])
        >>> # Automatically includes FALKORDB_HOST, UNSPLASH_ACCESS_KEY, etc.
    """
    config = get_mcp_config(tool_names)
    
    # Add environment variables for each tool
    for name in tool_names:
        tool_info = MCP_REGISTRY[name]
        env_vars = tool_info.get("env_vars", [])
        env_defaults = tool_info.get("env_defaults", {})
        
        if env_vars or env_defaults:
            env_dict = {}
            
            # Add environment variables with fallbacks to defaults
            for var_name in env_vars:
                env_value = os.getenv(var_name)
                if env_value is not None:
                    env_dict[var_name] = env_value
                elif var_name in env_defaults:
                    env_dict[var_name] = env_defaults[var_name]
                # If no value and no default, omit the variable
            
            # Add any additional defaults not covered by env_vars
            for var_name, default_value in env_defaults.items():
                if var_name not in env_dict:
                    env_dict[var_name] = default_value
            
            if env_dict:
                config[name]["env"] = env_dict
    
    return config


def list_available_tools() -> Dict[str, str]:
    """Get all available MCP tools with descriptions.
    
    Returns:
        Dictionary mapping tool names to descriptions
    """
    return {
        name: info["description"] 
        for name, info in MCP_REGISTRY.items()
    }


def list_tools_by_tag(tag: str) -> List[str]:
    """Get tools that have a specific tag.
    
    Args:
        tag: Tag to search for (e.g., "linting", "typescript", "memory")
        
    Returns:
        List of tool names with the specified tag
    """
    return [
        name for name, info in MCP_REGISTRY.items()
        if tag in info.get("tags", [])
    ]


def get_tool_info(tool_name: str) -> Dict[str, Any]:
    """Get detailed information about a specific tool.
    
    Args:
        tool_name: Name of the tool to get info for
        
    Returns:
        Full tool configuration and metadata
        
    Raises:
        KeyError: If tool is not found
    """
    if tool_name not in MCP_REGISTRY:
        available_tools = list(MCP_REGISTRY.keys())
        raise KeyError(
            f"MCP tool '{tool_name}' not found. "
            f"Available tools: {', '.join(sorted(available_tools))}"
        )
    
    return MCP_REGISTRY[tool_name].copy()


def get_tool_constraints(tool_name: str, method_name: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Get constraints for a specific tool or method.

    Some MCP tools have methods with required parameters that must be enforced
    to prevent runtime errors (e.g., buffer overflow from large responses).

    Args:
        tool_name: Name of the MCP tool (e.g., "chrome_devtools")
        method_name: Optional specific method name (e.g., "take_screenshot")

    Returns:
        Dictionary of constraints, or None if no constraints exist

    Example:
        >>> constraints = get_tool_constraints("chrome_devtools", "take_screenshot")
        >>> # Returns: {"required_params": ["filePath"], "reason": "...", "example": "..."}
        >>>
        >>> all_constraints = get_tool_constraints("chrome_devtools")
        >>> # Returns all method constraints for the tool
    """
    if tool_name not in MCP_REGISTRY:
        return None

    tool_info = MCP_REGISTRY[tool_name]
    constraints = tool_info.get("tool_constraints", {})

    if not constraints:
        return None

    if method_name:
        return constraints.get(method_name)

    return constraints


def validate_tool_environment(tool_names: List[str]) -> Dict[str, List[str]]:
    """Check which environment variables are missing for the specified tools.
    
    Args:
        tool_names: List of tool names to validate
        
    Returns:
        Dictionary mapping tool names to lists of missing required env vars
        
    Example:
        >>> missing = validate_tool_environment(["graphiti", "mem0"])
        >>> if missing["graphiti"]:
        ...     print(f"Missing env vars for graphiti: {missing['graphiti']}")
    """
    missing_vars = {}
    
    for name in tool_names:
        if name not in MCP_REGISTRY:
            continue
            
        tool_info = MCP_REGISTRY[name]
        required_vars = tool_info.get("env_vars", [])
        missing = []
        
        for var_name in required_vars:
            # Check if env var exists or has a default
            if not os.getenv(var_name) and var_name not in tool_info.get("env_defaults", {}):
                missing.append(var_name)
        
        missing_vars[name] = missing
    
    return missing_vars