#!/usr/bin/env python3
"""Test mem0 MCP server directly."""

import json
import subprocess
import os
import time
from dotenv import load_dotenv

# Load environment
load_dotenv()

def test_mem0_mcp_server():
    """Test mem0 MCP server directly with stdio."""
    
    print("\n🔍 Testing mem0 MCP Server Directly")
    print("=" * 80)
    
    env = os.environ.copy()
    
    # Test messages
    test_messages = [
        # Initialize request
        {
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
        },
        # List tools
        {
            "jsonrpc": "2.0",
            "id": 2,
            "method": "tools/list",
            "params": {}
        },
        # Add memory
        {
            "jsonrpc": "2.0",
            "id": 3,
            "method": "tools/call",
            "params": {
                "name": "add_memory",
                "arguments": {
                    "content": "mem0 MCP server is working correctly with Qdrant backend",
                    "user_id": "test_user_mcp"
                }
            }
        },
        # Search memories
        {
            "jsonrpc": "2.0",
            "id": 4,
            "method": "tools/call",
            "params": {
                "name": "search_memories",
                "arguments": {
                    "query": "mem0 MCP Qdrant",
                    "user_id": "test_user_mcp"
                }
            }
        }
    ]
    
    try:
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
        
        # Give it a moment to start
        time.sleep(1)
        
        # Send messages and get responses
        for msg in test_messages:
            msg_str = json.dumps(msg) + "\n"
            print(f"\n→ Sending: {msg['method']}")
            if 'name' in msg.get('params', {}):
                print(f"   Tool: {msg['params']['name']}")
            
            process.stdin.write(msg_str)
            process.stdin.flush()
            
            # Read response
            response = process.stdout.readline()
            if response:
                try:
                    resp_json = json.loads(response)
                    if "error" in resp_json:
                        print(f"← ERROR: {resp_json['error']}")
                    elif "result" in resp_json:
                        if msg["method"] == "tools/list":
                            tools = resp_json["result"].get("tools", [])
                            print(f"← Found {len(tools)} tools:")
                            for tool in tools:
                                print(f"    - {tool['name']}: {tool.get('description', '')[:60]}...")
                        elif msg["method"] == "tools/call":
                            print(f"← Result: {json.dumps(resp_json['result'], indent=2)}")
                        else:
                            print(f"← Response received")
                except json.JSONDecodeError:
                    print(f"← Raw response: {response[:200]}...")
        
        # Terminate and check for errors
        process.terminate()
        _, stderr = process.communicate(timeout=2)
        if stderr and "INFO" not in stderr and "Starting" not in stderr:
            print(f"\n⚠️ Stderr output:\n{stderr}")
            
    except Exception as e:
        print(f"❌ Error testing server: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    test_mem0_mcp_server()