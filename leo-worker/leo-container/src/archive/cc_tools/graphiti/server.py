"""
Graphiti MCP Server

Advanced graph intelligence for code understanding and impact analysis.
"""

import json
import os
import asyncio
from typing import Dict, Any, List, Optional
from pathlib import Path

from fastmcp import FastMCP
from ..common.logging_utils import setup_mcp_server_logging
from .entity_resolver import EntityResolver, EntityType, UnifiedEntity
from .graphiti_client_falkor import GraphitiClient
from .impact_analyzer import ImpactAnalyzer, ChangeType, ImpactLevel

# Setup logging
logger = setup_mcp_server_logging("graphiti")
logger.info("[SERVER_INIT] Graphiti MCP server module loaded")

# Create MCP server instance
mcp = FastMCP("Graphiti")

# Initialize components
entity_resolver = EntityResolver()
impact_analyzer = ImpactAnalyzer()
graphiti_client = None


async def get_graphiti_client() -> GraphitiClient:
    """Get or create Graphiti client"""
    global graphiti_client
    
    if graphiti_client is None:
        # Get FalkorDB connection details from environment
        falkor_host = os.getenv("FALKORDB_HOST", "localhost")
        falkor_port = int(os.getenv("FALKORDB_PORT", "6379"))
        
        graphiti_client = GraphitiClient(host=falkor_host, port=falkor_port)
        await graphiti_client.initialize()
    
    return graphiti_client


@mcp.tool()
async def add_knowledge_episode(
    content: str,
    episode_name: str,
    context: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
    group_id: Optional[str] = None
) -> str:
    """
    Add a knowledge episode to the graph.
    
    Episodes represent events, decisions, or interactions that contain
    entities and relationships. Graphiti will automatically extract
    entities and relationships from the content.
    
    Args:
        content: The episode content (natural language description)
        episode_name: Name for this episode
        context: Optional context (e.g., "architecture:auth", "decision:database")
        metadata: Optional metadata dictionary
        
    Returns:
        JSON with episode ID and extracted entities
    """
    logger.info(f"[ADD_EPISODE] Adding episode: {episode_name}")
    
    try:
        client = await get_graphiti_client()
        
        # Add context to metadata
        if metadata is None:
            metadata = {}
        if context:
            metadata["context"] = context
        
        # Add episode to Graphiti
        episode_id = await client.add_episode(
            content=content,
            name=episode_name,
            metadata=metadata,
            group_id=group_id or "default"
        )
        
        # Extract entities for our resolver
        entities = entity_resolver.extract_entities_from_text(content, context)
        
        # Add entities to graph
        added_entities = []
        for entity in entities:
            try:
                entity_id = await client.add_entity(
                    name=entity.name,
                    entity_type=entity.entity_type.value,
                    summary=f"{entity.entity_type.value}: {entity.name}",
                    metadata=entity.attributes
                )
                entity.graph_node_id = entity_id
                added_entities.append(entity)
            except Exception as e:
                logger.warning(f"Failed to add entity {entity.name}: {e}")
        
        # Infer and add relationships
        relationships = entity_resolver.infer_relationships(entities)
        added_relations = []
        
        for source, rel_type, target, confidence in relationships:
            if confidence > 0.7:  # Only add high-confidence relationships
                success = await client.add_entity_relation(
                    source_name=source.split(":")[-1],  # Extract name from unique_id
                    target_name=target.split(":")[-1],
                    relation_type=rel_type,
                    metadata={"confidence": confidence}
                )
                if success:
                    added_relations.append({
                        "source": source,
                        "type": rel_type,
                        "target": target,
                        "confidence": confidence
                    })
        
        result = {
            "episode_id": episode_id,
            "episode_name": episode_name,
            "entities_extracted": len(entities),
            "entities_added": len(added_entities),
            "relationships_added": len(added_relations),
            "entities": [e.to_dict() for e in added_entities],
            "relationships": added_relations
        }
        
        logger.info(f"[ADD_EPISODE] Successfully added episode with {len(added_entities)} entities")
        return json.dumps(result, indent=2)
        
    except Exception as e:
        logger.error(f"[ADD_EPISODE] Error: {e}", exc_info=True)
        return json.dumps({"error": str(e)})


