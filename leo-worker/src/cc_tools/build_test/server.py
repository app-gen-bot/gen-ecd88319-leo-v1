"""
Build and Test MCP Server - Host Version

Provides tools for building, testing, and running frontend projects directly on the host machine.
"""

import asyncio
import json
import subprocess
import os
import signal
import sys
import re
from pathlib import Path
from typing import Dict, Any, Optional, Tuple, List

from fastmcp import FastMCP
from ..common.logging_utils import setup_mcp_server_logging

# Setup logging early using shared utility
server_logger = setup_mcp_server_logging("build_test")
server_logger.info("[SERVER_INIT] BuildTest MCP server module loaded")


def parse_typescript_errors(stderr: str) -> List[Dict[str, Any]]:
    """Parse TypeScript compiler errors into structured format.
    
    TypeScript errors format: file.ts(line,col): error TS####: message
    """
    errors = []
    lines = stderr.strip().split('\n')
    
    for line in lines:
        # Match TypeScript error pattern
        match = re.match(r'(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)', line)
        if match:
            errors.append({
                'file': match.group(1),
                'line': int(match.group(2)),
                'column': int(match.group(3)),
                'code': match.group(4),
                'message': match.group(5),
                'type': 'typescript'
            })
    
    return errors


def parse_eslint_errors(stderr: str) -> List[Dict[str, Any]]:
    """Parse ESLint errors into structured format.
    
    ESLint format varies but commonly:
    /path/to/file.js
      line:col  severity  message  rule-name
    """
    errors = []
    current_file = None
    
    lines = stderr.strip().split('\n')
    for line in lines:
        # Skip empty lines and summary lines
        if not line.strip() or line.startswith('✖') or 'problem' in line.lower():
            continue
            
        # Check if this is a file path (doesn't start with whitespace and contains file extension)
        if not line.startswith(' ') and ('.' in line) and ('/' in line or '\\' in line):
            current_file = line.strip()
        # Match error/warning line (starts with whitespace and contains line:column)
        elif current_file and re.match(r'\s+\d+:\d+', line):
            match = re.match(r'\s+(\d+):(\d+)\s+(error|warning)\s+(.+?)\s+(\S+)$', line.strip())
            if match:
                errors.append({
                    'file': current_file,
                    'line': int(match.group(1)),
                    'column': int(match.group(2)),
                    'severity': match.group(3),
                    'message': match.group(4).strip(),
                    'rule': match.group(5),
                    'type': 'eslint'
                })
    
    return errors


