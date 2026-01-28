#!/usr/bin/env python3
"""Test MCP server directly."""

import os
import subprocess
import json
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent / ".env"
print(f"Loading .env from: {env_path}")
load_dotenv(env_path, override=True)

# Set up environment
env = os.environ.copy()
env.update({
    "NEO4J_URI": os.getenv("NEO4J_URI", "bolt://localhost:7687"),
    "NEO4J_USER": os.getenv("NEO4J_USER", "neo4j"),
    "NEO4J_PASSWORD": os.getenv("NEO4J_PASSWORD", "cc-core-password"),
    "QDRANT_URL": os.getenv("QDRANT_URL", "http://localhost:6333"),
    "QDRANT_COLLECTION": os.getenv("QDRANT_COLLECTION", "app_factory_memories"),
    "OPENAI_API_KEY": os.getenv("OPENAI_API_KEY", ""),
    "MEM0_USER_ID": "app_factory",
    "MEM0_DEFAULT_CONTEXT": "app_factory",
    "MCP_LOG_LEVEL": "DEBUG"
})

print("\nTesting mem0 MCP server directly...")
print("Environment variables:")
for key in ["NEO4J_URI", "QDRANT_URL", "OPENAI_API_KEY"]:
    print(f"  {key}: {'set' if env.get(key) else 'not set'}")

# Test mem0 server
print("\n1. Starting mem0 MCP server...")
proc = subprocess.Popen(
    ["uv", "run", "mcp-mem0"],
    env=env,
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)

# Send initialization request
init_request = {
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {
        "protocolVersion": "1.0.0",
        "capabilities": {}
    },
    "id": 1
}

print("\n2. Sending initialization request...")
proc.stdin.write(json.dumps(init_request) + "\n")
proc.stdin.flush()

# Read response
response = proc.stdout.readline()
print(f"Response: {response}")

# Send add_memory request
add_memory_request = {
    "jsonrpc": "2.0",
    "method": "call_tool",
    "params": {
        "name": "add_memory",
        "arguments": {
            "content": "Test memory from direct MCP test",
            "context": "test:direct"
        }
    },
    "id": 2
}

print("\n3. Sending add_memory request...")
proc.stdin.write(json.dumps(add_memory_request) + "\n")
proc.stdin.flush()

# Read response
response = proc.stdout.readline()
print(f"Response: {response}")

# Check stderr for errors
errors = proc.stderr.read()
if errors:
    print(f"\nErrors: {errors}")

proc.terminate()
print("\nTest complete.")