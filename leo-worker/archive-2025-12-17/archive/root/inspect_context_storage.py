#!/usr/bin/env python3
"""Inspect what's stored in context awareness tools."""

import json
import sqlite3
from pathlib import Path
from datetime import datetime

def inspect_mem0_database():
    """Inspect mem0 SQLite database if it exists."""
    print("\n🧠 MEM0 MEMORY STORAGE")
    print("="*50)
    
    # Common locations for mem0 db
    possible_dbs = [
        Path.home() / ".mem0" / "memory.db",
        Path.home() / ".local/share/mem0" / "memory.db",
        Path("/tmp/mem0") / "memory.db",
    ]
    
    for db_path in possible_dbs:
        if db_path.exists():
            print(f"\n📁 Found mem0 database at: {db_path}")
            
            try:
                conn = sqlite3.connect(db_path)
                cursor = conn.cursor()
                
                # Get tables
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
                tables = cursor.fetchall()
                print(f"\n   Tables: {[t[0] for t in tables]}")
                
                # Try to get memories
                try:
                    cursor.execute("SELECT * FROM memories ORDER BY created_at DESC LIMIT 10;")
                    memories = cursor.fetchall()
                    
                    if memories:
                        print(f"\n   Recent memories ({len(memories)} shown):")
                        for mem in memories:
                            print(f"\n   Memory ID: {mem[0] if len(mem) > 0 else 'N/A'}")
                            print(f"   Content: {str(mem[1])[:200] if len(mem) > 1 else 'N/A'}...")
                            print(f"   Created: {mem[2] if len(mem) > 2 else 'N/A'}")
                except Exception as e:
                    print(f"   Could not read memories table: {e}")
                
                conn.close()
            except Exception as e:
                print(f"   Error reading database: {e}")
            
            return True
    
    print("   ❌ No mem0 database found")
    return False

def inspect_graphiti_neo4j():
    """Check graphiti knowledge graph in Neo4j."""
    print("\n\n🔗 GRAPHITI KNOWLEDGE GRAPH")
    print("="*50)
    
    try:
        from neo4j import GraphDatabase
        
        # Default Neo4j connection
        uri = "bolt://localhost:7687"
        driver = GraphDatabase.driver(uri, auth=("neo4j", "password"))
        
        with driver.session() as session:
            # Count nodes
            result = session.run("MATCH (n) RETURN count(n) as count")
            node_count = result.single()["count"]
            print(f"\n   Total nodes in graph: {node_count}")
            
            # Get recent nodes
            result = session.run("""
                MATCH (n) 
                RETURN n 
                ORDER BY n.created_at DESC 
                LIMIT 5
            """)
            
            print("\n   Recent nodes:")
            for record in result:
                node = record["n"]
                print(f"\n   - Type: {list(node.labels)}")
                print(f"     Properties: {dict(node)}")
            
            # Get relationships
            result = session.run("MATCH ()-[r]->() RETURN count(r) as count")
            rel_count = result.single()["count"]
            print(f"\n   Total relationships: {rel_count}")
            
        driver.close()
        
    except ImportError:
        print("   ⚠️  neo4j package not installed")
        print("   💡 Install with: pip install neo4j")
    except Exception as e:
        print(f"   ❌ Could not connect to Neo4j: {e}")
        print("   💡 Make sure Neo4j is running (neo4j start)")

def inspect_context_sessions():
    """Inspect context management sessions in detail."""
    print("\n\n📊 CONTEXT MANAGEMENT SESSIONS")
    print("="*50)
    
    session_dir = Path.cwd() / ".agent_context"
    if not session_dir.exists():
        print("   ❌ No context sessions found")
        return
    
    sessions = sorted(session_dir.glob("session_*.json"), 
                     key=lambda x: x.stat().st_mtime, reverse=True)
    
    if not sessions:
        print("   No sessions found")
        return
    
    # Inspect most recent session
    latest = sessions[0]
    print(f"\n   Latest session: {latest.name}")
    
    try:
        with open(latest) as f:
            data = json.load(f)
        
        print(f"\n   Session details:")
        print(f"   - Start time: {data.get('start_time', 'N/A')}")
        print(f"   - Agent: {data.get('agent_name', 'N/A')}")
        print(f"   - Tools used: {', '.join(data.get('tools_used', []))}")
        
        if "tool_interactions" in data:
            print(f"\n   Tool interaction patterns:")
            for tool, count in data["tool_interactions"].items():
                print(f"     - {tool}: {count} times")
        
        if "decisions" in data:
            print(f"\n   Decisions made: {len(data['decisions'])}")
            for decision in data["decisions"][:3]:
                print(f"     - {decision}")
        
        if "files_modified" in data:
            print(f"\n   Files modified: {len(data['files_modified'])}")
            for file in data["files_modified"][:5]:
                print(f"     - {file}")
                
    except Exception as e:
        print(f"   Error reading session: {e}")

def check_orchestrator_namespace():
    """Check for orchestrator-specific memories."""
    print("\n\n🎯 ORCHESTRATOR-SPECIFIC CONTEXT")
    print("="*50)
    
    # The orchestrator uses namespace "orchestrator_prds"
    print("\n   Namespace: orchestrator_prds")
    print("   Tags: ['prd', 'requirements', 'app_ideas']")
    
    # Check if any PRD patterns are stored
    print("\n   💡 The orchestrator should be storing:")
    print("      - Generated PRDs")
    print("      - Common app patterns")
    print("      - Requirement patterns")
    print("      - User preferences")

def main():
    """Run all inspections."""
    print("="*60)
    print("🔍 Context Storage Inspector")
    print("="*60)
    
    inspect_mem0_database()
    inspect_graphiti_neo4j()
    inspect_context_sessions()
    check_orchestrator_namespace()
    
    print("\n\n" + "="*60)
    print("📌 SUMMARY")
    print("="*60)
    print("""
The orchestrator agent with context awareness should be:

1. Storing memories in mem0:
   - Key decisions about the PRD
   - Important requirements
   - App type patterns

2. Creating graph relationships in graphiti:
   - Connecting similar app types
   - Linking features to apps
   - Building requirement patterns

3. Tracking sessions in context_manager:
   - What tools were used
   - How many turns taken
   - Files created/modified

If you don't see much data, it might be because:
- This is the first run
- MCP servers aren't running
- Neo4j isn't started
- The agent is in plan mode (not executing tools)
""")

if __name__ == "__main__":
    main()