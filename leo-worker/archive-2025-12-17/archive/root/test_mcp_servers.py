#!/usr/bin/env python3
"""Test script to verify MCP servers can start correctly."""

import subprocess
import json
import os
import time
import signal

def test_mcp_server(name, command, args, env):
    """Test if an MCP server can start and respond to initialize."""
    print(f"\n{'='*60}")
    print(f"Testing {name} MCP server...")
    print(f"Command: {command} {' '.join(args)}")
    print(f"Environment variables: {list(env.keys())}")
    
    # Merge environment variables
    full_env = os.environ.copy()
    full_env.update(env)
    
    try:
        # Start the process
        process = subprocess.Popen(
            [command] + args,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env=full_env,
            text=False  # Use binary mode
        )
        
        # Send initialize request
        initialize_request = {
            "jsonrpc": "2.0",
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {
                    "name": "test-client",
                    "version": "1.0.0"
                }
            },
            "id": 1
        }
        
        # Write request
        request_str = json.dumps(initialize_request)
        process.stdin.write(request_str.encode('utf-8') + b'\n')
        process.stdin.flush()
        
        # Wait a bit for response
        time.sleep(2)
        
        # Try to read response
        try:
            process.stdout.flush()
            output = process.stdout.read(1024)  # Read up to 1KB
            if output:
                print(f"✅ {name} server started successfully!")
                print(f"Response preview: {output[:200]}")
            else:
                print(f"⚠️  {name} server started but no response received")
        except Exception as e:
            print(f"⚠️  Error reading response: {e}")
        
        # Check if process is still running
        if process.poll() is None:
            print(f"Process is still running (PID: {process.pid})")
            # Terminate the process
            process.terminate()
            process.wait(timeout=5)
        else:
            print(f"❌ Process exited with code: {process.returncode}")
            stderr = process.stderr.read()
            if stderr:
                print(f"Error output: {stderr.decode('utf-8', errors='replace')[:500]}")
                
    except FileNotFoundError:
        print(f"❌ Command not found: {command}")
    except Exception as e:
        print(f"❌ Error: {type(e).__name__}: {e}")

def main():
    """Test all MCP servers from the Claude Desktop config."""
    
    # Load the Claude Desktop config
    config_path = "/Users/labheshpatel/Library/Application Support/Claude/claude_desktop_config.json"
    with open(config_path, 'r') as f:
        config = json.load(f)
    
    # Test only our custom MCP servers (not the AWS ones)
    servers_to_test = ['mem0', 'graphiti', 'context_manager', 'tree_sitter', 'integration_analyzer']
    
    for server_name in servers_to_test:
        if server_name in config['mcpServers']:
            server_config = config['mcpServers'][server_name]
            test_mcp_server(
                server_name,
                server_config['command'],
                server_config['args'],
                server_config.get('env', {})
            )

if __name__ == "__main__":
    main()