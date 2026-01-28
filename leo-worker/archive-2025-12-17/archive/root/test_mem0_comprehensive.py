#!/usr/bin/env python3
"""Comprehensive test of mem0 functionality."""

import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment
load_dotenv()

def test_mem0_direct():
    """Test mem0 directly without MCP."""
    
    print("\n🔍 Testing mem0 Direct API")
    print("=" * 80)
    
    try:
        from mem0 import Memory
        
        # Use the same configuration approach as the MCP server
        qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
        qdrant_collection = os.getenv("QDRANT_COLLECTION", "app_factory_memories")
        
        # Extract host and port from URL
        qdrant_host = qdrant_url.replace("http://", "").replace("https://", "")
        if ":" in qdrant_host:
            host, port = qdrant_host.split(":")
            port = int(port)
        else:
            host = qdrant_host
            port = 6333
        
        # Create config dict like the server does
        config = {
            "vector_store": {
                "provider": "qdrant",
                "config": {
                    "collection_name": qdrant_collection,
                    "host": host,
                    "port": port
                }
            }
        }
        
        print("📊 Configuration:")
        print(f"  Qdrant Host: {host}:{port}")
        print(f"  Collection: {qdrant_collection}")
        print(f"  OpenAI Key: {'Set' if os.getenv('OPENAI_API_KEY') else 'Not set'}")
        
        # Create memory instance using from_config
        memory = Memory.from_config(config)
        print("\n✅ Memory instance created")
        
        # Test 1: Add a memory
        print("\n📝 Test 1: Adding memory...")
        user_id = "test_user_123"
        test_memory = f"The App Factory uses FalkorDB for graphiti knowledge graph storage as of {datetime.now().strftime('%Y-%m-%d')}"
        
        result = memory.add(test_memory, user_id=user_id)
        print(f"✅ Added memory: {result}")
        
        # Test 2: Search memories
        print("\n🔍 Test 2: Searching memories...")
        search_results = memory.search("FalkorDB graphiti", user_id=user_id)
        
        # Check the structure of search results
        if isinstance(search_results, dict) and 'results' in search_results:
            results = search_results['results']
        else:
            results = search_results
            
        print(f"Found {len(results)} results:")
        for i, result in enumerate(results[:3] if isinstance(results, list) else []):
            memory_text = result.get('text', result.get('memory', 'N/A'))
            print(f"  {i+1}. {memory_text[:100]}...")
            if 'score' in result:
                print(f"     Score: {result.get('score', 'N/A')}")
        
        # Test 3: Get all memories for user
        print("\n📋 Test 3: Getting all memories for user...")
        all_memories = memory.get_all(user_id=user_id)
        
        # Handle response format
        if isinstance(all_memories, dict) and 'results' in all_memories:
            memories = all_memories['results']
        else:
            memories = all_memories
            
        print(f"Total memories for user: {len(memories) if isinstance(memories, list) else 0}")
        if isinstance(memories, list):
            for i, mem in enumerate(memories[:5]):
                memory_text = mem.get('text', mem.get('memory', 'N/A'))
                print(f"  {i+1}. {memory_text[:100]}...")
        
        # Test 4: Update a memory
        if memories and isinstance(memories, list) and len(memories) > 0:
            print("\n✏️ Test 4: Updating a memory...")
            memory_id = memories[0].get('id')
            if memory_id:
                memory_text = memories[0].get('text', memories[0].get('memory', ''))
                updated = memory.update(memory_id, "UPDATED: " + memory_text)
                print(f"✅ Updated memory: {updated}")
        
        # Test 5: Add another memory and search
        print("\n📝 Test 5: Adding another memory...")
        another_memory = "mem0 is working correctly with Qdrant vector database for memory storage"
        result2 = memory.add(another_memory, user_id=user_id)
        print(f"✅ Added: {result2}")
        
        # Search again
        search_results2 = memory.search("mem0 Qdrant working", user_id=user_id)
        if isinstance(search_results2, dict) and 'results' in search_results2:
            results2 = search_results2['results']
        else:
            results2 = search_results2
        print(f"\n🔍 Search for 'mem0 Qdrant working': {len(results2) if isinstance(results2, list) else 0} results")
        
        print("\n✅ mem0 is working correctly!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    test_mem0_direct()