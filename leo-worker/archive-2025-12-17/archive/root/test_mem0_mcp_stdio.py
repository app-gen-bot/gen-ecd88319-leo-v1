#!/usr/bin/env python3
"""Test mem0 MCP server directly via stdio."""

import json
import subprocess
import os
import time
from dotenv import load_dotenv

# Load environment
load_dotenv()

def test_mem0_mcp_direct():
    """Test mem0 MCP server directly."""
    
    print("\n🔍 Testing mem0 MCP Server Directly (stdio)")
    print("=" * 80)
    
    env = os.environ.copy()
    
    # Start the mem0 server
    print("Starting mem0 MCP server...")
    process = subprocess.Popen(
        ["uv", "run", "mcp-mem0"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        env=env
    )
    
    time.sleep(2)  # Give it time to start
    
    # Send initialize request
    init_request = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
            "protocolVersion": "1.0.0",
            "capabilities": {},
            "clientInfo": {
                "name": "test-client",
                "version": "1.0.0"
            }
        }
    }
    
    print("\n→ Sending initialize...")
    process.stdin.write(json.dumps(init_request) + "\n")
    process.stdin.flush()
    
    # Read response
    response = process.stdout.readline()
    if response:
        print(f"← Response: {response[:100]}...")
    
    # List tools
    list_tools = {
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/list",
        "params": {}
    }
    
    print("\n→ Listing tools...")
    process.stdin.write(json.dumps(list_tools) + "\n")
    process.stdin.flush()
    
    response = process.stdout.readline()
    if response:
        try:
            resp_json = json.loads(response)
            if "result" in resp_json and "tools" in resp_json["result"]:
                tools = resp_json["result"]["tools"]
                print(f"← Found {len(tools)} tools:")
                for tool in tools:
                    print(f"   - {tool['name']}")
        except:
            print(f"← Raw response: {response[:200]}...")
    
    # Try to add a memory
    add_memory = {
        "jsonrpc": "2.0",
        "id": 3,
        "method": "tools/call",
        "params": {
            "name": "add_memory",
            "arguments": {
                "content": "Test memory from direct stdio test",
                "user_id": "stdio_test"
            }
        }
    }
    
    print("\n→ Adding memory...")
    process.stdin.write(json.dumps(add_memory) + "\n")
    process.stdin.flush()
    
    response = process.stdout.readline()
    if response:
        try:
            resp_json = json.loads(response)
            print(f"← Result: {json.dumps(resp_json, indent=2)}")
        except:
            print(f"← Raw response: {response}")
    
    # Clean up
    process.terminate()
    process.wait(timeout=5)
    
    print("\n✅ Test complete")


if __name__ == "__main__":
    test_mem0_mcp_direct()