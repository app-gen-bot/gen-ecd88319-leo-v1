"""
Leo Container - Main entry point

WSIClient handles:
- WSI Protocol v2.1 compliance
- WebSocket connection to WSI Server
- AppGeneratorAgent orchestration

Startup sequence:
1. Load .env file if present (baked into image at build time)
2. Load secrets from AWS Secrets Manager (if available)
3. Validate required credentials
4. Create and run WSIClient
"""

import asyncio
import os
import re
import signal
import sys
from pathlib import Path


def obfuscate_value(key: str, value: str) -> str:
    """
    Obfuscate sensitive environment variable values for logging.

    Shows enough characters to identify key type while hiding the secret.

    Anthropic Key Types (identified by prefix):
    - sk-ant-oat01-xxx = OAuth token (CLAUDE_CODE_OAUTH_TOKEN)
    - sk-ant-api03-xxx = API key (ANTHROPIC_API_KEY)
    - sk-ant-sid01-xxx = Session ID

    Other patterns:
    - ghp_xxx = GitHub personal access token
    - FlyV1 xxx = Fly.io API token
    - sbp_xxx = Supabase access token
    - eyJ xxx = JWT token (base64 encoded)
    """
    if not value:
        return "(empty)"

    # For short values, just show length
    if len(value) < 12:
        return f"***({len(value)} chars)"

    # Anthropic tokens - show type prefix (first 12) + last 4
    # sk-ant-oat01- = OAuth, sk-ant-api03- = API key
    if value.startswith('sk-ant-'):
        return f"{value[:12]}***{value[-4:]}"

    # GitHub tokens - show ghp_ prefix + last 4
    if value.startswith('ghp_'):
        return f"ghp_***{value[-4:]}"

    # Fly.io tokens - show FlyV1 + last 4
    if value.startswith('FlyV'):
        return f"FlyV1***{value[-4:]}"

    # Supabase access tokens
    if value.startswith('sbp_'):
        return f"sbp_***{value[-4:]}"

    # JWT tokens (Supabase anon/service keys)
    if value.startswith('eyJ'):
        return f"eyJ***{value[-4:]} (JWT)"

    # PostgreSQL connection strings - show structure, hide password
    if 'postgresql://' in value or 'postgres://' in value:
        # Replace password portion
        return re.sub(r':([^:@]+)@', ':***@', value)

    # Keys/tokens/secrets by name - show first 8 + last 4
    sensitive_patterns = ['KEY', 'TOKEN', 'SECRET', 'PASSWORD', 'CREDENTIAL']
    if any(pattern in key.upper() for pattern in sensitive_patterns):
        return f"{value[:8]}***{value[-4:]}"

    # Non-sensitive values - show full value
    return value


print("=" * 80)
print("Leo Container Starting")
print("=" * 80)

# =============================================================================
# STEP 1: Load/Create .env file for agent use
# =============================================================================
# User secrets (CLAUDE_CODE_OAUTH_TOKEN, SUPABASE_ACCESS_TOKEN) are passed as
# env vars by Leo SaaS orchestrator. We write them to .env so agents can read them.
print("\n[INFO] Step 1: Setting up .env file...")
from dotenv import load_dotenv

env_file = Path('/factory/.env')
if env_file.exists():
    print(f"[INFO] Found existing .env file at {env_file}")
    load_dotenv(env_file)
    print("[INFO] ✅ Loaded secrets from .env file")
else:
    # Create .env from passed environment variables
    # These are BYOT (Bring Your Own Token) credentials from the user
    print(f"[INFO] No .env file found - creating from environment variables...")

    env_content = []
    env_content.append("# Leo Container - Auto-generated .env")
    env_content.append("# Created from environment variables passed by Leo SaaS")
    env_content.append("")

    written_count = 0

    # Anthropic credentials: write ONE of OAuth token or API key (OAuth preferred)
    oauth_token = os.environ.get('CLAUDE_CODE_OAUTH_TOKEN')
    api_key = os.environ.get('ANTHROPIC_API_KEY')
    if oauth_token:
        env_content.append(f"CLAUDE_CODE_OAUTH_TOKEN={oauth_token}")
        written_count += 1
        print(f"[INFO]   Writing CLAUDE_CODE_OAUTH_TOKEN: {obfuscate_value('CLAUDE_CODE_OAUTH_TOKEN', oauth_token)}")
    elif api_key:
        env_content.append(f"ANTHROPIC_API_KEY={api_key}")
        written_count += 1
        print(f"[INFO]   Writing ANTHROPIC_API_KEY: {obfuscate_value('ANTHROPIC_API_KEY', api_key)} (pay-per-use)")

    # Other BYOT credentials
    other_vars = [
        'SUPABASE_ACCESS_TOKEN',
        # Supabase project credentials (if provided)
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'DATABASE_URL',
        'DATABASE_URL_POOLING',
    ]
    for var_name in other_vars:
        value = os.environ.get(var_name)
        if value:
            env_content.append(f"{var_name}={value}")
            written_count += 1
            print(f"[INFO]   Writing {var_name}: {obfuscate_value(var_name, value)}")

    if written_count > 0:
        env_file.write_text('\n'.join(env_content) + '\n')
        print(f"[INFO] ✅ Created .env with {written_count} variables")
    else:
        print("[INFO] ⚠️  No BYOT credentials found in environment")
        print("[INFO]    Agents may not be able to authenticate with external services")

