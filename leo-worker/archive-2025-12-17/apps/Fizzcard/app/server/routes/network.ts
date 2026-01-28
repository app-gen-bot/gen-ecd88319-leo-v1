/**
 * Network Graph Routes
 *
 * Endpoints for network visualization and statistics
 */

import { Router } from 'express';
import { storage } from '../lib/storage/factory';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * GET /api/network/graph
 * Get network graph data with nodes and links
 * Query params:
 * - depth: number (1-5, default: 2) - How many degrees of separation to include
 * - userId: number (optional) - Center the graph on a specific user (ego network)
 */
router.get('/graph', authMiddleware(), async (req, res) => {
  try {
    console.log('[Network Routes] GET /api/network/graph', req.query);

    // Parse and validate depth
    const depthParam = req.query.depth as string | undefined;
    const depth = depthParam ? parseInt(depthParam) : 2;

    if (isNaN(depth) || depth < 1 || depth > 5) {
      console.log('[Network Routes] Invalid depth parameter:', depthParam);
      return res.status(400).json({ error: 'Depth must be between 1 and 5' });
    }

    // Parse userId if provided
    const userIdParam = req.query.userId as string | undefined;
    const userId = userIdParam ? parseInt(userIdParam) : undefined;

    if (userIdParam && (isNaN(userId!) || userId! <= 0)) {
      console.log('[Network Routes] Invalid userId parameter:', userIdParam);
      return res.status(400).json({ error: 'Invalid userId parameter' });
    }

    // Get network graph
    const graph = await storage.getNetworkGraph(depth, userId);

    console.log(`[Network Routes] Network graph retrieved: ${graph.nodes.length} nodes, ${graph.links.length} links`);
    res.json(graph);
  } catch (error) {
    console.error('[Network Routes] Error fetching network graph:', error);
    res.status(500).json({ error: 'Failed to fetch network graph' });
  }
});

/**
 * GET /api/network/stats/:userId
 * Get network statistics for a specific user
 * Path params:
 * - userId: number - User ID to get stats for
 */
router.get('/stats/:userId', authMiddleware(), async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    console.log(`[Network Routes] GET /api/network/stats/${userId}`);

    if (isNaN(userId) || userId <= 0) {
      console.log('[Network Routes] Invalid userId parameter:', req.params.userId);
      return res.status(400).json({ error: 'Invalid userId parameter' });
    }

    // Get network stats
    const stats = await storage.getNetworkStats(userId);

    console.log(`[Network Routes] Network stats retrieved for user ${userId}:`, stats);
    res.json(stats);
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      console.log('[Network Routes] User not found:', req.params.userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.error('[Network Routes] Error fetching network stats:', error);
    res.status(500).json({ error: 'Failed to fetch network stats' });
  }
});

/**
 * GET /api/network/super-connectors
 * Get top super connectors (users with highest connection counts)
 * Query params:
 * - limit: number (1-50, default: 10) - Maximum number of results
 */
router.get('/super-connectors', async (req, res) => {
  try {
    console.log('[Network Routes] GET /api/network/super-connectors', req.query);

    // Parse and validate limit
    const limitParam = req.query.limit as string | undefined;
    const limit = limitParam ? parseInt(limitParam) : 10;

    if (isNaN(limit) || limit < 1 || limit > 50) {
      console.log('[Network Routes] Invalid limit parameter:', limitParam);
      return res.status(400).json({ error: 'Limit must be between 1 and 50' });
    }

    // Get super connectors
    const connectors = await storage.getSuperConnectors(limit);

    console.log(`[Network Routes] Super connectors retrieved: ${connectors.length} results`);
    res.json(connectors);
  } catch (error) {
    console.error('[Network Routes] Error fetching super connectors:', error);
    res.status(500).json({ error: 'Failed to fetch super connectors' });
  }
});

export default router;
