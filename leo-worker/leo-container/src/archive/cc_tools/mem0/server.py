"""
Mem0 MCP Server

Integrates mem0ai with Qdrant vector database and Neo4j graph database
to provide persistent memory management for AI agents.
"""

import os
import sys

# We'll handle stdout redirection more carefully to avoid breaking FastMCP
# Save original stdout for later restoration
_original_stdout = sys.stdout

# Now import everything else
import json
import asyncio
from pathlib import Path
from typing import Dict, Any, List, Optional, Union
from datetime import datetime
from contextlib import asynccontextmanager, redirect_stdout, redirect_stderr
import io
import logging

from fastmcp import FastMCP
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Mem0 imports
from mem0 import Memory
from qdrant_client import QdrantClient
from neo4j import AsyncGraphDatabase

from ..common.logging_utils import setup_mcp_server_logging
from .graph_visualizer import GraphVisualizer

# Load environment variables
# Look for .env in the app-factory root directory
env_path = Path(__file__).parent.parent.parent.parent / ".env"
# Use override=True to ensure .env file values take precedence
load_dotenv(env_path, override=True)

# Setup logging with explicit stderr output
server_logger = setup_mcp_server_logging("mem0")
server_logger.info("[SERVER_INIT] Mem0 MCP server module loaded")

# Configure all loggers to use stderr to prevent stdout pollution
stderr_handler = logging.StreamHandler(sys.stderr)
stderr_handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))

# Configure mem0 library logging
mem0_logger = logging.getLogger('mem0')
mem0_logger.handlers = []  # Remove any existing handlers
mem0_logger.addHandler(stderr_handler)
mem0_logger.setLevel(logging.WARNING)  # Only show warnings and errors

# Configure other related loggers
for logger_name in ['qdrant_client', 'httpx', 'httpcore', 'neo4j', 'fastmcp', 'mcp']:
    logger = logging.getLogger(logger_name)
    logger.handlers = []
    logger.addHandler(stderr_handler)
    logger.setLevel(logging.WARNING)

# Suppress FastMCP's default logging to stdout
logging.getLogger('fastmcp.server').setLevel(logging.ERROR)

# Debug environment loading
if os.environ.get("OPENAI_API_KEY"):
    server_logger.info(f"[SERVER_INIT] OpenAI API key loaded (length: {len(os.environ.get('OPENAI_API_KEY', ''))})") 
else:
    server_logger.error("[SERVER_INIT] OpenAI API key not found in environment")
    server_logger.error(f"[SERVER_INIT] Env file path: {env_path}")
    server_logger.error(f"[SERVER_INIT] Env file exists: {env_path.exists()}")

# Initialize FastMCP
mcp = FastMCP("Mem0")
server_logger.info("[MODULE] FastMCP instance created")


class MemoryConfig(BaseModel):
    """Configuration for Mem0 memory system"""
    qdrant_url: str = Field(default="http://localhost:6333")
    qdrant_api_key: Optional[str] = Field(default=None)
    qdrant_collection: str = Field(default="cc_core_memories")
    neo4j_uri: str = Field(default="bolt://localhost:7687")
    neo4j_username: str = Field(default="neo4j")
    neo4j_password: str = Field(default="cc-core-password")
    user_id: str = Field(default="default_user")
    default_context: str = Field(default="codebase")


