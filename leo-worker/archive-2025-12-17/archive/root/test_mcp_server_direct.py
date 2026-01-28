#!/usr/bin/env python3
"""Test running MCP server directly to see output."""

import subprocess
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path, override=True)

print("Testing MCP server startup...")
print(f"OPENAI_API_KEY: {'set' if os.getenv('OPENAI_API_KEY') else 'NOT SET'}")

# Run the server directly to see output
try:
    result = subprocess.run(
        ["uv", "run", "mcp-mem0"],
        capture_output=True,
        text=True,
        timeout=5
    )
    print(f"Exit code: {result.returncode}")
    print(f"Stdout:\n{result.stdout}")
    print(f"Stderr:\n{result.stderr}")
except subprocess.TimeoutExpired as e:
    print("Server is running (timeout expected)")
    print(f"Stdout so far:\n{e.stdout if e.stdout else 'None'}")
    print(f"Stderr so far:\n{e.stderr if e.stderr else 'None'}")