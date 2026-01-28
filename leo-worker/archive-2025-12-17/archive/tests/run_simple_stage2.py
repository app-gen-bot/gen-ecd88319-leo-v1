#!/usr/bin/env python3
"""Run a simple Stage 2 generation to test context awareness."""

import asyncio
import sys
import os
import shutil
from pathlib import Path
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from app_factory.agents.stage_2_wireframe.wireframe import WireframeAgent, create_wireframe_prompt
from app_factory.agents.stage_2_wireframe.qc import QCAgent, create_qc_prompt
from app_factory.utils import Timer


# Very simple spec for quick generation
SIMPLE_SPEC = """# Simple Counter App

## Main Screen
Display a counter with:
- Current count display
- Increment button (+)
- Decrement button (-)
- Reset button

## Interactions
- Click + → increment count by 1
- Click - → decrement count by 1  
- Click Reset → set count to 0
"""

SIMPLE_TECH_SPEC = """# Technical Spec
- Next.js 14 App Router
- React useState for counter state
- ShadCN Button component
- Dark mode styling
"""


async def run_simple_generation():
    """Run a simple generation test."""
    print("=" * 60)
    print("Simple Stage 2 Generation Test")
    print("=" * 60)
    print(f"Started: {datetime.now()}")
    
    # Test directory
    test_dir = Path("/tmp/test_counter_app")
    if test_dir.exists():
        print(f"\nCleaning up existing directory: {test_dir}")
        shutil.rmtree(test_dir)
    
    test_dir.mkdir(parents=True)
    frontend_dir = test_dir / "frontend"
    frontend_dir.mkdir()
    specs_dir = test_dir / "specs"
    specs_dir.mkdir()
    
    # Write specs
    (specs_dir / "interaction-spec.md").write_text(SIMPLE_SPEC)
    (specs_dir / "technical-spec.md").write_text(SIMPLE_TECH_SPEC)
    
    try:
        # Step 1: Wireframe Generation
        print("\n1. Running WireframeAgent...")
        timer = Timer("wireframe_generation")
        
        wireframe_agent = WireframeAgent(
            output_dir=frontend_dir,
            enable_context_awareness=True
        )
        
        wireframe_prompt = create_wireframe_prompt(
            interaction_spec=SIMPLE_SPEC,
            tech_spec=SIMPLE_TECH_SPEC,
            output_dir=str(frontend_dir),
            app_name="counter-app"
        )
        
        print("   Starting generation (this may take a minute)...")
        print(f"   Output directory: {frontend_dir}")
        
        # Set a timeout for safety
        wireframe_result = await asyncio.wait_for(
            wireframe_agent.run(wireframe_prompt),
            timeout=300  # 5 minutes max
        )
        
        print(f"\n   Wireframe generation completed in {timer.elapsed_str()}")
        print(f"   - Success: {wireframe_result.success}")
        print(f"   - Cost: ${wireframe_result.cost:.4f}")
        
        if not wireframe_result.success:
            print(f"   - Error: {wireframe_result.content[:200]}...")
            return False
        
        # Check generated files
        print("\n   Generated files:")
        key_files = ["package.json", "app/page.tsx", "app/layout.tsx", "app/globals.css"]
        for file_name in key_files:
            file_path = frontend_dir / file_name
            if file_path.exists():
                print(f"   - ✓ {file_name} ({file_path.stat().st_size} bytes)")
            else:
                print(f"   - ✗ {file_name}")
        
        # Step 2: QC Validation
        print("\n2. Running QCAgent...")
        qc_timer = Timer("qc_validation")
        
        qc_agent = QCAgent(
            output_dir=frontend_dir,
            enable_context_awareness=True
        )
        
        qc_prompt = create_qc_prompt(
            interaction_spec=SIMPLE_SPEC,
            output_dir=str(frontend_dir),
            app_name="counter-app"
        )
        
        print("   Starting QC validation...")
        
        qc_result = await asyncio.wait_for(
            qc_agent.run(qc_prompt),
            timeout=180  # 3 minutes max
        )
        
        print(f"\n   QC validation completed in {qc_timer.elapsed_str()}")
        print(f"   - Success: {qc_result.success}")
        print(f"   - Cost: ${qc_result.cost:.4f}")
        
        # Check for QC report
        qc_report_path = specs_dir / "qc-report.md"
        if qc_report_path.exists():
            print(f"   - ✓ QC report saved ({qc_report_path.stat().st_size} bytes)")
            # Show first few lines
            report_lines = qc_report_path.read_text().split('\n')[:10]
            print("\n   QC Report Preview:")
            for line in report_lines:
                print(f"   {line}")
        
        # Step 3: Check Context Awareness
        print("\n3. Checking Context Awareness Artifacts...")
        
        # Check for memory storage
        memory_dirs = [
            test_dir / ".agent_memory",
            test_dir / ".agent_context",
            test_dir / ".sessions"
        ]
        
        for mem_dir in memory_dirs:
            if mem_dir.exists():
                files = list(mem_dir.glob("*"))
                print(f"   - ✓ {mem_dir.name}: {len(files)} files")
            else:
                print(f"   - ✗ {mem_dir.name}: not found")
        
        # Summary
        print("\n" + "=" * 60)
        print("Test Summary")
        print("=" * 60)
        print(f"Total time: {Timer.format_duration(timer.elapsed() + qc_timer.elapsed())}")
        print(f"Total cost: ${wireframe_result.cost + qc_result.cost:.4f}")
        print(f"Both agents succeeded: {wireframe_result.success and qc_result.success}")
        print(f"\nGenerated app location: {test_dir}")
        
        return True
        
    except asyncio.TimeoutError:
        print("\n❌ Generation timed out!")
        return False
    except Exception as e:
        print(f"\n❌ Error during generation: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run the test."""
    # Ensure we have necessary environment variables
    if not os.getenv("OPENAI_API_KEY"):
        print("⚠️  Warning: OPENAI_API_KEY not set. Memory embeddings may not work.")
        print("   The agents will still run but without full context features.")
    
    success = asyncio.run(run_simple_generation())
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())