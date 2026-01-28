"""
Supabase Setup MCP Server

Custom MCP server that automates Supabase project setup following the supabase-project-setup skill's recipe.
Provides a single tool that handles:
- Organization detection
- Project creation
- Auth configuration
- Migration application
- Pooler variant detection
- Credential generation
"""

import asyncio
import json
import subprocess
import os
import sys
import urllib.parse
import secrets
import string
from pathlib import Path
from typing import Dict, Any, Optional, Tuple, List

from fastmcp import FastMCP

# Simple logging setup
def log(level: str, message: str):
    """Simple logging function."""
    print(f"[{level}] {message}", file=sys.stderr)


class SupabaseSetupMCPServer:
    """MCP Server for autonomous Supabase project setup."""

    def __init__(self):
        log("INFO", "Starting Supabase Setup MCP Server initialization")

        try:
            self.mcp = FastMCP("SupabaseSetup")
            log("INFO", "FastMCP instance created successfully")
        except Exception as e:
            log("ERROR", f"Failed to create FastMCP instance: {e}")
            raise

        self.name = "SupabaseSetup"

        # Register tools
        try:
            self.register_tools()
            log("INFO", "Tools registered successfully")
        except Exception as e:
            log("ERROR", f"Failed to register tools: {e}")
            raise

        log("INFO", "Supabase Setup MCP Server initialization complete")

    def register_tools(self):
        """Register all Supabase setup tools."""
        log("INFO", "Starting tool registration")

        @self.mcp.tool()
        async def create_supabase_project(
            app_name: str,
            app_directory: str,
            schema_sql: Optional[str] = None,
            region: str = "us-east-1"
        ) -> Dict[str, Any]:
            """Autonomously create and configure a Supabase project with all credentials.

            This tool performs the complete Supabase project setup workflow:
            1. Auto-detects your Supabase organization
            2. Creates a new project with secure password
            3. Initializes local Supabase directory
            4. Configures auth settings (disables email confirmation)
            5. Applies schema migrations if provided
            6. Detects working pooler variant (aws-0 or aws-1)
            7. Retrieves all API keys and generates connection strings
            8. Creates .env file with all credentials

            Prerequisites:
            - Supabase CLI must be installed and authenticated (run `supabase login`)

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
                - pooler_variant: Which pooler worked (aws-0 or aws-1)
                - storage_mode: Recommended storage mode ("database" or "supabase")
                - output: Detailed execution log
            """
            log("INFO", f"create_supabase_project invoked: app_name={app_name}, directory={app_directory}")

            output_log = []

            try:
                # Step 0: Auto-detect organization
                log("INFO", "Step 0: Detecting Supabase organization")
                output_log.append("=== Step 0: Detecting Organization ===")

                org_result = await self._run_command(
                    ["supabase", "orgs", "list", "-o", "json"],
                    cwd=app_directory
                )

                if not org_result["success"]:
                    return {
                        "success": False,
                        "error": "Failed to list organizations. Is Supabase CLI authenticated? Run 'supabase login'",
                        "output": "\n".join(output_log)
                    }

                orgs = json.loads(org_result["stdout"])
                if not orgs or len(orgs) == 0:
                    return {
                        "success": False,
                        "error": "No Supabase organizations found in your account",
                        "output": "\n".join(output_log)
                    }

                org_slug = orgs[0]["id"]
                output_log.append(f"✅ Using organization: {org_slug}")
                log("INFO", f"Organization detected: {org_slug}")

                # Step 1: Generate secure password and create project
                log("INFO", "Step 1: Creating Supabase project")
                output_log.append("\n=== Step 1: Creating Project ===")

                db_password = self._generate_secure_password(24)

                create_result = await self._run_command(
                    ["supabase", "projects", "create", app_name,
                     "--org-id", org_slug,
                     "--db-password", db_password,
                     "--region", region,
                     "-o", "json"],
                    cwd=app_directory
                )

                if not create_result["success"]:
                    return {
                        "success": False,
                        "error": f"Failed to create project: {create_result['stderr']}",
                        "output": "\n".join(output_log)
                    }

                project_data = json.loads(create_result["stdout"])
                project_ref = project_data["id"]
                output_log.append(f"✅ Project created: {project_ref}")
                log("INFO", f"Project created: {project_ref}")

                # Step 2: Wait for project startup
                log("INFO", "Step 2: Waiting for project to start")
                output_log.append("\n=== Step 2: Waiting for Startup (30s) ===")
                await asyncio.sleep(30)
                output_log.append("✅ Wait complete")

                # Step 3: Initialize local Supabase directory
                log("INFO", "Step 3: Initializing Supabase directory")
                output_log.append("\n=== Step 3: Initializing Local Directory ===")

                init_result = await self._run_command(
                    ["supabase", "init"],
                    cwd=app_directory
                )

                if init_result["success"]:
                    output_log.append("✅ Supabase directory initialized")
                else:
                    # init might fail if directory already exists - that's okay
                    output_log.append("⚠️  Supabase init warning (may already exist)")

                # Step 4: Configure auth settings
                log("INFO", "Step 4: Configuring auth settings")
                output_log.append("\n=== Step 4: Configuring Auth Settings ===")

                config_path = Path(app_directory) / "supabase" / "config.toml"
                if config_path.exists():
                    # Read and modify config
                    config_content = config_path.read_text()
                    # Ensure enable_confirmations = false
                    if "enable_confirmations = false" not in config_content:
                        config_content = config_content.replace(
                            "enable_confirmations = true",
                            "enable_confirmations = false"
                        )
                        config_path.write_text(config_content)
                    output_log.append("✅ Auth config updated (email confirmation disabled)")

                # Step 5: Link to remote project
                log("INFO", "Step 5: Linking to remote project")
                output_log.append("\n=== Step 5: Linking to Remote ===")

                link_result = await self._run_command(
                    ["supabase", "link", "--project-ref", project_ref, "--password", db_password],
                    cwd=app_directory
                )

                if not link_result["success"]:
                    output_log.append(f"⚠️  Link warning: {link_result['stderr']}")
                else:
                    output_log.append("✅ Linked to remote project")

                # Step 6: Push auth config
                log("INFO", "Step 6: Pushing auth configuration")
                output_log.append("\n=== Step 6: Pushing Auth Config ===")

                config_push_result = await self._run_command(
                    ["supabase", "config", "push", "--project-ref", project_ref, "--yes"],
                    cwd=app_directory
                )

                if config_push_result["success"]:
                    output_log.append("✅ Auth config pushed to remote")
                else:
                    output_log.append(f"⚠️  Config push warning: {config_push_result['stderr']}")

                # Step 7: Create and push migrations (if schema provided)
                if schema_sql:
                    log("INFO", "Step 7: Creating and pushing migration")
                    output_log.append("\n=== Step 7: Creating Migration ===")

                    # Create migration file
                    migration_result = await self._run_command(
                        ["supabase", "migration", "new", "initial_schema"],
                        cwd=app_directory
                    )

                    if migration_result["success"]:
                        # Find the migration file (most recent in supabase/migrations/)
                        migrations_dir = Path(app_directory) / "supabase" / "migrations"
                        if migrations_dir.exists():
                            migration_files = sorted(migrations_dir.glob("*_initial_schema.sql"))
                            if migration_files:
                                migration_file = migration_files[-1]
                                migration_file.write_text(schema_sql)
                                output_log.append(f"✅ Migration created: {migration_file.name}")

                                # Push migration
                                push_result = await self._run_command(
                                    ["supabase", "db", "push"],
                                    cwd=app_directory
                                )

                                if push_result["success"]:
                                    output_log.append("✅ Migration pushed to remote")
                                else:
                                    output_log.append(f"⚠️  Migration push warning: {push_result['stderr']}")

                # Step 8: Retrieve API keys
                log("INFO", "Step 8: Retrieving API keys")
                output_log.append("\n=== Step 8: Retrieving API Keys ===")

                keys_result = await self._run_command(
                    ["supabase", "projects", "api-keys", "--project-ref", project_ref, "-o", "json"],
                    cwd=app_directory
                )

                if not keys_result["success"]:
                    return {
                        "success": False,
                        "error": f"Failed to retrieve API keys: {keys_result['stderr']}",
                        "output": "\n".join(output_log)
                    }

                keys = json.loads(keys_result["stdout"])
                anon_key = next((k["api_key"] for k in keys if k["name"] == "anon"), None)
                service_key = next((k["api_key"] for k in keys if k["name"] == "service_role"), None)

                output_log.append(f"✅ Anon key retrieved: {anon_key[:20]}...")
                output_log.append(f"✅ Service role key retrieved: {service_key[:20]}...")

                # Step 9: Detect working pooler variant
                log("INFO", "Step 9: Detecting pooler variant")
                output_log.append("\n=== Step 9: Detecting Pooler Variant ===")

                encoded_password = urllib.parse.quote(db_password, safe='')
                pooler_v0 = f"postgresql://postgres.{project_ref}:{encoded_password}@aws-0-{region}.pooler.supabase.com:6543/postgres?pgbouncer=true"
                pooler_v1 = f"postgresql://postgres.{project_ref}:{encoded_password}@aws-1-{region}.pooler.supabase.com:6543/postgres?pgbouncer=true"

                pooler_result = await self._detect_pooler_variant(app_directory, pooler_v0, pooler_v1)

                if pooler_result["variant"] != "none":
                    database_url = pooler_result["url"]
                    storage_mode = "database"
                    output_log.append(f"✅ Pooler variant detected: {pooler_result['variant']}")
                else:
                    database_url = f"postgresql://postgres:{db_password}@db.{project_ref}.supabase.co:5432/postgres"
                    storage_mode = "supabase"
                    output_log.append("⚠️  Pooler detection failed - using REST API fallback")

                # Step 10: Generate .env file
                log("INFO", "Step 10: Generating .env file")
                output_log.append("\n=== Step 10: Generating .env File ===")

                env_content = f"""# Supabase Configuration (Generated by Supabase Setup MCP Server)
SUPABASE_URL=https://{project_ref}.supabase.co
SUPABASE_ANON_KEY={anon_key}
SUPABASE_SERVICE_ROLE_KEY={service_key}

# Database Connection
DATABASE_URL={database_url}

# Storage Mode
AUTH_MODE=supabase
STORAGE_MODE={storage_mode}
"""

                env_path = Path(app_directory) / ".env"
                env_path.write_text(env_content)
                output_log.append(f"✅ .env file created: {env_path}")

                # Success!
                log("INFO", "Supabase project setup complete")
                output_log.append("\n=== ✅ Setup Complete ===")
                output_log.append(f"Project URL: https://{project_ref}.supabase.co")
                output_log.append(f"Storage Mode: {storage_mode}")

                return {
                    "success": True,
                    "project_ref": project_ref,
                    "supabase_url": f"https://{project_ref}.supabase.co",
                    "anon_key": anon_key,
                    "service_role_key": service_key,
                    "database_url": database_url,
                    "pooler_variant": pooler_result.get("variant", "none"),
                    "storage_mode": storage_mode,
                    "output": "\n".join(output_log)
                }

            except Exception as e:
                log("ERROR", f"Setup failed: {e}")
                output_log.append(f"\n❌ Error: {str(e)}")
                return {
                    "success": False,
                    "error": str(e),
                    "output": "\n".join(output_log)
                }

    async def _run_command(self, cmd: list, cwd: str = None) -> Dict[str, Any]:
        """Run a command and return result."""
        try:
            cmd_str = ' '.join(cmd)
            log("DEBUG", f"Running command: {cmd_str}")

            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=cwd
            )

            stdout, stderr = await process.communicate()
            success = process.returncode == 0

            return {
                "success": success,
                "stdout": stdout.decode('utf-8'),
                "stderr": stderr.decode('utf-8'),
                "returncode": process.returncode
            }

        except Exception as e:
            log("ERROR", f"Command execution failed: {e}")
            return {
                "success": False,
                "stdout": "",
                "stderr": str(e),
                "returncode": -1
            }

    def _generate_secure_password(self, length: int = 24) -> str:
        """Generate a secure random password."""
        alphabet = string.ascii_letters + string.digits
        # Use secrets for cryptographically strong random
        password = ''.join(secrets.choice(alphabet) for _ in range(length))
        return password

    async def _detect_pooler_variant(self, app_directory: str, pooler_v0: str, pooler_v1: str) -> Dict[str, Any]:
        """Detect which pooler variant works (aws-0 or aws-1)."""
        log("DEBUG", "Testing pooler variants")

        # Create Node.js test script
        test_script = """
import postgres from 'postgres';

async function testURL(url) {
  try {
    const client = postgres(url, {
      ssl: 'require',
      prepare: false,
      connect_timeout: 15,
      max: 1,
    });
    await client`SELECT 1`;
    await client.end();
    return true;
  } catch (error) {
    return false;
  }
}

const [url0, url1] = process.argv.slice(2);
const works0 = await testURL(url0);
const works1 = await testURL(url1);

console.log(works0 ? 'aws-0' : (works1 ? 'aws-1' : 'none'));
"""

        script_path = Path(app_directory) / "test-pooler.mjs"
        script_path.write_text(test_script)

        try:
            result = await self._run_command(
                ["node", "test-pooler.mjs", pooler_v0, pooler_v1],
                cwd=app_directory
            )

            variant = result["stdout"].strip() if result["success"] else "none"

            # Clean up
            script_path.unlink()

            if variant == "aws-0":
                return {"variant": "aws-0", "url": pooler_v0}
            elif variant == "aws-1":
                return {"variant": "aws-1", "url": pooler_v1}
            else:
                return {"variant": "none", "url": ""}

        except Exception as e:
            log("ERROR", f"Pooler detection failed: {e}")
            # Clean up on error
            if script_path.exists():
                script_path.unlink()
            return {"variant": "none", "url": ""}


# Create global server instance
server = SupabaseSetupMCPServer()


def main():
    """Main entry point for the server."""
    try:
        log("INFO", "Starting Supabase Setup MCP Server")
        server.mcp.run(transport="stdio", show_banner=False)
    except KeyboardInterrupt:
        log("INFO", "Received KeyboardInterrupt - graceful shutdown")
        sys.exit(0)
    except Exception as e:
        log("ERROR", f"Failed to run Supabase Setup MCP Server: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
