#!/usr/bin/env python3
"""
Path Extractor for Leo Container

Extracts .md file references from code/prompts/configs.
Understands the distinction between:
- References to files in THIS REPO (leo-container) → validate
- References to files in GENERATED APPS → skip

Usage:
    python scripts/validate-paths.py > referenced-files.txt
"""

import re
from pathlib import Path
from typing import Set

# Container path mappings to source paths
PATH_MAPPINGS = {
    "/factory/leo/": "src/leo/",
    "/factory/": "src/",
    "/home/leo-user/.claude/": ".claude/",
    "~/.claude/": ".claude/",
}

# Filenames that refer to GENERATED APP files, not leo-container files
# These should be skipped entirely
GENERATED_APP_FILES = {
    "plan.md",           # plan/plan.md in generated apps
    "CLAUDE.md",         # Generated in apps for context
    "README.md",         # Generic - often refers to generated app
    "TASK_PLAN.md",      # Created during generation
    "schema.ts",         # shared/schema.ts in generated apps
    "schema.zod.ts",     # shared/schema.zod.ts in generated apps
    "SKILL.md",          # Generic skill file mention
    "VALIDATION.md",     # Generic validation doc mention
    "QUICK_REFERENCE.md", # Generic reference doc mention
    "pipeline-prompt.md", # Old name or generic mention
    "test-plan.md",      # Generated in apps by testing system
}

# Relative paths starting with these are GENERATED APP paths
GENERATED_APP_PATH_PREFIXES = [
    "plan/",
    "client/",
    "server/",
    "shared/",
    "docs/",             # docs/ in generated apps (different from leo's docs/)
]

# Shorthand skill references (without full ~/.claude/skills/ prefix)
# These appear in tables and should be skipped - the full paths are validated separately
SHORTHAND_SKILL_PATTERNS = [
    r'^[a-z-]+/SKILL\.md$',           # schema-designer/SKILL.md
    r'^agents/docs/',                  # agents/docs/AGENT_PATTERN.md (shorthand)
]

# These patterns in a path indicate it's a LEO-CONTAINER internal reference
LEO_CONTAINER_INDICATORS = [
    "/factory/",
    "~/.claude/",
    "/home/leo-user/",
    "patterns/",
    "subagents/",
    "agents/",
    "skills/",
    "resources/",
    "cc_agent/",
    "cc_tools/",
]


def map_container_to_source(container_path: str) -> str:
    """Map a container path to its source equivalent"""
    for container_prefix, source_prefix in PATH_MAPPINGS.items():
        if container_path.startswith(container_prefix):
            return container_path.replace(container_prefix, source_prefix, 1)
    return container_path


def is_generated_app_reference(filename: str, full_match: str, line: str) -> bool:
    """
    Determine if a reference is to a GENERATED APP file (should skip)
    vs a LEO-CONTAINER file (should validate).
    """
    # Check if it's a known generated-app filename
    if filename in GENERATED_APP_FILES:
        return True

    # Check if path starts with generated-app prefix
    for prefix in GENERATED_APP_PATH_PREFIXES:
        if full_match.startswith(prefix):
            return True

    # Check if it's a shorthand skill reference (e.g., schema-designer/SKILL.md)
    for pattern in SHORTHAND_SKILL_PATTERNS:
        if re.match(pattern, full_match):
            return True

    # Check line context for generated-app indicators
    line_lower = line.lower()
    generated_app_contexts = [
        "create",
        "generate",
        "output",
        "in the app",
        "in generated",
        "/workspace/app",
        "phase",
        "stage",
    ]
    if any(ctx in line_lower for ctx in generated_app_contexts):
        # But not if it contains leo-container indicators
        if not any(ind in full_match for ind in LEO_CONTAINER_INDICATORS):
            return True

    return False


def is_leo_container_reference(path: str) -> bool:
    """Check if a path is clearly a leo-container internal reference"""
    return any(ind in path for ind in LEO_CONTAINER_INDICATORS)


def extract_md_paths_from_file(file_path: Path, base_dir: Path) -> Set[str]:
    """Extract .md file references that are LEO-CONTAINER internal references"""
    paths = set()

    try:
        content = file_path.read_text()
    except Exception as e:
        print(f"# Warning: Could not read {file_path}: {e}", file=__import__('sys').stderr)
        return paths

    lines = content.split('\n')

    # === ABSOLUTE PATHS (container paths) - Always validate ===
    absolute_patterns = [
        r'(/factory/[^\s\"\'\)\]\}]+\.md)',
        r'(/home/leo-user/[^\s\"\'\)\]\}]+\.md)',
        r'(~/.claude/[^\s\"\'\)\]\}]+\.md)',
    ]

    for line in lines:
        for pattern in absolute_patterns:
            matches = re.findall(pattern, line)
            for match in matches:
                path = match.strip().rstrip('.,;:`')
                source_path = map_container_to_source(path)
                paths.add(source_path)

    # === RELATIVE PATHS - Only validate if clearly leo-container internal ===
    relative_patterns = [
        r'\(([a-zA-Z0-9_/-]+\.md)\)',           # (filename.md)
        r'\]\(([a-zA-Z0-9_/-]+\.md)\)',         # [text](filename.md)
        r'`([a-zA-Z0-9_/-]+\.md)`',             # `filename.md`
    ]

    source_dir = file_path.parent

    for line_num, line in enumerate(lines, 1):
        for pattern in relative_patterns:
            matches = re.findall(pattern, line)
            for match in matches:
                filename = match.strip()
                basename = Path(filename).name

                # Skip if it's an absolute path (handled above)
                if filename.startswith('/'):
                    continue

                # Skip if it's a generated-app reference
                if is_generated_app_reference(basename, filename, line):
                    continue

                # Only include if it looks like a leo-container reference
                # (contains indicators OR is in a patterns/skills/agents context)
                source_file_path = str(file_path.relative_to(base_dir))
                if not (is_leo_container_reference(filename) or
                        is_leo_container_reference(source_file_path)):
                    continue

                # Resolve relative to source file's directory
                resolved = (source_dir / filename).resolve()
                try:
                    rel_path = str(resolved.relative_to(base_dir))
                    paths.add(rel_path)
                except ValueError:
                    pass

    return paths


def find_files_to_scan(base_dir: Path) -> list:
    """Find all files that might contain .md references"""
    files = []
    scan_patterns = [
        ".claude/agents/*.md",
        ".claude/skills/**/*.md",
        "src/leo/agents/**/*.py",
        "src/leo/agents/**/*.md",
        "src/leo/resources/**/*.md",
        "src/cc_agent/**/*.py",
    ]
    for pattern in scan_patterns:
        files.extend(base_dir.glob(pattern))
    return sorted(set(files))


def main():
    base_dir = Path(__file__).parent.parent.resolve()

    # Find and scan files
    files = find_files_to_scan(base_dir)

    # Collect all referenced paths
    all_paths: Set[str] = set()
    for file_path in files:
        paths = extract_md_paths_from_file(file_path, base_dir)
        all_paths.update(paths)

    # Output sorted list
    for path in sorted(all_paths):
        print(path)


if __name__ == "__main__":
    main()
