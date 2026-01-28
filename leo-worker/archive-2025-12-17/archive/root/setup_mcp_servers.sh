#!/bin/bash
# Setup MCP servers for context awareness in AI App Factory

echo "🚀 Setting up MCP servers for context awareness"
echo "=============================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Base paths
APP_FACTORY_DIR="/Users/labheshpatel/apps/app-factory"
MCP_TOOLS_DIR="/Users/labheshpatel/apps/ai-workspace/mcp-tools"
CC_CORE_DIR="/Users/labheshpatel/apps/cc-core"

# Check if directories exist
if [ ! -d "$MCP_TOOLS_DIR" ]; then
    echo -e "${RED}❌ MCP tools directory not found at: $MCP_TOOLS_DIR${NC}"
    echo "Please clone/install mcp-tools first"
    exit 1
fi

# Create MCP config for context awareness tools
create_mcp_config() {
    echo -e "\n${YELLOW}📝 Creating MCP configuration...${NC}"
    
    cat > "$APP_FACTORY_DIR/mcp_config.json" <<EOF
{
  "mcpServers": {
    "mem0": {
      "type": "stdio",
      "command": "uv",
      "args": [
        "--directory",
        "$MCP_TOOLS_DIR",
        "run",
        "mcp-mem0"
      ],
      "env": {
        "MCP_LOG_LEVEL": "INFO",
        "MEM0_STORAGE_PATH": "$HOME/.mem0",
        "MEM0_NAMESPACE": "orchestrator_prds"
      }
    },
    "graphiti": {
      "type": "stdio",
      "command": "uv",
      "args": [
        "--directory",
        "$MCP_TOOLS_DIR",
        "run",
        "mcp-graphiti"
      ],
      "env": {
        "MCP_LOG_LEVEL": "INFO",
        "NEO4J_URI": "bolt://localhost:7687",
        "NEO4J_USER": "neo4j",
        "NEO4J_PASSWORD": "password"
      }
    },
    "context_manager": {
      "type": "stdio",
      "command": "uv",
      "args": [
        "--directory",
        "$MCP_TOOLS_DIR",
        "run",
        "mcp-context-manager"
      ],
      "env": {
        "MCP_LOG_LEVEL": "INFO",
        "CONTEXT_STORAGE_PATH": "$APP_FACTORY_DIR/.agent_context"
      }
    },
    "tree_sitter": {
      "type": "stdio",
      "command": "uv",
      "args": [
        "--directory",
        "$MCP_TOOLS_DIR",
        "run",
        "mcp-tree-sitter"
      ],
      "env": {
        "MCP_LOG_LEVEL": "INFO"
      }
    },
    "integration_analyzer": {
      "type": "stdio",
      "command": "uv",
      "args": [
        "--directory",
        "$MCP_TOOLS_DIR",
        "run",
        "mcp-integration-analyzer"
      ],
      "env": {
        "MCP_LOG_LEVEL": "INFO"
      }
    },
    "browser": {
      "type": "stdio",
      "command": "uv",
      "args": [
        "--directory",
        "$MCP_TOOLS_DIR",
        "run",
        "mcp-browser",
        "--workspace",
        "$APP_FACTORY_DIR"
      ],
      "env": {
        "MCP_LOG_LEVEL": "INFO"
      }
    },
    "build_test": {
      "type": "stdio",
      "command": "uv",
      "args": [
        "--directory",
        "$MCP_TOOLS_DIR",
        "run",
        "mcp-build-test",
        "--workspace",
        "$APP_FACTORY_DIR"
      ],
      "env": {
        "MCP_LOG_LEVEL": "INFO"
      }
    }
  }
}
EOF
    
    echo -e "${GREEN}✅ Created MCP configuration at: $APP_FACTORY_DIR/mcp_config.json${NC}"
}