class Mem0Server:
    """Main server class for Mem0 MCP integration"""
    
    def __init__(self):
        self.logger = server_logger
        self.config = self._load_config()
        self.memory = None
        self.neo4j_driver = None
        self._initialized = False
        
    def _load_config(self) -> MemoryConfig:
        """Load configuration from environment variables"""
        config = MemoryConfig(
            qdrant_url=os.getenv("QDRANT_URL", "http://localhost:6333"),
            qdrant_api_key=os.getenv("QDRANT_API_KEY"),
            qdrant_collection=os.getenv("QDRANT_COLLECTION_NAME", "app_factory_memories"),
            neo4j_uri=os.getenv("NEO4J_URI", "bolt://localhost:7687"),
            neo4j_username=os.getenv("NEO4J_USER", "neo4j"),
            neo4j_password=os.getenv("NEO4J_PASSWORD", "cc-core-password"),
            user_id=os.getenv("MEM0_USER_ID", "app_factory"),
            default_context=os.getenv("MEM0_DEFAULT_CONTEXT", "app_factory")
        )
        
        self.logger.info(f"[CONFIG] Loaded config: qdrant_url={config.qdrant_url}, collection={config.qdrant_collection}, user_id={config.user_id}")
        return config
    
    async def initialize(self):
        """Initialize connections to Qdrant and Neo4j"""
        if self._initialized:
            return
            
        try:
            # Set OpenAI API key in environment for mem0
            openai_key = os.getenv("OPENAI_API_KEY")
            if openai_key and openai_key != "your_openai_api_key_here":
                os.environ["OPENAI_API_KEY"] = openai_key
            
            # Initialize Mem0 with Qdrant configuration
            # Extract host and port from URL
            qdrant_host = self.config.qdrant_url.replace("http://", "").replace("https://", "")
            if ":" in qdrant_host:
                host, port = qdrant_host.split(":")
                port = int(port)
            else:
                host = qdrant_host
                port = 6333
            
            mem0_config = {
                "vector_store": {
                    "provider": "qdrant",
                    "config": {
                        "collection_name": self.config.qdrant_collection,
                        "host": host,
                        "port": port
                    }
                }
            }
            
            self.memory = Memory.from_config(mem0_config)
            
            # Log the actual collection being used
            self.logger.info(f"[INIT] Mem0 initialized with Qdrant at {self.config.qdrant_url}")
            self.logger.info(f"[INIT] Mem0 initialized with Qdrant collection: {self.config.qdrant_collection}")
            
            # Initialize Neo4j driver
            self.neo4j_driver = AsyncGraphDatabase.driver(
                self.config.neo4j_uri,
                auth=(self.config.neo4j_username, self.config.neo4j_password)
            )
            self.logger.info("[INIT] Neo4j driver initialized")
            
            # Test connections
            await self._test_connections()
            
            self._initialized = True
            self.logger.info("[INIT] All services initialized successfully")
            
        except Exception as e:
            self.logger.error(f"[INIT] Failed to initialize: {e}", exc_info=True)
            raise
    
    async def _test_connections(self):
        """Test connections to databases"""
        # Test Neo4j
        async with self.neo4j_driver.session() as session:
            result = await session.run("RETURN 1 as test")
            await result.single()
        self.logger.info("[INIT] Neo4j connection verified")
    
    async def cleanup(self):
        """Cleanup connections"""
        if self.neo4j_driver:
            await self.neo4j_driver.close()
            self.logger.info("[CLEANUP] Neo4j driver closed")
    
    @asynccontextmanager
    async def neo4j_session(self):
        """Context manager for Neo4j sessions"""
        async with self.neo4j_driver.session() as session:
            yield session


# Create server instance
server = Mem0Server()