# =============================================================================
# STEP 2: Load PLATFORM secrets from AWS Secrets Manager
# =============================================================================
# Platform secrets (GITHUB_BOT_TOKEN, etc.) are shared and come from AWS.
print("\n[INFO] Step 2: Loading platform secrets from AWS Secrets Manager...")
from runtime.utils.aws_secrets import load_secrets_from_aws, has_aws_credentials

if has_aws_credentials():
    try:
        load_secrets_from_aws()
        print("[INFO] ✅ Platform secrets loaded from AWS")
    except SystemExit:
        print("[INFO] ⚠️  AWS Secrets Manager load failed - continuing without platform secrets")
    except Exception as e:
        print(f"[INFO] ⚠️  AWS error (non-fatal): {e}")
else:
    print("[INFO] ⚠️  AWS credentials not detected - skipping platform secrets")
    print("[INFO]    GitHub push will be disabled")

# =============================================================================
# STEP 3: Validate required credentials
# =============================================================================
print("\n[INFO] Step 3: Validating credentials...")

# Check user credentials (BYOT - Bring Your Own Token)
# User can set EITHER OAuth token OR API key, but not both
has_claude_token = os.environ.get('CLAUDE_CODE_OAUTH_TOKEN')
has_anthropic_key = os.environ.get('ANTHROPIC_API_KEY')
has_supabase_token = os.environ.get('SUPABASE_ACCESS_TOKEN')

# Check platform credentials
has_github_token = os.environ.get('GITHUB_BOT_TOKEN')

print(f"[INFO] User credentials (BYOT):")
if has_claude_token:
    print(f"  CLAUDE_CODE_OAUTH_TOKEN: {obfuscate_value('CLAUDE_CODE_OAUTH_TOKEN', has_claude_token)}")
else:
    print(f"  CLAUDE_CODE_OAUTH_TOKEN: NOT SET")
if has_anthropic_key:
    print(f"  ANTHROPIC_API_KEY: {obfuscate_value('ANTHROPIC_API_KEY', has_anthropic_key)} ⚠️  (pay-per-use)")
else:
    print(f"  ANTHROPIC_API_KEY: NOT SET")
print(f"  SUPABASE_ACCESS_TOKEN: {obfuscate_value('SUPABASE_ACCESS_TOKEN', has_supabase_token) if has_supabase_token else 'NOT SET'}")
print(f"[INFO] Platform credentials (from AWS):")
print(f"  GITHUB_BOT_TOKEN: {obfuscate_value('GITHUB_BOT_TOKEN', has_github_token) if has_github_token else 'NOT SET'}")

# Warn if both are set (should be one or the other)
if has_claude_token and has_anthropic_key:
    print("[INFO] ⚠️  Both CLAUDE_CODE_OAUTH_TOKEN and ANTHROPIC_API_KEY set")
    print("[INFO]    CLAUDE_CODE_OAUTH_TOKEN will be used (OAuth preferred over API key)")

# User credentials are REQUIRED (either OAuth OR API key)
if not has_claude_token and not has_anthropic_key:
    print("\n❌ FATAL: User credentials not available")
    print("   Required (one of):")
    print("   - CLAUDE_CODE_OAUTH_TOKEN (OAuth token, recommended)")
    print("   - ANTHROPIC_API_KEY (API key, pay-per-use)")
    print("\n   Solution:")
    print("   1. Ensure Leo SaaS is passing credentials as env var")
    print("   2. Or for local dev: Add to leo-container/.env")
    print("   3. Get OAuth token from: claude config get oauthToken")
    sys.exit(1)

# Platform credentials are optional (GitHub push will just be skipped)
if not has_github_token:
    print("[INFO] ⚠️  GITHUB_BOT_TOKEN not set - GitHub push will be disabled")

# Supabase token is optional but warn if missing (agent can't create projects)
if not has_supabase_token:
    print("[INFO] ⚠️  SUPABASE_ACCESS_TOKEN not set - Agent cannot create Supabase projects")

