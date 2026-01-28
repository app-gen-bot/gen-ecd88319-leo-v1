"""
Supabase Setup MCP Server

Custom MCP server that automates Supabase project setup.
Uses ONLY the Supabase Management API (no CLI for critical operations).

Flow:
1. Get organization (API)
2. Create project (API)
3. Poll for ACTIVE_HEALTHY status (API)
4. Get pooler URL (API)
5. Get API keys (API)
6. Disable email confirmations (API)
7. Generate .env file
8. Optional: init local supabase/ directory
"""

import asyncio
import json
import os
import sys
import urllib.parse
import secrets
import string
import time
import aiohttp
from pathlib import Path
from typing import Dict, Any, Optional, List

from fastmcp import FastMCP
from ..common.logging_utils import setup_mcp_server_logging

# Setup logging early using shared utility
server_logger = setup_mcp_server_logging("supabase_setup")
server_logger.info("[SERVER_INIT] Supabase Setup MCP server module loaded")

# Supabase Management API base URL
SUPABASE_API_URL = "https://api.supabase.com/v1"


class SupabaseSetupMCPServer:
    """MCP Server for autonomous Supabase project setup using Management API."""

    def __init__(self):
        self.logger = server_logger
        self.logger.info("[SERVER_INIT] Starting Supabase Setup MCP Server initialization")

        try:
            self.mcp = FastMCP("SupabaseSetup")
            self.logger.info("[SERVER_INIT] FastMCP instance created successfully")
        except Exception as e:
            self.logger.error(f"[SERVER_INIT] Failed to create FastMCP instance: {e}", exc_info=True)
            raise

        self.name = "SupabaseSetup"

        # Register tools
        try:
            self.register_tools()
            self.logger.info("[SERVER_INIT] Tools registered successfully")
        except Exception as e:
            self.logger.error(f"[SERVER_INIT] Failed to register tools: {e}", exc_info=True)
            raise

        self.logger.info("[SERVER_INIT] Supabase Setup MCP Server initialization complete")

    def register_tools(self):
        """Register all Supabase setup tools."""
        self.logger.info("[TOOL_REGISTRATION] Starting tool registration")

        @self.mcp.tool()
        async def create_supabase_project(
            app_name: str,
            app_directory: str,
            schema_sql: Optional[str] = None,
            region: str = "us-east-1"
        ) -> Dict[str, Any]:
            """Autonomously create and configure a Supabase project with all credentials.

            This tool performs the complete Supabase project setup workflow using
            ONLY the Supabase Management API (no CLI dependencies for critical operations):

            1. Auto-detects your Supabase organization (API)
            2. Creates a new project with secure password (API)
            3. Polls for project to be ACTIVE_HEALTHY (API)
            4. Gets exact pooler URL from API (deterministic!)
            5. Retrieves all API keys (API)
            6. Disables email confirmations (API) - users can sign up without email verification
            7. Creates .env file with all credentials
            8. Optionally initializes local supabase/ directory

            Prerequisites:
            - SUPABASE_ACCESS_TOKEN environment variable must be set

            Args:
                app_name: Name for the Supabase project (e.g., "my-app")
                app_directory: Absolute path to the app directory
                schema_sql: Optional SQL schema to apply as initial migration
                region: Supabase region (default: "us-east-1")

            Returns:
                Dictionary with:
                - success: Whether setup completed successfully
                - project_ref: Supabase project reference ID
                - supabase_url: Project API URL
                - anon_key: Public (anon) API key
                - service_role_key: Secret (service_role) API key
                - database_url: Database connection string (pooler)
                - pooler_host: The pooler host (e.g., aws-1-us-east-1.pooler.supabase.com)
                - storage_mode: Storage mode ("database")
                - output: Detailed execution log
            """
            self.logger.info(f"[TOOL_CALL] create_supabase_project invoked: app_name={app_name}, directory={app_directory}")

            output_log = []

            # Check for SUPABASE_ACCESS_TOKEN
            access_token = os.environ.get('SUPABASE_ACCESS_TOKEN')
            if not access_token:
                return {
                    "success": False,
                    "error": "SUPABASE_ACCESS_TOKEN environment variable not set. This is required for API calls.",
                    "output": ""
                }

            try:
                async with aiohttp.ClientSession() as session:
                    # Step 0: Get organization via API
                    self.logger.info("[STEP_0] Getting Supabase organization via API")
                    output_log.append("=== Step 0: Getting Organization (API) ===")

                    orgs = await self._get_organizations(session, access_token)

                    if not orgs:
                        return {
                            "success": False,
                            "error": "Failed to get organizations from API. Check SUPABASE_ACCESS_TOKEN.",
                            "output": "\n".join(output_log)
                        }

                    if len(orgs) == 0:
                        return {
                            "success": False,
                            "error": "No Supabase organizations found in your account",
                            "output": "\n".join(output_log)
                        }

                    org_id = orgs[0]["id"]
                    output_log.append(f"✅ Using organization: {org_id}")
                    self.logger.info(f"[STEP_0] Organization: {org_id}")

                    # Step 1: Generate secure password and create project via API
                    self.logger.info("[STEP_1] Creating Supabase project via API")
                    output_log.append("\n=== Step 1: Creating Project (API) ===")

                    db_password = self._generate_secure_password(24)

                    project_data = await self._create_project(
                        session, access_token, org_id, app_name, region, db_password
                    )

                    if not project_data:
                        return {
                            "success": False,
                            "error": "Failed to create project via API. Check logs for details.",
                            "output": "\n".join(output_log)
                        }

                    project_ref = project_data.get("id")
                    if not project_ref:
                        return {
                            "success": False,
                            "error": f"Project created but no ID returned: {project_data}",
                            "output": "\n".join(output_log)
                        }

                    output_log.append(f"✅ Project created: {project_ref}")
                    self.logger.info(f"[STEP_1] Project created: {project_ref}")

                    # Step 2: Poll for ACTIVE_HEALTHY status
                    self.logger.info("[STEP_2] Polling for project to be ACTIVE_HEALTHY")
                    output_log.append("\n=== Step 2: Waiting for Project to be Ready ===")

                    max_wait = 300  # 5 minutes
                    poll_interval = 10
                    waited = 0
                    status = None

                    while waited < max_wait:
                        status = await self._get_project_status(session, project_ref, access_token)
                        output_log.append(f"  Status: {status} (waited {waited}s)")
                        self.logger.info(f"[STEP_2] Status: {status} (waited {waited}s)")

                        if status == "ACTIVE_HEALTHY":
                            break

                        await asyncio.sleep(poll_interval)
                        waited += poll_interval

                    if status != "ACTIVE_HEALTHY":
                        return {
                            "success": False,
                            "error": f"Project did not become ACTIVE_HEALTHY within {max_wait}s. Final status: {status}",
                            "output": "\n".join(output_log)
                        }

                    output_log.append("✅ Project is ACTIVE_HEALTHY!")
                    self.logger.info("[STEP_2] Project is ACTIVE_HEALTHY")

                    # Step 3: Get pooler URL from API
                    self.logger.info("[STEP_3] Getting pooler URL from API")
                    output_log.append("\n=== Step 3: Getting Pooler URL (API) ===")

                    pooler_info = await self._get_pooler_info(session, project_ref, access_token)

                    if not pooler_info:
                        return {
                            "success": False,
                            "error": "Failed to get pooler configuration from API",
                            "output": "\n".join(output_log)
                        }

                    pooler_host = pooler_info["db_host"]
                    pooler_port = pooler_info["db_port"]
                    db_user = pooler_info["db_user"]
                    db_name = pooler_info["db_name"]

                    output_log.append(f"✅ Pooler host: {pooler_host}")
                    output_log.append(f"✅ Pooler port: {pooler_port}")
                    self.logger.info(f"[STEP_3] Pooler: {pooler_host}:{pooler_port}")

                    # Build DATABASE_URL
                    encoded_password = urllib.parse.quote(db_password, safe='')
                    database_url = f"postgresql://{db_user}:{encoded_password}@{pooler_host}:{pooler_port}/{db_name}"

                    # Step 4: Get API keys via API
                    self.logger.info("[STEP_4] Getting API keys via API")
                    output_log.append("\n=== Step 4: Getting API Keys (API) ===")

                    api_keys = await self._get_api_keys(session, project_ref, access_token)

                    if not api_keys:
                        return {
                            "success": False,
                            "error": "Failed to get API keys from API",
                            "output": "\n".join(output_log)
                        }

                    anon_key = next((k["api_key"] for k in api_keys if k["name"] == "anon"), None)
                    service_key = next((k["api_key"] for k in api_keys if k["name"] == "service_role"), None)

                    if not anon_key or not service_key:
                        return {
                            "success": False,
                            "error": f"API keys missing. Got: {[k['name'] for k in api_keys]}",
                            "output": "\n".join(output_log)
                        }

                    output_log.append(f"✅ Anon key: {anon_key[:20]}...")
                    output_log.append(f"✅ Service role key: {service_key[:20]}...")

                    # Step 4b: Disable email confirmations via API
                    self.logger.info("[STEP_4b] Disabling email confirmations via API")
                    output_log.append("\n=== Step 4b: Configuring Auth (API) ===")

                    auth_config_success = await self._update_auth_config(
                        session, project_ref, access_token,
                        {"mailer_autoconfirm": True}  # Auto-confirm = no email verification required
                    )

                    if auth_config_success:
                        output_log.append("✅ Email confirmations disabled")
                        self.logger.info("[STEP_4b] Email confirmations disabled successfully")
                    else:
                        output_log.append("⚠️ Could not disable email confirmations via API (non-fatal)")
                        self.logger.warning("[STEP_4b] Failed to disable email confirmations - users may need to confirm email")

                # End of aiohttp session - rest uses filesystem only

                # Step 5: Generate .env file
                self.logger.info("[STEP_5] Generating .env file")
                output_log.append("\n=== Step 5: Generating .env File ===")

                supabase_url = f"https://{project_ref}.supabase.co"

                env_content = f"""# Supabase Configuration (Generated by Supabase Setup MCP Server)
# Project: {app_name}
# Region: {region}
# Created: {time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}

SUPABASE_URL={supabase_url}
SUPABASE_ANON_KEY={anon_key}
SUPABASE_SERVICE_ROLE_KEY={service_key}

# Database Connection (Pooler - Transaction Mode)
DATABASE_URL={database_url}

# Storage Mode
AUTH_MODE=supabase
STORAGE_MODE=database
"""

                env_path = Path(app_directory) / ".env"
                env_path.write_text(env_content)
                output_log.append(f"✅ .env file created: {env_path}")

                # Step 6: Initialize local Supabase directory (optional, uses CLI)
                self.logger.info("[STEP_6] Initializing local Supabase directory")
                output_log.append("\n=== Step 6: Local Setup (CLI - Optional) ===")

                # Create supabase directory structure
                supabase_dir = Path(app_directory) / "supabase"
                migrations_dir = supabase_dir / "migrations"
                migrations_dir.mkdir(parents=True, exist_ok=True)
                output_log.append("✅ Created supabase/migrations directory")

                # Create basic config.toml
                config_toml = supabase_dir / "config.toml"
                config_content = f"""# Supabase Configuration
# Generated by Supabase Setup MCP Server

[project]
id = "{project_ref}"

[api]
enabled = true
port = 54321

[db]
major_version = 15

[auth.email]
enable_confirmations = false
max_frequency = "1s"
"""
                config_toml.write_text(config_content)
                output_log.append("✅ Created supabase/config.toml")

                # Apply migrations if provided
                if schema_sql:
                    self.logger.info("[STEP_7] Creating migration file")
                    output_log.append("\n=== Step 7: Schema Migration ===")

                    timestamp = time.strftime("%Y%m%d%H%M%S")
                    migration_file = migrations_dir / f"{timestamp}_initial_schema.sql"
                    migration_file.write_text(schema_sql)
                    output_log.append(f"✅ Migration file created: {migration_file.name}")
                    output_log.append("ℹ️  Run 'supabase db push' to apply migration")

                # Success!
                self.logger.info("[COMPLETE] Supabase project setup complete")
                output_log.append("\n=== ✅ Setup Complete ===")
                output_log.append(f"Project URL: {supabase_url}")
                output_log.append(f"Pooler Host: {pooler_host}")
                output_log.append(f"Project Ref: {project_ref}")

                return {
                    "success": True,
                    "project_ref": project_ref,
                    "supabase_url": supabase_url,
                    "anon_key": anon_key,
                    "service_role_key": service_key,
                    "database_url": database_url,
                    "pooler_host": pooler_host,
                    "storage_mode": "database",
                    "output": "\n".join(output_log)
                }

            except Exception as e:
                self.logger.error(f"[ERROR] Setup failed: {e}", exc_info=True)
                output_log.append(f"\n❌ Error: {str(e)}")
                return {
                    "success": False,
                    "error": str(e),
                    "output": "\n".join(output_log)
                }

    async def _get_organizations(self, session: aiohttp.ClientSession, access_token: str) -> Optional[List[Dict[str, Any]]]:
        """Get organizations from Supabase API."""
        try:
            async with session.get(
                f"{SUPABASE_API_URL}/organizations",
                headers={"Authorization": f"Bearer {access_token}"}
            ) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    body = await response.text()
                    self.logger.error(f"[API] Failed to get organizations: {response.status} - {body}")
                    return None
        except Exception as e:
            self.logger.error(f"[API] Error getting organizations: {e}")
            return None

    async def _create_project(
        self,
        session: aiohttp.ClientSession,
        access_token: str,
        org_id: str,
        name: str,
        region: str,
        db_pass: str
    ) -> Optional[Dict[str, Any]]:
        """Create a new Supabase project via API."""
        try:
            payload = {
                "organization_id": org_id,
                "name": name,
                "region": region,
                "db_pass": db_pass
            }

            self.logger.info(f"[API] Creating project: name={name}, org={org_id}, region={region}")

            async with session.post(
                f"{SUPABASE_API_URL}/projects",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                },
                json=payload
            ) as response:
                body = await response.text()

                if response.status in [200, 201]:
                    return json.loads(body)
                else:
                    self.logger.error(f"[API] Failed to create project: {response.status} - {body}")
                    return None
        except Exception as e:
            self.logger.error(f"[API] Error creating project: {e}")
            return None

    async def _get_project_status(self, session: aiohttp.ClientSession, project_ref: str, access_token: str) -> str:
        """Get project status from Supabase API."""
        try:
            async with session.get(
                f"{SUPABASE_API_URL}/projects/{project_ref}",
                headers={"Authorization": f"Bearer {access_token}"}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get("status", "UNKNOWN")
                else:
                    self.logger.error(f"[API] Failed to get project status: {response.status}")
                    return "API_ERROR"
        except Exception as e:
            self.logger.error(f"[API] Error getting project status: {e}")
            return "ERROR"

    async def _get_pooler_info(self, session: aiohttp.ClientSession, project_ref: str, access_token: str) -> Optional[Dict[str, Any]]:
        """Get pooler configuration from Supabase API."""
        try:
            async with session.get(
                f"{SUPABASE_API_URL}/projects/{project_ref}/config/database/pooler",
                headers={"Authorization": f"Bearer {access_token}"}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    if data and len(data) > 0:
                        return data[0]  # Return first pooler config
                    return None
                else:
                    self.logger.error(f"[API] Failed to get pooler config: {response.status}")
                    return None
        except Exception as e:
            self.logger.error(f"[API] Error getting pooler config: {e}")
            return None

    async def _get_api_keys(self, session: aiohttp.ClientSession, project_ref: str, access_token: str) -> Optional[List[Dict[str, Any]]]:
        """Get API keys from Supabase API."""
        try:
            async with session.get(
                f"{SUPABASE_API_URL}/projects/{project_ref}/api-keys",
                headers={"Authorization": f"Bearer {access_token}"}
            ) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    body = await response.text()
                    self.logger.error(f"[API] Failed to get API keys: {response.status} - {body}")
                    return None
        except Exception as e:
            self.logger.error(f"[API] Error getting API keys: {e}")
            return None

    async def _update_auth_config(
        self,
        session: aiohttp.ClientSession,
        project_ref: str,
        access_token: str,
        config: Dict[str, Any]
    ) -> bool:
        """Update auth configuration via Management API."""
        try:
            async with session.patch(
                f"{SUPABASE_API_URL}/projects/{project_ref}/config/auth",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                },
                json=config
            ) as response:
                if response.status == 200:
                    self.logger.info("[API] Auth config updated successfully")
                    return True
                else:
                    body = await response.text()
                    self.logger.error(f"[API] Failed to update auth config: {response.status} - {body}")
                    return False
        except Exception as e:
            self.logger.error(f"[API] Error updating auth config: {e}")
            return False

    def _generate_secure_password(self, length: int = 24) -> str:
        """Generate a secure random password."""
        alphabet = string.ascii_letters + string.digits
        password = ''.join(secrets.choice(alphabet) for _ in range(length))
        return password


# Create global server instance
server = SupabaseSetupMCPServer()


def main():
    """Main entry point for the server."""
    try:
        server_logger.info("[MAIN] Starting Supabase Setup MCP Server")
        server.mcp.run(transport="stdio", show_banner=False)
    except KeyboardInterrupt:
        server_logger.info("[MAIN] Received KeyboardInterrupt - graceful shutdown")
        sys.exit(0)
    except Exception as e:
        server_logger.error(f"[MAIN] Failed to run Supabase Setup MCP Server: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
