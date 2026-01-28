#!/usr/bin/env python3
"""Deep dive analysis of tool usage from Stage 2 logs"""
import re
from pathlib import Path
from collections import defaultdict, Counter
from datetime import datetime
import json

def analyze_logs():
    print("\n" + "="*80)
    print("DEEP DIVE: TOOL USAGE ANALYSIS - STAGE 2 AI LAWYER APP")
    print("="*80)
    
    # Log files to analyze
    log_files = {
        'monitoring': list(Path('/Users/labheshpatel/apps/app-factory/logs').glob('stage2_ai_lawyer_monitor_*.log')),
        'tree_sitter': Path('/Users/labheshpatel/apps/app-factory/logs/tree_sitter_server.log'),
        'shadcn': Path('/Users/labheshpatel/apps/app-factory/logs/shadcn_server.log'),
        'package_manager': Path('/Users/labheshpatel/apps/app-factory/logs/package_manager_server.log'),
        'build_test': Path('/Users/labheshpatel/apps/app-factory/logs/build_test_server.log'),
        'dev_server': Path('/Users/labheshpatel/apps/app-factory/logs/dev_server_server.log'),
        'browser': Path('/Users/labheshpatel/apps/app-factory/logs/browser_server.log'),
    }
    
    # Tool usage patterns
    tool_patterns = {
        # Core tools
        'Read': r'Tool.*Read|Reading file|read_file',
        'Write': r'Tool.*Write|Writing file|write_file|Created file',
        'MultiEdit': r'Tool.*MultiEdit|multi_edit',
        'BatchTool': r'Tool.*BatchTool|batch_tool',
        'Task': r'Tool.*Task',
        
        # Search tools
        'Grep': r'Tool.*Grep|grep|Searching for pattern',
        'Glob': r'Tool.*Glob|glob|Finding files',
        'LS': r'Tool.*LS|Listing directory',
        
        # Other tools
        'TodoWrite': r'Tool.*TodoWrite|todo_write',
        'WebFetch': r'Tool.*WebFetch|web_fetch',
        'WebSearch': r'Tool.*WebSearch|web_search',
        
        # MCP tools
        'shadcn': r'Tool.*shadcn|add_component|Installing.*component',
        'package_manager': r'Tool.*package_manager|npm install|Adding package',
        'build_test': r'Tool.*build_test|Running build|Build verification',
        'dev_server': r'Tool.*dev_server|Starting server|Stopping server',
        'browser': r'Tool.*browser|Opening browser|Navigating to',
        
        # Tree-sitter tools
        'validate_syntax': r'validate_syntax|VALIDATE_SYNTAX|Validating:',
        'fix_imports': r'fix_imports|FIX_IMPORTS|Fixing imports',
        'analyze_code_structure': r'analyze_code_structure|ANALYZE_STRUCTURE|Analyzing:',
        'extract_component': r'extract_component|EXTRACT_COMPONENT',
        'analyze_component_props': r'analyze_component_props|ANALYZE_PROPS',
        'find_code_patterns': r'find_code_patterns|FIND_PATTERNS',
        'track_dependencies': r'track_dependencies|TRACK_DEPENDENCIES',
        'detect_api_calls': r'detect_api_calls|DETECT_API',
    }
    
    # Counters
    tool_usage = defaultdict(int)
    tool_timeline = defaultdict(list)
    tree_sitter_details = defaultdict(list)
    
    # Analyze monitoring logs
    print("\n📋 Analyzing Stage 2 monitoring logs...")
    for log_file in log_files['monitoring']:
        if log_file.exists():
            print(f"   Reading: {log_file.name}")
            with open(log_file, 'r') as f:
                for line in f:
                    # Check for tool usage
                    for tool, pattern in tool_patterns.items():
                        if re.search(pattern, line, re.IGNORECASE):
                            tool_usage[tool] += 1
                            # Extract timestamp if present
                            timestamp_match = re.match(r'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})', line)
                            if timestamp_match:
                                tool_timeline[tool].append(timestamp_match.group(1))
    
    # Analyze tree-sitter log specifically
    print("\n🌳 Analyzing tree-sitter server log...")
    if log_files['tree_sitter'].exists():
        with open(log_files['tree_sitter'], 'r') as f:
            for line in f:
                # Look for today's entries
                if '2025-07-14 21:' in line:
                    # Check validation calls
                    if 'VALIDATE_SYNTAX' in line:
                        match = re.search(r'Validating: (.+)', line)
                        if match:
                            file_path = match.group(1)
                            timestamp = line[:19]
                            tree_sitter_details['validate_syntax'].append({
                                'time': timestamp,
                                'file': file_path
                            })
                    
                    # Check other tree-sitter tools
                    for tool in ['analyze_code_structure', 'fix_imports', 'track_dependencies']:
                        if tool.upper() in line or f'[{tool.upper()}]' in line:
                            tree_sitter_details[tool].append({
                                'time': line[:19],
                                'details': line.strip()
                            })
    
    # Analyze other MCP server logs
    print("\n🔧 Analyzing other MCP server logs...")
    for server_name, log_file in log_files.items():
        if server_name in ['monitoring', 'tree_sitter']:
            continue
        
        if isinstance(log_file, Path) and log_file.exists():
            with open(log_file, 'r') as f:
                lines = f.readlines()
                # Count tool invocations
                for line in lines:
                    if '2025-07-14' in line:  # Today's entries
                        for tool, pattern in tool_patterns.items():
                            if re.search(pattern, line, re.IGNORECASE):
                                tool_usage[f"{server_name}_{tool}"] += 1
    
    # Print results
    print("\n" + "="*80)
    print("📊 TOOL USAGE SUMMARY")
    print("="*80)
    
    # Sort by usage
    sorted_tools = sorted(tool_usage.items(), key=lambda x: x[1], reverse=True)
    
    print("\n🔢 Tool Usage Counts:")
    for tool, count in sorted_tools:
        if count > 0:
            print(f"   {tool:30} : {count:4} times")
    
    # Tree-sitter specific analysis
    print("\n" + "="*80)
    print("🌳 TREE-SITTER DETAILED ANALYSIS")
    print("="*80)
    
    if tree_sitter_details['validate_syntax']:
        print(f"\n✅ Syntax Validations: {len(tree_sitter_details['validate_syntax'])} files")
        for item in tree_sitter_details['validate_syntax'][-10:]:  # Last 10
            print(f"   {item['time']} - {item['file']}")
    
    # File creation timeline
    print("\n" + "="*80)
    print("📅 TOOL USAGE TIMELINE")
    print("="*80)
    
    # Show when each tool was first and last used
    for tool, timestamps in tool_timeline.items():
        if timestamps:
            first = min(timestamps)
            last = max(timestamps)
            print(f"\n{tool}:")
            print(f"   First used: {first}")
            print(f"   Last used:  {last}")
            print(f"   Total uses: {len(timestamps)}")
    
    # Calculate insights
    print("\n" + "="*80)
    print("💡 KEY INSIGHTS")
    print("="*80)
    
    total_tools = sum(tool_usage.values())
    print(f"\n📈 Total tool invocations: {total_tools}")
    
    # Tree-sitter percentage
    tree_sitter_tools = sum(count for tool, count in tool_usage.items() 
                           if any(ts in tool for ts in ['validate_syntax', 'fix_imports', 
                                                        'analyze_code', 'extract_component']))
    if total_tools > 0:
        ts_percentage = (tree_sitter_tools / total_tools) * 100
        print(f"🌳 Tree-sitter tools: {tree_sitter_tools} ({ts_percentage:.1f}% of total)")
    
    # Most used tools
    print("\n🏆 Top 5 Most Used Tools:")
    for i, (tool, count) in enumerate(sorted_tools[:5], 1):
        print(f"   {i}. {tool}: {count} times")
    
    # Tree-sitter adoption
    print("\n🎯 Tree-Sitter Adoption:")
    if tree_sitter_details['validate_syntax']:
        print(f"   ✅ Files validated: {len(tree_sitter_details['validate_syntax'])}")
        print(f"   ⏱️  Validation frequency: Every ~{300 // len(tree_sitter_details['validate_syntax'])} seconds")
    else:
        print(f"   ❌ No syntax validations found in current session")
    
    # File creation vs validation ratio
    write_count = tool_usage.get('Write', 0)
    validate_count = len(tree_sitter_details['validate_syntax'])
    if write_count > 0:
        ratio = validate_count / write_count * 100
        print(f"\n📊 Validation Coverage:")
        print(f"   Files written: {write_count}")
        print(f"   Files validated: {validate_count}")
        print(f"   Coverage: {ratio:.1f}%")
    
    print("\n" + "="*80)

if __name__ == "__main__":
    analyze_logs()