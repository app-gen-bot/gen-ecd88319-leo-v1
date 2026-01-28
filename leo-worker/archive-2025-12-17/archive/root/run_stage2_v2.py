#!/usr/bin/env python3
"""Run Stage 2 v2 (with Writer-Critic loop) for AI Lawyer app."""

import anyio
import logging
from pathlib import Path
from app_factory.stages import stage_2_wireframe_v2

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

async def main():
    app_name = "ai-lawyer"
    
    # Run Stage 2 v2 with Writer-Critic iterative pattern
    print("\n" + "="*60)
    print("🎨🔄 Running Stage 2 v2: Wireframe Generation (Writer-Critic Pattern)")
    print("="*60)
    
    result = await stage_2_wireframe_v2.run_stage(app_name)
    
    if result.success:
        print(f"\n✅ Stage 2 v2 completed successfully!")
        print(f"💰 Total cost: ${result.cost:.4f}")
        print(f"🔄 Iterations: {result.metadata.get('iterations', 'N/A')}")
    else:
        print(f"\n❌ Stage 2 v2 failed: {result.content}")

if __name__ == "__main__":
    anyio.run(main)