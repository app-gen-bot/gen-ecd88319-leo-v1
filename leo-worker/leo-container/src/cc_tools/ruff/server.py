#!/usr/bin/env python3
"""Ruff MCP Server - Ultra-fast Python linting and formatting.

This MCP server provides real-time linting for Python files using Ruff,
which is 10-150x faster than traditional Python linters like Flake8 and Pylint.
"""

import json
import logging
import os
import subprocess
import tempfile
from pathlib import Path
from typing import Dict, List, Optional, Any

import anyio
from fastmcp import FastMCP

# Set up logging
logging.basicConfig(
    level=os.getenv('MCP_LOG_LEVEL', 'INFO'),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastMCP
mcp = FastMCP("Ruff Ultra-Fast Python Linter")

# Note: Ruff is installed via pyproject.toml dependencies
# No need for runtime installation checks


@mcp.tool()
async def lint_file(file_path: str, fix: bool = False, format: str = "json", select: List[str] = None) -> str:
    """Lint a Python file with Ruff for ultra-fast feedback.
    
    Args:
        file_path: Path to the Python file to lint
        fix: Whether to auto-fix issues
        format: Output format (json, github, gitlab, text)
        select: Specific rules to check (e.g., ['E', 'F', 'I'])
    
    Returns:
        JSON string with lint results
    """
    if select is None:
        select = []
    result = await _lint_file({"file_path": file_path, "fix": fix, "format": format, "select": select})
    return json.dumps(result, indent=2)


@mcp.tool()
async def format_file(file_path: str, check: bool = False) -> str:
    """Format a Python file with Ruff (replaces Black).
    
    Args:
        file_path: Path to the Python file to format
        check: Only check if formatting is needed
    
    Returns:
        JSON string with format results
    """
    result = await _format_file({"file_path": file_path, "check": check})
    return json.dumps(result, indent=2)


@mcp.tool()
async def lint_directory(directory: str, fix: bool = False, exclude: List[str] = None) -> str:
    """Lint all Python files in a directory.
    
    Args:
        directory: Directory to lint
        fix: Whether to auto-fix issues
        exclude: Patterns to exclude (default: __pycache__, .venv, venv, build, dist)
    
    Returns:
        JSON string with lint results
    """
    if exclude is None:
        exclude = ["__pycache__", ".venv", "venv", "build", "dist"]
    result = await _lint_directory({"directory": directory, "fix": fix, "exclude": exclude})
    return json.dumps(result, indent=2)


@mcp.tool()
async def check_imports(file_path: str, fix: bool = False) -> str:
    """Check and organize imports (replaces isort).
    
    Args:
        file_path: Path to Python file
        fix: Fix import sorting
    
    Returns:
        JSON string with import issues
    """
    result = await _check_imports({"file_path": file_path, "fix": fix})
    return json.dumps(result, indent=2)


@mcp.tool()
async def check_typing(file_path: str, target_version: str = "py312") -> str:
    """Check type annotations and upgrade legacy patterns.
    
    Args:
        file_path: Path to Python file
        target_version: Target Python version (e.g., 'py312')
    
    Returns:
        JSON string with typing issues
    """
    result = await _check_typing({"file_path": file_path, "target_version": target_version})
    return json.dumps(result, indent=2)
# Keep the internal implementation functions below


# Internal implementation functions


async def _lint_file(args: dict) -> dict:
    """Lint a single Python file."""
    file_path = Path(args["file_path"])
    fix = args.get("fix", False)
    output_format = args.get("format", "json")
    select_rules = args.get("select", [])
    
    logger.info(f"[RUFF] Linting file: {file_path} (fix={fix}, format={output_format})")
    
    # Skip files in ignored directories
    ignored_dirs = {"node_modules", "dist", ".next", "build", "coverage", ".git", "__pycache__", ".venv", "venv"}
    path_parts = set(file_path.parts)
    if path_parts & ignored_dirs:
        logger.info(f"[RUFF] Skipping file in ignored directory: {file_path}")
        return {
            "file": str(file_path),
            "skipped": True,
            "reason": "File in ignored directory",
            "elapsed_ms": 0,
            "summary": {"total_issues": 0, "fixable": 0}
        }
    
    if not file_path.exists():
        return {
            "error": f"File not found: {file_path}",
            "file": str(file_path)
        }
    
    # Build ruff command
    cmd = ["ruff", "check", str(file_path), f"--output-format={output_format}"]
    if fix:
        cmd.append("--fix")
    if select_rules:
        cmd.extend(["--select", ",".join(select_rules)])
    
    # Run ruff
    logger.debug(f"[RUFF] Running command: {' '.join(cmd)}")
    start_time = anyio.current_time()
    result = await anyio.run_process(cmd, check=False)
    elapsed_ms = int((anyio.current_time() - start_time) * 1000)
    logger.info(f"[RUFF] Lint completed in {elapsed_ms}ms for {file_path}")
    
    if output_format == "json":
        try:
            # Parse JSON output
            output = json.loads(result.stdout.decode()) if result.stdout else []
            
            # Process diagnostics
            issues = []
            for diagnostic in output:
                issues.append({
                    "code": diagnostic.get("code"),
                    "message": diagnostic.get("message"),
                    "location": {
                        "file": diagnostic.get("filename"),
                        "line": diagnostic.get("location", {}).get("row"),
                        "column": diagnostic.get("location", {}).get("column")
                    },
                    "end_location": {
                        "line": diagnostic.get("end_location", {}).get("row"),
                        "column": diagnostic.get("end_location", {}).get("column")
                    },
                    "fix": diagnostic.get("fix"),
                    "url": diagnostic.get("url")
                })
            
            return {
                "file": str(file_path),
                "elapsed_ms": elapsed_ms,
                "fixed": fix,
                "issues": issues,
                "summary": {
                    "total_issues": len(issues),
                    "fixable": sum(1 for i in issues if i.get("fix") is not None)
                }
            }
        except json.JSONDecodeError:
            # Fallback for non-JSON output
            return {
                "file": str(file_path),
                "elapsed_ms": elapsed_ms,
                "output": result.stdout.decode(),
                "errors": result.stderr.decode()
            }
    else:
        # Return raw output for other formats
        return {
            "file": str(file_path),
            "elapsed_ms": elapsed_ms,
            "output": result.stdout.decode(),
            "errors": result.stderr.decode(),
            "exit_code": result.returncode
        }


async def _format_file(args: dict) -> dict:
    """Format a Python file with Ruff."""
    file_path = Path(args["file_path"])
    check_only = args.get("check", False)
    
    if not file_path.exists():
        return {
            "error": f"File not found: {file_path}",
            "file": str(file_path)
        }
    
    # Build ruff format command
    cmd = ["ruff", "format", str(file_path)]
    if check_only:
        cmd.append("--check")
    
    # Run ruff format
    start_time = anyio.current_time()
    result = await anyio.run_process(cmd, check=False)
    elapsed_ms = int((anyio.current_time() - start_time) * 1000)
    
    return {
        "file": str(file_path),
        "elapsed_ms": elapsed_ms,
        "formatted": not check_only and result.returncode == 0,
        "needs_formatting": check_only and result.returncode != 0,
        "output": result.stdout.decode(),
        "errors": result.stderr.decode()
    }


async def _lint_directory(args: dict) -> dict:
    """Lint all Python files in a directory."""
    directory = Path(args["directory"])
    fix = args.get("fix", False)
    exclude_patterns = args.get("exclude", ["__pycache__", ".venv", "venv", "build", "dist"])
    
    if not directory.exists():
        return {
            "error": f"Directory not found: {directory}",
            "directory": str(directory)
        }
    
    # Build ruff command
    cmd = ["ruff", "check", str(directory), "--output-format=json"]
    if fix:
        cmd.append("--fix")
    
    # Add exclude patterns
    for pattern in exclude_patterns:
        cmd.extend(["--exclude", pattern])
    
    # Run ruff
    logger.debug(f"[RUFF] Running directory lint: {' '.join(cmd)}")
    start_time = anyio.current_time()
    result = await anyio.run_process(cmd, check=False)
    elapsed_ms = int((anyio.current_time() - start_time) * 1000)
    logger.info(f"[RUFF] Directory lint completed in {elapsed_ms}ms")
    
    try:
        # Parse JSON output
        output = json.loads(result.stdout.decode()) if result.stdout else []
        
        # Group issues by file
        issues_by_file = {}
        for diagnostic in output:
            file_path = diagnostic.get("filename", "unknown")
            if file_path not in issues_by_file:
                issues_by_file[file_path] = []
            issues_by_file[file_path].append({
                "code": diagnostic.get("code"),
                "message": diagnostic.get("message"),
                "line": diagnostic.get("location", {}).get("row"),
                "column": diagnostic.get("location", {}).get("column")
            })
        
        return {
            "directory": str(directory),
            "elapsed_ms": elapsed_ms,
            "fixed": fix,
            "files_checked": len(issues_by_file),
            "total_issues": len(output),
            "issues_by_file": issues_by_file,
            "summary": {
                "files_with_issues": len(issues_by_file),
                "clean_files": "unknown",  # Ruff only reports files with issues
                "fixable_issues": sum(1 for d in output if d.get("fix") is not None)
            }
        }
    except json.JSONDecodeError:
        return {
            "directory": str(directory),
            "elapsed_ms": elapsed_ms,
            "output": result.stdout.decode(),
            "errors": result.stderr.decode()
        }


async def _check_imports(args: dict) -> dict:
    """Check and organize imports using Ruff's isort rules."""
    file_path = Path(args["file_path"])
    fix = args.get("fix", False)
    
    if not file_path.exists():
        return {
            "error": f"File not found: {file_path}",
            "file": str(file_path)
        }
    
    # Run ruff with import sorting rules
    cmd = ["ruff", "check", str(file_path), "--select=I", "--output-format=json"]
    if fix:
        cmd.append("--fix")
    
    start_time = anyio.current_time()
    result = await anyio.run_process(cmd, check=False)
    elapsed_ms = int((anyio.current_time() - start_time) * 1000)
    
    try:
        output = json.loads(result.stdout.decode()) if result.stdout else []
        
        import_issues = []
        for diagnostic in output:
            if diagnostic.get("code", "").startswith("I"):
                import_issues.append({
                    "code": diagnostic.get("code"),
                    "message": diagnostic.get("message"),
                    "line": diagnostic.get("location", {}).get("row")
                })
        
        return {
            "file": str(file_path),
            "elapsed_ms": elapsed_ms,
            "fixed": fix,
            "import_issues": import_issues,
            "summary": {
                "total_import_issues": len(import_issues),
                "needs_sorting": len(import_issues) > 0
            }
        }
    except json.JSONDecodeError:
        return {
            "file": str(file_path),
            "elapsed_ms": elapsed_ms,
            "output": result.stdout.decode(),
            "errors": result.stderr.decode()
        }


async def _check_typing(args: dict) -> dict:
    """Check type annotations and upgrade patterns."""
    file_path = Path(args["file_path"])
    target_version = args.get("target_version", "py312")
    
    if not file_path.exists():
        return {
            "error": f"File not found: {file_path}",
            "file": str(file_path)
        }
    
    # Run ruff with typing and upgrade rules
    cmd = [
        "ruff", "check", str(file_path),
        "--select=UP,TCH,ANN",  # pyupgrade, type-checking, annotations
        f"--target-version={target_version}",
        "--output-format=json"
    ]
    
    start_time = anyio.current_time()
    result = await anyio.run_process(cmd, check=False)
    elapsed_ms = int((anyio.current_time() - start_time) * 1000)
    
    try:
        output = json.loads(result.stdout.decode()) if result.stdout else []
        
        typing_issues = {
            "upgrade_suggestions": [],
            "type_checking": [],
            "missing_annotations": []
        }
        
        for diagnostic in output:
            code = diagnostic.get("code", "")
            issue = {
                "code": code,
                "message": diagnostic.get("message"),
                "line": diagnostic.get("location", {}).get("row")
            }
            
            if code.startswith("UP"):
                typing_issues["upgrade_suggestions"].append(issue)
            elif code.startswith("TCH"):
                typing_issues["type_checking"].append(issue)
            elif code.startswith("ANN"):
                typing_issues["missing_annotations"].append(issue)
        
        return {
            "file": str(file_path),
            "elapsed_ms": elapsed_ms,
            "target_version": target_version,
            "typing_issues": typing_issues,
            "summary": {
                "total_issues": len(output),
                "upgrade_available": len(typing_issues["upgrade_suggestions"]) > 0,
                "type_checking_issues": len(typing_issues["type_checking"]),
                "missing_annotations": len(typing_issues["missing_annotations"])
            }
        }
    except json.JSONDecodeError:
        return {
            "file": str(file_path),
            "elapsed_ms": elapsed_ms,
            "output": result.stdout.decode(),
            "errors": result.stderr.decode()
        }


if __name__ == "__main__":
    mcp.run()