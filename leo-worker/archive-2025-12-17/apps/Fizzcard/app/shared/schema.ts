import { pgTable, serial, text, varchar, integer, decimal, timestamp, boolean, jsonb, real, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// Users Table
// ============================================================================
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  title: text('title'),
  phone: text('phone'),
  company: text('company'),
  address: text('address'),
  website: text('website'),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  role: text('role').notNull().default('user'),
  isVerified: boolean('is_verified').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  roleIdx: index('users_role_idx').on(table.role),
}));

// ============================================================================
// FizzCards Table
// ============================================================================
export const fizzCards = pgTable('fizzCards', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  displayName: text('display_name').notNull(),
  title: text('title'),
  company: text('company'),
  phone: text('phone'),
  email: text('email'),
  website: text('website'),
  address: text('address'),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  themeColor: text('theme_color'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('fizzCards_user_id_idx').on(table.userId),
  isActiveIdx: index('fizzCards_is_active_idx').on(table.isActive),
}));

// ============================================================================
// SocialLinks Table
// ============================================================================
export const socialLinks = pgTable('socialLinks', {
  id: serial('id').primaryKey(),
  fizzcardId: integer('fizzcard_id').notNull().references(() => fizzCards.id, { onDelete: 'cascade' }),
  platform: text('platform').notNull(),
  url: text('url').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  fizzcardIdIdx: index('socialLinks_fizzcard_id_idx').on(table.fizzcardId),
}));

// ============================================================================
// ContactExchanges Table
// ============================================================================
export const contactExchanges = pgTable('contactExchanges', {
  id: serial('id').primaryKey(),
  senderId: integer('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  receiverId: integer('receiver_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  method: text('method').notNull(),
  latitude: real('latitude'),
  longitude: real('longitude'),
  locationName: text('location_name'),
  metAt: timestamp('met_at').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  senderIdIdx: index('contactExchanges_sender_id_idx').on(table.senderId),
  receiverIdIdx: index('contactExchanges_receiver_id_idx').on(table.receiverId),
  statusIdx: index('contactExchanges_status_idx').on(table.status),
  metAtIdx: index('contactExchanges_met_at_idx').on(table.metAt),
}));

// ============================================================================
// Connections Table
// ============================================================================
export const connections = pgTable('connections', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  connectedUserId: integer('connected_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  exchangeId: integer('exchange_id').references(() => contactExchanges.id, { onDelete: 'set null' }),
  relationshipNote: text('relationship_note'),
  tags: jsonb('tags').notNull().default('[]'),
  strengthScore: integer('strength_score').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('connections_user_id_idx').on(table.userId),
  connectedUserIdIdx: index('connections_connected_user_id_idx').on(table.connectedUserId),
  strengthScoreIdx: index('connections_strength_score_idx').on(table.strengthScore),
}));

// ============================================================================
// FizzCoinWallets Table (Legacy - kept for backwards compatibility)
// ============================================================================
export const fizzCoinWallets = pgTable('fizzCoinWallets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  balance: decimal('balance', { precision: 18, scale: 2 }).notNull().default('0'),
  totalEarned: decimal('total_earned', { precision: 18, scale: 2 }).notNull().default('0'),
  totalSpent: decimal('total_spent', { precision: 18, scale: 2 }).notNull().default('0'),
  lastTransactionAt: timestamp('last_transaction_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('fizzCoinWallets_user_id_idx').on(table.userId),
  balanceIdx: index('fizzCoinWallets_balance_idx').on(table.balance),
}));

// ============================================================================
// CryptoWallets Table (Blockchain Integration)
// ============================================================================
export const cryptoWallets = pgTable('crypto_wallets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  walletAddress: text('wallet_address').notNull().unique(), // Ethereum address (0x...)
  walletType: text('wallet_type').notNull().default('embedded'), // 'embedded' or 'external'
  pendingClaimAmount: integer('pending_claim_amount').notNull().default(0), // Cache for fast UI updates
  lastClaimAt: timestamp('last_claim_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('crypto_wallets_user_id_idx').on(table.userId),
  walletAddressIdx: index('crypto_wallets_wallet_address_idx').on(table.walletAddress),
}));

// ============================================================================
// FizzCoinTransactions Table (Updated for Blockchain)
// ============================================================================
export const fizzCoinTransactions = pgTable('fizzCoinTransactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 18, scale: 2 }).notNull(),
  transactionType: text('transaction_type').notNull(), // reward_earned, reward_claimed, exchange, introduction, referral, bonus, trade
  txHash: text('tx_hash'), // Blockchain transaction hash (0x...)
  blockNumber: integer('block_number'), // Block number for blockchain indexing
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('fizzCoinTransactions_user_id_idx').on(table.userId),
  transactionTypeIdx: index('fizzCoinTransactions_transaction_type_idx').on(table.transactionType),
  createdAtIdx: index('fizzCoinTransactions_created_at_idx').on(table.createdAt),
  txHashIdx: index('fizzCoinTransactions_tx_hash_idx').on(table.txHash), // NEW: Index for blockchain lookups
  blockNumberIdx: index('fizzCoinTransactions_block_number_idx').on(table.blockNumber), // NEW: Index for block queries
}));

