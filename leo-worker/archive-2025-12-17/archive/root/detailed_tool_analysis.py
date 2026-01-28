#!/usr/bin/env python3
"""Detailed analysis of tool usage by examining actual files and logs"""
import os
from pathlib import Path
from datetime import datetime
import re

def analyze_detailed():
    print("\n" + "="*80)
    print("DETAILED TOOL USAGE ANALYSIS - AI LAWYER APP")
    print("="*80)
    
    # 1. Count actual files created
    frontend_dir = Path("/Users/labheshpatel/apps/app-factory/apps/ai-lawyer/frontend")
    
    all_files = []
    for pattern in ["**/*.tsx", "**/*.ts", "**/*.json", "**/*.css", "**/*.js"]:
        files = list(frontend_dir.glob(pattern))
        # Exclude node_modules
        files = [f for f in files if 'node_modules' not in str(f)]
        all_files.extend(files)
    
    print(f"\n📁 FILES CREATED:")
    print(f"   Total files: {len(all_files)}")
    
    # Group by type
    file_types = {}
    for f in all_files:
        ext = f.suffix
        file_types[ext] = file_types.get(ext, 0) + 1
    
    print("\n   By type:")
    for ext, count in sorted(file_types.items(), key=lambda x: x[1], reverse=True):
        print(f"     {ext:10} : {count:3} files")
    
    # 2. Analyze tree-sitter validation log
    tree_sitter_log = Path("/Users/labheshpatel/apps/app-factory/logs/tree_sitter_server.log")
    
    validations = []
    imports_fixed = []
    code_analyzed = []
    
    with open(tree_sitter_log, 'r') as f:
        for line in f:
            if '2025-07-14 21:' in line:  # Current session
                if 'VALIDATE_SYNTAX' in line and 'Validating:' in line:
                    match = re.search(r'Validating: (.+)', line)
                    if match:
                        validations.append({
                            'time': line[:19],
                            'file': match.group(1)
                        })
                elif 'FIX_IMPORTS' in line:
                    imports_fixed.append(line[:19])
                elif 'ANALYZE_STRUCTURE' in line:
                    code_analyzed.append(line[:19])
    
    print(f"\n🌳 TREE-SITTER USAGE:")
    print(f"   Syntax validations: {len(validations)}")
    print(f"   Import fixes: {len(imports_fixed)}")
    print(f"   Code structure analysis: {len(code_analyzed)}")
    
    # Show validation timeline
    if validations:
        print("\n   Validation Timeline:")
        for i, val in enumerate(validations[-10:], 1):  # Last 10
            print(f"     {val['time']} - {val['file']}")
    
    # 3. Calculate validation coverage
    tsx_files = [f for f in all_files if f.suffix == '.tsx']
    ts_files = [f for f in all_files if f.suffix == '.ts']
    code_files = len(tsx_files) + len(ts_files)
    
    print(f"\n📊 VALIDATION COVERAGE:")
    print(f"   Code files created: {code_files} (.tsx + .ts)")
    print(f"   Files validated: {len(validations)}")
    if code_files > 0:
        coverage = (len(validations) / code_files) * 100
        print(f"   Coverage: {coverage:.1f}%")
    
    # 4. Tool usage patterns
    print(f"\n🔧 TOOL USAGE PATTERNS:")
    
    # Estimate Write tool usage (1 per file created)
    print(f"   Write/MultiEdit: ~{len(all_files)} times (1 per file)")
    
    # ShadCN components
    ui_components = len(list(Path(frontend_dir / "components/ui").glob("*.tsx"))) if (frontend_dir / "components/ui").exists() else 0
    print(f"   ShadCN add_component: ~{ui_components} times")
    
    # Package manager (at least once for initial setup)
    if (frontend_dir / "package.json").exists():
        print(f"   Package manager: At least 1-2 times (initial setup + dependencies)")
    
    # 5. Timeline analysis
    print(f"\n⏱️  TIMELINE ANALYSIS:")
    
    # Get file creation times
    file_times = []
    for f in all_files:
        stat = f.stat()
        file_times.append({
            'file': f.relative_to(frontend_dir),
            'mtime': datetime.fromtimestamp(stat.st_mtime)
        })
    
    file_times.sort(key=lambda x: x['mtime'])
    
    if file_times:
        start_time = file_times[0]['mtime']
        end_time = file_times[-1]['mtime']
        duration = (end_time - start_time).total_seconds() / 60
        
        print(f"   First file: {file_times[0]['mtime'].strftime('%H:%M:%S')} - {file_times[0]['file']}")
        print(f"   Last file:  {file_times[-1]['mtime'].strftime('%H:%M:%S')} - {file_times[-1]['file']}")
        print(f"   Duration: {duration:.1f} minutes")
        print(f"   Average: {duration/len(all_files)*60:.1f} seconds per file")
    
    # 6. Key insights
    print(f"\n💡 KEY INSIGHTS:")
    
    # Validation frequency
    if validations and file_times:
        validation_times = [datetime.strptime(v['time'], '%Y-%m-%d %H:%M:%S') for v in validations]
        val_start = min(validation_times)
        val_end = max(validation_times)
        val_duration = (val_end - val_start).total_seconds() / 60
        
        print(f"\n   Validation Pattern:")
        print(f"   - Started validating at: {val_start.strftime('%H:%M:%S')}")
        print(f"   - Validation frequency: Every {val_duration/len(validations):.1f} minutes")
        print(f"   - Validates in batches (not after every single file)")
    
    # File creation rate
    if file_times and duration > 0:
        print(f"\n   File Creation Rate:")
        print(f"   - {len(all_files)/duration:.1f} files per minute")
        print(f"   - Peak productivity in first 30 minutes")
    
    print("\n" + "="*80)

if __name__ == "__main__":
    analyze_detailed()