class BuildTestHostMCPServer:
    """MCP Server for build and test operations on host machine."""
    
    def __init__(self):
        self.logger = server_logger  # Use the global logger
        self.logger.info("[SERVER_INIT] Starting BuildTest MCP Server initialization")
        
        try:
            self.mcp = FastMCP("BuildTest")
            self.logger.info("[SERVER_INIT] FastMCP instance created successfully")
        except Exception as e:
            self.logger.error(f"[SERVER_INIT] Failed to create FastMCP instance: {e}", exc_info=True)
            raise
        
        self.name = "BuildTest"
        
        # Register tools
        try:
            self.register_tools()
            self.logger.info("[SERVER_INIT] Tools registered successfully")
        except Exception as e:
            self.logger.error(f"[SERVER_INIT] Failed to register tools: {e}", exc_info=True)
            raise
        
        self.logger.info("[SERVER_INIT] BuildTest MCP Server initialization complete")
    
    def register_tools(self):
        """Register all build and test tools."""
        self.logger.info("[TOOL_REGISTRATION] Starting tool registration")
        
        @self.mcp.tool()
        async def verify_project(
            directory: Optional[str] = None
        ) -> Dict[str, Any]:
            """Verify that a frontend project builds and passes all tests.

            This tool runs comprehensive verification checks on your project to ensure code quality:
            - Installs dependencies if missing
            - Runs ESLint to check code style and catch errors
            - Runs TypeScript type checking
            - Runs tests if configured
            - Checks for Next.js App Router issues
            - Runs the build process

            The tool will stop early if critical checks (lint, type-check, build) fail.

            Args:
                directory: Optional subdirectory to verify (relative to CWD)
                
            Returns:
                Dictionary with verification results including:
                - success: Whether all checks passed
                - message: Summary message
                - output: Detailed output from all checks
                - checks_passed: Dict of check names and their pass/fail status
            """
            # Log incoming tool call with detailed context
            self.logger.info(f"[TOOL_CALL] verify_project invoked with directory='{directory}'")
            
            try:
                self.logger.info(f"[TOOL_CALL] Starting project verification")
                result = await self._build_test_impl("verify", directory)
                self.logger.info(f"[TOOL_CALL] Verification completed successfully")
                self.logger.debug(f"[TOOL_CALL] Result summary: success={result.get('success', 'unknown')}")
                return result
            except Exception as e:
                self.logger.error(f"[TOOL_CALL] Verification failed: {e}", exc_info=True)
                self.logger.error(f"[TOOL_CALL] Exception type: {type(e).__name__}")
                raise
    
    async def run_command(self, cmd: list, cwd: str = None, env: dict = None) -> Tuple[bool, str, str]:
        """Run a command on the host machine."""
        try:
            # Log the command being run
            cmd_str = ' '.join(cmd)
            self.logger.info(f"[COMMAND_EXEC] Running command: {cmd_str}")
            if cwd:
                self.logger.info(f"[COMMAND_EXEC] Working directory: {cwd}")
            if env:
                self.logger.debug(f"[COMMAND_EXEC] Additional env vars: {list(env.keys())}")
            
            # Prepare environment
            cmd_env = os.environ.copy()
            if env:
                cmd_env.update(env)
            
            # Run command with detailed logging
            self.logger.debug(f"[COMMAND_EXEC] Creating subprocess for: {cmd}")
            try:
                process = await asyncio.create_subprocess_exec(
                    *cmd,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                    cwd=cwd,
                    env=cmd_env
                )
                self.logger.debug(f"[COMMAND_EXEC] Subprocess created, PID: {process.pid}")
                
                self.logger.debug(f"[COMMAND_EXEC] Waiting for process completion...")
                stdout, stderr = await process.communicate()
                success = process.returncode == 0
                
                # Log result with details
                self.logger.info(f"[COMMAND_EXEC] Command {'succeeded' if success else 'failed'} with return code: {process.returncode}")
                if stdout:
                    self.logger.debug(f"[COMMAND_EXEC] stdout length: {len(stdout)} bytes")
                if stderr:
                    self.logger.debug(f"[COMMAND_EXEC] stderr length: {len(stderr)} bytes")
                    
            except Exception as subprocess_error:
                self.logger.error(f"[COMMAND_EXEC] Subprocess creation/execution failed: {subprocess_error}", exc_info=True)
                raise
            
            return success, stdout.decode('utf-8'), stderr.decode('utf-8')
            
        except Exception as e:
            self.logger.error(f"[COMMAND_EXEC] Command failed with exception: {str(e)}", exc_info=True)
            self.logger.error(f"[COMMAND_EXEC] Exception type: {type(e).__name__}")
            return False, "", str(e)
    
    async def _build_test_impl(
        self, 
        command: str,
        directory: Optional[str] = None
    ) -> Dict[str, Any]:
        """Implementation for build and test operations."""
        
        # Set defaults for package manager and port
        package_manager = "npm"  # Always use npm for frontend projects
        port = 3000  # Default development port
        
        # Use CWD or resolve directory relative to CWD
        if directory:
            work_dir = os.path.join(os.getcwd(), directory)
        else:
            work_dir = os.getcwd()
        
        # Log the tool invocation with full context
        self.logger.info(f"[IMPL_START] Tool invoked with command: {command} (using npm, port {port})")
        self.logger.info(f"[IMPL_START] Workspace: {work_dir}")
        
        # Validate inputs
        valid_commands = ["build", "dev", "lint", "test", "verify", "type-check"]
        if command not in valid_commands:
            return {
                "success": False,
                "message": f"Invalid command: {command}. Must be one of: {', '.join(valid_commands)}"
            }
        
        # Check if package.json exists
        package_json_path = Path(work_dir) / "package.json"
        if not package_json_path.exists():
            return {
                "success": False,
                "message": f"No package.json found in {work_dir}. Initialize a project first."
            }
        
        # Handle verify command (runs multiple checks)
        if command == "verify":
            return await self._run_verify_checks(work_dir, package_manager)
        
        
        # Handle dev command (quick check, don't keep running)
        elif command == "dev":
            return await self._check_dev_server(work_dir, package_manager)
        
        # Handle other commands
        else:
            return await self._run_single_command(command, work_dir, package_manager)
    
    async def _run_verify_checks(self, work_dir: str, package_manager: str) -> Dict[str, Any]:
        """Run comprehensive verification checks."""
        checks_passed = {}
        all_output = []
        suggestions = []
        has_errors = False
        all_structured_errors = []  # Collect all parsed errors
        
        # First check if dependencies are installed
        node_modules_path = Path(work_dir) / "node_modules"
        if not node_modules_path.exists():
            all_output.append("⚠️  No node_modules found - installing dependencies first...")
            install_cmd = [package_manager, "install"]
            success, stdout, stderr = await self.run_command(install_cmd, cwd=work_dir)
            if not success:
                return {
                    "success": False,
                    "message": "Failed to install dependencies",
                    "error": stderr,
                    "suggestion": f"Run '{package_manager} install' manually to see the full error"
                }
            all_output.append("✓ Dependencies installed")
            all_output.append("")
        
        # Define the checks to run in order with fast-fail behavior
        # Critical checks: lint, type-check, build (stop on failure)
        # Non-critical: test, nextjs-check (continue on failure)  
        check_commands = ["lint", "type-check", "test", "nextjs-check", "build"]
        critical_checks = {"lint", "type-check", "build"}
        
        for check in check_commands:
            self.logger.info(f"Running {check} check...")
            all_output.append(f"🔍 Running {check}...")
            
            
            # Handle custom Next.js check
            if check == "nextjs-check":
                nextjs_result = await self._check_nextjs_issues(work_dir)
                success = nextjs_result["success"]
                stdout = nextjs_result.get("output", "")
                stderr = nextjs_result.get("error", "")
            else:
                # Check if script exists first
                cmd = [package_manager, "run", check]
                self.logger.info(f"[CMD_DEBUG] Running command: {' '.join(cmd)} in {work_dir}")
                success, stdout, stderr = await self.run_command(cmd, cwd=work_dir)
                
            
            # If script doesn't exist, skip it
            if "Missing script" in stderr or "Unknown command" in stderr or "Unknown workspace" in stderr:
                checks_passed[check] = "skipped"
                all_output.append(f"  ⏭️  {check}: Skipped (script not configured)")
                continue
            
            checks_passed[check] = success
            
            if success:
                all_output.append(f"  ✅ {check}: Passed")
                if stdout.strip():
                    # Show first few lines of successful output
                    lines = stdout.strip().split('\n')[:3]
                    for line in lines:
                        all_output.append(f"     {line}")
                    if len(stdout.strip().split('\n')) > 3:
                        all_output.append("     ...")
            else:
                has_errors = True
                
                # Parse and collect structured errors
                parsed_errors = []
                if check == "type-check":
                    parsed_errors = parse_typescript_errors(stderr)
                elif check == "lint":
                    parsed_errors = parse_eslint_errors(stderr)
                
                # Show summary and detailed errors
                if parsed_errors:
                    # Add to all structured errors
                    all_structured_errors.extend(parsed_errors)
                    
                    # Group errors by file
                    errors_by_file = {}
                    for error in parsed_errors:
                        file = error['file']
                        if file not in errors_by_file:
                            errors_by_file[file] = []
                        errors_by_file[file].append(error)
                    
                    all_output.append(f"  ❌ {check}: Failed - {len(parsed_errors)} error{'s' if len(parsed_errors) != 1 else ''} found")
                    all_output.append("")
                    
                    # Show first 20 errors with file grouping
                    shown_errors = 0
                    for file, file_errors in errors_by_file.items():
                        if shown_errors >= 20:
                            remaining = len(parsed_errors) - shown_errors
                            all_output.append(f"     ... and {remaining} more error{'s' if remaining != 1 else ''}")
                            break
                            
                        all_output.append(f"     📄 {file}:")
                        for error in file_errors[:5]:  # Max 5 errors per file
                            if check == "type-check":
                                all_output.append(f"        Line {error['line']},{error['column']}: {error['message']} ({error['code']})")
                            else:  # ESLint
                                all_output.append(f"        Line {error['line']},{error['column']}: [{error['severity']}] {error['message']} ({error['rule']})")
                            shown_errors += 1
                            if shown_errors >= 20:
                                break
                else:
                    # Fallback to original behavior if parsing fails
                    all_output.append(f"  ❌ {check}: Failed")
                    error_lines = stderr.strip().split('\n')
                    for line in error_lines[:5]:
                        if line.strip():
                            all_output.append(f"     {line}")
                
                # Provide specific suggestions based on error type
                if "Cannot find module" in stderr:
                    try:
                        missing_module = stderr.split("Cannot find module")[1].split("'")[1]
                        suggestions.append(f"Missing module '{missing_module}' - try running '{package_manager} install'")
                    except:
                        suggestions.append(f"Missing module detected - try running '{package_manager} install'")
                elif "Property" in stderr and "does not exist" in stderr:
                    suggestions.append("TypeScript type errors detected - check your type definitions")
                elif "Parsing error" in stderr:
                    suggestions.append("Syntax error in code - check the line mentioned in the error")
                elif check == "build" and "out of memory" in stderr.lower():
                    suggestions.append("Build ran out of memory - try increasing Node.js memory limit")
                
                # Fast-fail: Stop immediately on critical check failures
                if check in critical_checks:
                    has_errors = True  # Ensure success flag reflects the failure
                    self.logger.warning(f"[VERIFY] Critical check '{check}' failed - stopping early (fast-fail)")
                    all_output.append(f"")
                    all_output.append(f"⚠️  Stopping verification early due to critical '{check}' failure")
                    all_output.append(f"   Fix this issue before proceeding with remaining checks")
                    break
        
        # Prepare final result
        result = {
            "success": not has_errors,
            "message": "All checks completed" if not has_errors else "Some checks failed",
            "output": "\n".join(all_output),
            "checks_passed": checks_passed
        }
        
        # Add structured errors if any were found
        if all_structured_errors:
            result["structured_errors"] = all_structured_errors
        
        if suggestions:
            result["suggestions"] = suggestions
            result["message"] += f" - {len(suggestions)} suggestion(s) available"
        
        # Add summary
        total_possible = len(check_commands)
        total_run = len(checks_passed)
        passed_count = sum(1 for v in checks_passed.values() if v is True)
        failed_count = sum(1 for v in checks_passed.values() if v is False)
        skipped_count = sum(1 for v in checks_passed.values() if v == 'skipped')
        not_run_count = total_possible - total_run
        
        summary_lines = [
            "",
            "📊 Summary:",
            f"  Total checks: {total_run}/{total_possible} run",
            f"  Passed: {passed_count}",
            f"  Failed: {failed_count}",
            f"  Skipped: {skipped_count}"
        ]
        
        if not_run_count > 0:
            summary_lines.append(f"  Not run: {not_run_count} (stopped early)")
            
        result["output"] += "\n" + "\n".join(summary_lines)
        
        return result
    
    async def _check_nextjs_issues(self, work_dir: str) -> Dict[str, Any]:
        """Check for common Next.js App Router issues."""
        issues = []
        
        # Check for client hook usage without "use client" directive
        app_dir = Path(work_dir) / "app"
        if app_dir.exists():
            for tsx_file in app_dir.rglob("*.tsx"):
                try:
                    content = tsx_file.read_text()
                    lines = content.split('\n')
                    
                    # Check if file uses client hooks but lacks "use client"
                    has_client_hooks = any(
                        hook in content for hook in [
                            'useState', 'useEffect', 'useRouter', 'useQuery',
                            'useSearchParams', 'usePathname'
                        ]
                    )
                    
                    has_use_client = any(
                        '"use client"' in line or "'use client'" in line 
                        for line in lines[:5]  # Check first 5 lines
                    )
                    
                    if has_client_hooks and not has_use_client:
                        rel_path = tsx_file.relative_to(Path(work_dir))
                        issues.append(f"File {rel_path} uses client hooks but missing 'use client' directive")
                        
                except Exception as e:
                    self.logger.warning(f"Error checking {tsx_file}: {e}")
        
        if issues:
            return {
                "success": False,
                "output": "Next.js App Router issues found",
                "error": "\n".join(issues)
            }
        else:
            return {
                "success": True,
                "output": "✓ No Next.js App Router issues found"
            }
    
    
    
    async def _check_dev_server(self, work_dir: str, package_manager: str) -> Dict[str, Any]:
        """Check if dev server script exists."""
        # Check if dev script exists
        cmd = [package_manager, "run"]
        success, stdout, stderr = await self.run_command(cmd, cwd=work_dir)
        
        if success and "dev" in stdout:
            return {
                "success": True,
                "message": "Development server command is available"
            }
        else:
            return {
                "success": False,
                "message": "No 'dev' script found in package.json",
                "error": "The 'dev' script is not defined"
            }
    
    async def _run_single_command(self, command: str, work_dir: str, package_manager: str) -> Dict[str, Any]:
        """Run a single build/test command."""
        cmd = [package_manager, "run", command]
        success, stdout, stderr = await self.run_command(cmd, cwd=work_dir)
        
        # For failed commands, especially type-check, include stderr in output for better error details
        if not success and stderr.strip():
            # Parse structured errors if applicable
            parsed_errors = []
            if command == "type-check":
                parsed_errors = parse_typescript_errors(stderr)
            elif command == "lint":
                parsed_errors = parse_eslint_errors(stderr)
            
            # Include stderr in output so LLM gets actionable error information
            combined_output = stdout
            if combined_output and stderr:
                combined_output += "\n\nErrors:\n" + stderr
            elif stderr:
                combined_output = "Errors:\n" + stderr
            
            result = {
                "success": success,
                "message": f"Command failed with return code: {cmd[-1] if cmd else 'unknown'}",
                "output": combined_output,
                "error": stderr  # Still keep error field for backward compatibility
            }
            
            # Add structured errors if any were parsed
            if parsed_errors:
                result["structured_errors"] = parsed_errors
        else:
            result = {
                "success": success,
                "message": f"{'Successfully ran' if success else 'Failed to run'} {command}",
                "output": stdout
            }
            
            if not success:
                result["error"] = stderr
        
        return result


# Create global server instance
server = BuildTestHostMCPServer()


def main():
    """Main entry point for the server."""
    try:
        server_logger.info("[MAIN] Starting BuildTest MCP Server")
        server.mcp.run(transport="stdio", show_banner=False)
    except KeyboardInterrupt:
        server_logger.info("[MAIN] Received KeyboardInterrupt - graceful shutdown")
        sys.exit(0)
    except Exception as e:
        server_logger.error(f"[MAIN] Failed to run BuildTest MCP Server: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()