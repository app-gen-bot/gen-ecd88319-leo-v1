/**
 * Leo Remote - Shared Modules
 *
 * These modules are designed for reuse in Leo SaaS:
 * - DockerManager: Spawns and manages Leo containers
 * - WSIServer: Handles WSI Protocol communication with containers
 */

// Container management
export {
  DockerManager,
  getDockerManager,
  ContainerSpawnConfig,
  ContainerStatus,
  ContainerEvents,
} from './container-manager.js';

// WSI Protocol server
export {
  WSIServer,
  getWSIServer,
  WSIMessage,
  ReadyMessage,
  LogMessage,
  ProgressMessage,
  IterationCompleteMessage,
  AllWorkCompleteMessage,
  ErrorMessage,
  StartGenerationMessage,
  WSIServerEvents,
} from './wsi-server.js';