# Check Neo4j status
check_neo4j() {
    echo -e "\n${YELLOW}🔍 Checking Neo4j status...${NC}"
    
    if command -v neo4j &> /dev/null; then
        if neo4j status | grep -q "running"; then
            echo -e "${GREEN}✅ Neo4j is running${NC}"
        else
            echo -e "${YELLOW}⚠️  Neo4j is installed but not running${NC}"
            echo "Starting Neo4j..."
            neo4j start
            sleep 5
            if neo4j status | grep -q "running"; then
                echo -e "${GREEN}✅ Neo4j started successfully${NC}"
            else
                echo -e "${RED}❌ Failed to start Neo4j${NC}"
                echo "Please start Neo4j manually with: neo4j start"
            fi
        fi
    else
        echo -e "${RED}❌ Neo4j not installed${NC}"
        echo "Please install Neo4j for graphiti to work:"
        echo "  brew install neo4j"
    fi
}

# Create directories for storage
create_storage_dirs() {
    echo -e "\n${YELLOW}📁 Creating storage directories...${NC}"
    
    # mem0 storage
    mkdir -p "$HOME/.mem0"
    echo -e "${GREEN}✅ Created mem0 storage at: $HOME/.mem0${NC}"
    
    # Context manager storage
    mkdir -p "$APP_FACTORY_DIR/.agent_context"
    echo -e "${GREEN}✅ Created context storage at: $APP_FACTORY_DIR/.agent_context${NC}"
}

# Install MCP tools if needed
install_mcp_tools() {
    echo -e "\n${YELLOW}📦 Checking MCP tools installation...${NC}"
    
    cd "$MCP_TOOLS_DIR"
    
    # Check if virtual environment exists
    if [ ! -d ".venv" ]; then
        echo "Creating virtual environment..."
        uv venv
    fi
    
    # Install dependencies
    echo "Installing MCP tools dependencies..."
    uv pip install -e .
    
    echo -e "${GREEN}✅ MCP tools ready${NC}"
}

# Create shell configuration
create_shell_config() {
    echo -e "\n${YELLOW}🐚 Creating shell configuration...${NC}"
    
    cat > "$APP_FACTORY_DIR/setup_mcp_env.sh" <<'EOF'
#!/bin/bash
# Source this file to set up MCP environment

# Set MCP configuration
export CLAUDE_MCP_CONFIG=$(cat /Users/labheshpatel/apps/app-factory/mcp_config.json)

# Optional: Set individual tool paths for debugging
export MCP_MEM0_PATH="/Users/labheshpatel/apps/ai-workspace/mcp-tools"
export MCP_GRAPHITI_PATH="/Users/labheshpatel/apps/ai-workspace/mcp-tools"
export MCP_CONTEXT_MANAGER_PATH="/Users/labheshpatel/apps/ai-workspace/mcp-tools"

echo "✅ MCP environment configured"
echo "   - mem0: memory storage"
echo "   - graphiti: knowledge graph"
echo "   - context_manager: session tracking"
echo "   - tree_sitter: code analysis"
echo "   - integration_analyzer: pattern detection"
EOF
    
    chmod +x "$APP_FACTORY_DIR/setup_mcp_env.sh"
    echo -e "${GREEN}✅ Created setup script at: $APP_FACTORY_DIR/setup_mcp_env.sh${NC}"
}

# Main execution
main() {
    create_mcp_config
    check_neo4j
    create_storage_dirs
    install_mcp_tools
    create_shell_config
    
    echo -e "\n${GREEN}✅ MCP server setup complete!${NC}"
    echo -e "\n${YELLOW}To activate MCP servers:${NC}"
    echo "1. Start Neo4j (if not running): neo4j start"
    echo "2. Source the environment: source $APP_FACTORY_DIR/setup_mcp_env.sh"
    echo "3. Run your orchestrator test again"
    echo ""
    echo "The orchestrator will now have access to:"
    echo "  - mem0: Long-term memory storage"
    echo "  - graphiti: Knowledge graph relationships"
    echo "  - context_manager: Session and pattern tracking"
    echo "  - tree_sitter: Code understanding"
    echo "  - integration_analyzer: Integration patterns"
}

# Run main
main