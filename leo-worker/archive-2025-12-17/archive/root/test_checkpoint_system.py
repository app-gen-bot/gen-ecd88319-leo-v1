#!/usr/bin/env python3
"""Test the checkpoint system functionality."""

import asyncio
import sys
from pathlib import Path
from datetime import datetime

# Add the src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from app_factory.checkpoint import CheckpointManager, StageStatus, PipelineCheckpoint


def test_checkpoint_creation():
    """Test creating and saving checkpoints."""
    print("\n🧪 Testing Checkpoint Creation")
    print("=" * 80)
    
    manager = CheckpointManager()
    
    # Create a new checkpoint
    checkpoint = manager.create_checkpoint(
        app_name="TestApp",
        user_prompt="Create a test application"
    )
    
    print(f"✅ Created checkpoint: {checkpoint.checkpoint_id}")
    print(f"   App: {checkpoint.app_name}")
    print(f"   Created: {checkpoint.created_at}")
    
    # Update stage statuses
    checkpoint.update_stage("prd", status=StageStatus.IN_PROGRESS)
    checkpoint.save(manager.checkpoint_dir)
    print("✅ Updated PRD stage to IN_PROGRESS")
    
    checkpoint.update_stage(
        "prd", 
        status=StageStatus.COMPLETED,
        cost=0.05,
        outputs={"prd_path": "/tmp/test_prd.md"}
    )
    checkpoint.save(manager.checkpoint_dir)
    print("✅ Updated PRD stage to COMPLETED")
    
    # Check next stage
    next_stage = checkpoint.get_next_stage()
    print(f"✅ Next stage to run: {next_stage}")
    
    return checkpoint.checkpoint_id


def test_checkpoint_loading(checkpoint_id):
    """Test loading checkpoints."""
    print("\n🧪 Testing Checkpoint Loading")
    print("=" * 80)
    
    manager = CheckpointManager()
    
    # Load the checkpoint
    checkpoint = manager.load_checkpoint(checkpoint_id)
    
    if checkpoint:
        print(f"✅ Loaded checkpoint: {checkpoint.checkpoint_id}")
        print(f"   App: {checkpoint.app_name}")
        print(f"   Total cost: ${checkpoint.total_cost:.4f}")
        print(f"   Can resume: {checkpoint.can_resume()}")
        
        print("\n   Stage Status:")
        for stage_name, stage in checkpoint.stages.items():
            print(f"   - {stage_name}: {stage.status.value} (${stage.cost:.4f})")
    else:
        print(f"❌ Failed to load checkpoint: {checkpoint_id}")


def test_checkpoint_listing():
    """Test listing checkpoints."""
    print("\n🧪 Testing Checkpoint Listing")
    print("=" * 80)
    
    manager = CheckpointManager()
    checkpoints = manager.list_checkpoints()
    
    print(f"Found {len(checkpoints)} checkpoint(s):")
    for cid, info in checkpoints.items():
        print(f"\n📋 {cid}")
        print(f"   App: {info['app_name']}")
        print(f"   Created: {info['created_at']}")
        print(f"   Resumable: {info['can_resume']}")
        print(f"   Total cost: ${info['total_cost']:.4f}")


def test_checkpoint_resume():
    """Test checkpoint resume functionality."""
    print("\n🧪 Testing Checkpoint Resume")
    print("=" * 80)
    
    manager = CheckpointManager()
    
    # Create a checkpoint with partial completion
    checkpoint = manager.create_checkpoint(
        app_name="ResumeTest",
        user_prompt="Test resume functionality"
    )
    
    # Complete PRD stage
    checkpoint.update_stage(
        "prd",
        status=StageStatus.COMPLETED,
        cost=0.03
    )
    
    # Fail interaction spec stage
    checkpoint.update_stage(
        "interaction_spec",
        status=StageStatus.FAILED,
        error="Test failure"
    )
    
    checkpoint.save(manager.checkpoint_dir)
    
    print(f"✅ Created test checkpoint: {checkpoint.checkpoint_id}")
    print("   Stages:")
    print("   - prd: COMPLETED")
    print("   - interaction_spec: FAILED")
    print("   - wireframe: NOT_STARTED")
    
    # Check what stage should run next
    next_stage = checkpoint.get_next_stage()
    print(f"\n✅ Next stage to run: {next_stage}")
    print(f"✅ Can resume: {checkpoint.can_resume()}")
    
    return checkpoint.checkpoint_id


async def test_checkpoint_cli():
    """Test checkpoint CLI utilities."""
    print("\n🧪 Testing Checkpoint CLI")
    print("=" * 80)
    
    import subprocess
    
    # Test list command
    print("\n📋 Testing 'list' command:")
    result = subprocess.run(
        [sys.executable, "-m", "app_factory.checkpoint_cli", "list"],
        capture_output=True,
        text=True
    )
    print(result.stdout)
    
    # Test latest command
    print("\n📋 Testing 'latest' command:")
    result = subprocess.run(
        [sys.executable, "-m", "app_factory.checkpoint_cli", "latest", "TestApp"],
        capture_output=True,
        text=True
    )
    print(result.stdout)


async def main():
    """Run all checkpoint tests."""
    print("\n🏗️ AI App Factory - Checkpoint System Test")
    print("=" * 80)
    
    try:
        # Test 1: Create checkpoint
        checkpoint_id = test_checkpoint_creation()
        
        # Test 2: Load checkpoint
        test_checkpoint_loading(checkpoint_id)
        
        # Test 3: List checkpoints
        test_checkpoint_listing()
        
        # Test 4: Resume functionality
        resume_checkpoint_id = test_checkpoint_resume()
        
        # Test 5: CLI utilities
        await test_checkpoint_cli()
        
        print("\n✅ All checkpoint tests completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())