@mcp.tool()
async def resolve_memory_to_graph(
    memory_content: str,
    memory_id: str,
    memory_context: Optional[str] = None,
    add_to_graph: bool = True
) -> str:
    """
    Resolve memory content to graph entities.
    
    This bridges the memory system (mem0) with the graph database by
    extracting entities from memories and optionally adding them to the graph.
    
    Args:
        memory_content: Content from memory system
        memory_id: ID of the memory
        memory_context: Context from memory (e.g., "file:auth.py")
        add_to_graph: Whether to add entities to graph
        
    Returns:
        JSON with resolved entities and relationships
    """
    logger.info(f"[RESOLVE_MEMORY] Resolving memory {memory_id}")
    
    try:
        # Resolve entities
        memory_metadata = {
            "context": memory_context,
            "memory_id": memory_id
        }
        
        entities = entity_resolver.resolve_memory_to_graph(
            memory_content,
            memory_id,
            memory_metadata
        )
        
        added_to_graph = []
        
        if add_to_graph:
            client = await get_graphiti_client()
            
            for entity in entities:
                try:
                    entity_id = await client.add_entity(
                        name=entity.name,
                        entity_type=entity.entity_type.value,
                        metadata=entity.attributes
                    )
                    entity.graph_node_id = entity_id
                    added_to_graph.append(entity)
                except Exception as e:
                    logger.warning(f"Failed to add entity to graph: {e}")
        
        # Infer relationships
        relationships = entity_resolver.infer_relationships(entities)
        
        result = {
            "memory_id": memory_id,
            "entities_found": len(entities),
            "entities_added_to_graph": len(added_to_graph),
            "entities": [e.to_dict() for e in entities],
            "inferred_relationships": [
                {
                    "source": rel[0],
                    "type": rel[1],
                    "target": rel[2],
                    "confidence": rel[3]
                }
                for rel in relationships
            ]
        }
        
        return json.dumps(result, indent=2)
        
    except Exception as e:
        logger.error(f"[RESOLVE_MEMORY] Error: {e}", exc_info=True)
        return json.dumps({"error": str(e)})


@mcp.tool()
async def search_knowledge_graph(
    query: str,
    limit: int = 10,
    entity_types: Optional[List[str]] = None
) -> str:
    """
    Search the knowledge graph using natural language.
    
    Graphiti uses embeddings to find relevant entities based on semantic similarity.
    
    Args:
        query: Natural language search query
        limit: Maximum results to return
        entity_types: Filter by entity types (e.g., ["function", "class"])
        
    Returns:
        JSON with search results
    """
    logger.info(f"[SEARCH] Searching for: {query}")
    
    try:
        client = await get_graphiti_client()
        
        results = await client.search(
            query=query,
            limit=limit,
            entity_types=entity_types
        )
        
        # Enhance results with memory connections
        enhanced_results = []
        for result in results:
            entity = entity_resolver.resolve_graph_to_memory(
                result.get("type"),
                result
            )
            
            enhanced = result.copy()
            if entity and entity.memory_id:
                enhanced["memory_id"] = entity.memory_id
                enhanced["unified"] = True
            else:
                enhanced["unified"] = False
            
            enhanced_results.append(enhanced)
        
        response = {
            "query": query,
            "total_results": len(enhanced_results),
            "results": enhanced_results
        }
        
        logger.info(f"[SEARCH] Found {len(enhanced_results)} results")
        return json.dumps(response, indent=2)
        
    except Exception as e:
        logger.error(f"[SEARCH] Error: {e}", exc_info=True)
        return json.dumps({"error": str(e)})


