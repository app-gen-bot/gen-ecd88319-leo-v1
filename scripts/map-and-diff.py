#!/usr/bin/env python3
"""
Map and Diff: Jake Branch vs Golden Branch

Maps .md files from jake branch (subset) to golden branch by path,
then diffs each pair to find unexpected content differences.

Matching strategy (in order):
1. Exact path match (same relative path in both)
2. Known path mappings (jake restructured some paths)
3. Filename match with content similarity (fallback)

Usage:
    python scripts/map-and-diff.py [--diff] [--verbose]
"""

import os
import sys
import difflib
import re
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Set

# Paths - relative to saas-dev-agent root
SCRIPT_DIR = Path(__file__).parent.resolve()
SAAS_DEV_AGENT_ROOT = SCRIPT_DIR.parent
JAKE_ROOT = SAAS_DEV_AGENT_ROOT / "repos" / "app-factory" / "leo-container"
GOLDEN_ROOT = SAAS_DEV_AGENT_ROOT / "repos" / "leo-container-golden"

# Directories to skip
SKIP_DIRS = {'.git', 'node_modules', '__pycache__', '.venv', 'venv'}

# Known path mappings: jake path -> golden path
# (where jake restructured/moved files)
PATH_MAPPINGS = {
    # Subagent patterns moved into agent directories
    "src/leo/agents/app_generator/subagents/ai_integration/patterns/": "docs/patterns/ai_integration/",
    "src/leo/agents/app_generator/subagents/code_writer/patterns/": "docs/patterns/code_writer/",
    "src/leo/agents/app_generator/subagents/error_fixer/patterns/": "docs/patterns/error_fixer/",
    "src/leo/agents/app_generator/subagents/quality_assurer/patterns/": "docs/patterns/quality_assurer/",
    # Reprompter
    "src/leo/agents/reprompter/": "src/leo/agents/reprompter/",
    # Resources
    "src/leo/resources/": "src/leo/resources/",
}

# Path patterns to normalize for content comparison
NORMALIZE_PATTERNS = [
    (r'/factory/leo/', 'src/leo/'),
    (r'/factory/', 'src/'),
    (r'~/.claude/', '.claude/'),
    (r'/home/leo-user/.claude/', '.claude/'),
    (r'/home/leo-user/', ''),
]


def find_md_files(root: Path) -> Dict[str, Path]:
    """Find all .md files, return dict of relative_path -> full_path"""
    files: Dict[str, Path] = {}

    for md_file in root.rglob('*.md'):
        if any(skip in md_file.parts for skip in SKIP_DIRS):
            continue
        try:
            rel_path = str(md_file.relative_to(root))
            files[rel_path] = md_file
        except ValueError:
            pass

    return files


def find_golden_match(jake_path: str, jake_files: Dict[str, Path],
                      golden_files: Dict[str, Path]) -> Optional[Tuple[str, str]]:
    """
    Find the golden file that matches a jake file.
    Returns (golden_path, match_type) or None.
    """
    filename = Path(jake_path).name

    # Strategy 1: Exact path match
    if jake_path in golden_files:
        return (jake_path, "exact")

    # Strategy 2: Known path mappings
    for jake_prefix, golden_prefix in PATH_MAPPINGS.items():
        if jake_path.startswith(jake_prefix):
            golden_path = jake_path.replace(jake_prefix, golden_prefix, 1)
            if golden_path in golden_files:
                return (golden_path, "mapped")

    # Strategy 3: Same filename in similar directory structure
    # Look for files with same name and similar parent dirs
    jake_parts = Path(jake_path).parts
    candidates = []

    for golden_path in golden_files:
        if Path(golden_path).name == filename:
            golden_parts = Path(golden_path).parts
            # Count matching parent directory names
            jake_dirs = set(jake_parts[:-1])
            golden_dirs = set(golden_parts[:-1])
            common = len(jake_dirs & golden_dirs)
            if common > 0:
                candidates.append((golden_path, common))

    if candidates:
        # Pick the one with most common directory names
        candidates.sort(key=lambda x: -x[1])
        return (candidates[0][0], "similar-path")

    # Strategy 4: Any file with same name (last resort)
    for golden_path in golden_files:
        if Path(golden_path).name == filename:
            return (golden_path, "filename-only")

    return None


def normalize_content(content: str) -> str:
    """Normalize container paths to source paths for comparison"""
    result = content
    for pattern, replacement in NORMALIZE_PATTERNS:
        result = re.sub(pattern, replacement, result)
    return result


def compute_similarity(content1: str, content2: str) -> float:
    """Compute similarity ratio between two strings"""
    return difflib.SequenceMatcher(None, content1, content2).ratio()


