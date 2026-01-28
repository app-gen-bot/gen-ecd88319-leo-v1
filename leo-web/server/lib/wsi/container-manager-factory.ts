/**
 * Container Manager Factory
 *
 * Creates the appropriate container manager based on environment configuration.
 * Implements the strategy pattern for container orchestration.
 *
 * Modes:
 * - Docker (default): Local Docker containers for development
 * - Fargate: AWS ECS Fargate tasks for production
 * - Process: Plain Python subprocess for stub (no Docker-in-Docker issues)
 *
 * Selection (checked in order):
 * - LEO_CONTAINER=true            -> Process mode (auto-detected inside leo-worker)
 * - USE_PROCESS_ORCHESTRATOR=true -> Process mode (explicit override)
 * - USE_AWS_ORCHESTRATOR=true     -> Fargate mode
 * - (default)                     -> Docker mode
 */

import { IContainerManager } from './container-manager-interface.js';
import { DockerContainerManager } from './container-manager.js';
import { FargateContainerManager } from './fargate-container-manager.js';
import { ProcessContainerManager } from './process-container-manager.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Required environment variables for Fargate mode
 */
const FARGATE_REQUIRED_VARS = [
  'ECS_CLUSTER',
  'ECS_TASK_DEFINITION',
  'ECS_SUBNETS',
  'ECS_SECURITY_GROUP',
  'WSI_PUBLIC_URL',
] as const;

/**
 * Validate Fargate configuration
 * @throws Error if required variables are missing
 */
function validateFargateConfig(): void {
  const missing = FARGATE_REQUIRED_VARS.filter(v => !process.env[v]);

  if (missing.length > 0) {
    throw new Error(
      `Fargate mode requires the following environment variables:\n` +
      missing.map(v => `  - ${v}`).join('\n') +
      `\n\nSet USE_AWS_ORCHESTRATOR=false to use local Docker instead.`
    );
  }
}

// ============================================================================
// FACTORY
// ============================================================================

/**
 * Singleton container manager instance
 */
let instance: IContainerManager | null = null;

/**
 * Get the container manager instance
 *
 * Creates the appropriate manager based on environment variables.
 * The instance is lazily initialized on first access and cached.
 *
 * Selection order:
 * 1. LEO_CONTAINER=true            -> Process mode (auto-detected inside leo-worker)
 * 2. USE_PROCESS_ORCHESTRATOR=true -> Process mode (explicit override)
 * 3. USE_AWS_ORCHESTRATOR=true     -> Fargate mode
 * 4. (default)                     -> Docker mode
 *
 * @returns IContainerManager instance (Process, Fargate, or Docker)
 * @throws Error if required configuration is missing
 */
export function getContainerManager(): IContainerManager {
  if (instance) {
    return instance;
  }

  const inLeoContainer = process.env.LEO_CONTAINER === 'true';
  const useProcess = process.env.USE_PROCESS_ORCHESTRATOR === 'true';
  const useAWS = process.env.USE_AWS_ORCHESTRATOR === 'true';

  if (inLeoContainer || useProcess) {
    // Process mode - spawn stub as plain Python subprocess
    // Auto-detected when LEO_CONTAINER=true (inside leo-worker)
    // Or explicit via USE_PROCESS_ORCHESTRATOR=true
    const reason = inLeoContainer ? 'LEO_CONTAINER detected' : 'USE_PROCESS_ORCHESTRATOR';
    console.log(`🐍 Container Mode: PROCESS (subprocess) [${reason}]`);
    console.log(`   Stub: ${process.env.PROCESS_STUB_PATH || '(not set - will fail)'}`);

    instance = new ProcessContainerManager();
  } else if (useAWS) {
    // Validate Fargate configuration
    validateFargateConfig();

    console.log('🚀 Container Mode: AWS FARGATE (production)');
    console.log(`   Cluster: ${process.env.ECS_CLUSTER}`);
    console.log(`   Task Definition: ${process.env.ECS_TASK_DEFINITION}`);
    console.log(`   WSI URL: ${process.env.WSI_PUBLIC_URL}`);

    instance = new FargateContainerManager();
  } else {
    console.log('🐳 Container Mode: DOCKER LOCAL (development)');
    instance = new DockerContainerManager();
  }

  return instance;
}

/**
 * Check if running inside leo-worker container
 */
export function isInLeoContainer(): boolean {
  return process.env.LEO_CONTAINER === 'true';
}

/**
 * Check if running in Fargate mode
 */
export function isFargateMode(): boolean {
  return process.env.USE_AWS_ORCHESTRATOR === 'true';
}

/**
 * Check if running in Process mode (stub as subprocess)
 * Returns true if LEO_CONTAINER or USE_PROCESS_ORCHESTRATOR is set
 */
export function isProcessMode(): boolean {
  return process.env.LEO_CONTAINER === 'true' ||
         process.env.USE_PROCESS_ORCHESTRATOR === 'true';
}

/**
 * Reset the container manager instance (for testing)
 * @internal
 */
export function resetContainerManager(): void {
  instance = null;
}

// ============================================================================
// SHUTDOWN HOOKS
// ============================================================================

/**
 * Graceful shutdown handler
 */
async function handleShutdown(signal: string): Promise<void> {
  console.log(`Received ${signal} signal`);
  if (instance) {
    await instance.shutdown();
  }
  process.exit(0);
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
