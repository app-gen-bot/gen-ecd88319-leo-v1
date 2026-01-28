/**
 * In-Memory Storage Adapter
 *
 * Development-only storage using in-memory arrays with auto-increment IDs.
 * Data is lost on server restart.
 */

import type { IStorage } from './factory';
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
  NetworkNode,
  NetworkLink,
  NetworkStats,
  SuperConnector,
} from '../../../shared/contracts/network.contract';

export class MemoryStorage implements IStorage {
  private users: User[] = [];
  private fizzCards: FizzCard[] = [];
  private socialLinks: SocialLink[] = [];
  private contactExchanges: ContactExchange[] = [];
  private connections: Connection[] = [];
  private fizzCoinWallets: FizzCoinWallet[] = [];
  private cryptoWallets: CryptoWallet[] = [];
  private fizzCoinTransactions: FizzCoinTransaction[] = [];
  private introductions: Introduction[] = [];
  private events: Event[] = [];
  private eventAttendees: EventAttendee[] = [];
  private badges: Badge[] = [];
  private searchHistory: SearchHistory[] = [];

  private nextUserId = 1;
  private nextFizzCardId = 1;
  private nextSocialLinkId = 1;
  private nextContactExchangeId = 1;
  private nextConnectionId = 1;
  private nextWalletId = 1;
  private nextCryptoWalletId = 1;
  private nextTransactionId = 1;
  private nextIntroductionId = 1;
  private nextEventId = 1;
  private nextEventAttendeeId = 1;
  private nextBadgeId = 1;
  private nextSearchHistoryId = 1;

  constructor() {
    console.log('[MemoryStorage] In-memory storage initialized');
  }

  // ==================== USERS ====================

  async getUsers(): Promise<User[]> {
    console.log(`[MemoryStorage] Getting all users (${this.users.length} found)`);
    return [...this.users];
  }

  async getUserById(id: number): Promise<User | null> {
    console.log(`[MemoryStorage] Getting user by ID: ${id}`);
    const user = this.users.find((u) => u.id === id);
    return user || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    console.log(`[MemoryStorage] Getting user by email: ${email}`);
    const user = this.users.find((u) => u.email === email);
    return user || null;
  }

  async createUser(data: InsertUser): Promise<User> {
    const now = new Date().toISOString();
    const user: User = {
      id: this.nextUserId++,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.users.push(user);
    console.log(`[MemoryStorage] Created user: ${user.email} (ID: ${user.id})`);
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | null> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      console.log(`[MemoryStorage] User not found: ${id}`);
      return null;
    }

    this.users[index] = {
      ...this.users[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    console.log(`[MemoryStorage] Updated user: ${id}`);
    return this.users[index];
  }

  async deleteUser(id: number): Promise<boolean> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      console.log(`[MemoryStorage] User not found for deletion: ${id}`);
      return false;
    }

    this.users.splice(index, 1);
    console.log(`[MemoryStorage] Deleted user: ${id}`);
    return true;
  }

  // ==================== FIZZCARDS ====================

  async getFizzCards(filters?: { isActive?: boolean; userId?: number }): Promise<FizzCard[]> {
    let result = [...this.fizzCards];

    if (filters?.isActive !== undefined) {
      result = result.filter((fc) => fc.isActive === filters.isActive);
    }
    if (filters?.userId !== undefined) {
      result = result.filter((fc) => fc.userId === filters.userId);
    }

    console.log(`[MemoryStorage] Getting FizzCards with filters (${result.length} found)`);
    return result;
  }

  async getFizzCardById(id: number): Promise<FizzCard | null> {
    console.log(`[MemoryStorage] Getting FizzCard by ID: ${id}`);
    const fizzCard = this.fizzCards.find((fc) => fc.id === id);
    return fizzCard || null;
  }

  async getFizzCardsByUserId(userId: number): Promise<FizzCard[]> {
    console.log(`[MemoryStorage] Getting FizzCards for user: ${userId}`);
    return this.fizzCards.filter((fc) => fc.userId === userId);
  }

