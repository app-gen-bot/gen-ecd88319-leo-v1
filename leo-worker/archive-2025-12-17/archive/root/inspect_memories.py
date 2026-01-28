#!/usr/bin/env python3
"""Inspect memories stored in mem0 and graphiti."""

import os
import sys
import json
from pathlib import Path

# Add the src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))


def check_mem0():
    """Check mem0 memories using direct API."""
    print("\n🧠 Checking mem0 Memories")
    print("=" * 80)
    
    try:
        import httpx
        
        # Check if Qdrant is running
        qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
        
        # Get collection info
        response = httpx.get(f"{qdrant_url}/collections")
        if response.status_code == 200:
            collections = response.json()
            print(f"Qdrant Collections: {json.dumps(collections, indent=2)}")
            
            # Check app_factory_memories collection
            collection_name = os.getenv("QDRANT_COLLECTION_NAME", "app_factory_memories")
            response = httpx.get(f"{qdrant_url}/collections/{collection_name}")
            if response.status_code == 200:
                collection_info = response.json()
                print(f"\nCollection '{collection_name}' info:")
                print(f"  Vectors count: {collection_info.get('result', {}).get('vectors_count', 0)}")
                print(f"  Points count: {collection_info.get('result', {}).get('points_count', 0)}")
                
                # Try to get some points
                response = httpx.post(
                    f"{qdrant_url}/collections/{collection_name}/points/scroll",
                    json={"limit": 10, "with_payload": True, "with_vector": False}
                )
                if response.status_code == 200:
                    points = response.json()
                    print(f"\nSample memories (first 10):")
                    for point in points.get("result", {}).get("points", []):
                        payload = point.get("payload", {})
                        print(f"\n  ID: {point.get('id')}")
                        print(f"  Memory: {payload.get('memory', 'N/A')}")
                        print(f"  User ID: {payload.get('user_id', 'N/A')}")
                        print(f"  Created: {payload.get('created_at', 'N/A')}")
                        if 'metadata' in payload:
                            print(f"  Metadata: {json.dumps(payload['metadata'], indent=4)}")
            else:
                print(f"\nCollection '{collection_name}' not found")
        else:
            print("❌ Could not connect to Qdrant")
            
    except Exception as e:
        print(f"❌ Error checking mem0: {e}")
        print("   Make sure Qdrant is running at http://localhost:6333")


def check_graphiti():
    """Check graphiti knowledge graph using Neo4j."""
    print("\n🔗 Checking Graphiti Knowledge Graph")
    print("=" * 80)
    
    try:
        from neo4j import GraphDatabase
        
        # Neo4j connection details
        uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        user = os.getenv("NEO4J_USER", "neo4j")
        password = os.getenv("NEO4J_PASSWORD", "cc-core-password")
        
        driver = GraphDatabase.driver(uri, auth=(user, password))
        
        with driver.session() as session:
            # Count nodes
            result = session.run("MATCH (n) RETURN count(n) as count, labels(n) as labels")
            print("\nNode counts by label:")
            for record in result:
                print(f"  Total nodes: {record['count']}")
            
            # Get node labels
            result = session.run("MATCH (n) RETURN DISTINCT labels(n) as labels, count(n) as count")
            for record in result:
                labels = record['labels']
                count = record['count']
                if labels:
                    print(f"  {labels[0]}: {count}")
            
            # Sample some nodes
            print("\nSample nodes (first 10):")
            result = session.run("MATCH (n) RETURN n LIMIT 10")
            for record in result:
                node = record['n']
                print(f"\n  Node ID: {node.id}")
                print(f"  Labels: {list(node.labels)}")
                print(f"  Properties: {dict(node)}")
            
            # Check relationships
            result = session.run("MATCH ()-[r]->() RETURN count(r) as count, type(r) as type")
            print("\nRelationship counts by type:")
            total_rels = 0
            for record in result:
                total_rels += record['count']
            print(f"  Total relationships: {total_rels}")
            
            result = session.run("MATCH ()-[r]->() RETURN DISTINCT type(r) as type, count(r) as count")
            for record in result:
                print(f"  {record['type']}: {record['count']}")
            
            # Sample relationships
            print("\nSample relationships (first 5):")
            result = session.run("MATCH (a)-[r]->(b) RETURN a, r, b LIMIT 5")
            for record in result:
                a = record['a']
                r = record['r']
                b = record['b']
                print(f"\n  ({list(a.labels)[0] if a.labels else 'Node'}) -[{type(r).__name__}]-> ({list(b.labels)[0] if b.labels else 'Node'})")
                print(f"  Relationship properties: {dict(r)}")
                
        driver.close()
        
    except Exception as e:
        print(f"❌ Error checking graphiti: {e}")
        print("   Make sure Neo4j is running at bolt://localhost:7687")


def check_context_storage():
    """Check local context storage files."""
    print("\n📁 Checking Local Context Storage")
    print("=" * 80)
    
    context_paths = [
        Path(".agent_context"),
        Path("src/.agent_context"),
        Path(os.path.expanduser("~/.cc_context_manager"))
    ]
    
    for context_path in context_paths:
        if context_path.exists():
            print(f"\nFound context storage at: {context_path}")
            
            # Count files
            json_files = list(context_path.glob("*.json"))
            print(f"  Session files: {len(json_files)}")
            
            if json_files:
                # Show most recent sessions
                recent_files = sorted(json_files, key=lambda x: x.stat().st_mtime, reverse=True)[:5]
                print("  Recent sessions:")
                for f in recent_files:
                    try:
                        with open(f) as file:
                            data = json.load(file)
                            print(f"    - {f.name}")
                            print(f"      Task: {data.get('task', 'N/A')[:80]}...")
                            print(f"      Time: {data.get('start_time', 'N/A')}")
                            print(f"      Success: {data.get('success', 'N/A')}")
                    except:
                        print(f"    - {f.name} (could not parse)")


def main():
    """Run all memory checks."""
    print("🔍 AI App Factory Memory Inspection")
    print("=" * 80)
    
    # Load environment variables
    from dotenv import load_dotenv
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        load_dotenv(env_path)
        print(f"✅ Loaded environment from {env_path}")
    else:
        print("⚠️  No .env file found, using defaults")
    
    # Check each memory system
    check_mem0()
    check_graphiti()
    check_context_storage()
    
    print("\n" + "=" * 80)
    print("✅ Memory inspection complete!")
    print("\nNote: If services show errors, make sure they are running:")
    print("  - Qdrant: docker run -p 6333:6333 qdrant/qdrant")
    print("  - Neo4j: docker run -p 7474:7474 -p 7687:7687 neo4j")


if __name__ == "__main__":
    main()