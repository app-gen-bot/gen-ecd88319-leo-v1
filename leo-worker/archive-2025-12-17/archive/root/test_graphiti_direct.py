#!/usr/bin/env python3
"""Test Graphiti directly without MCP."""

import os
import asyncio
from datetime import datetime, timezone
from dotenv import load_dotenv

# Load environment
load_dotenv()

async def test_graphiti_direct():
    """Test Graphiti Python API directly."""
    
    print("\n🔍 Testing Graphiti Direct API")
    print("=" * 80)
    
    try:
        from graphiti_core import Graphiti
        from graphiti_core.nodes import EpisodicNode
        from graphiti_core.embedder import OpenAIEmbedder
        
        print("✅ Imported graphiti_core successfully")
        
        # Initialize components
        neo4j_uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        neo4j_user = os.getenv("NEO4J_USER", "neo4j")
        neo4j_password = os.getenv("NEO4J_PASSWORD", "cc-core-password")
        openai_key = os.getenv("OPENAI_API_KEY")
        
        print(f"\nConfiguration:")
        print(f"  Neo4j URI: {neo4j_uri}")
        print(f"  Neo4j User: {neo4j_user}")
        print(f"  OpenAI Key: {'Set' if openai_key else 'Not set'}")
        
        # Create embedder with proper config
        if openai_key:
            from graphiti_core.embedder.openai import OpenAIEmbedderConfig
            embedder_config = OpenAIEmbedderConfig()
            embedder = OpenAIEmbedder(config=embedder_config)
        else:
            embedder = None
        
        # Monkey patch the DEFAULT_DATABASE constant
        import graphiti_core.nodes
        graphiti_core.nodes.DEFAULT_DATABASE = "neo4j"
        
        # Create Graphiti instance with proper parameters
        graphiti = Graphiti(
            uri=neo4j_uri,
            user=neo4j_user,
            password=neo4j_password,
            embedder=embedder
        )
        print("✅ Created Graphiti instance")
        
        # Create and add an episode
        from graphiti_core.nodes import EpisodeType
        
        episode_name = "Test Episode Direct"
        episode_content = "This is a test episode created directly through the Python API"
        
        print(f"\n📝 Adding episode: {episode_name}")
        
        # Add episode with new API
        result = await graphiti.add_episode(
            name=episode_name,
            episode_body=episode_content,
            source_description="Direct API test",
            reference_time=datetime.now(timezone.utc),
            source=EpisodeType.text,
            group_id="test_group"
        )
        
        print(f"✅ Added episode successfully!")
        print(f"   Result: {result}")
        
        # Query to verify using graphiti's driver
        print("\n📊 Checking database contents...")
        
        # Get episodes through Graphiti API if available
        try:
            # Use graphiti's internal driver
            result = await graphiti.get_episodes(limit=10)
            print(f"✅ Found {len(result)} episodes through Graphiti API")
            for ep in result[:3]:  # Show first 3
                print(f"   - {ep.name}: {ep.content[:50]}...")
        except Exception as e:
            print(f"⚠️ Could not get episodes through API: {e}")
        
        # Close graphiti connection
        await graphiti.close()
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_graphiti_direct())