@mcp.tool()
async def add_memory(
    content: str,
    context: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
    user_id: Optional[str] = None,
    create_graph_nodes: bool = True
) -> Dict[str, Any]:
    """
    Add a memory to the system with optional graph relationships.
    
    Args:
        content: The memory content to store
        context: Context for the memory (e.g., 'file:src/main.py', 'function:calculate')
        metadata: Additional metadata to store with the memory
        user_id: User ID (defaults to configured user)
        create_graph_nodes: Whether to create graph nodes for entities
        
    Returns:
        Dictionary with memory ID and created relationships
    """
    await server.initialize()
    
    try:
        # Use provided user_id or default
        uid = user_id or server.config.user_id
        
        # Prepare metadata
        meta = metadata or {}
        meta["context"] = context or server.config.default_context
        meta["timestamp"] = datetime.now().isoformat()
        meta["source"] = "mcp_tool"
        
        # Log what we're trying to add
        content_size = len(content)
        server.logger.info(f"[ADD_MEMORY] Attempting to add: content_size={content_size} chars, preview='{content[:50]}...', user_id='{uid}', metadata={meta}")
        
        # Check content size and truncate if necessary
        MAX_CONTENT_SIZE = 10000  # 10k characters max
        if content_size > MAX_CONTENT_SIZE:
            server.logger.warning(f"[ADD_MEMORY] Content too large ({content_size} chars), truncating to {MAX_CONTENT_SIZE} chars")
            content = content[:MAX_CONTENT_SIZE] + "... [truncated]"
        
        # Add memory to Mem0 (handles vector storage)
        # Run the blocking mem0.add in a thread executor to prevent hanging
        try:
            # Capture any stdout during the operation
            captured_stdout = io.StringIO()
            
            # Define the blocking operation
            def _add_memory_sync():
                # Redirect stdout during mem0 operations
                with redirect_stdout(captured_stdout):
                    return server.memory.add(
                        messages=content,
                        user_id=uid,
                        metadata=meta
                    )
            
            # Run in executor with timeout
            loop = asyncio.get_event_loop()
            result = await asyncio.wait_for(
                loop.run_in_executor(None, _add_memory_sync),
                timeout=30.0  # 30 second timeout for the add operation
            )
            
            # Log any captured stdout as stderr
            if captured_stdout.getvalue():
                server.logger.debug(f"[ADD_MEMORY] Captured stdout from mem0: {captured_stdout.getvalue()}")
            
        except asyncio.TimeoutError:
            server.logger.error(f"[ADD_MEMORY] Timeout after 30 seconds while adding memory")
            return {
                "success": False,
                "error": "Memory add operation timed out after 30 seconds"
            }
        except Exception as e:
            server.logger.error(f"[ADD_MEMORY] Error during memory add: {e}")
            return {
                "success": False,
                "error": f"Failed to add memory: {str(e)}"
            }
        
        server.logger.info(f"[ADD_MEMORY] Raw result from mem0: {result}")
        
        # Extract memory ID from results
        memory_id = None
        if isinstance(result, dict) and "results" in result:
            results = result.get("results", [])
            if results and len(results) > 0:
                memory_id = results[0].get("id")
        
        if not memory_id:
            server.logger.error(f"[ADD_MEMORY] Failed to get memory ID from result: {result}")
            return {
                "success": False,
                "error": "Failed to create memory"
            }
        
        server.logger.info(f"[ADD_MEMORY] Created memory {memory_id}")
        
        # Debug: verify memory was stored (with timeout)
        try:
            def _get_all_memories_sync():
                captured_stdout = io.StringIO()
                with redirect_stdout(captured_stdout):
                    memories = server.memory.get_all(user_id=uid)
                if captured_stdout.getvalue():
                    server.logger.debug(f"[ADD_MEMORY] Captured stdout from get_all: {captured_stdout.getvalue()}")
                return memories
            
            # Use asyncio timeout for verification
            try:
                loop = asyncio.get_event_loop()
                all_memories = await asyncio.wait_for(
                    loop.run_in_executor(None, _get_all_memories_sync),
                    timeout=5.0
                )
                server.logger.info(f"[ADD_MEMORY] Total memories for user {uid}: {len(all_memories)}")
                if all_memories and isinstance(all_memories, list) and len(all_memories) > 0:
                    latest = all_memories[0]
                    memory_text = latest.get('memory', latest.get('text', 'N/A')) if isinstance(latest, dict) else str(latest)
                    server.logger.info(f"[ADD_MEMORY] Latest memory preview: {memory_text[:100]}...")
            except asyncio.TimeoutError:
                server.logger.warning(f"[ADD_MEMORY] Verification timed out after 5 seconds - memory may still be saved")
        except Exception as e:
            server.logger.error(f"[ADD_MEMORY] Error verifying storage: {e}")
        
        # Create graph nodes if requested
        graph_result = {}
        if create_graph_nodes and context:
            graph_result = await _create_graph_nodes(
                memory_id=str(memory_id),
                content=content,
                context=context,
                metadata=meta
            )
        
        return {
            "success": True,
            "memory_id": str(memory_id),
            "context": meta["context"],
            "graph_nodes": graph_result.get("nodes", []),
            "graph_relationships": graph_result.get("relationships", [])
        }
        
    except Exception as e:
        server.logger.error(f"[ADD_MEMORY] Failed: {e}", exc_info=True)
        return {
            "success": False,
            "error": str(e)
        }


