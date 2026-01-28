#!/usr/bin/env python3
"""Test the exact tool call that's failing."""

import json
import subprocess
import os
from dotenv import load_dotenv

# Load environment
load_dotenv()

def test_add_episode_tool():
    """Test the add_knowledge_episode tool directly."""
    
    print("\n🔍 Testing add_knowledge_episode Tool Call")
    print("=" * 80)
    
    env = os.environ.copy()
    
    # Start the graphiti server
    process = subprocess.Popen(
        ["uv", "run", "mcp-graphiti"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        env=env
    )
    
    # Initialize
    init_msg = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
            "protocolVersion": "1.0.0",
            "capabilities": {},
            "clientInfo": {"name": "test", "version": "1.0"}
        }
    }
    
    process.stdin.write(json.dumps(init_msg) + "\n")
    process.stdin.flush()
    init_response = process.stdout.readline()
    print(f"Init response: {init_response[:100]}...")
    
    # Wait a bit for initialization
    import time
    time.sleep(0.5)
    
    # List tools to see what parameters are expected
    list_tools_msg = {
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/list",
        "params": {}
    }
    
    process.stdin.write(json.dumps(list_tools_msg) + "\n")
    process.stdin.flush()
    tools_response = process.stdout.readline()
    
    try:
        tools_json = json.loads(tools_response)
        if "result" in tools_json and "tools" in tools_json["result"]:
            print(f"\n📋 Found {len(tools_json['result']['tools'])} tools")
            for tool in tools_json["result"]["tools"]:
                if tool["name"] == "add_knowledge_episode":
                    print("\n✅ add_knowledge_episode tool schema:")
                    print(json.dumps(tool, indent=2))
                    
                    # Extract required parameters
                    if "inputSchema" in tool:
                        schema = tool["inputSchema"]
                        print("\n📌 Required parameters:")
                        required = schema.get("required", [])
                        properties = schema.get("properties", {})
                        for param in required:
                            if param in properties:
                                print(f"  - {param}: {properties[param].get('type', 'unknown')}")
    except Exception as e:
        print(f"Error parsing tools: {e}")
        print(f"Raw response: {tools_response}")
    
    # Now test the actual tool call that the agent is making
    # Based on the test_graphiti_context_aware.py logs
    tool_call = {
        "jsonrpc": "2.0",
        "id": 3,
        "method": "tools/call",
        "params": {
            "name": "add_knowledge_episode",
            "arguments": {
                "content": "During the App Factory design session, we decided on a multi-stage pipeline architecture. Stage 0 generates PRDs, Stage 1 creates interaction specs, and Stage 2 builds the frontend. The system uses specialized AI agents for each stage with a Writer-Critic pattern for quality improvement.",
                "episode_name": "App Factory Design Session",
                "context": "design_meeting",
                "metadata": {}
            }
        }
    }
    
    print("\n→ Sending tool call...")
    print(json.dumps(tool_call["params"], indent=2))
    
    process.stdin.write(json.dumps(tool_call) + "\n")
    process.stdin.flush()
    
    # Get response
    response = process.stdout.readline()
    print("\n← Response:")
    try:
        resp_json = json.loads(response)
        print(json.dumps(resp_json, indent=2))
    except:
        print(response)
    
    # Check stderr
    process.terminate()
    _, stderr = process.communicate(timeout=2)
    if stderr:
        print(f"\n⚠️ Stderr:\n{stderr}")


if __name__ == "__main__":
    test_add_episode_tool()