#!/usr/bin/env python3
"""Test improved chained sprint breakdown with PawsFlow PRD."""

import asyncio
from pathlib import Path
from app_factory.stages import stage_0_5_sprint_breakdown_chained

async def main():
    """Test with PawsFlow PRD using improved chained approach."""
    print("🚀 Testing Improved Chained Sprint Breakdown with PawsFlow PRD")
    print("="*60)
    
    # Read the PawsFlow PRD
    prd_path = Path("apps/app_20250716_074453/specs/business_prd.md")
    if not prd_path.exists():
        print(f"❌ PawsFlow PRD not found at {prd_path}")
        return
    
    prd_content = prd_path.read_text()
    print(f"📄 Loaded PawsFlow PRD: {len(prd_content)} characters")
    
    # Use a clear output directory
    output_dir = Path("test_output/pawsflow_chained_v3")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Clear any existing files
    print("\n🧹 Clearing existing files...")
    for file in output_dir.glob("*.md"):
        file.unlink()
        print(f"   Deleted: {file.name}")
    
    print(f"\n📁 Output directory: {output_dir.absolute()}")
    print("\nStarting sprint breakdown with separate calls for each file...")
    print("-"*60)
    
    # Run the chained breakdown
    try:
        result, sprint_paths = await stage_0_5_sprint_breakdown_chained.run_stage(
            prd_content=prd_content,
            app_name="pawsflow",
            output_dir=output_dir,
            num_sprints=3  # Explicitly request 3 sprints
        )
    except Exception as e:
        print(f"\n❌ Error during breakdown: {e}")
        import traceback
        traceback.print_exc()
        return
    
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
        ("sprint_overview.md", "Sprint Overview"),
        ("sprint_roadmap.md", "Sprint Roadmap"), 
        ("prd_sprint_1.md", "Sprint 1 PRD (MVP)"),
        ("prd_sprint_2.md", "Sprint 2 PRD (Enhanced)"),
        ("prd_sprint_3.md", "Sprint 3 PRD (Extended)")
    ]
    
    missing_count = 0
    for filename, description in expected:
        filepath = output_dir / filename
        if filepath.exists():
            print(f"   ✅ {filename} - {description}")
        else:
            print(f"   ❌ {filename} - {description} - MISSING")
            missing_count += 1
    
    if missing_count == 0:
        print("\n🎉 All expected files created!")
    else:
        print(f"\n⚠️  {missing_count} files missing")
    
    # Show Sprint 1 MVP features if it exists
    sprint1_path = output_dir / "prd_sprint_1.md"
    if sprint1_path.exists():
        print("\n📝 Sprint 1 MVP Features Preview:")
        print("-"*60)
        content = sprint1_path.read_text()
        lines = content.split('\n')
        
        # Find and display features section
        in_features = False
        feature_count = 0
        for line in lines:
            if "## Features" in line or "## Core Features" in line:
                in_features = True
                print(f"   {line}")
                continue
            elif in_features and line.startswith("##") and "Features" not in line:
                break
            elif in_features and line.strip():
                print(f"   {line}")
                feature_count += 1
                if feature_count > 15:  # Limit output
                    print("   ... (more features)")
                    break
    
    # Show summary of all sprints if overview exists
    overview_path = output_dir / "sprint_overview.md"
    if overview_path.exists():
        print("\n📊 Sprint Summary from Overview:")
        print("-"*60)
        content = overview_path.read_text()
        lines = content.split('\n')
        
        for i, line in enumerate(lines):
            if "Sprint" in line and ("##" in line or "###" in line):
                # Print sprint headers
                print(f"\n   {line}")
                # Print next few lines for context
                for j in range(1, 4):
                    if i + j < len(lines) and lines[i + j].strip():
                        print(f"   {lines[i + j]}")

if __name__ == "__main__":
    asyncio.run(main())