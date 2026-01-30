/**
 * App Assignment Routes
 *
 * Enables admins and devs to assign apps to users with 'user' role.
 * Users with 'user' role can only see apps explicitly assigned to them.
 */

import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { storage } from '../lib/storage/factory';
import { updateAppAssignmentSchema } from '../../shared/schema.zod';
import { z } from 'zod';

const router = Router();

// ============================================================================
// GET /api/assignments - List all assignments for current user (what apps are assigned to them)
// ============================================================================
router.get('/api/assignments', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    console.log('[Assignments Route] List assignments for user:', req.user.id);

    const assignments = await storage.getAppAssignments(req.user.id);

    console.log(`[Assignments Route] Found ${assignments.length} assignments`);
    res.status(200).json(assignments);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to list assignments';
    console.error('[Assignments Route] List error:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

// ============================================================================
// GET /api/apps/:appId/assignments - List all users assigned to an app
// Requires admin or dev role
// ============================================================================
router.get('/api/apps/:appId/assignments', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Only admins and devs can view app assignments
    if (req.user.role !== 'admin' && req.user.role !== 'dev') {
      return res.status(403).json({ error: 'Admin or dev role required' });
    }

    const appId = parseInt(req.params.appId, 10);
    if (isNaN(appId)) {
      return res.status(400).json({ error: 'Invalid app ID' });
    }

    console.log('[Assignments Route] List assignments for app:', appId);

    // Verify the app exists and belongs to this user (or user is admin)
    const app = await storage.getAppById(appId);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    // Devs can only manage their own apps, admins can manage any
    if (req.user.role !== 'admin' && app.userId !== req.user.id) {
      return res.status(403).json({ error: 'You can only manage assignments for your own apps' });
    }

    const assignments = await storage.getAppAssignmentsByApp(appId);

    console.log(`[Assignments Route] Found ${assignments.length} assignments for app`);
    res.status(200).json(assignments);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to list app assignments';
    console.error('[Assignments Route] List app assignments error:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

// ============================================================================
// POST /api/apps/:appId/assignments - Assign an app to a user
// Requires admin or dev role
// ============================================================================
router.post('/api/apps/:appId/assignments', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Only admins and devs can assign apps
    if (req.user.role !== 'admin' && req.user.role !== 'dev') {
      return res.status(403).json({ error: 'Admin or dev role required' });
    }

    const appId = parseInt(req.params.appId, 10);
    if (isNaN(appId)) {
      return res.status(400).json({ error: 'Invalid app ID' });
    }

    // Validate request body
    const assignmentInput = z.object({
      userId: z.string().uuid(),
      canResume: z.boolean().default(false),
    }).safeParse(req.body);

    if (!assignmentInput.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: assignmentInput.error.format(),
      });
    }

    console.log('[Assignments Route] Assign app:', appId, 'to user:', assignmentInput.data.userId);

    // Verify the app exists and belongs to this user (or user is admin)
    const app = await storage.getAppById(appId);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    // Devs can only manage their own apps, admins can manage any
    if (req.user.role !== 'admin' && app.userId !== req.user.id) {
      return res.status(403).json({ error: 'You can only manage assignments for your own apps' });
    }

    // Create the assignment
    const assignment = await storage.createAppAssignment({
      appId,
      userId: assignmentInput.data.userId,
      assignedBy: req.user.id,
      canResume: assignmentInput.data.canResume,
    });

    console.log(`[Assignments Route] Assignment created: ID ${assignment.id}`);
    res.status(201).json(assignment);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create assignment';
    console.error('[Assignments Route] Create assignment error:', errorMessage);

    // Handle duplicate assignment error
    if (errorMessage.includes('unique') || errorMessage.includes('duplicate')) {
      return res.status(409).json({ error: 'User is already assigned to this app' });
    }

    res.status(500).json({ error: errorMessage });
  }
});

// ============================================================================
// PATCH /api/apps/:appId/assignments/:userId - Update an assignment
// Requires admin or dev role
// ============================================================================
router.patch('/api/apps/:appId/assignments/:userId', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Only admins and devs can update assignments
    if (req.user.role !== 'admin' && req.user.role !== 'dev') {
      return res.status(403).json({ error: 'Admin or dev role required' });
    }

    const appId = parseInt(req.params.appId, 10);
    const targetUserId = req.params.userId;

    if (isNaN(appId)) {
      return res.status(400).json({ error: 'Invalid app ID' });
    }

    // Validate request body
    const updateInput = updateAppAssignmentSchema.safeParse(req.body);

    if (!updateInput.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: updateInput.error.format(),
      });
    }

    console.log('[Assignments Route] Update assignment for app:', appId, 'user:', targetUserId);

    // Verify the app exists and belongs to this user (or user is admin)
    const app = await storage.getAppById(appId);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    // Devs can only manage their own apps, admins can manage any
    if (req.user.role !== 'admin' && app.userId !== req.user.id) {
      return res.status(403).json({ error: 'You can only manage assignments for your own apps' });
    }

    // Find the assignment
    const assignments = await storage.getAppAssignmentsByApp(appId);
    const existingAssignment = assignments.find(a => a.userId === targetUserId);

    if (!existingAssignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Update the assignment
    const updated = await storage.updateAppAssignment(existingAssignment.id, updateInput.data);

    if (!updated) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    console.log(`[Assignments Route] Assignment updated: ID ${updated.id}`);
    res.status(200).json(updated);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update assignment';
    console.error('[Assignments Route] Update assignment error:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

// ============================================================================
// DELETE /api/apps/:appId/assignments/:userId - Remove an assignment
// Requires admin or dev role
// ============================================================================
router.delete('/api/apps/:appId/assignments/:userId', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Only admins and devs can remove assignments
    if (req.user.role !== 'admin' && req.user.role !== 'dev') {
      return res.status(403).json({ error: 'Admin or dev role required' });
    }

    const appId = parseInt(req.params.appId, 10);
    const targetUserId = req.params.userId;

    if (isNaN(appId)) {
      return res.status(400).json({ error: 'Invalid app ID' });
    }

    console.log('[Assignments Route] Remove assignment for app:', appId, 'user:', targetUserId);

    // Verify the app exists and belongs to this user (or user is admin)
    const app = await storage.getAppById(appId);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    // Devs can only manage their own apps, admins can manage any
    if (req.user.role !== 'admin' && app.userId !== req.user.id) {
      return res.status(403).json({ error: 'You can only manage assignments for your own apps' });
    }

    // Delete the assignment
    await storage.deleteAppAssignment(appId, targetUserId);

    console.log(`[Assignments Route] Assignment removed`);
    res.status(204).send();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to remove assignment';
    console.error('[Assignments Route] Remove assignment error:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
