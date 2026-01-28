#\!/usr/bin/env python3
"""Simple test to check MCP server environment."""

import subprocess
import os

# Test mem0 server with required environment variables
env = os.environ.copy()
env.update({
    "MCP_LOG_LEVEL": "INFO",
    "MEM0_STORAGE_PATH": "/Users/labheshpatel/.mem0",
    "MEM0_NAMESPACE": "orchestrator_prds",
    "OPENAI_API_KEY": os.getenv("OPENAI_API_KEY", ""),
    "NEO4J_URI": "bolt://localhost:7687",
    "NEO4J_USER": "neo4j", 
    "NEO4J_PASSWORD": "cc-core-password"
})

print("Testing mem0 server with environment:")
for k, v in env.items():
    if k.startswith(("MEM0", "NEO4J", "OPENAI")):
        if k == "OPENAI_API_KEY":
            print(f"  {k}: {'***SET***' if v else '***NOT SET***'}")
        else:
            print(f"  {k}: {v}")

print("\nAttempting to run: uv run mcp-mem0 --help")
result = subprocess.run(
    ["uv", "run", "mcp-mem0", "--help"],
    capture_output=True,
    text=True,
    env=env
)

print(f"\nReturn code: {result.returncode}")
print(f"STDOUT:\n{result.stdout}")
print(f"STDERR:\n{result.stderr}")