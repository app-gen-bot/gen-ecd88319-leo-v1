"""Utility functions for agent message processing."""

from claude_agent_sdk import AssistantMessage, TextBlock, ToolUseBlock


def _extract_text(message: AssistantMessage) -> str:
    """Extract all text content from an assistant message."""
    text_parts = []
    for block in message.content:
        if isinstance(block, TextBlock):
            text_parts.append(block.text)
    return "\n".join(text_parts).strip()


def _extract_tool_uses(message: AssistantMessage) -> list[dict]:
    """Extract tool usage information from an assistant message."""
    tool_uses = []
    for block in message.content:
        if isinstance(block, ToolUseBlock):
            tool_uses.append({
                "name": block.name,
                "input": block.input,
                "id": block.id
            })
    return tool_uses


def get_all_available_tools() -> list[str]:
    """Get a list of all available tools in the Claude Code system.
    
    Returns:
        List of tool names that can be used with allowed_tools/disallowed_tools
    """
    # Core tools available to all agents
    core_tools = [
        "Task",
        "Bash", 
        "Glob",
        "Grep",
        "LS",
        "exit_plan_mode",
        "Read",
        "Edit",
        "MultiEdit",
        "Write",
        "NotebookRead",
        "NotebookEdit",
        "WebFetch",
        "TodoRead",
        "TodoWrite",
        "WebSearch"
    ]
    
    # MCP tools - these are discovered dynamically but we list common ones
    # Note: In practice, you might want to discover these from the actual MCP configuration
    mcp_tools = [
        "browser",  # Includes all mcp__browser__* tools
        "build_test",  # Includes mcp__build_test__* tools
        "dev_server",  # Includes mcp__dev_server__* tools
        "package_manager",  # Includes mcp__package_manager__* tools
        "shadcn",  # Includes mcp__shadcn__* tools
        "integration_analyzer",  # Includes mcp__integration_analyzer__* tools
        "cwd_reporter"  # Includes mcp__cwd_reporter__* tools
    ]
    
    # Additional MCP resource tools
    mcp_resource_tools = [
        "ListMcpResourcesTool",
        "ReadMcpResourceTool"
    ]
    
    return core_tools + mcp_tools + mcp_resource_tools


def get_disallowed_tools(allowed_tools: list[str]) -> list[str]:
    """Generate a list of disallowed tools based on allowed tools.
    
    This function returns all available tools except those specified in allowed_tools,
    effectively creating a whitelist restriction.
    
    Args:
        allowed_tools: List of tools that should be allowed
        
    Returns:
        List of all other tools that should be disallowed
    """
    all_tools = get_all_available_tools()
    
    # Create a set for efficient lookup
    allowed_set = set(allowed_tools)
    
    # Return all tools not in the allowed set
    return [tool for tool in all_tools if tool not in allowed_set]