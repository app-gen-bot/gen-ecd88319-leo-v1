#!/usr/bin/env python3
"""Test script to verify navigation improvements in App Factory pipeline."""

import asyncio
import sys
from pathlib import Path

# Add the src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from app_factory.main_v2 import run_pipeline_v2
from app_factory.checkpoint import CheckpointManager


async def test_navigation_improvements():
    """Test the complete pipeline with navigation improvements."""
    
    print("\n🧪 Testing App Factory Pipeline with Navigation Improvements")
    print("=" * 80)
    
    # Test prompt for a simple app with navigation
    test_prompt = """
    Create a simple task management app called TaskMaster with:
    1. User authentication (login/logout)
    2. Dashboard showing task overview
    3. Task list with CRUD operations
    4. User settings page
    5. About page
    
    Make sure to have a user menu dropdown with options for:
    - Profile
    - Settings
    - Help
    - Logout
    
    Include a main navigation with Home, Tasks, and About.
    """
    
    print(f"\n📝 Test Prompt:\n{test_prompt}")
    print("\n" + "=" * 80)
    
    # Run the pipeline with iterative Stage 1
    print("\n🚀 Starting pipeline with navigation improvements...")
    print("   - Stage 1 will use iterative mode with navigation completeness check")
    print("   - Stage 2 will verify all navigation links work")
    print("   - Browser will open in visible mode for testing")
    
    try:
        results = await run_pipeline_v2(
            user_prompt=test_prompt,
            iterative_stage_1=True  # Enable iterative mode for Stage 1
        )
        
        print("\n✅ Pipeline completed!")
        print("\n📊 Results Summary:")
        for stage, result in results.items():
            if result.success:
                print(f"   ✅ {stage}: Success (${result.cost:.4f})")
            else:
                print(f"   ❌ {stage}: Failed")
        
        # Check checkpoint
        manager = CheckpointManager()
        checkpoints = manager.list_checkpoints()
        if checkpoints:
            latest_id = max(checkpoints.keys(), key=lambda k: checkpoints[k]['updated_at'])
            print(f"\n📋 Checkpoint created: {latest_id}")
            print("   Use this to resume if needed: python -m app_factory.main_v2 --checkpoint " + latest_id)
        
        # Verify navigation completeness in generated files
        if "interaction_spec" in results and results["interaction_spec"].success:
            print("\n🔍 Checking navigation completeness in interaction spec...")
            
            # Look for the generated app directory
            app_name = "TaskMaster"  # Based on our test prompt
            spec_path = Path(f"apps/{app_name}/specs/frontend-interaction-spec.md")
            
            if spec_path.exists():
                spec_content = spec_path.read_text()
                
                # Check for navigation completeness section
                if "Complete Navigation & Interaction Map" in spec_content:
                    print("   ✅ Navigation completeness section found")
                else:
                    print("   ❌ Navigation completeness section missing")
                
                # Check for specific navigation elements
                nav_elements = [
                    "Route Inventory",
                    "Interactive Element Catalog", 
                    "Modal & Dialog Actions",
                    "Navigation Validation Checklist"
                ]
                
                for element in nav_elements:
                    if element in spec_content:
                        print(f"   ✅ {element} found")
                    else:
                        print(f"   ❌ {element} missing")
        
        print("\n🎉 Test completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_navigation_improvements())