@mcp.tool()
async def analyze_impact(
    entity_name: str,
    change_type: str,
    entity_type: Optional[str] = None,
    max_depth: int = 3
) -> str:
    """
    Analyze the impact of a change to an entity.
    
    Uses graph relationships to understand how changes propagate through
    the codebase and identify affected components.
    
    Args:
        entity_name: Name of the entity that changed
        change_type: Type of change (added, removed, modified, signature_changed)
        entity_type: Optional entity type for disambiguation
        max_depth: Maximum depth to analyze (default: 3)
        
    Returns:
        JSON with impact analysis including affected entities and recommendations
    """
    logger.info(f"[IMPACT] Analyzing impact of {change_type} to {entity_name}")
    
    try:
        client = await get_graphiti_client()
        
        # Get entity context from graph
        context = await client.get_entity_context(entity_name, max_depth)
        
        if not context:
            return json.dumps({
                "error": f"Entity '{entity_name}' not found in graph"
            })
        
        # Parse change type
        try:
            change_enum = ChangeType(change_type.lower())
        except ValueError:
            return json.dumps({
                "error": f"Invalid change type: {change_type}. Must be one of: {[e.value for e in ChangeType]}"
            })
        
        # Analyze impact
        changed_entity = {
            "name": entity_name,
            "type": entity_type or context["entity"].get("label", "unknown")
        }
        
        impact_analysis = impact_analyzer.analyze_change_impact(
            changed_entity,
            change_enum,
            context,
            max_depth
        )
        
        # Add graph visualization hint
        if impact_analysis["summary"]["total_affected"] > 0:
            impact_analysis["visualization_hint"] = (
                f"Consider visualizing the impact graph with {impact_analysis['summary']['total_affected']} "
                f"affected nodes and {len(impact_analysis['impact_paths'])} impact paths"
            )
        
        logger.info(
            f"[IMPACT] Analysis complete - {impact_analysis['summary']['total_affected']} entities affected"
        )
        
        return json.dumps(impact_analysis, indent=2)
        
    except Exception as e:
        logger.error(f"[IMPACT] Error: {e}", exc_info=True)
        return json.dumps({"error": str(e)})


@mcp.tool()
async def find_related_entities(
    entity_name: str,
    relationship_types: Optional[List[str]] = None,
    max_distance: int = 2
) -> str:
    """
    Find entities related to a given entity.
    
    Explores the graph to find connected entities within a certain distance.
    
    Args:
        entity_name: Starting entity name
        relationship_types: Filter by relationship types (e.g., ["CALLS", "IMPORTS"])
        max_distance: Maximum graph distance to explore
        
    Returns:
        JSON with related entities grouped by distance and relationship
    """
    logger.info(f"[RELATED] Finding entities related to {entity_name}")
    
    try:
        client = await get_graphiti_client()
        
        # Build Cypher query
        if relationship_types:
            rel_filter = f"[r:{('|'.join(relationship_types))}*1..{max_distance}]"
        else:
            rel_filter = f"[r*1..{max_distance}]"
        
        query = f"""
        MATCH (start {{name: $name}})
        MATCH path = (start)-{rel_filter}-(related)
        WITH related, relationships(path) as rels, length(path) as distance
        RETURN DISTINCT 
            related.name as name,
            labels(related)[0] as type,
            distance,
            collect(DISTINCT [type(r) IN rels | type(r)]) as relationship_types
        ORDER BY distance, name
        """
        
        results = await client.run_custom_query(query, {"name": entity_name})
        
        # Group by distance
        by_distance = {}
        for record in results:
            distance = record["distance"]
            if distance not in by_distance:
                by_distance[distance] = []
            
            by_distance[distance].append({
                "name": record["name"],
                "type": record["type"],
                "relationships": record["relationship_types"][0]  # Flatten nested list
            })
        
        response = {
            "entity": entity_name,
            "max_distance": max_distance,
            "related_by_distance": by_distance,
            "total_related": sum(len(entities) for entities in by_distance.values())
        }
        
        logger.info(f"[RELATED] Found {response['total_related']} related entities")
        return json.dumps(response, indent=2)
        
    except Exception as e:
        logger.error(f"[RELATED] Error: {e}", exc_info=True)
        return json.dumps({"error": str(e)})


@mcp.tool()
async def merge_memory_and_graph() -> str:
    """
    Merge entities from memory system and graph database.
    
    Creates a unified view showing which entities exist in memory only,
    graph only, or both systems.
    
    Returns:
        JSON with merged entity statistics and recommendations
    """
    logger.info("[MERGE] Starting memory-graph merge analysis")
    
    try:
        client = await get_graphiti_client()
        
        # Get graph statistics
        graph_stats = await client.get_graph_stats()
        
        # In a real implementation, we'd also query the memory system
        # For now, we'll work with what we have in the entity resolver cache
        
        memory_entities = list(entity_resolver.entity_cache.values())
        
        # Get all graph nodes (simplified - in reality we'd paginate)
        graph_nodes = []
        if graph_stats["total_entities"] < 1000:  # Safety limit
            query = """
            MATCH (n)
            RETURN n.name as name, labels(n)[0] as type, properties(n) as properties
            LIMIT 1000
            """
            results = await client.run_custom_query(query)
            graph_nodes = [{"name": r["name"], "type": r["type"], "properties": r["properties"]} for r in results]
        
        # Merge entities
        merged = entity_resolver.merge_memory_and_graph(memory_entities, graph_nodes)
        
        # Add recommendations
        recommendations = []
        
        if merged["statistics"]["memory_only"] > 0:
            recommendations.append(
                f"Add {merged['statistics']['memory_only']} memory-only entities to graph for better relationship tracking"
            )
        
        if merged["statistics"]["graph_only"] > 0:
            recommendations.append(
                f"Consider creating memories for {merged['statistics']['graph_only']} graph-only entities to enable semantic search"
            )
        
        if merged["statistics"]["unified"] < merged["statistics"]["total_entities"] * 0.5:
            recommendations.append(
                "Low unification rate - consider running entity resolution to link memory and graph entities"
            )
        
        merged["recommendations"] = recommendations
        
        logger.info(
            f"[MERGE] Merge complete - {merged['statistics']['unified']} unified entities "
            f"out of {merged['statistics']['total_entities']} total"
        )
        
        return json.dumps(merged, indent=2)
        
    except Exception as e:
        logger.error(f"[MERGE] Error: {e}", exc_info=True)
        return json.dumps({"error": str(e)})


