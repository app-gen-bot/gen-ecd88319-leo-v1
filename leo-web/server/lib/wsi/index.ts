/**
 * WSI Module - WebSocket Interface for Leo SaaS
 *
 * Browser-aware WSI Server that routes messages between:
 * - Browser (console UI) ←→ WSI Server ←→ Container (Leo agent)
 */

// WSI Server
export {
  WSIServer,
  getWSIServer,
  // Message types
  type WSIMessage,
  type ReadyMessage,
  type LogMessage,
  type ProgressMessage,
  type IterationCompleteMessage,
  type AllWorkCompleteMessage,
  type ErrorMessage,
  type DecisionPromptMessage,
  type StartGenerationMessage,
  type DecisionResponseMessage,
  type ControlCommandMessage,
} from './wsi-server.js';

// Container Manager Interface
export type {
  IContainerManager,
  ContainerSpawnConfig,
  ContainerStatus,
  ContainerEvents,
} from './container-manager-interface.js';

// Container Manager Factory (preferred)
export {
  getContainerManager,
  isFargateMode,
} from './container-manager-factory.js';

// Docker Container Manager (backwards compatibility)
export {
  DockerContainerManager,
  DockerManager, // @deprecated alias
  getDockerManager, // @deprecated - use getContainerManager
} from './container-manager.js';

// Supabase Pool Manager
export {
  SupabasePoolManager,
  getSupabasePoolManager,
  type SupabaseCredentials,
  type SupabaseMode,
  type SupabasePoolProject,
} from './supabase-pool.js';
