#!/usr/bin/env python3
"""Test simplified sprint breakdown with PawsFlow PRD."""

import asyncio
from pathlib import Path
from app_factory.stages import stage_0_5_sprint_breakdown_simple

async def main():
    """Test simplified sprint breakdown with PawsFlow PRD."""
    print("🚀 Testing Simplified Sprint Breakdown with PawsFlow PRD")
    print("="*60)
    print("This creates ONE comprehensive document with all sprint information")
    print("")
    
    # Read the PawsFlow PRD
    prd_path = Path("apps/app_20250716_074453/specs/business_prd.md")
    if not prd_path.exists():
        print(f"❌ PawsFlow PRD not found at {prd_path}")
        return
    
    prd_content = prd_path.read_text()
    print(f"📄 Loaded PawsFlow PRD: {len(prd_content)} characters")
    
    # Use a clear output directory
    output_dir = Path("test_output/pawsflow_simple_sprint")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Clear any existing files
    print("\n🧹 Clearing existing files...")
    for file in output_dir.glob("*.md"):
        file.unlink()
        print(f"   Deleted: {file.name}")
    
    print(f"\n📁 Output directory: {output_dir.absolute()}")
    print("\nRunning simplified sprint breakdown...")
    print("-"*60)
    
    # Run the simplified sprint breakdown
    try:
        result, sprint_doc_path = await stage_0_5_sprint_breakdown_simple.run_stage(
            prd_content=prd_content,
            app_name="pawsflow",
            output_dir=output_dir
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
    print(f"💰 Cost: ${result.cost:.4f}")
    
    if sprint_doc_path and sprint_doc_path.exists():
        print(f"📄 Document created: {sprint_doc_path.name}")
        print(f"📏 Size: {sprint_doc_path.stat().st_size:,} bytes")
        
        # Show document structure
        print("\n📋 Document Structure:")
        print("-"*60)
        content = sprint_doc_path.read_text()
        lines = content.split('\n')
        
        # Show all headers
        for line in lines:
            if line.strip().startswith('#'):
                level = len(line) - len(line.lstrip('#'))
                indent = "  " * (level - 1)
                header = line.strip('#').strip()
                print(f"{indent}{header}")
        
        # Count sprints
        sprint_count = stage_0_5_sprint_breakdown_simple.extract_sprint_count(content)
        print(f"\n📊 Total sprints identified: {sprint_count}")
        
        # Show Sprint 1 features preview
        print("\n🎯 Sprint 1 (MVP) Features:")
        print("-"*60)
        in_sprint1 = False
        in_features = False
        feature_count = 0
        
        for line in lines:
            if 'Sprint 1:' in line and '#' in line:
                in_sprint1 = True
            elif in_sprint1 and 'Sprint 2:' in line and '#' in line:
                break
            elif in_sprint1 and 'Features' in line:
                in_features = True
            elif in_features and line.strip() and not line.startswith('#'):
                print(f"  {line.strip()}")
                feature_count += 1
                if feature_count > 10:
                    print("  ... (more features)")
                    break
    else:
        print("❌ No document was created!")
        
        # Check what files exist in the output directory
        print("\n📁 Files in output directory:")
        all_files = list(output_dir.glob("*"))
        if all_files:
            for file in all_files:
                print(f"   - {file.name}")
        else:
            print("   (empty)")

if __name__ == "__main__":
    asyncio.run(main())