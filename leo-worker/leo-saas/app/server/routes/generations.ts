import express, { Request, Response } from 'express';
import { storage } from '../lib/storage/factory';
import { authMiddleware } from '../middleware/auth';
import { validationRules, handleValidationErrors } from '../middleware/validation';
import { createGenerationRequestSchema } from '../../shared/schema.zod';
import { fileManager } from '../lib/orchestrator/file-manager';
import { dockerManager } from '../lib/orchestrator/docker-manager';
import { flyDeploymentManager } from '../lib/fly-deployment-manager';
import { wsManager } from '../lib/websocket-server';

const router = express.Router();

// ============================================================================
// POST /api/generations - Create new generation request
// ============================================================================
router.post(
  '/api/generations',
  authMiddleware,
  validationRules.generationPrompt,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      console.log('[Generations Route] Create request for user:', req.user?.id);

      // Validate request body with Zod schema
      const validated = createGenerationRequestSchema.parse(req.body);

    // Create generation request with REPL mode support
    // For resume: appId, githubUrl, deploymentUrl are copied from original app
    const request = await storage.createGenerationRequest({
      userId: req.user!.id, // Supabase Auth UUID (string)
      appName: validated.appName, // User-friendly app name
      prompt: validated.prompt,
      status: 'queued',
      generationType: validated.generationType || 'new',
      // REPL Autonomous Mode fields
      mode: validated.mode || 'single-shot', // Default to single-shot for V1 compatibility
      initialPrompt: validated.prompt, // First prompt is the initial prompt
      maxIterations: validated.maxIterations || 10,
      currentIteration: 0,
      // Resume fields - copied from original app when resuming
      ...(validated.generationType === 'resume' ? {
        appId: validated.appId, // Same appId as original
        githubUrl: validated.githubUrl || null,
        deploymentUrl: validated.deploymentUrl || null,
      } : {}),
    });

    console.log('[Generations Route] Request created:', request.id, 'appId:', request.appId);
    console.log('[Generations Route] Mode:', request.mode, 'Max Iterations:', request.maxIterations);

    // NOTE: We no longer start the orchestrator here.
    // The frontend will start generation via WebSocket (WSI) with the requestId.
    // This keeps REST for CRUD and WebSocket for real-time generation.

    res.status(201).json(request);
  } catch (error) {
    // Handle Zod validation errors
    if (error && typeof error === 'object' && 'errors' in error) {
      const zodError = error as any;
      const firstError = zodError.errors?.[0];
      const errorMessage = firstError?.message || 'Invalid request data';
      console.error('[Generations Route] Validation error:', errorMessage);
      return res.status(400).json({ error: errorMessage });
    }

      const errorMessage = error instanceof Error ? error.message : 'Failed to create generation request';
      console.error('[Generations Route] Create error:', errorMessage);
      res.status(400).json({ error: errorMessage });
    }
  }
);

