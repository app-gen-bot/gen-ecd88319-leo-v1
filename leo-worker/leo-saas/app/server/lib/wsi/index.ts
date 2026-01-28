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

// Container Manager
export {
  DockerManager,
  getDockerManager,
  type ContainerSpawnConfig,
  type ContainerStatus,
} from './container-manager.js';

// Supabase Pool Manager
export {
  SupabasePoolManager,
  getSupabasePoolManager,
  type SupabaseCredentials,
  type SupabaseMode,
  type SupabasePoolProject,
} from './supabase-pool.js';
