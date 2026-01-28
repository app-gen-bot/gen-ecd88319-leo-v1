#!/usr/bin/env python3
"""Test script to verify Stage 1 file-based iteration works correctly."""

import asyncio
import tempfile
from pathlib import Path
from app_factory.stages import stage_1_interaction_spec

async def test_file_based_iteration():
    """Test that Stage 1 correctly writes and reads files during iteration."""
    
    # Create a temporary directory for testing
    with tempfile.TemporaryDirectory() as temp_dir:
        app_dir = Path(temp_dir) / "test_app"
        app_dir.mkdir(parents=True)
        
        # Simple PRD for testing
        prd_content = """
# Test App PRD

## Overview
A simple todo list application.

## Features
- Add new tasks
- Mark tasks as complete
- Delete tasks
- View all tasks

## Requirements
- User-friendly interface
- Persistent storage
- Responsive design
"""
        
        print(f"Testing with app_dir: {app_dir}")
        
        # Run Stage 1 with file-based iteration
        result = await stage_1_interaction_spec.run_stage(
            prd_content=prd_content,
            iterative_mode=True,
            app_name="test_app",
            app_dir=app_dir
        )
        
        # Check results
        print(f"\nStage 1 Result:")
        print(f"  Success: {result.success}")
        print(f"  Cost: ${result.cost:.4f}")
        
        # Check if file was created
        spec_file = app_dir / "specs" / "frontend-interaction-spec.md"
        if spec_file.exists():
            print(f"✅ Spec file created: {spec_file}")
            print(f"  File size: {len(spec_file.read_text())} characters")
        else:
            print(f"❌ Spec file NOT created: {spec_file}")
            
        return result.success

if __name__ == "__main__":
    success = asyncio.run(test_file_based_iteration())
    exit(0 if success else 1)