#!/usr/bin/env python3
"""
Direct test of tree-sitter MCP server functionality
"""

import asyncio
import json
from pathlib import Path
from fastmcp import FastMCP
from subprocess import Popen, PIPE
import sys

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

async def test_tree_sitter_tools():
    """Test tree-sitter MCP tools directly"""
    
    print("="*60)
    print("TREE-SITTER MCP SERVER TEST")
    print("="*60)
    
    # Create a test TypeScript file with some issues
    test_file = Path("/tmp/test_component.tsx")
    test_file.write_text("""
import React from 'react';

// Missing useState import but using it
const TestComponent = () => {
    const [count, setCount] = useState(0);  // useState not imported
    
    // Syntax error: missing closing bracket
    return (
        <div>
            <h1>Test Component</h1>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>
                Increment
            </button>
        </div
    );
};

// Missing export
TestComponent;
""")
    
    print(f"\n✅ Created test file: {test_file}")
    
    # Start the MCP server
    print("\n🚀 Starting tree-sitter MCP server...")
    proc = Popen(
        ["uv", "run", "mcp-tree-sitter"],
        stdin=PIPE,
        stdout=PIPE,
        stderr=PIPE,
        text=True
    )
    
    # Test 1: Validate Syntax
    print("\n📋 Test 1: Validate Syntax")
    request = {
        "jsonrpc": "2.0",
        "method": "tools/call",
        "params": {
            "name": "validate_syntax",
            "arguments": {
                "file_path": str(test_file)
            }
        },
        "id": 1
    }
    
    proc.stdin.write(json.dumps(request) + "\n")
    proc.stdin.flush()
    
    # Read response
    response = proc.stdout.readline()
    if response:
        result = json.loads(response)
        print(f"Response: {json.dumps(result, indent=2)}")
    
    # Test 2: Fix Imports
    print("\n📋 Test 2: Fix Imports")
    request = {
        "jsonrpc": "2.0",
        "method": "tools/call",
        "params": {
            "name": "fix_imports",
            "arguments": {
                "file_path": str(test_file)
            }
        },
        "id": 2
    }
    
    proc.stdin.write(json.dumps(request) + "\n")
    proc.stdin.flush()
    
    response = proc.stdout.readline()
    if response:
        result = json.loads(response)
        print(f"Response: {json.dumps(result, indent=2)}")
    
    # Test 3: Analyze Code Structure
    print("\n📋 Test 3: Analyze Code Structure")
    request = {
        "jsonrpc": "2.0",
        "method": "tools/call",
        "params": {
            "name": "analyze_code_structure",
            "arguments": {
                "file_path": str(test_file)
            }
        },
        "id": 3
    }
    
    proc.stdin.write(json.dumps(request) + "\n")
    proc.stdin.flush()
    
    response = proc.stdout.readline()
    if response:
        result = json.loads(response)
        print(f"Response: {json.dumps(result, indent=2)}")
    
    # Cleanup
    proc.terminate()
    test_file.unlink()
    
    print("\n✅ Test completed!")

if __name__ == "__main__":
    asyncio.run(test_tree_sitter_tools())