#!/usr/bin/env python3
"""Test MCP HTTP server wrapper."""

import asyncio
import aiohttp
import json
import subprocess
import time
import os

async def test_http_server():
    """Test the mem0 HTTP server."""
    
    # Start the HTTP server
    print("Starting HTTP server...")
    server_process = subprocess.Popen(
        ["uv", "run", "python", "-m", "cc_tools.mem0.http_server"],
        env={**os.environ, "OPENAI_API_KEY": os.getenv("OPENAI_API_KEY", "")}
    )
    
    # Wait for server to start
    time.sleep(5)
    
    try:
        # Test the health endpoint
        async with aiohttp.ClientSession() as session:
            print("\nTesting health endpoint...")
            async with session.get("http://localhost:8001/") as resp:
                data = await resp.json()
                print(f"Health response: {data}")
            
            # Test MCP initialize
            print("\nTesting MCP initialize...")
            async with session.post("http://localhost:8001/mcp", json={
                "jsonrpc": "2.0",
                "id": 1,
                "method": "initialize",
                "params": {}
            }) as resp:
                data = await resp.json()
                print(f"Initialize response: {json.dumps(data, indent=2)}")
            
            # Test tools list
            print("\nTesting tools list...")
            async with session.post("http://localhost:8001/mcp", json={
                "jsonrpc": "2.0",
                "id": 2,
                "method": "tools/list",
                "params": {}
            }) as resp:
                data = await resp.json()
                print(f"Tools list response: {json.dumps(data, indent=2)}")
            
            # Test add memory
            print("\nTesting add memory...")
            async with session.post("http://localhost:8001/mcp", json={
                "jsonrpc": "2.0",
                "id": 3,
                "method": "tools/call",
                "params": {
                    "name": "add_memory",
                    "arguments": {
                        "content": "HTTP transport for MCP is working successfully",
                        "context": "test:http_transport"
                    }
                }
            }) as resp:
                data = await resp.json()
                print(f"Add memory response: {json.dumps(data, indent=2)}")
            
            # Test search memories
            print("\nTesting search memories...")
            async with session.post("http://localhost:8001/mcp", json={
                "jsonrpc": "2.0",
                "id": 4,
                "method": "tools/call",
                "params": {
                    "name": "search_memories",
                    "arguments": {
                        "query": "HTTP transport"
                    }
                }
            }) as resp:
                data = await resp.json()
                print(f"Search memories response: {json.dumps(data, indent=2)}")
                
    finally:
        # Stop the server
        print("\nStopping server...")
        server_process.terminate()
        server_process.wait()

if __name__ == "__main__":
    asyncio.run(test_http_server())