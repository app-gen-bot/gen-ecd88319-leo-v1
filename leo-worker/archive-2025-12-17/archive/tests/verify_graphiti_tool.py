#!/usr/bin/env python3
"""Quick verification that Graphiti tool is available in the MCP configuration."""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from cc_agent.context import ContextAwareAgent

# Create a minimal context-aware agent
agent = ContextAwareAgent(
    name="Test Agent",
    system_prompt="You are a test agent.",
    allowed_tools=[],
    enable_context_awareness=True
)

print("Context-Aware Agent Configuration:")
print(f"- Name: {agent.name}")
print(f"- Allowed tools: {agent.allowed_tools}")
print(f"- Context awareness enabled: {agent.enable_context_awareness}")

print("\nMCP Server Configuration:")
if hasattr(agent, 'mcp_config'):
    for server, config in agent.mcp_config.items():
        print(f"- {server}: {config}")
else:
    print("No MCP configuration found")

print("\nGraphiti Integration Status:")
if 'graphiti' in agent.allowed_tools:
    print("✓ Graphiti is in allowed_tools")
else:
    print("✗ Graphiti is NOT in allowed_tools")

if hasattr(agent, 'mcp_config') and 'graphiti' in agent.mcp_config:
    print("✓ Graphiti MCP server is configured")
    print(f"  Command: {agent.mcp_config['graphiti']['command']}")
else:
    print("✗ Graphiti MCP server is NOT configured")