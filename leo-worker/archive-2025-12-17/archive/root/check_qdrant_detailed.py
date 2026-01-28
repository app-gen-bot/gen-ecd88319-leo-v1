#!/usr/bin/env python3
"""Check Qdrant collections in detail."""

from qdrant_client import QdrantClient

client = QdrantClient(host="localhost", port=6333)

# Get all collections
collections = client.get_collections().collections
print("Collections:")
for col in collections:
    print(f"  - {col.name}")
    
    # Get collection info
    info = client.get_collection(col.name)
    print(f"    Points: {info.points_count}")
    print(f"    Vectors: {info.vectors_count}")
    
    # Get actual points
    if info.points_count > 0:
        points = client.scroll(
            collection_name=col.name,
            limit=10,
            with_payload=True,
            with_vectors=False
        )[0]
        
        print(f"    Latest points:")
        for point in points[:3]:
            print(f"      ID: {point.id}")
            if point.payload:
                print(f"      Memory: {point.payload.get('memory', 'N/A')[:100]}...")
                print(f"      Created: {point.payload.get('created_at', 'N/A')}")
                print(f"      User: {point.payload.get('user_id', 'N/A')}")
                print(f"      Context: {point.payload.get('metadata', {}).get('context', 'N/A')}")
            print()