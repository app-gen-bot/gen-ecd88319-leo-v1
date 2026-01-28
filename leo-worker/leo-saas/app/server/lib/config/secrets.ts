/**
 * Environment Configuration Utilities
 *
 * Provides utilities for environment variable validation, mode detection,
 * and safe obfuscation of sensitive values.
 */

export interface RuntimeMode {
  useAwsOrchestrator: boolean;     // AWS ECS orchestrator vs local Docker
  useGithubIntegration: boolean;   // GitHub repo creation enabled
  local: boolean;                  // Running locally (not on AWS)
}

/**
 * Detect current runtime mode from environment variables
 */
export function detectMode(): RuntimeMode {
  const useAwsOrchestrator = process.env.USE_AWS_ORCHESTRATOR === 'true';
  const useGithubIntegration = process.env.USE_GITHUB_INTEGRATION === 'true';

  return {
    useAwsOrchestrator,
    useGithubIntegration,
    local: !useAwsOrchestrator,
  };
}

/**
 * Get list of required environment variables for given mode
 */
export function getRequiredVars(mode: RuntimeMode): string[] {
  // Always required (Supabase auth and database always enabled)
  const required = [
    'PORT',
    'NODE_ENV',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'DATABASE_URL',
  ];

  if (mode.useAwsOrchestrator) {
    required.push(
      'AWS_REGION',
      'ECS_CLUSTER',
      'APP_GENERATOR_TASK_DEF',
      'TASK_SUBNETS',
      'TASK_SECURITY_GROUP',
      'S3_BUCKET',
      'CLAUDE_CODE_OAUTH_TOKEN'
    );
  } else {
    // Local mode still needs Claude token and workspace
    required.push(
      'WORKSPACE_DIR',
      'CLAUDE_CODE_OAUTH_TOKEN'
    );
  }

  if (mode.useGithubIntegration) {
    required.push('GITHUB_TOKEN');
  }

  return required;
}

/**
 * Safely obfuscate sensitive values for logging
 * Shows first 2 and last 2 characters, masks the middle
 *
 * @example
 * obfuscate('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.xyz')
 * // Returns: "ey****yz"
 */
export function obfuscate(value: string): string {
  if (!value || value.length < 8) {
    return '***';
  }

  const first = value.substring(0, 2);
  const last = value.substring(value.length - 2);

  return `${first}****${last}`;
}

/**
 * Validate environment variables for current mode
 * Returns validation result with missing/present vars
 */
export interface ValidationResult {
  valid: boolean;
  mode: RuntimeMode;
  required: string[];
  missing: string[];
  present: Record<string, string>;  // Obfuscated values
}

export function validateEnvironment(): ValidationResult {
  const mode = detectMode();
  const required = getRequiredVars(mode);
  const missing: string[] = [];
  const present: Record<string, string> = {};

  for (const varName of required) {
    const value = process.env[varName];
    if (!value || value === 'PLACEHOLDER' || value.trim() === '') {
      missing.push(varName);
    } else {
      present[varName] = obfuscate(value);
    }
  }

  return {
    valid: missing.length === 0,
    mode,
    required,
    missing,
    present,
  };
}

/**
 * Format validation error message for display
 */
export function formatValidationError(result: ValidationResult): string {
  const lines: string[] = [];

  lines.push('\n❌ CONFIGURATION ERROR (not code bug)\n');
  lines.push('Missing required environment variables:');
  result.missing.forEach(v => lines.push(`  - ${v}`));

  if (Object.keys(result.present).length > 0) {
    lines.push('\nPresent variables (obfuscated):');
    Object.entries(result.present).forEach(([k, v]) => {
      lines.push(`  ✓ ${k}: ${v}`);
    });
  }

  lines.push('\nCurrent mode:');
  lines.push(`  USE_AWS_ORCHESTRATOR: ${result.mode.useAwsOrchestrator}`);
  lines.push(`  USE_GITHUB_INTEGRATION: ${result.mode.useGithubIntegration}`);
  lines.push(`  LOCAL: ${result.mode.local}`);

  lines.push('\nFix: Copy .env.secrets.template to .env and fill in values');
  lines.push('DO NOT modify code - this is a configuration issue\n');

  return lines.join('\n');
}