print("[INFO] ✅ Credential validation passed")
print("=" * 80)
print()

# STEP 3.5: Check EFS mount status (debug)
print("[INFO] Step 3.5: Checking EFS mount status...")
efs_path = Path("/efs")
if efs_path.exists() and efs_path.is_dir():
    try:
        efs_contents = list(efs_path.iterdir())
        print(f"[INFO] ✅ EFS mounted at /efs - {len(efs_contents)} items")
        for item in efs_contents[:5]:
            print(f"[INFO]    - {item.name}")
    except PermissionError as e:
        print(f"[INFO] ⚠️  EFS permission denied: {e}")
    except Exception as e:
        print(f"[INFO] ⚠️  EFS error: {e}")
else:
    print("[INFO] ℹ️  EFS not mounted at /efs")
    try:
        with open("/proc/mounts", "r") as f:
            mounts = [l for l in f if "efs" in l.lower() or "nfs" in l.lower()]
            if mounts:
                for m in mounts[:3]:
                    print(f"[INFO]    Mount: {m.strip()}")
            else:
                print("[INFO]    No EFS/NFS mounts in /proc/mounts")
    except Exception as e:
        print(f"[INFO]    Could not read mounts: {e}")
print()

# STEP 4: Import WSI Client
print("[INFO] Step 4: Importing WSI Client...")
from runtime.wsi.client import WSIClient
print("[INFO] ✅ WSI Client imported")

# STEP 5: Load configuration
from runtime.utils.environment import load_config
from runtime.utils.logging_config import setup_logging
from runtime.utils.health import HealthChecker
from runtime.utils.http_server import HTTPServer
from runtime.utils import metrics

class LeoContainer:
    """Main application class for Leo Container"""

    def __init__(self):
        """Initialize application"""
        # Load configuration
        self.config = load_config()

        # Setup logging
        self.logger = setup_logging(self.config.log_level)

        # Log startup config - ALL env vars and build manifest for debugging
        print("========================================")
        print("STARTUP CONFIG")
        print("========================================")

        # Log build manifest
        manifest_path = Path("/build-manifest.json")
        if manifest_path.exists():
            import json
            manifest = json.loads(manifest_path.read_text())
            print("Build:")
            for key, value in manifest.items():
                print(f"  {key}: {value}")
        else:
            print("Build: (no manifest - local dev?)")

        # Log ALL environment variables with smart obfuscation
        # Shows key type prefixes for debugging while protecting secrets
        print("Environment:")
        for key in sorted(os.environ.keys()):
            value = os.environ[key]
            print(f"  {key}: {obfuscate_value(key, value)}")

        print("========================================")

        # Create components
        self.wsi_client = None
        self.running = True

        # Create monitoring components
        self.health_checker = HealthChecker()
        self.http_server = HTTPServer(
            health_checker=self.health_checker,
            port=8080  # Default monitoring port
        )

        # Set system info metrics
        metrics.set_system_info(
            version="2.0.0",  # WSI Client integration
            python_version=f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
            generator_mode=self.config.generator_mode
        )

    def setup_signal_handlers(self) -> None:
        """Setup signal handlers for graceful shutdown"""
        def signal_handler(signum, frame):
            self.logger.info("Received signal", signal=signum)
            self.running = False

        signal.signal(signal.SIGTERM, signal_handler)
        signal.signal(signal.SIGINT, signal_handler)

    async def run(self) -> None:
        """Main run loop"""
        try:
            # Setup signal handlers
            self.setup_signal_handlers()

            # Start HTTP server for metrics/health
            await self.http_server.start()
            self.logger.info("Monitoring endpoints available on port 8080")

            # Create WSI Client
            # It will handle all WebSocket protocol and agent management
            self.logger.info(
                "Creating WSI Client",
                ws_url=self.config.ws_url
            )

            self.wsi_client = WSIClient(
                ws_url=self.config.ws_url,
                workspace=self.config.workspace_path,
                connect_timeout=self.config.websocket_connect_timeout,
                send_timeout=self.config.websocket_send_timeout,
                max_retries=self.config.websocket_max_retries,
                retry_backoff_base=self.config.websocket_retry_backoff_base
            )

            # Run WSI Client (this handles everything!)
            self.logger.info("Starting WSI Client...")
            await self.wsi_client.run()

        except Exception as e:
            self.logger.error("Fatal error", error=str(e), exc_info=True)
            sys.exit(1)

        finally:
            # Cleanup
            if self.http_server:
                await self.http_server.stop()

async def main():
    """Entry point"""
    app = LeoContainer()
    await app.run()

if __name__ == '__main__':
    asyncio.run(main())
