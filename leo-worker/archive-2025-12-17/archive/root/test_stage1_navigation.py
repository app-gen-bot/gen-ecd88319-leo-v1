#!/usr/bin/env python3
"""Test Stage 1 navigation completeness improvements."""

import asyncio
import sys
from pathlib import Path

# Add the src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from app_factory import stages


async def test_stage1_navigation():
    """Test Stage 1 with navigation completeness requirements."""
    
    print("\n🧪 Testing Stage 1 Navigation Completeness")
    print("=" * 80)
    
    # Sample PRD with navigation requirements
    prd_content = """
# TaskFlow - Project Management App

## Overview
A simple project management application with user authentication and task tracking.

## Features

### 1. Authentication
- User login/logout
- User registration
- Password reset

### 2. Dashboard
- Overview of all projects
- Recent activity feed
- Quick stats

### 3. Projects
- Create new project
- Edit project details
- Delete project
- View project tasks

### 4. Tasks
- Create task
- Edit task
- Delete task
- Mark as complete
- Assign to users

### 5. User Management
- User profile
- User settings
- Team management

### 6. Navigation
- Main nav: Dashboard, Projects, Tasks, Team
- User menu: Profile, Settings, Help, Logout
- Project actions: Edit, Delete, Archive
"""
    
    print("📝 Using PRD for TaskFlow app")
    print("\n🚀 Running Stage 1 with iterative mode...")
    
    try:
        # Run Stage 1 with iterative mode
        result = await stages.stage_1_interaction_spec.run_stage(
            prd_content=prd_content,
            iterative_mode=True,
            app_name="TaskFlow"
        )
        
        if result.success:
            print("\n✅ Stage 1 completed successfully!")
            print(f"💰 Cost: ${result.cost:.4f}")
            
            # Check the generated content
            spec_content = result.content
            
            print("\n🔍 Checking for navigation completeness...")
            
            # Check for key navigation sections
            checks = {
                "Complete Navigation & Interaction Map": False,
                "Route Inventory": False,
                "Interactive Element Catalog": False,
                "Modal & Dialog Actions": False,
                "Navigation Validation Checklist": False,
                "/dashboard": False,
                "/projects": False,
                "/tasks": False,
                "/login": False,
                "/404": False,
                "User Menu": False,
                "Profile ->": False,
                "Settings ->": False,
                "Logout ->": False
            }
            
            for check_item in checks:
                if check_item in spec_content:
                    checks[check_item] = True
                    print(f"   ✅ Found: {check_item}")
                else:
                    print(f"   ❌ Missing: {check_item}")
            
            # Calculate coverage
            coverage = sum(1 for v in checks.values() if v) / len(checks) * 100
            print(f"\n📊 Navigation Coverage: {coverage:.1f}%")
            
            if coverage >= 80:
                print("✅ Navigation completeness test PASSED!")
            else:
                print("❌ Navigation completeness test FAILED - coverage too low")
                
            # Save the spec for inspection
            output_path = Path("test_outputs/stage1_navigation_test.md")
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_text(spec_content)
            print(f"\n💾 Saved interaction spec to: {output_path}")
            
        else:
            print(f"\n❌ Stage 1 failed: {result.content}")
            
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_stage1_navigation())