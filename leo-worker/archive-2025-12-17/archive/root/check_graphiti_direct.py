#!/usr/bin/env python3
"""Check Graphiti Neo4j database directly."""

import os
from neo4j import GraphDatabase
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Neo4j connection
uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
user = os.getenv("NEO4J_USER", "neo4j")
password = os.getenv("NEO4J_PASSWORD", "cc-core-password")

print(f"Connecting to Neo4j at {uri}...")

try:
    driver = GraphDatabase.driver(uri, auth=(user, password))
    
    with driver.session() as session:
        # Count all nodes
        result = session.run("MATCH (n) RETURN count(n) as count")
        count = result.single()["count"]
        print(f"\n✅ Total nodes in graph: {count}")
        
        # Get all nodes with details
        print("\n📊 All nodes in the graph:")
        print("-" * 80)
        
        result = session.run("""
            MATCH (n) 
            RETURN labels(n) as labels, 
                   properties(n) as props,
                   id(n) as node_id
            ORDER BY n.created_at DESC
            LIMIT 50
        """)
        
        nodes = list(result)
        if not nodes:
            print("No nodes found in the graph!")
        else:
            for i, record in enumerate(nodes, 1):
                print(f"\nNode {i}:")
                print(f"  ID: {record['node_id']}")
                print(f"  Labels: {record['labels']}")
                props = record['props']
                for key, value in props.items():
                    if key == 'content' and len(str(value)) > 100:
                        print(f"  {key}: {str(value)[:100]}...")
                    else:
                        print(f"  {key}: {value}")
        
        # Check for relationships
        print("\n\n🔗 Relationships:")
        print("-" * 80)
        
        result = session.run("""
            MATCH (a)-[r]->(b)
            RETURN type(r) as rel_type,
                   labels(a) as from_labels,
                   labels(b) as to_labels,
                   a.name as from_name,
                   b.name as to_name,
                   properties(r) as rel_props
            LIMIT 20
        """)
        
        relationships = list(result)
        if not relationships:
            print("No relationships found in the graph!")
        else:
            for i, record in enumerate(relationships, 1):
                print(f"\nRelationship {i}:")
                print(f"  ({record['from_labels']}: {record['from_name']}) -[{record['rel_type']}]-> ({record['to_labels']}: {record['to_name']})")
                if record['rel_props']:
                    print(f"  Properties: {record['rel_props']}")
        
        # Check specifically for Episode nodes
        print("\n\n📚 Episode nodes:")
        print("-" * 80)
        
        result = session.run("""
            MATCH (e:Episode)
            RETURN e.name as name,
                   e.content as content,
                   e.reference_time as time,
                   e.source as source,
                   e.created_at as created
            ORDER BY e.created_at DESC
        """)
        
        episodes = list(result)
        if not episodes:
            print("No Episode nodes found!")
        else:
            for i, record in enumerate(episodes, 1):
                print(f"\nEpisode {i}: {record['name']}")
                print(f"  Content: {record['content'][:200]}..." if record['content'] else "  Content: None")
                print(f"  Time: {record['time']}")
                print(f"  Source: {record['source']}")
                print(f"  Created: {record['created']}")
                
    driver.close()
    
except Exception as e:
    print(f"❌ Error connecting to Neo4j: {e}")
    print("\nMake sure Neo4j is running:")
    print("docker run -d --name neo4j -p 7474:7474 -p 7687:7687 -e NEO4J_AUTH=neo4j/cc-core-password neo4j:latest")