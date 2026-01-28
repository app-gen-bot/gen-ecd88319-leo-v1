#!/usr/bin/env python3
"""
Audit .md Files in Leo Container

Compares referenced .md files against actual .md files in the repo.
Groups results by directory structure for clarity.

Reports:
1. By directory group: what's referenced, what exists, what's missing
2. Summary of missing and unreferenced files

Usage:
    python scripts/audit-md-files.py
"""

import subprocess
from pathlib import Path
from typing import Set, Dict, List
from collections import defaultdict


# Directory groups for organizing output
DIRECTORY_GROUPS = [
    (".claude/skills/", "Skills"),
    (".claude/agents/", "Agent Definitions (.claude)"),
    ("src/leo/agents/app_generator/subagents/", "Subagents"),
    ("src/leo/agents/app_generator/", "App Generator"),
    ("src/leo/agents/reprompter/", "Reprompter"),
    ("src/leo/agents/docs/", "Agent Docs"),
    ("src/leo/resources/", "Resources"),
    ("src/cc_agent/", "CC Agent"),
    ("src/cc_tools/", "CC Tools"),
    ("src/archive/", "Archive"),
    ("docs/", "Documentation"),
]


def get_referenced_paths(base_dir: Path) -> Set[str]:
    """Run validate-paths.py and get referenced .md paths"""
    result = subprocess.run(
        ['python3', str(base_dir / 'scripts/validate-paths.py')],
        capture_output=True,
        text=True,
        cwd=base_dir
    )
    paths = set()
    for line in result.stdout.strip().split('\n'):
        line = line.strip()
        if line and not line.startswith('#'):
            paths.add(line)
    return paths


def get_actual_md_files(base_dir: Path) -> Set[str]:
    """Find all .md files in the repo"""
    exclude_dirs = {'.git', 'node_modules', '__pycache__', '.venv', 'venv'}

    paths = set()
    for md_file in base_dir.rglob('*.md'):
        if any(excluded in md_file.parts for excluded in exclude_dirs):
            continue
        try:
            rel_path = str(md_file.relative_to(base_dir))
            paths.add(rel_path)
        except ValueError:
            pass
    return paths


def get_group(path: str) -> tuple:
    """Get the directory group for a path"""
    for prefix, name in DIRECTORY_GROUPS:
        if path.startswith(prefix):
            return (prefix, name)
    return ("", "Other")


def get_subgroup(path: str, group_prefix: str) -> str:
    """Get subgroup within a group (e.g., skill name, subagent name)"""
    if not group_prefix:
        return ""

    remainder = path[len(group_prefix):]
    parts = remainder.split('/')

    if len(parts) > 1:
        return parts[0]
    return ""


def main():
    base_dir = Path(__file__).parent.parent.resolve()

    print("=" * 70)
    print("Leo Container .md File Audit (Grouped)")
    print("=" * 70)
    print(f"\nBase directory: {base_dir}\n")

    # Get referenced and actual paths
    print("Scanning...")
    referenced = get_referenced_paths(base_dir)
    actual = get_actual_md_files(base_dir)

    missing = referenced - actual
    unreferenced = actual - referenced
    valid = referenced & actual

    print(f"Referenced: {len(referenced)} | Actual: {len(actual)} | Valid: {len(valid)}")
    print(f"Missing: {len(missing)} | Unreferenced: {len(unreferenced)}\n")

    # Group all files
    groups: Dict[str, Dict[str, Dict[str, List[str]]]] = defaultdict(
        lambda: defaultdict(lambda: {"referenced": [], "actual": [], "missing": [], "unreferenced": []})
    )

    # Process all paths
    all_paths = referenced | actual
    for path in all_paths:
        group_prefix, group_name = get_group(path)
        subgroup = get_subgroup(path, group_prefix)

        key = f"{group_name}"
        subkey = subgroup if subgroup else "(root)"

        if path in valid:
            groups[key][subkey]["referenced"].append(path)
            groups[key][subkey]["actual"].append(path)
        elif path in missing:
            groups[key][subkey]["missing"].append(path)
        elif path in unreferenced:
            groups[key][subkey]["unreferenced"].append(path)

    # Output by group
    for group_name in [name for _, name in DIRECTORY_GROUPS] + ["Other"]:
        if group_name not in groups:
            continue

        subgroups = groups[group_name]

        # Calculate totals for this group
        group_valid = sum(len(sg["referenced"]) for sg in subgroups.values())
        group_missing = sum(len(sg["missing"]) for sg in subgroups.values())
        group_unreferenced = sum(len(sg["unreferenced"]) for sg in subgroups.values())

        if group_valid + group_missing + group_unreferenced == 0:
            continue

        print("=" * 70)
        print(f"{group_name}")
        print(f"  Valid: {group_valid} | Missing: {group_missing} | Unreferenced: {group_unreferenced}")
        print("-" * 70)

        for subgroup_name in sorted(subgroups.keys()):
            sg = subgroups[subgroup_name]
            valid_count = len(sg["referenced"])
            missing_list = sg["missing"]
            unreferenced_list = sg["unreferenced"]

            if valid_count + len(missing_list) + len(unreferenced_list) == 0:
                continue

            # Show subgroup header
            status_parts = []
            if valid_count:
                status_parts.append(f"{valid_count} valid")
            if missing_list:
                status_parts.append(f"{len(missing_list)} MISSING")
            if unreferenced_list:
                status_parts.append(f"{len(unreferenced_list)} unreferenced")

            print(f"\n  {subgroup_name}/  [{', '.join(status_parts)}]")

            # Show missing files (important!)
            for path in sorted(missing_list):
                filename = Path(path).name
                print(f"    MISSING: {filename}")

            # Show unreferenced files
            for path in sorted(unreferenced_list):
                filename = Path(path).name
                print(f"    unreferenced: {filename}")

    # Final summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Total .md files in repo:    {len(actual)}")
    print(f"Total referenced:           {len(referenced)}")
    print(f"Valid (referenced & exist): {len(valid)}")
    print(f"Missing (broken paths):     {len(missing)}")
    print(f"Unreferenced:               {len(unreferenced)}")

    # List all missing files
    if missing:
        print(f"\n{'!'*70}")
        print("ALL MISSING FILES (referenced but don't exist):")
        print(f"{'!'*70}")
        for path in sorted(missing):
            print(f"  {path}")

    return 1 if missing else 0


if __name__ == "__main__":
    exit(main())
