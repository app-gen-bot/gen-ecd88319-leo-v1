#!/usr/bin/env python3
"""Integration test for Stage 2 with context-aware agents."""

import asyncio
import sys
import shutil
from pathlib import Path
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from app_factory.stages import stage_2_wireframe
from app_factory.utils import scaffold_project


# Simple test specs
TEST_INTERACTION_SPEC = """# Frontend Interaction Specification

## Application: Simple Todo App

### Overview
A minimal todo application to test context-aware features.

### Screens

#### 1. Main Screen (/)
- **Header**: "My Todos" title
- **Add Todo Section**:
  - Input field with placeholder "What needs to be done?"
  - Add button
- **Todo List**:
  - Each todo item shows:
    - Checkbox for completion
    - Todo text
    - Delete button
  - Completed todos show strikethrough

### Interactions
- Enter text and click Add → creates new todo
- Click checkbox → toggles completion
- Click delete → removes todo
- Empty state shows "No todos yet!"

### Technical Requirements
- Use React hooks for state
- Dark mode by default
- Responsive design
"""

TEST_TECHNICAL_SPEC = """# Technical Implementation Specification

## Frontend Stack
- Next.js 14 with App Router
- React 18
- TypeScript
- ShadCN UI components
- Tailwind CSS

## Patterns
- Client-side state management with useState
- Form handling with proper validation
- Error boundaries for robustness
"""


async def run_test():
    """Run Stage 2 integration test."""
    print("=" * 60)
    print("Stage 2 Context-Aware Integration Test")
    print("=" * 60)
    print(f"Started at: {datetime.now()}")
    
    # Test app name
    app_name = "test-todo-context"
    
    # Clean up any existing test app
    test_app_dir = Path(__file__).parent.parent / "apps" / app_name
    if test_app_dir.exists():
        print(f"\nCleaning up existing test app: {test_app_dir}")
        shutil.rmtree(test_app_dir)
    
    try:
        # Create project structure
        print(f"\n1. Creating project structure for: {app_name}")
        project_root = Path(__file__).parent.parent
        apps_dir = project_root / "apps"
        app_dir = apps_dir / app_name
        
        # Scaffold the project
        scaffold_project(app_name, str(apps_dir))
        
        # Write test specs
        specs_dir = app_dir / "specs"
        interaction_spec_path = specs_dir / "frontend-interaction-spec.md"
        technical_spec_path = specs_dir / "technical-implementation-spec.md"
        
        print(f"2. Writing test specifications to: {specs_dir}")
        interaction_spec_path.write_text(TEST_INTERACTION_SPEC)
        technical_spec_path.write_text(TEST_TECHNICAL_SPEC)
        
        # Run Stage 2
        print("\n3. Running Stage 2 with context-aware agents...")
        print("   - WireframeAgent (context-aware)")
        print("   - QCAgent (context-aware)")
        print("   - SelfImprovementAgent (if QC runs)")
        
        result = await stage_2_wireframe.run_stage(app_name)
        
        # Check results
        print("\n4. Results:")
        print(f"   - Success: {result.success}")
        print(f"   - Cost: ${result.cost:.4f}")
        
        if result.metadata:
            print(f"   - QC Success: {result.metadata.get('qc_success', 'N/A')}")
            print(f"   - QC Cost: ${result.metadata.get('qc_cost', 0):.4f}")
        
        # Check for generated files
        frontend_dir = app_dir / "frontend"
        if frontend_dir.exists():
            print(f"\n5. Generated files in {frontend_dir}:")
            files = list(frontend_dir.rglob("*"))
            print(f"   - Total files: {len(files)}")
            
            # Show some key files
            key_files = ["package.json", "app/page.tsx", "components/ui/button.tsx"]
            for key_file in key_files:
                file_path = frontend_dir / key_file
                if file_path.exists():
                    print(f"   - ✓ {key_file}")
                else:
                    print(f"   - ✗ {key_file} (not found)")
        
        # Check for context awareness artifacts
        print("\n6. Context Awareness Check:")
        
        # Check for memory files
        memory_dir = app_dir / ".agent_memory"
        if memory_dir.exists():
            print(f"   - ✓ Memory directory created: {memory_dir}")
            memory_files = list(memory_dir.glob("*"))
            print(f"   - Memory files: {len(memory_files)}")
        else:
            print("   - ✗ No memory directory found")
        
        # Check for session files
        context_dir = app_dir / ".agent_context"
        if context_dir.exists():
            print(f"   - ✓ Context directory created: {context_dir}")
            session_files = list(context_dir.glob("session_*.json"))
            print(f"   - Session files: {len(session_files)}")
        else:
            print("   - ✗ No context directory found")
        
        # Check QC report
        qc_report_path = specs_dir / "qc-report.md"
        if qc_report_path.exists():
            print(f"   - ✓ QC report generated: {qc_report_path}")
            print(f"   - QC report size: {qc_report_path.stat().st_size} bytes")
        else:
            print("   - ✗ No QC report found")
        
        print("\n" + "=" * 60)
        print("Test completed successfully!")
        print("=" * 60)
        
        return result.success
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        print(f"\nTest app location: {test_app_dir}")
        print("You can inspect the generated files there.")


def main():
    """Run the test."""
    success = asyncio.run(run_test())
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())