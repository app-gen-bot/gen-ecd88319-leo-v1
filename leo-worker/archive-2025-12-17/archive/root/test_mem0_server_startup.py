#!/usr/bin/env python3
"""Test if mem0 MCP server starts correctly."""

import subprocess
import time
import os
from dotenv import load_dotenv

# Load environment
load_dotenv()

def test_mem0_server():
    """Test mem0 MCP server startup."""
    
    print("🔍 Testing mem0 MCP Server Startup")
    print("=" * 80)
    
    env = os.environ.copy()
    
    try:
        # Start the server
        print("Starting mcp-mem0...")
        process = subprocess.Popen(
            ["uv", "run", "mcp-mem0"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            env=env
        )
        
        # Give it a moment to start
        time.sleep(2)
        
        # Check if it's still running
        if process.poll() is None:
            print("✅ Server is running")
            
            # Try to read some output
            import select
            if select.select([process.stdout], [], [], 0.1)[0]:
                output = process.stdout.read(100)
                print(f"Output: {output}")
            
            # Check stderr for errors
            if select.select([process.stderr], [], [], 0.1)[0]:
                errors = process.stderr.read(500)
                if errors:
                    print(f"Stderr: {errors}")
            
        else:
            print(f"❌ Server exited with code: {process.poll()}")
            stdout, stderr = process.communicate()
            print(f"Stdout: {stdout[:500]}")
            print(f"Stderr: {stderr[:500]}")
            
        # Clean up
        process.terminate()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    test_mem0_server()