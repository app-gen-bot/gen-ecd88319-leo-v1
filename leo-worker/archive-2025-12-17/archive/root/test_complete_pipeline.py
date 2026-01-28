#!/usr/bin/env python3
"""Test the complete AI App Factory v2 pipeline."""

import asyncio
import sys
from pathlib import Path

# Add src to path
sys.path.append(str(Path(__file__).parent / "src"))

from app_factory.main_v2 import run_pipeline_v2


async def main():
    """Test the complete pipeline with a simple app."""
    
    print("\n🧪 Testing Complete AI App Factory v2 Pipeline")
    print("=" * 60)
    
    # Test with a simple todo app
    user_prompt = """
    Create a simple todo list application with the following features:
    1. Add new todos
    2. Mark todos as complete/incomplete
    3. Delete todos
    4. Filter by status (all, active, completed)
    5. Clean, modern UI with dark mode support
    """
    
    app_name = "todo-app-v2"
    
    print(f"📝 User prompt: {user_prompt}")
    print(f"📁 App name: {app_name}")
    print("\nStarting pipeline...\n")
    
    # Run the complete pipeline
    results = await run_pipeline_v2(user_prompt, app_name)
    
    # Check results
    print("\n" + "=" * 60)
    print("📊 Pipeline Test Results")
    print("=" * 60)
    
    stages_completed = []
    stages_failed = []
    
    for stage, result in results.items():
        if stage in ["total_cost", "app_name", "app_dir"]:
            continue
        if hasattr(result, 'success'):
            if result.success:
                stages_completed.append(stage)
            else:
                stages_failed.append(stage)
    
    print(f"\n✅ Stages completed: {len(stages_completed)}")
    for stage in stages_completed:
        print(f"   - {stage}")
    
    if stages_failed:
        print(f"\n❌ Stages failed: {len(stages_failed)}")
        for stage in stages_failed:
            print(f"   - {stage}")
    
    print(f"\n💰 Total cost: ${results.get('total_cost', 0):.4f}")
    print(f"📁 App location: {results.get('app_dir', 'Unknown')}")
    
    # Check if key files exist
    if "app_dir" in results:
        app_dir = Path(results["app_dir"])
        frontend_dir = app_dir / "frontend"
        
        print("\n📄 Generated Files Check:")
        key_files = [
            "specs/prd.md",
            "specs/frontend-interaction-spec.md",
            "specs/technical-implementation-spec.md",
            "specs/qc-report.md",
            "specs/improvement-insights.md",
            "frontend/package.json",
            "frontend/app/page.tsx",
            "frontend/components/ui/button.tsx"
        ]
        
        for file_path in key_files:
            full_path = app_dir / file_path
            exists = "✓" if full_path.exists() else "✗"
            print(f"   {exists} {file_path}")
    
    print("\n✨ Pipeline test complete!")


if __name__ == "__main__":
    asyncio.run(main())