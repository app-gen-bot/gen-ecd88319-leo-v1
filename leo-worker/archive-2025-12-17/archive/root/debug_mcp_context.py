#!/usr/bin/env python3
"""Debug why context tools aren't being used by MCP servers."""

import os
import json
from pathlib import Path
from dotenv import load_dotenv

# Load .env file
load_dotenv()

print("🔍 MCP Context Tools Debug")
print("=" * 60)

# 1. Check environment after loading .env
print("\n1. Environment Variables (after loading .env):")
env_vars = ["NEO4J_URI", "NEO4J_USER", "NEO4J_PASSWORD", "QDRANT_URL", "OPENAI_API_KEY"]
for var in env_vars:
    value = os.environ.get(var)
    if value:
        if var == "OPENAI_API_KEY":
            print(f"   ✅ {var}: ...{value[-10:]}")
        else:
            print(f"   ✅ {var}: {value}")
    else:
        print(f"   ❌ {var}: Not set")

# 2. Check how the agent was run
print("\n2. Test Execution Context:")
print(f"   Working directory: {os.getcwd()}")
print(f"   Python executable: {os.sys.executable}")

# 3. Check if MCP config is being passed
print("\n3. MCP Configuration:")
mcp_file = Path(".mcp.json")
if mcp_file.exists():
    with open(mcp_file) as f:
        config = json.load(f)
    servers = list(config.get("mcpServers", {}).keys())
    print(f"   MCP servers configured: {', '.join(servers)}")
else:
    print("   ❌ .mcp.json not found")

# 4. The real issue
print("\n4. THE REAL ISSUE:")
print("=" * 60)
print("When running with 'uv run python', the MCP servers are NOT automatically started!")
print("MCP servers are only used when running through Claude Code CLI.")
print("")
print("To use context awareness features, you need to run through Claude Code:")
print("   claude-code-cli 'Generate a PRD for a task management app'")
print("")
print("Or use the claude-code-sdk directly in the test script.")
print("")
print("The test_context_aware_orchestrator.py uses the orchestrator directly,")
print("bypassing the MCP server layer. That's why no context tools are used!")

# 5. How to properly test
print("\n5. How to Properly Test Context Awareness:")
print("=" * 60)
print("Option 1: Use Claude Code CLI")
print("   claude-code-cli --permission-mode default")
print("   Then in the session: 'Generate a PRD for [your app idea]'")
print("")
print("Option 2: Update test to use claude-code-sdk")
print("   The test needs to use the SDK to invoke the agent,")
print("   which will then use the MCP servers.")

# 6. Check what the session file shows
print("\n6. Session Analysis:")
latest_session = max(Path(".agent_context").glob("session_*.json"), key=lambda p: p.stat().st_mtime)
with open(latest_session) as f:
    session = json.load(f)
print(f"   Latest session: {latest_session.name}")
print(f"   Tool uses: {session.get('tool_uses', 0)}")
print(f"   Success: {session.get('success', False)}")
print("")
print("   The 1 tool use was likely 'Write' to save the PRD.")
print("   No context tools (mem0, graphiti) were invoked because")
print("   the MCP servers weren't actually running in the subprocess.")