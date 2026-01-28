#!/usr/bin/env python3
"""
Monitor Stage 2 Wireframe Generation for AI Lawyer App
This script will run Stage 2 and monitor tree-sitter tool usage
"""

import os
import sys
import asyncio
import logging
from pathlib import Path
from datetime import datetime

# Add the src directory to Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from app_factory.stages.stage_2_wireframe import run_stage
from app_factory.utils import print_stage_header

# Configure detailed logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'logs/stage2_ai_lawyer_monitor_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler()
    ]
)

# Set environment variable for enhanced MCP logging
os.environ['MCP_LOG_LEVEL'] = 'INFO'

async def monitor_stage_2():
    """Run Stage 2 with monitoring"""
    app_name = "ai-lawyer"
    
    print("="*80)
    print("STAGE 2 WIREFRAME GENERATION MONITOR - AI LAWYER APP")
    print("="*80)
    print(f"App: {app_name}")
    print(f"Time: {datetime.now()}")
    print("Monitoring tree-sitter tool usage...")
    print("="*80)
    
    # Create a custom logger to specifically monitor tree-sitter calls
    tree_sitter_logger = logging.getLogger("cc_tools.tree_sitter")
    tree_sitter_logger.setLevel(logging.DEBUG)
    
    # Also monitor MCP tool calls
    mcp_logger = logging.getLogger("cc_agent.mcp")
    mcp_logger.setLevel(logging.DEBUG)
    
    print("\n🔍 Starting Stage 2 Wireframe Generation...\n")
    
    try:
        # Run Stage 2
        result = await run_stage(app_name)
        
        if result.success:
            print(f"\n✅ Stage 2 completed successfully!")
            print(f"💰 Total cost: ${result.cost:.2f}")
            print(f"\n📁 Wireframe generated at: apps/{app_name}/frontend/")
            
            # Check if tree-sitter was used
            log_file = f'logs/tree_sitter_server.log'
            if Path(log_file).exists():
                print(f"\n📊 Tree-sitter server log available at: {log_file}")
                
                # Quick analysis of tree-sitter usage
                with open(log_file, 'r') as f:
                    content = f.read()
                    tool_calls = [
                        "validate_syntax",
                        "fix_imports", 
                        "extract_component",
                        "analyze_component_props",
                        "analyze_code_structure",
                        "find_code_patterns",
                        "track_dependencies",
                        "detect_api_calls"
                    ]
                    
                    print("\n📈 Tree-sitter Tool Usage Summary:")
                    for tool in tool_calls:
                        count = content.count(f"tool.{tool}")
                        if count > 0:
                            print(f"  - {tool}: {count} calls")
        else:
            print(f"\n❌ Stage 2 failed: {result.content}")
            
    except Exception as e:
        print(f"\n❌ Error during Stage 2: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "="*80)
    print("MONITORING COMPLETE")
    print("="*80)

if __name__ == "__main__":
    # Run the async function
    asyncio.run(monitor_stage_2())