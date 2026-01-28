import { z } from 'zod';

// ============================================================================
// Users Schema
// ============================================================================
export const users = z.object({
  id: z.number(),
  email: z.string().email(),
  passwordHash: z.string(),
  name: z.string().min(1),
  title: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  website: z.string().url().optional().nullable(),
  bio: z.string().optional().nullable(),
  // avatarUrl can be either a URL or a data URI (data:image/...)
  avatarUrl: z.string().refine(
    (val) => {
      if (!val) return true;
      return val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:image/');
    },
    { message: 'Must be a valid URL or data URI' }
  ).optional().nullable(),
  role: z.enum(['user', 'admin', 'verified']),
  isVerified: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const insertUsersSchema = users.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type User = z.infer<typeof users>;
export type InsertUser = z.infer<typeof insertUsersSchema>;

// ============================================================================
// FizzCards Schema
// ============================================================================
export const fizzCards = z.object({
  id: z.number(),
  userId: z.number(),
  displayName: z.string().min(1),
  title: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  website: z.string().url().optional().nullable(),
  address: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  // avatarUrl can be either a URL or a data URI (data:image/...)
  avatarUrl: z.string().refine(
    (val) => {
      if (!val) return true;
      return val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:image/');
    },
    { message: 'Must be a valid URL or data URI' }
  ).optional().nullable(),
  themeColor: z.string().optional().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const insertFizzCardsSchema = fizzCards.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type FizzCard = z.infer<typeof fizzCards>;
export type InsertFizzCard = z.infer<typeof insertFizzCardsSchema>;

// ============================================================================
// SocialLinks Schema
// ============================================================================
export const socialLinks = z.object({
  id: z.number(),
  fizzcardId: z.number(),
  platform: z.enum(['linkedin', 'twitter', 'instagram', 'facebook', 'github', 'custom']),
  url: z.string().url(),
  createdAt: z.string().datetime(),
});

export const insertSocialLinksSchema = socialLinks.omit({
  id: true,
  createdAt: true
});

export type SocialLink = z.infer<typeof socialLinks>;
export type InsertSocialLink = z.infer<typeof insertSocialLinksSchema>;

// ============================================================================
// ContactExchanges Schema
// ============================================================================
export const contactExchanges = z.object({
  id: z.number(),
  senderId: z.number(),
  receiverId: z.number(),
  method: z.enum(['qr_code', 'nfc', 'direct_share']),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  locationName: z.string().optional().nullable(),
  metAt: z.string().datetime(),
  status: z.enum(['pending', 'accepted', 'rejected']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const insertContactExchangesSchema = contactExchanges.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type ContactExchange = z.infer<typeof contactExchanges>;
export type InsertContactExchange = z.infer<typeof insertContactExchangesSchema>;

// ============================================================================
// Connections Schema
// ============================================================================
export const connections = z.object({
  id: z.number(),
  userId: z.number(),
  connectedUserId: z.number(),
  exchangeId: z.number().optional().nullable(),
  relationshipNote: z.string().optional().nullable(),
  tags: z.array(z.string()),
  strengthScore: z.number().min(0).max(100),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const insertConnectionsSchema = connections.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type Connection = z.infer<typeof connections>;
export type InsertConnection = z.infer<typeof insertConnectionsSchema>;

// ============================================================================
// FizzCoinWallets Schema (Legacy - kept for backwards compatibility)
// ============================================================================
export const fizzCoinWallets = z.object({
  id: z.number(),
  userId: z.number(),
  balance: z.number().min(0),
  totalEarned: z.number().min(0),
  totalSpent: z.number().min(0),
  lastTransactionAt: z.string().datetime().optional().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const insertFizzCoinWalletsSchema = fizzCoinWallets.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type FizzCoinWallet = z.infer<typeof fizzCoinWallets>;
export type InsertFizzCoinWallet = z.infer<typeof insertFizzCoinWalletsSchema>;

// ============================================================================
// CryptoWallets Schema (Blockchain Integration)
// ============================================================================
export const cryptoWallets = z.object({
  id: z.number(),
  userId: z.number(),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Must be a valid Ethereum address'),
  walletType: z.enum(['embedded', 'external']),
  pendingClaimAmount: z.number().min(0).default(0), // Cache for fast UI updates
  lastClaimAt: z.string().datetime().optional().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const insertCryptoWalletsSchema = cryptoWallets.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type CryptoWallet = z.infer<typeof cryptoWallets>;
export type InsertCryptoWallet = z.infer<typeof insertCryptoWalletsSchema>;

// ============================================================================
// FizzCoinTransactions Schema (Updated for Blockchain)
// ============================================================================
export const fizzCoinTransactions = z.object({
  id: z.number(),
  userId: z.number(),
  amount: z.number(),
  transactionType: z.enum([
    'reward_earned',    // NEW: Reward credited to smart contract (pending claim)
    'reward_claimed',   // NEW: User claimed rewards from smart contract
    'exchange',         // Legacy: Connection accepted
    'introduction',     // Legacy: Introduction completed
    'referral',         // Legacy: Referral signup
    'bonus',            // Legacy: General bonus
    'trade'             // Legacy: Token trade
  ]),
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Must be a valid transaction hash').optional().nullable(), // Blockchain transaction hash
  blockNumber: z.number().optional().nullable(), // Block number for blockchain indexing
  metadata: z.record(z.any()).optional().nullable(),
  createdAt: z.string().datetime(),
});

export const insertFizzCoinTransactionsSchema = fizzCoinTransactions.omit({
  id: true,
  createdAt: true
});

export type FizzCoinTransaction = z.infer<typeof fizzCoinTransactions>;
export type InsertFizzCoinTransaction = z.infer<typeof insertFizzCoinTransactionsSchema>;

// ============================================================================
// Introductions Schema
// ============================================================================
export const introductions = z.object({
  id: z.number(),
  introducerId: z.number(),
  personAId: z.number(),
  personBId: z.number(),
  context: z.string().optional().nullable(),
  status: z.enum(['pending', 'completed', 'declined']),
  fizzcoinReward: z.number().min(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const insertIntroductionsSchema = introductions.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type Introduction = z.infer<typeof introductions>;
export type InsertIntroduction = z.infer<typeof insertIntroductionsSchema>;

// ============================================================================
// Events Schema
// ============================================================================
export const events = z.object({
  id: z.number(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  isExclusive: z.boolean(),
  minFizzcoinRequired: z.number().min(0),
  createdBy: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const insertEventsSchema = events.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type Event = z.infer<typeof events>;
export type InsertEvent = z.infer<typeof insertEventsSchema>;

// ============================================================================
// EventAttendees Schema
// ============================================================================
export const eventAttendees = z.object({
  id: z.number(),
  eventId: z.number(),
  userId: z.number(),
  checkInAt: z.string().datetime().optional().nullable(),
  createdAt: z.string().datetime(),
});

export const insertEventAttendeesSchema = eventAttendees.omit({
  id: true,
  createdAt: true
});

export type EventAttendee = z.infer<typeof eventAttendees>;
export type InsertEventAttendee = z.infer<typeof insertEventAttendeesSchema>;

// ============================================================================
// Badges Schema
// ============================================================================
export const badges = z.object({
  id: z.number(),
  userId: z.number(),
  badgeType: z.enum(['super_connector', 'early_adopter', 'top_earner', 'event_host', 'verified']),
  earnedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
});

export const insertBadgesSchema = badges.omit({
  id: true,
  createdAt: true
});

export type Badge = z.infer<typeof badges>;
export type InsertBadge = z.infer<typeof insertBadgesSchema>;

// ============================================================================
// SearchHistory Schema
// ============================================================================
export const searchHistory = z.object({
  id: z.number(),
  userId: z.number(),
  query: z.string(),
  filters: z.record(z.any()).optional().nullable(),
  createdAt: z.string().datetime(),
});

export const insertSearchHistorySchema = searchHistory.omit({
  id: true,
  createdAt: true
});

export type SearchHistory = z.infer<typeof searchHistory>;
export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;

// ============================================================================
// Query Parameter Schemas (for API contracts and routes)
// ============================================================================

/**
 * Standard pagination query parameters
 * Used across all list endpoints
 * IMPORTANT: This is the single source of truth for pagination limits
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

/**
 * Connections query parameters
 * Used in: connections.contract.ts, connections.ts route
 */
export const connectionsQuerySchema = z.object({
  location: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  tags: z.string().optional(), // Comma-separated tags
  sortBy: z.enum(['recent', 'strength', 'name']).optional().default('recent'),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

/**
 * Contact Exchanges query parameters
 * Used in: contactExchanges.contract.ts, contactExchanges.ts route
 */
export const contactExchangesQuerySchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected']).optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

/**
 * FizzCoin Transactions query parameters
 * Used in: fizzCoin.contract.ts, wallet.ts route
 */
export const fizzCoinTransactionsQuerySchema = z.object({
  type: z.enum(['exchange', 'introduction', 'referral', 'bonus', 'trade']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

/**
 * Introductions query parameters
 * Used in: introductions.contract.ts, introductions.ts route
 */
export const introductionsQuerySchema = z.object({
  status: z.enum(['pending', 'completed', 'declined']).optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

/**
 * Events query parameters
 * Used in: events.contract.ts, events.ts route
 */
export const eventsQuerySchema = z.object({
  upcoming: z.coerce.boolean().optional(),
  exclusive: z.coerce.boolean().optional(),
  location: z.string().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

/**
 * Event Attendees query parameters
 * Used in: events.contract.ts, events.ts route
 */
export const eventAttendeesQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

/**
 * FizzCards query parameters
 * Used in: fizzCards.contract.ts, fizzCards.ts route
 */
export const fizzCardsQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  isActive: z.coerce.boolean().optional(),
});

/**
 * Leaderboard query parameters
 * Used in: leaderboard.contract.ts, leaderboard.ts route
 */
export const leaderboardQuerySchema = z.object({
  filter: z.enum(['global', 'location', 'time']).optional().default('global'),
  location: z.string().optional(), // City/country name for location filter
  timeRange: z.enum(['week', 'month', 'year', 'all']).optional().default('all'),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(50).optional().default(10),
});

/**
 * Network Graph query parameters
 * Used in: network.contract.ts, network.ts route
 */
export const networkGraphQuerySchema = z.object({
  depth: z.coerce.number().min(1).max(5).optional().default(2),
  userId: z.coerce.number().optional(),
});

/**
 * Super Connectors query parameters
 * Used in: network.contract.ts, network.ts route
 */
export const superConnectorsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).optional().default(10),
});

/**
 * Search Connections query parameters
 * Used in: search.contract.ts, search.ts route
 */
export const searchConnectionsQuerySchema = z.object({
  q: z.string().optional(), // General search query (name, company, title)
  location: z.string().optional(), // Filter by location name
  dateFrom: z.string().datetime().optional(), // Filter by date range (when met)
  dateTo: z.string().datetime().optional(),
  tags: z.string().optional(), // Comma-separated tags
  company: z.string().optional(), // Filter by company
  title: z.string().optional(), // Filter by title
  minStrength: z.coerce.number().min(0).max(100).optional(), // Filter by minimum strength score
  sortBy: z.enum(['relevance', 'recent', 'strength', 'name']).optional().default('relevance'),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

/**
 * Search Users query parameters
 * Used in: search.contract.ts, search.ts route
 */
export const searchUsersQuerySchema = z.object({
  q: z.string().min(1), // Search query (name, company, title)
  location: z.string().optional(),
  isSuperConnector: z.coerce.boolean().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});
