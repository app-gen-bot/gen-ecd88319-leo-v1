import { test, expect } from '@playwright/test';
import { API_ENDPOINTS } from '../utils/test-data';

/**
 * Backend Health & Environment Validation Tests
 *
 * Verifies:
 * - Health endpoint responds correctly
 * - Environment variables are loaded
 * - Secrets are obfuscated in responses
 * - Mode flags are correct
 */

test.describe('Backend Health Checks', () => {
  test('health endpoint returns 200 and correct mode', async ({ request }) => {
    const response = await request.get(API_ENDPOINTS.health);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();

    // Verify status
    expect(data.status).toBe('healthy');

    // Verify mode flags exist and are correct
    expect(data.mode).toBeDefined();
    expect(data.mode.useSupabaseAuth).toBe(true);
    expect(data.mode.useSupabaseDatabase).toBe(true);
    expect(data.mode.useAwsOrchestrator).toBe(false);
    expect(data.mode.useGithubIntegration).toBe(false);
    expect(data.mode.local).toBe(true);

    console.log('✓ Health check passed with mode:', data.mode);
  });

  test('health endpoint shows obfuscated secrets', async ({ request }) => {
    const response = await request.get(API_ENDPOINTS.health);
    const data = await response.json();

    // Verify environment section exists
    expect(data.environment).toBeDefined();
    expect(data.environment.present).toBeDefined();

    // Verify no secrets are fully exposed
    const presentVars = data.environment.present;

    // Check that sensitive values are obfuscated (first2****last2 pattern)
    if (presentVars.SUPABASE_ANON_KEY) {
      expect(presentVars.SUPABASE_ANON_KEY).toMatch(/^.{2}\*+.{2}$/);
      console.log('✓ SUPABASE_ANON_KEY obfuscated:', presentVars.SUPABASE_ANON_KEY);
    }

    if (presentVars.SUPABASE_SERVICE_ROLE_KEY) {
      expect(presentVars.SUPABASE_SERVICE_ROLE_KEY).toMatch(/^.{2}\*+.{2}$/);
      console.log('✓ SUPABASE_SERVICE_ROLE_KEY obfuscated:', presentVars.SUPABASE_SERVICE_ROLE_KEY);
    }

    if (presentVars.CLAUDE_CODE_OAUTH_TOKEN) {
      expect(presentVars.CLAUDE_CODE_OAUTH_TOKEN).toMatch(/^.{2}\*+.{2}$/);
      console.log('✓ CLAUDE_CODE_OAUTH_TOKEN obfuscated:', presentVars.CLAUDE_CODE_OAUTH_TOKEN);
    }

    // PORT is also obfuscated for security (which is fine)
    if (presentVars.PORT) {
      expect(presentVars.PORT).toBeTruthy();
    }

    console.log('✓ Secrets properly obfuscated in health response');
  });

  test('health endpoint shows all required env vars present', async ({ request }) => {
    const response = await request.get(API_ENDPOINTS.health);
    const data = await response.json();

    // Required vars for current mode (USE_SUPABASE_AUTH=true, USE_SUPABASE_DATABASE=true, local)
    const requiredVars = [
      'PORT',
      'NODE_ENV',
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'DATABASE_URL',
      'WORKSPACE_DIR',
      'GENERATOR_IMAGE',
      'CLAUDE_CODE_OAUTH_TOKEN',
    ];

    // Check missing array is empty
    expect(data.environment.missing).toEqual([]);

    // Verify required vars are in present list
    const presentKeys = Object.keys(data.environment.present);

    for (const varName of requiredVars) {
      expect(presentKeys).toContain(varName);
    }

    console.log('✓ All required environment variables present');
  });

  test('backend server is running', async ({ request }) => {
    // Simple connectivity test
    const response = await request.get(API_ENDPOINTS.health);

    expect(response.ok()).toBeTruthy();
    console.log('✓ Backend server responding');
  });
});

test.describe('Environment Validation', () => {
  test('server started with correct configuration', async ({ request }) => {
    const response = await request.get(API_ENDPOINTS.health);
    const data = await response.json();

    // Verify the configuration matches expected state
    expect(data.mode.useSupabaseAuth).toBe(true);
    expect(data.mode.useSupabaseDatabase).toBe(true);

    console.log('✓ Server started with USE_SUPABASE_AUTH=true, USE_SUPABASE_DATABASE=true');
  });

  test('no configuration errors in startup', async ({ request }) => {
    // If server is responding to health check, it means
    // environment validation passed (fail-fast would have exited)
    const response = await request.get(API_ENDPOINTS.health);

    expect(response.status()).toBe(200);
    console.log('✓ No configuration errors (server started successfully)');
  });
});
