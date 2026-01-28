#!/usr/bin/env python3
"""Test Graphiti following official documentation."""

import os
import asyncio
from datetime import datetime, timezone
from dotenv import load_dotenv

# Load environment
load_dotenv()

async def test_graphiti_official():
    """Test Graphiti using the official approach."""
    
    print("\n🔍 Testing Graphiti (Official Approach)")
    print("=" * 80)
    
    try:
        from graphiti_core import Graphiti
        
        # Get credentials
        neo4j_uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        neo4j_user = os.getenv("NEO4J_USER", "neo4j")
        neo4j_password = os.getenv("NEO4J_PASSWORD", "cc-core-password")
        
        print(f"Connecting to: {neo4j_uri}")
        print(f"User: {neo4j_user}")
        
        # Initialize Graphiti the simple way
        graphiti = Graphiti(
            neo4j_uri,
            neo4j_user,
            neo4j_password
        )
        
        print("✅ Connected to Graphiti")
        
        # Add an episode
        print("\n📝 Adding episode...")
        
        result = await graphiti.add_episode(
            name="Test Episode",
            episode_body="This is a test episode to verify Graphiti is working properly.",
            source_description="Test Script",
            reference_time=datetime.now(timezone.utc)
        )
        
        print(f"✅ Episode added successfully!")
        print(f"   Episode UUID: {result.episode.uuid if hasattr(result, 'episode') else 'N/A'}")
        
        # Try a search
        print("\n🔍 Searching for 'test'...")
        search_results = await graphiti.search(
            query="test episode",
            num_results=5
        )
        
        print(f"✅ Found {len(search_results)} results")
        for i, result in enumerate(search_results[:3]):
            print(f"   {i+1}. {result.name}: {result.fact[:50]}...")
        
        # Close connection
        await graphiti.close()
        print("\n✅ Test completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_graphiti_official())