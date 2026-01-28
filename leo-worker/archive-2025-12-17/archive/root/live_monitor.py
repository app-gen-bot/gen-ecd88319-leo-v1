#!/usr/bin/env python3
"""
Live monitoring of Stage 2 progress
"""
import time
from pathlib import Path
from datetime import datetime

def monitor_stage2():
    print("\n🔍 LIVE MONITORING - STAGE 2 AI LAWYER APP")
    print("="*60)
    
    # Check directories
    app_dir = Path("/Users/labheshpatel/apps/app-factory/apps/ai-lawyer")
    frontend_dir = app_dir / "frontend"
    specs_dir = app_dir / "specs"
    
    print(f"\n📁 App Directory Status:")
    print(f"   - Specs: {len(list(specs_dir.glob('*.md')))} files")
    print(f"   - Frontend: {'EXISTS' if frontend_dir.exists() else 'NOT CREATED'}")
    
    if frontend_dir.exists():
        files = list(frontend_dir.rglob("*"))
        print(f"   - Frontend files: {len(files)}")
        if files:
            for f in files[:10]:  # Show first 10
                print(f"     • {f.relative_to(frontend_dir)}")
    
    # Check logs
    print(f"\n📋 Recent Log Activity:")
    log_dir = Path("/Users/labheshpatel/apps/app-factory/logs")
    
    # Find most recent stage 2 log
    stage2_logs = sorted(log_dir.glob("stage2_ai_lawyer_monitor_*.log"), key=lambda x: x.stat().st_mtime)
    if stage2_logs:
        latest_log = stage2_logs[-1]
        print(f"   Latest log: {latest_log.name}")
        
        # Get last 5 lines
        with open(latest_log) as f:
            lines = f.readlines()
            if lines:
                print(f"   Last update: {lines[-1].strip()}")
                
                # Check if still active
                last_timestamp = lines[-1].split(" - ")[0]
                try:
                    last_time = datetime.strptime(last_timestamp, "%Y-%m-%d %H:%M:%S,%f")
                    time_diff = datetime.now() - last_time
                    if time_diff.total_seconds() < 60:
                        print(f"   ✅ ACTIVE - Last heartbeat {int(time_diff.total_seconds())}s ago")
                    else:
                        print(f"   ⏸️  INACTIVE - Last activity {int(time_diff.total_seconds()/60)} minutes ago")
                except:
                    pass
    
    # Check tree-sitter log
    tree_sitter_log = log_dir / "tree_sitter_server.log"
    if tree_sitter_log.exists():
        print(f"\n🌳 Tree-sitter Activity:")
        with open(tree_sitter_log) as f:
            lines = f.readlines()
            # Look for tool calls in last 100 lines
            tool_calls = []
            for line in lines[-100:]:
                if "tool." in line or "validate_syntax" in line or "fix_imports" in line:
                    tool_calls.append(line.strip())
            
            if tool_calls:
                print(f"   Recent tool calls: {len(tool_calls)}")
                for call in tool_calls[-5:]:  # Last 5
                    print(f"   • {call[:80]}...")
            else:
                print("   No recent tool calls detected")
    
    # Check for checkpoint
    checkpoints = list(Path("/Users/labheshpatel/apps/app-factory/checkpoints").glob("*ai-lawyer*.json"))
    if checkpoints:
        print(f"\n💾 Checkpoints: {len(checkpoints)} found")
        for cp in checkpoints:
            print(f"   • {cp.name}")
    
    print("\n" + "="*60)

if __name__ == "__main__":
    monitor_stage2()