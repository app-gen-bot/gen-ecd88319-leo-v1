#!/usr/bin/env python3
"""
Update Neo4j schema for code-related nodes and relationships

This script creates indexes and constraints for efficient code graph operations.
"""

import asyncio
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from neo4j import AsyncGraphDatabase

# Load environment variables
env_path = Path(__file__).parent.parent.parent.parent / ".env"
load_dotenv(env_path, override=True)


async def update_schema():
    """Update Neo4j schema with code-related indexes and constraints"""
    
    # Get Neo4j configuration
    neo4j_uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    neo4j_user = os.getenv("NEO4J_USERNAME", "neo4j")
    neo4j_password = os.getenv("NEO4J_PASSWORD", "cc-core-password")
    
    print(f"Connecting to Neo4j at {neo4j_uri}...")
    
    # Create driver
    driver = AsyncGraphDatabase.driver(neo4j_uri, auth=(neo4j_user, neo4j_password))
    
    try:
        async with driver.session() as session:
            print("Creating indexes and constraints...")
            
            # Create constraints for unique identifiers
            constraints = [
                # File nodes - path must be unique
                "CREATE CONSTRAINT file_path IF NOT EXISTS FOR (f:File) REQUIRE f.path IS UNIQUE",
                
                # Function nodes - combination of name and file must be unique
                "CREATE CONSTRAINT function_id IF NOT EXISTS FOR (f:Function) REQUIRE (f.name, f.file) IS UNIQUE",
                
                # Class nodes - combination of name and file must be unique
                "CREATE CONSTRAINT class_id IF NOT EXISTS FOR (c:Class) REQUIRE (c.name, c.file) IS UNIQUE",
                
                # Import nodes - combination of statement and file must be unique
                "CREATE CONSTRAINT import_id IF NOT EXISTS FOR (i:Import) REQUIRE (i.statement, i.file) IS UNIQUE",
                
                # Pattern nodes - combination of type, file, and line must be unique
                "CREATE CONSTRAINT pattern_id IF NOT EXISTS FOR (p:Pattern) REQUIRE (p.type, p.file, p.line) IS UNIQUE"
            ]
            
            for constraint in constraints:
                try:
                    await session.run(constraint)
                    print(f"✓ Created constraint: {constraint.split(' ')[2]}")
                except Exception as e:
                    if "already exists" in str(e):
                        print(f"  Constraint {constraint.split(' ')[2]} already exists")
                    else:
                        print(f"✗ Error creating constraint: {e}")
            
            # Create indexes for better query performance
            indexes = [
                # File indexes
                "CREATE INDEX file_name IF NOT EXISTS FOR (f:File) ON (f.name)",
                "CREATE INDEX file_extension IF NOT EXISTS FOR (f:File) ON (f.extension)",
                "CREATE INDEX file_directory IF NOT EXISTS FOR (f:File) ON (f.directory)",
                
                # Function indexes
                "CREATE INDEX function_name IF NOT EXISTS FOR (f:Function) ON (f.name)",
                "CREATE INDEX function_file IF NOT EXISTS FOR (f:Function) ON (f.file)",
                
                # Class indexes
                "CREATE INDEX class_name IF NOT EXISTS FOR (c:Class) ON (c.name)",
                "CREATE INDEX class_file IF NOT EXISTS FOR (c:Class) ON (c.file)",
                
                # Import indexes
                "CREATE INDEX import_module IF NOT EXISTS FOR (i:Import) ON (i.module)",
                "CREATE INDEX import_file IF NOT EXISTS FOR (i:Import) ON (i.file)",
                
                # Pattern indexes
                "CREATE INDEX pattern_type IF NOT EXISTS FOR (p:Pattern) ON (p.type)",
                "CREATE INDEX pattern_confidence IF NOT EXISTS FOR (p:Pattern) ON (p.confidence)",
                
                # Memory indexes (for integration with mem0)
                "CREATE INDEX memory_context IF NOT EXISTS FOR (m:Memory) ON (m.context)",
                "CREATE INDEX memory_timestamp IF NOT EXISTS FOR (m:Memory) ON (m.timestamp)"
            ]
            
            for index in indexes:
                try:
                    await session.run(index)
                    print(f"✓ Created index: {index.split(' ')[2]}")
                except Exception as e:
                    if "already exists" in str(e):
                        print(f"  Index {index.split(' ')[2]} already exists")
                    else:
                        print(f"✗ Error creating index: {e}")
            
            # Verify schema
            print("\nVerifying schema...")
            
            # Check node labels
            result = await session.run("CALL db.labels()")
            labels = [record["label"] async for record in result]
            print(f"\nNode labels: {', '.join(sorted(labels))}")
            
            # Check relationship types
            result = await session.run("CALL db.relationshipTypes()")
            rel_types = [record["relationshipType"] async for record in result]
            print(f"\nRelationship types: {', '.join(sorted(rel_types))}")
            
            # Check constraints
            result = await session.run("SHOW CONSTRAINTS")
            constraint_count = len([r async for r in result])
            print(f"\nTotal constraints: {constraint_count}")
            
            # Check indexes
            result = await session.run("SHOW INDEXES")
            index_count = len([r async for r in result])
            print(f"Total indexes: {index_count}")
            
            print("\n✅ Schema update complete!")
            
    finally:
        await driver.close()


if __name__ == "__main__":
    print("Neo4j Schema Update for Code Graph")
    print("=" * 50)
    
    try:
        asyncio.run(update_schema())
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)