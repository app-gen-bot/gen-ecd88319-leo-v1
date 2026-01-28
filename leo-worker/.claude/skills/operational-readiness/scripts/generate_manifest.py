#!/usr/bin/env python3
"""
Generate a tamper-evident manifest for the evidence pack.

Creates SHA-256 hashes for all evidence files to ensure integrity.

Usage:
    python generate_manifest.py <pack_dir> [--issues-found N] [--issues-fixed N] [--issues-waived N]

Example:
    python generate_manifest.py release-assurance/v1.0.0/ --issues-found 5 --issues-fixed 5 --issues-waived 0
"""

import argparse
import hashlib
import json
import os
from datetime import datetime
from pathlib import Path
from typing import Any


def calculate_sha256(file_path: Path) -> str:
    """Calculate SHA-256 hash of a file."""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            sha256_hash.update(chunk)
    return sha256_hash.hexdigest()


def get_file_info(file_path: Path) -> dict[str, Any]:
    """Get file metadata including hash."""
    stat = file_path.stat()
    return {
        "sha256": calculate_sha256(file_path),
        "size_bytes": stat.st_size,
        "modified": datetime.fromtimestamp(stat.st_mtime).isoformat() + "Z",
    }


def extract_metadata_from_files(pack_dir: Path) -> dict[str, Any]:
    """Extract version and tier from existing files."""
    metadata = {
        "version": "v1.0.0",
        "risk_tier": "low",
    }

    # Try to read from existing manifest
    manifest_path = pack_dir / "EVIDENCE_MANIFEST.json"
    if manifest_path.exists():
        try:
            with open(manifest_path, 'r') as f:
                existing = json.load(f)
                metadata["version"] = existing.get("version", metadata["version"])
                metadata["risk_tier"] = existing.get("risk_tier", metadata["risk_tier"])
        except (json.JSONDecodeError, KeyError):
            pass

    return metadata


def generate_manifest(
    pack_dir: Path,
    issues_found: int = 0,
    issues_fixed: int = 0,
    issues_waived: int = 0
) -> dict[str, Any]:
    """Generate the evidence manifest."""

    if not pack_dir.exists():
        raise FileNotFoundError(f"Pack directory not found: {pack_dir}")

    metadata = extract_metadata_from_files(pack_dir)

    manifest = {
        "version": metadata["version"],
        "risk_tier": metadata["risk_tier"],
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "status": "complete",
        "files": {},
        "issues_found": issues_found,
        "issues_fixed": issues_fixed,
        "issues_waived": issues_waived,
    }

    # Hash all markdown and json files (except the manifest itself)
    for file_path in sorted(pack_dir.iterdir()):
        if file_path.is_file() and file_path.name != "EVIDENCE_MANIFEST.json":
            if file_path.suffix in [".md", ".json", ".txt"]:
                manifest["files"][file_path.name] = get_file_info(file_path)

    # Add integrity summary
    manifest["integrity"] = {
        "total_files": len(manifest["files"]),
        "manifest_hash_algorithm": "sha256",
        "verification_command": f"python generate_manifest.py {pack_dir} --verify",
    }

    # Calculate overall pack hash (hash of all file hashes)
    combined_hashes = "".join(
        f"{name}:{data['sha256']}"
        for name, data in sorted(manifest["files"].items())
    )
    manifest["pack_hash"] = hashlib.sha256(combined_hashes.encode()).hexdigest()

    return manifest


def verify_manifest(pack_dir: Path) -> bool:
    """Verify an existing manifest against current files."""

    manifest_path = pack_dir / "EVIDENCE_MANIFEST.json"
    if not manifest_path.exists():
        print(f"Error: Manifest not found at {manifest_path}")
        return False

    with open(manifest_path, 'r') as f:
        manifest = json.load(f)

    print(f"Verifying evidence pack: {pack_dir}")
    print(f"Manifest version: {manifest.get('version')}")
    print(f"Generated at: {manifest.get('generated_at')}")
    print()

    all_valid = True

    for filename, expected in manifest.get("files", {}).items():
        file_path = pack_dir / filename
        if not file_path.exists():
            print(f"  MISSING: {filename}")
            all_valid = False
            continue

        actual_hash = calculate_sha256(file_path)
        expected_hash = expected.get("sha256", "")

        if actual_hash == expected_hash:
            print(f"  OK: {filename}")
        else:
            print(f"  MODIFIED: {filename}")
            print(f"    Expected: {expected_hash[:16]}...")
            print(f"    Actual:   {actual_hash[:16]}...")
            all_valid = False

    print()
    if all_valid:
        print("Verification PASSED: All files match manifest")
    else:
        print("Verification FAILED: Some files have been modified")

    return all_valid


def main():
    parser = argparse.ArgumentParser(
        description="Generate or verify evidence pack manifest"
    )
    parser.add_argument(
        "pack_dir",
        help="Path to the evidence pack directory"
    )
    parser.add_argument(
        "--issues-found",
        type=int,
        default=0,
        help="Number of issues found during analysis"
    )
    parser.add_argument(
        "--issues-fixed",
        type=int,
        default=0,
        help="Number of issues fixed"
    )
    parser.add_argument(
        "--issues-waived",
        type=int,
        default=0,
        help="Number of issues waived"
    )
    parser.add_argument(
        "--verify",
        action="store_true",
        help="Verify existing manifest instead of generating"
    )
    parser.add_argument(
        "--output",
        help="Output file path (default: <pack_dir>/EVIDENCE_MANIFEST.json)"
    )

    args = parser.parse_args()

    pack_dir = Path(args.pack_dir).resolve()

    if args.verify:
        success = verify_manifest(pack_dir)
        exit(0 if success else 1)

    # Generate manifest
    manifest = generate_manifest(
        pack_dir,
        issues_found=args.issues_found,
        issues_fixed=args.issues_fixed,
        issues_waived=args.issues_waived,
    )

    output_path = Path(args.output) if args.output else pack_dir / "EVIDENCE_MANIFEST.json"

    with open(output_path, 'w') as f:
        json.dump(manifest, f, indent=2)

    print(f"Manifest generated: {output_path}")
    print(f"  Files hashed: {len(manifest['files'])}")
    print(f"  Pack hash: {manifest['pack_hash'][:16]}...")
    print(f"  Issues: {manifest['issues_found']} found, "
          f"{manifest['issues_fixed']} fixed, "
          f"{manifest['issues_waived']} waived")


if __name__ == "__main__":
    main()
