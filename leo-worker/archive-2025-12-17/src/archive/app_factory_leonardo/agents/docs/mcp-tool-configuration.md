# MCP Tool Configuration in Claude Code SDK

## Overview

This document explains how to configure MCP (Model Context Protocol) tools with base directory paths to reduce path-related errors when agents work with specific project directories.

## Configuration Approaches

### 1. Using `cwd` Parameter (Recommended)

The simplest and most straightforward approach is to use the `cwd` (current working directory) parameter in `ClaudeCodeOptions`:

```python
from claude_code_sdk import ClaudeCodeOptions


options = ClaudeCodeOptions(
    allowed_tools=["Read", "Write", "MultiEdit", "build_test", "browser"],
    system_prompt="Your agent prompt here",
    cwd="/home/jake/SPRINT8/app-factory/apps/slack-clone/frontend",  # Base directory
    permission_mode="acceptEdits"
)
```

**Benefits:**
- Simple to implement
- All file operations and tool calls are relative to this directory
- No need for complex MCP server configuration
- Works seamlessly with both built-in tools and MCP tools

**How it works:**
- The SDK sets the working directory for the agent session
- All relative paths in tool calls are resolved from this directory
- The agent can use shorter, relative paths like `src/App.tsx` instead of full paths
- Reduces path errors and makes prompts cleaner

### 2. Using MCP Server Configuration (Alternative)

For more complex scenarios, you can configure MCP servers with workspace paths:

```python
options = ClaudeCodeOptions(
    mcp_servers={
        "build_test": {
            "command": "uv",
            "args": [
                "--directory", 
                os.getenv("MCP_TOOLS_PATH"),
                "run", 
                "mcp-build-test",
                "--workspace",
                "/path/to/frontend"  # Workspace path for the MCP tool
            ]
        }
    }
)
```

**When to use:**
- When different MCP tools need different workspace paths
- When you need fine-grained control over individual tool configurations
- When using containerized MCP servers

### 3. Environment-Based Configuration

For deployment flexibility, combine environment variables with configuration:

```python
import os
from pathlib import Path

# Read base paths from environment
APP_BASE_PATH = os.getenv("APP_BASE_PATH", "/home/jake/SPRINT8/app-factory/apps")
app_name = "slack-clone"
frontend_path = Path(APP_BASE_PATH) / app_name / "frontend"

options = ClaudeCodeOptions(
    cwd=str(frontend_path),
    # ... other options
)
```

## Implementation in Stage 2 Wireframe Agent

The wireframe agent uses the `cwd` approach for simplicity:

```python
# In the agent creation function
async def create_wireframe_agent(output_dir: str, ...):
    options = ClaudeCodeOptions(
        allowed_tools=["Read", "Write", "MultiEdit", "build_test", "browser"],
        system_prompt=SYSTEM_PROMPT,
        cwd=output_dir,  # Set base directory to the frontend output directory
        permission_mode="acceptEdits",
        max_turns=15
    )
    
    # Now the agent can use relative paths
    # Instead of: /home/jake/SPRINT8/app-factory/apps/slack-clone/frontend/src/App.tsx
    # The agent uses: src/App.tsx
```

## Benefits for Wireframe Generation

1. **Reduced Errors**: Shorter paths mean fewer typos and path resolution errors
2. **Cleaner Prompts**: The agent's prompts are more readable without long absolute paths
3. **Portability**: The same agent code works regardless of where the app-factory is installed
4. **Focus**: The agent naturally stays within its assigned directory scope

## Best Practices

1. **Always use absolute paths for `cwd`**: Ensure the base directory is an absolute path
2. **Validate directory exists**: Check the directory exists before setting it as `cwd`
3. **Document the working directory**: Include the working directory in the agent's prompt for clarity
4. **Use Path objects**: Use `pathlib.Path` for path manipulation to ensure cross-platform compatibility

## Example: Complete Configuration

```python
from pathlib import Path
from claude_code_sdk import ClaudeCodeOptions, query

async def run_wireframe_agent(app_name: str, specs: dict):
    # Derive output directory by convention
    project_root = Path(__file__).parent.parent.parent.parent
    output_dir = project_root / "apps" / app_name / "frontend"
    
    # Ensure directory exists
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Configure agent with base directory
    options = ClaudeCodeOptions(
        allowed_tools=["Read", "Write", "MultiEdit", "build_test", "browser"],
        system_prompt="You are a Next.js expert...",
        cwd=str(output_dir),  # Set working directory
        permission_mode="acceptEdits",
        max_turns=15
    )
    
    # Create prompt that references the working directory
    prompt = f"""
    Working directory: {output_dir}
    
    Create a Next.js application based on these specifications:
    {specs}
    
    Note: All file operations should use paths relative to the working directory.
    For example, use 'src/App.tsx' not '{output_dir}/src/App.tsx'.
    """
    
    # Run the agent
    async for message in query(prompt=prompt, options=options):
        # Process messages
        pass
```

## Troubleshooting

1. **Path not found errors**: Verify the `cwd` directory exists and is accessible
2. **MCP tool failures**: Check if the MCP tool respects the working directory (some tools may need additional configuration)
3. **Permission errors**: Ensure the agent has write permissions in the specified directory

## Future Considerations

- Consider implementing a `WorkspaceManager` class to handle complex multi-directory scenarios
- Add validation for MCP tool compatibility with `cwd` parameter
- Consider adding a `relative_paths_only` option to enforce relative path usage