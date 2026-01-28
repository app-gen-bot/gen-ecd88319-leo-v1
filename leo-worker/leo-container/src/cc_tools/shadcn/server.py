"""
ShadcnUI Component MCP Server

Provides tools for adding ShadCN UI components to Next.js projects.
Handles automatic dependency installation and component setup.
Native Node.js implementation with pre-installed component templates.
"""

import json
import logging
import os
import sys
import subprocess
import asyncio
from pathlib import Path
from typing import Dict, Any, List, Union, Tuple, Optional, Set

from fastmcp import FastMCP
from ..common.logging_utils import setup_mcp_server_logging

# =============================================================================


class ShadcnMCPServer:
    """MCP Server for ShadCN UI component management using native Node.js."""
    
    def __init__(self):
        # Configure comprehensive logging using shared utility
        self.logger = setup_mcp_server_logging("shadcn")
        self.logger.info("[SERVER_INIT] Starting ShadcnUI MCP Server initialization")
        
        try:
            self.mcp = FastMCP("ShadcnUI")
            self.logger.info("[SERVER_INIT] FastMCP instance created successfully")
        except Exception as e:
            self.logger.error(f"[SERVER_INIT] Failed to create FastMCP instance: {e}", exc_info=True)
            raise
        
        
        # ShadCN-specific constants
        self.CORE_DEPENDENCIES = [
            "class-variance-authority",
            "clsx", 
            "tailwind-merge",
        ]
        
        # Valid ShadCN components (as of latest version)
        self.VALID_COMPONENTS = [
            "accordion", "alert", "alert-dialog", "aspect-ratio", "avatar", "badge",
            "breadcrumb", "button", "calendar", "card", "carousel", "chart", "checkbox",
            "collapsible", "combobox", "command", "context-menu", "data-table", "date-picker",
            "dialog", "drawer", "dropdown-menu", "form", "hover-card", "input", "input-otp",
            "label", "menubar", "navigation-menu", "pagination", "popover", "progress",
            "radio-group", "resizable", "scroll-area", "select", "separator", "sheet",
            "sidebar", "skeleton", "slider", "sonner", "switch", "table", "tabs",
            "textarea", "toast", "toggle", "toggle-group", "tooltip", "typography"
        ]
        
        self.COMPONENTS_REQUIRING_ICONS = [
            "accordion", "alert", "alert-dialog", "avatar", "breadcrumb", "calendar",
            "card", "collapsible", "command", "dialog", "drawer", "dropdown-menu",
            "menubar", "navigation-menu", "popover", "select", "sheet", "table",
            "toast", "toggle", "toolbar", "tooltip",
        ]
        
        # Fallback alternatives for invalid components
        self.COMPONENT_ALTERNATIVES = {
            "loader": "Use 'skeleton' for content placeholders or implement custom loading component",
            "loading": "Use 'skeleton' for content placeholders or implement custom loading component",
            "spinner": "Use 'skeleton' for content placeholders or implement custom loading component",
            "loading-spinner": "Component already included in template as 'loading-spinner'",
        }
        
        # Pre-installed components in the golden template
        # These are already available and don't need installation
        self.PRE_INSTALLED_COMPONENTS = {
            # Standard ShadCN components in template
            "alert", "avatar", "badge", "button", "card", "dialog", "dropdown-menu", 
            "form", "input", "label", "popover", "progress", "select", "separator", 
            "sheet", "skeleton", "table", "tabs", "textarea", "toaster", "toast",
            # Custom components in template
            "loading-spinner"
        }
        
        self.logger.info(f"[SERVER_INIT] Pre-installed components: {len(self.PRE_INSTALLED_COMPONENTS)}")
        self.logger.debug(f"[SERVER_INIT] Components: {sorted(self.PRE_INSTALLED_COMPONENTS)}")
        
        # Register tools
        try:
            self.register_tools()
            self.logger.info("[SERVER_INIT] Tools registered successfully")
        except Exception as e:
            self.logger.error(f"[SERVER_INIT] Failed to register tools: {e}", exc_info=True)
            raise
        
        self.logger.info("[SERVER_INIT] ShadcnUI MCP Server initialization complete")
    
    
    def register_tools(self):
        """Register all ShadCN tools."""
        self.logger.info("[TOOL_REGISTRATION] Starting tool registration")
        
        @self.mcp.tool()
        async def shadcn_add(
            components: Union[str, List[str]]
        ) -> Dict[str, Any]:
            """Add ShadCN UI component(s) to the Next.js project. This tool is idempotent - safe to call multiple times.

Pre-installed components are automatically skipped. You can add multiple components in a single call.
When adding components that require icons (like dropdown, navigation, etc.), the lucide-react package will be automatically installed.
Core dependencies like class-variance-authority will be automatically installed for all components.
            
            Args:
                components: Component(s) to add. Formats:
                  - Single: 'button'
                  - Multiple (space-separated): 'checkbox radio-group select'
                  - Multiple (list): ['checkbox', 'radio-group', 'select']
                
            Returns:
                Dictionary with results including success status, messages, and details
            """
            # Log incoming tool call with detailed context
            self.logger.info(f"[TOOL_CALL] shadcn_add invoked with components='{components}'")
            self.logger.info(f"[TOOL_CALL] Working directory: {os.getcwd()}")
            
            try:
                self.logger.info(f"[TOOL_CALL] Starting implementation for components: {components}")
                result = await self._shadcn_add_impl(components)
                self.logger.info(f"[TOOL_CALL] Implementation completed successfully")
                self.logger.debug(f"[TOOL_CALL] Result summary: success={result.get('success', 'unknown')}")
                return result
            except Exception as e:
                self.logger.error(f"[TOOL_CALL] Implementation failed: {e}", exc_info=True)
                self.logger.error(f"[TOOL_CALL] Exception type: {type(e).__name__}")
                raise
    
    async def _shadcn_add_impl(
        self, 
        components: Union[str, List[str]]
    ) -> Dict[str, Any]:
        """Implementation for adding ShadCN components."""
        
        # Check if project exists
        self.logger.info(f"[IMPL_START] Checking for project existence in: {os.getcwd()}")
        if not self._project_exists("package.json"):
            self.logger.warning(f"[IMPL_START] No package.json found in working directory: {os.getcwd()}")
            return {
                "success": False,
                "message": "No Next.js project found. Initialize a project first.",
                "component": components if isinstance(components, str) else components[0] if components else ""
            }
        
        # Normalize components to a list
        self.logger.info(f"[IMPL_START] Normalizing components input: {components} (type: {type(components)})")
        if isinstance(components, str):
            # Handle both comma-separated and space-separated strings
            if ',' in components:
                components = [c.strip() for c in components.split(',')]
            else:
                components = components.split()
        
        self.logger.info(f"[IMPL_START] Normalized components list: {components}")
        
        if not components:
            self.logger.warning(f"[IMPL_START] No components provided after normalization")
            return {
                "success": False,
                "message": "Component name is required",
                "components": []
            }
        
        # Validate components and separate valid/invalid
        valid_components = []
        invalid_components = []
        suggestions = []
        
        for component in components:
            if component in self.VALID_COMPONENTS:
                valid_components.append(component)
            else:
                invalid_components.append(component)
                if component in self.COMPONENT_ALTERNATIVES:
                    suggestions.append(f"{component} → {self.COMPONENT_ALTERNATIVES[component]}")
                else:
                    suggestions.append(f"{component} → not available in ShadCN component library")
        
        # If no valid components, return helpful error
        if not valid_components:
            return {
                "success": False,
                "message": f"No valid ShadCN components found. Suggestions: {'; '.join(suggestions)}",
                "invalid_components": invalid_components,
                "suggestions": suggestions
            }
        
        self.logger.info(f"[VALIDATION] Processing valid components: {valid_components}")
        if invalid_components:
            self.logger.warning(f"[VALIDATION] Skipping invalid components: {invalid_components}")
            self.logger.debug(f"[VALIDATION] Suggestions: {suggestions}")
        
        # Install core dependencies if needed
        self.logger.info(f"[DEPENDENCIES] Checking core dependencies: {self.CORE_DEPENDENCIES}")
        installed_deps = []
        for dep in self.CORE_DEPENDENCIES:
            if not self._is_dependency_installed(dep):
                self.logger.info(f"[DEPENDENCIES] Installing core dependency: {dep}")
                # Use npm (standard Node.js package manager)
                cmd = ["npm", "install", dep, "--no-audit", "--no-fund"]
                self.logger.debug(f"[DEPENDENCIES] Running command: {' '.join(cmd)}")
                success, stdout, stderr = await self._run_native_command_with_timeout(
                    cmd,
                    cwd=os.getcwd(),
                    timeout=90  # 90 second timeout for dependency installation
                )
                if success:
                    installed_deps.append(dep)
                    self.logger.info(f"[DEPENDENCIES] Successfully installed: {dep}")
                else:
                    self.logger.warning(f"[DEPENDENCIES] Failed to install {dep}: {stderr}")
            else:
                self.logger.debug(f"[DEPENDENCIES] Already installed: {dep}")
        
        # Check if any components need lucide-react
        needs_icons = any(c in self.COMPONENTS_REQUIRING_ICONS for c in valid_components)
        if needs_icons and not self._is_dependency_installed("lucide-react"):
            self.logger.info(f"[DEPENDENCIES] Installing lucide-react for icon components (needs_icons={needs_icons})")
            # Use npm (standard Node.js package manager)
            cmd = ["npm", "install", "lucide-react", "--no-audit", "--no-fund"]
            self.logger.debug(f"[DEPENDENCIES] Running command: {' '.join(cmd)}")
            success, stdout, stderr = await self._run_native_command_with_timeout(
                cmd,
                cwd=os.getcwd(),
                timeout=90  # 90 second timeout for dependency installation
            )
            if success:
                installed_deps.append("lucide-react")
                self.logger.info(f"[DEPENDENCIES] Successfully installed lucide-react")
            else:
                self.logger.warning(f"[DEPENDENCIES] Failed to install lucide-react: {stderr}")
        
        # Filter out pre-installed and already installed components
        new_components = []
        skipped_components = []
        
        for component in valid_components:
            if component in self.PRE_INSTALLED_COMPONENTS:
                self.logger.info(f"Component {component} pre-installed in template, skipping")
                skipped_components.append(component)
            elif self._is_component_installed(component):
                self.logger.info(f"Component {component} already installed, skipping")
                skipped_components.append(component)
            else:
                new_components.append(component)
        
        # Add ShadCN components
        results = []
        all_successful = True
        
        # Add skipped components to results
        for component in skipped_components:
            results.append({
                "component": component,
                "success": True,
                "output": f"Already available"
            })
        
        # Install all new components in a single command
        if new_components:
            self.logger.info(f"[COMPONENT_INSTALL] Installing ShadCN components: {', '.join(new_components)}")
            
            # Use npx (standard npm ecosystem tool) with all components at once
            # -y on npx to skip confirmation, --yes on shadcn to skip interactive prompts
            cmd = ["npx", "-y", "shadcn@latest", "add"] + new_components + ["--yes"]
            self.logger.debug(f"[COMPONENT_INSTALL] Running command: {' '.join(cmd)}")
            success, stdout, stderr = await self._run_native_command_with_timeout(
                cmd,
                cwd=os.getcwd(),
                timeout=300  # 5 minute timeout for multiple components
            )
            output = stdout if success else stderr
            
            if not success:
                self.logger.error(f"[COMPONENT_INSTALL] Failed to install components {new_components}: {output}")
                all_successful = False
            
            # Add results for all components (they all succeed or fail together)
            for component in new_components:
                results.append({
                    "component": component,
                    "success": success,
                    "output": output
                })
        
        # Return results
        base_success = all_successful and len(results) > 0
        
        if len(valid_components) == 1 and len(invalid_components) == 0:
            # Single valid component
            result = results[0]
            if result['success']:
                message = "Success"
            else:
                message = f"Failed ({result['component']} installation error)"
            
            return {
                "success": result['success'],
                "message": message,
                "component": result['component']
            }
        elif len(invalid_components) > 0 and len(valid_components) == 0:
            # Only invalid components (single or multiple)
            if len(invalid_components) == 1:
                message = f"Failed ({invalid_components[0]} not valid ShadCN component). Suggestions: {'; '.join(suggestions)}"
            else:
                message = f"Failed ({', '.join(invalid_components)} not valid ShadCN components). Suggestions: {'; '.join(suggestions)}"
            
            return {
                "success": False,
                "message": message,
                "invalid_components": invalid_components
            }
        else:
            # Multiple components - mixed results
            succeeded = [r['component'] for r in results if r['success']]
            failed = [r['component'] for r in results if not r['success']]
            
            if len(succeeded) > 0 and len(failed) == 0 and len(invalid_components) == 0:
                message = "Success"
            else:
                parts = []
                if succeeded:
                    parts.append(f"Success ({', '.join(succeeded)})")
                if failed:
                    parts.append(f"Failed ({', '.join(failed)} installation errors)")
                if invalid_components:
                    parts.append(f"Invalid ({', '.join(invalid_components)} not valid ShadCN components)")
                
                message = ", ".join(parts)
                if invalid_components and suggestions:
                    message += f". Suggestions: {'; '.join(suggestions)}"
            
            return {
                "success": len(succeeded) > 0,
                "message": message,
                "results": results
            }
    
    def _is_dependency_installed(self, dependency: str) -> bool:
        """Check if a dependency is installed in the project."""
        package_json_path = Path(os.getcwd()) / "package.json"
        if not package_json_path.exists():
            return False
            
        try:
            with open(package_json_path, 'r') as f:
                package_data = json.load(f)
                
            deps = package_data.get("dependencies", {})
            dev_deps = package_data.get("devDependencies", {})
            
            return dependency in deps or dependency in dev_deps
                
        except Exception as e:
            self.logger.error(f"Error checking dependency {dependency}: {str(e)}")
            return False
    
    
    def _is_component_installed(self, component: str) -> bool:
        """Check if a ShadCN component is already installed."""
        # Standard ShadCN component location
        component_path = Path(os.getcwd()) / "components" / "ui" / f"{component}.tsx"
        
        return component_path.exists()
    
    
    def _project_exists(self, project_file: str = "package.json") -> bool:
        """Check if a project file exists in the workspace."""
        project_path = Path(os.getcwd()) / project_file
        return project_path.exists()
    
    async def _run_native_command(
        self, 
        command: List[str], 
        cwd: Optional[str] = None
    ) -> Tuple[bool, str, str]:
        """Execute a command using native subprocess."""
        return await self._run_native_command_with_timeout(command, cwd, timeout=60)
    
    async def _run_native_command_with_timeout(
        self, 
        command: List[str], 
        cwd: Optional[str] = None,
        timeout: int = 60
    ) -> Tuple[bool, str, str]:
        """Execute a command using native subprocess with timeout."""
        import asyncio
        
        cmd_str = ' '.join(command)
        self.logger.info(f"[COMMAND_EXEC] Running command: {cmd_str}")
        if cwd:
            self.logger.info(f"[COMMAND_EXEC] Working directory: {cwd}")
        self.logger.debug(f"[COMMAND_EXEC] Timeout: {timeout}s")
        
        try:
            # Use clean environment - npm/npx don't need corepack
            env = os.environ.copy()
            
            # Create the process
            self.logger.debug(f"[COMMAND_EXEC] Creating subprocess for: {command}")
            process = await asyncio.create_subprocess_exec(
                *command,
                cwd=cwd,
                env=env,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            self.logger.debug(f"[COMMAND_EXEC] Subprocess created, PID: {process.pid}")
            
            # Wait for completion with timeout
            try:
                self.logger.debug(f"[COMMAND_EXEC] Waiting for process completion...")
                stdout, stderr = await asyncio.wait_for(
                    process.communicate(), 
                    timeout=timeout
                )
                
                success = process.returncode == 0
                self.logger.info(f"[COMMAND_EXEC] Command {'succeeded' if success else 'failed'} with return code: {process.returncode}")
                
                if stdout:
                    self.logger.debug(f"[COMMAND_EXEC] stdout length: {len(stdout)} bytes")
                if stderr:
                    self.logger.debug(f"[COMMAND_EXEC] stderr length: {len(stderr)} bytes")
                    if not success:
                        # Log first few lines of stderr on failure
                        stderr_lines = stderr.decode().split('\n')[:3]
                        for line in stderr_lines:
                            if line.strip():
                                self.logger.warning(f"[COMMAND_EXEC] stderr: {line}")
                
                return success, stdout.decode() if stdout else "", stderr.decode() if stderr else ""
                
            except asyncio.TimeoutError:
                self.logger.error(f"[COMMAND_EXEC] Command timed out after {timeout} seconds")
                # Kill the process if it times out
                process.kill()
                await process.wait()
                self.logger.warning(f"[COMMAND_EXEC] Process {process.pid} killed due to timeout")
                return False, "", f"Command timed out after {timeout} seconds"
            
        except Exception as e:
            self.logger.error(f"[COMMAND_EXEC] Error executing command: {e}", exc_info=True)
            self.logger.error(f"[COMMAND_EXEC] Exception type: {type(e).__name__}")
            return False, "", str(e)
    


def main():
    """Main entry point for the server."""
    try:
        server = ShadcnMCPServer()
        server.mcp.run(transport="stdio", show_banner=False)
    except Exception as e:
        logging.basicConfig(level=logging.ERROR, stream=sys.stderr)
        logger = logging.getLogger("ShadcnUI")
        logger.error(f"Failed to run ShadcnUI MCP Server: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()