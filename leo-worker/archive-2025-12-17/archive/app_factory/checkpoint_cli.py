#!/usr/bin/env python3
"""CLI utilities for managing App Factory checkpoints."""

import argparse
import json
from pathlib import Path
from datetime import datetime

from app_factory.checkpoint import CheckpointManager, StageStatus


def list_checkpoints(args):
    """List all available checkpoints."""
    manager = CheckpointManager()
    checkpoints = manager.list_checkpoints(app_name=args.app)
    
    if not checkpoints:
        print("No checkpoints found.")
        return
    
    print("\n📋 Available Checkpoints:")
    print("=" * 100)
    
    for checkpoint_id, info in checkpoints.items():
        print(f"\n🆔 {checkpoint_id}")
        print(f"   App: {info['app_name']}")
        print(f"   Created: {info['created_at']}")
        print(f"   Updated: {info['updated_at']}")
        print(f"   Resumable: {'Yes' if info['can_resume'] else 'No'}")
        print(f"   Total Cost: ${info['total_cost']:.4f}")
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
            
            print(f"     {icon} {stage}: {status} (${stage_info['cost']:.4f})")


def show_checkpoint(args):
    """Show detailed information about a specific checkpoint."""
    manager = CheckpointManager()
    checkpoint = manager.load_checkpoint(args.checkpoint_id)
    
    if not checkpoint:
        print(f"❌ Checkpoint {args.checkpoint_id} not found")
        return
    
    print(f"\n📋 Checkpoint Details: {checkpoint.checkpoint_id}")
    print("=" * 100)
    print(f"App Name: {checkpoint.app_name}")
    print(f"User Prompt: {checkpoint.user_prompt[:100]}..." if len(checkpoint.user_prompt) > 100 else f"User Prompt: {checkpoint.user_prompt}")
    print(f"Created: {checkpoint.created_at}")
    print(f"Updated: {checkpoint.updated_at}")
    print(f"Total Cost: ${checkpoint.total_cost:.4f}")
    print(f"Can Resume: {'Yes' if checkpoint.can_resume() else 'No'}")
    
    print("\nStage Details:")
    for stage_name, stage in checkpoint.stages.items():
        print(f"\n  {stage_name.upper()}:")
        print(f"    Status: {stage.status.value}")
        print(f"    Cost: ${stage.cost:.4f}")
        
        if stage.start_time:
            print(f"    Started: {stage.start_time}")
        if stage.end_time:
            print(f"    Ended: {stage.end_time}")
            duration = (stage.end_time - stage.start_time).total_seconds()
            print(f"    Duration: {duration:.1f}s")
        
        if stage.outputs:
            print(f"    Outputs:")
            for key, value in stage.outputs.items():
                print(f"      - {key}: {value}")
        
        if stage.error:
            print(f"    Error: {stage.error}")
        
        if stage.metadata:
            print(f"    Metadata:")
            for key, value in stage.metadata.items():
                print(f"      - {key}: {value}")
    
    next_stage = checkpoint.get_next_stage()
    if next_stage:
        print(f"\n▶️  Next stage to run: {next_stage}")
    else:
        print(f"\n✅ All stages completed")


def cleanup_checkpoints(args):
    """Remove old checkpoints."""
    manager = CheckpointManager()
    
    if args.days:
        print(f"🧹 Removing checkpoints older than {args.days} days...")
        manager.cleanup_old_checkpoints(days=args.days)
        print("✅ Cleanup complete")
    else:
        print("❌ Please specify --days to set the age threshold")


def find_latest(args):
    """Find the latest checkpoint for an app."""
    manager = CheckpointManager()
    checkpoint = manager.find_latest_checkpoint(args.app)
    
    if checkpoint:
        print(f"📋 Latest checkpoint for '{args.app}': {checkpoint.checkpoint_id}")
        print(f"   Updated: {checkpoint.updated_at}")
        print(f"   Can Resume: {'Yes' if checkpoint.can_resume() else 'No'}")
        
        # Show stage status
        print("   Stages:")
        for stage_name, stage in checkpoint.stages.items():
            status_icon = "✅" if stage.status == StageStatus.COMPLETED else "❌" if stage.status == StageStatus.FAILED else "🔄" if stage.status == StageStatus.IN_PROGRESS else "⏸️"
            print(f"     {status_icon} {stage_name}: {stage.status.value}")
    else:
        print(f"❌ No checkpoints found for app '{args.app}'")


def main():
    """Main entry point for checkpoint CLI."""
    parser = argparse.ArgumentParser(description="App Factory Checkpoint Management")
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # List command
    list_parser = subparsers.add_parser('list', help='List all checkpoints')
    list_parser.add_argument('--app', type=str, help='Filter by app name')
    
    # Show command
    show_parser = subparsers.add_parser('show', help='Show details of a specific checkpoint')
    show_parser.add_argument('checkpoint_id', help='Checkpoint ID to show')
    
    # Cleanup command
    cleanup_parser = subparsers.add_parser('cleanup', help='Remove old checkpoints')
    cleanup_parser.add_argument('--days', type=int, default=7, help='Remove checkpoints older than N days')
    
    # Find latest command
    latest_parser = subparsers.add_parser('latest', help='Find latest checkpoint for an app')
    latest_parser.add_argument('app', help='App name')
    
    args = parser.parse_args()
    
    if args.command == 'list':
        list_checkpoints(args)
    elif args.command == 'show':
        show_checkpoint(args)
    elif args.command == 'cleanup':
        cleanup_checkpoints(args)
    elif args.command == 'latest':
        find_latest(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()