@mcp.tool()
async def search_memories(
    query: str,
    context_filter: Optional[str] = None,
    limit: int = 10,
    user_id: Optional[str] = None,
    include_graph: bool = True
) -> Dict[str, Any]:
    """
    Search memories using semantic search with optional context filtering.
    
    Args:
        query: Search query
        context_filter: Filter by context (e.g., 'file:*', 'function:*')
        limit: Maximum number of results
        user_id: User ID (defaults to configured user)
        include_graph: Whether to include graph relationships
        
    Returns:
        Dictionary with search results and optional graph data
    """
    server.logger.info(f"[SEARCH_MEMORIES] Called with query='{query}', user_id={user_id}, limit={limit}")
    await server.initialize()
    
    try:
        uid = user_id or server.config.user_id
        
        # Search with Mem0
        def _search_memories_sync():
            captured_stdout = io.StringIO()
            with redirect_stdout(captured_stdout):
                result = server.memory.search(
                    query=query,
                    user_id=uid,
                    limit=limit
                )
            if captured_stdout.getvalue():
                server.logger.debug(f"[SEARCH_MEMORIES] Captured stdout: {captured_stdout.getvalue()}")
            return result
        
        # Run in executor to prevent blocking
        loop = asyncio.get_event_loop()
        search_result = await loop.run_in_executor(None, _search_memories_sync)
        
        # Extract results - mem0 returns list directly for search
        results = []
        if isinstance(search_result, list):
            results = search_result
        elif isinstance(search_result, dict) and "results" in search_result:
            results = search_result.get("results", [])
        
        # Filter by context if provided
        if context_filter:
            filtered_results = []
            for result in results:
                # Handle both dict and string results
                if isinstance(result, dict):
                    metadata = result.get("metadata", {})
                    context = metadata.get("context", "")
                    
                    # Support wildcard matching
                    if context_filter.endswith("*"):
                        prefix = context_filter[:-1]
                        if context.startswith(prefix):
                            filtered_results.append(result)
                    elif context == context_filter:
                        filtered_results.append(result)
            
            results = filtered_results
        
        # Enrich with graph data if requested
        if include_graph and results:
            for result in results:
                if isinstance(result, dict):
                    memory_id = str(result.get("id", ""))
                    if memory_id:
                        graph_data = await _get_graph_data(memory_id)
                        result["graph"] = graph_data
        
        return {
            "success": True,
            "count": len(results),
            "memories": results,
            "query": query,
            "context_filter": context_filter
        }
        
    except Exception as e:
        server.logger.error(f"[SEARCH_MEMORIES] Failed: {e}", exc_info=True)
        return {
            "success": False,
            "error": str(e),
            "memories": []
        }


