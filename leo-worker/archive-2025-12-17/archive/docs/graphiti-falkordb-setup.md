# Graphiti with FalkorDB Setup

## Overview
The App Factory project now uses FalkorDB as the graph database backend for Graphiti. This resolves the previous compatibility issues with Neo4j Community Edition.

## Why FalkorDB?
1. **Database Name Compatibility**: FalkorDB supports the "default_db" database name that graphiti-core expects
2. **Redis-Based**: Lightweight and fast graph database built on Redis
3. **No Enterprise License Required**: Open source and free to use
4. **GraphRAG Optimized**: Designed specifically for AI/ML and GenAI applications

## Installation

### 1. Run FalkorDB with Docker
```bash
docker run -d --name falkordb \
  -p 6379:6379 \
  -p 3000:3000 \
  -v ~/falkordb-data:/var/lib/falkordb/data \
  falkordb/falkordb:edge
```

### 2. Verify Installation
```bash
# Check if container is running
docker ps | grep falkordb

# Access the web UI (optional)
open http://localhost:3000
```

## Configuration

### Environment Variables
Add to your `.env` file:
```env
# FalkorDB Configuration (for Graphiti)
FALKORDB_HOST=localhost
FALKORDB_PORT=6379
```

### Python Dependencies
The FalkorDB client is automatically installed with:
```bash
uv pip install falkordb
```

## Usage

### Through ContextAwareAgent
```python
agent = ContextAwareAgent(
    name="MyAgent",
    allowed_tools=["mcp__graphiti"],
    enable_context_awareness=True
)

result = await agent.run(
    user_prompt="Add knowledge about X to the graph",
    mcp_servers={
        "graphiti": {
            "command": "uv",
            "args": ["run", "mcp-graphiti"],
            "env": {
                "FALKORDB_HOST": "localhost",
                "FALKORDB_PORT": "6379"
            }
        }
    }
)
```

### Direct Python Usage
```python
from graphiti_core import Graphiti
from graphiti_core.driver.falkordb_driver import FalkorDriver

# Create FalkorDB driver
driver = FalkorDriver(host="localhost", port=6379)

# Initialize Graphiti
graphiti = Graphiti(graph_driver=driver)

# Add episode
result = await graphiti.add_episode(
    name="My Episode",
    episode_body="Content here",
    source_description="Python Script",
    reference_time=datetime.now(timezone.utc)
)
```

## Verifying Data Storage

### Using FalkorDB Client
```python
from falkordb import FalkorDB

# Connect to FalkorDB
db = FalkorDB(host='localhost', port=6379)
g = db.select_graph('default_db')

# Query data
result = g.query("MATCH (n) RETURN count(n)")
print(f"Total nodes: {result.result_set[0][0]}")
```

### Using Redis CLI
```bash
# Connect to Redis (FalkorDB is Redis-based)
redis-cli -p 6379

# List graphs
GRAPH.LIST

# Query graph
GRAPH.QUERY default_db "MATCH (n) RETURN count(n)"
```

## What's Working
✅ Graphiti MCP server with FalkorDB backend
✅ Adding knowledge episodes
✅ Entity extraction and relationships
✅ Knowledge graph search
✅ ContextAwareAgent integration

## Migration from Neo4j
If you were previously using Neo4j:
1. Stop Neo4j: `neo4j stop`
2. Start FalkorDB as shown above
3. Update environment variables
4. The system will automatically use FalkorDB

## Troubleshooting

### Container Not Starting
```bash
# Check logs
docker logs falkordb

# Ensure ports are free
lsof -i :6379
lsof -i :3000
```

### Connection Refused
- Ensure Docker is running
- Check if FalkorDB container is up: `docker ps`
- Verify ports are correctly mapped

### Data Persistence
Data is stored in `~/falkordb-data`. To reset:
```bash
docker stop falkordb
docker rm falkordb
rm -rf ~/falkordb-data
# Then restart container
```