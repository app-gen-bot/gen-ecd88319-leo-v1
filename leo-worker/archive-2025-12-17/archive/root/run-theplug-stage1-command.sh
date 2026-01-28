#!/bin/bash
# Direct command to run Stage 1 for ThePlugs

# Create a Python script that imports and runs Stage 1 directly
cat > run_stage1_theplug.py << 'EOF'
import asyncio
from pathlib import Path
import sys
sys.path.insert(0, "src")

from app_factory.stages import stage_1_interaction_spec
from cc_agent import AgentResult

async def main():
    # Configuration
    app_name = "theplug"
    prd_path = Path(f"apps/{app_name}/specs/business_prd.md")
    
    print(f"🎯 Running Stage 1 for {app_name}")
    print(f"📄 Reading PRD from: {prd_path}")
    
    # Read PRD
    prd_content = prd_path.read_text()
    print(f"📊 PRD size: {len(prd_content)} characters")
    
    # Run Stage 1 with iterative mode for full coverage
    print("\n🔄 Running with iterative mode (Writer-Critic) for complete coverage...")
    print("This ensures all PRD features are captured in the interaction spec.\n")
    
    result = await stage_1_interaction_spec.run_stage(
        prd_content=prd_content,
        iterative_mode=True,  # This enables Writer-Critic iteration
        app_name=app_name
    )
    
    if result.success:
        # Save the result
        output_path = prd_path.parent / "frontend-interaction-spec.md"
        output_path.write_text(result.content)
        
        print(f"\n✅ Success!")
        print(f"📝 Interaction spec saved to: {output_path}")
        print(f"💰 Total cost: ${result.cost:.4f}")
        
        # Show stats if available
        if hasattr(result, 'metadata') and result.metadata:
            if 'sections_count' in result.metadata:
                print(f"📊 Sections generated: {result.metadata['sections_count']}")
            if 'coverage_score' in result.metadata:
                print(f"📊 Coverage score: {result.metadata['coverage_score']}%")
    else:
        print(f"\n❌ Failed: {result.content}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
EOF

# Run it with uv
echo "🚀 Starting Stage 1 generation with full iteration..."
uv run python run_stage1_theplug.py

# Clean up
rm -f run_stage1_theplug.py

echo ""
echo "✨ Done! Check apps/theplug/specs/frontend-interaction-spec.md"