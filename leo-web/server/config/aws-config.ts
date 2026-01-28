import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { detectMode, obfuscate, type RuntimeMode } from '../lib/config/secrets.js';

/**
 * AWS Configuration Loader
 *
 * NO FAF POLICY: Both local and Fargate use the same secret source (AWS Secrets Manager).
 * - Local: App reads from AWS Secrets Manager directly
 * - Fargate: CDK reads from AWS Secrets Manager at deploy time, injects as env vars
 *
 * Secret prefix: leo/*
 */

export interface ValidationResult {
  valid: boolean;
  mode: RuntimeMode;
  present: Record<string, string>;  // Obfuscated values
  missing: string[];
}

const REGION = process.env.AWS_REGION || 'us-east-1';

/**
 * Get a secret from AWS Secrets Manager
 * Returns null if secret doesn't exist or can't be accessed
 */
async function getSecret(name: string): Promise<string | null> {
  const secretsClient = new SecretsManagerClient({ region: REGION });
  try {
    const response = await secretsClient.send(
      new GetSecretValueCommand({ SecretId: name })
    );
    return response.SecretString || null;
  } catch (error: any) {
    // Don't throw - return null so caller can check env var fallback
    console.warn(`   Could not load ${name}: ${error.message}`);
    return null;
  }
}

/**
 * Load a secret, preferring AWS Secrets Manager, falling back to existing env var
 * This handles both:
 * - Local: AWS Secrets Manager read succeeds
 * - Fargate: CDK already injected env vars, AWS read may be redundant
 */
async function loadSecret(awsName: string, envName: string): Promise<boolean> {
  // If already set (e.g., by CDK on Fargate), skip AWS call
  if (process.env[envName]) {
    return true;
  }

  const value = await getSecret(awsName);
  if (value) {
    process.env[envName] = value;
    return true;
  }

  return false;
}

/**
 * Load all configuration from AWS Secrets Manager (leo/* prefix)
 */
async function loadFromAWS(): Promise<{ loaded: string[]; failed: string[] }> {
  console.log('🔐 Loading configuration from AWS Secrets Manager (leo/*)...');

  const secrets = [
    { aws: 'leo/supabase-url', env: 'SUPABASE_URL' },
    { aws: 'leo/supabase-anon-key', env: 'SUPABASE_ANON_KEY' },
    { aws: 'leo/supabase-service-role-key', env: 'SUPABASE_SERVICE_ROLE_KEY' },
    { aws: 'leo/database-url', env: 'DATABASE_URL' },
    { aws: 'leo/claude-oauth-token', env: 'CLAUDE_CODE_OAUTH_TOKEN' },
    { aws: 'leo/github-bot-token', env: 'GITHUB_BOT_TOKEN' },
    { aws: 'leo/fly-api-token', env: 'FLY_API_TOKEN' },
    { aws: 'leo/supabase-access-token', env: 'SUPABASE_ACCESS_TOKEN' },
    { aws: 'leo/openai-api-key', env: 'OPENAI_API_KEY' },
  ];

  const loaded: string[] = [];
  const failed: string[] = [];

  // Load secrets in parallel
  const results = await Promise.all(
    secrets.map(async ({ aws, env }) => {
      const success = await loadSecret(aws, env);
      return { env, success };
    })
  );

  for (const { env, success } of results) {
    if (success) {
      loaded.push(env);
    } else {
      failed.push(env);
    }
  }

  return { loaded, failed };
}

export async function loadConfig(): Promise<ValidationResult> {
  // Always try AWS Secrets Manager first (No FAF policy)
  const { loaded, failed } = await loadFromAWS();

  if (loaded.length > 0) {
    console.log(`   ✅ Loaded: ${loaded.join(', ')}`);
  }
  if (failed.length > 0) {
    console.log(`   ⚠️  Not loaded (may be optional): ${failed.join(', ')}`);
  }

  // Static config from env vars (these are always local)
  process.env.PORT = process.env.PORT || '5013';
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  process.env.USE_AWS_ORCHESTRATOR = process.env.USE_AWS_ORCHESTRATOR || 'false';
  process.env.USE_GITHUB_INTEGRATION = process.env.USE_GITHUB_INTEGRATION || 'false';

  // Create validation result
  const validation = createValidationResult();

  if (!validation.valid) {
    console.error('❌ Configuration validation failed');
    console.error('Missing required values:');
    validation.missing.forEach(key => console.error(`  - ${key}`));
    console.error('\nEnsure secrets exist in AWS Secrets Manager with leo/* prefix');
    console.error('Or check IAM permissions for Secrets Manager access');
    process.exit(1);
  } else {
    console.log('✅ Configuration loaded successfully');
  }

  logConfig();
  return validation;
}

function createValidationResult(): ValidationResult {
  const mode = detectMode();

  // Required secrets for operation
  const required = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'DATABASE_URL',
    'CLAUDE_CODE_OAUTH_TOKEN',
    'GITHUB_BOT_TOKEN',
    'PORT',
  ];

  // Optional secrets (won't fail validation if missing)
  // FLY_API_TOKEN - only needed for Fly.io deployments
  // SUPABASE_ACCESS_TOKEN - only needed for per-app mode

  const missing: string[] = [];
  const present: Record<string, string> = {};

  for (const key of required) {
    const value = process.env[key];
    if (!value) {
      missing.push(key);
    } else {
      present[key] = obfuscate(value);
    }
  }

  return {
    valid: missing.length === 0,
    mode,
    present,
    missing,
  };
}

function logConfig() {
  console.log('\nConfiguration:');
  console.log(`   Orchestrator: ${process.env.USE_AWS_ORCHESTRATOR === 'true' ? 'AWS ECS' : 'Local Docker'}`);
  console.log(`   GitHub: ${process.env.USE_GITHUB_INTEGRATION === 'true' ? 'Enabled' : 'Disabled'}`);
  console.log(`   Port: ${process.env.PORT}`);

  if (process.env.SUPABASE_URL) {
    console.log(`   Supabase: ${obfuscate(process.env.SUPABASE_URL)}`);
  }
  if (process.env.SUPABASE_ACCESS_TOKEN) {
    console.log(`   Supabase Access Token: ${obfuscate(process.env.SUPABASE_ACCESS_TOKEN)}`);
  }
  console.log('');
}
