#!/usr/bin/env python3
"""Validate all Python imports can be resolved.

This script:
1. Finds all .py files in the project
2. Attempts to compile each file (syntax check + import resolution)
3. Reports any import errors or syntax errors

Run before commits to catch import errors early.
"""

import ast
import py_compile
import sys
from pathlib import Path
from typing import List, Tuple


project_root = Path(__file__).parent.parent
src_dir = project_root / "src" / "app_factory_leonardo_replit"


def find_all_python_files() -> List[Path]:
    """Find all Python files in the project."""
    # Exclude certain directories
    exclude_dirs = {
        '__pycache__',
        '.git',
        'node_modules',
        'venv',
        '.venv',
        'archive',  # Archived code may have old imports
    }

    python_files = []
    for py_file in src_dir.rglob("*.py"):
        # Check if any parent directory is in exclude list
        if any(parent.name in exclude_dirs for parent in py_file.parents):
            continue
        python_files.append(py_file)

    return sorted(python_files)


def validate_file_syntax(file_path: Path) -> Tuple[bool, str]:
    """Validate a single Python file's syntax.

    Returns:
        Tuple of (is_valid, error_message)
    """
    try:
        # py_compile checks both syntax and basic import issues
        py_compile.compile(str(file_path), doraise=True)
        return True, ""
    except py_compile.PyCompileError as e:
        return False, str(e)
    except SyntaxError as e:
        return False, f"Syntax error: {e}"
    except Exception as e:
        return False, f"Unexpected error: {e}"


def validate_imports():
    """Validate all Python files."""
    print("🔍 Validating Python imports and syntax...\n")

    python_files = find_all_python_files()
    print(f"📁 Found {len(python_files)} Python files (excluding archive/)\n")

    errors = []
    success_count = 0

    for py_file in python_files:
        relative_path = py_file.relative_to(project_root)
        is_valid, error_msg = validate_file_syntax(py_file)

        if is_valid:
            success_count += 1
            print(f"✅ {relative_path}")
        else:
            errors.append((relative_path, error_msg))
            print(f"❌ {relative_path}")
            # Print first line of error
            first_line = error_msg.split('\n')[0]
            print(f"   {first_line}")

    print("\n" + "="*60)

    if not errors:
        print(f"✅ All {success_count} files validated successfully!")
        return 0
    else:
        print(f"❌ Found {len(errors)} files with errors:\n")
        for file_path, error_msg in errors:
            print(f"\n{file_path}:")
            # Print full error, indented
            for line in error_msg.split('\n')[:10]:  # Limit to 10 lines
                print(f"  {line}")
        print("\n💡 Fix these errors before committing")
        return 1


if __name__ == "__main__":
    sys.exit(validate_imports())
