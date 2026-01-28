#!/usr/bin/env python3
"""Wrapper to ensure environment is loaded before any imports."""

import os
import sys
from pathlib import Path

# Load environment FIRST before any imports
from dotenv import load_dotenv
env_path = Path(__file__).parent / ".env"
print(f"Loading environment from: {env_path}")
load_dotenv(env_path, override=True)

# Verify critical env vars
print("Environment loaded:")
for key in ["OPENAI_API_KEY", "NEO4J_URI", "NEO4J_PASSWORD", "QDRANT_URL"]:
    value = os.getenv(key)
    if key == "OPENAI_API_KEY" and value:
        print(f"  {key}: set (length: {len(value)})")
    else:
        print(f"  {key}: {value if value else 'NOT SET'}")

# Now run the actual command
if len(sys.argv) > 1:
    # Remove this script from argv and run the rest
    import subprocess
    cmd = ["python"] + sys.argv[1:]
    print(f"\nRunning: {' '.join(cmd)}")
    subprocess.run(cmd)
else:
    print("\nUsage: python run_with_env.py <script.py> [args...]")