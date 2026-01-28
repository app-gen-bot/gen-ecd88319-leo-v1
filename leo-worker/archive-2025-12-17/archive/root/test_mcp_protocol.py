#!/usr/bin/env python3
"""Test MCP protocol directly."""

import subprocess
import json
import time

# Start mcp-mem0 server
print("Starting mcp-mem0 server...")
proc = subprocess.Popen(
    ["uv", "run", "mcp-mem0"],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True,
    bufsize=0
)

# Wait a bit for startup
time.sleep(2)

# Send initialization
init_msg = {
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {
        "protocolVersion": "1.0.0",
        "capabilities": {}
    },
    "id": 1
}

print(f"\nSending: {json.dumps(init_msg)}")
proc.stdin.write(json.dumps(init_msg) + "\n")
proc.stdin.flush()

# Try to read response
print("\nWaiting for response...")
try:
    # Read with timeout
    import select
    readable, _, _ = select.select([proc.stdout], [], [], 5.0)
    if readable:
        response = proc.stdout.readline()
        print(f"Response: {response}")
    else:
        print("No response received within 5 seconds")
except Exception as e:
    print(f"Error reading response: {e}")

# Check stderr
stderr_output = proc.stderr.read(100) if proc.stderr else "No stderr"
print(f"\nStderr: {stderr_output}")

# Terminate
proc.terminate()
print("\nDone.")