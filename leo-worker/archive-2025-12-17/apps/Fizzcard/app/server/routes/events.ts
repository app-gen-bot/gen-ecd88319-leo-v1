/**
 * Events Routes
 *
 * Event management and attendance tracking
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../lib/storage/factory';
import { authMiddleware } from '../middleware/auth';
import { fizzCoinService } from '../services/fizzcoin.service';
import { blockchainFizzCoinService } from '../services/blockchain/fizzcoin.service';
import { badgeService } from '../services/badge.service';
import { insertEventsSchema, eventsQuerySchema, eventAttendeesQuerySchema } from '../../shared/schema.zod';

const router = Router();

/**
 * GET /api/events
 * Get all events with optional filters and pagination
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    console.log('[Events Routes] Get all events');

    const query = eventsQuerySchema.parse(req.query);

    // Get all events (with isExclusive filter if provided)
    const allEvents = await storage.getEvents({
      isExclusive: query.exclusive,
    });

    // Apply additional filters
    let filteredEvents = allEvents;

    // Filter by upcoming (events that haven't ended yet)
    if (query.upcoming !== undefined) {
      const now = new Date().toISOString();
      if (query.upcoming) {
        filteredEvents = filteredEvents.filter((event) => event.endDate > now);
      } else {
        filteredEvents = filteredEvents.filter((event) => event.endDate <= now);
      }
    }

    // Filter by location (case-insensitive substring match)
    if (query.location) {
      const locationLower = query.location.toLowerCase();
      filteredEvents = filteredEvents.filter(
        (event) => event.location && event.location.toLowerCase().includes(locationLower)
      );
    }

    // Calculate pagination
    const total = filteredEvents.length;
    const totalPages = Math.ceil(total / query.limit);
    const startIndex = (query.page - 1) * query.limit;
    const endIndex = startIndex + query.limit;

    // Paginate results
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

    // Enrich events with creator details and attendee count
    const enrichedEvents = await Promise.all(
      paginatedEvents.map(async (event) => {
        const creator = await storage.getUserById(event.createdBy);
        const attendees = await storage.getEventAttendees(event.id);

        return {
          ...event,
          creatorName: creator?.name || 'Unknown Creator',
          attendeeCount: attendees.length,
        };
      })
    );

    res.status(200).json({
      data: enrichedEvents,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
    }

    console.error('[Events Routes] Get all events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/events/:id
 * Get single event by ID with enriched details
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`[Events Routes] Get event: ${id}`);

    const event = await storage.getEventById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Enrich event with creator details and attendee count
    const creator = await storage.getUserById(event.createdBy);
    const attendees = await storage.getEventAttendees(event.id);

    const enrichedEvent = {
      ...event,
      creatorName: creator?.name || 'Unknown Creator',
      attendeeCount: attendees.length,
    };

    res.status(200).json(enrichedEvent);
  } catch (error) {
    console.error('[Events Routes] Get event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/events
 * Create new event
 */
