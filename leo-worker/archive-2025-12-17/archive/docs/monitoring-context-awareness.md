# Monitoring Context Awareness Tools

## 1. Check Log Files

### Application Logs
The context-aware agents log their activities. Look for these indicators:

```bash
# Check the main app-factory logs
tail -f logs/app_factory*.log | grep -E "(mem0|graphiti|context_manager|ContextAware)"

# Look for context loading messages
grep "Loaded previous context" logs/*.log
grep "Context awareness features enabled" logs/*.log
```

### MCP Server Logs
Each MCP tool has its own logs:

```bash
# Check MCP server logs (if configured)
ls ~/.cache/mcp/logs/

# Monitor specific tool logs
tail -f ~/.cache/mcp/logs/mem0.log
tail -f ~/.cache/mcp/logs/graphiti.log
tail -f ~/.cache/mcp/logs/context_manager.log
```

## 2. Check Memory Storage

### Mem0 Storage
```bash
# Check if memory files are being created
ls -la ~/.mem0/
ls -la /Users/labheshpatel/apps/app-factory/.memory/

# Look for memory database
find . -name "*.db" -o -name "*.sqlite" | grep mem0
```

### Session Storage
```bash
# Check for session files
ls -la /Users/labheshpatel/apps/app-factory/.sessions/
ls -la apps/*/frontend/.agent_context/

# View recent session
cat apps/*/frontend/.agent_context/session_*.json | jq '.'
```

## 3. Monitor Graphiti (Neo4j)

### Check if Neo4j is Running
```bash
# Check Neo4j status
neo4j status

# Or check if port 7687 is open
lsof -i :7687

# Check Neo4j logs
tail -f /usr/local/var/log/neo4j/neo4j.log
```

### Query Graphiti Data
```bash
# Connect to Neo4j browser
open http://localhost:7474

# Or use cypher-shell
cypher-shell -u neo4j -p cc-core-password

# Sample queries to see if data is being stored:
MATCH (n) RETURN count(n);
MATCH (n) RETURN n LIMIT 10;
```

## 4. Environment Variables Check

```bash
# Verify environment variables are set
env | grep -E "(OPENAI_API_KEY|NEO4J|MCP_TOOLS|MEMORY_STORAGE|SESSION_STORAGE)"

# Check .env file
cat .env | grep -E "(OPENAI_API_KEY|NEO4J)"
```

## 5. Real-time Monitoring Script

Create this monitoring script:

```bash
#!/bin/bash
# save as monitor_context_tools.sh

echo "🔍 Monitoring Context Awareness Tools..."
echo "======================================="

# Check if context-aware agents are initialized
echo -e "\n📊 Context-Aware Agent Activity:"
tail -f logs/app_factory*.log | grep --line-buffered -E "(ContextAwareAgent|context awareness|mem0|graphiti|tree_sitter|context_manager|integration_analyzer)" &

# Monitor file creation in memory/session directories
echo -e "\n💾 Memory/Session File Activity:"
fswatch -o .memory/ .sessions/ apps/*/frontend/.agent_context/ 2>/dev/null | while read event; do
    echo "[$(date '+%H:%M:%S')] File activity detected"
done &

# Monitor Neo4j activity (if using lsof)
echo -e "\n🔗 Neo4j Connection Activity:"
while true; do
    connections=$(lsof -i :7687 2>/dev/null | grep -c ESTABLISHED)
    if [ $connections -gt 0 ]; then
        echo "[$(date '+%H:%M:%S')] Neo4j connections: $connections"
    fi
    sleep 5
done &

echo -e "\nPress Ctrl+C to stop monitoring..."
wait
```

## 6. Debug Mode for Agents

You can also modify agents to be more verbose:

```python
# In the agent initialization
agent = ContextAwareAgent(
    name="Test Agent",
    verbose=True,  # Enable verbose logging
    enable_context_awareness=True
)

# Or set environment variable
export CC_AGENT_DEBUG=true
```

## 7. Check MCP Tool Usage

Look for these patterns in logs:

```
# Tool initialization
"MCP instance created successfully"
"Tools registered successfully"

# Tool calls
"[TOOL_CALL] add_memory invoked"
"[TOOL_CALL] search_memories invoked"
"[TOOL_CALL] get_memory_graph invoked"
"[TOOL_CALL] analyze_query invoked"
```

## 8. Verify Integration

Run this quick test to see if tools are available:

```python
# test_context_tools.py
from app_factory.agents.stage_2_wireframe.wireframe import WireframeAgent

agent = WireframeAgent("/tmp/test", enable_context_awareness=True)
print(f"Agent name: {agent.name}")
print(f"Context awareness enabled: {agent.enable_context_awareness}")
print(f"Available tools: {agent.allowed_tools}")
print(f"Context tools: {[t for t in agent.allowed_tools if t in ['mem0', 'graphiti', 'context_manager', 'tree_sitter', 'integration_analyzer']]}")
```

## 9. Common Issues to Watch For

1. **No memory storage**: Check OPENAI_API_KEY is set
2. **No Graphiti activity**: Verify Neo4j is running and credentials are correct
3. **Tools not available**: Check MCP_TOOLS path is correct
4. **No context loading**: First run won't have previous context

## 10. Success Indicators

You'll know context awareness is working when you see:
- "Loaded previous context into prompt" in logs
- Session files created in `.agent_context/`
- Memory queries being executed
- Neo4j connections established
- Tool usage patterns in logs