@mcp.tool()
async def get_graph_insights() -> str:
    """
    Get insights about the knowledge graph structure.
    
    Provides statistics, patterns, and recommendations for graph usage.
    
    Returns:
        JSON with graph statistics and insights
    """
    logger.info("[INSIGHTS] Generating graph insights")
    
    try:
        client = await get_graphiti_client()
        
        stats = await client.get_graph_stats()
        
        insights = {
            "statistics": stats,
            "patterns": [],
            "recommendations": [],
            "health_indicators": {}
        }
        
        # Analyze patterns
        if stats["total_entities"] > 0:
            # Entity distribution
            entity_counts = stats["entity_counts"]
            total = stats["total_entities"]
            
            dominant_type = max(entity_counts.items(), key=lambda x: x[1])[0]
            insights["patterns"].append(
                f"Graph is dominated by {dominant_type} entities ({entity_counts[dominant_type]}/{total})"
            )
            
            # Relationship patterns
            if stats["total_relationships"] > 0:
                rel_ratio = stats["total_relationships"] / stats["total_entities"]
                if rel_ratio < 1:
                    insights["patterns"].append("Sparse graph - many isolated entities")
                elif rel_ratio > 5:
                    insights["patterns"].append("Dense graph - highly interconnected")
                else:
                    insights["patterns"].append("Balanced graph connectivity")
            
            # Most connected analysis
            if stats.get("most_connected"):
                hub = stats["most_connected"][0]
                insights["patterns"].append(
                    f"Primary hub: {hub['name']} ({hub['type']}) with {hub['connections']} connections"
                )
        
        # Health indicators
        insights["health_indicators"] = {
            "has_entities": stats["total_entities"] > 0,
            "has_relationships": stats["total_relationships"] > 0,
            "avg_connections": (
                stats["total_relationships"] / stats["total_entities"]
                if stats["total_entities"] > 0 else 0
            ),
            "entity_diversity": len(stats["entity_counts"])
        }
        
        # Generate recommendations
        if stats["total_entities"] == 0:
            insights["recommendations"].append(
                "Empty graph - start by adding knowledge episodes or resolving memories to graph"
            )
        elif stats["total_relationships"] == 0:
            insights["recommendations"].append(
                "No relationships found - consider running relationship inference"
            )
        elif insights["health_indicators"]["avg_connections"] < 0.5:
            insights["recommendations"].append(
                "Many isolated entities - consider adding more context to establish relationships"
            )
        
        logger.info("[INSIGHTS] Generated insights for graph")
        return json.dumps(insights, indent=2)
        
    except Exception as e:
        logger.error(f"[INSIGHTS] Error: {e}", exc_info=True)
        return json.dumps({"error": str(e)})


def main() -> None:
    """Main entry point for the server."""
    logger.info("[MAIN] Starting Graphiti MCP server with FalkorDB backend")
    
    # Note: Graphiti requires FalkorDB to be running
    logger.info("[MAIN] Note: Ensure FalkorDB is running and environment variables are set:")
    logger.info("[MAIN]   FALKORDB_HOST (default: localhost)")
    logger.info("[MAIN]   FALKORDB_PORT (default: 6379)")
    logger.info("[MAIN]   OPENAI_API_KEY (required for embeddings)")
    
    mcp.run(transport="stdio", show_banner=False)


if __name__ == "__main__":
    main()