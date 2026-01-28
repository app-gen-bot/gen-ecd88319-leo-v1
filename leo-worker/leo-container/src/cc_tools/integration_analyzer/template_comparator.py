#!/usr/bin/env python3
"""
Manifest comparison utility for identifying custom/modified files in a project.
Requires projects to have a .baseline_manifest.json file.
"""

import hashlib
import json
import os
from pathlib import Path
from typing import Dict, Optional, Any
import logging

# Get logger from the server's logging configuration
logger = logging.getLogger("integration_analyzer.template_comparator")


class TemplateComparator:
    """Compare a project against its baseline manifest to identify custom code."""
    
    def __init__(self):
        """Initialize the comparator."""
        pass
    
    def compare_with_manifest(self, project_path: str) -> Dict[str, Any]:
        """
        Compare project against its baseline manifest to find custom/modified files.
        
        Args:
            project_path: Path to the project directory
            
        Returns:
            Comparison results with added, modified, and template files
            
        Raises:
            FileNotFoundError: If .baseline_manifest.json is missing
        """
        project_path = Path(project_path).resolve()
        
        # Load baseline manifest (required)
        manifest_path = project_path / ".baseline_manifest.json"
        if not manifest_path.exists():
            raise FileNotFoundError(
                f"No .baseline_manifest.json found in {project_path}. "
                "This file is required for template comparison."
            )
        
        logger.info(f"[COMPARE] Loading manifest from: {manifest_path}")
        with open(manifest_path, 'r') as f:
            manifest = json.load(f)
        
        # Validate manifest
        self._validate_manifest(manifest)
        
        # Compare files
        logger.info("[COMPARE] Comparing project files against manifest")
        return self._compare_with_manifest(project_path, manifest)
    
    def _validate_manifest(self, manifest: Dict[str, Any]) -> None:
        """Validate manifest has required fields and valid data."""
        # Validate required fields
        if 'template_name' not in manifest:
            raise ValueError("Manifest missing required 'template_name' field")
        if 'files' not in manifest:
            raise ValueError("Manifest missing required 'files' field")
        
        # Check if any file has placeholder hashes
        for path, entry in manifest.get('files', {}).items():
            hash_value = entry.get('sha256') or entry.get('hash')
            if hash_value == 'template':
                raise ValueError(
                    f"Manifest contains placeholder hashes for {path}. "
                    "Please regenerate with actual SHA256 hashes."
                )
    
    def _calculate_file_hash(self, file_path: Path) -> str:
        """Calculate SHA256 hash of a file."""
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    
    def _compare_with_manifest(
        self, 
        project_path: Path, 
        manifest: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Compare using baseline manifest for efficiency."""
        result = {
            "summary": {
                "total_files": 0,
                "template_files": 0,
                "modified_files": 0,
                "added_files": 0,
                "template_info": manifest.get("template_info", {})
            },
            "files": {
                "added": [],
                "modified": []
            }
        }
        
        # Get files from manifest
        manifest_files = manifest.get("files", {})
        template_paths = set(manifest_files.keys())
        
        # Get project files
        project_files = self._get_project_files(project_path)
        
        # Compare each project file
        for rel_path, file_path in project_files.items():
            # Skip comparing the manifest itself
            if rel_path == ".baseline_manifest.json":
                continue
                
            result["summary"]["total_files"] += 1
            
            if rel_path in template_paths:
                # File exists in template, check if modified
                file_hash = self._calculate_file_hash(file_path)
                # Support both 'sha256' and 'hash' field names for compatibility
                template_entry = manifest_files[rel_path]
                template_hash = template_entry.get("sha256") or template_entry.get("hash")
                
                # Validate hash is not a placeholder
                if template_hash == "template":
                    raise ValueError(f"Invalid manifest: placeholder hash found for {rel_path}. Please regenerate manifest with actual SHA256 hashes.")
                
                if file_hash != template_hash:
                    result["files"]["modified"].append({
                        "path": rel_path,
                        "size": file_path.stat().st_size,
                        "template_size": manifest_files[rel_path].get("size", 0)
                    })
                    result["summary"]["modified_files"] += 1
                else:
                    result["summary"]["template_files"] += 1
            else:
                # New file not in template
                result["files"]["added"].append({
                    "path": rel_path,
                    "size": file_path.stat().st_size
                })
                result["summary"]["added_files"] += 1
        
        return result
    
    
    def _get_project_files(self, project_path: Path) -> Dict[str, Path]:
        """Get all project files with relative paths."""
        files = {}
        
        # Use same exclusion rules as manifest generator
        ignore_patterns = {
            'node_modules', '.next', '.git', '.cache', 'dist', 'build',
            'coverage', '.turbo', '.vercel', 'out', '.nuxt', '.vuepress',
            '.docusaurus', '__pycache__', '.pytest_cache', '.mypy_cache',
            '.tox', 'venv', 'env', '.env', '.venv'
        }
        
        for file_path in project_path.rglob('*'):
            if file_path.is_file():
                # Check if any parent directory should be ignored
                if any(part in ignore_patterns for part in file_path.parts):
                    continue
                
                rel_path = str(file_path.relative_to(project_path))
                files[rel_path] = file_path
        
        return files
    
    def _should_ignore(self, filename: str) -> bool:
        """Check if file/directory should be ignored."""
        # File patterns to ignore
        ignore_files = {
            '.DS_Store', 'Thumbs.db', 'desktop.ini', '.idea',
            '*.pyc', '*.pyo', '*.pyd', '*.so', '*.dylib', '*.dll',
            '*.log', '*.tmp', '*.temp', '*.swp', '*.swo', '*~',
            '*.iml', '*.ipr', '*.iws',
            '*.suo', '*.user', '*.userosscache', '*.sln.docstates',
            '*.tsbuildinfo'
        }
        
        # Check exact matches
        if filename in ignore_files:
            return True
        
        # Check glob patterns
        for pattern in ignore_files:
            if pattern.startswith('*') and filename.endswith(pattern[1:]):
                return True
        
        return False
    


def main():
    """Test the template comparator."""
    import sys
    import json
    
    if len(sys.argv) < 2:
        print("Usage: python template_comparator.py <project_path>")
        sys.exit(1)
    
    project_path = sys.argv[1]
    
    comparator = TemplateComparator()
    try:
        result = comparator.compare_with_manifest(project_path)
        print(json.dumps(result, indent=2))
    except FileNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()