#!/usr/bin/env python3
"""
Bootstrap the release-assurance evidence pack directory structure.

Usage:
    python bootstrap_pack.py [--tier low|med|high] [--version VERSION]

Example:
    python bootstrap_pack.py --tier low --version v1.0.0
"""

import argparse
import os
import shutil
from datetime import datetime
from pathlib import Path


# Files required for each tier
TIER_FILES = {
    "low": [
        "EXECUTIVE_SUMMARY.md",
        "THREAT_MODEL.md",
        "WAIVER.md",
        "SUPABASE_RLS.md",
        "BACKUP_RESTORE.md",
        "FLYIO_ROLLBACK.md",
    ],
    "med": [
        "EXECUTIVE_SUMMARY.md",
        "THREAT_MODEL.md",
        "RUNBOOK.md",
        "WAIVER.md",
        "SUPABASE_RLS.md",
        "BACKUP_RESTORE.md",
        "FLYIO_ROLLBACK.md",
    ],
    "high": [
        "EXECUTIVE_SUMMARY.md",
        "THREAT_MODEL.md",
        "RUNBOOK.md",
        "SOC2_MAPPING.md",
        "WAIVER.md",
        "SUPABASE_RLS.md",
        "BACKUP_RESTORE.md",
        "FLYIO_ROLLBACK.md",
    ],
}


def find_templates_dir() -> Path:
    """Find the templates directory relative to this script."""
    script_dir = Path(__file__).parent
    templates_dir = script_dir.parent / "assets" / "templates"
    if templates_dir.exists():
        return templates_dir

    # Fallback: look in ~/.claude/skills
    home_templates = Path.home() / ".claude" / "skills" / "operational-readiness" / "assets" / "templates"
    if home_templates.exists():
        return home_templates

    raise FileNotFoundError(f"Templates directory not found at {templates_dir} or {home_templates}")


def create_pack_structure(output_dir: Path, tier: str, version: str) -> None:
    """Create the evidence pack directory structure with template files."""

    pack_dir = output_dir / "release-assurance" / version
    pack_dir.mkdir(parents=True, exist_ok=True)

    templates_dir = find_templates_dir()
    files_to_create = TIER_FILES.get(tier, TIER_FILES["low"])

    print(f"Creating evidence pack for tier '{tier}' at {pack_dir}")
    print(f"Files to create: {len(files_to_create)}")

    for filename in files_to_create:
        template_path = templates_dir / filename
        target_path = pack_dir / filename

        if template_path.exists():
            # Copy template and add metadata header
            with open(template_path, 'r') as f:
                content = f.read()

            # Add metadata header
            header = f"""<!--
  Generated: {datetime.utcnow().isoformat()}Z
  Risk Tier: {tier}
  Version: {version}
-->

"""
            with open(target_path, 'w') as f:
                f.write(header + content)

            print(f"  Created: {filename} (from template)")
        else:
            # Create placeholder if template doesn't exist
            placeholder = f"""# {filename.replace('.md', '').replace('_', ' ').title()}

<!--
  Generated: {datetime.utcnow().isoformat()}Z
  Risk Tier: {tier}
  Version: {version}
-->

> This document needs to be populated based on analysis of the application.

## Overview

[TODO: Add content based on application analysis]

## Evidence

[TODO: Document evidence and findings]

## Recommendations

[TODO: Add recommendations]
"""
            with open(target_path, 'w') as f:
                f.write(placeholder)

            print(f"  Created: {filename} (placeholder)")

    # Create initial manifest stub
    manifest_path = pack_dir / "EVIDENCE_MANIFEST.json"
    manifest_content = f"""{{
  "version": "{version}",
  "risk_tier": "{tier}",
  "generated_at": "{datetime.utcnow().isoformat()}Z",
  "status": "draft",
  "files": {{}},
  "issues_found": 0,
  "issues_fixed": 0,
  "issues_waived": 0
}}
"""
    with open(manifest_path, 'w') as f:
        f.write(manifest_content)
    print(f"  Created: EVIDENCE_MANIFEST.json (stub)")

    print(f"\nEvidence pack bootstrapped at: {pack_dir}")
    print(f"\nNext steps:")
    print(f"  1. Analyze codebase and fix issues")
    print(f"  2. Populate evidence documents")
    print(f"  3. Run generate_manifest.py to finalize")


def main():
    parser = argparse.ArgumentParser(
        description="Bootstrap the release-assurance evidence pack"
    )
    parser.add_argument(
        "--tier",
        choices=["low", "med", "high"],
        default="low",
        help="Risk tier (default: low)"
    )
    parser.add_argument(
        "--version",
        default="v1.0.0",
        help="Version string (default: v1.0.0)"
    )
    parser.add_argument(
        "--output",
        default=".",
        help="Output directory (default: current directory)"
    )

    args = parser.parse_args()

    output_dir = Path(args.output).resolve()
    create_pack_structure(output_dir, args.tier, args.version)


if __name__ == "__main__":
    main()
