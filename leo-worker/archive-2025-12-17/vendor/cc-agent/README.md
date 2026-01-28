# cc-agent

Claude Code Agent Framework - Base framework for creating AI agents that work with Claude Code.

## Version: 1.10.0

This library provides:
- Base `Agent` class for creating AI agents
- `ContextAwareAgent` for context management across sessions
- Retry handling with exponential backoff
- MCP server integration
- Structured logging

## Installation

```bash
pip install cc-agent
```

## Usage

```python
from cc_agent import Agent

agent = Agent(
    name="My Agent",
    system_prompt="You are a helpful assistant",
    allowed_tools=["Read", "Write", "Edit"],
    mcp_tools=["oxc", "tree_sitter"]  # Optional MCP tools
)

result = await agent.run("Your task here")
```

See VERSION_MAPPING.md for version compatibility with app-factory branches.