#!/usr/bin/env python3
"""Minimal test for Stage 1 file-based iteration."""

import asyncio
from pathlib import Path

async def test_minimal():
    from app_factory.stages import stage_1_interaction_spec
    
    prd = "# Test\nSimple app"
    app_dir = Path("/tmp/test_stage1_app")
    app_dir.mkdir(exist_ok=True)
    
    print("Starting Stage 1...")
    try:
        # Test single-pass mode first
        result = await stage_1_interaction_spec.run_stage(
            prd_content=prd,
            iterative_mode=False,
            app_name="test"
        )
        print(f"Single-pass mode: success={result.success}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

asyncio.run(test_minimal())