/**
 * Routes Index
 *
 * Combines all API routes into a single router
 */

import { Router } from 'express';
import authRoutes from './auth';
import fizzCardsRoutes from './fizzCards';
import socialLinksRoutes from './socialLinks';
import contactExchangesRoutes from './contactExchanges';
import connectionsRoutes from './connections';
import walletRoutes from './wallet';
import cryptoWalletRoutes from './cryptoWallet';
import leaderboardRoutes from './leaderboard';
import eventsRoutes from './events';
import introductionsRoutes from './introductions';
import badgesRoutes from './badges';
import networkRoutes from './network';
import seedRoutes from './seed';
import uploadRoutes from './upload';
import adminRoutes from './admin';

const router = Router();

// Mount all routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes); // Admin routes - mounted early to avoid middleware conflicts
router.use('/fizzcards', fizzCardsRoutes);
router.use('/', socialLinksRoutes); // Contains /fizzcards/:id/social-links and /social-links/:id
router.use('/contact-exchanges', contactExchangesRoutes);
router.use('/connections', connectionsRoutes);
router.use('/wallet', walletRoutes);
router.use(cryptoWalletRoutes); // Crypto wallet routes (blockchain)
router.use('/leaderboard', leaderboardRoutes);
router.use('/super-connectors', leaderboardRoutes); // Reuse leaderboard routes
router.use('/events', eventsRoutes);
router.use('/badges', badgesRoutes);
router.use(introductionsRoutes);
router.use('/network', networkRoutes);
router.use('/seed', seedRoutes); // Seed route - restricted to demo mode in production
router.use(uploadRoutes); // Upload routes for file handling

export default router;