// ============================================================================
// Introductions Table
// ============================================================================
export const introductions = pgTable('introductions', {
  id: serial('id').primaryKey(),
  introducerId: integer('introducer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  personAId: integer('person_a_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  personBId: integer('person_b_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  context: text('context'),
  status: text('status').notNull().default('pending'),
  fizzcoinReward: decimal('fizzcoin_reward', { precision: 18, scale: 2 }).notNull().default('0'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  introducerIdIdx: index('introductions_introducer_id_idx').on(table.introducerId),
  statusIdx: index('introductions_status_idx').on(table.status),
}));

// ============================================================================
// Events Table
// ============================================================================
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  location: text('location'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  isExclusive: boolean('is_exclusive').notNull().default(false),
  minFizzcoinRequired: decimal('min_fizzcoin_required', { precision: 18, scale: 2 }).notNull().default('0'),
  createdBy: integer('created_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  startDateIdx: index('events_start_date_idx').on(table.startDate),
  isExclusiveIdx: index('events_is_exclusive_idx').on(table.isExclusive),
  createdByIdx: index('events_created_by_idx').on(table.createdBy),
}));

// ============================================================================
// EventAttendees Table
// ============================================================================
export const eventAttendees = pgTable('eventAttendees', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  checkInAt: timestamp('check_in_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  eventIdIdx: index('eventAttendees_event_id_idx').on(table.eventId),
  userIdIdx: index('eventAttendees_user_id_idx').on(table.userId),
}));

// ============================================================================
// Badges Table
// ============================================================================
export const badges = pgTable('badges', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  badgeType: text('badge_type').notNull(),
  earnedAt: timestamp('earned_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('badges_user_id_idx').on(table.userId),
  badgeTypeIdx: index('badges_badge_type_idx').on(table.badgeType),
}));

// ============================================================================
// SearchHistory Table
// ============================================================================
export const searchHistory = pgTable('searchHistory', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  query: text('query').notNull(),
  filters: jsonb('filters'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('searchHistory_user_id_idx').on(table.userId),
  createdAtIdx: index('searchHistory_created_at_idx').on(table.createdAt),
}));

// ============================================================================
// Relations
// ============================================================================

export const usersRelations = relations(users, ({ many, one }) => ({
  fizzCards: many(fizzCards),
  sentExchanges: many(contactExchanges, { relationName: 'sender' }),
  receivedExchanges: many(contactExchanges, { relationName: 'receiver' }),
  connections: many(connections, { relationName: 'userConnections' }),
  connectedToUsers: many(connections, { relationName: 'connectedUsers' }),
  wallet: one(fizzCoinWallets),
  transactions: many(fizzCoinTransactions),
  introductions: many(introductions, { relationName: 'introducer' }),
  introducedAsPersonA: many(introductions, { relationName: 'personA' }),
  introducedAsPersonB: many(introductions, { relationName: 'personB' }),
  createdEvents: many(events),
  eventAttendances: many(eventAttendees),
  badges: many(badges),
  searchHistory: many(searchHistory),
}));

export const fizzCardsRelations = relations(fizzCards, ({ one, many }) => ({
  user: one(users, {
    fields: [fizzCards.userId],
    references: [users.id],
  }),
  socialLinks: many(socialLinks),
}));

export const socialLinksRelations = relations(socialLinks, ({ one }) => ({
  fizzCard: one(fizzCards, {
    fields: [socialLinks.fizzcardId],
    references: [fizzCards.id],
  }),
}));

export const contactExchangesRelations = relations(contactExchanges, ({ one, many }) => ({
  sender: one(users, {
    fields: [contactExchanges.senderId],
    references: [users.id],
    relationName: 'sender',
  }),
  receiver: one(users, {
    fields: [contactExchanges.receiverId],
    references: [users.id],
    relationName: 'receiver',
  }),
  connection: one(connections),
}));

export const connectionsRelations = relations(connections, ({ one }) => ({
  user: one(users, {
    fields: [connections.userId],
    references: [users.id],
    relationName: 'userConnections',
  }),
  connectedUser: one(users, {
    fields: [connections.connectedUserId],
    references: [users.id],
    relationName: 'connectedUsers',
  }),
  exchange: one(contactExchanges, {
    fields: [connections.exchangeId],
    references: [contactExchanges.id],
  }),
}));

export const fizzCoinWalletsRelations = relations(fizzCoinWallets, ({ one }) => ({
  user: one(users, {
    fields: [fizzCoinWallets.userId],
    references: [users.id],
  }),
}));

export const fizzCoinTransactionsRelations = relations(fizzCoinTransactions, ({ one }) => ({
  user: one(users, {
    fields: [fizzCoinTransactions.userId],
    references: [users.id],
  }),
}));

export const introductionsRelations = relations(introductions, ({ one }) => ({
  introducer: one(users, {
    fields: [introductions.introducerId],
    references: [users.id],
    relationName: 'introducer',
  }),
  personA: one(users, {
    fields: [introductions.personAId],
    references: [users.id],
    relationName: 'personA',
  }),
  personB: one(users, {
    fields: [introductions.personBId],
    references: [users.id],
    relationName: 'personB',
  }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  creator: one(users, {
    fields: [events.createdBy],
    references: [users.id],
  }),
  attendees: many(eventAttendees),
}));

export const eventAttendeesRelations = relations(eventAttendees, ({ one }) => ({
  event: one(events, {
    fields: [eventAttendees.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventAttendees.userId],
    references: [users.id],
  }),
}));

export const badgesRelations = relations(badges, ({ one }) => ({
  user: one(users, {
    fields: [badges.userId],
    references: [users.id],
  }),
}));

export const searchHistoryRelations = relations(searchHistory, ({ one }) => ({
  user: one(users, {
    fields: [searchHistory.userId],
    references: [users.id],
  }),
}));
