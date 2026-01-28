# Context Awareness Setup for AI App Factory

This guide explains how to enable full context awareness for the AI App Factory orchestrator and other agents.

## Overview

Context awareness allows agents to:
- **Remember** previous interactions and decisions (mem0)
- **Build relationships** between concepts (graphiti)
- **Track patterns** across sessions (context_manager)
- **Understand code** structure (tree_sitter)
- **Analyze integrations** (integration_analyzer)

## Prerequisites

1. **Docker Desktop** installed and running
2. **Python environment** with app-factory dependencies
3. **cc-tools** installed (already done if you followed setup)

## Quick Start

```bash
# 1. Start the Docker services
./manage_services.sh start

# 2. Setup environment variables
source ./setup_context_env.sh

# 3. Test the orchestrator
uv run python test_context_aware_orchestrator.py
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  AI App Factory                      │
│                                                      │
│  ┌─────────────────┐    ┌──────────────────────┐   │
│  │  Orchestrator   │───▶│   MCP Servers        │   │
│  │ (ContextAware)  │    │  ┌──────────────┐   │   │
│  └─────────────────┘    │  │    mem0      │   │   │
│                         │  │  (memories)  │   │   │
│                         │  └──────┬───────┘   │   │
│                         │         │            │   │
│                         │  ┌──────▼───────┐   │   │
│                         │  │   graphiti   │   │   │
│                         │  │ (knowledge)  │   │   │
│                         │  └──────┬───────┘   │   │
│                         └─────────┼────────────┘   │
│                                   │                 │
└───────────────────────────────────┼─────────────────┘
                                    │
                          ┌─────────▼──────────┐
                          │  Docker Services   │
                          │                    │
                          │  ┌─────────────┐  │
                          │  │   Neo4j     │  │
                          │  │  (graphs)   │  │
                          │  └─────────────┘  │
                          │                    │
                          │  ┌─────────────┐  │
                          │  │   Qdrant    │  │
                          │  │  (vectors)  │  │
                          │  └─────────────┘  │
                          └────────────────────┘
```

## Service Details

### Neo4j (Graph Database)
- **Port**: 7687 (Bolt), 7474 (Web UI)
- **Credentials**: neo4j/password
- **Web UI**: http://localhost:7474
- **Used by**: graphiti for knowledge graph

### Qdrant (Vector Database)
- **Port**: 6333 (HTTP), 6334 (gRPC)
- **Dashboard**: http://localhost:6333/dashboard
- **Used by**: mem0 for memory storage

## How It Works

1. **When you run the orchestrator**:
   - The `.mcp.json` file tells Claude Code which MCP servers to use
   - Each MCP server connects to its respective service (Neo4j/Qdrant)

2. **During PRD generation**:
   - **mem0** stores important decisions and patterns
   - **graphiti** creates nodes for app types and features
   - **context_manager** tracks the session

3. **Over time**:
   - The system learns from each PRD
   - Similar requests benefit from previous knowledge
   - Patterns emerge and improve quality

## Verifying It's Working

### 1. Check Docker Services
```bash
./manage_services.sh status
```

### 2. Check MCP Servers
When running the orchestrator, you should see in logs:
- "Initialized ContextAwareAgent"
- "Context awareness features enabled"

### 3. Check Data Storage

**Neo4j**: Visit http://localhost:7474 and run:
```cypher
MATCH (n) RETURN n LIMIT 25
```

**Qdrant**: Visit http://localhost:6333/dashboard

### 4. Check Session Files
```bash
ls -la .agent_context/
```

## Troubleshooting

### Services not starting?
```bash
# Check Docker
docker ps

# Check logs
./manage_services.sh logs

# Restart services
./manage_services.sh restart
```

### MCP servers not found?
```bash
# Verify cc-tools installation
uv pip show cc-tools

# Check executables
ls .venv/bin/mcp-*
```

### No data being stored?
1. Ensure services are running
2. Check environment variables: `env | grep -E "NEO4J|QDRANT"`
3. Look for errors in logs

## Managing Data

### View logs
```bash
./manage_services.sh logs
```

### Clean all data (careful!)
```bash
./manage_services.sh clean
```

### Backup data
```bash
docker volume create app-factory-backup
docker run --rm -v app-factory-neo4j-data:/source -v app-factory-backup:/backup alpine tar -czf /backup/neo4j-backup.tar.gz -C /source .
```

## Advanced Usage

### Custom Memory Namespace
Edit the orchestrator config to use different namespaces:
```python
MEMORY_NAMESPACE = "orchestrator_prds_v2"
```

### Adjusting Memory Retention
Configure in `.env`:
```bash
MEM0_RETENTION_DAYS=30
```

## What Gets Stored?

### In mem0 (Qdrant):
- PRD summaries
- Key decisions
- App type patterns
- Common requirements

### In graphiti (Neo4j):
- App nodes (e.g., "FlowSync", "TaskManager")
- Feature nodes (e.g., "real-time-chat", "task-management")
- Relationships (e.g., "FlowSync" -[HAS_FEATURE]-> "real-time-chat")

### In context_manager:
- Session metadata
- Tool usage patterns
- Decision tracking

## Next Steps

1. Generate multiple PRDs to build knowledge
2. Query similar apps to see pattern matching
3. Extend to other agents (Stage 1, 2, etc.)
4. Monitor improvement over time

The more you use it, the smarter it gets!