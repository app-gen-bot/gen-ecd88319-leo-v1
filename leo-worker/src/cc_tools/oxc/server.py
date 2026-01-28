#!/usr/bin/env python3
"""OXC MCP Server - Ultra-fast JavaScript/TypeScript linting.

This MCP server provides real-time linting for JavaScript and TypeScript files
using OXC (Oxidation Compiler), which is 50-100x faster than ESLint.
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
mcp = FastMCP("OXC Ultra-Fast Linter")

# OXC installation check
def check_oxc_installed() -> bool:
    """Check if oxlint is installed."""
    try:
        result = subprocess.run(
            ["oxlint", "--version"],
            capture_output=True,
            text=True,
            check=False
        )
        if result.returncode == 0:
            logger.info(f"OXC version: {result.stdout.strip()}")
            return True
        return False
    except FileNotFoundError:
        return False

def install_oxc():
    """Install oxlint using npm."""
    logger.info("Installing oxlint...")
    try:
        subprocess.run(
            ["npm", "install", "-g", "oxlint"],
            check=True,
            capture_output=True,
            text=True
        )
        logger.info("oxlint installed successfully")
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to install oxlint: {e}")
        raise


@mcp.tool()
async def lint_file(file_path: str, fix: bool = False, format: str = "json") -> str:
    """Lint a JavaScript/TypeScript file with OXC for ultra-fast feedback.
    
    Args:
        file_path: Path to the file to lint
        fix: Whether to auto-fix issues
        format: Output format (json, unix, github)
    
    Returns:
        JSON string with lint results
    """
    result = await _lint_file({"file_path": file_path, "fix": fix, "format": format})
    return json.dumps(result, indent=2)


@mcp.tool()
async def lint_directory(directory: str, fix: bool = False, ignore_patterns: List[str] = None) -> str:
    """Lint all JS/TS files in a directory.
    
    Args:
        directory: Directory to lint
        fix: Whether to auto-fix issues
        ignore_patterns: Patterns to ignore (default: node_modules, dist, .next, build)
    
    Returns:
        JSON string with lint results
    """
    if ignore_patterns is None:
        ignore_patterns = ["node_modules", "dist", ".next", "build"]
    result = await _lint_directory({"directory": directory, "fix": fix, "ignore_patterns": ignore_patterns})
    return json.dumps(result, indent=2)


@mcp.tool()
async def check_react_rules(file_path: str, strict: bool = True) -> str:
    """Check React-specific linting rules.
    
    Args:
        file_path: Path to React component file
        strict: Use strict React rules
    
    Returns:
        JSON string with React-specific issues
    """
    result = await _check_react_rules({"file_path": file_path, "strict": strict})
    return json.dumps(result, indent=2)


@mcp.tool()
async def validate_config(directory: str, create_default: bool = False) -> str:
    """Validate or create an OXC configuration file.
    
    Args:
        directory: Directory to check for config
        create_default: Create default config if missing
    
    Returns:
        JSON string with config validation results
    """
    result = await _validate_config({"directory": directory, "create_default": create_default})
    return json.dumps(result, indent=2)
# Keep the internal implementation functions below


# Internal implementation functions


async def _lint_file(args: dict) -> dict:
    """Lint a single JavaScript/TypeScript file."""
    file_path = Path(args["file_path"])
    fix = args.get("fix", False)
    output_format = args.get("format", "json")
    
    logger.info(f"[OXC] Linting file: {file_path} (fix={fix}, format={output_format})")
    
    # Skip files in ignored directories
    ignored_dirs = {"node_modules", "dist", ".next", "build", "coverage", ".git"}
    path_parts = set(file_path.parts)
    if path_parts & ignored_dirs:
        logger.info(f"[OXC] Skipping file in ignored directory: {file_path}")
        return {
            "file": str(file_path),
            "skipped": True,
            "reason": "File in ignored directory",
            "elapsed_ms": 0,
            "summary": {"total_issues": 0, "errors": 0, "warnings": 0}
        }
    
    if not file_path.exists():
        logger.warning(f"[OXC] File not found: {file_path}")
        return {
            "error": f"File not found: {file_path}",
            "file": str(file_path)
        }
    
    # Build oxlint command
    cmd = ["oxlint", str(file_path), f"--format={output_format}"]
    if fix:
        cmd.append("--fix")
    
    # Run oxlint
    logger.debug(f"[OXC] Running command: {' '.join(cmd)}")
    start_time = anyio.current_time()
    result = await anyio.run_process(cmd, check=False)
    elapsed_ms = int((anyio.current_time() - start_time) * 1000)
    logger.info(f"[OXC] Lint completed in {elapsed_ms}ms for {file_path}")
    
    if output_format == "json":
        try:
            # Parse JSON output
            output = json.loads(result.stdout.decode())
            
            # OXC returns diagnostics in a nested structure
            diagnostics = output.get("diagnostics", []) if isinstance(output, dict) else output
            if isinstance(output, dict) and isinstance(diagnostics, list):
                issues = diagnostics
            else:
                issues = output if isinstance(output, list) else []
            
            # Enhanced output with timing
            total_issues = len(issues)
            errors = sum(1 for d in issues if isinstance(d, dict) and d.get("severity") == "error")
            warnings = sum(1 for d in issues if isinstance(d, dict) and d.get("severity") == "warning")
            
            logger.info(f"[OXC] Found {total_issues} issues ({errors} errors, {warnings} warnings) in {file_path}")
            if fix:
                logger.info(f"[OXC] Auto-fixed issues in {file_path}")
            
            return {
                "file": str(file_path),
                "elapsed_ms": elapsed_ms,
                "fixed": fix,
                "diagnostics": output,
                "summary": {
                    "total_issues": total_issues,
                    "errors": errors,
                    "warnings": warnings
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
            "errors": result.stderr.decode()
        }


async def _lint_directory(args: dict) -> dict:
    """Lint all JavaScript/TypeScript files in a directory."""
    directory = Path(args["directory"])
    fix = args.get("fix", False)
    ignore_patterns = args.get("ignore_patterns", ["node_modules", "dist", ".next", "build"])
    
    logger.info(f"[OXC] Linting directory: {directory} (fix={fix}, ignoring: {ignore_patterns})")
    
    if not directory.exists():
        logger.warning(f"[OXC] Directory not found: {directory}")
        return {
            "error": f"Directory not found: {directory}",
            "directory": str(directory)
        }
    
    # Build ignore arguments
    ignore_args = []
    for pattern in ignore_patterns:
        ignore_args.extend(["--ignore-pattern", pattern])
    
    # Build oxlint command
    cmd = ["oxlint", str(directory), "--format=json"] + ignore_args
    if fix:
        cmd.append("--fix")
    
    # Run oxlint
    logger.debug(f"[OXC] Running command: {' '.join(cmd)}")
    start_time = anyio.current_time()
    result = await anyio.run_process(cmd, check=False)
    elapsed_ms = int((anyio.current_time() - start_time) * 1000)
    logger.info(f"[OXC] Directory lint completed in {elapsed_ms}ms")
    
    try:
        # Parse JSON output
        output = json.loads(result.stdout.decode()) if result.stdout else {}
        
        # OXC returns diagnostics in a nested structure
        diagnostics = output.get("diagnostics", []) if isinstance(output, dict) else output
        if isinstance(output, dict) and isinstance(diagnostics, list):
            issues = diagnostics
        else:
            issues = output if isinstance(output, list) else []
        
        # Group issues by file
        issues_by_file = {}
        for diagnostic in issues:
            if isinstance(diagnostic, dict):
                file_path = diagnostic.get("filename", "unknown")
                if file_path not in issues_by_file:
                    issues_by_file[file_path] = []
                issues_by_file[file_path].append(diagnostic)
        
        total_issues = len(issues)
        errors = sum(1 for d in issues if isinstance(d, dict) and d.get("severity") == "error")
        warnings = sum(1 for d in issues if isinstance(d, dict) and d.get("severity") == "warning")
        
        logger.info(f"[OXC] Directory {directory}: {len(issues_by_file)} files with issues, {total_issues} total issues ({errors} errors, {warnings} warnings)")
        
        return {
            "directory": str(directory),
            "elapsed_ms": elapsed_ms,
            "fixed": fix,
            "files_checked": len(issues_by_file),
            "total_issues": total_issues,
            "issues_by_file": issues_by_file,
            "summary": {
                "errors": errors,
                "warnings": warnings
            }
        }
    except json.JSONDecodeError:
        return {
            "directory": str(directory),
            "elapsed_ms": elapsed_ms,
            "output": result.stdout.decode(),
            "errors": result.stderr.decode()
        }


async def _check_react_rules(args: dict) -> dict:
    """Check React-specific linting rules."""
    file_path = Path(args["file_path"])
    strict = args.get("strict", True)
    
    logger.info(f"[OXC] Checking React rules for: {file_path} (strict={strict})")
    
    if not file_path.exists():
        logger.warning(f"[OXC] File not found: {file_path}")
        return {
            "error": f"File not found: {file_path}",
            "file": str(file_path)
        }
    
    # Create temporary config for React rules
    react_config = {
        "rules": {
            "react/jsx-uses-react": "error",
            "react/jsx-uses-vars": "error",
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn" if not strict else "error",
            "react/jsx-key": "error",
            "react/no-array-index-key": "warn" if not strict else "error",
            "react/no-unstable-nested-components": "error"
        }
    }
    
    # Write temporary config
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        json.dump(react_config, f)
        config_path = f.name
    
    try:
        # Run oxlint with React config
        cmd = ["oxlint", str(file_path), "--config", config_path, "--format=json"]
        
        logger.debug(f"[OXC] Running React check: {' '.join(cmd)}")
        start_time = anyio.current_time()
        result = await anyio.run_process(cmd, check=False)
        elapsed_ms = int((anyio.current_time() - start_time) * 1000)
        logger.info(f"[OXC] React check completed in {elapsed_ms}ms")
        
        # Parse results
        try:
            output = json.loads(result.stdout.decode()) if result.stdout else {}
            
            # OXC returns diagnostics in a nested structure
            diagnostics = output.get("diagnostics", []) if isinstance(output, dict) else output
            if isinstance(output, dict) and isinstance(diagnostics, list):
                issues = diagnostics
            else:
                issues = output if isinstance(output, list) else []
            
            # Filter for React-specific issues
            react_issues = [
                d for d in issues 
                if isinstance(d, dict) and 
                any(rule in d.get("code", "") for rule in ["react", "jsx", "hooks"])
            ]
            
            total_react_issues = len(react_issues)
            hooks_violations = sum(1 for d in react_issues if "hooks" in d.get("ruleId", ""))
            jsx_issues = sum(1 for d in react_issues if "jsx" in d.get("ruleId", ""))
            
            logger.info(f"[OXC] Found {total_react_issues} React issues ({hooks_violations} hooks, {jsx_issues} JSX) in {file_path}")
            
            return {
                "file": str(file_path),
                "elapsed_ms": elapsed_ms,
                "strict_mode": strict,
                "react_issues": react_issues,
                "summary": {
                    "total_react_issues": total_react_issues,
                    "hooks_violations": hooks_violations,
                    "jsx_issues": jsx_issues
                }
            }
        except json.JSONDecodeError:
            return {
                "file": str(file_path),
                "elapsed_ms": elapsed_ms,
                "output": result.stdout.decode(),
                "errors": result.stderr.decode()
            }
    finally:
        # Clean up temp config
        Path(config_path).unlink(missing_ok=True)


async def _validate_config(args: dict) -> dict:
    """Validate or create an OXC configuration file."""
    directory = Path(args["directory"])
    create_default = args.get("create_default", False)
    
    logger.info(f"[OXC] Validating config in: {directory} (create_default={create_default})")
    
    if not directory.exists():
        logger.warning(f"[OXC] Directory not found: {directory}")
        return {
            "error": f"Directory not found: {directory}",
            "directory": str(directory)
        }
    
    # Check for existing config files
    config_files = [
        "oxlintrc.json",
        ".oxlintrc.json",
        ".oxlintrc",
        "oxlint.config.js"
    ]
    
    existing_config = None
    for config_file in config_files:
        config_path = directory / config_file
        if config_path.exists():
            existing_config = config_path
            break
    
    if existing_config:
        # Validate existing config
        logger.info(f"[OXC] Found existing config: {existing_config}")
        try:
            if existing_config.suffix == ".json":
                with open(existing_config) as f:
                    config_data = json.load(f)
                
                logger.info(f"[OXC] Config is valid: {existing_config}")
                return {
                    "status": "valid",
                    "config_path": str(existing_config),
                    "config": config_data
                }
            else:
                return {
                    "status": "found",
                    "config_path": str(existing_config),
                    "note": "JavaScript config file detected"
                }
        except json.JSONDecodeError as e:
            return {
                "status": "invalid",
                "config_path": str(existing_config),
                "error": f"Invalid JSON: {e}"
            }
    elif create_default:
        # Create default config
        default_config = {
            "rules": {
                "no-unused-vars": "error",
                "no-console": "warn",
                "eqeqeq": "error",
                "no-debugger": "error",
                "no-empty": "warn",
                "no-duplicate-case": "error",
                "no-redeclare": "error",
                "no-sparse-arrays": "error",
                "no-unreachable": "error",
                "use-isnan": "error",
                "valid-typeof": "error",
                "no-unexpected-multiline": "error",
                "no-constant-condition": "warn",
                "react-hooks/rules-of-hooks": "error",
                "react-hooks/exhaustive-deps": "warn"
            },
            "ignore": [
                "node_modules",
                "dist",
                ".next",
                "build",
                "coverage"
            ]
        }
        
        config_path = directory / "oxlintrc.json"
        with open(config_path, 'w') as f:
            json.dump(default_config, f, indent=2)
        
        logger.info(f"[OXC] Created default config: {config_path}")
        return {
            "status": "created",
            "config_path": str(config_path),
            "config": default_config
        }
    else:
        return {
            "status": "not_found",
            "directory": str(directory),
            "available_names": config_files
        }


# Ensure OXC is installed on startup
if not check_oxc_installed():
    logger.warning("OXC linter not found, will install on first use")


if __name__ == "__main__":
    mcp.run()