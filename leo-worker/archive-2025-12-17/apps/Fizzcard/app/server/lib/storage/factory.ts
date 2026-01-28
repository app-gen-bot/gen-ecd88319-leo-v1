/**
 * Storage Factory Pattern
 *
 * Provides a pluggable storage system that can switch between
 * in-memory (development) and database (production) implementations.
 */

import type {
  User,
  InsertUser,
  FizzCard,
  InsertFizzCard,
  SocialLink,
  InsertSocialLink,
  ContactExchange,
  InsertContactExchange,
  Connection,
  InsertConnection,
  FizzCoinWallet,
  InsertFizzCoinWallet,
  CryptoWallet,
  InsertCryptoWallet,
  FizzCoinTransaction,
  InsertFizzCoinTransaction,
  Introduction,
  InsertIntroduction,
  Event,
  InsertEvent,
  EventAttendee,
  InsertEventAttendee,
  Badge,
  InsertBadge,
  SearchHistory,
  InsertSearchHistory,
} from '../../../shared/schema.zod';
import type {
  NetworkGraph,
  NetworkStats,
  SuperConnector,
} from '../../../shared/contracts/network.contract';

/**
 * Storage interface defining all data access methods
 */
export interface IStorage {
  // ==================== USERS ====================
  getUsers(): Promise<User[]>;
  getUserById(id: number): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(data: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | null>;
  deleteUser(id: number): Promise<boolean>;

  // ==================== FIZZCARDS ====================
  getFizzCards(filters?: { isActive?: boolean; userId?: number }): Promise<FizzCard[]>;
  getFizzCardById(id: number): Promise<FizzCard | null>;
  getFizzCardsByUserId(userId: number): Promise<FizzCard[]>;
  createFizzCard(data: InsertFizzCard): Promise<FizzCard>;
  updateFizzCard(id: number, data: Partial<InsertFizzCard>): Promise<FizzCard | null>;
  deleteFizzCard(id: number): Promise<boolean>;

  // ==================== SOCIAL LINKS ====================
  getSocialLinks(): Promise<SocialLink[]>;
  getSocialLinkById(id: number): Promise<SocialLink | null>;
  getSocialLinksByFizzCardId(fizzcardId: number): Promise<SocialLink[]>;
  createSocialLink(data: InsertSocialLink): Promise<SocialLink>;
  updateSocialLink(id: number, data: Partial<InsertSocialLink>): Promise<SocialLink | null>;
  deleteSocialLink(id: number): Promise<boolean>;

  // ==================== CONTACT EXCHANGES ====================
  getContactExchanges(): Promise<ContactExchange[]>;
  getContactExchangeById(id: number): Promise<ContactExchange | null>;
  getContactExchangesBySenderId(
    senderId: number,
    filters?: { status?: string }
  ): Promise<ContactExchange[]>;
  getContactExchangesByReceiverId(
    receiverId: number,
    filters?: { status?: string }
  ): Promise<ContactExchange[]>;
  createContactExchange(data: InsertContactExchange): Promise<ContactExchange>;
  updateContactExchange(
    id: number,
    data: Partial<InsertContactExchange>
  ): Promise<ContactExchange | null>;

  // ==================== CONNECTIONS ====================
  getConnections(): Promise<Connection[]>;
  getConnectionById(id: number): Promise<Connection | null>;
  getConnectionsByUserId(
    userId: number,
    filters?: {
      location?: string;
      dateFrom?: string;
      dateTo?: string;
      tags?: string[];
    }
  ): Promise<Connection[]>;
  createConnection(data: InsertConnection): Promise<Connection>;
  updateConnection(id: number, data: Partial<InsertConnection>): Promise<Connection | null>;
  deleteConnection(id: number): Promise<boolean>;

  // ==================== FIZZCOIN WALLETS (Legacy) ====================
  getWallet(id: number): Promise<FizzCoinWallet | null>;
  getWalletByUserId(userId: number): Promise<FizzCoinWallet | null>;
  createWallet(data: InsertFizzCoinWallet): Promise<FizzCoinWallet>;
  updateWallet(id: number, data: Partial<InsertFizzCoinWallet>): Promise<FizzCoinWallet | null>;
  updateWalletBalance(
    userId: number,
    amountChange: number,
    isEarning: boolean
  ): Promise<FizzCoinWallet | null>;

  // ==================== CRYPTO WALLETS (Blockchain) ====================
  getCryptoWallet(id: number): Promise<CryptoWallet | null>;
  getCryptoWalletByUserId(userId: number): Promise<CryptoWallet | null>;
  getCryptoWalletByAddress(walletAddress: string): Promise<CryptoWallet | null>;
  createCryptoWallet(data: InsertCryptoWallet): Promise<CryptoWallet>;
  updateCryptoWallet(id: number, data: Partial<InsertCryptoWallet>): Promise<CryptoWallet | null>;
  incrementPendingClaims(userId: number, amount: number): Promise<CryptoWallet | null>;
  resetPendingClaims(userId: number): Promise<CryptoWallet | null>;
  updateLastClaimAt(userId: number, timestamp: Date): Promise<CryptoWallet | null>;

  // ==================== FIZZCOIN TRANSACTIONS (Updated for Blockchain) ====================
  getTransactions(): Promise<FizzCoinTransaction[]>;
  getTransactionById(id: number): Promise<FizzCoinTransaction | null>;
  getTransactionsByUserId(
    userId: number,
    filters?: { type?: string; dateFrom?: string; dateTo?: string }
  ): Promise<FizzCoinTransaction[]>;
  createTransaction(data: InsertFizzCoinTransaction): Promise<FizzCoinTransaction>;
  createFizzCoinTransaction(data: InsertFizzCoinTransaction): Promise<FizzCoinTransaction>;

  // ==================== INTRODUCTIONS ====================
  getIntroductions(): Promise<Introduction[]>;
  getIntroductionById(id: number): Promise<Introduction | null>;
  getIntroductionsByIntroducerId(introducerId: number): Promise<Introduction[]>;
  getIntroductionsByPersonId(personId: number): Promise<Introduction[]>;
  createIntroduction(data: InsertIntroduction): Promise<Introduction>;
  updateIntroduction(id: number, data: Partial<InsertIntroduction>): Promise<Introduction | null>;

  // ==================== EVENTS ====================
  getEvents(filters?: { isExclusive?: boolean }): Promise<Event[]>;
  getEventById(id: number): Promise<Event | null>;
  createEvent(data: InsertEvent): Promise<Event>;
  updateEvent(id: number, data: Partial<InsertEvent>): Promise<Event | null>;
  deleteEvent(id: number): Promise<boolean>;

  // ==================== EVENT ATTENDEES ====================
  getEventAttendees(eventId: number): Promise<EventAttendee[]>;
  getEventAttendeesByUserId(userId: number): Promise<EventAttendee[]>;
  createEventAttendee(data: InsertEventAttendee): Promise<EventAttendee>;
  checkInToEvent(eventId: number, userId: number): Promise<EventAttendee | null>;

  // ==================== BADGES ====================
  getBadges(): Promise<Badge[]>;
  getBadgesByUserId(userId: number): Promise<Badge[]>;
  createBadge(data: InsertBadge): Promise<Badge>;
  deleteBadge(id: number): Promise<boolean>;

  // ==================== LEADERBOARD ====================
  getLeaderboard(options?: { limit?: number }): Promise<Array<{
    userId: number;
    name: string;
    avatarUrl: string | null;
    title: string | null;
    company: string | null;
    fizzCoinBalance: number;
    connectionCount: number;
  }>>;

  // ==================== SEARCH HISTORY ====================
  createSearchHistory(data: InsertSearchHistory): Promise<SearchHistory>;
  getSearchHistoryByUserId(userId: number, limit?: number): Promise<SearchHistory[]>;

  // ==================== NETWORK GRAPH ====================
  getNetworkGraph(depth?: number, centerUserId?: number): Promise<NetworkGraph>;
  getNetworkStats(userId: number): Promise<NetworkStats>;
  getSuperConnectors(limit?: number): Promise<SuperConnector[]>;
}

/**
 * Create the appropriate storage adapter based on environment
 */
export function createStorage(): IStorage {
  const storageMode = process.env.STORAGE_MODE || 'memory';

  console.log(`[Storage Factory] Initializing storage in ${storageMode} mode`);

  if (storageMode === 'database') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { DatabaseStorage } = require('./database-storage');
    return new DatabaseStorage();
  }

  // Default to in-memory storage for development
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MemoryStorage } = require('./mem-storage');
  return new MemoryStorage();
}

// Lazy singleton - only create when first accessed
let storageInstance: IStorage | null = null;

export const storage: IStorage = new Proxy({} as IStorage, {
  get(target, prop) {
    if (!storageInstance) {
      storageInstance = createStorage();
    }
    const value = (storageInstance as any)[prop];
    // If it's a function, bind it to the storage instance to preserve 'this' context
    if (typeof value === 'function') {
      return value.bind(storageInstance);
    }
    return value;
  }
});
