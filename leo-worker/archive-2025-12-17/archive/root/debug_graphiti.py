#!/usr/bin/env python3
"""Debug Graphiti MCP server issues."""

import os
import sys
import json
import subprocess
from pathlib import Path

# Add the src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))


def test_graphiti_server_directly():
    """Test Graphiti MCP server directly with stdio."""
    print("\n🔍 Testing Graphiti MCP Server Directly")
    print("=" * 80)
    
    # Load environment
    from dotenv import load_dotenv
    load_dotenv()
    
    env = os.environ.copy()
    
    # Test message to send to the server
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
        }
    ]
    
    try:
        # Start the graphiti server
        print("Starting Graphiti MCP server...")
        process = subprocess.Popen(
            ["uv", "run", "mcp-graphiti"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            env=env
        )
        
        # Send messages and get responses
        for msg in test_messages:
            msg_str = json.dumps(msg) + "\n"
            print(f"\n→ Sending: {msg['method']}")
            
            process.stdin.write(msg_str)
            process.stdin.flush()
            
            # Read response
            response = process.stdout.readline()
            if response:
                print(f"← Response: {response[:200]}...")
                try:
                    resp_json = json.loads(response)
                    if "error" in resp_json:
                        print(f"  ERROR: {resp_json['error']}")
                    elif "result" in resp_json:
                        if msg["method"] == "tools/list":
                            tools = resp_json["result"].get("tools", [])
                            print(f"  Found {len(tools)} tools:")
                            for tool in tools:
                                print(f"    - {tool['name']}")
                except json.JSONDecodeError:
                    print("  Could not parse response as JSON")
        
        # Check stderr for any errors
        process.terminate()
        _, stderr = process.communicate(timeout=2)
        if stderr:
            print(f"\n⚠️ Stderr output:\n{stderr}")
            
    except Exception as e:
        print(f"❌ Error testing server: {e}")


def check_graphiti_python_package():
    """Check if graphiti Python package is properly installed."""
    print("\n📦 Checking Graphiti Python Package")
    print("=" * 80)
    
    try:
        # Try to import graphiti directly
        import graphiti_core
        print(f"✅ graphiti_core version: {graphiti_core.__version__ if hasattr(graphiti_core, '__version__') else 'unknown'}")
        
        # Check if we can create a Graphiti instance
        from graphiti_core import Graphiti
        from graphiti_core.llm_client import OpenAIClient
        from graphiti_core.embedder import OpenAIEmbedder
        from graphiti_core.nodes import EpisodeNode
        
        print("✅ Successfully imported Graphiti components")
        
        # Try to initialize components
        try:
            llm_client = OpenAIClient(
                api_key=os.getenv("OPENAI_API_KEY"),
                model="gpt-3.5-turbo"
            )
            print("✅ Created OpenAI LLM client")
            
            embedder = OpenAIEmbedder(
                api_key=os.getenv("OPENAI_API_KEY")
            )
            print("✅ Created OpenAI embedder")
            
            # Test Neo4j connection
            uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
            user = os.getenv("NEO4J_USER", "neo4j")
            password = os.getenv("NEO4J_PASSWORD", "cc-core-password")
            
            graphiti = Graphiti(
                uri=uri,
                username=user,
                password=password,
                llm_client=llm_client,
                embedder=embedder
            )
            print(f"✅ Created Graphiti instance connected to {uri}")
            
            # Try to add a test episode
            print("\n🧪 Testing episode addition...")
            episode = EpisodeNode(
                name="Debug Test Episode",
                content="This is a test episode created during debugging.",
                timestamp="2025-07-11T19:00:00Z"
            )
            
            result = graphiti.add_episode(episode)
            print(f"✅ Successfully added episode: {result}")
            
            # Retrieve to verify
            episodes = graphiti.get_episodes()
            print(f"✅ Retrieved {len(episodes)} episodes from graph")
            
        except Exception as e:
            print(f"❌ Error initializing Graphiti: {e}")
            import traceback
            traceback.print_exc()
            
    except ImportError as e:
        print(f"❌ Could not import graphiti: {e}")
        
        # Check if it's installed
        result = subprocess.run(
            ["uv", "pip", "list"],
            capture_output=True,
            text=True
        )
        if "graphiti" in result.stdout:
            print("✅ graphiti is installed via uv")
            lines = [l for l in result.stdout.split('\n') if 'graphiti' in l.lower()]
            for line in lines:
                print(f"  {line}")
        else:
            print("❌ graphiti is NOT installed")


def check_neo4j_connectivity():
    """Check Neo4j connectivity and permissions."""
    print("\n🔗 Checking Neo4j Connectivity")
    print("=" * 80)
    
    from neo4j import GraphDatabase
    
    uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    user = os.getenv("NEO4J_USER", "neo4j")
    password = os.getenv("NEO4J_PASSWORD", "cc-core-password")
    
    print(f"URI: {uri}")
    print(f"User: {user}")
    
    try:
        driver = GraphDatabase.driver(uri, auth=(user, password))
        
        with driver.session() as session:
            # Test basic query
            result = session.run("RETURN 1 as test")
            record = result.single()
            print(f"✅ Neo4j connection successful: {record['test']}")
            
            # Check write permissions
            result = session.run(
                "CREATE (n:TestNode {name: 'test', created: datetime()}) RETURN n"
            )
            node = result.single()['n']
            print(f"✅ Write permissions OK - created node with id: {node.id}")
            
            # Clean up
            session.run("MATCH (n:TestNode) DELETE n")
            print("✅ Cleanup successful")
            
        driver.close()
        
    except Exception as e:
        print(f"❌ Neo4j error: {e}")


def trace_mcp_graphiti_call():
    """Trace what happens when we call Graphiti through MCP."""
    print("\n🔍 Tracing MCP Graphiti Call")
    print("=" * 80)
    
    # Create a test request that would be sent by the agent
    test_request = {
        "jsonrpc": "2.0",
        "id": 3,
        "method": "tools/call",
        "params": {
            "name": "add_knowledge_episode",
            "arguments": {
                "name": "Trace Test Episode",
                "content": "Testing the MCP call flow",
                "timestamp": "2025-07-11T19:30:00Z",
                "metadata": {}
            }
        }
    }
    
    try:
        env = os.environ.copy()
        
        # Start server and send initialize first
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
                "clientInfo": {"name": "debug", "version": "1.0"}
            }
        }
        
        process.stdin.write(json.dumps(init_msg) + "\n")
        process.stdin.flush()
        init_response = process.stdout.readline()
        print(f"Initialize response: {init_response[:100]}...")
        
        # Send the actual tool call
        print(f"\n→ Sending tool call: add_knowledge_episode")
        process.stdin.write(json.dumps(test_request) + "\n")
        process.stdin.flush()
        
        # Get response
        response = process.stdout.readline()
        print(f"← Tool response: {response}")
        
        # Parse and analyze response
        try:
            resp_json = json.loads(response)
            if "error" in resp_json:
                print(f"\n❌ MCP Error: {resp_json['error']}")
            elif "result" in resp_json:
                print(f"\n✅ MCP Success: {json.dumps(resp_json['result'], indent=2)}")
        except:
            print(f"\n⚠️ Could not parse response")
        
        # Check stderr
        process.terminate()
        _, stderr = process.communicate(timeout=2)
        if stderr:
            print(f"\n⚠️ Server errors:\n{stderr}")
            
    except Exception as e:
        print(f"❌ Error in trace: {e}")
        import traceback
        traceback.print_exc()


def main():
    """Run all debugging checks."""
    print("🐛 Graphiti Debugging Session")
    print("=" * 80)
    
    # Load environment
    from dotenv import load_dotenv
    load_dotenv()
    
    # Run all checks
    check_neo4j_connectivity()
    check_graphiti_python_package()
    test_graphiti_server_directly()
    trace_mcp_graphiti_call()
    
    print("\n" + "=" * 80)
    print("✅ Debugging complete!")


if __name__ == "__main__":
    main()