router.post('/', authMiddleware(), async (req: Request, res: Response) => {
  try {
    console.log('[Events Routes] Create event');

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const createSchema = insertEventsSchema.omit({ createdBy: true });
    const validated = createSchema.parse(req.body);

    const event = await storage.createEvent({
      ...validated,
      createdBy: req.user.id,
    });

    // Award event host badge
    try {
      await badgeService.awardEventHostBadge(req.user.id);
    } catch (error) {
      console.error('[Events Routes] Error awarding event host badge:', error);
      // Don't fail the request if badge award fails
    }

    console.log(`[Events Routes] Event created: ${event.id}`);

    res.status(201).json(event);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }

    console.error('[Events Routes] Create event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/events/:id
 * Update event
 */
router.put('/:id', authMiddleware(), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`[Events Routes] Update event: ${id}`);

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Validate request body
    const updateSchema = z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      location: z.string().optional(),
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      isExclusive: z.boolean().optional(),
      minFizzcoinRequired: z.number().min(0).optional(),
    });

    const validated = updateSchema.parse(req.body);

    // Get existing event to verify ownership
    const existing = await storage.getEventById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user is the creator or admin
    if (existing.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only event creator or admin can update events' });
    }

    // Update event
    const updated = await storage.updateEvent(id, validated);
    if (!updated) {
      return res.status(404).json({ error: 'Event not found' });
    }

    console.log(`[Events Routes] Event updated: ${id}`);

    res.status(200).json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }

    console.error('[Events Routes] Update event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/events/:id
 * Delete event
 */
router.delete('/:id', authMiddleware(), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`[Events Routes] Delete event: ${id}`);

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get existing event to verify ownership
    const existing = await storage.getEventById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user is the creator or admin
    if (existing.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only event creator or admin can delete events' });
    }

    // Delete event
    const deleted = await storage.deleteEvent(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Event not found' });
    }

    console.log(`[Events Routes] Event deleted: ${id}`);

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('[Events Routes] Delete event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/events/:id/attend
 * Register attendance for an event
 */
router.post('/:id/attend', authMiddleware(), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`[Events Routes] Attend event: ${id}`);

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const event = await storage.getEventById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if event is exclusive and user has enough FizzCoins
    if (event.isExclusive) {
      const canAfford = await fizzCoinService.canAfford(req.user.id, event.minFizzcoinRequired);
      if (!canAfford) {
        return res.status(403).json({
          error: `Insufficient FizzCoins. This event requires ${event.minFizzcoinRequired} FizzCoins.`,
        });
      }
    }

    // Create event attendee
    const attendee = await storage.createEventAttendee({
      eventId: id,
      userId: req.user.id,
    });

    console.log(`[Events Routes] User ${req.user.id} registered for event ${id}`);

    res.status(201).json(attendee);
  } catch (error) {
    console.error('[Events Routes] Attend event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/events/:id/checkin
 * Check in to an event
 */
router.post('/:id/checkin', authMiddleware(), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`[Events Routes] Check in to event: ${id}`);

    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const attendee = await storage.checkInToEvent(id, req.user.id);
    if (!attendee) {
      return res.status(404).json({ error: 'Attendance registration not found' });
    }

    // Award FizzCoins for check-in (blockchain-first, database fallback)
    const REWARD_AMOUNT = 20;
    let fizzcoinsEarned = REWARD_AMOUNT;

    // Try blockchain-first, fall back to database
    const userWallet = await storage.getCryptoWalletByUserId(req.user.id);
    if (userWallet && blockchainFizzCoinService.isBlockchainEnabled()) {
      console.log(`[Events] Awarding ${REWARD_AMOUNT} FIZZ to user ${req.user.id} for event check-in via blockchain`);
      try {
        const txResult = await blockchainFizzCoinService.creditReward(
          userWallet.walletAddress,
          REWARD_AMOUNT,
          'event_checkin'
        );

        // Update pending claim amount cache in database
        await storage.incrementPendingClaims(req.user.id, REWARD_AMOUNT);

        // Record transaction in database with blockchain metadata
        await storage.createFizzCoinTransaction({
          userId: req.user.id,
          amount: REWARD_AMOUNT,
          transactionType: 'reward_earned',
          txHash: txResult.hash,
          metadata: {
            eventId: id,
            reason: 'event_checkin',
            attendeeId: attendee.id,
          },
        });

        console.log(`[Events] Check-in reward credited on blockchain. TX: ${txResult.hash}`);
      } catch (error: any) {
        console.error(`[Events] Blockchain reward failed for user ${req.user.id}, falling back to database:`, error.message);
        // Fallback to database using the public service method
        fizzcoinsEarned = await fizzCoinService.awardEventCheckinReward(req.user.id, id);
      }
    } else {
      console.log(`[Events] Awarding FIZZ to user ${req.user.id} for event check-in via database (no crypto wallet)`);
      // Fallback to database for users without crypto wallets
      fizzcoinsEarned = await fizzCoinService.awardEventCheckinReward(req.user.id, id);
    }

    console.log(`[Events Routes] User ${req.user.id} checked in to event ${id}`);

    res.status(201).json({
      attendee,
      fizzcoinsEarned,
    });
  } catch (error) {
    console.error('[Events Routes] Check in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/events/:id/attendees
 * Get event attendees with pagination
 */
router.get('/:id/attendees', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`[Events Routes] Get attendees for event: ${id}`);

    // Validate query parameters
    const query = eventAttendeesQuerySchema.parse(req.query);

    // Check if event exists
    const event = await storage.getEventById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get all attendees for the event
    const allAttendees = await storage.getEventAttendees(id);

    // Calculate pagination
    const total = allAttendees.length;
    const totalPages = Math.ceil(total / query.limit);
    const startIndex = (query.page - 1) * query.limit;
    const endIndex = startIndex + query.limit;

    // Paginate results
    const paginatedAttendees = allAttendees.slice(startIndex, endIndex);

    // Enrich attendees with user details
    const enrichedAttendees = await Promise.all(
      paginatedAttendees.map(async (attendee) => {
        const user = await storage.getUserById(attendee.userId);
        return {
          ...attendee,
          userName: user?.name || 'Unknown User',
          userAvatar: user?.avatarUrl || null,
          userTitle: user?.title || null,
          userCompany: user?.company || null,
        };
      })
    );

    res.status(200).json({
      data: enrichedAttendees,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
    }

    console.error('[Events Routes] Get attendees error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
