#!/usr/bin/env python3
"""Run only Stage 2 v2 for the AI Lawyer app."""

import asyncio
import logging
from pathlib import Path
from app_factory.stages import stage_2_wireframe_v2

# Set up logging to see OXC usage
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Also setup debug logging for MCP tools
logging.getLogger("cc_tools.oxc").setLevel(logging.DEBUG)
logging.getLogger("cc_tools.tree_sitter").setLevel(logging.INFO)

async def main():
    app_name = "ai-lawyer"
    
    print("\n" + "="*60)
    print("🎨🔄 Running Stage 2 v2: Wireframe Generation (Writer-Critic Pattern)")
    print("="*60)
    print("\n🔍 Monitoring for OXC and tree-sitter usage...")
    print("Look for [OXC] and [TREE-SITTER] in the logs\n")
    
    result = await stage_2_wireframe_v2.run_stage(app_name)
    
    if result.success:
        print(f"\n✅ Stage 2 v2 completed successfully!")
        print(f"💰 Total cost: ${result.cost:.4f}")
        print(f"🔄 Iterations: {result.metadata.get('iterations', 'N/A')}")
    else:
        print(f"\n❌ Stage 2 v2 failed: {result.content}")

if __name__ == "__main__":
    asyncio.run(main())