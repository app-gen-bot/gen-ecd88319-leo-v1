"""Custom Neo4j driver that fixes the database name issue."""

from graphiti_core.driver.neo4j_driver import Neo4jDriver
from neo4j import AsyncGraphDatabase
import re


class CustomNeo4jDriver(Neo4jDriver):
    """Custom Neo4j driver that replaces default_db with neo4j."""
    
    def __init__(self, uri: str, user: str | None, password: str | None):
        # Don't call super().__init__ to avoid creating the client twice
        self.client = AsyncGraphDatabase.driver(
            uri=uri,
            auth=(user or '', password or ''),
        )
    
    async def execute_query(self, cypher_query: str, params: dict | None = None, **kwargs):
        """Execute query with database name replacement."""
        # Replace default_db with neo4j in the query
        modified_query = cypher_query.replace("default_db", "neo4j")
        
        # Call the parent's execute_query with the modified query
        return await super().execute_query(modified_query, params, **kwargs)