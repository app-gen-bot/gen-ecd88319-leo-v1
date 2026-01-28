import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { detectMode, obfuscate, type RuntimeMode } from '../lib/config/secrets.js';

export interface ValidationResult {
  valid: boolean;
  mode: RuntimeMode;
  present: Record<string, string>;  // Obfuscated values
  missing: string[];
}

const REGION = process.env.AWS_REGION || 'us-east-1';

/**
 * Check if we should use local config (from .env) instead of AWS Secrets Manager
 */
function useLocalConfig(): boolean {
  return process.env.USE_LOCAL_CONFIG === 'true' || process.env.LOCAL_DEV === 'true';
}

async function getSecret(name: string): Promise<string> {
  const secretsClient = new SecretsManagerClient({ region: REGION });
  try {
    const response = await secretsClient.send(
      new GetSecretValueCommand({ SecretId: name })
    );
    return response.SecretString || '';
  } catch (error: any) {
    throw new Error(`❌ Failed to load secret ${name}: ${error.message}\nCheck IAM permissions for Secrets Manager`);
  }
}

/**
 * Load config from AWS Secrets Manager
 */
async function loadFromAWS(): Promise<void> {
  console.log('🔐 Loading configuration from AWS Secrets Manager...');

  const [
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceKey,
    databaseUrl,
    claudeToken,
    githubToken,
    flyApiToken,
  ] = await Promise.all([
    getSecret('app-gen-saas/supabase-url'),
    getSecret('app-gen-saas/supabase-anon-key'),
    getSecret('app-gen-saas/supabase-service-role-key'),
    getSecret('app-gen-saas/database-url'),
    getSecret('app-gen-saas/claude-oauth-token'),
    getSecret('app-gen-saas/github-bot-token'),
    getSecret('app-gen-saas/fly-api-token'),
  ]);

  process.env.SUPABASE_URL = supabaseUrl;
  process.env.SUPABASE_ANON_KEY = supabaseAnonKey;
  process.env.SUPABASE_SERVICE_ROLE_KEY = supabaseServiceKey;
  process.env.DATABASE_URL = databaseUrl;
  process.env.CLAUDE_CODE_OAUTH_TOKEN = claudeToken;
  process.env.GITHUB_BOT_TOKEN = githubToken;
  process.env.FLY_API_TOKEN = flyApiToken;
}

/**
 * Load config from environment variables (.env files)
 * For local development without AWS credentials
 */
function loadFromEnv(): void {
  console.log('🔧 Loading configuration from environment variables (local dev mode)...');

  // Values should already be in process.env from dotenv in index.ts
  // Just log what we have
  const keys = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'DATABASE_URL',
    'CLAUDE_CODE_OAUTH_TOKEN',
    'GITHUB_BOT_TOKEN',
    'FLY_API_TOKEN',
  ];

  const missing = keys.filter(k => !process.env[k]);
  if (missing.length > 0) {
    console.warn(`⚠️  Missing env vars: ${missing.join(', ')}`);
    console.warn('   Some features may not work without these values.');
  }
}

export async function loadConfig(): Promise<ValidationResult> {
  // Check if we should use local config
  if (useLocalConfig()) {
    loadFromEnv();
  } else {
    try {
      await loadFromAWS();
    } catch (error: any) {
      console.warn('⚠️  AWS Secrets Manager unavailable, falling back to local config');
      console.warn(`   Error: ${error.message}`);
      loadFromEnv();
    }
  }

  // Static config from env vars
  process.env.PORT = process.env.PORT || '5013';
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  process.env.USE_AWS_ORCHESTRATOR = process.env.USE_AWS_ORCHESTRATOR || 'false';
  process.env.USE_GITHUB_INTEGRATION = process.env.USE_GITHUB_INTEGRATION || 'false';

  // Create validation result
  const validation = createValidationResult();

  // In local dev mode, don't exit on missing values - just warn
  if (!validation.valid) {
    if (useLocalConfig()) {
      console.warn('⚠️  Configuration incomplete (local dev mode)');
      console.warn('   Missing: ' + validation.missing.join(', '));
      console.warn('   Some features may not work.');
      // Override to allow startup
      validation.valid = true;
    } else {
      console.error('❌ Configuration validation failed');
      console.error('Missing required values:');
      validation.missing.forEach(key => console.error(`  - ${key}`));
      process.exit(1);
    }
  } else {
    console.log('✅ Configuration loaded');
  }

  logConfig();
  return validation;
}

function createValidationResult(): ValidationResult {
  const mode = detectMode();

  // In local dev, only require minimal config
  const required = useLocalConfig()
    ? ['PORT']  // Minimal for local dev
    : [
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'DATABASE_URL',
        'CLAUDE_CODE_OAUTH_TOKEN',
        'GITHUB_BOT_TOKEN',
        'FLY_API_TOKEN',
        'PORT',
      ];

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
  console.log(`   Mode: ${useLocalConfig() ? 'Local Dev' : 'Production'}`);
  console.log(`   Orchestrator: ${process.env.USE_AWS_ORCHESTRATOR === 'true' ? 'AWS ECS' : 'Local Docker'}`);
  console.log(`   GitHub: ${process.env.USE_GITHUB_INTEGRATION === 'true' ? 'Enabled' : 'Disabled'}`);
  console.log(`   Port: ${process.env.PORT}`);

  if (process.env.SUPABASE_URL) {
    console.log(`   Supabase: ${obfuscate(process.env.SUPABASE_URL)}`);
  }
  console.log('');
}
