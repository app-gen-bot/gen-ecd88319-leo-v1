#!/usr/bin/env python3
"""Test chained sprint breakdown with PawsFlow PRD only."""

import asyncio
from pathlib import Path
from app_factory.stages import stage_0_5_sprint_breakdown_chained

async def main():
    """Test with PawsFlow PRD."""
    print("🚀 Testing Chained Sprint Breakdown with PawsFlow PRD")
    print("="*60)
    
    # Read the PawsFlow PRD
    prd_path = Path("apps/app_20250716_074453/specs/business_prd.md")
    if not prd_path.exists():
        print(f"❌ PawsFlow PRD not found at {prd_path}")
        return
    
    prd_content = prd_path.read_text()
    print(f"📄 Loaded PawsFlow PRD: {len(prd_content)} characters")
    
    # Use a clear output directory
    output_dir = Path("test_output/pawsflow_chained_test")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Clear any existing files
    for file in output_dir.glob("*.md"):
        file.unlink()
    
    print(f"📁 Output directory: {output_dir.absolute()}")
    print("\nStarting sprint breakdown...")
    print("-"*60)
    
    # Run the chained breakdown
    result, sprint_paths = await stage_0_5_sprint_breakdown_chained.run_stage(
        prd_content=prd_content,
        app_name="pawsflow",
        output_dir=output_dir
    )
    
    print("\n" + "="*60)
    print("RESULTS:")
    print("="*60)
    print(f"✅ Success: {result.success}")
    print(f"💰 Total cost: ${result.cost:.4f}")
    print(f"📋 Sprint PRDs created: {len(sprint_paths)}")
    
    # Check what files were actually created
    print("\n📁 Files in output directory:")
    all_files = list(output_dir.glob("*.md"))
    if all_files:
        for file in sorted(all_files):
            size = file.stat().st_size
            print(f"   ✅ {file.name} ({size:,} bytes)")
    else:
        print("   ❌ No files found!")
    
    # Expected files check
    print("\n🔍 Expected files check:")
    expected = [
        "sprint_overview.md",
        "sprint_roadmap.md",
        "prd_sprint_1.md",
        "prd_sprint_2.md",
        "prd_sprint_3.md"
    ]
    
    for filename in expected:
        filepath = output_dir / filename
        if filepath.exists():
            print(f"   ✅ {filename} - EXISTS")
        else:
            print(f"   ❌ {filename} - MISSING")
    
    # Show Sprint 1 MVP preview if it exists
    sprint1_path = output_dir / "prd_sprint_1.md"
    if sprint1_path.exists():
        print("\n📝 Sprint 1 MVP Preview (first 40 lines):")
        print("-"*60)
        content = sprint1_path.read_text()
        lines = content.split('\n')
        for i, line in enumerate(lines[:40]):
            print(f"{i+1:3}: {line}")
            if i == 39:
                print("... (truncated)")

if __name__ == "__main__":
    asyncio.run(main())