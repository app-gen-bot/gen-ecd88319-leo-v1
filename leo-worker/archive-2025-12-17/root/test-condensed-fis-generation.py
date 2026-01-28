#!/usr/bin/env python3
"""Test script to generate FIS specs with condensed prompts."""

import asyncio
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from app_factory_leonardo_replit.agents.frontend_interaction_spec_master.agent import (
    FrontendInteractionSpecMasterAgent
)


async def test_master_spec_generation(app_dir: str):
    """Test master spec generation with condensed prompts.

    Args:
        app_dir: Path to the application directory (e.g., apps/coliving-marketplace_v2)
    """
    app_path = Path(app_dir)

    print("=" * 70)
    print("Testing FIS Master Spec Generation with Condensed Prompts")
    print("=" * 70)
    print(f"\n📁 App Directory: {app_path}")

    # Check prerequisites
    print("\n📋 Checking prerequisites...")

    plan_path = app_path / "plan" / "plan.md"
    api_registry_path = app_path / "app" / "client" / "src" / "lib" / "api-registry.md"
    schema_path = app_path / "app" / "shared" / "schema.ts"
    contracts_dir = app_path / "app" / "shared" / "contracts"
    pages_and_routes_path = app_path / "app" / "specs" / "pages-and-routes.md"

    checks = [
        (plan_path, "Plan"),
        (api_registry_path, "API Registry"),
        (schema_path, "Schema"),
        (contracts_dir, "Contracts Directory"),
        (pages_and_routes_path, "Pages and Routes")
    ]

    for path, name in checks:
        if path.exists():
            if path.is_dir():
                count = len(list(path.glob("*.contract.ts")))
                print(f"  ✅ {name}: {count} files")
            else:
                size = path.stat().st_size / 1024
                print(f"  ✅ {name}: {size:.1f}KB")
        else:
            print(f"  ⚠️  {name}: Not found")

    # Initialize agent
    print("\n🤖 Initializing FrontendInteractionSpecMasterAgent...")
    agent = FrontendInteractionSpecMasterAgent(app_path / "app")

    # Generate master spec
    print("\n🚀 Generating master spec with CONDENSED prompts...")
    print("   (This may take a few minutes...)")

    result = await agent.generate_master_spec(
        plan_path=plan_path,
        api_registry_path=api_registry_path,
        schema_path=schema_path,
        contracts_dir=contracts_dir,
        pages_and_routes_path=pages_and_routes_path
    )

    if result["success"]:
        spec_path = Path(result["spec_path"])
        spec_size = spec_path.stat().st_size
        spec_lines = len(spec_path.read_text().splitlines())

        print(f"\n✅ Master spec generated successfully!")
        print(f"   📄 Path: {spec_path}")
        print(f"   📏 Size: {spec_size / 1024:.1f}KB ({spec_lines} lines)")
        print(f"   💰 Cost: ${result['cost']:.4f}")

        # Compare with backup
        backup_size = 46 * 1024  # Known size from previous analysis
        reduction = ((backup_size - spec_size) / backup_size) * 100

        print(f"\n📊 Comparison:")
        print(f"   Original: ~46KB")
        print(f"   Condensed: {spec_size / 1024:.1f}KB")
        print(f"   Reduction: {reduction:.1f}%")

        if spec_size / 1024 <= 20:
            print(f"   ✅ Within target (20KB)")
        else:
            print(f"   ⚠️  Exceeds target (20KB)")

        if spec_lines <= 800:
            print(f"   ✅ Within target (800 lines)")
        else:
            print(f"   ⚠️  Exceeds target (800 lines)")
    else:
        print(f"\n❌ Master spec generation failed!")
        print(f"   Error: {result.get('error', 'Unknown error')}")
        return False

    print("\n" + "=" * 70)
    return True


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test-condensed-fis-generation.py <app-directory>")
        print("Example: python test-condensed-fis-generation.py apps/coliving-marketplace_v2")
        sys.exit(1)

    app_dir = sys.argv[1]
    success = asyncio.run(test_master_spec_generation(app_dir))
    sys.exit(0 if success else 1)
