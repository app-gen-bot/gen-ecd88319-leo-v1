#!/usr/bin/env python3
"""Test Graphiti with FalkorDB."""

import os
import asyncio
from datetime import datetime, timezone
from dotenv import load_dotenv

# Load environment
load_dotenv()

async def test_graphiti_falkordb():
    """Test Graphiti with FalkorDB."""
    
    print("\n🔍 Testing Graphiti with FalkorDB")
    print("=" * 80)
    
    try:
        from graphiti_core import Graphiti
        from graphiti_core.driver.falkordb_driver import FalkorDriver
        
        # FalkorDB connection details
        falkor_host = "localhost"
        falkor_port = 6379
        
        print(f"Connecting to FalkorDB at: {falkor_host}:{falkor_port}")
        
        # Create FalkorDB driver
        driver = FalkorDriver(
            host=falkor_host,
            port=falkor_port
        )
        
        # Initialize Graphiti with FalkorDB driver
        graphiti = Graphiti(graph_driver=driver)
        
        print("✅ Connected to Graphiti with FalkorDB")
        
        # Initialize the database schema
        print("\n🔧 Initializing database schema...")
        await graphiti.build_indices_and_constraints()
        print("✅ Database indices and constraints created")
        
        # Add an episode
        print("\n📝 Adding episode...")
        
        result = await graphiti.add_episode(
            name="FalkorDB Test Episode",
            episode_body="This is a test episode using FalkorDB as the graph database backend. FalkorDB supports the default_db database name that graphiti expects.",
            source_description="FalkorDB Test",
            reference_time=datetime.now(timezone.utc)
        )
        
        print(f"✅ Episode added successfully!")
        if hasattr(result, 'episode') and result.episode:
            print(f"   Episode UUID: {result.episode.uuid}")
            print(f"   Entities extracted: {len(result.entity_nodes) if hasattr(result, 'entity_nodes') else 0}")
        
        # Try a search
        print("\n🔍 Testing search...")
        search_results = await graphiti.search(
            query="FalkorDB test episode",
            num_results=5
        )
        
        print(f"✅ Search returned {len(search_results)} results")
        for i, result in enumerate(search_results[:3]):
            if hasattr(result, 'fact'):
                print(f"   {i+1}. {result.fact[:100]}...")
            else:
                print(f"   {i+1}. {result}")
        
        # Close connection
        await graphiti.close()
        print("\n✅ Graphiti with FalkorDB tested successfully!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_graphiti_falkordb())