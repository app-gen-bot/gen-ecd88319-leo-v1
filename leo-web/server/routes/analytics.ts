/**
 * Analytics API Routes - Admin-only endpoints for usage analytics
 *
 * All routes require admin role authentication.
 */

import { Router, Request, Response } from 'express';
import { analyticsService } from '../lib/analytics/analytics-service';

const router = Router();

// Middleware to check admin role
async function requireAdmin(req: Request, res: Response, next: Function) {
  // Get user from request (set by verifyAuth middleware)
  const user = (req as any).user;

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }

  // Check admin role from profile
  // For now, check if user has 'admin' or 'dev' role
  // The profile is fetched in the auth middleware or we need to fetch it here
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_URL || process.env.LEO_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.LEO_SUPABASE_SERVICE_ROLE_KEY || ''
  );

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Profile not found',
    });
  }

  if (profile.role !== 'admin' && profile.role !== 'dev') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Admin access required',
    });
  }

  next();
}

/**
 * GET /api/admin/analytics
 * Get full analytics dashboard data
 */
router.get('/', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const dashboard = await analyticsService.getDashboard();
    res.json({
      success: true,
      data: dashboard,
    });
  } catch (error: any) {
    console.error('[Analytics] Dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to fetch analytics',
    });
  }
});

/**
 * GET /api/admin/analytics/overview
 * Get overview metrics only
 */
router.get('/overview', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const overview = await analyticsService.getOverviewMetrics();
    res.json({
      success: true,
      data: overview,
    });
  } catch (error: any) {
    console.error('[Analytics] Overview error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to fetch overview metrics',
    });
  }
});

/**
 * GET /api/admin/analytics/generations/daily
 * Get generations per day time series
 */
router.get('/generations/daily', requireAdmin, async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const data = await analyticsService.getGenerationsByDay(Math.min(days, 90));
    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('[Analytics] Daily generations error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to fetch daily generations',
    });
  }
});

/**
 * GET /api/admin/analytics/generations/status
 * Get generation counts by status
 */
router.get('/generations/status', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const data = await analyticsService.getGenerationsByStatus();
    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('[Analytics] Status breakdown error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to fetch status breakdown',
    });
  }
});

/**
 * GET /api/admin/analytics/users/top
 * Get top users by generation count
 */
router.get('/users/top', requireAdmin, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const data = await analyticsService.getTopUsers(Math.min(limit, 50));
    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('[Analytics] Top users error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to fetch top users',
    });
  }
});

/**
 * GET /api/admin/analytics/generations/recent
 * Get recent generations activity feed
 */
router.get('/generations/recent', requireAdmin, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const data = await analyticsService.getRecentGenerations(Math.min(limit, 100));
    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('[Analytics] Recent generations error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to fetch recent generations',
    });
  }
});

export default router;
