#!/usr/bin/env python3
"""
Create a new frontend template with baseline manifest for TypeScript LS integration.

This script:
1. Extracts the existing template
2. Generates a baseline manifest of all files
3. Adds the manifest to the template
4. Creates a new versioned template

Usage:
    python create_template_with_manifest.py [--input template.tar.gz] [--output template-v1.3.0.tar.gz]
"""

import argparse
import hashlib
import json
import os
import shutil
import tarfile
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Dict, Any


def calculate_file_hash(file_path: Path) -> str:
    """Calculate SHA256 hash of a file."""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()


def should_include_in_manifest(file_path: Path, base_dir: Path) -> bool:
    """Determine if a file should be included in the baseline manifest."""
    relative_path = file_path.relative_to(base_dir)
    path_str = str(relative_path)
    
    # Exclude certain directories and files
    exclude_patterns = [
        '.git/',
        '.next/',
        'out/',
        '.DS_Store',
        '*.log',
        '*.tmp',
        '.env.local',
        '.env.*.local',
    ]
    
    for pattern in exclude_patterns:
        if pattern.endswith('/'):
            if path_str.startswith(pattern):
                return False
        elif '*' in pattern:
            import fnmatch
            if fnmatch.fnmatch(path_str, pattern):
                return False
        elif pattern in path_str:
            return False
    
    return True


def create_baseline_manifest(template_dir: Path, template_version: str = "1.3.0") -> Dict[str, Any]:
    """Generate a baseline manifest for all files in the template."""
    print(f"Creating baseline manifest for {template_dir}")
    
    manifest = {
        "template_version": template_version,
        "created": datetime.now().isoformat(),
        "description": "Baseline manifest for Next.js + ShadCN template",
        "stats": {
            "total_files": 0,
            "total_size": 0,
            "file_types": {}
        },
        "files": {}
    }
    
    file_count = 0
    total_size = 0
    
    # Walk through all files in the template
    for file_path in template_dir.rglob("*"):
        if not file_path.is_file():
            continue
            
        if not should_include_in_manifest(file_path, template_dir):
            continue
        
        relative_path = file_path.relative_to(template_dir)
        file_stat = file_path.stat()
        file_ext = file_path.suffix or 'no_extension'
        
        # Track file types
        if file_ext not in manifest["stats"]["file_types"]:
            manifest["stats"]["file_types"][file_ext] = 0
        manifest["stats"]["file_types"][file_ext] += 1
        
        # Add file to manifest
        manifest["files"][str(relative_path)] = {
            "hash": calculate_file_hash(file_path),
            "size": file_stat.st_size,
            "modified": datetime.fromtimestamp(file_stat.st_mtime).isoformat(),
            "baseline": True
        }
        
        file_count += 1
        total_size += file_stat.st_size
        
        if file_count % 100 == 0:
            print(f"  Processed {file_count} files...")
    
    manifest["stats"]["total_files"] = file_count
    manifest["stats"]["total_size"] = total_size
    
    print(f"Manifest created: {file_count} files, {total_size / 1024 / 1024:.1f} MB")
    return manifest


def extract_template(template_path: Path, extract_dir: Path) -> None:
    """Extract tar.gz template to directory."""
    print(f"Extracting {template_path} to {extract_dir}")
    with tarfile.open(template_path, 'r:gz') as tar:
        tar.extractall(path=extract_dir)
    print("Extraction complete")


def create_template_with_manifest(input_template: Path, output_template: Path, version: str = "1.3.0") -> None:
    """Create a new template with baseline manifest included."""
    
    # Create temporary directory
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        extract_dir = temp_path / "template"
        
        # Extract existing template
        extract_template(input_template, extract_dir)
        
        # Generate baseline manifest
        manifest = create_baseline_manifest(extract_dir, version)
        
        # Write manifest to template
        manifest_path = extract_dir / ".baseline_manifest.json"
        with open(manifest_path, 'w') as f:
            json.dump(manifest, f, indent=2)
        print(f"Wrote manifest to {manifest_path}")
        
        # Create new template archive
        print(f"Creating new template: {output_template}")
        with tarfile.open(output_template, 'w:gz') as tar:
            tar.add(extract_dir, arcname=".")
        
        # Calculate size of new template
        new_size = output_template.stat().st_size / 1024 / 1024
        print(f"New template created: {output_template} ({new_size:.1f} MB)")
        
        # Verify manifest is in the new template
        print("\nVerifying new template...")
        with tarfile.open(output_template, 'r:gz') as tar:
            manifest_found = "./.baseline_manifest.json" in tar.getnames()
            if manifest_found:
                print("✓ Baseline manifest found in new template")
            else:
                print("✗ ERROR: Baseline manifest not found in new template!")


def main():
    parser = argparse.ArgumentParser(
        description="Create frontend template with baseline manifest"
    )
    parser.add_argument(
        "--input",
        type=Path,
        default=Path.home() / ".mcp-tools/templates/nextjs-shadcn-template-v1.2.0.tar.gz",
        help="Input template file (default: ~/.mcp-tools/templates/nextjs-shadcn-template-v1.2.0.tar.gz)"
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path.home() / ".mcp-tools/templates/nextjs-shadcn-template-v1.3.0.tar.gz",
        help="Output template file (default: ~/.mcp-tools/templates/nextjs-shadcn-template-v1.3.0.tar.gz)"
    )
    parser.add_argument(
        "--version",
        type=str,
        default="1.3.0",
        help="Template version (default: 1.3.0)"
    )
    
    args = parser.parse_args()
    
    # Validate input exists
    if not args.input.exists():
        print(f"Error: Input template not found: {args.input}")
        return 1
    
    # Ensure output directory exists
    args.output.parent.mkdir(parents=True, exist_ok=True)
    
    # Create new template with manifest
    create_template_with_manifest(args.input, args.output, args.version)
    
    # Print summary
    print("\n" + "="*60)
    print("Template creation complete!")
    print(f"Input:  {args.input}")
    print(f"Output: {args.output}")
    print(f"Version: {args.version}")
    print("\nNext steps:")
    print("1. Update frontend_init/server.py to use v1.3.0")
    print("2. Test the new template with frontend_init tool")
    print("3. Verify TypeScript LS can read the baseline manifest")
    print("="*60)


if __name__ == "__main__":
    main()