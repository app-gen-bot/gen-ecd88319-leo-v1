#!/usr/bin/env python3
"""Real-time monitoring for App Factory pipeline execution."""

import asyncio
import json
import time
from datetime import datetime
from pathlib import Path
from typing import Optional

from app_factory.checkpoint import CheckpointManager, StageStatus


class PipelineMonitor:
    """Monitor active pipeline executions."""
    
    def __init__(self, checkpoint_id: Optional[str] = None):
        self.checkpoint_id = checkpoint_id
        self.manager = CheckpointManager()
        self.last_update = None
        self.last_checkpoint = None
        
    def format_duration(self, seconds: float) -> str:
        """Format duration in human-readable format."""
        if seconds < 60:
            return f"{seconds:.1f}s"
        elif seconds < 3600:
            minutes = seconds / 60
            return f"{minutes:.1f}m"
        else:
            hours = seconds / 3600
            return f"{hours:.1f}h"
    
    def print_status(self, checkpoint):
        """Print current pipeline status."""
        # Clear screen (works on Unix/Mac)
        print("\033[2J\033[H", end="")
        
        print("🏭 AI App Factory Pipeline Monitor")
        print("=" * 80)
        print(f"Checkpoint ID: {checkpoint.checkpoint_id}")
        print(f"App Name: {checkpoint.app_name}")
        print(f"Started: {checkpoint.created_at}")
        print(f"Last Update: {checkpoint.updated_at}")
        print(f"Total Cost: ${checkpoint.total_cost:.4f}")
        print("")
        
        # Calculate overall progress
        total_stages = len(checkpoint.stages)
        completed_stages = sum(1 for s in checkpoint.stages.values() if s.status == StageStatus.COMPLETED)
        progress = (completed_stages / total_stages) * 100
        
        # Progress bar
        bar_length = 50
        filled_length = int(bar_length * completed_stages // total_stages)
        bar = "█" * filled_length + "░" * (bar_length - filled_length)
        print(f"Overall Progress: [{bar}] {progress:.0f}%")
        print("")
        
        # Stage details
        print("Stage Status:")
        print("-" * 80)
        
        for stage_name, stage in checkpoint.stages.items():
            # Status icon
            if stage.status == StageStatus.COMPLETED:
                icon = "✅"
            elif stage.status == StageStatus.FAILED:
                icon = "❌"
            elif stage.status == StageStatus.IN_PROGRESS:
                icon = "🔄"
            else:
                icon = "⏸️"
            
            # Stage info
            print(f"{icon} {stage_name.upper():20} {stage.status.value:15}", end="")
            
            # Duration for active/completed stages
            if stage.start_time:
                if stage.end_time:
                    duration = (stage.end_time - stage.start_time).total_seconds()
                    print(f" Duration: {self.format_duration(duration):10}", end="")
                else:
                    # Still running
                    duration = (datetime.now() - stage.start_time).total_seconds()
                    print(f" Running: {self.format_duration(duration):10}", end="")
            
            # Cost
            if stage.cost > 0:
                print(f" Cost: ${stage.cost:.4f}", end="")
            
            print()  # New line
            
            # Show error if failed
            if stage.status == StageStatus.FAILED and stage.error:
                print(f"    ⚠️  Error: {stage.error[:100]}...")
        
        print("-" * 80)
        
        # Show what's happening now
        current_stage = None
        for stage_name, stage in checkpoint.stages.items():
            if stage.status == StageStatus.IN_PROGRESS:
                current_stage = stage_name
                break
        
        if current_stage:
            print(f"\n🚀 Currently running: {current_stage}")
            stage = checkpoint.stages[current_stage]
            if stage.start_time:
                elapsed = (datetime.now() - stage.start_time).total_seconds()
                print(f"   Time elapsed: {self.format_duration(elapsed)}")
        else:
            next_stage = checkpoint.get_next_stage()
            if next_stage:
                print(f"\n⏳ Next stage: {next_stage}")
            else:
                print(f"\n✅ Pipeline completed!")
        
        # Last refresh time
        print(f"\n🔄 Last refresh: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("Press Ctrl+C to exit")
    
    async def monitor_checkpoint(self):
        """Monitor a specific checkpoint."""
        if not self.checkpoint_id:
            # Find the latest checkpoint
            checkpoints = self.manager.list_checkpoints()
            if not checkpoints:
                print("❌ No checkpoints found to monitor")
                return
            
            # Get the most recently updated checkpoint
            latest_id = max(checkpoints.keys(), key=lambda k: checkpoints[k]['updated_at'])
            self.checkpoint_id = latest_id
            print(f"📋 Monitoring latest checkpoint: {self.checkpoint_id}")
        
        while True:
            try:
                # Load checkpoint
                checkpoint = self.manager.load_checkpoint(self.checkpoint_id)
                if not checkpoint:
                    print(f"❌ Checkpoint {self.checkpoint_id} not found")
                    break
                
                # Check if updated
                if self.last_checkpoint != checkpoint:
                    self.print_status(checkpoint)
                    self.last_checkpoint = checkpoint
                    self.last_update = checkpoint.updated_at
                
                # Check if pipeline is complete
                if not checkpoint.can_resume():
                    print("\n\n✅ Pipeline execution completed!")
                    break
                
                # Wait before next check
                await asyncio.sleep(2)  # Check every 2 seconds
                
            except KeyboardInterrupt:
                print("\n\n👋 Monitoring stopped")
                break
            except Exception as e:
                print(f"\n❌ Error: {e}")
                await asyncio.sleep(5)
    
    async def monitor_active(self):
        """Monitor all active pipelines."""
        print("🔍 Monitoring all active pipelines...")
        print("Press Ctrl+C to exit")
        
        while True:
            try:
                # Clear screen
                print("\033[2J\033[H", end="")
                
                print("🏭 AI App Factory - Active Pipelines")
                print("=" * 80)
                print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
                print("")
                
                # Get all checkpoints
                checkpoints = self.manager.list_checkpoints()
                
                # Filter active checkpoints (can resume)
                active = {
                    cid: info for cid, info in checkpoints.items()
                    if info['can_resume']
                }
                
                if not active:
                    print("No active pipelines found.")
                else:
                    print(f"Found {len(active)} active pipeline(s):")
                    print("")
                    
                    for checkpoint_id, info in active.items():
                        print(f"📋 {checkpoint_id}")
                        print(f"   App: {info['app_name']}")
                        print(f"   Started: {info['created_at']}")
                        print(f"   Last Update: {info['updated_at']}")
                        print(f"   Cost: ${info['total_cost']:.4f}")
                        print(f"   Stages:")
                        
                        for stage, stage_info in info['stages'].items():
                            status = stage_info['status']
                            if status == 'completed':
                                icon = "✅"
                            elif status == 'failed':
                                icon = "❌"
                            elif status == 'in_progress':
                                icon = "🔄"
                            else:
                                icon = "⏸️"
                            
                            print(f"     {icon} {stage}: {status}")
                        print("")
                
                print("\n🔄 Refreshing every 5 seconds...")
                await asyncio.sleep(5)
                
            except KeyboardInterrupt:
                print("\n\n👋 Monitoring stopped")
                break


async def main():
    """Main entry point for monitoring."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Monitor App Factory pipeline execution")
    parser.add_argument(
        "--checkpoint",
        type=str,
        help="Monitor a specific checkpoint ID"
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Monitor all active pipelines"
    )
    
    args = parser.parse_args()
    
    monitor = PipelineMonitor(checkpoint_id=args.checkpoint)
    
    if args.all:
        await monitor.monitor_active()
    else:
        await monitor.monitor_checkpoint()


if __name__ == "__main__":
    asyncio.run(main())