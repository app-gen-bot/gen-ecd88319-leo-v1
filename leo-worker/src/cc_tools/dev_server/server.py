"""
Development Server MCP Tool

Provides bash-like tools for managing development servers.
Designed to replace common bash patterns for starting/stopping dev servers.
"""

import json
import os
import sys
import asyncio
import signal
import subprocess
import psutil
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime

from fastmcp import FastMCP
from ..common.logging_utils import setup_mcp_server_logging

# =============================================================================

# Set up logging
server_logger = setup_mcp_server_logging("dev_server")

# =============================================================================


class DevServerMCPServer:
    """MCP Server for development server management."""
    
    def __init__(self):
        # Configure logging
        self.logger = setup_mcp_server_logging("dev_server")
        self.logger.info("[SERVER_INIT] Starting Development Server MCP Server initialization")
        
        try:
            self.mcp = FastMCP("DevServer")
            self.logger.info("[SERVER_INIT] FastMCP instance created successfully")
        except Exception as e:
            self.logger.error(f"[SERVER_INIT] Failed to create FastMCP instance: {e}", exc_info=True)
            raise
        
        # Register tools
        try:
            self.register_tools()
            self.logger.info("[SERVER_INIT] Tools registered successfully")
        except Exception as e:
            self.logger.error(f"[SERVER_INIT] Failed to register tools: {e}", exc_info=True)
            raise
        
        self.logger.info("[SERVER_INIT] Development Server MCP Server initialization complete")
    
    def register_tools(self):
        """Register all development server tools."""
        self.logger.info("[TOOL_REGISTRATION] Starting tool registration")
        
        @self.mcp.tool()
        async def start_dev_server(
            port: Optional[int] = 3000
        ) -> str:
            """Start development server on specified port.
            
            Like running: npm run dev > server.log 2>&1 &
            
            Args:
                port: Port for the dev server (default: 3000)
                
            Returns:
                JSON with success status, PID, port, and log file location
            """
            try:
                cwd = os.getcwd()
                self.logger.info(f"[START_DEV_SERVER] Starting in {cwd} on port {port}")
                result = await _start_server(cwd, port)
                return json.dumps(result)
            except Exception as e:
                self.logger.error(f"[START_DEV_SERVER] Error: {e}", exc_info=True)
                return json.dumps({"success": False, "error": str(e)})
        
        @self.mcp.tool()
        async def stop_dev_server() -> str:
            """Stop all development servers in current directory.
            
            Like running: pkill -f "npm run dev"
            
            Returns:
                JSON with success status and killed PIDs
            """
            try:
                cwd = os.getcwd()
                self.logger.info(f"[STOP_DEV_SERVER] Stopping servers in {cwd}")
                result = await _stop_server(cwd)
                return json.dumps(result)
            except Exception as e:
                self.logger.error(f"[STOP_DEV_SERVER] Error: {e}", exc_info=True)
                return json.dumps({"success": False, "error": str(e)})
        
        @self.mcp.tool()
        async def check_dev_server_status() -> str:
            """Check status of development servers in current directory.
            
            Like running: ps aux | grep "npm run dev"
            
            Returns:
                JSON with running status, count, and process details
            """
            try:
                cwd = os.getcwd()
                self.logger.info(f"[CHECK_STATUS] Checking status in {cwd}")
                result = await _check_status(cwd)
                return json.dumps(result)
            except Exception as e:
                self.logger.error(f"[CHECK_STATUS] Error: {e}", exc_info=True)
                return json.dumps({"success": False, "error": str(e)})
        
        @self.mcp.tool()
        async def get_dev_server_logs(
            lines: Optional[int] = 50
        ) -> str:
            """Get recent output from development server log files.
            
            Reads the most recent .dev_server_*.log file in current directory.
            
            Args:
                lines: Number of recent lines to return (default: 50)
                
            Returns:
                JSON with log content or message if no logs found
            """
            try:
                cwd = Path(os.getcwd())
                self.logger.info(f"[GET_LOGS] Getting logs from {cwd}")
                
                # Find log files
                log_files = list(cwd.glob(".dev_server_*.log"))
                
                if not log_files:
                    return json.dumps({
                        "success": True,
                        "message": "No dev server logs found",
                        "hint": "Logs are created when you start a dev server"
                    })
                
                # Get most recent log file
                log_file = max(log_files, key=lambda f: f.stat().st_mtime)
                
                # Read last N lines
                try:
                    with open(log_file, "r") as f:
                        all_lines = f.readlines()
                        recent_lines = all_lines[-lines:] if len(all_lines) > lines else all_lines
                    
                    return json.dumps({
                        "success": True,
                        "log_file": str(log_file.name),
                        "lines_returned": len(recent_lines),
                        "total_lines": len(all_lines),
                        "content": "".join(recent_lines)
                    })
                except Exception as e:
                    return json.dumps({
                        "success": False,
                        "error": f"Could not read log file: {str(e)}"
                    })
                    
            except Exception as e:
                self.logger.error(f"[GET_LOGS] Error: {e}", exc_info=True)
                return json.dumps({"success": False, "error": str(e)})


