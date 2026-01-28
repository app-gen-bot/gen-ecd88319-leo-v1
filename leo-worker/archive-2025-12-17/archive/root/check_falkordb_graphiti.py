#!/usr/bin/env python3
"""Check what's stored in FalkorDB through Graphiti."""

from falkordb import FalkorDB

# Connect to FalkorDB
db = FalkorDB(host='localhost', port=6379)

# Select the default_db graph (what graphiti uses)
g = db.select_graph('default_db')

print("📊 Checking FalkorDB 'default_db' graph...")

# Count nodes
result = g.query("MATCH (n) RETURN count(n) as node_count")
node_count = result.result_set[0][0] if result.result_set else 0
print(f"\nTotal nodes: {node_count}")

# Get node types
result = g.query("MATCH (n) RETURN DISTINCT labels(n) as labels, count(n) as count")
print("\nNode types:")
for record in result.result_set:
    labels = record[0]
    count = record[1]
    print(f"  - {labels}: {count}")

# Get recent episodes
result = g.query("MATCH (e:Episodic) RETURN e.name as name, e.created_at as created ORDER BY e.created_at DESC LIMIT 5")
print("\nRecent episodes:")
for record in result.result_set:
    print(f"  - {record[0]}")

# Get entities
result = g.query("MATCH (n:Entity) RETURN n.name as name, n.summary as summary LIMIT 10")
print("\nEntities:")
for record in result.result_set:
    print(f"  - {record[0]}: {record[1] if record[1] else 'No summary'}")

# Check relationships
result = g.query("MATCH ()-[r]->() RETURN type(r) as type, count(r) as count")
print("\nRelationship types:")
for record in result.result_set:
    print(f"  - {record[0]}: {record[1]}")