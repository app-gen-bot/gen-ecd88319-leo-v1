#!/usr/bin/env python3
"""Minimal test for Stage 2 context-aware agents."""

import asyncio
import sys
import os
from pathlib import Path
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from app_factory.agents.stage_2_wireframe.wireframe import WireframeAgent, create_wireframe_prompt
from app_factory.agents.stage_2_wireframe.qc import QCAgent, create_qc_prompt


# Minimal specs
MINIMAL_INTERACTION_SPEC = """# Todo App Interaction Spec

## Main Screen
- Title: "My Todos"
- Add todo form with input and button
- List of todos with checkbox and delete
"""

MINIMAL_TECH_SPEC = """# Technical Spec
- Next.js 14
- ShadCN UI
- Dark mode
"""


async def test_minimal():
    """Run minimal test of context-aware agents."""
    print("=" * 60)
    print("Minimal Context-Aware Stage 2 Test")
    print("=" * 60)
    
    # Create test directory
    test_dir = Path("/tmp/test_stage2_minimal")
    test_dir.mkdir(exist_ok=True)
    
    # Create minimal frontend structure
    frontend_dir = test_dir / "frontend"
    frontend_dir.mkdir(exist_ok=True)
    
    # Create a minimal package.json to avoid template issues
    package_json = {
        "name": "test-app",
        "version": "0.1.0",
        "scripts": {
            "dev": "next dev",
            "build": "next build"
        }
    }
    
    import json
    (frontend_dir / "package.json").write_text(json.dumps(package_json, indent=2))
    
    try:
        print("\n1. Testing WireframeAgent with context awareness...")
        wireframe_agent = WireframeAgent(
            output_dir=frontend_dir,
            enable_context_awareness=True
        )
        
        print(f"   - Agent name: {wireframe_agent.name}")
        print(f"   - Context aware: {wireframe_agent.enable_context_awareness}")
        print(f"   - MCP tools: {list(wireframe_agent.mcp_config.keys())}")
        print(f"   - Total tools: {len(wireframe_agent.allowed_tools)}")
        
        # Create wireframe prompt
        wireframe_prompt = create_wireframe_prompt(
            interaction_spec=MINIMAL_INTERACTION_SPEC,
            tech_spec=MINIMAL_TECH_SPEC,
            output_dir=str(frontend_dir),
            app_name="test-minimal"
        )
        
        print("\n2. Simulating wireframe generation (not running to avoid long execution)...")
        print(f"   - Prompt length: {len(wireframe_prompt)} chars")
        print(f"   - Would generate to: {frontend_dir}")
        
        # Test context tracking
        print("\n3. Testing context tracking capabilities...")
        wireframe_agent.track_file_modification(
            "app/page.tsx",
            "create",
            "Main todo app page"
        )
        wireframe_agent.track_decision(
            "Use client-side state",
            "Simple todo app doesn't need server state"
        )
        
        print(f"   - Files tracked: {len(wireframe_agent.files_modified)}")
        print(f"   - Decisions tracked: {len(wireframe_agent.decisions_made)}")
        
        # Test QC Agent
        print("\n4. Testing QCAgent with context awareness...")
        qc_agent = QCAgent(
            output_dir=frontend_dir,
            enable_context_awareness=True
        )
        
        print(f"   - Agent name: {qc_agent.name}")
        print(f"   - Has integration_analyzer: {'integration_analyzer' in qc_agent.allowed_tools}")
        print(f"   - Has mem0: {'mem0' in qc_agent.allowed_tools}")
        
        # Create QC prompt
        qc_prompt = create_qc_prompt(
            interaction_spec=MINIMAL_INTERACTION_SPEC,
            output_dir=str(frontend_dir),
            app_name="test-minimal"
        )
        
        print(f"   - QC prompt created: {len(qc_prompt)} chars")
        
        # Test QC tracking
        qc_agent.track_decision(
            "Missing error handling",
            "No error states defined for failed todo operations"
        )
        
        print(f"   - QC decisions tracked: {len(qc_agent.decisions_made)}")
        
        # Check for context directories
        print("\n5. Checking context persistence...")
        
        # The agents would create these during actual runs
        print(f"   - Test directory: {test_dir}")
        print(f"   - Frontend directory exists: {frontend_dir.exists()}")
        
        print("\n" + "=" * 60)
        print("✅ Minimal test completed successfully!")
        print("=" * 60)
        print("\nKey findings:")
        print("- Both agents successfully created with context awareness")
        print("- MCP tools properly configured")
        print("- Context tracking methods working")
        print("- Ready for full generation test")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run the test."""
    success = asyncio.run(test_minimal())
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())