# =============================================================================
# Helper Functions
# =============================================================================

def find_dev_server_processes() -> List[Dict[str, Any]]:
    """Find all dev server processes by checking for PORT env var and npm lifecycle."""
    processes = []
    found_pids = set()  # Track PIDs we've already found
    
    try:
        for proc in psutil.process_iter(['pid', 'name', 'cmdline', 'cwd', 'create_time', 'ppid']):
            try:
                info = proc.info
                pid = info['pid']
                
                # Skip if we've already found this PID
                if pid in found_pids:
                    continue
                
                # Try to get environment variables
                try:
                    proc_obj = psutil.Process(pid)
                    env = proc_obj.environ()
                    
                    # Check if this is a dev server process
                    # Look for npm_lifecycle_event=dev or npm_command=run-script
                    if (env.get('npm_lifecycle_event') == 'dev' or 
                        (env.get('npm_command') == 'run-script' and 
                         'PORT' in env)):
                        
                        # Get the working directory
                        try:
                            cwd = proc.cwd()
                        except (psutil.AccessDenied, psutil.NoSuchProcess):
                            cwd = None
                        
                        # Calculate uptime
                        create_time = info.get('create_time', 0)
                        uptime = int(datetime.now().timestamp() - create_time) if create_time else 0
                        
                        # Get the top-level process info
                        cmdline = info.get('cmdline', [])
                        
                        processes.append({
                            'pid': pid,
                            'cwd': cwd,
                            'cmdline': ' '.join(cmdline) if cmdline else proc.name(),
                            'port': env.get('PORT', 'unknown'),
                            'uptime_seconds': uptime,
                            'uptime': f"{uptime // 60}m {uptime % 60}s"
                        })
                        
                        found_pids.add(pid)
                        
                        # Also find all child processes
                        for child in proc_obj.children(recursive=True):
                            found_pids.add(child.pid)
                        
                except (psutil.AccessDenied, psutil.NoSuchProcess):
                    # Can't access env vars, skip this process
                    continue
                    
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
                
    except Exception as e:
        server_logger.error(f"Error finding processes: {e}")
    
    return processes


async def _start_server(cwd: str, port: int, force_kill: bool = True, strict_port: bool = True) -> Dict[str, Any]:
    """Start the development server with strict port enforcement.
    
    Args:
        cwd: Working directory for the server
        port: Port to bind (strictly enforced by default)
        force_kill: Kill any process using this port first (default: True)
        strict_port: Fail if can't bind exact port, no fallback (default: True)
    """
    server_logger.info(f"[START] Starting server in {cwd} on port {port} (force_kill={force_kill}, strict_port={strict_port})")
    
    # Check if port is already in use
    if force_kill:
        port_in_use = False
        for conn in psutil.net_connections(kind='inet'):
            if conn.laddr.port == port and conn.status == 'LISTEN':
                port_in_use = True
                try:
                    proc = psutil.Process(conn.pid)
                    server_logger.info(f"[START] Killing process {conn.pid} using port {port}: {proc.name()}")
                    proc.terminate()
                    proc.wait(timeout=3)
                except (psutil.NoSuchProcess, psutil.AccessDenied) as e:
                    server_logger.warning(f"[START] Could not kill process on port {port}: {e}")
                break
        
        if port_in_use:
            # Wait briefly for port to be released
            await asyncio.sleep(1.0)
    
    # Check if port is still occupied after cleanup attempt
    if strict_port:
        for conn in psutil.net_connections(kind='inet'):
            if conn.laddr.port == port and conn.status == 'LISTEN':
                return {
                    "success": False,
                    "error": f"Port {port} is occupied and could not be freed",
                    "hint": "Use stop_dev_server first or choose a different port"
                }
    
    # Set up environment with PORT
    env = os.environ.copy()
    env["PORT"] = str(port)
    
    # Create log file
    log_file_path = Path(cwd) / f".dev_server_{port}.log"
    
    try:
        # Open log file
        log_file = open(log_file_path, "w")
        
        # Start the process with output to log file
        process = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=cwd,
            env=env,
            stdout=log_file,
            stderr=subprocess.STDOUT,  # Combine stderr with stdout
            start_new_session=True,  # Detach from parent
        )
        
        server_logger.info(f"[START] Process started with PID: {process.pid}")
        
        # Write initial log entry
        log_file.write(f"=== Dev server started at {datetime.now().isoformat()} ===\n")
        log_file.write(f"Port: {port}\n")
        log_file.write(f"PID: {process.pid}\n")
        log_file.write(f"Working directory: {cwd}\n")
        log_file.write("=" * 50 + "\n")
        log_file.flush()
        
        # Don't close the file - the process needs it open
        
        # Wait briefly to check if process starts successfully
        await asyncio.sleep(1.5)
        
        # Check if process is still running
        if process.poll() is not None:
            # Process died immediately
            log_file.close()
            
            # Try to read what was logged
            try:
                with open(log_file_path, "r") as f:
                    error_output = f.read()
            except:
                error_output = "Could not read error output"
            
            return {
                "success": False,
                "error": "Server failed to start",
                "exit_code": process.returncode,
                "output": error_output[-500:],  # Last 500 chars
                "hint": "Check if 'npm run dev' script exists in package.json"
            }
        
        # Verify server bound to correct port if strict mode
        if strict_port:
            await asyncio.sleep(1.0)  # Give server time to bind
            bound_to_port = False
            for conn in psutil.net_connections(kind='inet'):
                if conn.laddr.port == port and conn.status == 'LISTEN':
                    bound_to_port = True
                    break
            
            if not bound_to_port:
                # Server started but not on requested port - kill it
                try:
                    proc_obj = psutil.Process(process.pid)
                    proc_obj.terminate()
                    log_file.close()
                except:
                    pass
                
                return {
                    "success": False,
                    "error": f"Server started but did not bind to port {port}",
                    "hint": "Port may be configured elsewhere in package.json or environment"
                }
        
        return {
            "success": True,
            "pid": process.pid,
            "port": port,
            "message": f"Started dev server (PID: {process.pid}) on port {port}",
            "url": f"http://localhost:{port}",
            "log_file": str(log_file_path.name),
            "note": f"Server output is being written to {log_file_path.name}"
        }
        
    except FileNotFoundError:
        return {
            "success": False,
            "error": "npm not found. Is Node.js installed?"
        }
    except Exception as e:
        # Clean up log file if we created it
        if 'log_file' in locals():
            log_file.close()
        
        return {
            "success": False,
            "error": f"Failed to start server: {str(e)}"
        }


