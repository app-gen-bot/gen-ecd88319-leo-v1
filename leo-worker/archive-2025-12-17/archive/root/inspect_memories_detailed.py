#!/usr/bin/env python3
"""Detailed inspection of memories in mem0 and graphiti."""

import os
import sys
import json
import asyncio
from pathlib import Path
from datetime import datetime

# Add the src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))


async def check_mem0_via_mcp():
    """Check mem0 memories using MCP tool."""
    print("\n🧠 Checking mem0 via MCP Tool")
    print("=" * 80)
    
    try:
        from cc_agent import Agent
        
        # Create a simple agent with mem0 access
        agent = Agent(
            name="MemoryInspector",
            system_prompt="You are a memory inspection tool.",
            allowed_tools=["mcp__mem0"],
            permission_mode="bypassPermissions"
        )
        
        # Search for all memories
        prompt = """Use the mem0 tools to:
1. First use get_memory_stats to see overall statistics
2. Then use search_memories with an empty query to get all memories
3. Format the results nicely"""
        
        result = await agent.run(
            user_prompt=prompt,
            mcp_servers={
                "mem0": {
                    "command": "uv",
                    "args": ["run", "mcp-mem0"],
                    "env": {
                        "OPENAI_API_KEY": os.getenv("OPENAI_API_KEY", ""),
                        "QDRANT_URL": os.getenv("QDRANT_URL", "http://localhost:6333"),
                        "QDRANT_COLLECTION_NAME": os.getenv("QDRANT_COLLECTION_NAME", "app_factory_memories"),
                        "MEM0_USER_ID": os.getenv("MEM0_USER_ID", "app_factory")
                    }
                }
            }
        )
        
        if result.success:
            print("\nMCP Tool Results:")
            print(result.content)
        else:
            print(f"❌ MCP tool failed: {result.error}")
            
    except Exception as e:
        print(f"❌ Error using MCP tool: {e}")


async def check_graphiti_via_mcp():
    """Check graphiti knowledge graph using MCP tool."""
    print("\n🔗 Checking Graphiti via MCP Tool")
    print("=" * 80)
    
    try:
        from cc_agent import Agent
        
        # Create a simple agent with graphiti access
        agent = Agent(
            name="GraphInspector",
            system_prompt="You are a knowledge graph inspection tool.",
            allowed_tools=["mcp__graphiti"],
            permission_mode="bypassPermissions"
        )
        
        # Query the graph
        prompt = """Use the graphiti tools to:
1. Use retrieve_episodes to see what episodes are stored
2. Use search_episodes with query "app factory" to find relevant episodes
3. Format the results nicely"""
        
        result = await agent.run(
            user_prompt=prompt,
            mcp_servers={
                "graphiti": {
                    "command": "uv",
                    "args": ["run", "mcp-graphiti"],
                    "env": {
                        "NEO4J_URI": os.getenv("NEO4J_URI", "bolt://localhost:7687"),
                        "NEO4J_USER": os.getenv("NEO4J_USER", "neo4j"),
                        "NEO4J_PASSWORD": os.getenv("NEO4J_PASSWORD", "cc-core-password")
                    }
                }
            }
        )
        
        if result.success:
            print("\nMCP Tool Results:")
            print(result.content)
        else:
            print(f"❌ MCP tool failed: {result.error}")
            
    except Exception as e:
        print(f"❌ Error using MCP tool: {e}")


def check_mem0_direct():
    """Check mem0 memories directly via HTTP API."""
    print("\n🧠 Direct mem0 API Check")
    print("=" * 80)
    
    try:
        import httpx
        
        qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
        collection_name = os.getenv("QDRANT_COLLECTION_NAME", "app_factory_memories")
        
        # Scroll through all points with full payloads
        response = httpx.post(
            f"{qdrant_url}/collections/{collection_name}/points/scroll",
            json={
                "limit": 100,
                "with_payload": True,
                "with_vector": False
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            points = data.get("result", {}).get("points", [])
            
            print(f"\nFound {len(points)} memories in collection '{collection_name}':\n")
            
            for i, point in enumerate(points, 1):
                print(f"Memory {i}:")
                print(f"  ID: {point.get('id')}")
                
                payload = point.get('payload', {})
                
                # Check different possible payload structures
                memory_content = (
                    payload.get('memory') or 
                    payload.get('content') or 
                    payload.get('text') or 
                    payload.get('data', {}).get('content') or
                    "No content found"
                )
                
                print(f"  Content: {memory_content}")
                print(f"  User ID: {payload.get('user_id', 'N/A')}")
                print(f"  Created: {payload.get('created_at', 'N/A')}")
                
                # Show all payload keys
                print(f"  All payload keys: {list(payload.keys())}")
                
                # Show metadata if present
                if 'metadata' in payload:
                    print(f"  Metadata: {json.dumps(payload['metadata'], indent=4)}")
                
                # Show full payload for debugging
                if not memory_content or memory_content == "No content found":
                    print(f"  Full payload: {json.dumps(payload, indent=4)}")
                
                print()
                
        else:
            print(f"❌ Failed to query Qdrant: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error checking mem0 directly: {e}")


async def main():
    """Run all memory checks."""
    print("🔍 AI App Factory Detailed Memory Inspection")
    print("=" * 80)
    
    # Load environment variables
    from dotenv import load_dotenv
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        load_dotenv(env_path)
        print(f"✅ Loaded environment from {env_path}")
    
    # Direct API check first
    check_mem0_direct()
    
    # Then try MCP tools
    await check_mem0_via_mcp()
    await check_graphiti_via_mcp()
    
    print("\n" + "=" * 80)
    print("✅ Detailed memory inspection complete!")


if __name__ == "__main__":
    asyncio.run(main())