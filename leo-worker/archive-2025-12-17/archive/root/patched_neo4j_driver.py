"""Patched Neo4j driver that fixes the database name issue."""

from graphiti_core.driver.neo4j_driver import Neo4jDriver as BaseNeo4jDriver
from neo4j import AsyncGraphDatabase


class PatchedNeo4jDriver(BaseNeo4jDriver):
    """Neo4j driver that fixes the default_db issue."""
    
    def __init__(self, uri: str, user: str | None, password: str | None):
        # Call parent init but don't use super() to avoid issues
        self.client = AsyncGraphDatabase.driver(
            uri=uri,
            auth=(user or '', password or ''),
        )
    
    async def execute_query(self, cypher_query: str, params: dict | None = None, **kwargs):
        """Execute query with explicit database name."""
        # Force database to be 'neo4j' instead of 'default_db'
        params = params or {}
        
        # Always use neo4j database
        kwargs['database_'] = 'neo4j'
        
        result = await self.client.execute_query(
            cypher_query, 
            parameters_=params,
            **kwargs
        )
        
        return result