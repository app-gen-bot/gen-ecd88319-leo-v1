import { IOrchestrator } from './factory';
import { storage } from '../storage/factory';
import { ecsManager } from './ecs-manager';
import { githubManager } from '../github-manager';

class AWSOrchestrator implements IOrchestrator {
  async startGeneration(requestId: number, userId: string, prompt: string): Promise<void> {
    console.log(`[AWS Orchestrator] Starting generation for request ${requestId}`);
    console.log(`[AWS Orchestrator] User: ${userId}, Prompt: ${prompt.substring(0, 100)}...`);

    // Update status to generating
    await storage.updateGenerationRequest(requestId, {
      status: 'generating',
    });

    // Run generation in background
    this.runGeneration(requestId, userId, prompt);
  }

  private async runGeneration(requestId: number, userId: string, prompt: string): Promise<void> {
    let taskArn: string | undefined;

    try {
      console.log(`[AWS Orchestrator] Launching ECS task for request ${requestId}...`);

      // 1. Start ECS task
      taskArn = await ecsManager.runGeneration(requestId, prompt);

      // 2. Wait for task to complete (60 minute timeout)
      const success = await ecsManager.waitForCompletion(requestId, 3600000);

      if (!success) {
        // Check if WebSocket session has a specific error message
        const { wsManager } = await import('../websocket-server.js');
        const jobId = `job_${requestId}`;
        const session = wsManager.getSession(jobId);
        const detailedError = session?.error || 'ECS task failed or timed out';
        throw new Error(detailedError);
      }

      // 3. Extract files from S3 (uploaded by the ECS task)
      const appPath = await ecsManager.extractFiles(requestId, taskArn);
      console.log(`[AWS Orchestrator] Files extracted from S3 to: ${appPath}`);

      // 4. Create GitHub repository (if enabled)
      let githubUrl: string | undefined;
      if (githubManager.isEnabled()) {
        try {
          console.log(`[AWS Orchestrator] Creating GitHub repository for request ${requestId}...`);

          const repo = await githubManager.createRepoForGeneration({
            generationId: requestId,
            userId: userId,
            localPath: appPath,
          });

          githubUrl = repo.url;
          console.log(`[AWS Orchestrator] GitHub repository created: ${githubUrl}`);
        } catch (error) {
          // Log but don't fail the generation if GitHub repo creation fails
          console.error(`[AWS Orchestrator] Failed to create GitHub repo (non-fatal):`, error);
        }
      } else {
        console.log(`[AWS Orchestrator] GitHub integration disabled - skipping repo creation`);
      }

      // 5. Update status to completed
      await storage.updateGenerationRequest(requestId, {
        status: 'completed',
        completedAt: new Date().toISOString(),
        githubUrl,
      });

      // 6. Broadcast completion to WebSocket clients
      const { wsManager } = await import('../websocket-server.js');
      wsManager.broadcastToClients(requestId.toString(), {
        type: 'status_change',
        status: 'completed',
        githubUrl,
      });

      console.log(`[AWS Orchestrator] Generation completed for request ${requestId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[AWS Orchestrator] Generation failed for request ${requestId}:`, errorMessage);
      console.error(`[AWS Orchestrator] Version: ${process.env.APP_VERSION || 'dev'}`);

      // Get task logs for debugging
      if (taskArn) {
        const logs = await ecsManager.getContainerLogs(taskArn);
        console.error(`[AWS Orchestrator] Task logs:\n${logs}`);
      }

      // Update status to failed
      await storage.updateGenerationRequest(requestId, {
        status: 'failed',
        completedAt: new Date().toISOString(),
        errorMessage,
      });
    } finally {
      // Clean up task
      if (taskArn) {
        await ecsManager.stopContainer(taskArn);
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

export const awsOrchestrator = new AWSOrchestrator();
