import express, { Request, Response } from 'express';
import multer from 'multer';
import { storage } from '../lib/storage/factory';
import { authMiddleware } from '../middleware/auth';
import { validationRules, handleValidationErrors } from '../middleware/validation';
import { createGenerationRequestSchema, ATTACHMENT_LIMITS, AttachmentMetadata } from '../../shared/schema.zod';
import { fileManager } from '../lib/orchestrator/file-manager';
import { dockerManager } from '../lib/orchestrator/docker-manager';
import { flyDeploymentManager } from '../lib/fly-deployment-manager';
import { wsManager } from '../lib/websocket-server';
import { getSupabasePoolManager } from '../lib/wsi/supabase-pool';
import {
  uploadAttachment,
  validateFile,
  isAllowedFileType,
} from '../lib/attachment-storage';
import { isUserApproved, hasEnoughCredits, getCreditConfig } from './profile';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: ATTACHMENT_LIMITS.MAX_FILE_SIZE,
    files: ATTACHMENT_LIMITS.MAX_FILES,
  },
  fileFilter: (_req, file, cb) => {
    if (isAllowedFileType(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${file.originalname}`));
    }
  },
});

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
      const userId = req.user!.id; // Supabase Auth UUID (string)

      // Check if user is approved (gated beta)
      const approved = await isUserApproved(userId);
      if (!approved) {
        console.log(`[Generations Route] User ${userId} is not approved for generation`);
        return res.status(403).json({
          error: 'Your account is pending approval. Please wait for access to be granted.',
          code: 'NOT_APPROVED',
        });
      }

      // Check credits balance
      const creditConfig = await getCreditConfig();
      const creditsNeeded = creditConfig.creditsPerGeneration;
      const hasCredits = await hasEnoughCredits(userId, creditsNeeded);

      if (!hasCredits) {
        console.log(`[Generations Route] User ${userId} has insufficient credits (needs ${creditsNeeded})`);
        return res.status(402).json({
          error: 'Insufficient credits to start a generation. Please contact support to add credits.',
          code: 'INSUFFICIENT_CREDITS',
          creditsNeeded,
        });
      }

      // Check concurrency limit
      const poolManager = getSupabasePoolManager();
      const maxConcurrent = poolManager.getMaxConcurrentPerUser();
      const activeCount = await storage.countActiveGenerations(userId);

      if (activeCount >= maxConcurrent) {
        console.log(`[Generations Route] Concurrency limit reached for user ${userId}: ${activeCount}/${maxConcurrent}`);
        return res.status(429).json({
          error: `You have ${activeCount} active generation${activeCount !== 1 ? 's' : ''} running. ` +
            `Maximum concurrent generations: ${maxConcurrent}. ` +
            `Please wait for a generation to complete before starting a new one.`,
          activeCount,
          maxConcurrent,
        });
      }

      // Find or create the app
      // For new: find by name or create new app
      // For resume: find by appId (uuid)
      let app;
      if (validated.generationType === 'resume' && validated.appId) {
        // Resume: find app by UUID
        app = await storage.getAppByUuid(validated.appId);
        if (!app) {
          return res.status(404).json({ error: 'App not found for resume' });
        }
        // Verify ownership
        if (app.userId !== userId) {
          return res.status(403).json({ error: 'Not authorized to resume this app' });
        }
      } else {
        // New generation: find existing app by name or create new
        app = await storage.getAppByUserAndName(userId, validated.appName);
        if (!app) {
          // Create new app
          console.log('[Generations Route] Creating new app:', validated.appName);
          app = await storage.createApp({
            userId,
            appName: validated.appName,
            githubUrl: null,
            deploymentUrl: null,
            cumulativeCost: null,
          });
          console.log('[Generations Route] App created:', app.id, 'UUID:', app.appUuid);
        } else {
          console.log('[Generations Route] Using existing app:', app.id, 'UUID:', app.appUuid);
        }
      }

      // Create generation request linked to the app
      // Note: userId, appName, githubUrl, deploymentUrl are now derived from apps table via appRefId
      const request = await storage.createGenerationRequest({
        appRefId: app.id, // Link to apps table - all app info derived from here
        prompt: validated.prompt,
        status: 'queued',
        generationType: validated.generationType || 'new',
        // REPL Autonomous Mode fields
        mode: validated.mode || 'single-shot', // Default to single-shot for V1 compatibility
        initialPrompt: validated.prompt, // First prompt is the initial prompt
        maxIterations: validated.maxIterations || 10,
        currentIteration: 0,
      });

      console.log('[Generations Route] Request created:', request.id, 'appRefId:', request.appRefId);
      console.log('[Generations Route] Mode:', request.mode, 'Max Iterations:', request.maxIterations);

      // NOTE: We no longer start the orchestrator here.
      // The frontend will start generation via WebSocket (WSI) with the requestId.
      // This keeps REST for CRUD and WebSocket for real-time generation.

      // Return response with app info merged in for API compatibility
      res.status(201).json({
        ...request,
        userId: app.userId,
        appName: app.appName,
        appUuid: app.appUuid,
        githubUrl: app.githubUrl,
        deploymentUrl: app.deploymentUrl,
      });
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
// POST /api/generations/with-attachments - Create generation with file attachments
// ============================================================================
// This route handles multipart/form-data requests with files
router.post(
  '/api/generations/with-attachments',
  authMiddleware,
  upload.array('files', ATTACHMENT_LIMITS.MAX_FILES),
  async (req: Request, res: Response) => {
    try {
      console.log('[Generations Route] Create request with attachments for user:', req.user?.id);

      // Parse JSON body from 'data' field (multipart sends JSON as string)
      let bodyData;
      try {
        bodyData = JSON.parse(req.body.data || '{}');
      } catch {
        return res.status(400).json({ error: 'Invalid JSON in data field' });
      }

      // Validate request body with Zod schema
      const validated = createGenerationRequestSchema.parse(bodyData);
      const userId = req.user!.id;

      // Check if user is approved (gated beta)
      const approved = await isUserApproved(userId);
      if (!approved) {
        console.log(`[Generations Route] User ${userId} is not approved for generation`);
        return res.status(403).json({
          error: 'Your account is pending approval. Please wait for access to be granted.',
          code: 'NOT_APPROVED',
        });
      }

      // Check credits balance
      const creditConfig = await getCreditConfig();
      const creditsNeeded = creditConfig.creditsPerGeneration;
      const hasCredits = await hasEnoughCredits(userId, creditsNeeded);

      if (!hasCredits) {
        console.log(`[Generations Route] User ${userId} has insufficient credits (needs ${creditsNeeded})`);
        return res.status(402).json({
          error: 'Insufficient credits to start a generation. Please contact support to add credits.',
          code: 'INSUFFICIENT_CREDITS',
          creditsNeeded,
        });
      }

      // Check concurrency limit
      const poolManager = getSupabasePoolManager();
      const maxConcurrent = poolManager.getMaxConcurrentPerUser();
      const activeCount = await storage.countActiveGenerations(userId);

      if (activeCount >= maxConcurrent) {
        console.log(`[Generations Route] Concurrency limit reached for user ${userId}: ${activeCount}/${maxConcurrent}`);
        return res.status(429).json({
          error: `You have ${activeCount} active generation${activeCount !== 1 ? 's' : ''} running. ` +
            `Maximum concurrent generations: ${maxConcurrent}. ` +
            `Please wait for a generation to complete before starting a new one.`,
          activeCount,
          maxConcurrent,
        });
      }

      // Validate files
      const files = (req.files as Express.Multer.File[]) || [];
      let totalSize = 0;

      for (const file of files) {
        const validation = validateFile(file, []);
        if (!validation.valid) {
          return res.status(400).json({ error: validation.error });
        }
        totalSize += file.size;
      }

      if (totalSize > ATTACHMENT_LIMITS.MAX_TOTAL_SIZE) {
        return res.status(400).json({
          error: `Total file size ${(totalSize / 1024 / 1024).toFixed(2)}MB exceeds limit of ${ATTACHMENT_LIMITS.MAX_TOTAL_SIZE / 1024 / 1024}MB`,
        });
      }

      // Find or create the app (same logic as main route)
      let app;
      if (validated.generationType === 'resume' && validated.appId) {
        app = await storage.getAppByUuid(validated.appId);
        if (!app) {
          return res.status(404).json({ error: 'App not found for resume' });
        }
        if (app.userId !== userId) {
          return res.status(403).json({ error: 'Not authorized to resume this app' });
        }
      } else {
        app = await storage.getAppByUserAndName(userId, validated.appName);
        if (!app) {
          console.log('[Generations Route] Creating new app:', validated.appName);
          app = await storage.createApp({
            userId,
            appName: validated.appName,
            githubUrl: null,
            deploymentUrl: null,
            cumulativeCost: null,
          });
          console.log('[Generations Route] App created:', app.id, 'UUID:', app.appUuid);
        }
      }

      // Create generation request first
      const request = await storage.createGenerationRequest({
        appRefId: app.id,
        prompt: validated.prompt,
        status: 'queued',
        generationType: validated.generationType || 'new',
        mode: validated.mode || 'single-shot',
        initialPrompt: validated.prompt,
        maxIterations: validated.maxIterations || 10,
        currentIteration: 0,
      });

      console.log('[Generations Route] Request created:', request.id, 'with', files.length, 'files');

      // Upload files to Supabase Storage
      const attachments: AttachmentMetadata[] = [];

      for (const file of files) {
        try {
          const metadata = await uploadAttachment(request.id, {
            originalname: file.originalname,
            buffer: file.buffer,
            mimetype: file.mimetype,
            size: file.size,
          });
          attachments.push(metadata);
          console.log('[Generations Route] Uploaded:', file.originalname);
        } catch (uploadError) {
          console.error('[Generations Route] Failed to upload file:', file.originalname, uploadError);
          // Continue with other files, but log the error
        }
      }

      // Update generation request with attachments metadata
      if (attachments.length > 0) {
        await storage.updateGenerationRequest(request.id, {
          attachments,
        });
        console.log('[Generations Route] Updated request with', attachments.length, 'attachments');
      }

      // Return response with app info and attachments
      res.status(201).json({
        ...request,
        userId: app.userId,
        appName: app.appName,
        appUuid: app.appUuid,
        githubUrl: app.githubUrl,
        deploymentUrl: app.deploymentUrl,
        attachments,
      });
    } catch (error) {
      // Handle multer errors
      if (error instanceof multer.MulterError) {
        console.error('[Generations Route] Multer error:', error.message);
        return res.status(400).json({ error: `File upload error: ${error.message}` });
      }

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
// GET /api/apps/:id/generations - Get all generations for a specific app
// ============================================================================
router.get('/api/apps/:id/generations', authMiddleware, async (req: Request, res: Response) => {
  try {
    const appId = parseInt(req.params.id, 10);
    console.log('[Apps Route] Get generations for app:', appId, 'user:', req.user?.id);

    // Get the app to verify ownership
    const app = await storage.getAppById(appId);

    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    // Verify user owns this app
    if (app.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized to view this app' });
    }

    // Get all generations for this app
    const generations = await storage.getGenerationsByAppId(appId);

    console.log('[Apps Route] Found generations:', generations.length);
    res.status(200).json(generations);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get app generations';
    console.error('[Apps Route] Get generations error:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

// ============================================================================
// DELETE /api/apps/:id - Delete an app and all its generation requests
// ============================================================================
router.delete('/api/apps/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const appId = parseInt(req.params.id, 10);
    console.log('[Apps Route] Delete app:', appId, 'for user:', req.user?.id);

    // Get the app to verify ownership
    const app = await storage.getAppById(appId);

    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    // Verify user owns this app
    if (app.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized to delete this app' });
    }

    // Delete the app (cascade deletes generation_requests)
    const deleted = await storage.deleteApp(appId);

    if (!deleted) {
      return res.status(500).json({ error: 'Failed to delete app' });
    }

    console.log('[Apps Route] App deleted:', appId);
    res.status(200).json({ success: true, message: 'App deleted successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete app';
    console.error('[Apps Route] Delete error:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

// ============================================================================
// GET /api/generations/active - Get user's active generations and concurrency info
// ============================================================================
router.get('/api/generations/active', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userId = req.user.id;
    const poolManager = getSupabasePoolManager();

    const [activeGenerations, activeCount] = await Promise.all([
      storage.getActiveGenerations(userId),
      storage.countActiveGenerations(userId),
    ]);

    const maxConcurrent = poolManager.getMaxConcurrentPerUser();
    const availablePools = poolManager.getAvailableCount();
    const poolSize = poolManager.getPoolSize();

    res.status(200).json({
      active: activeGenerations,
      activeCount,
      maxConcurrent,
      canStartNew: activeCount < maxConcurrent && availablePools > 0,
      poolInfo: {
        available: availablePools,
        total: poolSize,
        mode: poolManager.getMode(),
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get active generations';
    console.error('[Generations Route] Active generations error:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

// ============================================================================
// GET /api/generations - List user's generation requests
// ============================================================================
// Role-based filtering:
// - 'user' role: Only sees apps assigned to them via app_assignments table
// - 'user_plus', 'dev', 'admin': Sees their own apps
router.get('/api/generations', authMiddleware, async (req: Request, res: Response) => {
  try {
    // If no user is authenticated, return empty array
    if (!req.user) {
      console.log('[Generations Route] No authenticated user, returning empty list');
      return res.status(200).json([]);
    }

    const userRole = (req.user.role || 'user') as import('../../shared/schema.zod').UserRole;
    console.log('[Generations Route] List requests for user:', req.user.id, 'role:', userRole);

    // Use role-aware query
    const requests = await storage.getGenerationRequestsByRole(req.user.id, userRole);

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
// POST /api/generations/:id/mark-failed - Mark stale GENERATING entries as failed
// ============================================================================
router.post('/api/generations/:id/mark-failed', authMiddleware, async (req: Request, res: Response) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    console.log('[Generations Route] Mark failed request:', requestId);

    const request = await storage.getGenerationRequestById(requestId);

    if (!request) {
      return res.status(404).json({ error: 'Generation request not found' });
    }

    // Verify user owns this request
    if (request.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Generation request not found' });
    }

    // Only allow marking generating/queued/paused as failed (stale cleanup)
    if (request.status !== 'generating' && request.status !== 'queued' && request.status !== 'paused') {
      return res.status(400).json({
        error: `Cannot mark as failed - status is already '${request.status}'`
      });
    }

    // Update status to failed with stale reason
    await storage.updateGenerationRequest(requestId, {
      status: 'failed',
      errorMessage: req.body.reason || 'Marked as failed by user (stale entry cleanup)',
    });

    const updated = await storage.getGenerationRequestById(requestId);
    console.log('[Generations Route] Generation marked as failed:', requestId);
    res.status(200).json(updated);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to mark as failed';
    console.error('[Generations Route] Mark failed error:', errorMessage);
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
      // Update app with deployment URL (apps table now owns deployment info)
      await storage.updateApp(request.appRefId, {
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
