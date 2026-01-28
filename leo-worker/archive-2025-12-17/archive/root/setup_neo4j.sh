#!/bin/bash
# Quick Neo4j setup for graphiti

echo "🔧 Neo4j Setup for Graphiti"
echo "=========================="

# Check if Neo4j is installed
if command -v neo4j &> /dev/null; then
    echo "✅ Neo4j is installed"
    
    # Check status
    if neo4j status | grep -q "running"; then
        echo "✅ Neo4j is running"
    else
        echo "⚠️  Neo4j is not running"
        echo "Starting Neo4j..."
        neo4j start
        
        echo "Waiting for Neo4j to start..."
        sleep 10
        
        if neo4j status | grep -q "running"; then
            echo "✅ Neo4j started successfully"
        else
            echo "❌ Failed to start Neo4j"
            echo "Try manually: neo4j start"
        fi
    fi
    
    echo ""
    echo "Neo4j Web Interface: http://localhost:7474"
    echo "Default credentials: neo4j/neo4j"
    echo ""
    echo "⚠️  Note: You may need to change the password on first login"
    echo "   The graphiti MCP server expects: neo4j/password"
    
else
    echo "❌ Neo4j is not installed"
    echo ""
    echo "To install on macOS:"
    echo "  brew install neo4j"
    echo ""
    echo "To install on Linux:"
    echo "  Visit: https://neo4j.com/download/"
fi

echo ""
echo "📌 Once Neo4j is running, graphiti will be able to:"
echo "   - Store knowledge graph relationships"
echo "   - Connect related concepts"
echo "   - Build a semantic understanding of your codebase"