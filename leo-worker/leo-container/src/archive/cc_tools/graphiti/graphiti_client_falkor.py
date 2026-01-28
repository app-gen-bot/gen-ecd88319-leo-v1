"""
Graphiti Client Wrapper for FalkorDB

Provides a simplified interface to Graphiti using FalkorDB as the backend.
"""

import os
import json
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timezone
import asyncio

try:
    from ..common.logging_utils import setup_mcp_server_logging
    logger = setup_mcp_server_logging("graphiti.client")
except ImportError:
    import logging
    logger = logging.getLogger("graphiti.client")

try:
    from graphiti_core import Graphiti
    from graphiti_core.nodes import EntityNode, EpisodicNode
    from graphiti_core.edges import EntityEdge, EpisodicEdge
    from graphiti_core.embedder import OpenAIEmbedder
    from graphiti_core.driver.falkordb_driver import FalkorDriver
    GRAPHITI_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Graphiti import error: {e}")
    GRAPHITI_AVAILABLE = False


class GraphitiClient:
    """Wrapper for Graphiti operations with FalkorDB backend"""
    
    def __init__(self, host: str = "localhost", port: int = 6379):
        self.host = host
        self.port = port
        self.graphiti = None
        self.logger = logger
        
    async def initialize(self):
        """Initialize Graphiti client with FalkorDB"""
        try:
            if not GRAPHITI_AVAILABLE:
                raise ImportError("graphiti_core not available")
            
            # Initialize embedder (requires OpenAI API key)
            openai_key = os.getenv("OPENAI_API_KEY")
            if not openai_key:
                logger.warning("OpenAI API key not found, embeddings will not work")
                embedder = None
            else:
                from graphiti_core.embedder.openai import OpenAIEmbedderConfig
                embedder_config = OpenAIEmbedderConfig()
                embedder = OpenAIEmbedder(config=embedder_config)
            
            # Create FalkorDB driver
            driver = FalkorDriver(
                host=self.host,
                port=self.port
            )
            
            # Initialize Graphiti with FalkorDB driver
            self.graphiti = Graphiti(
                graph_driver=driver,
                embedder=embedder
            )
            
            # Build indices if needed
            try:
                await self.graphiti.build_indices_and_constraints()
                logger.info("Built indices and constraints")
            except Exception as e:
                # Indices might already exist
                logger.debug(f"Indices might already exist: {e}")
            
            logger.info("Graphiti client initialized successfully with FalkorDB")
            
        except Exception as e:
            logger.error(f"Failed to initialize Graphiti: {e}")
            raise
    
    async def close(self):
        """Close connections"""
        if self.graphiti:
            await self.graphiti.close()
    
    async def add_episode(
        self,
        content: str,
        name: str,
        episode_type: str = "text",
        metadata: Optional[Dict[str, Any]] = None,
        source_description: str = "AI Assistant",
        group_id: str = "default"
    ) -> str:
        """
        Add an episode to the graph.
        
        Episodes represent events or interactions that contain entities.
        """
        try:
            if GRAPHITI_AVAILABLE:
                from graphiti_core.nodes import EpisodeType
                
                # Map episode_type to valid enum
                episode_source = EpisodeType.text  # default
                if episode_type.lower() in ["message", "msg"]:
                    episode_source = EpisodeType.message
                elif episode_type.lower() == "json":
                    episode_source = EpisodeType.json
                
                # Add to graph using new API
                result = await self.graphiti.add_episode(
                    name=name,
                    episode_body=content,
                    source_description=source_description,
                    reference_time=datetime.now(timezone.utc),
                    source=episode_source,
                    group_id=group_id
                )
                
                logger.info(f"Added episode: {name}")
                
                # The result is now AddEpisodeResults object
                if hasattr(result, 'episode') and hasattr(result.episode, 'uuid'):
                    return result.episode.uuid
                elif hasattr(result, 'episode_uuid'):
                    return result.episode_uuid
                else:
                    return str(result)
            else:
                raise ImportError("Graphiti not available")
            
        except Exception as e:
            logger.error(f"Failed to add episode: {e}")
            raise
    
    async def add_entity(
        self,
        name: str,
        entity_type: str,
        summary: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """Add an entity to the graph"""
        try:
            entity = EntityNode(
                name=name,
                label=entity_type,
                summary=summary or f"{entity_type}: {name}",
                created_at=datetime.now(timezone.utc),
                custom_properties=metadata or {}
            )
            
            # Add to graph
            result = await self.graphiti.add_entity(entity)
            
            logger.info(f"Added entity: {entity_type}:{name}")
            return result.uuid if hasattr(result, 'uuid') else str(result)
            
        except Exception as e:
            logger.error(f"Failed to add entity: {e}")
            raise
    
    async def search(
        self,
        query: str,
        limit: int = 10,
        entity_types: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """Search the graph using natural language"""
        try:
            results = await self.graphiti.search(
                query=query,
                num_results=limit
            )
            
            # Convert results to dictionaries
            formatted_results = []
            for result in results:
                formatted_result = {
                    "name": getattr(result, 'name', ''),
                    "fact": getattr(result, 'fact', ''),
                    "score": getattr(result, 'score', 1.0),
                }
                if hasattr(result, 'uuid'):
                    formatted_result['uuid'] = result.uuid
                formatted_results.append(formatted_result)
            
            logger.info(f"Search for '{query}' returned {len(formatted_results)} results")
            return formatted_results
            
        except Exception as e:
            logger.error(f"Search failed: {e}")
            return []
    
    async def get_graph_stats(self) -> Dict[str, Any]:
        """Get statistics about the graph"""
        try:
            # For FalkorDB, we'll use direct queries
            # This is a simplified version - expand as needed
            stats = {
                "backend": "FalkorDB",
                "host": self.host,
                "port": self.port,
                "status": "connected"
            }
            
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get graph stats: {e}")
            return {"error": str(e)}