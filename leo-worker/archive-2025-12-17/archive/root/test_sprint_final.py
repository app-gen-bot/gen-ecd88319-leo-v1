#!/usr/bin/env python3
"""Final test of Sprint Breakdown with all improvements."""

import asyncio
from pathlib import Path
from app_factory.stages import stage_0_5_sprint_breakdown

async def main():
    # Read PawsFlow PRD
    prd_path = Path("apps/app_20250716_074453/specs/business_prd.md")
    prd_content = prd_path.read_text()
    
    # Output directory
    output_dir = Path("test_output/pawsflow_sprint_v3")
    
    print(f"📄 PawsFlow PRD loaded: {len(prd_content)} characters")
    print(f"📁 Output directory: {output_dir}")
    print("\n🚀 Running Sprint Breakdown with improved configuration...")
    print("   - Added WebSearch and WebFetch for research")
    print("   - Increased MAX_TURNS to 20")
    print("   - Enhanced system prompt with explicit file requirements")
    print("\n" + "="*60)
    
    # Run the stage
    result, sprint_paths = await stage_0_5_sprint_breakdown.run_stage(
        prd_content=prd_content,
        app_name="pawsflow",
        output_dir=output_dir,
        num_sprints=3
    )
    
    print("\n" + "="*60)
    print(f"\n✅ Result: {'SUCCESS' if result.success else 'FAILED'}")
    print(f"💰 Cost: ${result.cost:.4f}")
    print(f"📋 Sprint PRDs created: {len(sprint_paths)}")
    
    # List all files created
    print("\n📁 Files in output directory:")
    files = list(output_dir.iterdir())
    if files:
        for file in sorted(files):
            if file.is_file():
                size = file.stat().st_size
                print(f"   ✓ {file.name} ({size:,} bytes)")
    else:
        print("   ❌ No files created!")
    
    # Check for required files
    print("\n🔍 Checking required files:")
    required_files = [
        "sprint_overview.md",
        "sprint_roadmap.md", 
        "prd_sprint_1.md",
        "prd_sprint_2.md",
        "prd_sprint_3.md"
    ]
    
    for filename in required_files:
        filepath = output_dir / filename
        if filepath.exists():
            print(f"   ✅ {filename} - Created")
        else:
            print(f"   ❌ {filename} - MISSING!")
    
    # Show Sprint 1 MVP preview if exists
    sprint1_path = output_dir / "prd_sprint_1.md"
    if sprint1_path.exists():
        print("\n📝 Sprint 1 MVP Preview (first 40 lines):")
        print("   " + "-"*50)
        lines = sprint1_path.read_text().split('\n')
        for i, line in enumerate(lines[:40]):
            if line.strip():
                print(f"   {line}")
            if i == 39:
                print("   ... (truncated)")

if __name__ == "__main__":
    asyncio.run(main())