import { localOrchestrator } from './local-orchestrator';

/**
 * @deprecated This orchestrator is legacy code.
 * New generation flow uses WSI (wsi-server.ts) + container-manager-factory.ts.
 * This remains for backward compatibility with some broadcast helpers.
 */
export interface IOrchestrator {
  startGeneration(requestId: number, userId: string, prompt: string, mode?: string): Promise<void>;
  getGenerationStatus(requestId: number): Promise<{
    status: 'queued' | 'generating' | 'completed' | 'failed' | 'paused' | 'cancelled';
    errorMessage?: string;
  }>;
}

/**
 * @deprecated Use WSI + container-manager-factory for new code.
 */
export function createOrchestrator(): IOrchestrator {
  // Note: AWS/Fargate orchestration now handled by WSI + FargateContainerManager
  // This legacy orchestrator only supports local Docker mode
  return localOrchestrator;
}

export const orchestrator = createOrchestrator();