// ============================================================================
// GET /api/apps - Get user's apps for Resume dropdown
// ============================================================================
router.get('/api/apps', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      console.log('[Apps Route] No authenticated user, returning empty list');
      return res.status(200).json([]);
    }

    console.log('[Apps Route] Get apps for user:', req.user.id);

    const apps = await storage.getUserApps(req.user.id);

    console.log('[Apps Route] Found apps:', apps.length);
    res.status(200).json(apps);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get user apps';
    console.error('[Apps Route] Error:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

// ============================================================================
// GET /api/generations - List user's generation requests
// ============================================================================
router.get('/api/generations', authMiddleware, async (req: Request, res: Response) => {
  try {
    // If no user is authenticated, return empty array
    if (!req.user) {
      console.log('[Generations Route] No authenticated user, returning empty list');
      return res.status(200).json([]);
    }

    console.log('[Generations Route] List requests for user:', req.user.id);

    const requests = await storage.getGenerationRequests(req.user.id);

    console.log('[Generations Route] Found requests:', requests.length);
    res.status(200).json(requests);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to list generation requests';
    console.error('[Generations Route] List error:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

// ============================================================================
// GET /api/generations/:id - Get specific generation request
// ============================================================================
router.get('/api/generations/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    console.log('[Generations Route] Get request:', requestId);

    const request = await storage.getGenerationRequestById(requestId);

    if (!request) {
      return res.status(404).json({ error: 'Generation request not found' });
    }

    // Verify user owns this request
    if (request.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Generation request not found' });
    }

    res.status(200).json(request);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get generation request';
    console.error('[Generations Route] Get error:', errorMessage);
    res.status(404).json({ error: errorMessage });
  }
});

// ============================================================================
// GET /api/generations/:id/logs - Get generation logs (real-time during generation)
// ============================================================================
router.get('/api/generations/:id/logs', authMiddleware, async (req: Request, res: Response) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    console.log('[Generations Route] Get logs for request:', requestId);

    const request = await storage.getGenerationRequestById(requestId);

    if (!request) {
      return res.status(404).json({ error: 'Generation request not found' });
    }

    // Verify user owns this request
    if (request.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Generation request not found' });
    }

    // Get logs from Docker manager (local mode only for now)
    const logs = await dockerManager.getGenerationLogs(requestId);

    res.status(200).json({
      requestId,
      status: request.status,
      logs,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get logs';
    console.error('[Generations Route] Get logs error:', errorMessage);
    res.status(400).json({ error: errorMessage });
  }
});

// ============================================================================
// POST /api/generations/:id/complete-test - Mark generation as completed (TEST ONLY)
// ============================================================================
router.post('/api/generations/:id/complete-test', authMiddleware, async (req: Request, res: Response) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    console.log('[Generations Route] Test completion for:', requestId);

    const request = await storage.getGenerationRequestById(requestId);

    if (!request) {
      return res.status(404).json({ error: 'Generation request not found' });
    }

    // Verify user owns this request
    if (request.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Generation request not found' });
    }

    // Mark as completed
    await storage.updateGenerationRequest(requestId, {
      status: 'completed',
      completedAt: new Date().toISOString(),
    });

    const updated = await storage.getGenerationRequestById(requestId);
    res.status(200).json(updated);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to mark as complete';
    console.error('[Generations Route] Complete test error:', errorMessage);
    res.status(400).json({ error: errorMessage });
  }
});

// ============================================================================
// POST /api/generations/:id/pause - Pause autonomous generation
// ============================================================================
router.post('/api/generations/:id/pause', authMiddleware, async (req: Request, res: Response) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    console.log('[Generations Route] Pause request:', requestId);

    const request = await storage.getGenerationRequestById(requestId);

    if (!request) {
      return res.status(404).json({ error: 'Generation request not found' });
    }

    // Verify user owns this request
    if (request.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Generation request not found' });
    }

    // Verify mode is autonomous
    if (request.mode !== 'autonomous') {
      return res.status(400).json({ error: 'Only autonomous mode generations can be paused' });
    }

    // Verify status is generating
    if (request.status !== 'generating') {
      return res.status(400).json({ error: 'Can only pause a generation that is currently running' });
    }

    // Send pause command to container via WebSocket manager
    wsManager.broadcastToClients(requestId.toString(), {
      type: 'pause_command',
    });

    // Update status to paused
    await storage.updateGenerationRequest(requestId, {
      status: 'paused',
    });

    const updated = await storage.getGenerationRequestById(requestId);
    console.log('[Generations Route] Generation paused:', requestId);
    res.status(200).json(updated);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to pause generation';
    console.error('[Generations Route] Pause error:', errorMessage);
    res.status(400).json({ error: errorMessage });
  }
});

// ============================================================================
// POST /api/generations/:id/resume - Resume paused generation
// ============================================================================
router.post('/api/generations/:id/resume', authMiddleware, async (req: Request, res: Response) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    console.log('[Generations Route] Resume request:', requestId);

    const request = await storage.getGenerationRequestById(requestId);

    if (!request) {
      return res.status(404).json({ error: 'Generation request not found' });
    }

    // Verify user owns this request
    if (request.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Generation request not found' });
    }

    // Verify status is paused
    if (request.status !== 'paused') {
      return res.status(400).json({ error: 'Can only resume a paused generation' });
    }

    // Send resume command to container via WebSocket manager
    wsManager.broadcastToClients(requestId.toString(), {
      type: 'resume_command',
    });

    // Update status back to generating
    await storage.updateGenerationRequest(requestId, {
      status: 'generating',
    });

    const updated = await storage.getGenerationRequestById(requestId);
    console.log('[Generations Route] Generation resumed:', requestId);
    res.status(200).json(updated);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to resume generation';
    console.error('[Generations Route] Resume error:', errorMessage);
    res.status(400).json({ error: errorMessage });
  }
});