def compute_diff(jake_content: str, golden_content: str) -> List[str]:
    """Compute unified diff after normalizing paths"""
    jake_norm = normalize_content(jake_content)
    golden_norm = normalize_content(golden_content)

    return list(difflib.unified_diff(
        golden_norm.splitlines(keepends=True),
        jake_norm.splitlines(keepends=True),
        fromfile='golden', tofile='jake',
        lineterm=''
    ))


def main():
    show_diff = '--diff' in sys.argv
    verbose = '--verbose' in sys.argv

    if not GOLDEN_ROOT.exists():
        print(f"ERROR: Golden branch not found at {GOLDEN_ROOT}")
        print("Expected: repos/leo-container-golden/")
        return 1

    print("=" * 70)
    print("Jake → Golden Path Mapping")
    print("=" * 70)
    print(f"Jake:   {JAKE_ROOT}")
    print(f"Golden: {GOLDEN_ROOT}")
    print()

    # Find all .md files
    jake_files = find_md_files(JAKE_ROOT)
    golden_files = find_md_files(GOLDEN_ROOT)

    print(f"Jake:   {len(jake_files)} .md files")
    print(f"Golden: {len(golden_files)} .md files")
    print()

    # Build mapping
    results = {
        "exact": [],      # Same path
        "mapped": [],     # Known restructuring
        "similar-path": [],  # Same filename + similar dirs
        "filename-only": [], # Same filename only (risky)
        "no-match": [],   # Not found
    }

    content_diffs = []  # Files with content differences

    for jake_path in sorted(jake_files.keys()):
        match = find_golden_match(jake_path, jake_files, golden_files)

        if match:
            golden_path, match_type = match

            # Compare content
            try:
                jake_content = jake_files[jake_path].read_text()
                golden_content = golden_files[golden_path].read_text()

                jake_norm = normalize_content(jake_content)
                golden_norm = normalize_content(golden_content)

                similarity = compute_similarity(jake_norm, golden_norm)

                results[match_type].append((jake_path, golden_path, similarity))

                if similarity < 0.99:
                    content_diffs.append((jake_path, golden_path, similarity, match_type))

            except Exception as e:
                results[match_type].append((jake_path, golden_path, -1))
        else:
            results["no-match"].append((jake_path, None, 0))

    # Report
    print("=" * 70)
    print("MAPPING RESULTS")
    print("=" * 70)

    print(f"\n✅ Exact path match: {len(results['exact'])}")
    if verbose:
        for jake, golden, sim in results['exact']:
            mark = "✓" if sim > 0.99 else f"({sim:.0%})"
            print(f"   {mark} {jake}")

    print(f"\n✅ Known restructuring: {len(results['mapped'])}")
    for jake, golden, sim in results['mapped']:
        mark = "✓" if sim > 0.99 else f"({sim:.0%})"
        print(f"   {mark} {jake}")
        print(f"      → {golden}")

    print(f"\n⚠️  Similar path match: {len(results['similar-path'])}")
    for jake, golden, sim in results['similar-path']:
        print(f"   ({sim:.0%}) {jake}")
        print(f"      → {golden}")

    print(f"\n⚠️  Filename-only match: {len(results['filename-only'])}")
    for jake, golden, sim in results['filename-only']:
        print(f"   ({sim:.0%}) {jake}")
        print(f"      → {golden}")

    print(f"\n🆕 No match (jake-only): {len(results['no-match'])}")
    for jake, _, _ in results['no-match']:
        print(f"   {jake}")

    # Content differences
    if content_diffs:
        print("\n" + "=" * 70)
        print("CONTENT DIFFERENCES (after path normalization)")
        print("=" * 70)

        for jake_path, golden_path, similarity, match_type in sorted(content_diffs, key=lambda x: x[2]):
            print(f"\n📝 {jake_path} ({similarity:.0%} similar)")
            print(f"   matched via: {match_type}")
            print(f"   golden: {golden_path}")

            if show_diff:
                try:
                    jake_content = jake_files[jake_path].read_text()
                    golden_content = golden_files[golden_path].read_text()
                    diff = compute_diff(jake_content, golden_content)

                    if diff:
                        for line in diff[:30]:
                            print(f"   {line.rstrip()}")
                        if len(diff) > 30:
                            print(f"   ... ({len(diff) - 30} more lines)")
                except Exception as e:
                    print(f"   Error: {e}")

    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    total_matched = sum(len(v) for k, v in results.items() if k != "no-match")
    print(f"Total jake files:        {len(jake_files)}")
    print(f"  Matched:               {total_matched}")
    print(f"    - Exact path:        {len(results['exact'])}")
    print(f"    - Known mapping:     {len(results['mapped'])}")
    print(f"    - Similar path:      {len(results['similar-path'])}")
    print(f"    - Filename only:     {len(results['filename-only'])}")
    print(f"  No match (jake-only):  {len(results['no-match'])}")
    print(f"  Content differences:   {len(content_diffs)}")

    return 1 if content_diffs else 0


if __name__ == "__main__":
    sys.exit(main())
