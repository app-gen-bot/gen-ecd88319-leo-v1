#!/usr/bin/env python3
"""
Probe the environment to capture tool versions and system info.

Used to document the build environment in the evidence pack.

Usage:
    python env_probe.py [--output env-info.json]
"""

import argparse
import json
import os
import platform
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Optional


def run_command(cmd: list[str], timeout: int = 5) -> Optional[str]:
    """Run a command and return stdout, or None if it fails."""
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        if result.returncode == 0:
            return result.stdout.strip()
        return None
    except (subprocess.TimeoutExpired, FileNotFoundError, PermissionError):
        return None


def get_version(cmd: list[str]) -> Optional[str]:
    """Get version from a command like 'node --version'."""
    output = run_command(cmd)
    if output:
        # Handle version strings like "v20.10.0" or "Python 3.11.4"
        parts = output.split()
        if parts:
            version = parts[-1].lstrip('v')
            return version
    return None


def probe_environment() -> dict[str, Any]:
    """Probe the environment and return info dict."""

    info = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "system": {
            "os": platform.system(),
            "os_version": platform.version(),
            "architecture": platform.machine(),
            "hostname": platform.node(),
            "python_version": platform.python_version(),
        },
        "tools": {},
        "env_vars": {},
        "security_tools": {},
    }

    # Check common development tools
    tools_to_check = [
        ("node", ["node", "--version"]),
        ("npm", ["npm", "--version"]),
        ("git", ["git", "--version"]),
        ("docker", ["docker", "--version"]),
        ("fly", ["fly", "version"]),
        ("supabase", ["supabase", "--version"]),
        ("typescript", ["tsc", "--version"]),
        ("python", ["python3", "--version"]),
    ]

    for tool_name, cmd in tools_to_check:
        version = get_version(cmd)
        info["tools"][tool_name] = {
            "installed": version is not None,
            "version": version,
        }

    # Check security scanning tools
    security_tools = [
        ("semgrep", ["semgrep", "--version"]),
        ("gitleaks", ["gitleaks", "version"]),
        ("trivy", ["trivy", "--version"]),
        ("osv-scanner", ["osv-scanner", "--version"]),
        ("bandit", ["bandit", "--version"]),
        ("eslint", ["eslint", "--version"]),
        ("oxlint", ["oxlint", "--version"]),
    ]

    for tool_name, cmd in security_tools:
        version = get_version(cmd)
        info["security_tools"][tool_name] = {
            "installed": version is not None,
            "version": version,
        }

    # Check relevant environment variables (sanitized)
    env_vars_to_check = [
        "NODE_ENV",
        "STORAGE_MODE",
        "AUTH_MODE",
        "FLY_APP_NAME",
        "FLY_REGION",
    ]

    for var in env_vars_to_check:
        value = os.environ.get(var)
        if value:
            info["env_vars"][var] = value

    # Add summary
    installed_tools = sum(1 for t in info["tools"].values() if t["installed"])
    installed_security = sum(1 for t in info["security_tools"].values() if t["installed"])

    info["summary"] = {
        "dev_tools_installed": f"{installed_tools}/{len(tools_to_check)}",
        "security_tools_installed": f"{installed_security}/{len(security_tools)}",
        "missing_security_tools": [
            name for name, data in info["security_tools"].items()
            if not data["installed"]
        ],
    }

    return info


def main():
    parser = argparse.ArgumentParser(
        description="Probe environment and capture tool versions"
    )
    parser.add_argument(
        "--output",
        help="Output file path (default: stdout)"
    )
    parser.add_argument(
        "--format",
        choices=["json", "text"],
        default="json",
        help="Output format (default: json)"
    )

    args = parser.parse_args()

    info = probe_environment()

    if args.format == "json":
        output = json.dumps(info, indent=2)
    else:
        # Text format for human readability
        lines = [
            f"Environment Probe - {info['timestamp']}",
            "=" * 50,
            "",
            "System:",
            f"  OS: {info['system']['os']} {info['system']['os_version']}",
            f"  Architecture: {info['system']['architecture']}",
            f"  Python: {info['system']['python_version']}",
            "",
            "Development Tools:",
        ]

        for name, data in info["tools"].items():
            status = f"v{data['version']}" if data["installed"] else "not installed"
            lines.append(f"  {name}: {status}")

        lines.extend([
            "",
            "Security Tools:",
        ])

        for name, data in info["security_tools"].items():
            status = f"v{data['version']}" if data["installed"] else "not installed"
            lines.append(f"  {name}: {status}")

        lines.extend([
            "",
            f"Summary: {info['summary']['dev_tools_installed']} dev tools, "
            f"{info['summary']['security_tools_installed']} security tools",
        ])

        if info["summary"]["missing_security_tools"]:
            lines.append(f"Missing security tools: {', '.join(info['summary']['missing_security_tools'])}")

        output = "\n".join(lines)

    if args.output:
        with open(args.output, 'w') as f:
            f.write(output)
        print(f"Environment info written to: {args.output}")
    else:
        print(output)


if __name__ == "__main__":
    main()
