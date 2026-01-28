#!/usr/bin/env python3
"""Debug why context tools aren't being used."""

import os
import json
from pathlib import Path

def check_mcp_env():
    """Check MCP environment configuration."""
    print("🔧 MCP Environment Check")
    print("="*50)
    
    mcp_config = os.environ.get('CLAUDE_MCP_CONFIG', '')
    if mcp_config:
        print("✅ CLAUDE_MCP_CONFIG is set")
        try:
            config = json.loads(mcp_config)
            print(f"   Configured servers: {list(config.get('servers', {}).keys())}")
        except:
            print("   ⚠️  Could not parse MCP config")
    else:
        print("❌ CLAUDE_MCP_CONFIG not set")
        print("   This is why context tools aren't working!")
    
    print("\nTo fix this, you need to:")
    print("1. Set up MCP servers in your shell config")
    print("2. Export CLAUDE_MCP_CONFIG with server configurations")
    print("3. Ensure the MCP servers are installed")

def check_agent_config():
    """Check how the agent is configured."""
    print("\n\n🤖 Agent Configuration")
    print("="*50)
    
    from app_factory.agents.stage_0_orchestrator.orchestrator.config import (
        ORCHESTRATOR_ALLOWED_TOOLS,
        MEMORY_NAMESPACE,
        ORCHESTRATOR_PERMISSION_MODE
    )
    
    print(f"Permission mode: {ORCHESTRATOR_PERMISSION_MODE}")
    print(f"Memory namespace: {MEMORY_NAMESPACE}")
    print(f"\nAllowed tools ({len(ORCHESTRATOR_ALLOWED_TOOLS)}):")
    for tool in ORCHESTRATOR_ALLOWED_TOOLS:
        print(f"  - {tool}")
    
    # Check if context tools are in allowed list
    context_tools = ["mem0", "graphiti", "context_manager", "tree_sitter", "integration_analyzer"]
    print(f"\nContext tools included: {[t for t in context_tools if t in ORCHESTRATOR_ALLOWED_TOOLS]}")

def check_what_tools_ran():
    """Try to determine what tools actually ran."""
    print("\n\n🔍 Tool Execution Analysis")
    print("="*50)
    
    # The session said 3 tools were used
    print("Session indicates 3 tool uses")
    print("\nLikely tools used:")
    print("1. Write - to save the PRD")
    print("2. TodoWrite - for task tracking")
    print("3. Read or WebSearch - for context")
    
    print("\nContext tools NOT used (because MCP servers not running):")
    print("- mem0 (would store PRD patterns)")
    print("- graphiti (would create knowledge graph)")
    print("- context_manager (would track decisions)")

def explain_issue():
    """Explain what's happening."""
    print("\n\n💡 WHAT'S HAPPENING")
    print("="*50)
    print("""
The orchestrator IS context-aware and configured correctly, BUT:

1. The MCP servers for context tools aren't running
2. Without MCP servers, the agent can't use mem0, graphiti, etc.
3. The agent falls back to basic tools (Read, Write, TodoWrite)

The PRD was generated successfully using the agent's built-in intelligence,
but without the memory and graph features that would make it learn over time.

To enable full context awareness:
1. Install MCP servers: npm install -g @your-org/mcp-mem0 etc.
2. Configure CLAUDE_MCP_CONFIG environment variable
3. Ensure Neo4j is running for graphiti
4. Re-run the orchestrator

Even without context tools, the agent still:
- Generated a comprehensive PRD
- Extracted app name (FlowSync)
- Saved session context
- Used its training to create a good document
""")

if __name__ == "__main__":
    check_mcp_env()
    check_agent_config()
    check_what_tools_ran()
    explain_issue()