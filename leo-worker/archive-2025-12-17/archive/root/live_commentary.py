#!/usr/bin/env python3
"""Live commentary on Stage 2 progress with tree-sitter monitoring"""
import time
import os
from pathlib import Path
from datetime import datetime

def get_file_count(directory):
    """Count files in directory"""
    if not Path(directory).exists():
        return 0
    count = 0
    for ext in ['*.tsx', '*.ts', '*.json', '*.css']:
        count += len(list(Path(directory).rglob(ext)))
    return count

def check_latest_files(directory, num=5):
    """Get most recently modified files"""
    if not Path(directory).exists():
        return []
    
    all_files = []
    for ext in ['*.tsx', '*.ts']:
        all_files.extend(Path(directory).rglob(ext))
    
    # Sort by modification time
    all_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
    return all_files[:num]

def check_tree_sitter_log():
    """Check for tree-sitter tool usage"""
    log_file = "/Users/labheshpatel/apps/app-factory/logs/tree_sitter_server.log"
    if not Path(log_file).exists():
        return []
    
    # Get file size to check for new content
    size = os.path.getsize(log_file)
    
    # Look for recent tool calls
    tool_calls = []
    with open(log_file, 'r') as f:
        lines = f.readlines()
        for i, line in enumerate(lines):
            if '2025-07-14 21:' in line:  # Recent entries
                if any(tool in line for tool in ['validate_syntax', 'fix_imports', 'analyze_code', 
                                                  'extract_component', 'detect_api']):
                    tool_calls.append(line.strip())
    
    return tool_calls[-5:], size  # Return last 5 tool calls

def live_commentary():
    print("\n🎬 LIVE COMMENTARY - STAGE 2 WIREFRAME GENERATION")
    print("="*70)
    print(f"Started monitoring at: {datetime.now().strftime('%H:%M:%S')}")
    print("App: AI Lawyer")
    print("="*70)
    
    frontend_dir = "/Users/labheshpatel/apps/app-factory/apps/ai-lawyer/frontend"
    last_file_count = 0
    last_log_size = 0
    
    while True:
        print(f"\n[{datetime.now().strftime('%H:%M:%S')}] Status Update:")
        print("-"*50)
        
        # Check file count
        current_file_count = get_file_count(frontend_dir)
        if current_file_count != last_file_count:
            print(f"📁 Files created: {current_file_count} (+{current_file_count - last_file_count} new)")
            last_file_count = current_file_count
            
            # Show recent files
            recent_files = check_latest_files(frontend_dir, 3)
            if recent_files:
                print("   Recent files:")
                for f in recent_files:
                    rel_path = f.relative_to(frontend_dir)
                    mod_time = datetime.fromtimestamp(f.stat().st_mtime).strftime('%H:%M:%S')
                    print(f"   • {mod_time} - {rel_path}")
        else:
            print(f"📁 Files: {current_file_count} (no new files)")
        
        # Check tree-sitter usage
        tool_calls, current_log_size = check_tree_sitter_log()
        if current_log_size != last_log_size:
            print("\n🌳 Tree-sitter Activity:")
            if tool_calls:
                for call in tool_calls:
                    print(f"   • {call}")
            else:
                print("   ❌ No tree-sitter tool calls detected yet!")
            last_log_size = current_log_size
        
        # Commentary
        print("\n💭 Commentary:")
        if current_file_count == 0:
            print("   Waiting for Writer agent to start creating files...")
        elif current_file_count < 10:
            print("   Initial setup phase - creating base structure")
        elif current_file_count < 20:
            print("   Creating core components and pages")
        else:
            print("   Building out feature-specific components")
            
        if not tool_calls:
            print("   ⚠️  WARNING: No tree-sitter validation detected!")
            print("   The Writer should be validating after each file!")
        
        time.sleep(5)  # Update every 5 seconds

if __name__ == "__main__":
    try:
        live_commentary()
    except KeyboardInterrupt:
        print("\n\nMonitoring stopped.")