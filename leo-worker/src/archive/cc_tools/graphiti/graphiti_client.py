"""
Graphiti Client Wrapper

Provides a simplified interface to Graphiti for knowledge graph operations.
"""

import os
import json
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timezone
import asyncio

from neo4j import AsyncGraphDatabase

# Conditional import for testing
try:
    from ..common.logging_utils import setup_mcp_server_logging
    logger = setup_mcp_server_logging("graphiti.client")
except ImportError:
    # Fallback for testing
    import logging
    logger = logging.getLogger("graphiti.client")

try:
    from graphiti_core import Graphiti
    from graphiti_core.nodes import EntityNode, EpisodicNode
    from graphiti_core.edges import EntityEdge, EpisodicEdge
    from graphiti_core.embedder import OpenAIEmbedder
    GRAPHITI_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Graphiti import error: {e}")
    GRAPHITI_AVAILABLE = False
    # Define placeholder classes
    class Graphiti:
        pass
    class EntityNode:
        pass
    class EpisodicNode:
        pass
    class EntityEdge:
        pass
    class EpisodicEdge:
        pass
    class OpenAIEmbedder:
        pass


class GraphitiClient:
    """Wrapper for Graphiti operations"""
    
    def __init__(self, neo4j_uri: str, neo4j_user: str, neo4j_password: str):
        self.neo4j_uri = neo4j_uri
        self.neo4j_user = neo4j_user
        self.neo4j_password = neo4j_password
        self.driver = None
        self.graphiti = None
        self.logger = logger
        
    async def initialize(self):
        """Initialize Graphiti client"""
        try:
            # Initialize embedder (requires OpenAI API key)
            openai_key = os.getenv("OPENAI_API_KEY")
            if not openai_key:
                logger.warning("OpenAI API key not found, embeddings will not work")
                embedder = None
            else:
                if GRAPHITI_AVAILABLE:
                    from graphiti_core.embedder.openai import OpenAIEmbedderConfig
                    embedder_config = OpenAIEmbedderConfig()
                    embedder = OpenAIEmbedder(config=embedder_config)
                else:
                    embedder = None
            
            # Initialize Graphiti with new API
            self.graphiti = Graphiti(
                uri=self.neo4j_uri,
                user=self.neo4j_user,
                password=self.neo4j_password,
                embedder=embedder
            )
            
            logger.info("Graphiti client initialized successfully")
            
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
    
    async def add_entity_relation(
        self,
        source_name: str,
        target_name: str,
        relation_type: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Add a relation between entities"""
        try:
            edge = EntityEdge(
                source_node_name=source_name,
                target_node_name=target_name,
                label=relation_type,
                created_at=datetime.now(timezone.utc),
                custom_properties=metadata or {}
            )
            
            # Add to graph
            await self.graphiti.add_entity_edge(edge)
            
            logger.info(f"Added relation: {source_name} -{relation_type}-> {target_name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to add relation: {e}")
            return False
    
    async def search(
        self,
        query: str,
        limit: int = 10,
        entity_types: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """Search the graph using natural language"""
        try:
            # Use dictionary config instead of SearchConfig class
            config = {
                "limit": limit,
                "labels": entity_types or []
            }
            
            results = await self.graphiti.search(
                query=query,
                **config  # Pass as kwargs
            )
            
            # Convert results to dictionaries
            formatted_results = []
            for result in results:
                formatted_results.append({
                    "name": result.name,
                    "type": result.label,
                    "summary": result.summary,
                    "score": getattr(result, 'score', 1.0),
                    "metadata": result.custom_properties
                })
            
            logger.info(f"Search for '{query}' returned {len(formatted_results)} results")
            return formatted_results
            
        except Exception as e:
            logger.error(f"Search failed: {e}")
            return []
    
    async def get_entity_context(
        self,
        entity_name: str,
        max_depth: int = 2
    ) -> Dict[str, Any]:
        """Get entity with its relationships and connected entities"""
        try:
            # Query for entity and relationships
            query = """
            MATCH (e:Entity {name: $name})
            OPTIONAL MATCH path = (e)-[r*1..%d]-(connected)
            RETURN e, collect(distinct r) as relationships, collect(distinct connected) as connected_entities
            """ % max_depth
            
            async with self.driver.session() as session:
                result = await session.run(query, name=entity_name)
                record = await result.single()
                
                if not record:
                    return {}
                
                entity = record["e"]
                relationships = record["relationships"]
                connected = record["connected_entities"]
                
                return {
                    "entity": dict(entity),
                    "relationships": [dict(r) for r in relationships] if relationships else [],
                    "connected_entities": [dict(c) for c in connected] if connected else []
                }
                
        except Exception as e:
            logger.error(f"Failed to get entity context: {e}")
            return {}
    
    async def find_paths(
        self,
        source_name: str,
        target_name: str,
        max_length: int = 4
    ) -> List[List[Dict[str, Any]]]:
        """Find paths between two entities"""
        try:
            query = """
            MATCH path = shortestPath((source:Entity {name: $source})-[*..%d]-(target:Entity {name: $target}))
            RETURN path
            LIMIT 5
            """ % max_length
            
            async with self.driver.session() as session:
                result = await session.run(
                    query,
                    source=source_name,
                    target=target_name
                )
                
                paths = []
                async for record in result:
                    path = record["path"]
                    path_nodes = []
                    
                    # Extract nodes and relationships
                    for i, node in enumerate(path.nodes):
                        path_nodes.append({
                            "name": node.get("name"),
                            "type": list(node.labels)[0] if node.labels else "Unknown"
                        })
                        
                        if i < len(path.relationships):
                            rel = path.relationships[i]
                            path_nodes.append({
                                "relation": rel.type,
                                "properties": dict(rel)
                            })
                    
                    paths.append(path_nodes)
                
                logger.info(f"Found {len(paths)} paths between {source_name} and {target_name}")
                return paths
                
        except Exception as e:
            logger.error(f"Failed to find paths: {e}")
            return []
    
    async def get_graph_stats(self) -> Dict[str, Any]:
        """Get statistics about the graph"""
        try:
            stats = {}
            
            async with self.driver.session() as session:
                # Count entities by type
                entity_query = """
                MATCH (n)
                RETURN labels(n)[0] as type, count(n) as count
                ORDER BY count DESC
                """
                result = await session.run(entity_query)
                entity_counts = {}
                async for record in result:
                    entity_counts[record["type"]] = record["count"]
                
                stats["entity_counts"] = entity_counts
                stats["total_entities"] = sum(entity_counts.values())
                
                # Count relationships
                rel_query = """
                MATCH ()-[r]->()
                RETURN type(r) as type, count(r) as count
                ORDER BY count DESC
                """
                result = await session.run(rel_query)
                rel_counts = {}
                async for record in result:
                    rel_counts[record["type"]] = record["count"]
                
                stats["relationship_counts"] = rel_counts
                stats["total_relationships"] = sum(rel_counts.values())
                
                # Get most connected entities
                connected_query = """
                MATCH (n)
                WITH n, size((n)-[]-()) as degree
                RETURN n.name as name, labels(n)[0] as type, degree
                ORDER BY degree DESC
                LIMIT 10
                """
                result = await session.run(connected_query)
                most_connected = []
                async for record in result:
                    most_connected.append({
                        "name": record["name"],
                        "type": record["type"],
                        "connections": record["degree"]
                    })
                
                stats["most_connected"] = most_connected
                
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get graph stats: {e}")
            return {}
    
    async def run_custom_query(self, cypher_query: str, parameters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Run a custom Cypher query"""
        try:
            async with self.driver.session() as session:
                result = await session.run(cypher_query, parameters or {})
                records = []
                async for record in result:
                    records.append(dict(record))
                return records
        except Exception as e:
            logger.error(f"Failed to run custom query: {e}")
            raise