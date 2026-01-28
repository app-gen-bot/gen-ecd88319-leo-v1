#!/usr/bin/env python3
"""Quick check of tree_sitter usage in current session"""
import json
from pathlib import Path
from datetime import datetime

# Check logs
log_file = Path("/Users/labheshpatel/apps/app-factory/logs/tree_sitter_server.log")
print("🔍 Checking tree_sitter_server.log for tool usage...")
print("="*60)

# Look for MCP tool calls in the log
tool_calls = []
with open(log_file, 'r') as f:
    for line in f:
        if any(tool in line for tool in ['tool.', 'validate_syntax', 'fix_imports', 'analyze_code_structure', 
                                          'extract_component', 'detect_api_calls', 'track_dependencies']):
            if '2025-07-14 20:4' in line or '2025-07-14 20:5' in line:  # Recent calls
                tool_calls.append(line.strip())

if tool_calls:
    print(f"✅ Found {len(tool_calls)} recent tree_sitter tool calls:")
    for call in tool_calls[-10:]:  # Show last 10
        print(f"  • {call}")
else:
    print("❌ No tree_sitter tool calls found in recent logs")

# Check files created
print("\n📁 Files created in AI Lawyer frontend:")
frontend_dir = Path("/Users/labheshpatel/apps/app-factory/apps/ai-lawyer/frontend")
if frontend_dir.exists():
    tsx_files = list(frontend_dir.rglob("*.tsx"))
    ts_files = list(frontend_dir.rglob("*.ts"))
    print(f"  • {len(tsx_files)} .tsx files")
    print(f"  • {len(ts_files)} .ts files")
    
    # Show some recent files
    all_files = tsx_files + ts_files
    all_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
    print("\n  Recent files (by modification time):")
    for f in all_files[:5]:
        mod_time = datetime.fromtimestamp(f.stat().st_mtime).strftime("%H:%M:%S")
        print(f"    - {mod_time} {f.relative_to(frontend_dir)}")

# Check if MCP servers are running
print("\n🚀 MCP Server Status:")
import subprocess
result = subprocess.run(['ps', 'aux'], capture_output=True, text=True)
for line in result.stdout.split('\n'):
    if 'mcp-tree-sitter' in line and 'grep' not in line:
        print(f"  ✅ tree_sitter server is running")
        break
else:
    print(f"  ❌ tree_sitter server not found")

print("="*60)