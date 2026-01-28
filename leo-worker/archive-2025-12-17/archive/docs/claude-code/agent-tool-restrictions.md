# Agent Tool Restrictions in Claude Code

## Overview

When using the Claude Code SDK to create agents, it's important to understand how tool permissions actually work. There's a common misconception about `allowed_tools` that can lead to security issues.

## The Misconception

Many developers assume that setting `allowed_tools: ["browser"]` restricts an agent to ONLY use the browser tool. **This is incorrect.**

## How It Actually Works

### allowed_tools
- **Purpose**: Pre-approves tools to avoid permission prompts
- **Behavior**: Grants automatic permission for specified tools
- **Does NOT**: Restrict access to only those tools

### disallowed_tools
- **Purpose**: Explicitly blocks access to tools
- **Behavior**: Prevents agent from using specified tools
- **This is**: What actually creates restrictions

### Default Behavior
By default, agents have access to ALL available tools unless:
1. A tool requires permission (then user is prompted)
2. A tool is explicitly blocked via `disallowed_tools`

## Available Tools

Agents can access approximately 30+ tools, including:

### Core Tools
- `Task` - Launch sub-agents
- `Bash` - Execute shell commands
- `Glob` - File pattern matching
- `Grep` - Search file contents
- `LS` - List directories
- `Read` - Read files
- `Edit` - Edit files
- `MultiEdit` - Multiple edits
- `Write` - Write files
- `WebFetch` - Fetch web content
- `WebSearch` - Search the web
- `TodoRead` - Read todo list
- `TodoWrite` - Write todo list
- And more...

### MCP Tools
- `mcp__browser__*` - Browser automation
- `mcp__build_test__*` - Build and test
- `mcp__dev_server__*` - Dev server management
- `mcp__package_manager__*` - Package management
- `mcp__shadcn__*` - UI components
- `mcp__integration_analyzer__*` - Template analysis
- And more...

## Creating Restricted Agents

### Wrong Way (Doesn't Work)
```python
# This does NOT restrict the agent to only browser tools!
options = ClaudeCodeOptions(
    allowed_tools=["browser"],
    permission_mode="bypassPermissions"
)
```

### Right Way (Actually Restricts)
```python
# List all tools except browser
all_tools = get_all_available_tools()
disallowed = [tool for tool in all_tools if tool != "browser"]

options = ClaudeCodeOptions(
    allowed_tools=["browser"],
    disallowed_tools=disallowed,
    permission_mode="bypassPermissions"
)
```

## Using cc_agent for Restrictions

The cc_agent library provides a convenient way to create restricted agents:

```python
from cc_agent import Agent

# This will automatically populate disallowed_tools
agent = Agent(
    name="Browser Only Agent",
    allowed_tools=["browser"],
    restrict_to_allowed_tools=True,  # This enables true restriction
    permission_mode="bypassPermissions"
)
```

## Security Implications

Without proper restrictions:
- Agents can execute shell commands even if you only wanted them to browse
- Agents can read/write files even if you only wanted them to search
- Agents have full system access within their working directory

Always use `disallowed_tools` or `restrict_to_allowed_tools` when you need true restrictions.

## Testing Restrictions

To verify your agent is properly restricted:

```python
# In your test prompt, ask the agent to:
1. List all tools it can see
2. Try using a non-allowed tool (like Bash)
3. Verify it gets an error or refusal
```

## Related Documentation

- [Claude Code Settings](https://docs.anthropic.com/en/docs/claude-code/settings)
- [Claude Code SDK](https://docs.anthropic.com/en/docs/claude-code/sdk)
- [CLI Reference](https://docs.anthropic.com/en/docs/claude-code/cli-reference)