#!/usr/bin/env python3
"""Monitor context awareness tools during orchestrator execution."""

import asyncio
import json
from pathlib import Path
from datetime import datetime
import subprocess

def check_neo4j_status():
    """Check if Neo4j is running for graphiti."""
    try:
        result = subprocess.run(['neo4j', 'status'], capture_output=True, text=True)
        return "running" in result.stdout.lower()
    except:
        return False

def check_mem0_storage():
    """Check mem0 storage location and contents."""
    # Common mem0 storage locations
    possible_paths = [
        Path.home() / ".mem0",
        Path.home() / ".local/share/mem0",
        Path("/tmp/mem0"),
        Path.cwd() / ".mem0"
    ]
    
    for path in possible_paths:
        if path.exists():
            print(f"\n📦 Found mem0 storage at: {path}")
            # List contents
            for item in path.rglob("*"):
                if item.is_file():
                    print(f"   - {item.relative_to(path)}")
            return path
    return None

def check_context_sessions():
    """Check for context management sessions."""
    session_dir = Path.cwd() / ".agent_context"
    if session_dir.exists():
        print(f"\n📋 Found context sessions at: {session_dir}")
        sessions = list(session_dir.glob("session_*.json"))
        print(f"   Total sessions: {len(sessions)}")
        
        # Show recent sessions
        if sessions:
            recent = sorted(sessions, key=lambda x: x.stat().st_mtime)[-5:]
            print("   Recent sessions:")
            for session in recent:
                print(f"     - {session.name}")
                # Peek inside
                try:
                    with open(session) as f:
                        data = json.load(f)
                        if "tools_used" in data:
                            print(f"       Tools: {', '.join(data['tools_used'])}")
                except:
                    pass
        return session_dir
    return None

def check_mcp_servers():
    """Check which MCP servers are configured."""
    print("\n🔌 MCP Server Configuration:")
    
    # Check for MCP server processes
    mcp_servers = ["mcp-mem0", "mcp-graphiti", "mcp-context-manager", 
                   "mcp-tree-sitter", "mcp-integration-analyzer"]
    
    for server in mcp_servers:
        try:
            result = subprocess.run(['pgrep', '-f', server], capture_output=True)
            if result.returncode == 0:
                print(f"   ✅ {server} is running")
            else:
                print(f"   ❌ {server} is not running")
        except:
            print(f"   ⚠️  Cannot check {server}")

def monitor_logs():
    """Monitor logs for context tool usage."""
    log_file = Path("logs") / "app_factory.log"
    if log_file.exists():
        print(f"\n📝 Monitoring logs at: {log_file}")
        print("   Recent context tool usage:")
        
        # Read last 1000 lines
        with open(log_file) as f:
            lines = f.readlines()[-1000:]
        
        context_keywords = ["mem0", "graphiti", "context_manager", "tree_sitter", 
                          "integration_analyzer", "memory", "graph", "session"]
        
        relevant_lines = []
        for line in lines:
            if any(keyword in line.lower() for keyword in context_keywords):
                relevant_lines.append(line.strip())
        
        # Show last 10 relevant lines
        for line in relevant_lines[-10:]:
            print(f"     {line[:100]}...")

def main():
    """Run all monitoring checks."""
    print("="*60)
    print("🔍 Context Awareness Tools Monitor")
    print("="*60)
    
    # Check Neo4j for graphiti
    print("\n🌐 Neo4j Status (for graphiti):")
    if check_neo4j_status():
        print("   ✅ Neo4j is running")
    else:
        print("   ❌ Neo4j is not running")
        print("   💡 Start with: neo4j start")
    
    # Check mem0 storage
    check_mem0_storage()
    
    # Check context sessions
    check_context_sessions()
    
    # Check MCP servers
    check_mcp_servers()
    
    # Monitor logs
    monitor_logs()
    
    print("\n" + "="*60)
    print("\n💡 What's happening behind the scenes:")
    print("""
1. When ContextAwareAgent initializes:
   - Loads previous context from .agent_context/
   - Configures MCP servers for each tool
   - Adds context awareness prompt to system prompt

2. During agent execution:
   - mem0: Stores important facts and decisions
   - graphiti: Creates knowledge graph relationships
   - context_manager: Tracks tool usage patterns
   - tree_sitter: Analyzes code structure
   - integration_analyzer: Finds patterns in changes

3. After execution:
   - Session context saved to .agent_context/
   - Memories persisted in mem0 storage
   - Graph relationships stored in Neo4j
   """)

if __name__ == "__main__":
    main()