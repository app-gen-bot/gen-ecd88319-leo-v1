#!/usr/bin/env python3
"""Test Sprint Breakdown with enhanced prompts."""

import asyncio
from pathlib import Path
from app_factory.stages import stage_0_5_sprint_breakdown

async def main():
    # Read PawsFlow PRD
    prd_path = Path("apps/app_20250716_074453/specs/business_prd.md")
    prd_content = prd_path.read_text()
    
    # Output directory
    output_dir = Path("test_output/pawsflow_sprint_v4")
    
    print(f"📄 PawsFlow PRD loaded: {len(prd_content)} characters")
    print(f"📁 Output directory: {output_dir}")
    print("\n🚀 Running Sprint Breakdown with enhanced prompts...")
    print("   - MAX_TURNS = 100")
    print("   - Explicit file checklist in user prompt")
    print("   - Task completion criteria in system prompt")
    print("   - TodoWrite tracking encouraged")
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
        ("sprint_overview.md", "Sprint Overview"),
        ("sprint_roadmap.md", "Sprint Roadmap"), 
        ("prd_sprint_1.md", "Sprint 1 PRD (MVP)"),
        ("prd_sprint_2.md", "Sprint 2 PRD (Enhanced)"),
        ("prd_sprint_3.md", "Sprint 3 PRD (Extended)")
    ]
    
    missing_count = 0
    for filename, description in required_files:
        filepath = output_dir / filename
        if filepath.exists():
            print(f"   ✅ {filename} - {description}")
        else:
            print(f"   ❌ {filename} - {description} - MISSING!")
            missing_count += 1
    
    if missing_count == 0:
        print("\n🎉 All required files created successfully!")
    else:
        print(f"\n⚠️  {missing_count} files missing!")
    
    # Show Sprint 1 MVP features if exists
    sprint1_path = output_dir / "prd_sprint_1.md"
    if sprint1_path.exists():
        print("\n📝 Sprint 1 MVP Features:")
        print("   " + "-"*50)
        content = sprint1_path.read_text()
        # Extract features section
        lines = content.split('\n')
        in_features = False
        feature_count = 0
        for line in lines:
            if "## Features" in line or "## Core Features" in line:
                in_features = True
                continue
            elif in_features and line.startswith("##") and "Features" not in line:
                break
            elif in_features and line.strip():
                print(f"   {line}")
                if line.startswith("-") or line.startswith("*") or line.startswith("1."):
                    feature_count += 1
                if feature_count >= 10:
                    print("   ... (more features)")
                    break

if __name__ == "__main__":
    asyncio.run(main())