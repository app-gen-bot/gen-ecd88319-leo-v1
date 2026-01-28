#!/usr/bin/env python3
"""Test script to generate page specs with condensed prompts."""

import asyncio
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from app_factory_leonardo_replit.agents.frontend_interaction_spec_page.agent import (
    FrontendInteractionSpecPageAgent
)


async def test_page_spec_generation(app_dir: str, page_name: str, page_route: str):
    """Test page spec generation with condensed prompts.

    Args:
        app_dir: Path to the application directory
        page_name: Name of the page (e.g., "AboutPage")
        page_route: Route for the page (e.g., "/about")
    """
    app_path = Path(app_dir) / "app"

    print(f"\n{'=' * 70}")
    print(f"Testing Page Spec Generation: {page_name}")
    print(f"{'=' * 70}")

    # Read master spec
    master_spec_path = app_path / "specs" / "frontend-interaction-spec-master.md"
    api_registry_path = app_path / "client" / "src" / "lib" / "api-registry.md"
    schema_path = app_path / "shared" / "schema.ts"

    if not master_spec_path.exists():
        print(f"❌ Master spec not found at {master_spec_path}")
        return False

    master_spec = master_spec_path.read_text()
    api_registry = api_registry_path.read_text() if api_registry_path.exists() else None
    schema_content = schema_path.read_text() if schema_path.exists() else None

    # Initialize agent
    print(f"\n🤖 Initializing FrontendInteractionSpecPageAgent...")
    page_info = {"name": page_name, "route": page_route}
    agent = FrontendInteractionSpecPageAgent(app_path, page_info)

    # Generate page spec
    print(f"\n🚀 Generating {page_name} spec with CONDENSED prompts...")
    print("   (This may take a few minutes...)")

    result = await agent.generate_page_spec(
        page_name=page_name,
        page_route=page_route,
        master_spec=master_spec,
        api_registry=api_registry,
        schema_content=schema_content
    )

    if result["success"]:
        spec_path = Path(result["spec_path"])
        spec_size = spec_path.stat().st_size
        spec_lines = len(spec_path.read_text().splitlines())

        print(f"\n✅ {page_name} spec generated successfully!")
        print(f"   📄 Path: {spec_path}")
        print(f"   📏 Size: {spec_size / 1024:.1f}KB ({spec_lines} lines)")
        print(f"   💰 Cost: ${result['cost']:.4f}")

        return {
            "name": page_name,
            "size_kb": spec_size / 1024,
            "lines": spec_lines,
            "cost": result["cost"]
        }
    else:
        print(f"\n❌ {page_name} spec generation failed!")
        print(f"   Error: {result.get('error', 'Unknown error')}")
        return None


async def main():
    """Run tests for multiple pages."""
    if len(sys.argv) < 2:
        print("Usage: python test-condensed-page-specs.py <app-directory>")
        print("Example: python test-condensed-page-specs.py apps/coliving-marketplace_v2")
        sys.exit(1)

    app_dir = sys.argv[1]

    # Test pages: simple, medium, complex
    test_pages = [
        ("AboutPage", "/about", "Simple"),
        ("PropertyDetailPage", "/properties/:id", "Medium"),
        ("EditPropertyPage", "/host/properties/:id/edit", "Complex")
    ]

    print("\n" + "=" * 70)
    print("FIS Page Spec Condensation Test")
    print("=" * 70)
    print(f"\n📁 App Directory: {app_dir}")
    print(f"\n📋 Testing {len(test_pages)} pages:")
    for name, route, complexity in test_pages:
        print(f"   - {name} ({complexity})")

    results = []
    for page_name, page_route, complexity in test_pages:
        result = await test_page_spec_generation(app_dir, page_name, page_route)
        if result:
            result["complexity"] = complexity
            results.append(result)

    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)

    # Original sizes (from analysis)
    originals = {
        "AboutPage": 13,
        "PropertyDetailPage": 18,
        "EditPropertyPage": 27
    }

    # Targets
    targets = {
        "Simple": 4,
        "Medium": 7,
        "Complex": 8
    }

    print("\n📊 Size Comparison:")
    print(f"\n{'Page':<20} {'Complexity':<10} {'Original':<12} {'Condensed':<12} {'Reduction':<12} {'Target':<10} {'Status'}")
    print("-" * 100)

    total_cost = 0
    for result in results:
        name = result["name"]
        complexity = result["complexity"]
        size_kb = result["size_kb"]
        original_kb = originals.get(name, 0)
        target_kb = targets[complexity]
        reduction = ((original_kb - size_kb) / original_kb * 100) if original_kb > 0 else 0
        status = "✅" if size_kb <= target_kb else "⚠️"
        total_cost += result["cost"]

        print(f"{name:<20} {complexity:<10} {original_kb}KB{'':<8} {size_kb:.1f}KB{'':<7} {reduction:.1f}%{'':<8} {target_kb}KB{'':<6} {status}")

    print("-" * 100)
    print(f"\n💰 Total Cost: ${total_cost:.4f}")

    # Overall stats
    if results:
        avg_reduction = sum((originals.get(r["name"], 0) - r["size_kb"]) / originals.get(r["name"], 1) * 100 for r in results) / len(results)
        print(f"📈 Average Reduction: {avg_reduction:.1f}%")

        all_within_target = all(r["size_kb"] <= targets[r["complexity"]] for r in results)
        if all_within_target:
            print("\n✅ All page specs within target sizes!")
        else:
            print("\n⚠️  Some page specs exceed target sizes")

    print("\n" + "=" * 70)


if __name__ == "__main__":
    asyncio.run(main())
