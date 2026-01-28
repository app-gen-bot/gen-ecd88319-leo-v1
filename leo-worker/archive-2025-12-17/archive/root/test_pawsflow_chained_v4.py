#!/usr/bin/env python3
"""Test chained sprint breakdown with better error handling and context passing."""

import asyncio
from pathlib import Path
from app_factory.stages import stage_0_5_sprint_breakdown_chained

async def main():
    """Test with PawsFlow PRD using improved context handling."""
    print("🚀 Testing Chained Sprint Breakdown with Better Context Handling")
    print("="*60)
    
    # Read the PawsFlow PRD
    prd_path = Path("apps/app_20250716_074453/specs/business_prd.md")
    if not prd_path.exists():
        print(f"❌ PawsFlow PRD not found at {prd_path}")
        return
    
    prd_content = prd_path.read_text()
    print(f"📄 Loaded PawsFlow PRD: {len(prd_content)} characters")
    
    # Use a clear output directory
    output_dir = Path("test_output/pawsflow_chained_v4")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Clear any existing files
    print("\n🧹 Clearing existing files...")
    for file in output_dir.glob("*.md"):
        file.unlink()
        print(f"   Deleted: {file.name}")
    
    print(f"\n📁 Output directory: {output_dir.absolute()}")
    print("\n🔄 Running improved chained breakdown...")
    print("   - Creates overview first")
    print("   - Then creates roadmap with overview context")
    print("   - Creates Sprint PRDs with proper context from previous sprints")
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
        
        # Show any files that were created before failure
        print("\n📁 Files created before failure:")
        all_files = list(output_dir.glob("*.md"))
        if all_files:
            for file in sorted(all_files):
                size = file.stat().st_size
                print(f"   ✅ {file.name} ({size:,} bytes)")
        return
    
    print("\n" + "="*60)
    print("FINAL RESULTS:")
    print("="*60)
    print(f"✅ Success: {result.success}")
    print(f"💰 Total cost: ${result.cost:.4f}")
    print(f"📋 Sprint PRDs created: {len(sprint_paths)}")
    
    # Check what files were actually created
    print("\n📁 All files created:")
    all_files = list(output_dir.glob("*.md"))
    if all_files:
        for file in sorted(all_files):
            size = file.stat().st_size
            print(f"   ✅ {file.name} ({size:,} bytes)")
    else:
        print("   ❌ No files found!")
    
    # Expected files check with detailed status
    print("\n🔍 Detailed file check:")
    expected = [
        ("sprint_overview.md", "Sprint Overview", "High-level sprint breakdown"),
        ("sprint_roadmap.md", "Sprint Roadmap", "Timeline and dependencies"), 
        ("prd_sprint_1.md", "Sprint 1 PRD", "MVP with core features"),
        ("prd_sprint_2.md", "Sprint 2 PRD", "Enhanced client experience"),
        ("prd_sprint_3.md", "Sprint 3 PRD", "Advanced features & integrations")
    ]
    
    success_count = 0
    for filename, title, description in expected:
        filepath = output_dir / filename
        if filepath.exists():
            size = filepath.stat().st_size
            print(f"   ✅ {filename} - {title} ({size:,} bytes)")
            print(f"      {description}")
            success_count += 1
        else:
            print(f"   ❌ {filename} - {title} - MISSING")
            print(f"      {description}")
    
    print(f"\n📊 Success rate: {success_count}/{len(expected)} files created")
    
    if success_count == len(expected):
        print("\n🎉 All expected files created successfully!")
    else:
        print(f"\n⚠️  {len(expected) - success_count} files missing")
    
    # Show a preview of Sprint 2 if it exists to verify context was used
    sprint2_path = output_dir / "prd_sprint_2.md"
    if sprint2_path.exists():
        print("\n📝 Sprint 2 Context Check (should reference Sprint 1):")
        print("-"*60)
        content = sprint2_path.read_text()
        lines = content.split('\n')
        
        # Look for references to Sprint 1 or dependencies
        found_reference = False
        for i, line in enumerate(lines[:50]):  # Check first 50 lines
            if any(term in line.lower() for term in ['sprint 1', 'previous sprint', 'depend', 'mvp']):
                if not found_reference:
                    print("   Found context references:")
                    found_reference = True
                print(f"   Line {i+1}: {line.strip()}")
        
        if not found_reference:
            print("   ⚠️ No explicit references to Sprint 1 found in first 50 lines")
    
    # Show roadmap structure if it exists
    roadmap_path = output_dir / "sprint_roadmap.md"
    if roadmap_path.exists():
        print("\n📍 Sprint Roadmap Structure:")
        print("-"*60)
        content = roadmap_path.read_text()
        lines = content.split('\n')
        
        # Show sprint timeline headers
        for line in lines:
            if 'sprint' in line.lower() and any(char in line for char in ['#', 'Week', 'Timeline']):
                print(f"   {line.strip()}")

if __name__ == "__main__":
    asyncio.run(main())