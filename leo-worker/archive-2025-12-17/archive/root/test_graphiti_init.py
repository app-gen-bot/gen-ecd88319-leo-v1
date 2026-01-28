#!/usr/bin/env python3
"""Initialize and test Graphiti properly."""

import os
import asyncio
from datetime import datetime, timezone
from dotenv import load_dotenv

# Load environment
load_dotenv()

# Import our patched driver
from patched_neo4j_driver import PatchedNeo4jDriver

async def test_graphiti_init():
    """Initialize and test Graphiti."""
    
    print("\n🔍 Initializing Graphiti with Schema")
    print("=" * 80)
    
    try:
        from graphiti_core import Graphiti
        
        # Get credentials
        neo4j_uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        neo4j_user = os.getenv("NEO4J_USER", "neo4j")
        neo4j_password = os.getenv("NEO4J_PASSWORD", "cc-core-password")
        
        print(f"Creating patched driver...")
        
        # Create patched driver
        driver = PatchedNeo4jDriver(
            uri=neo4j_uri,
            user=neo4j_user,
            password=neo4j_password
        )
        
        # Initialize Graphiti with patched driver
        graphiti = Graphiti(graph_driver=driver)
        
        print("✅ Connected to Graphiti")
        
        # Initialize the database schema
        print("\n🔧 Initializing database schema...")
        await graphiti.build_indices_and_constraints()
        print("✅ Database indices and constraints created")
        
        # Add an episode
        print("\n📝 Adding episode...")
        
        result = await graphiti.add_episode(
            name="First Episode",
            episode_body="This is the first episode in our knowledge graph. It tests the initialization.",
            source_description="Initialization Test",
            reference_time=datetime.now(timezone.utc)
        )
        
        print(f"✅ Episode added successfully!")
        if hasattr(result, 'episode') and result.episode:
            print(f"   Episode UUID: {result.episode.uuid}")
            print(f"   Entities extracted: {len(result.entity_nodes) if hasattr(result, 'entity_nodes') else 0}")
        
        # Try a search
        print("\n🔍 Testing search...")
        search_results = await graphiti.search(
            query="first episode knowledge",
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
        print("\n✅ Graphiti initialized and tested successfully!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_graphiti_init())