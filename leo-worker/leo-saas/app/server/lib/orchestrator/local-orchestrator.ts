import { IOrchestrator } from './factory';
import { storage } from '../storage/factory';
import { dockerManager } from './docker-manager';
import { fileManager } from './file-manager';
import { githubManager } from '../github-manager';
import { wsManager } from '../websocket-server';

class LocalOrchestrator implements IOrchestrator {
  async startGeneration(requestId: number, userId: string, prompt: string, mode?: string): Promise<void> {
    console.log(`[Local Orchestrator] Starting generation for request ${requestId}`);
    console.log(`[Local Orchestrator] User: ${userId}, Prompt: ${prompt.substring(0, 100)}..., Mode: ${mode || 'autonomous'}`);

    // Update status to generating
    await storage.updateGenerationRequest(requestId, {
      status: 'generating',
    });

    // Run generation in background
    this.runGeneration(requestId, userId, prompt, mode);
  }

  private async runGeneration(requestId: number, userId: string, prompt: string, mode?: string): Promise<void> {
    let containerId: string | undefined;

    try {
      console.log(`[Local Orchestrator] Running Docker generation for request ${requestId}...`);

      // 1. Start Docker container
      containerId = await dockerManager.runGeneration(requestId, prompt, mode);

      // 2. Wait for container to complete (1 hour timeout)
      const success = await dockerManager.waitForCompletion(containerId, requestId, 3600000);

      if (!success) {
        throw new Error('Container failed or timed out');
      }

      // 3. Extract files from container
      const appPath = await dockerManager.extractFiles(requestId, containerId);
      console.log(`[Local Orchestrator] Files extracted to: ${appPath}`);

      // 4. Create GitHub repository (if enabled)
      let githubUrl: string | undefined;
      if (githubManager.isEnabled()) {
        try {
          console.log(`[Local Orchestrator] Creating GitHub repository for request ${requestId}...`);

          const repo = await githubManager.createRepoForGeneration({
            generationId: requestId,
            userId: userId,
            localPath: appPath,
          });

          githubUrl = repo.url;
          console.log(`[Local Orchestrator] GitHub repository created: ${githubUrl}`);
        } catch (error) {
          // Log but don't fail the generation if GitHub repo creation fails
          console.error(`[Local Orchestrator] Failed to create GitHub repo (non-fatal):`, error);
        }
      } else {
        console.log(`[Local Orchestrator] GitHub integration disabled - skipping repo creation`);
      }

      // 5. Update status to completed
      await storage.updateGenerationRequest(requestId, {
        status: 'completed',
        completedAt: new Date().toISOString(),
        githubUrl,
      });

      // 8. Broadcast status change to connected clients (triggers UI refresh)
      wsManager.broadcastToClients(requestId.toString(), {
        type: 'status_change',
        status: 'completed',
      });

      console.log(`[Local Orchestrator] Generation completed for request ${requestId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Local Orchestrator] Generation failed for request ${requestId}:`, errorMessage);

      // Get generation logs for debugging
      const logs = await dockerManager.getGenerationLogs(requestId);
      console.error(`[Local Orchestrator] Generation logs:\n${logs.join('\n')}`);

      // CRITICAL: Extract files even on failure/timeout before cleanup
      // This ensures we can recover partial work for debugging
      if (containerId) {
        try {
          console.log(`[Local Orchestrator] Attempting to extract files despite failure...`);
          const appPath = await dockerManager.extractFiles(requestId, containerId);
          console.log(`[Local Orchestrator] Files extracted to: ${appPath} (despite failure)`);

          // Try to create ZIP even from partial work
          try {
            await fileManager.saveZip(requestId);
            console.log(`[Local Orchestrator] ZIP created from partial work`);
          } catch (zipError) {
            console.error(`[Local Orchestrator] Failed to create ZIP from partial work:`, zipError);
          }
        } catch (extractError) {
          console.error(`[Local Orchestrator] Failed to extract files on error:`, extractError);
        }
      }

      // Update status to failed
      await storage.updateGenerationRequest(requestId, {
        status: 'failed',
        completedAt: new Date().toISOString(),
        errorMessage,
      });

      // Broadcast status change to connected clients (triggers UI refresh)
      wsManager.broadcastToClients(requestId.toString(), {
        type: 'status_change',
        status: 'failed',
      });
    } finally {
      // Clean up container (after file extraction)
      if (containerId) {
        await dockerManager.stopContainer(containerId, requestId);
      }
    }
  }

  async getGenerationStatus(requestId: number): Promise<{
    status: 'queued' | 'generating' | 'completed' | 'failed' | 'paused' | 'cancelled';
    errorMessage?: string;
  }> {
    const request = await storage.getGenerationRequestById(requestId);

    if (!request) {
      throw new Error('Generation request not found');
    }

    return {
      status: request.status,
      errorMessage: request.errorMessage || undefined,
    };
  }
}

export const localOrchestrator = new LocalOrchestrator();
