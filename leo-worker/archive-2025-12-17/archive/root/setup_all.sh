#!/bin/bash
# Complete setup for AI App Factory with Context Awareness

set -e

echo "🏭 AI App Factory - Complete Context Awareness Setup"
echo "==================================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Step 1: Check prerequisites
echo -e "${BLUE}Step 1: Checking prerequisites...${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker not installed. Please install Docker Desktop first.${NC}"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker not running. Please start Docker Desktop.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker is ready${NC}"

# Check Python environment
if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}⚠️  Virtual environment not found. Creating...${NC}"
    uv venv
fi
echo -e "${GREEN}✅ Python environment ready${NC}"

# Step 2: Install dependencies
echo -e "\n${BLUE}Step 2: Installing dependencies...${NC}"

# Check if cc-tools is installed
if ! uv pip show cc-tools &> /dev/null; then
    echo "Installing cc-tools..."
    uv pip install -e /Users/labheshpatel/apps/cc-core/cc-tools
fi
echo -e "${GREEN}✅ cc-tools installed${NC}"

# Check MCP executables
if [ -f ".venv/bin/mcp-mem0" ]; then
    echo -e "${GREEN}✅ MCP servers available${NC}"
else
    echo -e "${YELLOW}⚠️  MCP servers not found. Reinstalling cc-tools...${NC}"
    uv pip install --force-reinstall -e /Users/labheshpatel/apps/cc-core/cc-tools
fi

# Step 3: Setup environment
echo -e "\n${BLUE}Step 3: Setting up environment...${NC}"
source ./setup_context_env.sh

# Step 4: Start Docker services
echo -e "\n${BLUE}Step 4: Starting Docker services...${NC}"
./manage_services.sh start

# Step 5: Verify setup
echo -e "\n${BLUE}Step 5: Verifying setup...${NC}"

# Check Neo4j
if curl -s http://localhost:7474 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Neo4j is accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Neo4j not accessible yet${NC}"
fi

# Check Qdrant
if curl -s http://localhost:6333/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Qdrant is accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Qdrant not accessible yet${NC}"
fi

# Check .mcp.json
if [ -f ".mcp.json" ]; then
    echo -e "${GREEN}✅ MCP configuration found${NC}"
else
    echo -e "${YELLOW}⚠️  .mcp.json not found${NC}"
fi

# Final message
echo -e "\n${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Run a test: uv run python test_context_aware_orchestrator.py"
echo "2. Or test with your prompt: uv run python test_stage0_slack_asana.py"
echo ""
echo "Service URLs:"
echo "  - Neo4j Browser: http://localhost:7474 (neo4j/cc-core-password)"
echo "  - Qdrant Dashboard: http://localhost:6333/dashboard"
echo ""
echo "The orchestrator will now:"
echo "  - Store memories in Qdrant"
echo "  - Build knowledge graphs in Neo4j"
echo "  - Track patterns across sessions"
echo "  - Learn and improve over time"