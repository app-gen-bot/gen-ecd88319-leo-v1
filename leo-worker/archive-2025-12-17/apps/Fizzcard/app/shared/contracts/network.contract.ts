import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { networkGraphQuerySchema, superConnectorsQuerySchema } from '../schema.zod';

const c = initContract();

const errorResponseSchema = z.object({
  error: z.string(),
});

// ============================================================================
// Network Graph Schemas
// ============================================================================

const networkNodeSchema = z.object({
  id: z.number(),
  label: z.string(),
  email: z.string().email(),
  title: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  isVerified: z.boolean(),
  connectionCount: z.number(),
  fizzCoins: z.number(),
});

const networkLinkSchema = z.object({
  source: z.number(),
  target: z.number(),
  strength: z.number().min(1).max(5),
  createdAt: z.string().datetime(),
  note: z.string().optional().nullable(),
});

const networkGraphSchema = z.object({
  nodes: z.array(networkNodeSchema),
  links: z.array(networkLinkSchema),
});

// ============================================================================
// Network Statistics Schemas
// ============================================================================

const networkStatsSchema = z.object({
  userId: z.number(),
  directConnections: z.number(),
  secondDegreeConnections: z.number(),
  networkSize: z.number(),
  clusteringCoefficient: z.number(),
  averagePathLength: z.number(),
});

// ============================================================================
// Super Connector Schema
// ============================================================================

const superConnectorSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  title: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  isVerified: z.boolean(),
  connectionCount: z.number(),
  fizzCoins: z.number(),
  badges: z.array(z.string()),
});

// ============================================================================
// Network Contract
// ============================================================================

export const networkContract = c.router({
  getGraph: {
    method: 'GET',
    path: '/api/network/graph',
    query: networkGraphQuerySchema,
    responses: {
      200: networkGraphSchema,
      401: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Get network graph data with nodes and links (requires authentication)',
  },
  getStats: {
    method: 'GET',
    path: '/api/network/stats/:userId',
    pathParams: z.object({
      userId: z.coerce.number(),
    }),
    responses: {
      200: networkStatsSchema,
      401: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
    summary: 'Get network statistics for a user (requires authentication)',
  },
  getSuperConnectors: {
    method: 'GET',
    path: '/api/network/super-connectors',
    query: superConnectorsQuerySchema,
    responses: {
      200: z.array(superConnectorSchema),
      500: errorResponseSchema,
    },
    summary: 'Get top super connectors (users with highest connection counts)',
  },
});

// ============================================================================
// Type Exports
// ============================================================================

export type NetworkNode = z.infer<typeof networkNodeSchema>;
export type NetworkLink = z.infer<typeof networkLinkSchema>;
export type NetworkGraph = z.infer<typeof networkGraphSchema>;
export type NetworkStats = z.infer<typeof networkStatsSchema>;
export type SuperConnector = z.infer<typeof superConnectorSchema>;
