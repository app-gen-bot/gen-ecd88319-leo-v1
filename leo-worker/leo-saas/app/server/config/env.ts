/**
 * Environment Configuration
 * Load this FIRST before any other imports
 *
 * This module loads environment variables and performs fail-fast validation
 * to prevent the application from starting in a broken state.
 */

import { config } from 'dotenv';
import {
  validateEnvironment,
  formatValidationError,
} from '../lib/config/secrets.js';

// Load environment variables in order: defaults first, then secrets override
config({ path: '.env.defaults' }); // Load defaults first
config({ path: '.env', override: true }); // Then override with secrets

// Validate environment based on current mode
const validation = validateEnvironment();

if (!validation.valid) {
  // Fail fast with clear error message
  console.error(formatValidationError(validation));
  process.exit(1);
}

// Log successful validation
console.log('✅ Environment validation passed');
console.log('\nConfiguration:');
console.log(`   Auth: Supabase (always enabled)`);
console.log(`   Database: PostgreSQL (always enabled)`);
console.log(`   Orchestrator: ${validation.mode.useAwsOrchestrator ? 'AWS ECS' : 'Local Docker'}`);
console.log(`   GitHub: ${validation.mode.useGithubIntegration ? 'Enabled' : 'Disabled'}`);
console.log(`   Environment: ${validation.mode.local ? 'Local' : 'Cloud'}`);
console.log('\nPresent variables (obfuscated):');
Object.entries(validation.present).forEach(([key, value]) => {
  console.log(`   ${key}: ${value}`);
});
console.log('');

// Export validation result for use in health checks
export { validation };
