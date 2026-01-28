#!/usr/bin/env python3
"""Test mem0 database connections directly."""

import os
import asyncio
from pathlib import Path
from dotenv import load_dotenv
from mem0 import Memory
from qdrant_client import QdrantClient
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables
env_path = Path(__file__).parent / ".env"
logger.info(f"Loading .env from: {env_path}")
load_dotenv(env_path, override=True)

# Check environment
logger.info("Environment Variables:")
for key in ["OPENAI_API_KEY", "NEO4J_URI", "NEO4J_USER", "NEO4J_PASSWORD", "QDRANT_URL"]:
    value = os.getenv(key)
    if key == "OPENAI_API_KEY" and value:
        logger.info(f"  {key}: set (length: {len(value)})")
    else:
        logger.info(f"  {key}: {value if value else 'NOT SET'}")

async def test_qdrant_connection():
    """Test direct Qdrant connection."""
    try:
        logger.info("\n=== Testing Qdrant Connection ===")
        qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
        logger.info(f"Connecting to Qdrant at: {qdrant_url}")
        
        # Extract host and port
        host = qdrant_url.replace("http://", "").replace("https://", "").split(":")[0]
        port = int(qdrant_url.split(":")[-1])
        
        client = QdrantClient(host=host, port=port)
        
        # List collections
        collections = client.get_collections()
        logger.info(f"Qdrant collections: {collections}")
        
        # Try to create a test collection
        from qdrant_client.models import Distance, VectorParams
        
        test_collection = "test_app_factory"
        try:
            client.create_collection(
                collection_name=test_collection,
                vectors_config=VectorParams(size=1536, distance=Distance.COSINE)
            )
            logger.info(f"Created test collection: {test_collection}")
            
            # Clean up
            client.delete_collection(test_collection)
            logger.info(f"Deleted test collection: {test_collection}")
        except Exception as e:
            logger.error(f"Error creating test collection: {e}")
            
    except Exception as e:
        logger.error(f"Qdrant connection failed: {e}")
        import traceback
        traceback.print_exc()

async def test_mem0_initialization():
    """Test mem0 initialization."""
    try:
        logger.info("\n=== Testing Mem0 Initialization ===")
        
        # Set OpenAI key
        openai_key = os.getenv("OPENAI_API_KEY")
        if not openai_key:
            logger.error("OPENAI_API_KEY not set!")
            return
            
        os.environ["OPENAI_API_KEY"] = openai_key
        
        # Configure mem0
        config = {
            "vector_store": {
                "provider": "qdrant",
                "config": {
                    "host": "localhost",
                    "port": 6333,
                    "collection_name": "app_factory_memories"
                }
            },
            "llm": {
                "provider": "openai",
                "config": {
                    "model": "gpt-4o-mini",
                    "temperature": 0
                }
            },
            "embedder": {
                "provider": "openai",
                "config": {
                    "model": "text-embedding-3-small"
                }
            }
        }
        
        logger.info(f"Mem0 config: {config}")
        
        # Initialize mem0
        memory = Memory.from_config(config)
        logger.info("Mem0 initialized successfully")
        
        # Try to add a memory
        user_id = "test_user"
        result = memory.add(
            "Test memory: App Factory context awareness is working",
            user_id=user_id,
            metadata={"context": "test", "timestamp": "2025-07-10"}
        )
        logger.info(f"Memory added: {result}")
        
        # Search for the memory
        search_results = memory.search("context awareness", user_id=user_id)
        logger.info(f"Search results: {search_results}")
        
        # Get all memories
        all_memories = memory.get_all(user_id=user_id)
        logger.info(f"All memories for {user_id}: {all_memories}")
        
    except Exception as e:
        logger.error(f"Mem0 initialization failed: {e}")
        import traceback
        traceback.print_exc()

async def main():
    """Run all tests."""
    await test_qdrant_connection()
    await test_mem0_initialization()

if __name__ == "__main__":
    asyncio.run(main())