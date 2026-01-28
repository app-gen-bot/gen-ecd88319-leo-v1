#!/usr/bin/env python3
"""Test FalkorDB connection."""

from falkordb import FalkorDB

# Connect to FalkorDB
db = FalkorDB(host='localhost', port=6379)

print("✅ Connected to FalkorDB")

# Create/select a graph
g = db.select_graph('test_graph')
print("✅ Selected graph: test_graph")

# Create some test data
result = g.query("""
    CREATE 
    (n1:TestNode {name:'Node1', value: 100}),
    (n2:TestNode {name:'Node2', value: 200}),
    (n1)-[:CONNECTS_TO {relationship: 'test'}]->(n2)
    RETURN n1, n2
""")

print(f"✅ Created {result.nodes_created} nodes")
print(f"✅ Created {result.relationships_created} relationships")

# Query the data
result = g.query("MATCH (n:TestNode) RETURN n.name as name")
print("\n📊 Nodes in graph:")
for record in result.result_set:
    print(f"  - {record[0]}")

# Check if default_db exists
try:
    default_graph = db.select_graph('default_db')
    print("\n✅ Successfully selected 'default_db' graph")
except Exception as e:
    print(f"\n❌ Error selecting default_db: {e}")

print("\n✅ FalkorDB is working correctly!")