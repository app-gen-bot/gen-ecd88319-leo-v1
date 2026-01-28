#!/usr/bin/env python3
"""Analyze and compare results from full FIS regeneration."""

import json
from pathlib import Path
import sys


def analyze_results():
    """Analyze regeneration results and create comparison report."""

    app_dir = Path("apps/coliving-marketplace_v2/app")
    specs_dir = app_dir / "specs"
    pages_dir = specs_dir / "pages"

    print("=" * 70)
    print("FIS Full Regeneration Analysis")
    print("=" * 70)
    print()

    # Check if specs exist
    master_spec_path = specs_dir / "frontend-interaction-spec-master.md"
    if not master_spec_path.exists():
        print("❌ Master spec not found. Regeneration may have failed.")
        return False

    # Master spec analysis
    master_size = master_spec_path.stat().st_size
    master_lines = len(master_spec_path.read_text().splitlines())

    print("📊 Master Spec Analysis:")
    print(f"   Size: {master_size / 1024:.1f}KB ({master_lines} lines)")
    print(f"   Target: 20KB (800 lines)")

    if master_size / 1024 <= 20:
        print(f"   Status: ✅ Within target")
    else:
        print(f"   Status: ⚠️  Exceeds target by {(master_size / 1024) - 20:.1f}KB")

    if master_lines <= 800:
        print(f"   Lines: ✅ Within target")
    else:
        print(f"   Lines: ⚠️  Exceeds target by {master_lines - 800} lines")

    print()

    # Page specs analysis
    if not pages_dir.exists():
        print("❌ Pages directory not found.")
        return False

    page_specs = list(pages_dir.glob("*.md"))

    if not page_specs:
        print("❌ No page specs found.")
        return False

    print(f"📊 Page Specs Analysis ({len(page_specs)} pages):")
    print()

    # Categorize by size
    simple_pages = []  # < 5KB
    medium_pages = []  # 5-8KB
    complex_pages = []  # > 8KB

    total_size = 0
    total_lines = 0

    for spec_path in sorted(page_specs):
        size = spec_path.stat().st_size
        lines = len(spec_path.read_text().splitlines())
        total_size += size
        total_lines += lines

        size_kb = size / 1024
        page_name = spec_path.stem.replace("frontend-interaction-spec-", "")

        if size_kb < 5:
            simple_pages.append((page_name, size_kb, lines))
        elif size_kb < 8:
            medium_pages.append((page_name, size_kb, lines))
        else:
            complex_pages.append((page_name, size_kb, lines))

    print(f"   Simple pages (< 5KB): {len(simple_pages)}")
    if simple_pages:
        avg_size = sum(s for _, s, _ in simple_pages) / len(simple_pages)
        avg_lines = sum(l for _, _, l in simple_pages) / len(simple_pages)
        print(f"      Average: {avg_size:.1f}KB, {avg_lines:.0f} lines")
        print(f"      Target: 4KB (150-200 lines)")

    print()
    print(f"   Medium pages (5-8KB): {len(medium_pages)}")
    if medium_pages:
        avg_size = sum(s for _, s, _ in medium_pages) / len(medium_pages)
        avg_lines = sum(l for _, _, l in medium_pages) / len(medium_pages)
        print(f"      Average: {avg_size:.1f}KB, {avg_lines:.0f} lines")
        print(f"      Target: 7KB (250-350 lines)")

    print()
    print(f"   Complex pages (> 8KB): {len(complex_pages)}")
    if complex_pages:
        avg_size = sum(s for _, s, _ in complex_pages) / len(complex_pages)
        avg_lines = sum(l for _, _, l in complex_pages) / len(complex_pages)
        print(f"      Average: {avg_size:.1f}KB, {avg_lines:.0f} lines")
        print(f"      Target: 8KB (350-450 lines)")

        print()
        print(f"   Complex pages detail:")
        for name, size, lines in sorted(complex_pages, key=lambda x: x[1], reverse=True):
            status = "⚠️" if size > 8 else "✅"
            print(f"      {status} {name}: {size:.1f}KB ({lines} lines)")

    print()
    print(f"📈 Overall Statistics:")
    print(f"   Total pages: {len(page_specs)}")
    print(f"   Total size: {total_size / 1024:.1f}KB")
    print(f"   Average per page: {(total_size / len(page_specs)) / 1024:.1f}KB")
    print(f"   Average lines per page: {total_lines / len(page_specs):.0f}")

    # Load before sizes if available
    try:
        with open('/tmp/master_size_before.txt') as f:
            master_before = int(f.read().strip())
        with open('/tmp/pages_size_before.txt') as f:
            pages_before = int(f.read().strip()) * 1024  # Convert from KB to bytes

        master_reduction = ((master_before - master_size) / master_before) * 100
        pages_reduction = ((pages_before - total_size) / pages_before) * 100
        overall_reduction = ((master_before + pages_before - master_size - total_size) / (master_before + pages_before)) * 100

        print()
        print(f"📉 Size Reductions:")
        print(f"   Master spec: {master_reduction:.1f}%")
        print(f"   Page specs: {pages_reduction:.1f}%")
        print(f"   Overall: {overall_reduction:.1f}%")

        if overall_reduction >= 60:
            print(f"   Status: ✅ Exceeded 60% target!")
        else:
            print(f"   Status: ⚠️  Below 60% target")
    except:
        print()
        print("   (No before/after comparison available)")

    # Check for failures
    generation_state_path = specs_dir / ".generation_state.json"
    if generation_state_path.exists():
        with open(generation_state_path) as f:
            state = json.load(f)

        failed = [p for p, s in state.get('pages', {}).items() if s == 'failed']
        if failed:
            print()
            print(f"⚠️  Failed pages ({len(failed)}):")
            for page in failed:
                print(f"   - {page}")

    print()
    print("=" * 70)
    print()

    # Quality sampling
    print("🔍 Quality Sampling (checking 3 random specs):")
    print()

    import random
    sample_specs = random.sample(page_specs, min(3, len(page_specs)))

    for spec_path in sample_specs:
        content = spec_path.read_text()
        page_name = spec_path.stem.replace("frontend-interaction-spec-", "")

        # Check for key markers of condensation
        has_no_react_query = "useMutation" not in content and "useQuery" not in content
        has_condensed_api = "apiClient." in content and "->" in content
        has_reference_patterns = "per master spec" in content.lower() or "standard" in content.lower()

        print(f"   {page_name}:")
        print(f"      ✅ No React Query boilerplate" if has_no_react_query else "      ⚠️  Contains React Query code")
        print(f"      ✅ Condensed API format" if has_condensed_api else "      ⚠️  Verbose API format")
        print(f"      ✅ References standard patterns" if has_reference_patterns else "      ⚠️  May repeat standard patterns")
        print()

    print("=" * 70)
    print()
    print("✅ Analysis complete!")
    print()
    print("📝 Next Steps:")
    print("   1. Review sample specs manually for quality")
    print("   2. If satisfied, commit with: git add apps/coliving-marketplace_v2/app/specs/")
    print("   3. If issues found, restore backup or use --resume to retry failures")
    print()

    return True


if __name__ == "__main__":
    try:
        success = analyze_results()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"❌ Analysis failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
