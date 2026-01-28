#!/bin/bash
# Source this file to set up MCP environment

# Set MCP configuration
export CLAUDE_MCP_CONFIG=$(cat /Users/labheshpatel/apps/app-factory/mcp_config.json)

# Optional: Set individual tool paths for debugging
export MCP_MEM0_PATH="/Users/labheshpatel/apps/ai-workspace/mcp-tools"
export MCP_GRAPHITI_PATH="/Users/labheshpatel/apps/ai-workspace/mcp-tools"
export MCP_CONTEXT_MANAGER_PATH="/Users/labheshpatel/apps/ai-workspace/mcp-tools"

echo "✅ MCP environment configured"
echo "   - mem0: memory storage"
echo "   - graphiti: knowledge graph"
echo "   - context_manager: session tracking"
echo "   - tree_sitter: code analysis"
echo "   - integration_analyzer: pattern detection"
