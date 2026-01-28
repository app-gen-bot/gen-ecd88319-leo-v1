"""
AWS Secrets Manager Loader for Leo Container.

Loads platform secrets from AWS Secrets Manager at container startup.
Both local Docker and AWS Fargate use the same loading mechanism.
"""

import os
import sys
import boto3
from botocore.exceptions import ClientError, NoCredentialsError


REGION = os.environ.get('AWS_REGION', 'us-east-1')
SECRET_PREFIX = 'leo/'

# Secret mappings: AWS secret name → environment variable
# Uses 'leo/' prefix to match leo-monorepo-v3 convention
#
# All platform secrets are loaded at runtime from AWS Secrets Manager.
# This is simpler than ECS task definition secrets because:
# - No CDK changes needed to add new secrets
# - Single pattern for all secrets
# - Secrets loaded after container starts, before any code uses them
SECRET_MAPPINGS = {
    'leo/claude-oauth-token': 'CLAUDE_CODE_OAUTH_TOKEN',
    'leo/openai-api-key': 'OPENAI_API_KEY',
    'leo/supabase-access-token': 'SUPABASE_ACCESS_TOKEN',
    'leo/github-bot-token': 'GITHUB_BOT_TOKEN',
    'leo/fly-api-token': 'FLY_API_TOKEN',
}


def obfuscate(value: str, show_chars: int = 4) -> str:
    """Obfuscate secret value for safe logging (show first N chars only)."""
    if not value or len(value) <= show_chars:
        return "***"
    return value[:show_chars] + "*" * min(len(value) - show_chars, 20)


def get_secret(client, secret_name: str) -> str | None:
    """
    Fetch a single secret from AWS Secrets Manager.

    Args:
        client: boto3 Secrets Manager client
        secret_name: Name of the secret to fetch

    Returns:
        Secret value as string, or None if secret doesn't exist

    Raises:
        ClientError: For errors other than ResourceNotFoundException
    """
    try:
        response = client.get_secret_value(SecretId=secret_name)
        return response['SecretString']
    except ClientError as error:
        # Secret not found is acceptable for optional secrets
        if error.response['Error']['Code'] == 'ResourceNotFoundException':
            return None
        # Re-raise other errors (permissions, network, etc.)
        raise


def load_secrets_from_aws() -> None:
    """
    Load all secrets from AWS Secrets Manager and populate os.environ.

    This function is called BEFORE any application code runs and BEFORE
    environment validation. It populates os.environ with secrets from AWS.

    Raises:
        SystemExit: If AWS credentials are missing or critical secrets cannot be loaded
    """
    print('🔐 Loading secrets from AWS Secrets Manager...')
    print(f'   Region: {REGION}')
    print(f'   Prefix: {SECRET_PREFIX}')

    # Create AWS Secrets Manager client
    try:
        client = boto3.client('secretsmanager', region_name=REGION)
    except NoCredentialsError:
        print('\n❌ AWS credentials not found\n')
        print('Troubleshooting:')
        print('  1. For local Docker: Mount ~/.aws directory as volume')
        print('  2. For Fargate: Ensure task execution role is configured')
        print('  3. Check AWS_PROFILE environment variable (if using profiles)')
        print('  4. Verify credentials: aws sts get-caller-identity\n')
        sys.exit(1)
    except Exception as error:
        print(f'\n❌ Failed to create AWS Secrets Manager client: {error}\n')
        print('Troubleshooting:')
        print(f'  1. Check AWS_REGION is set correctly (current: {REGION})')
        print('  2. Verify AWS credentials are configured')
        print('  3. For Fargate: Ensure task execution role has secretsmanager:GetSecretValue permission\n')
        sys.exit(1)

    # Fetch all secrets
    loaded = []
    missing = []
    failed = []

    for secret_name, env_var in SECRET_MAPPINGS.items():
        try:
            value = get_secret(client, secret_name)
            if value:
                # Successfully loaded
                os.environ[env_var] = value
                loaded.append((env_var, value))
            else:
                # Secret doesn't exist in AWS (ResourceNotFoundException)
                missing.append(secret_name)
        except ClientError as error:
            # Failed to fetch (permissions, network, etc.)
            failed.append((secret_name, error))

    # Log results
    print(f'   ✅ Loaded {len(loaded)} secrets successfully')
    if loaded:
        for env_var, value in loaded:
            print(f'      {env_var}: {obfuscate(value)}')

    if missing:
        print(f'   ⚠️  {len(missing)} secrets not found in AWS (may be optional):')
        for secret_name in missing:
            print(f'      {secret_name}')

    # Fail fast if critical errors occurred
    if failed:
        print('\n❌ Failed to load secrets from AWS Secrets Manager\n')
        print('The following secrets could not be fetched:\n')
        for secret_name, error in failed:
            error_code = error.response['Error']['Code']
            error_msg = error.response['Error']['Message']
            print(f'  • {secret_name}')
            print(f'    Error: {error_code}: {error_msg}')

        print('\nTroubleshooting:')
        print('  1. Verify IAM permissions: secretsmanager:GetSecretValue')
        print('  2. Check AWS credentials are valid (aws sts get-caller-identity)')
        print(f'  3. Confirm secrets exist: aws secretsmanager list-secrets --region {REGION}')
        print('  4. For local dev: Ensure ~/.aws credentials are mounted in Docker')
        print('  5. For Fargate: Check task execution role has correct permissions\n')
        sys.exit(1)

    # Note: User credentials (CLAUDE_CODE_OAUTH_TOKEN) are NOT loaded from AWS
    # They must be provided via .env file. This function only loads platform secrets.
    print('✅ Platform secrets loaded from AWS Secrets Manager\n')


def has_aws_credentials() -> bool:
    """
    Check if AWS credentials are available.
    Used to determine if we should attempt to load from AWS or skip.

    Returns:
        True if AWS credentials are available, False otherwise
    """
    print("\n[INFO] Checking AWS credential sources...")

    # Check for AWS credentials via environment variables
    has_env_creds = bool(
        os.environ.get('AWS_ACCESS_KEY_ID') and
        os.environ.get('AWS_SECRET_ACCESS_KEY')
    )
    print(f"[INFO]   Environment credentials (AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY): {has_env_creds}")

    # Check for AWS profile (local development)
    has_profile = bool(os.environ.get('AWS_PROFILE'))
    print(f"[INFO]   AWS_PROFILE: {os.environ.get('AWS_PROFILE', 'NOT SET')}")

    # Check if running in ECS (Fargate will have IAM role)
    is_ecs = bool(os.environ.get('ECS_CONTAINER_METADATA_URI'))
    print(f"[INFO]   ECS/Fargate IAM role: {is_ecs}")

    result = has_env_creds or has_profile or is_ecs
    print(f"[INFO]   Result: {'Available' if result else 'Not available'}")

    return result