@mcp.tool()
async def get_memory_graph(
    context: Optional[str] = None,
    depth: int = 2,
    node_types: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Get the knowledge graph for memories, optionally filtered by context.
    
    Args:
        context: Context to filter by (e.g., 'file:src/main.py')
        depth: Graph traversal depth
        node_types: Types of nodes to include (e.g., ['Memory', 'File', 'Function'])
        
    Returns:
        Dictionary with nodes and relationships
    """
    await server.initialize()
    
    try:
        # Build Cypher query
        where_clause = ""
        params = {"depth": depth}
        
        if context:
            where_clause = "WHERE m.context = $context"
            params["context"] = context
        
        if node_types:
            types_filter = " OR ".join([f"n:{t}" for t in node_types])
            if where_clause:
                where_clause += f" AND ({types_filter})"
            else:
                where_clause = f"WHERE ({types_filter})"
        
        # Simple query without APOC (which isn't installed)
        query = f"""
        MATCH (m:Memory) {where_clause}
        OPTIONAL MATCH (m)-[r*0..$depth]-(n)
        WITH m, collect(DISTINCT n) as connected_nodes, collect(DISTINCT r) as paths
        RETURN m as root, connected_nodes, paths
        """
        
        async with server.neo4j_session() as session:
            result = await session.run(query, params)
            
            nodes = []
            relationships = []
            
            async for record in result:
                # Add root node
                root = record["root"]
                if root:
                    nodes.append({
                        "id": root.id,
                        "labels": list(root.labels),
                        "properties": dict(root)
                    })
                
                # Add connected nodes
                for node in record["connected_nodes"]:
                    if node and node.id != root.id:
                        nodes.append({
                            "id": node.id,
                            "labels": list(node.labels),
                            "properties": dict(node)
                        })
                
                # Process paths (which are lists of relationships)
                for path in record["paths"]:
                    if path:
                        for rel in path:
                            if rel:
                                relationships.append({
                                    "id": rel.id,
                                    "type": rel.type,
                                    "properties": dict(rel)
                                })
        
        return {
            "success": True,
            "nodes": nodes,
            "relationships": relationships,
            "context_filter": context,
            "depth": depth
        }
        
    except Exception as e:
        server.logger.error(f"[GET_GRAPH] Failed: {e}", exc_info=True)
        return {
            "success": False,
            "error": str(e),
            "nodes": [],
            "relationships": []
        }


@mcp.tool()
async def update_memory(
    memory_id: str,
    content: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
    user_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Update an existing memory.
    
    Args:
        memory_id: ID of the memory to update
        content: New content (if provided)
        metadata: Metadata to update
        user_id: User ID (defaults to configured user)
        
    Returns:
        Dictionary with update status
    """
    await server.initialize()
    
    try:
        uid = user_id or server.config.user_id
        
        # Get existing memory
        existing = server.memory.get(memory_id, user_id=uid)
        if not existing:
            return {
                "success": False,
                "error": f"Memory {memory_id} not found"
            }
        
        # Update memory
        update_data = {}
        if content:
            update_data["data"] = content
        if metadata:
            update_data["metadata"] = metadata
        
        result = server.memory.update(
            memory_id=memory_id,
            user_id=uid,
            **update_data
        )
        
        return {
            "success": True,
            "memory_id": memory_id,
            "updated": True
        }
        
    except Exception as e:
        server.logger.error(f"[UPDATE_MEMORY] Failed: {e}", exc_info=True)
        return {
            "success": False,
            "error": str(e)
        }


@mcp.tool()
async def delete_memory(
    memory_id: Optional[str] = None,
    context: Optional[str] = None,
    user_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Delete memories by ID or context.
    
    Args:
        memory_id: Specific memory ID to delete
        context: Delete all memories with this context
        user_id: User ID (defaults to configured user)
        
    Returns:
        Dictionary with deletion status
    """
    await server.initialize()
    
    try:
        uid = user_id or server.config.user_id
        deleted_count = 0
        
        if memory_id:
            # Delete specific memory
            server.memory.delete(memory_id=memory_id, user_id=uid)
            
            # Delete from graph
            try:
                async with server.neo4j_session() as session:
                    await session.run(
                        "MATCH (m:Memory {id: $id}) DETACH DELETE m",
                        {"id": memory_id}
                    )
            except Exception as graph_error:
                server.logger.warning(f"[DELETE_MEMORY] Graph deletion failed: {graph_error}")
            
            deleted_count = 1
            
        elif context:
            # Delete by context
            # First find memories with this context
            def _get_all_for_delete_sync():
                captured_stdout = io.StringIO()
                with redirect_stdout(captured_stdout):
                    result = server.memory.get_all(user_id=uid)
                if captured_stdout.getvalue():
                    server.logger.debug(f"[DELETE_MEMORY] Captured stdout: {captured_stdout.getvalue()}")
                return result
            
            loop = asyncio.get_event_loop()
            all_memories_result = await loop.run_in_executor(None, _get_all_for_delete_sync)
            
            # Extract memories from result - handle both list and dict formats
            all_memories = []
            if isinstance(all_memories_result, list):
                all_memories = all_memories_result
            elif isinstance(all_memories_result, dict) and "results" in all_memories_result:
                all_memories = all_memories_result.get("results", [])
            
            for memory in all_memories:
                # Handle both dict and string memories
                if isinstance(memory, dict):
                    mem_context = memory.get("metadata", {}).get("context", "")
                    if mem_context == context:
                        mem_id = memory.get("id")
                        if mem_id:
                            server.memory.delete(memory_id=mem_id, user_id=uid)
                            deleted_count += 1
            
            # Delete from graph
            try:
                async with server.neo4j_session() as session:
                    result = await session.run(
                        "MATCH (m:Memory {context: $context}) DETACH DELETE m",
                        {"context": context}
                    )
            except Exception as graph_error:
                server.logger.warning(f"[DELETE_MEMORY] Graph deletion failed: {graph_error}")
        
        return {
            "success": True,
            "deleted_count": deleted_count,
            "context": context,
            "memory_id": memory_id
        }
        
    except Exception as e:
        server.logger.error(f"[DELETE_MEMORY] Failed: {e}", exc_info=True)
        return {
            "success": False,
            "error": str(e)
        }


@mcp.tool()
async def get_memory_stats(
    user_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get statistics about stored memories.
    
    Args:
        user_id: User ID (defaults to configured user)
        
    Returns:
        Dictionary with memory statistics
    """
    await server.initialize()
    
    try:
        uid = user_id or server.config.user_id
        
        # Get all memories
        def _get_all_stats_sync():
            captured_stdout = io.StringIO()
            with redirect_stdout(captured_stdout):
                result = server.memory.get_all(user_id=uid)
            if captured_stdout.getvalue():
                server.logger.debug(f"[GET_STATS] Captured stdout: {captured_stdout.getvalue()}")
            return result
        
        # Run in executor to prevent blocking
        loop = asyncio.get_event_loop()
        all_memories_result = await loop.run_in_executor(None, _get_all_stats_sync)
        
        # Extract memories from result - mem0 returns list directly for get_all
        all_memories = []
        if isinstance(all_memories_result, list):
            all_memories = all_memories_result
        elif isinstance(all_memories_result, dict) and "results" in all_memories_result:
            all_memories = all_memories_result.get("results", [])
        
        # Calculate stats
        context_counts = {}
        total_size = 0
        
        for memory in all_memories:
            # Handle both dict and string memories
            if isinstance(memory, dict):
                # Count by context
                context = memory.get("metadata", {}).get("context", "unknown")
                context_counts[context] = context_counts.get(context, 0) + 1
                
                # Estimate size - check for 'memory' field (mem0's format)
                content = memory.get("memory", memory.get("data", ""))
                total_size += len(str(content))
            elif isinstance(memory, str):
                # If it's a string, count it as unknown context
                context_counts["unknown"] = context_counts.get("unknown", 0) + 1
                total_size += len(memory)
        
        # Get graph stats
        graph_stats = {}
        try:
            async with server.neo4j_session() as session:
                # Count nodes by type
                result = await session.run("""
                    MATCH (n)
                    RETURN labels(n) as labels, count(n) as count
                """)
                
                node_counts = {}
                async for record in result:
                    labels = record["labels"]
                    if labels:
                        label = labels[0]  # Use first label
                        node_counts[label] = record["count"]
                
                # Count relationships
                result = await session.run("""
                    MATCH ()-[r]->()
                    RETURN type(r) as type, count(r) as count
                """)
                
                rel_counts = {}
                async for record in result:
                    rel_counts[record["type"]] = record["count"]
                
                graph_stats = {
                    "node_counts": node_counts,
                    "relationship_counts": rel_counts
                }
        except Exception as graph_error:
            server.logger.warning(f"[GET_STATS] Graph stats failed: {graph_error}")
            graph_stats = {"error": str(graph_error)}
        
        return {
            "success": True,
            "total_memories": len(all_memories),
            "total_size_bytes": total_size,
            "context_distribution": context_counts,
            "graph_stats": graph_stats,
            "user_id": uid
        }
        
    except Exception as e:
        server.logger.error(f"[GET_STATS] Failed: {e}", exc_info=True)
        return {
            "success": False,
            "error": str(e)
        }


# Helper functions

async def _create_graph_nodes(
    memory_id: str,
    content: str,
    context: str,
    metadata: Dict[str, Any]
) -> Dict[str, Any]:
    """Create graph nodes and relationships for a memory"""
    nodes_created = []
    relationships_created = []
    
    try:
        async with server.neo4j_session() as session:
            # Create Memory node
            result = await session.run("""
                MERGE (m:Memory {id: $id})
                SET m.content = $content,
                    m.context = $context,
                    m.timestamp = $timestamp,
                    m.metadata = $metadata
                RETURN m
            """, {
                "id": memory_id,
                "content": content[:500],  # Truncate for graph storage
                "context": context,
                "timestamp": metadata.get("timestamp"),
                "metadata": json.dumps(metadata)
            })
            
            await result.single()
            nodes_created.append({"type": "Memory", "id": memory_id})
            
            # Parse context and create appropriate nodes
            if context.startswith("file:"):
                file_path = context[5:]  # Remove 'file:' prefix
                
                # Create File node
                result = await session.run("""
                    MERGE (f:File {path: $path})
                    SET f.name = $name
                    WITH f
                    MATCH (m:Memory {id: $memory_id})
                    MERGE (m)-[:RELATES_TO]->(f)
                    RETURN f
                """, {
                    "path": file_path,
                    "name": Path(file_path).name,
                    "memory_id": memory_id
                })
                
                await result.single()
                nodes_created.append({"type": "File", "path": file_path})
                relationships_created.append({
                    "type": "RELATES_TO",
                    "from": "Memory",
                    "to": "File"
                })
                
            elif context.startswith("function:"):
                function_name = context[9:]  # Remove 'function:' prefix
                
                # Create Function node
                result = await session.run("""
                    MERGE (fn:Function {name: $name})
                    WITH fn
                    MATCH (m:Memory {id: $memory_id})
                    MERGE (m)-[:DESCRIBES]->(fn)
                    RETURN fn
                """, {
                    "name": function_name,
                    "memory_id": memory_id
                })
                
                await result.single()
                nodes_created.append({"type": "Function", "name": function_name})
                relationships_created.append({
                    "type": "DESCRIBES",
                    "from": "Memory",
                    "to": "Function"
                })
            
            elif context.startswith("class:"):
                class_name = context[6:]  # Remove 'class:' prefix
                
                # Create Class node
                result = await session.run("""
                    MERGE (c:Class {name: $name})
                    WITH c
                    MATCH (m:Memory {id: $memory_id})
                    MERGE (m)-[:DESCRIBES]->(c)
                    RETURN c
                """, {
                    "name": class_name,
                    "memory_id": memory_id
                })
                
                await result.single()
                nodes_created.append({"type": "Class", "name": class_name})
                relationships_created.append({
                    "type": "DESCRIBES",
                    "from": "Memory",
                    "to": "Class"
                })
            
            elif context.startswith("architecture:"):
                arch_type = context[13:]  # Remove 'architecture:' prefix
                
                # Create Architecture node
                result = await session.run("""
                    MERGE (a:Architecture {type: $type})
                    WITH a
                    MATCH (m:Memory {id: $memory_id})
                    MERGE (m)-[:IMPLEMENTS]->(a)
                    RETURN a
                """, {
                    "type": arch_type,
                    "memory_id": memory_id
                })
                
                await result.single()
                nodes_created.append({"type": "Architecture", "type": arch_type})
                relationships_created.append({
                    "type": "IMPLEMENTS",
                    "from": "Memory",
                    "to": "Architecture"
                })
            
            elif context.startswith("decision:"):
                decision_type = context[9:]  # Remove 'decision:' prefix
                
                # Create Decision node
                result = await session.run("""
                    MERGE (d:Decision {type: $type})
                    SET d.timestamp = $timestamp
                    WITH d
                    MATCH (m:Memory {id: $memory_id})
                    MERGE (m)-[:DOCUMENTS]->(d)
                    RETURN d
                """, {
                    "type": decision_type,
                    "timestamp": metadata.get("timestamp"),
                    "memory_id": memory_id
                })
                
                await result.single()
                nodes_created.append({"type": "Decision", "type": decision_type})
                relationships_created.append({
                    "type": "DOCUMENTS",
                    "from": "Memory",
                    "to": "Decision"
                })
            
            elif context.startswith("pattern:"):
                pattern_name = context[8:]  # Remove 'pattern:' prefix
                
                # Create Pattern node
                result = await session.run("""
                    MERGE (p:Pattern {name: $name})
                    WITH p
                    MATCH (m:Memory {id: $memory_id})
                    MERGE (m)-[:USES_PATTERN]->(p)
                    RETURN p
                """, {
                    "name": pattern_name,
                    "memory_id": memory_id
                })
                
                await result.single()
                nodes_created.append({"type": "Pattern", "name": pattern_name})
                relationships_created.append({
                    "type": "USES_PATTERN",
                    "from": "Memory",
                    "to": "Pattern"
                })
            
            elif context.startswith("integration:"):
                service_name = context[12:]  # Remove 'integration:' prefix
                
                # Create Integration node
                result = await session.run("""
                    MERGE (i:Integration {service: $service})
                    WITH i
                    MATCH (m:Memory {id: $memory_id})
                    MERGE (m)-[:INTEGRATES_WITH]->(i)
                    RETURN i
                """, {
                    "service": service_name,
                    "memory_id": memory_id
                })
                
                await result.single()
                nodes_created.append({"type": "Integration", "service": service_name})
                relationships_created.append({
                    "type": "INTEGRATES_WITH",
                    "from": "Memory",
                    "to": "Integration"
                })
        
        return {
            "nodes": nodes_created,
            "relationships": relationships_created
        }
        
    except Exception as e:
        server.logger.error(f"[CREATE_GRAPH] Failed: {e}", exc_info=True)
        return {"nodes": [], "relationships": []}


async def _get_graph_data(memory_id: str) -> Dict[str, Any]:
    """Get graph data for a specific memory"""
    try:
        async with server.neo4j_session() as session:
            result = await session.run("""
                MATCH (m:Memory {id: $id})-[r]-(n)
                RETURN m, r, n
            """, {"id": memory_id})
            
            nodes = []
            relationships = []
            
            async for record in result:
                # Add connected node
                node = record["n"]
                nodes.append({
                    "labels": list(node.labels),
                    "properties": dict(node)
                })
                
                # Add relationship
                rel = record["r"]
                relationships.append({
                    "type": rel.type,
                    "properties": dict(rel)
                })
            
            return {
                "connected_nodes": nodes,
                "relationships": relationships
            }
            
    except Exception as e:
        server.logger.error(f"[GET_GRAPH_DATA] Failed: {e}", exc_info=True)
        return {"connected_nodes": [], "relationships": []}


@mcp.tool()
async def export_graph_visualization(
    output_path: str,
    format: str = "mermaid",
    context_filter: Optional[str] = None,
    depth: int = 2
) -> Dict[str, Any]:
    """
    Export memory graph to visualization format.
    
    Args:
        output_path: Path to save the visualization
        format: Output format ('mermaid', 'graphviz', 'json')
        context_filter: Optional context to filter graph
        depth: Graph traversal depth
        
    Returns:
        Dictionary with export status and file path
    """
    await server.initialize()
    
    try:
        # Get graph data
        graph_data = await get_memory_graph(
            context=context_filter,
            depth=depth
        )
        
        if not graph_data.get("success"):
            return {
                "success": False,
                "error": "Failed to retrieve graph data"
            }
        
        # Extract nodes and relationships
        nodes = graph_data.get("nodes", [])
        relationships = graph_data.get("relationships", [])
        
        # Save visualization
        saved_path = GraphVisualizer.save_visualization(
            nodes=nodes,
            relationships=relationships,
            output_path=output_path,
            format=format
        )
        
        return {
            "success": True,
            "file_path": saved_path,
            "format": format,
            "node_count": len(nodes),
            "relationship_count": len(relationships),
            "message": f"Graph exported to {saved_path}"
        }
        
    except Exception as e:
        server.logger.error(f"[EXPORT_GRAPH] Failed: {e}", exc_info=True)
        return {
            "success": False,
            "error": str(e)
        }


def main():
    """Main entry point for the server"""
    try:
        server.logger.info("[MAIN] Starting Mem0 MCP Server")
        server.logger.info(f"[MAIN] Environment check - OPENAI_API_KEY: {'set' if os.getenv('OPENAI_API_KEY') else 'NOT SET'}")
        server.logger.info(f"[MAIN] Environment check - NEO4J_URI: {os.getenv('NEO4J_URI', 'NOT SET')}")
        server.logger.info(f"[MAIN] Environment check - QDRANT_URL: {os.getenv('QDRANT_URL', 'NOT SET')}")
        
        # Ensure we're using stdio transport with no banner
        server.logger.info("[MAIN] Running FastMCP server...")
        
        # Run with explicit stdio transport and no banner
        mcp.run(transport="stdio", show_banner=False)
        
    except KeyboardInterrupt:
        server.logger.info("[MAIN] Received KeyboardInterrupt - graceful shutdown")
        # Cleanup will be handled by atexit
        sys.exit(0)
    except Exception as e:
        server.logger.error(f"[MAIN] Failed to run Mem0 MCP Server: {e}", exc_info=True)
        sys.exit(1)
    finally:
        # Ensure cleanup
        if server._initialized:
            asyncio.run(server.cleanup())


if __name__ == "__main__":
    server_logger.info("[MODULE] __name__ == __main__, calling main()")
    main()
else:
    server_logger.info(f"[MODULE] __name__ = {__name__}, not calling main()")