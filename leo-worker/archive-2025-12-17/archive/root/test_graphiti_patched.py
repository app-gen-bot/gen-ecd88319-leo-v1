#!/usr/bin/env python3
"""Test Graphiti with patched driver."""

import os
import asyncio
from datetime import datetime, timezone
from dotenv import load_dotenv

# Load environment
load_dotenv()

# Import our patched driver
from patched_neo4j_driver import PatchedNeo4jDriver

async def test_graphiti_patched():
    """Test Graphiti with patched driver."""
    
    print("\n🔍 Testing Graphiti with Patched Driver")
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
        
        print("✅ Connected to Graphiti with patched driver")
        
        # Add an episode
        print("\n📝 Adding episode...")
        
        result = await graphiti.add_episode(
            name="Test Episode with Patched Driver",
            episode_body="This is a test episode to verify the patched driver works.",
            source_description="Patched Test Script",
            reference_time=datetime.now(timezone.utc)
        )
        
        print(f"✅ Episode added successfully!")
        if hasattr(result, 'episode') and hasattr(result.episode, 'uuid'):
            print(f"   Episode UUID: {result.episode.uuid}")
        
        # Close connection
        await graphiti.close()
        print("\n✅ Test completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_graphiti_patched())