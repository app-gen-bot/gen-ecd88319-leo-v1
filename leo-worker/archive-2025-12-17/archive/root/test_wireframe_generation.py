#!/usr/bin/env python3
"""Test the context-aware wireframe generation for project management app."""

import asyncio
import logging
from pathlib import Path
import sys

# Add parent directory to path
sys.path.append(str(Path(__file__).parent / "src"))

from app_factory.agents.stage_2_wireframe.wireframe.agent import WireframeAgent

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

async def main():
    """Run the wireframe agent for project management app."""
    
    app_dir = Path("apps/project-management-app")
    frontend_dir = app_dir / "frontend"
    frontend_dir.mkdir(parents=True, exist_ok=True)
    
    print("🎨 Testing Context-Aware Wireframe Generation")
    print("=" * 60)
    print(f"App directory: {app_dir}")
    print(f"Frontend directory: {frontend_dir}")
    print("=" * 60)
    
    # Initialize the context-aware wireframe agent
    print("\n📊 Initializing Context-Aware WireframeAgent...")
    agent = WireframeAgent(
        output_dir=frontend_dir,
        enable_context_awareness=True  # Explicitly enable context awareness
    )
    
    print(f"✅ Agent initialized with {len(agent.allowed_tools)} tools")
    print(f"   Context tools: {[t for t in agent.allowed_tools if t in ['mem0', 'tree_sitter', 'context_manager', 'integration_analyzer', 'graphiti']]}")
    
    # Read the specs
    prd_path = app_dir / "specs" / "prd.md"
    interaction_spec_path = app_dir / "specs" / "interaction_spec.md"
    
    if not prd_path.exists() or not interaction_spec_path.exists():
        print("❌ Missing required spec files!")
        return
    
    prd_content = prd_path.read_text()
    interaction_spec = interaction_spec_path.read_text()
    
    print(f"\n📄 Loaded PRD ({len(prd_content)} chars)")
    print(f"📄 Loaded Interaction Spec ({len(interaction_spec)} chars)")
    
    # Create the user prompt for the wireframe agent
    user_prompt = f"""
Based on the provided PRD and Interaction Specification, create a complete Next.js 14 application 
wireframe for the project management platform.

PRD:
{prd_content}

INTERACTION SPECIFICATION:
{interaction_spec}

Create a fully functional wireframe that implements all the UI components and interactions described.
Focus on creating a working prototype with all the core features.
"""
    
    # Run the agent
    print("\n🚀 Running wireframe generation...")
    print("   This will use context-aware features including Graphiti for knowledge graphs")
    
    result = await agent.run(user_prompt)
    
    if result.success:
        print("\n✅ Wireframe generation completed successfully!")
        print(f"   Cost: ${result.cost:.4f}")
        print(f"   Files created in: {frontend_dir}")
        
        # Check what files were created
        created_files = list(frontend_dir.rglob("*"))
        if created_files:
            print("\n📁 Generated files:")
            for file in sorted(created_files)[:20]:  # Show first 20 files
                if file.is_file():
                    print(f"   - {file.relative_to(frontend_dir)}")
    else:
        print(f"\n❌ Wireframe generation failed!")
        print(f"   Error: {result.error}")

if __name__ == "__main__":
    asyncio.run(main())