/**
 * Connections Routes
 *
 * Manage user connections with filtering and searching
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../lib/storage/factory';
import { authMiddleware } from '../middleware/auth';
import { connectionsQuerySchema } from '../../shared/schema.zod';

const router = Router();

/**
 * GET /api/connections
 * Get all my connections with filters
 */
router.get('/', authMiddleware(), async (req: Request, res: Response) => {
  try {
    console.log('[Connections Routes] Get all connections');

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Use centralized query schema from schema.zod.ts
    const query = connectionsQuerySchema.parse(req.query);
    const offset = (query.page - 1) * query.limit;

    // Parse tags
    const tags = query.tags ? query.tags.split(',').map(t => t.trim()) : undefined;

    // Get connections
    let connections = await storage.getConnectionsByUserId(req.user.id, {
      location: query.location,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      tags,
    });

    // Enrich with connected user details and exchange location
    const enrichedConnections = await Promise.all(
      connections.map(async (conn) => {
        const connectedUser = await storage.getUserById(conn.connectedUserId);
        let locationName = null;
        let metAt = null;

        if (conn.exchangeId) {
          const exchange = await storage.getContactExchangeById(conn.exchangeId);
          if (exchange) {
            locationName = exchange.locationName;
            metAt = exchange.metAt;
          }
        }

        return {
          ...conn,
          connectedUserName: connectedUser?.name || 'Unknown',
          connectedUserAvatar: connectedUser?.avatarUrl || null,
          connectedUserTitle: connectedUser?.title || null,
          connectedUserCompany: connectedUser?.company || null,
          locationName,
          metAt,
        };
      })
    );

    // Sort
    if (query.sortBy === 'recent') {
      enrichedConnections.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else if (query.sortBy === 'strength') {
      enrichedConnections.sort((a, b) => b.strengthScore - a.strengthScore);
    } else if (query.sortBy === 'name') {
      enrichedConnections.sort((a, b) => a.connectedUserName.localeCompare(b.connectedUserName));
    }

    // Manual pagination
    const total = enrichedConnections.length;
    const data = enrichedConnections.slice(offset, offset + query.limit);

    res.status(200).json({
      data,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    console.error('[Connections Routes] Get all error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/connections/:id
 * Get single connection by ID
 */
router.get('/:id', authMiddleware(), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`[Connections Routes] Get connection: ${id}`);

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const connection = await storage.getConnectionById(id);
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    // Check ownership
    if (connection.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view this connection' });
    }

    // Enrich with details
    const connectedUser = await storage.getUserById(connection.connectedUserId);
    let locationName = null;
    let metAt = null;

    if (connection.exchangeId) {
      const exchange = await storage.getContactExchangeById(connection.exchangeId);
      if (exchange) {
        locationName = exchange.locationName;
        metAt = exchange.metAt;
      }
    }

    const enrichedConnection = {
      ...connection,
      connectedUserName: connectedUser?.name || 'Unknown',
      connectedUserAvatar: connectedUser?.avatarUrl || null,
      connectedUserTitle: connectedUser?.title || null,
      connectedUserCompany: connectedUser?.company || null,
      locationName,
      metAt,
    };

    res.status(200).json(enrichedConnection);
  } catch (error) {
    console.error('[Connections Routes] Get connection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/connections/:id
 * Update connection (relationship note, tags, strength score)
 */
router.put('/:id', authMiddleware(), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`[Connections Routes] Update connection: ${id}`);

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Check if connection exists
    const existingConnection = await storage.getConnectionById(id);
    if (!existingConnection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    // Check ownership
    if (existingConnection.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this connection' });
    }

    // Validate request body
    const updateSchema = z.object({
      relationshipNote: z.string().optional(),
      tags: z.array(z.string()).optional(),
      strengthScore: z.number().min(0).max(100).optional(),
    });

    const validated = updateSchema.parse(req.body);

    // Update connection
    const updatedConnection = await storage.updateConnection(id, validated);
    if (!updatedConnection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    console.log(`[Connections Routes] Connection updated: ${id}`);

    res.status(200).json(updatedConnection);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }

    console.error('[Connections Routes] Update connection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/connections/:id
 * Remove connection
 */
router.delete('/:id', authMiddleware(), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`[Connections Routes] Delete connection: ${id}`);

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Check if connection exists
    const existingConnection = await storage.getConnectionById(id);
    if (!existingConnection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    // Check ownership
    if (existingConnection.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this connection' });
    }

    // Delete connection
    const deleted = await storage.deleteConnection(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    console.log(`[Connections Routes] Connection deleted: ${id}`);

    res.status(200).json({ message: 'Connection deleted successfully' });
  } catch (error) {
    console.error('[Connections Routes] Delete connection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
