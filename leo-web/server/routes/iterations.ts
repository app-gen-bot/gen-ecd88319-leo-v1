import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// ============================================================================
// ITERATION SNAPSHOTS - DEPRECATED
// ============================================================================
// The iteration_snapshots table has been dropped as part of schema normalization.
// These endpoints now return 501 Not Implemented.
// If iteration tracking is needed in the future, a new design will be implemented.

// GET /api/generations/:id/iterations - List iteration snapshots (DEPRECATED)
router.get('/api/generations/:id/iterations', authMiddleware, async (_req: Request, res: Response) => {
  res.status(501).json({
    error: 'Iteration snapshots feature has been deprecated',
    message: 'The iteration_snapshots table has been removed. Iteration tracking will be redesigned in a future update.',
  });
});

// GET /api/iterations/:snapshotId - Get specific iteration snapshot (DEPRECATED)
router.get('/api/iterations/:snapshotId', authMiddleware, async (_req: Request, res: Response) => {
  res.status(501).json({
    error: 'Iteration snapshots feature has been deprecated',
    message: 'The iteration_snapshots table has been removed. Iteration tracking will be redesigned in a future update.',
  });
});

// POST /api/generations/:id/rollback - Rollback to specific iteration (DEPRECATED)
router.post('/api/generations/:id/rollback', authMiddleware, async (_req: Request, res: Response) => {
  res.status(501).json({
    error: 'Rollback feature has been deprecated',
    message: 'The iteration_snapshots table has been removed. Rollback functionality will be redesigned in a future update.',
  });
});

// DELETE /api/iterations/:snapshotId - Delete iteration snapshot (DEPRECATED)
router.delete('/api/iterations/:snapshotId', authMiddleware, async (_req: Request, res: Response) => {
  res.status(501).json({
    error: 'Iteration snapshots feature has been deprecated',
    message: 'The iteration_snapshots table has been removed. Iteration tracking will be redesigned in a future update.',
  });
});

export default router;