// ============================================================================
// POST /api/generations/:id/cancel - Cancel active or paused generation
// ============================================================================
router.post('/api/generations/:id/cancel', authMiddleware, async (req: Request, res: Response) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    console.log('[Generations Route] Cancel request:', requestId);

    const request = await storage.getGenerationRequestById(requestId);

    if (!request) {
      return res.status(404).json({ error: 'Generation request not found' });
    }

    // Verify user owns this request
    if (request.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Generation request not found' });
    }

    // Verify status is generating or paused
    if (request.status !== 'generating' && request.status !== 'paused') {
      return res.status(400).json({ error: 'Can only cancel a generation that is generating or paused' });
    }

    // Send cancel command to container via WebSocket manager
    wsManager.broadcastToClients(requestId.toString(), {
      type: 'cancel_command',
    });

    // Update status to completed with cancellation message
    await storage.updateGenerationRequest(requestId, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      errorMessage: 'Generation cancelled by user',
    });

    const updated = await storage.getGenerationRequestById(requestId);
    console.log('[Generations Route] Generation cancelled:', requestId);
    res.status(200).json(updated);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to cancel generation';
    console.error('[Generations Route] Cancel error:', errorMessage);
    res.status(400).json({ error: errorMessage });
  }
});

// ============================================================================
// GET /api/generations/:id/download - Download generated app
// ============================================================================
router.get('/api/generations/:id/download', authMiddleware, async (req: Request, res: Response) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    console.log('[Generations Route] Download request:', requestId);

    const request = await storage.getGenerationRequestById(requestId);

    if (!request) {
      return res.status(404).json({ error: 'Generation request not found' });
    }

    // Verify user owns this request
    if (request.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Generation request not found' });
    }

    // Check if generation is completed
    if (request.status !== 'completed') {
      return res.status(400).json({ error: 'Generation is not yet completed' });
    }

    // Stream ZIP file directly from local filesystem
    console.log('[Generations Route] Streaming local file');
    await fileManager.createAndStreamZip(requestId, res);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to download';
    console.error('[Generations Route] Download error:', errorMessage);
    res.status(400).json({ error: errorMessage });
  }
});

// ============================================================================
// POST /api/generations/:id/deploy - Deploy app to Fly.io
// ============================================================================
router.post('/api/generations/:id/deploy', authMiddleware, async (req: Request, res: Response) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    console.log('[Generations Route] Deploy request:', requestId);

    // Check if Fly.io integration is enabled
    if (!flyDeploymentManager.isEnabled()) {
      return res.status(400).json({
        error: 'Fly.io deployment not configured. Please add FLY_API_TOKEN to AWS Secrets Manager.'
      });
    }

    const request = await storage.getGenerationRequestById(requestId);

    if (!request) {
      return res.status(404).json({ error: 'Generation request not found' });
    }

    // Verify user owns this request
    if (request.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Generation request not found' });
    }

    // Check if generation is completed
    if (request.status !== 'completed') {
      return res.status(400).json({ error: 'Generation must be completed before deploying' });
    }

    // Check if GitHub URL exists
    if (!request.githubUrl) {
      return res.status(400).json({
        error: 'GitHub repository not available. Ensure GitHub integration is enabled.'
      });
    }

    // Extract app name from GitHub URL
    const appName = request.githubUrl.split('/').pop() || `gen-${requestId}`;

    console.log('[Generations Route] Generation ID:', requestId);
    console.log('[Generations Route] GitHub URL:', request.githubUrl);
    console.log('[Generations Route] Extracted app name:', appName);
    console.log('[Generations Route] Starting deployment to Fly.io:', appName);

    // Trigger deployment (this can take several minutes)
    const result = await flyDeploymentManager.deployApp({
      githubUrl: request.githubUrl,
      appName,
      generationId: requestId,
    });

    if (result.success && result.url) {
      // Update generation request with deployment URL
      await storage.updateGenerationRequest(requestId, {
        deploymentUrl: result.url,
      });

      console.log('[Generations Route] Deployment successful:', result.url);

      return res.status(200).json({
        success: true,
        url: result.url,
        appName: result.appName,
        message: 'Deployment successful! Your app is now live.',
      });
    } else {
      console.error('[Generations Route] Deployment failed:', result.error);

      return res.status(500).json({
        success: false,
        error: result.error || 'Deployment failed',
        logs: result.logs,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to deploy';
    console.error('[Generations Route] Deploy error:', errorMessage);
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

export default router;
