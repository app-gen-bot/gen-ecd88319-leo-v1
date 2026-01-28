#!/usr/bin/env python3
"""Real-time MCP tool usage monitor"""
import time
import subprocess
import os
from pathlib import Path
from datetime import datetime

def monitor_mcp_tools():
    print("\n🔍 REAL-TIME MCP TOOL MONITORING")
    print("="*70)
    print(f"Started at: {datetime.now().strftime('%H:%M:%S')}")
    print("Monitoring tree_sitter tool usage...")
    print("-"*70)
    
    # Monitor log file
    log_file = "/Users/labheshpatel/apps/app-factory/logs/tree_sitter_server.log"
    
    # Get initial file size
    last_size = os.path.getsize(log_file) if os.path.exists(log_file) else 0
    
    print("\nWatching for new log entries...")
    print("(Press Ctrl+C to stop)\n")
    
    try:
        while True:
            current_size = os.path.getsize(log_file)
            
            if current_size > last_size:
                # New content added
                with open(log_file, 'rb') as f:
                    f.seek(last_size)
                    new_content = f.read(current_size - last_size).decode('utf-8', errors='ignore')
                    
                    # Look for tool calls
                    for line in new_content.split('\n'):
                        if any(keyword in line for keyword in [
                            'tool.validate_syntax',
                            'tool.fix_imports',
                            'tool.analyze_code_structure',
                            'tool.extract_component',
                            'tool.analyze_component_props',
                            'tool.find_code_patterns',
                            'tool.track_dependencies',
                            'tool.detect_api_calls',
                            'Validating syntax for',
                            'Analyzing code structure',
                            'Fixing imports for',
                            'Extracting component',
                            'Detecting API calls',
                            'Finding code patterns'
                        ]):
                            timestamp = datetime.now().strftime('%H:%M:%S')
                            print(f"[{timestamp}] 🎯 TOOL CALL: {line.strip()}")
                
                last_size = current_size
            
            # Also check file creation
            frontend_dir = Path("/Users/labheshpatel/apps/app-factory/apps/ai-lawyer/frontend")
            if frontend_dir.exists():
                recent_files = []
                for ext in ['*.tsx', '*.ts']:
                    for f in frontend_dir.rglob(ext):
                        if time.time() - f.stat().st_mtime < 10:  # Files modified in last 10 seconds
                            recent_files.append(f)
                
                if recent_files:
                    for f in recent_files:
                        timestamp = datetime.now().strftime('%H:%M:%S')
                        print(f"[{timestamp}] 📝 FILE CREATED/MODIFIED: {f.relative_to(frontend_dir)}")
            
            time.sleep(1)  # Check every second
            
    except KeyboardInterrupt:
        print("\n\nMonitoring stopped.")

if __name__ == "__main__":
    monitor_mcp_tools()