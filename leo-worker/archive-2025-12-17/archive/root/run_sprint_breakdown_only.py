#!/usr/bin/env python3
"""Run just the sprint breakdown without the full pipeline."""

import asyncio
from pathlib import Path
from app_factory.stages import stage_0_5_sprint_breakdown

async def main():
    # Read PawsFlow PRD
    prd_path = Path("apps/app_20250716_074453/specs/business_prd.md")
    prd_content = prd_path.read_text()
    
    # Output directory
    output_dir = Path("test_output/pawsflow_sprint_breakdown")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"📄 Loaded PRD: {len(prd_content)} characters")
    print(f"📁 Output directory: {output_dir}")
    print("\n🚀 Running Sprint Breakdown...")
    
    # Run the stage
    result, sprint_paths = await stage_0_5_sprint_breakdown.run_stage(
        prd_content=prd_content,
        app_name="pawsflow",
        output_dir=output_dir,
        num_sprints=3
    )
    
    print(f"\n✅ Result: {result.success}")
    print(f"💰 Cost: ${result.cost:.4f}")
    print(f"📋 Sprints created: {len(sprint_paths)}")
    
    # List all files created
    print("\n📁 Files created:")
    for file in sorted(output_dir.iterdir()):
        if file.is_file():
            print(f"   - {file.name} ({file.stat().st_size:,} bytes)")
    
    # Show sprint 1 preview if it exists
    sprint1_path = output_dir / "prd_sprint_1.md"
    if sprint1_path.exists():
        print("\n📝 Sprint 1 Preview (first 30 lines):")
        lines = sprint1_path.read_text().split('\n')
        for i, line in enumerate(lines[:30]):
            print(f"   {line}")
    else:
        print("\n⚠️  Sprint 1 PRD not found!")

if __name__ == "__main__":
    asyncio.run(main())