async def _stop_server(cwd: str) -> Dict[str, Any]:
    """Stop development servers in the current directory."""
    server_logger.info(f"[STOP] Stopping servers in {cwd}")
    
    processes = find_dev_server_processes()
    killed_pids = []
    failed_pids = []
    
    for proc_info in processes:
        if proc_info['cwd'] == cwd:
            pid = proc_info['pid']
            try:
                # Kill the entire process group
                proc = psutil.Process(pid)
                
                # Get all children first
                children = proc.children(recursive=True)
                
                # Kill parent
                try:
                    proc.terminate()
                    killed_pids.append(pid)
                    server_logger.info(f"[STOP] Terminated parent PID {pid}")
                except psutil.NoSuchProcess:
                    pass
                
                # Kill all children
                for child in children:
                    try:
                        child.terminate()
                        killed_pids.append(child.pid)
                        server_logger.info(f"[STOP] Terminated child PID {child.pid}")
                    except psutil.NoSuchProcess:
                        pass
                
            except ProcessLookupError:
                # Process already gone
                pass
            except PermissionError:
                failed_pids.append(pid)
                server_logger.warning(f"[STOP] Permission denied for PID {pid}")
            except Exception as e:
                failed_pids.append(pid)
                server_logger.error(f"[STOP] Error killing PID {pid}: {e}")
    
    # Brief wait for processes to terminate
    if killed_pids:
        await asyncio.sleep(0.5)
    
    result = {
        "success": True,
        "killed_pids": killed_pids,
        "message": f"Stopped {len(killed_pids)} process(es)" if killed_pids else "No processes found"
    }
    
    if failed_pids:
        result["warning"] = f"Could not stop PIDs: {failed_pids}"
    
    return result


async def _check_status(cwd: str) -> Dict[str, Any]:
    """Check status of dev servers."""
    server_logger.info(f"[STATUS] Checking status in {cwd}")
    
    processes = find_dev_server_processes()
    local_processes = []
    
    for proc_info in processes:
        if proc_info['cwd'] == cwd:
            local_processes.append({
                "pid": proc_info['pid'],
                "port": proc_info.get('port', 'unknown'),
                "uptime": proc_info['uptime'],
                "command": proc_info['cmdline']
            })
    
    return {
        "success": True,
        "running": len(local_processes) > 0,
        "count": len(local_processes),
        "processes": local_processes,
        "message": f"{len(local_processes)} dev server(s) running" if local_processes else "No dev servers running"
    }


# =============================================================================
# Main entry point
# =============================================================================

def main():
    """Main entry point for the server."""
    try:
        server = DevServerMCPServer()
        server.mcp.run(transport="stdio", show_banner=False)
    except Exception as e:
        logging.basicConfig(level=logging.ERROR, stream=sys.stderr)
        logger = logging.getLogger("DevServer")
        logger.error(f"Failed to run Development Server MCP Server: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()