  async createFizzCard(data: InsertFizzCard): Promise<FizzCard> {
    const now = new Date().toISOString();
    const fizzCard: FizzCard = {
      id: this.nextFizzCardId++,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.fizzCards.push(fizzCard);
    console.log(`[MemoryStorage] Created FizzCard: ${fizzCard.id} for user ${fizzCard.userId}`);
    return fizzCard;
  }

  async updateFizzCard(id: number, data: Partial<InsertFizzCard>): Promise<FizzCard | null> {
    const index = this.fizzCards.findIndex((fc) => fc.id === id);
    if (index === -1) {
      console.log(`[MemoryStorage] FizzCard not found: ${id}`);
      return null;
    }

    this.fizzCards[index] = {
      ...this.fizzCards[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    console.log(`[MemoryStorage] Updated FizzCard: ${id}`);
    return this.fizzCards[index];
  }

  async deleteFizzCard(id: number): Promise<boolean> {
    const index = this.fizzCards.findIndex((fc) => fc.id === id);
    if (index === -1) {
      console.log(`[MemoryStorage] FizzCard not found for deletion: ${id}`);
      return false;
    }

    this.fizzCards.splice(index, 1);
    console.log(`[MemoryStorage] Deleted FizzCard: ${id}`);
    return true;
  }

  // ==================== SOCIAL LINKS ====================

  async getSocialLinks(): Promise<SocialLink[]> {
    console.log(`[MemoryStorage] Getting all social links (${this.socialLinks.length} found)`);
    return [...this.socialLinks];
  }

  async getSocialLinkById(id: number): Promise<SocialLink | null> {
    console.log(`[MemoryStorage] Getting social link by ID: ${id}`);
    const link = this.socialLinks.find((sl) => sl.id === id);
    return link || null;
  }

  async getSocialLinksByFizzCardId(fizzcardId: number): Promise<SocialLink[]> {
    console.log(`[MemoryStorage] Getting social links for FizzCard: ${fizzcardId}`);
    return this.socialLinks.filter((sl) => sl.fizzcardId === fizzcardId);
  }

  async createSocialLink(data: InsertSocialLink): Promise<SocialLink> {
    const socialLink: SocialLink = {
      id: this.nextSocialLinkId++,
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.socialLinks.push(socialLink);
    console.log(`[MemoryStorage] Created social link: ${socialLink.id} for FizzCard ${socialLink.fizzcardId}`);
    return socialLink;
  }

  async updateSocialLink(id: number, data: Partial<InsertSocialLink>): Promise<SocialLink | null> {
    const index = this.socialLinks.findIndex((sl) => sl.id === id);
    if (index === -1) {
      console.log(`[MemoryStorage] Social link not found: ${id}`);
      return null;
    }

    this.socialLinks[index] = {
      ...this.socialLinks[index],
      ...data,
    };
    console.log(`[MemoryStorage] Updated social link: ${id}`);
    return this.socialLinks[index];
  }

  async deleteSocialLink(id: number): Promise<boolean> {
    const index = this.socialLinks.findIndex((sl) => sl.id === id);
    if (index === -1) {
      console.log(`[MemoryStorage] Social link not found for deletion: ${id}`);
      return false;
    }

    this.socialLinks.splice(index, 1);
    console.log(`[MemoryStorage] Deleted social link: ${id}`);
    return true;
  }

  // ==================== CONTACT EXCHANGES ====================

  async getContactExchanges(): Promise<ContactExchange[]> {
    console.log(`[MemoryStorage] Getting all contact exchanges (${this.contactExchanges.length} found)`);
    return [...this.contactExchanges];
  }

  async getContactExchangeById(id: number): Promise<ContactExchange | null> {
    console.log(`[MemoryStorage] Getting contact exchange by ID: ${id}`);
    const exchange = this.contactExchanges.find((ce) => ce.id === id);
    return exchange || null;
  }

  async getContactExchangesBySenderId(
    senderId: number,
    filters?: { status?: string }
  ): Promise<ContactExchange[]> {
    console.log(`[MemoryStorage] Getting contact exchanges for sender: ${senderId}`);
    let result = this.contactExchanges.filter((ce) => ce.senderId === senderId);

    if (filters?.status) {
      result = result.filter((ce) => ce.status === filters.status);
    }

    return result;
  }

  async getContactExchangesByReceiverId(
    receiverId: number,
    filters?: { status?: string }
  ): Promise<ContactExchange[]> {
    console.log(`[MemoryStorage] Getting contact exchanges for receiver: ${receiverId}`);
    let result = this.contactExchanges.filter((ce) => ce.receiverId === receiverId);

    if (filters?.status) {
      result = result.filter((ce) => ce.status === filters.status);
    }

    return result;
  }

  async createContactExchange(data: InsertContactExchange): Promise<ContactExchange> {
    const now = new Date().toISOString();
    const exchange: ContactExchange = {
      id: this.nextContactExchangeId++,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.contactExchanges.push(exchange);
    console.log(
      `[MemoryStorage] Created contact exchange: ${exchange.id} (${exchange.senderId} → ${exchange.receiverId})`
    );
    return exchange;
  }

  async updateContactExchange(
    id: number,
    data: Partial<InsertContactExchange>
  ): Promise<ContactExchange | null> {
    const index = this.contactExchanges.findIndex((ce) => ce.id === id);
    if (index === -1) {
      console.log(`[MemoryStorage] Contact exchange not found: ${id}`);
      return null;
    }

    this.contactExchanges[index] = {
      ...this.contactExchanges[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    console.log(`[MemoryStorage] Updated contact exchange: ${id}`);
    return this.contactExchanges[index];
  }

  // ==================== CONNECTIONS ====================

  async getConnections(): Promise<Connection[]> {
    console.log(`[MemoryStorage] Getting all connections (${this.connections.length} found)`);
    return [...this.connections];
  }

  async getConnectionById(id: number): Promise<Connection | null> {
    console.log(`[MemoryStorage] Getting connection by ID: ${id}`);
    const connection = this.connections.find((c) => c.id === id);
    return connection || null;
  }

  async getConnectionsByUserId(
    userId: number,
    filters?: {
      location?: string;
      dateFrom?: string;
      dateTo?: string;
      tags?: string[];
    }
  ): Promise<Connection[]> {
    console.log(`[MemoryStorage] Getting connections for user: ${userId}`);
    let result = this.connections.filter((c) => c.userId === userId);

    if (filters?.dateFrom) {
      result = result.filter((c) => c.createdAt >= filters.dateFrom!);
    }
    if (filters?.dateTo) {
      result = result.filter((c) => c.createdAt <= filters.dateTo!);
    }
    if (filters?.tags && filters.tags.length > 0) {
      result = result.filter((c) =>
        filters.tags!.some((tag) => c.tags.includes(tag))
      );
    }

    return result;
  }

  async createConnection(data: InsertConnection): Promise<Connection> {
    const now = new Date().toISOString();
    const connection: Connection = {
      id: this.nextConnectionId++,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.connections.push(connection);
    console.log(
      `[MemoryStorage] Created connection: ${connection.id} (${connection.userId} ↔ ${connection.connectedUserId})`
    );
    return connection;
  }

  async updateConnection(id: number, data: Partial<InsertConnection>): Promise<Connection | null> {
    const index = this.connections.findIndex((c) => c.id === id);
    if (index === -1) {
      console.log(`[MemoryStorage] Connection not found: ${id}`);
      return null;
    }

    this.connections[index] = {
      ...this.connections[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    console.log(`[MemoryStorage] Updated connection: ${id}`);
    return this.connections[index];
  }

  async deleteConnection(id: number): Promise<boolean> {
    const index = this.connections.findIndex((c) => c.id === id);
    if (index === -1) {
      console.log(`[MemoryStorage] Connection not found for deletion: ${id}`);
      return false;
    }

    this.connections.splice(index, 1);
    console.log(`[MemoryStorage] Deleted connection: ${id}`);
    return true;
  }

  // ==================== FIZZCOIN WALLETS ====================

  async getWallet(id: number): Promise<FizzCoinWallet | null> {
    console.log(`[MemoryStorage] Getting wallet by ID: ${id}`);
    const wallet = this.fizzCoinWallets.find((w) => w.id === id);
    return wallet || null;
  }

  async getWalletByUserId(userId: number): Promise<FizzCoinWallet | null> {
    console.log(`[MemoryStorage] Getting wallet for user: ${userId}`);
    const wallet = this.fizzCoinWallets.find((w) => w.userId === userId);
    return wallet || null;
  }

  async createWallet(data: InsertFizzCoinWallet): Promise<FizzCoinWallet> {
    const now = new Date().toISOString();
    const wallet: FizzCoinWallet = {
      id: this.nextWalletId++,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.fizzCoinWallets.push(wallet);
    console.log(`[MemoryStorage] Created wallet: ${wallet.id} for user ${wallet.userId}`);
    return wallet;
  }

  async updateWallet(id: number, data: Partial<InsertFizzCoinWallet>): Promise<FizzCoinWallet | null> {
    const index = this.fizzCoinWallets.findIndex((w) => w.id === id);
    if (index === -1) {
      console.log(`[MemoryStorage] Wallet not found: ${id}`);
      return null;
    }

    this.fizzCoinWallets[index] = {
      ...this.fizzCoinWallets[index],
      ...data,
      lastTransactionAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    console.log(`[MemoryStorage] Updated wallet: ${id}`);
    return this.fizzCoinWallets[index];
  }

  async updateWalletBalance(
    userId: number,
    amountChange: number,
    isEarning: boolean
  ): Promise<FizzCoinWallet | null> {
    const wallet = await this.getWalletByUserId(userId);
    if (!wallet) {
      console.log(`[MemoryStorage] Wallet not found for user: ${userId}`);
      return null;
    }

    const currentBalance = Number(wallet.balance);
    const newBalance = currentBalance + amountChange;

    if (newBalance < 0) {
      console.log(`[MemoryStorage] Insufficient balance for user: ${userId}`);
      return null;
    }

    const totalEarned = isEarning
      ? Number(wallet.totalEarned) + amountChange
      : Number(wallet.totalEarned);
    const totalSpent = !isEarning
      ? Number(wallet.totalSpent) + Math.abs(amountChange)
      : Number(wallet.totalSpent);

    return this.updateWallet(wallet.id, {
      balance: newBalance,
      totalEarned,
      totalSpent,
    });
  }

  // ==================== CRYPTO WALLETS (Blockchain) ====================

  async getCryptoWallet(id: number): Promise<CryptoWallet | null> {
    console.log(`[MemoryStorage] Getting crypto wallet by ID: ${id}`);
    const wallet = this.cryptoWallets.find((w) => w.id === id);
    return wallet || null;
  }

  async getCryptoWalletByUserId(userId: number): Promise<CryptoWallet | null> {
    console.log(`[MemoryStorage] Getting crypto wallet for user: ${userId}`);
    const wallet = this.cryptoWallets.find((w) => w.userId === userId);
    return wallet || null;
  }

  async getCryptoWalletByAddress(walletAddress: string): Promise<CryptoWallet | null> {
    console.log(`[MemoryStorage] Getting crypto wallet by address: ${walletAddress}`);
    const wallet = this.cryptoWallets.find((w) => w.walletAddress === walletAddress);
    return wallet || null;
  }

  async createCryptoWallet(data: InsertCryptoWallet): Promise<CryptoWallet> {
    const now = new Date().toISOString();
    const wallet: CryptoWallet = {
      id: this.nextCryptoWalletId++,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.cryptoWallets.push(wallet);
    console.log(`[MemoryStorage] Created crypto wallet: ${wallet.id} for user ${wallet.userId} (${wallet.walletAddress})`);
    return wallet;
  }

  async updateCryptoWallet(id: number, data: Partial<InsertCryptoWallet>): Promise<CryptoWallet | null> {
    const index = this.cryptoWallets.findIndex((w) => w.id === id);
    if (index === -1) {
      console.log(`[MemoryStorage] Crypto wallet not found: ${id}`);
      return null;
    }

    this.cryptoWallets[index] = {
      ...this.cryptoWallets[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    console.log(`[MemoryStorage] Updated crypto wallet: ${id}`);
    return this.cryptoWallets[index];
  }

  async incrementPendingClaims(userId: number, amount: number): Promise<CryptoWallet | null> {
    const wallet = await this.getCryptoWalletByUserId(userId);
    if (!wallet) {
      console.log(`[MemoryStorage] Crypto wallet not found for user: ${userId}`);
      return null;
    }

    const newPendingAmount = wallet.pendingClaimAmount + amount;
    return this.updateCryptoWallet(wallet.id, {
      pendingClaimAmount: newPendingAmount,
    });
  }

  async resetPendingClaims(userId: number): Promise<CryptoWallet | null> {
    const wallet = await this.getCryptoWalletByUserId(userId);
    if (!wallet) {
      console.log(`[MemoryStorage] Crypto wallet not found for user: ${userId}`);
      return null;
    }

    return this.updateCryptoWallet(wallet.id, {
      pendingClaimAmount: 0,
    });
  }

  async updateLastClaimAt(userId: number, timestamp: Date): Promise<CryptoWallet | null> {
    const wallet = await this.getCryptoWalletByUserId(userId);
    if (!wallet) {
      console.log(`[MemoryStorage] Crypto wallet not found for user: ${userId}`);
      return null;
    }

    return this.updateCryptoWallet(wallet.id, {
      lastClaimAt: timestamp.toISOString(),
    });
  }

  // ==================== FIZZCOIN TRANSACTIONS ====================

  async getTransactions(): Promise<FizzCoinTransaction[]> {
    console.log(`[MemoryStorage] Getting all transactions (${this.fizzCoinTransactions.length} found)`);
    return [...this.fizzCoinTransactions];
  }

  async getTransactionById(id: number): Promise<FizzCoinTransaction | null> {
    console.log(`[MemoryStorage] Getting transaction by ID: ${id}`);
    const transaction = this.fizzCoinTransactions.find((t) => t.id === id);
    return transaction || null;
  }

  async getTransactionsByUserId(
    userId: number,
    filters?: { type?: string; dateFrom?: string; dateTo?: string }
  ): Promise<FizzCoinTransaction[]> {
    console.log(`[MemoryStorage] Getting transactions for user: ${userId}`);
    let result = this.fizzCoinTransactions.filter((t) => t.userId === userId);

    if (filters?.type) {
      result = result.filter((t) => t.transactionType === filters.type);
    }
    if (filters?.dateFrom) {
      result = result.filter((t) => t.createdAt >= filters.dateFrom!);
    }
    if (filters?.dateTo) {
      result = result.filter((t) => t.createdAt <= filters.dateTo!);
    }

    return result;
  }

  async createTransaction(data: InsertFizzCoinTransaction): Promise<FizzCoinTransaction> {
    const transaction: FizzCoinTransaction = {
      id: this.nextTransactionId++,
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.fizzCoinTransactions.push(transaction);
    console.log(
      `[MemoryStorage] Created transaction: ${transaction.id} (User ${transaction.userId}, ${transaction.amount} FizzCoins)`
    );
    return transaction;
  }

  async createFizzCoinTransaction(data: InsertFizzCoinTransaction): Promise<FizzCoinTransaction> {
    // Alias for createTransaction with blockchain fields support
    return this.createTransaction(data);
  }

  // ==================== INTRODUCTIONS ====================

  async getIntroductions(): Promise<Introduction[]> {
    console.log(`[MemoryStorage] Getting all introductions (${this.introductions.length} found)`);
    return [...this.introductions];
  }

  async getIntroductionById(id: number): Promise<Introduction | null> {
    console.log(`[MemoryStorage] Getting introduction by ID: ${id}`);
    const introduction = this.introductions.find((i) => i.id === id);
    return introduction || null;
  }

  async getIntroductionsByIntroducerId(introducerId: number): Promise<Introduction[]> {
    console.log(`[MemoryStorage] Getting introductions by introducer: ${introducerId}`);
    return this.introductions.filter((i) => i.introducerId === introducerId);
  }

  async getIntroductionsByPersonId(personId: number): Promise<Introduction[]> {
    console.log(`[MemoryStorage] Getting introductions involving person: ${personId}`);
    return this.introductions.filter(
      (i) => i.personAId === personId || i.personBId === personId
    );
  }

  async createIntroduction(data: InsertIntroduction): Promise<Introduction> {
    const now = new Date().toISOString();
    const introduction: Introduction = {
      id: this.nextIntroductionId++,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.introductions.push(introduction);
    console.log(
      `[MemoryStorage] Created introduction: ${introduction.id} by user ${introduction.introducerId}`
    );
    return introduction;
  }

  async updateIntroduction(
    id: number,
    data: Partial<InsertIntroduction>
  ): Promise<Introduction | null> {
    const index = this.introductions.findIndex((i) => i.id === id);
    if (index === -1) {
      console.log(`[MemoryStorage] Introduction not found: ${id}`);
      return null;
    }

    this.introductions[index] = {
      ...this.introductions[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    console.log(`[MemoryStorage] Updated introduction: ${id}`);
    return this.introductions[index];
  }

  // ==================== EVENTS ====================

  async getEvents(filters?: { isExclusive?: boolean }): Promise<Event[]> {
    let result = [...this.events];

    if (filters?.isExclusive !== undefined) {
      result = result.filter((e) => e.isExclusive === filters.isExclusive);
    }

    console.log(`[MemoryStorage] Getting events (${result.length} found)`);
    return result;
  }

  async getEventById(id: number): Promise<Event | null> {
    console.log(`[MemoryStorage] Getting event by ID: ${id}`);
    const event = this.events.find((e) => e.id === id);
    return event || null;
  }

  async createEvent(data: InsertEvent): Promise<Event> {
    const now = new Date().toISOString();
    const event: Event = {
      id: this.nextEventId++,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.events.push(event);
    console.log(`[MemoryStorage] Created event: ${event.id} - ${event.name}`);
    return event;
  }

  async updateEvent(id: number, data: Partial<InsertEvent>): Promise<Event | null> {
    const index = this.events.findIndex((e) => e.id === id);
    if (index === -1) {
      console.log(`[MemoryStorage] Event not found: ${id}`);
      return null;
    }

    this.events[index] = {
      ...this.events[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    console.log(`[MemoryStorage] Updated event: ${id}`);
    return this.events[index];
  }

  async deleteEvent(id: number): Promise<boolean> {
    const index = this.events.findIndex((e) => e.id === id);
    if (index === -1) {
      console.log(`[MemoryStorage] Event not found for deletion: ${id}`);
      return false;
    }

    this.events.splice(index, 1);
    console.log(`[MemoryStorage] Deleted event: ${id}`);
    return true;
  }

  // ==================== EVENT ATTENDEES ====================

  async getEventAttendees(eventId: number): Promise<EventAttendee[]> {
    console.log(`[MemoryStorage] Getting attendees for event: ${eventId}`);
    return this.eventAttendees.filter((ea) => ea.eventId === eventId);
  }

  async getEventAttendeesByUserId(userId: number): Promise<EventAttendee[]> {
    console.log(`[MemoryStorage] Getting event attendances for user: ${userId}`);
    return this.eventAttendees.filter((ea) => ea.userId === userId);
  }

  async createEventAttendee(data: InsertEventAttendee): Promise<EventAttendee> {
    const attendee: EventAttendee = {
      id: this.nextEventAttendeeId++,
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.eventAttendees.push(attendee);
    console.log(
      `[MemoryStorage] Created event attendee: ${attendee.id} (User ${attendee.userId}, Event ${attendee.eventId})`
    );
    return attendee;
  }

  async checkInToEvent(eventId: number, userId: number): Promise<EventAttendee | null> {
    const attendee = this.eventAttendees.find(
      (ea) => ea.eventId === eventId && ea.userId === userId
    );

    if (!attendee) {
      console.log(`[MemoryStorage] Attendee not found for check-in`);
      return null;
    }

    const index = this.eventAttendees.indexOf(attendee);
    this.eventAttendees[index] = {
      ...attendee,
      checkInAt: new Date().toISOString(),
    };

    console.log(`[MemoryStorage] Checked in user ${userId} to event ${eventId}`);
    return this.eventAttendees[index];
  }

  // ==================== BADGES ====================

  async getBadges(): Promise<Badge[]> {
    console.log(`[MemoryStorage] Getting all badges (${this.badges.length} found)`);
    return [...this.badges];
  }

  async getBadgesByUserId(userId: number): Promise<Badge[]> {
    console.log(`[MemoryStorage] Getting badges for user: ${userId}`);
    return this.badges.filter((b) => b.userId === userId);
  }

  async createBadge(data: InsertBadge): Promise<Badge> {
    const badge: Badge = {
      id: this.nextBadgeId++,
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.badges.push(badge);
    console.log(`[MemoryStorage] Created badge: ${badge.badgeType} for user ${badge.userId}`);
    return badge;
  }

  async deleteBadge(id: number): Promise<boolean> {
    const index = this.badges.findIndex((b) => b.id === id);
    if (index === -1) {
      console.log(`[MemoryStorage] Badge not found for deletion: ${id}`);
      return false;
    }

    this.badges.splice(index, 1);
    console.log(`[MemoryStorage] Deleted badge: ${id}`);
    return true;
  }

  // ==================== LEADERBOARD ====================

  async getLeaderboard(options?: { limit?: number }): Promise<Array<{
    userId: number;
    name: string;
    avatarUrl: string | null;
    title: string | null;
    company: string | null;
    fizzCoinBalance: number;
    connectionCount: number;
  }>> {
    const limit = options?.limit || 1000;
    console.log(`[MemoryStorage] Getting leaderboard (limit: ${limit})`);

    const leaderboardEntries = await Promise.all(
      this.users.map(async (user) => {
        const wallet = await this.getWalletByUserId(user.id);
        const connections = await this.getConnectionsByUserId(user.id);

        return {
          userId: user.id,
          name: user.name,
          avatarUrl: user.avatarUrl || null,
          title: user.title || null,
          company: user.company || null,
          fizzCoinBalance: wallet?.balance || 0,
          connectionCount: connections.length,
        };
      })
    );

    // Sort by connection count (descending) then by FizzCoin balance
    leaderboardEntries.sort((a, b) => {
      if (b.connectionCount !== a.connectionCount) {
        return b.connectionCount - a.connectionCount;
      }
      return b.fizzCoinBalance - a.fizzCoinBalance;
    });

    return leaderboardEntries.slice(0, limit);
  }

  // ==================== SEARCH HISTORY ====================

  async createSearchHistory(data: InsertSearchHistory): Promise<SearchHistory> {
    const search: SearchHistory = {
      id: this.nextSearchHistoryId++,
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.searchHistory.push(search);
    console.log(`[MemoryStorage] Created search history: ${search.id} for user ${search.userId}`);
    return search;
  }

  async getSearchHistoryByUserId(userId: number, limit = 10): Promise<SearchHistory[]> {
    console.log(`[MemoryStorage] Getting search history for user: ${userId} (limit: ${limit})`);
    return this.searchHistory
      .filter((sh) => sh.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  // ==================== NETWORK GRAPH ====================

  /**
   * Get network graph using BFS traversal
   * @param depth - Maximum depth to traverse (1-5)
   * @param centerUserId - Optional user to center the graph on (ego network)
   */
  async getNetworkGraph(depth: number = 2, centerUserId?: number): Promise<NetworkGraph> {
    console.log(`[MemoryStorage] Getting network graph (depth: ${depth}, centerUser: ${centerUserId || 'all'})`);

    const nodes = new Map<number, NetworkNode>();
    const links: NetworkLink[] = [];
    const visited = new Set<number>();
    const queue: Array<{ userId: number; currentDepth: number }> = [];

    // Build adjacency map for efficient lookup
    const adjacencyMap = new Map<number, Connection[]>();
    for (const conn of this.connections) {
      if (!adjacencyMap.has(conn.userId)) {
        adjacencyMap.set(conn.userId, []);
      }
      adjacencyMap.get(conn.userId)!.push(conn);
    }

    // Initialize queue
    if (centerUserId) {
      // Ego network: start from specific user
      const centerUser = await this.getUserById(centerUserId);
      if (!centerUser) {
        console.log(`[MemoryStorage] Center user not found: ${centerUserId}`);
        return { nodes: [], links: [] };
      }
      queue.push({ userId: centerUserId, currentDepth: 0 });
      visited.add(centerUserId);
    } else {
      // Full network: start from all users
      for (const user of this.users) {
        queue.push({ userId: user.id, currentDepth: 0 });
        visited.add(user.id);
      }
    }

    // BFS traversal
    while (queue.length > 0) {
      const { userId, currentDepth } = queue.shift()!;

      // Get user details
      const user = await this.getUserById(userId);
      if (!user) continue;

      // Get user's wallet for FizzCoins
      const wallet = await this.getWalletByUserId(userId);
      const fizzCoins = wallet?.balance || 0;

      // Get user's connection count
      const userConnections = adjacencyMap.get(userId) || [];
      const connectionCount = userConnections.length;

      // Add node
      nodes.set(userId, {
        id: userId,
        label: user.name,
        email: user.email,
        title: user.title || null,
        company: user.company || null,
        isVerified: user.isVerified,
        connectionCount,
        fizzCoins,
      });

      // Add connections if not at max depth
      if (currentDepth < depth) {
        for (const conn of userConnections) {
          const targetUserId = conn.connectedUserId;

          // Add link (avoid duplicates by checking if link already exists)
          const linkExists = links.some(
            (l) =>
              (l.source === userId && l.target === targetUserId) ||
              (l.source === targetUserId && l.target === userId)
          );

          if (!linkExists) {
            // Convert strengthScore (0-100) to strength (1-5)
            const strength = Math.max(1, Math.min(5, Math.ceil(conn.strengthScore / 20)));
            links.push({
              source: userId,
              target: targetUserId,
              strength,
              createdAt: conn.createdAt,
              note: conn.relationshipNote || null,
            });
          }

          // Add to queue if not visited
          if (!visited.has(targetUserId)) {
            visited.add(targetUserId);
            queue.push({ userId: targetUserId, currentDepth: currentDepth + 1 });
          }
        }
      }
    }

    const result = {
      nodes: Array.from(nodes.values()),
      links,
    };

    console.log(`[MemoryStorage] Network graph built: ${result.nodes.length} nodes, ${result.links.length} links`);
    return result;
  }

  /**
   * Calculate network statistics for a user
   * @param userId - User ID to calculate stats for
   */
  async getNetworkStats(userId: number): Promise<NetworkStats> {
    console.log(`[MemoryStorage] Calculating network stats for user: ${userId}`);

    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // Get direct connections
    const directConnections = await this.getConnectionsByUserId(userId);
    const directConnectionIds = new Set(directConnections.map((c) => c.connectedUserId));
    const directCount = directConnections.length;

    console.log(`[MemoryStorage] Direct connections: ${directCount}`);

    // Get second-degree connections (friends of friends)
    const secondDegreeIds = new Set<number>();
    const directConnectionArray = Array.from(directConnectionIds);
    for (const connId of directConnectionArray) {
      const friendConnections = await this.getConnectionsByUserId(connId);
      for (const friendConn of friendConnections) {
        const secondDegreeId = friendConn.connectedUserId;
        // Exclude self and direct connections
        if (secondDegreeId !== userId && !directConnectionIds.has(secondDegreeId)) {
          secondDegreeIds.add(secondDegreeId);
        }
      }
    }
    const secondDegreeCount = secondDegreeIds.size;

    console.log(`[MemoryStorage] Second-degree connections: ${secondDegreeCount}`);

    // Calculate network size using BFS (all reachable nodes)
    const visited = new Set<number>();
    const queue = [userId];
    visited.add(userId);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const connections = await this.getConnectionsByUserId(currentId);

      for (const conn of connections) {
        const targetId = conn.connectedUserId;
        if (!visited.has(targetId)) {
          visited.add(targetId);
          queue.push(targetId);
        }
      }
    }

    const networkSize = visited.size;
    console.log(`[MemoryStorage] Network size (reachable nodes): ${networkSize}`);

    // Calculate clustering coefficient
    // Formula: 2 * triangles / (k * (k - 1))
    // where k is the degree (number of direct connections)
    let triangles = 0;
    if (directCount >= 2) {
      // Check each pair of friends to see if they're connected
      const directConnectionArray = Array.from(directConnectionIds);
      for (let i = 0; i < directConnectionArray.length; i++) {
        for (let j = i + 1; j < directConnectionArray.length; j++) {
          const friendA = directConnectionArray[i];
          const friendB = directConnectionArray[j];

          // Check if friendA is connected to friendB
          const friendAConnections = await this.getConnectionsByUserId(friendA);
          const isConnected = friendAConnections.some((c) => c.connectedUserId === friendB);

          if (isConnected) {
            triangles++;
          }
        }
      }
    }

    const clusteringCoefficient =
      directCount >= 2 ? (2 * triangles) / (directCount * (directCount - 1)) : 0;

    console.log(`[MemoryStorage] Clustering coefficient: ${clusteringCoefficient} (triangles: ${triangles})`);

    // Calculate average path length (average shortest path from user to all reachable nodes)
    let totalDistance = 0;
    let reachableNodes = 0;

    // BFS from user to each node, tracking distances
    const distances = new Map<number, number>();
    const bfsQueue = [userId];
    distances.set(userId, 0);

    while (bfsQueue.length > 0) {
      const currentId = bfsQueue.shift()!;
      const currentDistance = distances.get(currentId)!;
      const connections = await this.getConnectionsByUserId(currentId);

      for (const conn of connections) {
        const targetId = conn.connectedUserId;
        if (!distances.has(targetId)) {
          distances.set(targetId, currentDistance + 1);
          bfsQueue.push(targetId);
          totalDistance += currentDistance + 1;
          reachableNodes++;
        }
      }
    }

    const averagePathLength = reachableNodes > 0 ? totalDistance / reachableNodes : 0;

    console.log(`[MemoryStorage] Average path length: ${averagePathLength}`);

    return {
      userId,
      directConnections: directCount,
      secondDegreeConnections: secondDegreeCount,
      networkSize,
      clusteringCoefficient,
      averagePathLength,
    };
  }

  /**
   * Get super connectors (users with most connections)
   * @param limit - Maximum number of results to return
   */
  async getSuperConnectors(limit: number = 10): Promise<SuperConnector[]> {
    console.log(`[MemoryStorage] Getting super connectors (limit: ${limit})`);

    // Build connection counts
    const connectionCounts = new Map<number, number>();
    for (const conn of this.connections) {
      const currentCount = connectionCounts.get(conn.userId) || 0;
      connectionCounts.set(conn.userId, currentCount + 1);
    }

    // Get all users with their connection counts
    const userWithCounts = await Promise.all(
      this.users.map(async (user) => {
        const connectionCount = connectionCounts.get(user.id) || 0;
        const wallet = await this.getWalletByUserId(user.id);
        const fizzCoins = wallet?.balance || 0;
        const userBadges = await this.getBadgesByUserId(user.id);
        const badges = userBadges.map((b) => b.badgeType);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          title: user.title || null,
          company: user.company || null,
          avatarUrl: user.avatarUrl || null,
          isVerified: user.isVerified,
          connectionCount,
          fizzCoins,
          badges,
        };
      })
    );

    // Sort by connection count descending
    userWithCounts.sort((a, b) => b.connectionCount - a.connectionCount);

    // Return top N
    const result = userWithCounts.slice(0, limit);

    console.log(`[MemoryStorage] Super connectors found: ${result.length}`);
    return result;
  }
}
