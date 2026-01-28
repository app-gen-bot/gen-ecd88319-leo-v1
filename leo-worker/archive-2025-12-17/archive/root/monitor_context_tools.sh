#!/bin/bash
# Monitor context awareness tools in real-time

echo "🔍 Monitoring Context Awareness Tools for App Factory"
echo "===================================================="
echo "Press Ctrl+C to stop monitoring"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Monitor context-aware agent logs
echo -e "${BLUE}📊 Context-Aware Agent Activity:${NC}"
echo "-----------------------------------"
tail -f logs/context_aware_agent_*.log 2>/dev/null | while read line; do
    if [[ $line == *"Context awareness features enabled"* ]]; then
        echo -e "${GREEN}✓ $line${NC}"
    elif [[ $line == *"Loaded previous context"* ]]; then
        echo -e "${GREEN}✓ $line${NC}"
    elif [[ $line == *"Captured session context"* ]]; then
        echo -e "${YELLOW}💾 $line${NC}"
    elif [[ $line == *"mem0"* ]] || [[ $line == *"graphiti"* ]] || [[ $line == *"context_manager"* ]]; then
        echo -e "${BLUE}🔧 $line${NC}"
    fi
done &
LOG_PID=$!

# Monitor session files
echo -e "\n${BLUE}💾 Session File Activity:${NC}"
echo "-----------------------------------"
watch_dirs="apps/*/frontend/.agent_context"
if command -v fswatch &> /dev/null; then
    fswatch -o $watch_dirs 2>/dev/null | while read event; do
        echo -e "${YELLOW}[$(date '+%H:%M:%S')] New session file created${NC}"
        latest_file=$(find apps/*/frontend/.agent_context -name "*.json" -type f -print0 | xargs -0 ls -t | head -1)
        if [ -n "$latest_file" ]; then
            echo -e "  📄 File: $latest_file"
            echo -e "  📊 Size: $(ls -lh "$latest_file" | awk '{print $5}')"
        fi
    done &
    WATCH_PID=$!
else
    echo "  ⚠️  fswatch not installed. Install with: brew install fswatch"
fi

# Monitor Neo4j connections
echo -e "\n${BLUE}🔗 Neo4j/Graphiti Activity:${NC}"
echo "-----------------------------------"
while true; do
    connections=$(lsof -i :7687 2>/dev/null | grep -c ESTABLISHED)
    if [ $connections -gt 0 ]; then
        echo -e "${GREEN}[$(date '+%H:%M:%S')] Active Neo4j connections: $connections${NC}"
    fi
    sleep 5
done &
NEO4J_PID=$!

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}Stopping monitors...${NC}"
    kill $LOG_PID $WATCH_PID $NEO4J_PID 2>/dev/null
    exit 0
}

trap cleanup INT

# Wait for all background processes
wait