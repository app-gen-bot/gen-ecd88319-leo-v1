#!/usr/bin/env python3
"""Check what was stored in context awareness databases."""

import json
from pathlib import Path
from datetime import datetime

print("🔍 Checking Context Storage")
print("=" * 60)

# 1. Check Qdrant
print("\n1. Qdrant (Vector Database for mem0):")
import subprocess
try:
    # List collections
    result = subprocess.run(
        ["curl", "-s", "http://localhost:6333/collections"],
        capture_output=True,
        text=True
    )
    if result.returncode == 0:
        data = json.loads(result.stdout)
        collections = data.get("result", {}).get("collections", [])
        if collections:
            print(f"   ✅ Found {len(collections)} collections:")
            for col in collections:
                print(f"      - {col['name']}")
                # Get collection info
                info_result = subprocess.run(
                    ["curl", "-s", f"http://localhost:6333/collections/{col['name']}"],
                    capture_output=True,
                    text=True
                )
                if info_result.returncode == 0:
                    info = json.loads(info_result.stdout)
                    points = info.get("result", {}).get("points_count", 0)
                    print(f"        Points: {points}")
        else:
            print("   ❌ No collections found")
except Exception as e:
    print(f"   ❌ Error checking Qdrant: {e}")

# 2. Check Neo4j
print("\n2. Neo4j (Graph Database for graphiti):")
try:
    # Count nodes
    query = {"statements": [{"statement": "MATCH (n) RETURN count(n) as count, labels(n) as labels"}]}
    result = subprocess.run(
        ["curl", "-s", "-u", "neo4j:cc-core-password", "-X", "POST",
         "http://localhost:7474/db/neo4j/tx/commit",
         "-H", "Content-Type: application/json",
         "-d", json.dumps(query)],
        capture_output=True,
        text=True
    )
    if result.returncode == 0:
        data = json.loads(result.stdout)
        results = data.get("results", [])
        if results and results[0]["data"]:
            count = results[0]["data"][0]["row"][0]
            print(f"   ✅ Found {count} nodes")
            
            # Get node types
            type_query = {"statements": [{"statement": "MATCH (n) RETURN DISTINCT labels(n) as types, count(n) as count"}]}
            type_result = subprocess.run(
                ["curl", "-s", "-u", "neo4j:cc-core-password", "-X", "POST",
                 "http://localhost:7474/db/neo4j/tx/commit",
                 "-H", "Content-Type: application/json",
                 "-d", json.dumps(type_query)],
                capture_output=True,
                text=True
            )
            if type_result.returncode == 0:
                type_data = json.loads(type_result.stdout)
                type_results = type_data.get("results", [])
                if type_results and type_results[0]["data"]:
                    print("   Node types:")
                    for item in type_results[0]["data"]:
                        types = item["row"][0]
                        count = item["row"][1]
                        print(f"      - {types}: {count}")
        else:
            print("   ❌ No nodes found")
except Exception as e:
    print(f"   ❌ Error checking Neo4j: {e}")

# 3. Check session files
print("\n3. Context Manager Sessions:")
session_dir = Path(".agent_context")
if session_dir.exists():
    sessions = sorted(session_dir.glob("session_*.json"), key=lambda p: p.stat().st_mtime, reverse=True)
    if sessions:
        print(f"   ✅ Found {len(sessions)} sessions")
        # Show last 3
        for session in sessions[:3]:
            with open(session) as f:
                data = json.load(f)
            timestamp = datetime.fromisoformat(data.get("start_time", "")).strftime("%Y-%m-%d %H:%M:%S")
            tool_uses = data.get("tool_uses", 0)
            print(f"      - {session.name}")
            print(f"        Time: {timestamp}")
            print(f"        Tool uses: {tool_uses}")
    else:
        print("   ❌ No sessions found")
else:
    print("   ❌ No session directory")

# 4. Check latest logs
print("\n4. Recent Log Activity:")
log_dir = Path("logs")
if log_dir.exists():
    log_files = sorted(log_dir.glob("app_factory*.log"), key=lambda p: p.stat().st_mtime, reverse=True)
    if log_files:
        latest_log = log_files[0]
        print(f"   Latest log: {latest_log.name}")
        
        # Search for context tool usage
        with open(latest_log) as f:
            lines = f.readlines()
        
        context_lines = []
        for line in lines[-500:]:  # Last 500 lines
            if any(tool in line.lower() for tool in ["mem0", "graphiti", "context_manager", "storing", "memory", "graph"]):
                context_lines.append(line.strip())
        
        if context_lines:
            print("   Recent context tool mentions:")
            for line in context_lines[-5:]:  # Last 5 mentions
                print(f"      {line[:100]}...")
        else:
            print("   ❌ No context tool mentions in recent logs")

print("\n" + "="*60)
print("Summary:")
print("If databases are empty, it means the MCP servers weren't invoked.")
print("This happens when running Python directly instead of through Claude Code CLI.")