#!/bin/bash
# Setup environment for context-aware MCP servers

echo "🔧 Setting up Context Awareness Environment"
echo "=========================================="

# Create .env file for MCP servers
cat > .env <<EOF
# Neo4j Configuration (for graphiti)
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=cc-core-password
NEO4J_USERNAME=neo4j  # Some tools use USERNAME instead of USER

# Qdrant Configuration (for mem0)
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION=app_factory_memories

# OpenAI API Key (for mem0 embeddings)
OPENAI_API_KEY=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

# Session tracking
CONTEXT_STORAGE_PATH=/Users/labheshpatel/apps/app-factory/.agent_context

# Logging
MCP_LOG_LEVEL=INFO
EOF

echo "✅ Created .env file with service configurations"

# Export environment variables for current session
export NEO4J_URI=bolt://localhost:7687
export NEO4J_USER=neo4j
export NEO4J_USERNAME=neo4j
export NEO4J_PASSWORD=cc-core-password
export QDRANT_URL=http://localhost:6333
export QDRANT_COLLECTION=app_factory_memories
export CONTEXT_STORAGE_PATH=/Users/labheshpatel/apps/app-factory/.agent_context
export MCP_LOG_LEVEL=INFO
export OPENAI_API_KEY=sk-proj-apBcc-7t1y6N2xkNetOcZ3nn4khrZB8TZGAtOG9Sd1GIfqiYqZNoJo6dGsZB7-amTJgoc6QBGLT781WZRcMbS0lxYA

echo "✅ Environment variables set for current session"

# Check if Docker services are running
echo ""
echo "Checking Docker services..."
if docker ps | grep -q "app-factory-neo4j"; then
    echo "✅ Neo4j is running"
else
    echo "❌ Neo4j is not running"
    echo "   Run: ./manage_services.sh start"
fi

if docker ps | grep -q "app-factory-qdrant"; then
    echo "✅ Qdrant is running"
else
    echo "❌ Qdrant is not running"
    echo "   Run: ./manage_services.sh start"
fi

echo ""
echo "📌 Next steps:"
echo "1. Start Docker services if not running: ./manage_services.sh start"
echo "2. Run your orchestrator test"
echo ""
echo "The MCP servers will use these connections:"
echo "  - graphiti → Neo4j at localhost:7687"
echo "  - mem0 → Qdrant at localhost:6333"