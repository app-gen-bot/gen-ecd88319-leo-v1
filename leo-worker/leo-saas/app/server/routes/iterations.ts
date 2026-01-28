import express, { Request, Response } from 'express';
import { storage } from '../lib/storage/factory';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// ============================================================================
// GET /api/generations/:id/iterations - List iteration snapshots
// ============================================================================
router.get('/api/generations/:id/iterations', authMiddleware, async (req: Request, res: Response) => {
  try {
    const generationId = parseInt(req.params.id, 10);

    if (isNaN(generationId)) {
      return res.status(400).json({ error: 'Invalid generation ID' });
    }

    // Verify ownership
    const generation = await storage.getGenerationRequestById(generationId);
    if (!generation) {
      return res.status(404).json({ error: 'Generation not found' });
    }

    if (generation.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Generation not found' });
    }

    const snapshots = await storage.getIterationSnapshots(generationId);
    res.json(snapshots);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch iteration snapshots';
    console.error('[Iterations Route] List error:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

// ============================================================================
// GET /api/iterations/:snapshotId - Get specific iteration snapshot
// ============================================================================
router.get('/api/iterations/:snapshotId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const snapshotId = parseInt(req.params.snapshotId, 10);

    if (isNaN(snapshotId)) {
      return res.status(400).json({ error: 'Invalid snapshot ID' });
    }

    const snapshot = await storage.getIterationSnapshot(snapshotId);
    if (!snapshot) {
      return res.status(404).json({ error: 'Snapshot not found' });
    }

    // Verify ownership through generation request
    const generation = await storage.getGenerationRequestById(snapshot.generationRequestId);
    if (!generation) {
      return res.status(404).json({ error: 'Snapshot not found' });
    }

    if (generation.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Snapshot not found' });
    }

    res.json(snapshot);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch iteration snapshot';
    console.error('[Iterations Route] Get error:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

// ============================================================================
// POST /api/generations/:id/rollback - Rollback to specific iteration
// ============================================================================
router.post('/api/generations/:id/rollback', authMiddleware, async (req: Request, res: Response) => {
  try {
    const generationId = parseInt(req.params.id, 10);
    const { snapshotId } = req.body;

    if (isNaN(generationId)) {
      return res.status(400).json({ error: 'Invalid generation ID' });
    }

    if (!snapshotId || isNaN(parseInt(snapshotId, 10))) {
      return res.status(400).json({ error: 'snapshotId is required and must be a number' });
    }

    // Verify ownership
    const generation = await storage.getGenerationRequestById(generationId);
    if (!generation) {
      return res.status(404).json({ error: 'Generation not found' });
    }

    if (generation.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Generation not found' });
    }

    // Get snapshot
    const snapshot = await storage.getIterationSnapshot(parseInt(snapshotId, 10));
    if (!snapshot || snapshot.generationRequestId !== generationId) {
      return res.status(404).json({ error: 'Snapshot not found' });
    }

    // TODO: Implement actual rollback logic with orchestrator
    // For now, just update currentIteration in database
    await storage.updateGenerationRequest(generationId, {
      currentIteration: snapshot.iterationNumber,
    });

    console.log(`[Iterations Route] Rolled back generation ${generationId} to iteration ${snapshot.iterationNumber}`);

    res.json({
      success: true,
      message: `Rolled back to iteration ${snapshot.iterationNumber}`,
      snapshot,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to rollback';
    console.error('[Iterations Route] Rollback error:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

// ============================================================================
// DELETE /api/iterations/:snapshotId - Delete iteration snapshot
// ============================================================================
router.delete('/api/iterations/:snapshotId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const snapshotId = parseInt(req.params.snapshotId, 10);

    if (isNaN(snapshotId)) {
      return res.status(400).json({ error: 'Invalid snapshot ID' });
    }

    const snapshot = await storage.getIterationSnapshot(snapshotId);
    if (!snapshot) {
      return res.status(404).json({ error: 'Snapshot not found' });
    }

    // Verify ownership
    const generation = await storage.getGenerationRequestById(snapshot.generationRequestId);
    if (!generation) {
      return res.status(404).json({ error: 'Snapshot not found' });
    }

    if (generation.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Snapshot not found' });
    }

    await storage.deleteIterationSnapshot(snapshotId);

    console.log(`[Iterations Route] Deleted snapshot ${snapshotId}`);
    res.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete snapshot';
    console.error('[Iterations Route] Delete error:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
