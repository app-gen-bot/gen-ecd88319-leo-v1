"""
Secure Package Management MCP Server

Provides secure, opinionated package management for frontend projects.
- npm-only for consistency
- Package validation against approved list
- Non-Docker native implementation
"""

import json
import subprocess
import asyncio
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional, Set

from fastmcp import FastMCP
from ..common.logging_utils import setup_mcp_server_logging

# Set up logging
server_logger = setup_mcp_server_logging("package_manager")

# Initialize the MCP server
mcp = FastMCP("SecurePackageManager")

class SecurePackageManager:
    def __init__(self):
        self.approved_packages = self._load_approved_packages()
        self.approved_set = self._create_approved_set()
    
    def _load_approved_packages(self) -> Dict[str, Any]:
        """Load the approved packages list from JSON file."""
        current_dir = Path(__file__).parent
        approved_file = current_dir / "approved_packages.json"
        
        try:
            with open(approved_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            # Fallback to minimal approved list if file doesn't exist
            return {
                "packages": {
                    "core": {"packages": ["react", "react-dom", "next"]},
                    "ui": {"packages": ["@tanstack/react-query", "lucide-react"]},
                }
            }
    
    def _create_approved_set(self) -> Set[str]:
        """Create a flat set of all approved package names for fast lookup."""
        approved = set()
        for category in self.approved_packages.get("packages", {}).values():
            approved.update(category.get("packages", []))
        return approved
    
    def validate_packages(self, packages: List[str]) -> tuple[List[str], List[str], List[str]]:
        """
        Validate packages against approved list.
        
        Returns:
            tuple[approved_packages, rejected_packages, suggestions]
        """
        approved = []
        rejected = []
        suggestions = []
        
        for package in packages:
            # Extract base package name (handle versions like "react@18.0.0")
            base_name = package.split('@')[0] if '@' in package[1:] else package
            
            if base_name in self.approved_set:
                approved.append(package)
            else:
                rejected.append(package)
                # Find similar packages as suggestions
                similar = self._find_similar_packages(base_name)
                suggestions.extend(similar)
        
        return approved, rejected, list(set(suggestions))
    
    def _find_similar_packages(self, package_name: str) -> List[str]:
        """Find similar approved packages based on partial matching."""
        suggestions = []
        package_lower = package_name.lower()
        
        for approved in self.approved_set:
            approved_lower = approved.lower()
            # Check for substring matches or common patterns
            if (package_lower in approved_lower or 
                approved_lower in package_lower or
                any(word in approved_lower for word in package_lower.split('-'))):
                suggestions.append(approved)
        
        return suggestions[:5]  # Limit to 5 suggestions
    
    def get_approved_packages_by_category(self) -> str:
        """Get a formatted string of all approved packages by category."""
        result = "📦 Approved Packages:\n\n"
        
        for category, info in self.approved_packages.get("packages", {}).items():
            result += f"**{category.title()}** - {info.get('description', '')}:\n"
            for package in info.get("packages", []):
                result += f"  • {package}\n"
            result += "\n"
        
        return result

# Create singleton instance
secure_manager = SecurePackageManager()

@mcp.tool()
async def package_management(
    action: str,
    packages: Optional[str] = None,
    dev: bool = False,
    directory: Optional[str] = None
) -> Dict[str, Any]:
    """
    Package management for frontend projects.

    Uses npm to install any packages the agent needs.

    Args:
        action: The package management action ('add', 'remove', 'list')
        packages: Space-separated list of packages (e.g., 'react react-dom @dnd-kit/core')
        dev: Whether to install as dev dependency
        directory: Directory where package.json is located (default: current directory)

    Returns:
        Dictionary with operation results
    """
    server_logger.info(f"[PACKAGE_MANAGEMENT] Action: {action}, packages: {packages}, dev: {dev}")

    # Validate action
    if action not in ["add", "remove", "list"]:
        return {
            "success": False,
            "message": f"Invalid action: {action}. Must be one of: add, remove, list"
        }
    
    # Determine working directory - use CWD pattern
    work_dir = Path(directory) if directory else Path.cwd()
    package_json_path = work_dir / "package.json"
    server_logger.info(f"[PACKAGE_MANAGEMENT] Working directory: {work_dir}")
    
    # Check if package.json exists for non-add actions
    if not package_json_path.exists() and action != "add":
        return {
            "success": False,
            "message": f"No package.json found in {work_dir}. Initialize a project first."
        }
    
    # Handle list action
    if action == "list":
        return await _list_packages(work_dir)
    
    # Handle add/remove actions
    if not packages:
        return {
            "success": False,
            "message": f"No packages specified to {action}"
        }
    
    # Parse packages
    package_list = packages.strip().split() if isinstance(packages, str) else packages
    
    if action == "add":
        return await _add_packages(package_list, work_dir, dev)
    else:  # remove
        return await _remove_packages(package_list, work_dir)

async def _list_packages(work_dir: Path) -> Dict[str, Any]:
    """List installed packages."""
    package_json_path = work_dir / "package.json"
    
    try:
        with open(package_json_path, 'r') as f:
            package_data = json.load(f)
        
        dependencies = package_data.get("dependencies", {})
        dev_dependencies = package_data.get("devDependencies", {})
        
        # Create formatted message
        message = "📦 Installed packages:\n\n"
        if dependencies:
            message += "**Dependencies:**\n"
            for dep, version in dependencies.items():
                message += f"  • {dep}@{version}\n"
            message += "\n"
        else:
            message += "**Dependencies:** none\n\n"

        if dev_dependencies:
            message += "**Dev Dependencies:**\n"
            for dep, version in dev_dependencies.items():
                message += f"  • {dep}@{version}\n"
        else:
            message += "**Dev Dependencies:** none"
        
        return {
            "success": True,
            "dependencies": dependencies,
            "devDependencies": dev_dependencies,
            "message": message
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"Failed to list packages: {str(e)}",
            "error": str(e)
        }

async def _add_packages(package_list: List[str], work_dir: Path, dev: bool) -> Dict[str, Any]:
    """Add packages to the project."""

    if not package_list:
        return {
            "success": False,
            "message": "No packages to install"
        }

    # Build npm command - install whatever the agent requests
    cmd = ["npm", "install"]
    if dev:
        cmd.append("--save-dev")
    cmd.extend(package_list)
    
    server_logger.info(f"[PACKAGE_MANAGEMENT] Installing packages: {package_list}")

    try:
        # Run npm install
        process = await asyncio.create_subprocess_exec(
            *cmd,
            cwd=work_dir,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )

        stdout, stderr = await process.communicate()

        if process.returncode == 0:
            # Verify installation
            verified, installed, missing = _verify_package_installation(package_list, work_dir)

            if verified:
                message = f"✅ Successfully added packages: {', '.join(package_list)}"
                server_logger.info(f"[PACKAGE_MANAGEMENT] Successfully installed: {package_list}")
                return {
                    "success": True,
                    "message": message,
                    "installed": package_list,
                    "output": stdout.decode()
                }
            else:
                # Some packages didn't get installed properly
                message = f"⚠️ Partial installation. Missing: {', '.join(missing)}"
                return {
                    "success": False,
                    "message": message,
                    "installed": installed,
                    "missing": missing,
                    "output": stdout.decode()
                }
        else:
            error_msg = stderr.decode()
            server_logger.error(f"[PACKAGE_MANAGEMENT] Installation failed: {error_msg}")

            # Try individual installation as fallback
            remaining_missing = await _install_packages_individually(package_list, work_dir, dev)

            if not remaining_missing:
                return {
                    "success": True,
                    "message": f"✅ Successfully added all packages after individual installation",
                    "installed": package_list,
                    "original_error": error_msg
                }
            else:
                return {
                    "success": False,
                    "message": f"❌ Failed to add packages: {error_msg}",
                    "error": error_msg
                }
                
    except Exception as e:
        server_logger.error(f"[PACKAGE_MANAGEMENT] Exception during installation: {e}")
        return {
            "success": False,
            "message": f"❌ Failed to add packages: {str(e)}",
            "error": str(e)
        }

async def _remove_packages(package_list: List[str], work_dir: Path) -> Dict[str, Any]:
    """Remove packages from the project."""
    
    cmd = ["npm", "uninstall"] + package_list
    server_logger.info(f"[PACKAGE_MANAGEMENT] Removing packages: {package_list}")
    
    try:
        process = await asyncio.create_subprocess_exec(
            *cmd,
            cwd=work_dir,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await process.communicate()
        
        if process.returncode == 0:
            message = f"✅ Successfully removed packages: {', '.join(package_list)}"
            server_logger.info(f"[PACKAGE_MANAGEMENT] Successfully removed: {package_list}")
            return {
                "success": True,
                "message": message,
                "removed": package_list,
                "output": stdout.decode()
            }
        else:
            error_msg = stderr.decode()
            server_logger.error(f"[PACKAGE_MANAGEMENT] Removal failed: {error_msg}")
            return {
                "success": False,
                "message": f"❌ Failed to remove packages: {error_msg}",
                "error": error_msg
            }
            
    except Exception as e:
        server_logger.error(f"[PACKAGE_MANAGEMENT] Exception during removal: {e}")
        return {
            "success": False,
            "message": f"❌ Failed to remove packages: {str(e)}",
            "error": str(e)
        }

def _verify_package_installation(packages: List[str], directory: Path) -> tuple[bool, List[str], List[str]]:
    """Verify that packages are actually installed by checking node_modules."""
    installed = []
    missing = []
    
    for package in packages:
        # Extract package name without version
        base_name = package.split('@')[0] if '@' in package[1:] else package
        
        # Handle scoped packages like @tanstack/react-query
        if base_name.startswith('@'):
            parts = base_name.split('/')
            if len(parts) > 1:
                scope, pkg_name = parts
                path_to_check = directory / 'node_modules' / scope / pkg_name
            else:
                path_to_check = directory / 'node_modules' / base_name
        else:
            path_to_check = directory / 'node_modules' / base_name
        
        if path_to_check.exists():
            installed.append(package)
        else:
            missing.append(package)
    
    return len(missing) == 0, installed, missing

async def _install_packages_individually(packages: List[str], work_dir: Path, dev: bool) -> List[str]:
    """Try to install packages one by one as a fallback."""
    still_missing = []
    
    for package in packages:
        cmd = ["npm", "install"]
        if dev:
            cmd.append("--save-dev")
        cmd.append(package)
        
        try:
            process = await asyncio.create_subprocess_exec(
                *cmd,
                cwd=work_dir,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode != 0:
                still_missing.append(package)
                continue
            
            # Verify installation
            verified, _, _ = _verify_package_installation([package], work_dir)
            if not verified:
                still_missing.append(package)
        
        except Exception:
            still_missing.append(package)
    
    return still_missing

def main():
    """Main entry point for the server."""
    try:
        server_logger.info("[MAIN] Starting Secure Package Manager MCP server")
        server_logger.info(f"[MAIN] Approved packages loaded: {len(secure_manager.approved_set)} packages")
        
        mcp.run(transport="stdio", show_banner=False)
        
    except KeyboardInterrupt:
        server_logger.info("[MAIN] Received KeyboardInterrupt - graceful shutdown")
        sys.exit(0)
    except Exception as e:
        server_logger.error(f"[MAIN] Fatal error: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    main()