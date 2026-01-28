/**
 * Database Storage Adapter
 *
 * Production storage using PostgreSQL with Drizzle ORM.
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq, and, gte, lte, sql, desc, inArray } from 'drizzle-orm';
import * as schema from '../../../shared/schema';
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
  NetworkStats,
  SuperConnector,
} from '../../../shared/contracts/network.contract';

export class DatabaseStorage implements IStorage {
  private pool: Pool;
  private db: ReturnType<typeof drizzle>;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required for database storage mode');
    }

    this.pool = new Pool({ connectionString });
    this.db = drizzle(this.pool, { schema });
    console.log('[DatabaseStorage] Database storage initialized');
  }

  // Helper to convert Drizzle timestamps to ISO strings
  private toISO(date: Date | null | undefined): string | null {
    return date ? date.toISOString() : null;
  }

  // Helper to normalize user data
  private normalizeUser(user: any): User {
    return {
      ...user,
      createdAt: this.toISO(user.createdAt)!,
      updatedAt: this.toISO(user.updatedAt)!,
    };
  }

  // ==================== USERS ====================

  async getUsers(): Promise<User[]> {
    console.log('[DatabaseStorage] Getting all users');
    const users = await this.db.select().from(schema.users);
    return users.map(this.normalizeUser.bind(this));
  }

  async getUserById(id: number): Promise<User | null> {
    console.log(`[DatabaseStorage] Getting user by ID: ${id}`);
    const result = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);

    return result.length > 0 ? this.normalizeUser(result[0]) : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    console.log(`[DatabaseStorage] Getting user by email: ${email}`);
    const result = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    return result.length > 0 ? this.normalizeUser(result[0]) : null;
  }

  async createUser(data: InsertUser): Promise<User> {
    console.log(`[DatabaseStorage] Creating user: ${data.email}`);
    const result = await this.db.insert(schema.users).values(data).returning();
    return this.normalizeUser(result[0]);
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | null> {
    console.log(`[DatabaseStorage] Updating user: ${id}`);
    const result = await this.db
      .update(schema.users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();

    return result.length > 0 ? this.normalizeUser(result[0]) : null;
  }

  async deleteUser(id: number): Promise<boolean> {
    console.log(`[DatabaseStorage] Deleting user: ${id}`);
    const result = await this.db.delete(schema.users).where(eq(schema.users.id, id)).returning();
    return result.length > 0;
  }

  // ==================== FIZZCARDS ====================

  async getFizzCards(filters?: { isActive?: boolean; userId?: number }): Promise<FizzCard[]> {
    console.log('[DatabaseStorage] Getting FizzCards with filters');
    let query = this.db.select().from(schema.fizzCards);

    const conditions = [];
    if (filters?.isActive !== undefined) {
      conditions.push(eq(schema.fizzCards.isActive, filters.isActive));
    }
    if (filters?.userId !== undefined) {
      conditions.push(eq(schema.fizzCards.userId, filters.userId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const cards = await query;
    return cards.map((card: any) => ({
      ...card,
      createdAt: this.toISO(card.createdAt)!,
      updatedAt: this.toISO(card.updatedAt)!,
    }));
  }

  async getFizzCardById(id: number): Promise<FizzCard | null> {
    console.log(`[DatabaseStorage] Getting FizzCard by ID: ${id}`);
    const result = await this.db
      .select()
      .from(schema.fizzCards)
      .where(eq(schema.fizzCards.id, id))
      .limit(1);

    if (result.length === 0) return null;

    return {
      ...result[0],
      createdAt: this.toISO(result[0].createdAt)!,
      updatedAt: this.toISO(result[0].updatedAt)!,
    };
  }

  async getFizzCardsByUserId(userId: number): Promise<FizzCard[]> {
    console.log(`[DatabaseStorage] Getting FizzCards for user: ${userId}`);
    const cards = await this.db
      .select()
      .from(schema.fizzCards)
      .where(eq(schema.fizzCards.userId, userId));

    return cards.map((card) => ({
      ...card,
      createdAt: this.toISO(card.createdAt)!,
      updatedAt: this.toISO(card.updatedAt)!,
    }));
  }

  async createFizzCard(data: InsertFizzCard): Promise<FizzCard> {
    console.log(`[DatabaseStorage] Creating FizzCard for user: ${data.userId}`);
    const result = await this.db.insert(schema.fizzCards).values(data).returning();
    return {
      ...result[0],
      createdAt: this.toISO(result[0].createdAt)!,
      updatedAt: this.toISO(result[0].updatedAt)!,
    };
  }

  async updateFizzCard(id: number, data: Partial<InsertFizzCard>): Promise<FizzCard | null> {
    console.log(`[DatabaseStorage] Updating FizzCard: ${id}`);
    const result = await this.db
      .update(schema.fizzCards)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.fizzCards.id, id))
      .returning();

    if (result.length === 0) return null;

    return {
      ...result[0],
      createdAt: this.toISO(result[0].createdAt)!,
      updatedAt: this.toISO(result[0].updatedAt)!,
    };
  }

  async deleteFizzCard(id: number): Promise<boolean> {
    console.log(`[DatabaseStorage] Deleting FizzCard: ${id}`);
    const result = await this.db
      .delete(schema.fizzCards)
      .where(eq(schema.fizzCards.id, id))
      .returning();
    return result.length > 0;
  }

  // ==================== SOCIAL LINKS ====================

  async getSocialLinks(): Promise<SocialLink[]> {
    console.log('[DatabaseStorage] Getting all social links');
    const links = await this.db.select().from(schema.socialLinks);
    return links.map((link) => ({
      ...link,
      platform: link.platform as 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'github' | 'custom',
      createdAt: this.toISO(link.createdAt)!,
    }));
  }

  async getSocialLinkById(id: number): Promise<SocialLink | null> {
    console.log(`[DatabaseStorage] Getting social link by ID: ${id}`);
    const result = await this.db
      .select()
      .from(schema.socialLinks)
      .where(eq(schema.socialLinks.id, id))
      .limit(1);

    if (result.length === 0) return null;

    return {
      ...result[0],
      platform: result[0].platform as 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'github' | 'custom',
      createdAt: this.toISO(result[0].createdAt)!,
    };
  }

  async getSocialLinksByFizzCardId(fizzcardId: number): Promise<SocialLink[]> {
    console.log(`[DatabaseStorage] Getting social links for FizzCard: ${fizzcardId}`);
    const links = await this.db
      .select()
      .from(schema.socialLinks)
      .where(eq(schema.socialLinks.fizzcardId, fizzcardId));

    return links.map((link) => ({
      ...link,
      platform: link.platform as 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'github' | 'custom',
      createdAt: this.toISO(link.createdAt)!,
    }));
  }

  async createSocialLink(data: InsertSocialLink): Promise<SocialLink> {
    console.log(`[DatabaseStorage] Creating social link for FizzCard: ${data.fizzcardId}`);
    const result = await this.db.insert(schema.socialLinks).values(data).returning();
    return {
      ...result[0],
      platform: result[0].platform as 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'github' | 'custom',
      createdAt: this.toISO(result[0].createdAt)!,
    };
  }

  async updateSocialLink(id: number, data: Partial<InsertSocialLink>): Promise<SocialLink | null> {
    console.log(`[DatabaseStorage] Updating social link: ${id}`);
    const result = await this.db
      .update(schema.socialLinks)
      .set(data)
      .where(eq(schema.socialLinks.id, id))
      .returning();

    if (result.length === 0) return null;

    return {
      ...result[0],
      platform: result[0].platform as 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'github' | 'custom',
      createdAt: this.toISO(result[0].createdAt)!,
    };
  }

  async deleteSocialLink(id: number): Promise<boolean> {
    console.log(`[DatabaseStorage] Deleting social link: ${id}`);
    const result = await this.db
      .delete(schema.socialLinks)
      .where(eq(schema.socialLinks.id, id))
      .returning();
    return result.length > 0;
  }

  // ==================== CONTACT EXCHANGES ====================

  async getContactExchanges(): Promise<ContactExchange[]> {
    console.log('[DatabaseStorage] Getting all contact exchanges');
    const exchanges = await this.db.select().from(schema.contactExchanges);
    return exchanges.map((ex) => ({
      ...ex,
      status: ex.status as 'pending' | 'accepted' | 'rejected',
      method: ex.method as 'qr_code' | 'nfc' | 'direct_share',
      metAt: this.toISO(ex.metAt)!,
      createdAt: this.toISO(ex.createdAt)!,
      updatedAt: this.toISO(ex.updatedAt)!,
    }));
  }

  async getContactExchangeById(id: number): Promise<ContactExchange | null> {
    console.log(`[DatabaseStorage] Getting contact exchange by ID: ${id}`);
    const result = await this.db
      .select()
      .from(schema.contactExchanges)
      .where(eq(schema.contactExchanges.id, id))
      .limit(1);

    if (result.length === 0) return null;

    return {
      ...result[0],
      status: result[0].status as 'pending' | 'accepted' | 'rejected',
      method: result[0].method as 'qr_code' | 'nfc' | 'direct_share',
      metAt: this.toISO(result[0].metAt)!,
      createdAt: this.toISO(result[0].createdAt)!,
      updatedAt: this.toISO(result[0].updatedAt)!,
    };
  }

  async getContactExchangesBySenderId(
    senderId: number,
    filters?: { status?: string }
  ): Promise<ContactExchange[]> {
    console.log(`[DatabaseStorage] Getting contact exchanges for sender: ${senderId}`);

    const conditions = [eq(schema.contactExchanges.senderId, senderId)];
    if (filters?.status) {
      conditions.push(eq(schema.contactExchanges.status, filters.status));
    }

    const exchanges = await this.db
      .select()
      .from(schema.contactExchanges)
      .where(and(...conditions));

    return exchanges.map((ex) => ({
      ...ex,
      status: ex.status as 'pending' | 'accepted' | 'rejected',
      method: ex.method as 'qr_code' | 'nfc' | 'direct_share',
      metAt: this.toISO(ex.metAt)!,
      createdAt: this.toISO(ex.createdAt)!,
      updatedAt: this.toISO(ex.updatedAt)!,
    }));
  }

  async getContactExchangesByReceiverId(
    receiverId: number,
    filters?: { status?: string }
  ): Promise<ContactExchange[]> {
    console.log(`[DatabaseStorage] Getting contact exchanges for receiver: ${receiverId}`);

    const conditions = [eq(schema.contactExchanges.receiverId, receiverId)];
    if (filters?.status) {
      conditions.push(eq(schema.contactExchanges.status, filters.status));
    }

    const exchanges = await this.db
      .select()
      .from(schema.contactExchanges)
      .where(and(...conditions));

    return exchanges.map((ex) => ({
      ...ex,
      status: ex.status as 'pending' | 'accepted' | 'rejected',
      method: ex.method as 'qr_code' | 'nfc' | 'direct_share',
      metAt: this.toISO(ex.metAt)!,
      createdAt: this.toISO(ex.createdAt)!,
      updatedAt: this.toISO(ex.updatedAt)!,
    }));
  }

  async createContactExchange(data: InsertContactExchange): Promise<ContactExchange> {
    console.log(
      `[DatabaseStorage] Creating contact exchange: ${data.senderId} → ${data.receiverId}`
    );
    const insertData = {
      ...data,
      metAt: new Date(data.metAt)
    };
    const result = await this.db.insert(schema.contactExchanges).values(insertData).returning();
    return {
      ...result[0],
      status: result[0].status as 'pending' | 'accepted' | 'rejected',
      method: result[0].method as 'qr_code' | 'nfc' | 'direct_share',
      metAt: this.toISO(result[0].metAt)!,
      createdAt: this.toISO(result[0].createdAt)!,
      updatedAt: this.toISO(result[0].updatedAt)!,
    };
  }

  async updateContactExchange(
    id: number,
    data: Partial<InsertContactExchange>
  ): Promise<ContactExchange | null> {
    console.log(`[DatabaseStorage] Updating contact exchange: ${id}`);
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.metAt) {
      updateData.metAt = new Date(data.metAt);
    }
    const result = await this.db
      .update(schema.contactExchanges)
      .set(updateData)
      .where(eq(schema.contactExchanges.id, id))
      .returning();

    if (result.length === 0) return null;

    return {
      ...result[0],
      status: result[0].status as 'pending' | 'accepted' | 'rejected',
      method: result[0].method as 'qr_code' | 'nfc' | 'direct_share',
      metAt: this.toISO(result[0].metAt)!,
      createdAt: this.toISO(result[0].createdAt)!,
      updatedAt: this.toISO(result[0].updatedAt)!,
    };
  }

  // ==================== CONNECTIONS ====================

  async getConnections(): Promise<Connection[]> {
    console.log('[DatabaseStorage] Getting all connections');
    const connections = await this.db.select().from(schema.connections);
    return connections.map((conn) => ({
      ...conn,
      tags: Array.isArray(conn.tags) ? conn.tags : [],
      createdAt: this.toISO(conn.createdAt)!,
      updatedAt: this.toISO(conn.updatedAt)!,
    }));
  }

  async getConnectionById(id: number): Promise<Connection | null> {
    console.log(`[DatabaseStorage] Getting connection by ID: ${id}`);
    const result = await this.db
      .select()
      .from(schema.connections)
      .where(eq(schema.connections.id, id))
      .limit(1);

    if (result.length === 0) return null;

    return {
      ...result[0],
      tags: Array.isArray(result[0].tags) ? result[0].tags : [],
      createdAt: this.toISO(result[0].createdAt)!,
      updatedAt: this.toISO(result[0].updatedAt)!,
    };
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
    console.log(`[DatabaseStorage] Getting connections for user: ${userId}`);
    const conditions = [eq(schema.connections.userId, userId)];

    if (filters?.dateFrom) {
      conditions.push(gte(schema.connections.createdAt, new Date(filters.dateFrom)));
    }
    if (filters?.dateTo) {
      conditions.push(lte(schema.connections.createdAt, new Date(filters.dateTo)));
    }

    const connections = await this.db
      .select()
      .from(schema.connections)
      .where(and(...conditions));

    let result = connections.map((conn) => ({
      ...conn,
      tags: Array.isArray(conn.tags) ? conn.tags : [],
      createdAt: this.toISO(conn.createdAt)!,
      updatedAt: this.toISO(conn.updatedAt)!,
    }));

    // Filter by tags in memory (JSON field filtering)
    if (filters?.tags && filters.tags.length > 0) {
      result = result.filter((conn) => filters.tags!.some((tag) => conn.tags.includes(tag)));
    }

    return result;
  }

  async createConnection(data: InsertConnection): Promise<Connection> {
    console.log(`[DatabaseStorage] Creating connection: ${data.userId} ↔ ${data.connectedUserId}`);
    const result = await this.db.insert(schema.connections).values(data).returning();
    return {
      ...result[0],
      tags: Array.isArray(result[0].tags) ? result[0].tags : [],
      createdAt: this.toISO(result[0].createdAt)!,
      updatedAt: this.toISO(result[0].updatedAt)!,
    };
  }

  async updateConnection(id: number, data: Partial<InsertConnection>): Promise<Connection | null> {
    console.log(`[DatabaseStorage] Updating connection: ${id}`);
    const result = await this.db
      .update(schema.connections)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.connections.id, id))
      .returning();

    if (result.length === 0) return null;

    return {
      ...result[0],
      tags: Array.isArray(result[0].tags) ? result[0].tags : [],
      createdAt: this.toISO(result[0].createdAt)!,
      updatedAt: this.toISO(result[0].updatedAt)!,
    };
  }

  async deleteConnection(id: number): Promise<boolean> {
    console.log(`[DatabaseStorage] Deleting connection: ${id}`);
    const result = await this.db
      .delete(schema.connections)
      .where(eq(schema.connections.id, id))
      .returning();
    return result.length > 0;
  }

  // ==================== FIZZCOIN WALLETS ====================

  async getWallet(id: number): Promise<FizzCoinWallet | null> {
    console.log(`[DatabaseStorage] Getting wallet by ID: ${id}`);
    const result = await this.db
      .select()
      .from(schema.fizzCoinWallets)
      .where(eq(schema.fizzCoinWallets.id, id))
      .limit(1);

    if (result.length === 0) return null;

    return {
      ...result[0],
      balance: Number(result[0].balance),
      totalEarned: Number(result[0].totalEarned),
      totalSpent: Number(result[0].totalSpent),
      lastTransactionAt: this.toISO(result[0].lastTransactionAt),
      createdAt: this.toISO(result[0].createdAt)!,
      updatedAt: this.toISO(result[0].updatedAt)!,
    };
  }

  async getWalletByUserId(userId: number): Promise<FizzCoinWallet | null> {
    console.log(`[DatabaseStorage] Getting wallet for user: ${userId}`);
    const result = await this.db
      .select()
      .from(schema.fizzCoinWallets)
      .where(eq(schema.fizzCoinWallets.userId, userId))
      .limit(1);

    if (result.length === 0) return null;

    return {
      ...result[0],
      balance: Number(result[0].balance),
      totalEarned: Number(result[0].totalEarned),
      totalSpent: Number(result[0].totalSpent),
      lastTransactionAt: this.toISO(result[0].lastTransactionAt),
      createdAt: this.toISO(result[0].createdAt)!,
      updatedAt: this.toISO(result[0].updatedAt)!,
    };
  }

  async createWallet(data: InsertFizzCoinWallet): Promise<FizzCoinWallet> {
    console.log(`[DatabaseStorage] Creating wallet for user: ${data.userId}`);
    const insertData: any = {
      ...data,
      balance: data.balance?.toString() || '0',
      totalEarned: data.totalEarned?.toString() || '0',
      totalSpent: data.totalSpent?.toString() || '0'
    };
    if (data.lastTransactionAt) {
      insertData.lastTransactionAt = new Date(data.lastTransactionAt);
    }
    const result = await this.db.insert(schema.fizzCoinWallets).values(insertData).returning();
    return {
      ...result[0],
      balance: Number(result[0].balance),
      totalEarned: Number(result[0].totalEarned),
      totalSpent: Number(result[0].totalSpent),
      lastTransactionAt: this.toISO(result[0].lastTransactionAt),
      createdAt: this.toISO(result[0].createdAt)!,
      updatedAt: this.toISO(result[0].updatedAt)!,
    };
  }

  async updateWallet(id: number, data: Partial<InsertFizzCoinWallet>): Promise<FizzCoinWallet | null> {
    console.log(`[DatabaseStorage] Updating wallet: ${id}`);
    const updateData: any = {
      ...data,
      lastTransactionAt: new Date(),
      updatedAt: new Date(),
    };
    if (data.balance !== undefined) updateData.balance = data.balance.toString();
    if (data.totalEarned !== undefined) updateData.totalEarned = data.totalEarned.toString();
    if (data.totalSpent !== undefined) updateData.totalSpent = data.totalSpent.toString();

    const result = await this.db
      .update(schema.fizzCoinWallets)
      .set(updateData)
      .where(eq(schema.fizzCoinWallets.id, id))
      .returning();

    if (result.length === 0) return null;

    return {
      ...result[0],
      balance: Number(result[0].balance),
      totalEarned: Number(result[0].totalEarned),
      totalSpent: Number(result[0].totalSpent),
      lastTransactionAt: this.toISO(result[0].lastTransactionAt),
      createdAt: this.toISO(result[0].createdAt)!,
      updatedAt: this.toISO(result[0].updatedAt)!,
    };
  }

  async updateWalletBalance(
    userId: number,
    amountChange: number,
    isEarning: boolean
  ): Promise<FizzCoinWallet | null> {
    console.log(
      `[DatabaseStorage] Updating wallet balance for user ${userId}: ${amountChange} (earning: ${isEarning})`
    );

    const wallet = await this.getWalletByUserId(userId);
    if (!wallet) {
      console.log(`[DatabaseStorage] Wallet not found for user: ${userId}`);
      return null;
    }

    const newBalance = wallet.balance + amountChange;
    if (newBalance < 0) {
      console.log(`[DatabaseStorage] Insufficient balance for user: ${userId}`);
      return null;
    }

    const totalEarned = isEarning ? wallet.totalEarned + amountChange : wallet.totalEarned;
    const totalSpent = !isEarning ? wallet.totalSpent + Math.abs(amountChange) : wallet.totalSpent;

    return this.updateWallet(wallet.id, {
      balance: newBalance,
      totalEarned,
      totalSpent,
    });
  }

  // ==================== CRYPTO WALLETS (Blockchain) ====================

  async getCryptoWallet(id: number): Promise<CryptoWallet | null> {
    console.log(`[DatabaseStorage] Getting crypto wallet by ID: ${id}`);
    const result = await this.db
      .select()
      .from(schema.cryptoWallets)
      .where(eq(schema.cryptoWallets.id, id))
      .limit(1);

    if (result.length === 0) return null;

    return {
      ...result[0],
      walletType: result[0].walletType as 'embedded' | 'external',
      lastClaimAt: this.toISO(result[0].lastClaimAt),
      createdAt: this.toISO(result[0].createdAt)!,
      updatedAt: this.toISO(result[0].updatedAt)!,
    };
  }

  async getCryptoWalletByUserId(userId: number): Promise<CryptoWallet | null> {
    console.log(`[DatabaseStorage] Getting crypto wallet for user: ${userId}`);
    const result = await this.db
      .select()
      .from(schema.cryptoWallets)
      .where(eq(schema.cryptoWallets.userId, userId))
      .limit(1);

    if (result.length === 0) return null;

    return {
      ...result[0],
      walletType: result[0].walletType as 'embedded' | 'external',
      lastClaimAt: this.toISO(result[0].lastClaimAt),
      createdAt: this.toISO(result[0].createdAt)!,
      updatedAt: this.toISO(result[0].updatedAt)!,
    };
  }

  async getCryptoWalletByAddress(walletAddress: string): Promise<CryptoWallet | null> {
    console.log(`[DatabaseStorage] Getting crypto wallet by address: ${walletAddress}`);
    const result = await this.db
      .select()
      .from(schema.cryptoWallets)
      .where(eq(schema.cryptoWallets.walletAddress, walletAddress))
      .limit(1);

    if (result.length === 0) return null;

    return {
      ...result[0],
      walletType: result[0].walletType as 'embedded' | 'external',
      lastClaimAt: this.toISO(result[0].lastClaimAt),
      createdAt: this.toISO(result[0].createdAt)!,
      updatedAt: this.toISO(result[0].updatedAt)!,
    };
  }

  async createCryptoWallet(data: InsertCryptoWallet): Promise<CryptoWallet> {
    console.log(`[DatabaseStorage] Creating crypto wallet for user: ${data.userId} (${data.walletAddress})`);
    const insertData: any = {
      ...data,
    };
    if (data.lastClaimAt) {
      insertData.lastClaimAt = new Date(data.lastClaimAt);
    }
    const result = await this.db.insert(schema.cryptoWallets).values(insertData).returning();
    return {
      ...result[0],
      walletType: result[0].walletType as 'embedded' | 'external',
      lastClaimAt: this.toISO(result[0].lastClaimAt),
      createdAt: this.toISO(result[0].createdAt)!,
      updatedAt: this.toISO(result[0].updatedAt)!,
    };
  }

  async updateCryptoWallet(id: number, data: Partial<InsertCryptoWallet>): Promise<CryptoWallet | null> {
    console.log(`[DatabaseStorage] Updating crypto wallet: ${id}`);
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    };
    if (data.lastClaimAt) {
      updateData.lastClaimAt = new Date(data.lastClaimAt);
    }

    const result = await this.db
      .update(schema.cryptoWallets)
      .set(updateData)
      .where(eq(schema.cryptoWallets.id, id))
      .returning();

    if (result.length === 0) return null;

    return {
      ...result[0],
      walletType: result[0].walletType as 'embedded' | 'external',
      lastClaimAt: this.toISO(result[0].lastClaimAt),
      createdAt: this.toISO(result[0].createdAt)!,
      updatedAt: this.toISO(result[0].updatedAt)!,
    };
  }

  async incrementPendingClaims(userId: number, amount: number): Promise<CryptoWallet | null> {
    console.log(`[DatabaseStorage] Incrementing pending claims for user ${userId}: +${amount}`);
    const wallet = await this.getCryptoWalletByUserId(userId);
    if (!wallet) {
      console.log(`[DatabaseStorage] Crypto wallet not found for user: ${userId}`);
      return null;
    }

    const newPendingAmount = wallet.pendingClaimAmount + amount;
    return this.updateCryptoWallet(wallet.id, {
      pendingClaimAmount: newPendingAmount,
    });
  }

  async resetPendingClaims(userId: number): Promise<CryptoWallet | null> {
    console.log(`[DatabaseStorage] Resetting pending claims for user ${userId}`);
    const wallet = await this.getCryptoWalletByUserId(userId);
    if (!wallet) {
      console.log(`[DatabaseStorage] Crypto wallet not found for user: ${userId}`);
      return null;
    }

    return this.updateCryptoWallet(wallet.id, {
      pendingClaimAmount: 0,
    });
  }

  async updateLastClaimAt(userId: number, timestamp: Date): Promise<CryptoWallet | null> {
    console.log(`[DatabaseStorage] Updating last claim timestamp for user ${userId}`);
    const wallet = await this.getCryptoWalletByUserId(userId);
    if (!wallet) {
      console.log(`[DatabaseStorage] Crypto wallet not found for user: ${userId}`);
      return null;
    }

    return this.updateCryptoWallet(wallet.id, {
      lastClaimAt: timestamp.toISOString(),
    });
  }

  // ==================== FIZZCOIN TRANSACTIONS ====================

  async getTransactions(): Promise<FizzCoinTransaction[]> {
    console.log('[DatabaseStorage] Getting all transactions');
    const transactions = await this.db.select().from(schema.fizzCoinTransactions);
    return transactions.map((tx) => ({
      ...tx,
      amount: Number(tx.amount),
      transactionType: tx.transactionType as 'exchange' | 'introduction' | 'referral' | 'bonus' | 'trade',
      metadata: tx.metadata as Record<string, any> | null,
      createdAt: this.toISO(tx.createdAt)!,
    }));
  }

  async getTransactionById(id: number): Promise<FizzCoinTransaction | null> {
    console.log(`[DatabaseStorage] Getting transaction by ID: ${id}`);
    const result = await this.db
      .select()
      .from(schema.fizzCoinTransactions)
      .where(eq(schema.fizzCoinTransactions.id, id))
      .limit(1);

    if (result.length === 0) return null;

    return {
      ...result[0],
      amount: Number(result[0].amount),
      transactionType: result[0].transactionType as 'exchange' | 'introduction' | 'referral' | 'bonus' | 'trade',
      metadata: result[0].metadata as Record<string, any> | null,
      createdAt: this.toISO(result[0].createdAt)!,
    };
  }

  async getTransactionsByUserId(
    userId: number,
    filters?: { type?: string; dateFrom?: string; dateTo?: string }
  ): Promise<FizzCoinTransaction[]> {
    console.log(`[DatabaseStorage] Getting transactions for user: ${userId}`);
    const conditions = [eq(schema.fizzCoinTransactions.userId, userId)];

    if (filters?.type) {
      conditions.push(eq(schema.fizzCoinTransactions.transactionType, filters.type));
    }
    if (filters?.dateFrom) {
      conditions.push(gte(schema.fizzCoinTransactions.createdAt, new Date(filters.dateFrom)));
    }
    if (filters?.dateTo) {
      conditions.push(lte(schema.fizzCoinTransactions.createdAt, new Date(filters.dateTo)));
    }

    const transactions = await this.db
      .select()
      .from(schema.fizzCoinTransactions)
      .where(and(...conditions))
      .orderBy(desc(schema.fizzCoinTransactions.createdAt));

    return transactions.map((tx) => ({
      ...tx,
      amount: Number(tx.amount),
      transactionType: tx.transactionType as 'exchange' | 'introduction' | 'referral' | 'bonus' | 'trade',
      metadata: tx.metadata as Record<string, any> | null,
      createdAt: this.toISO(tx.createdAt)!,
    }));
  }

  async createTransaction(data: InsertFizzCoinTransaction): Promise<FizzCoinTransaction> {
    console.log(
      `[DatabaseStorage] Creating transaction: User ${data.userId}, ${data.amount} FizzCoins`
    );
    const insertData = {
      ...data,
      amount: data.amount.toString()
    };
    const result = await this.db.insert(schema.fizzCoinTransactions).values(insertData).returning();
    return {
      ...result[0],
      amount: Number(result[0].amount),
      transactionType: result[0].transactionType as 'exchange' | 'introduction' | 'referral' | 'bonus' | 'trade',
      metadata: result[0].metadata as Record<string, any> | null,
      createdAt: this.toISO(result[0].createdAt)!,
    };
  }

  // Alias for blockchain transaction creation
  async createFizzCoinTransaction(data: InsertFizzCoinTransaction): Promise<FizzCoinTransaction> {
    return this.createTransaction(data);
  }

  // ==================== INTRODUCTIONS ====================

  async getIntroductions(): Promise<Introduction[]> {
    console.log('[DatabaseStorage] Getting all introductions');
    const introductions = await this.db.select().from(schema.introductions);
    return introductions.map((intro) => ({
      ...intro,
      status: intro.status as 'pending' | 'completed' | 'declined',
      fizzcoinReward: Number(intro.fizzcoinReward),
      createdAt: this.toISO(intro.createdAt)!,
      updatedAt: this.toISO(intro.updatedAt)!,
    }));
  }

  async getIntroductionById(id: number): Promise<Introduction | null> {
    console.log(`[DatabaseStorage] Getting introduction by ID: ${id}`);
    const result = await this.db
      .select()
      .from(schema.introductions)
      .where(eq(schema.introductions.id, id))
      .limit(1);

    if (result.length === 0) return null;

    return {
      ...result[0],
      status: result[0].status as 'pending' | 'completed' | 'declined',
      fizzcoinReward: Number(result[0].fizzcoinReward),
      createdAt: this.toISO(result[0].createdAt)!,
      updatedAt: this.toISO(result[0].updatedAt)!,
    };
  }

  async getIntroductionsByIntroducerId(introducerId: number): Promise<Introduction[]> {
    console.log(`[DatabaseStorage] Getting introductions by introducer: ${introducerId}`);
    const introductions = await this.db
      .select()
      .from(schema.introductions)
      .where(eq(schema.introductions.introducerId, introducerId));

    return introductions.map((intro) => ({
      ...intro,
      status: intro.status as 'pending' | 'completed' | 'declined',
      fizzcoinReward: Number(intro.fizzcoinReward),
      createdAt: this.toISO(intro.createdAt)!,
      updatedAt: this.toISO(intro.updatedAt)!,
    }));
  }

  async getIntroductionsByPersonId(personId: number): Promise<Introduction[]> {
    console.log(`[DatabaseStorage] Getting introductions involving person: ${personId}`);
    const introductions = await this.db
      .select()
      .from(schema.introductions)
      .where(
        sql`${schema.introductions.personAId} = ${personId} OR ${schema.introductions.personBId} = ${personId}`
      );

    return introductions.map((intro) => ({
      ...intro,
      status: intro.status as 'pending' | 'completed' | 'declined',
      fizzcoinReward: Number(intro.fizzcoinReward),
      createdAt: this.toISO(intro.createdAt)!,
      updatedAt: this.toISO(intro.updatedAt)!,
    }));
  }

  async createIntroduction(data: InsertIntroduction): Promise<Introduction> {
    console.log(`[DatabaseStorage] Creating introduction by user: ${data.introducerId}`);
    const insertData = {
      ...data,
      fizzcoinReward: data.fizzcoinReward?.toString() || '0'
    };
    const result = await this.db.insert(schema.introductions).values(insertData).returning();
    return {
      ...result[0],
      status: result[0].status as 'pending' | 'completed' | 'declined',
      fizzcoinReward: Number(result[0].fizzcoinReward),
      createdAt: this.toISO(result[0].createdAt)!,
      updatedAt: this.toISO(result[0].updatedAt)!,
    };
  }

  async updateIntroduction(
    id: number,
    data: Partial<InsertIntroduction>
  ): Promise<Introduction | null> {
    console.log(`[DatabaseStorage] Updating introduction: ${id}`);
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.fizzcoinReward !== undefined) {
      updateData.fizzcoinReward = data.fizzcoinReward.toString();
    }
    const result = await this.db
      .update(schema.introductions)
      .set(updateData)
      .where(eq(schema.introductions.id, id))
      .returning();

    if (result.length === 0) return null;

    return {
      ...result[0],
      status: result[0].status as 'pending' | 'completed' | 'declined',
      fizzcoinReward: Number(result[0].fizzcoinReward),
      createdAt: this.toISO(result[0].createdAt)!,
      updatedAt: this.toISO(result[0].updatedAt)!,
    };
  }

  // ==================== EVENTS ====================

  async getEvents(filters?: { isExclusive?: boolean }): Promise<Event[]> {
    console.log('[DatabaseStorage] Getting events');
    let query = this.db.select().from(schema.events);

    if (filters?.isExclusive !== undefined) {
      query = query.where(eq(schema.events.isExclusive, filters.isExclusive)) as any;
    }

    const events = await query;
    return events.map((event: any) => ({
      ...event,
      minFizzcoinRequired: Number(event.minFizzcoinRequired),
      startDate: this.toISO(event.startDate)!,
      endDate: this.toISO(event.endDate)!,
      createdAt: this.toISO(event.createdAt)!,
      updatedAt: this.toISO(event.updatedAt)!,
    }));
  }

  async getEventById(id: number): Promise<Event | null> {
    console.log(`[DatabaseStorage] Getting event by ID: ${id}`);
    const result = await this.db
      .select()
      .from(schema.events)
      .where(eq(schema.events.id, id))
      .limit(1);

    if (result.length === 0) return null;

    return {
      ...result[0],
      minFizzcoinRequired: Number(result[0].minFizzcoinRequired),
      startDate: this.toISO(result[0].startDate)!,
      endDate: this.toISO(result[0].endDate)!,
      createdAt: this.toISO(result[0].createdAt)!,
      updatedAt: this.toISO(result[0].updatedAt)!,
    };
  }

  async createEvent(data: InsertEvent): Promise<Event> {
    console.log(`[DatabaseStorage] Creating event: ${data.name}`);
    const insertData = {
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      minFizzcoinRequired: data.minFizzcoinRequired?.toString() || '0'
    };
    const result = await this.db.insert(schema.events).values(insertData).returning();
    return {
      ...result[0],
      minFizzcoinRequired: Number(result[0].minFizzcoinRequired),
      startDate: this.toISO(result[0].startDate)!,
      endDate: this.toISO(result[0].endDate)!,
      createdAt: this.toISO(result[0].createdAt)!,
      updatedAt: this.toISO(result[0].updatedAt)!,
    };
  }

  async updateEvent(id: number, data: Partial<InsertEvent>): Promise<Event | null> {
    console.log(`[DatabaseStorage] Updating event: ${id}`);
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.minFizzcoinRequired !== undefined) updateData.minFizzcoinRequired = data.minFizzcoinRequired.toString();

    const result = await this.db
      .update(schema.events)
      .set(updateData)
      .where(eq(schema.events.id, id))
      .returning();

    if (result.length === 0) return null;

    return {
      ...result[0],
      minFizzcoinRequired: Number(result[0].minFizzcoinRequired),
      startDate: this.toISO(result[0].startDate)!,
      endDate: this.toISO(result[0].endDate)!,
      createdAt: this.toISO(result[0].createdAt)!,
      updatedAt: this.toISO(result[0].updatedAt)!,
    };
  }

  async deleteEvent(id: number): Promise<boolean> {
    console.log(`[DatabaseStorage] Deleting event: ${id}`);
    const result = await this.db.delete(schema.events).where(eq(schema.events.id, id)).returning();
    return result.length > 0;
  }

  // ==================== EVENT ATTENDEES ====================

  async getEventAttendees(eventId: number): Promise<EventAttendee[]> {
    console.log(`[DatabaseStorage] Getting attendees for event: ${eventId}`);
    const attendees = await this.db
      .select()
      .from(schema.eventAttendees)
      .where(eq(schema.eventAttendees.eventId, eventId));

    return attendees.map((att) => ({
      ...att,
      checkInAt: this.toISO(att.checkInAt),
      createdAt: this.toISO(att.createdAt)!,
    }));
  }

  async getEventAttendeesByUserId(userId: number): Promise<EventAttendee[]> {
    console.log(`[DatabaseStorage] Getting event attendances for user: ${userId}`);
    const attendees = await this.db
      .select()
      .from(schema.eventAttendees)
      .where(eq(schema.eventAttendees.userId, userId));

    return attendees.map((att) => ({
      ...att,
      checkInAt: this.toISO(att.checkInAt),
      createdAt: this.toISO(att.createdAt)!,
    }));
  }

  async createEventAttendee(data: InsertEventAttendee): Promise<EventAttendee> {
    console.log(
      `[DatabaseStorage] Creating event attendee: User ${data.userId}, Event ${data.eventId}`
    );
    const insertData: any = { ...data };
    if (data.checkInAt) {
      insertData.checkInAt = new Date(data.checkInAt);
    }
    const result = await this.db.insert(schema.eventAttendees).values(insertData).returning();
    return {
      ...result[0],
      checkInAt: this.toISO(result[0].checkInAt),
      createdAt: this.toISO(result[0].createdAt)!,
    };
  }

  async checkInToEvent(eventId: number, userId: number): Promise<EventAttendee | null> {
    console.log(`[DatabaseStorage] Checking in user ${userId} to event ${eventId}`);
    const result = await this.db
      .update(schema.eventAttendees)
      .set({ checkInAt: new Date() })
      .where(
        and(
          eq(schema.eventAttendees.eventId, eventId),
          eq(schema.eventAttendees.userId, userId)
        )
      )
      .returning();

    if (result.length === 0) return null;

    return {
      ...result[0],
      checkInAt: this.toISO(result[0].checkInAt),
      createdAt: this.toISO(result[0].createdAt)!,
    };
  }

  // ==================== BADGES ====================

  async getBadges(): Promise<Badge[]> {
    console.log('[DatabaseStorage] Getting all badges');
    const badges = await this.db.select().from(schema.badges);
    return badges.map((badge) => ({
      ...badge,
      badgeType: badge.badgeType as 'verified' | 'super_connector' | 'early_adopter' | 'top_earner' | 'event_host',
      earnedAt: this.toISO(badge.earnedAt)!,
      createdAt: this.toISO(badge.createdAt)!,
    }));
  }

  async getBadgesByUserId(userId: number): Promise<Badge[]> {
    console.log(`[DatabaseStorage] Getting badges for user: ${userId}`);
    const badges = await this.db
      .select()
      .from(schema.badges)
      .where(eq(schema.badges.userId, userId));

    return badges.map((badge) => ({
      ...badge,
      badgeType: badge.badgeType as 'verified' | 'super_connector' | 'early_adopter' | 'top_earner' | 'event_host',
      earnedAt: this.toISO(badge.earnedAt)!,
      createdAt: this.toISO(badge.createdAt)!,
    }));
  }

  async createBadge(data: InsertBadge): Promise<Badge> {
    console.log(`[DatabaseStorage] Creating badge: ${data.badgeType} for user ${data.userId}`);
    const insertData = {
      ...data,
      earnedAt: new Date(data.earnedAt)
    };
    const result = await this.db.insert(schema.badges).values(insertData).returning();
    return {
      ...result[0],
      badgeType: result[0].badgeType as 'verified' | 'super_connector' | 'early_adopter' | 'top_earner' | 'event_host',
      earnedAt: this.toISO(result[0].earnedAt)!,
      createdAt: this.toISO(result[0].createdAt)!,
    };
  }

  async deleteBadge(id: number): Promise<boolean> {
    console.log(`[DatabaseStorage] Deleting badge: ${id}`);
    const result = await this.db.delete(schema.badges).where(eq(schema.badges.id, id)).returning();
    return result.length > 0;
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
    console.log(`[DatabaseStorage] Getting leaderboard (limit: ${limit})`);

    // Get all users with their wallets
    const users = await this.db.select().from(schema.users);

    const leaderboardEntries = await Promise.all(
      users.map(async (user) => {
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
    console.log(`[DatabaseStorage] Creating search history for user: ${data.userId}`);
    const result = await this.db.insert(schema.searchHistory).values(data).returning();
    return {
      ...result[0],
      filters: result[0].filters as Record<string, any> | null,
      createdAt: this.toISO(result[0].createdAt)!,
    };
  }

  async getSearchHistoryByUserId(userId: number, limit = 10): Promise<SearchHistory[]> {
    console.log(`[DatabaseStorage] Getting search history for user: ${userId} (limit: ${limit})`);
    const history = await this.db
      .select()
      .from(schema.searchHistory)
      .where(eq(schema.searchHistory.userId, userId))
      .orderBy(desc(schema.searchHistory.createdAt))
      .limit(limit);

    return history.map((sh) => ({
      ...sh,
      filters: sh.filters as Record<string, any> | null,
      createdAt: this.toISO(sh.createdAt)!,
    }));
  }

  // ==================== NETWORK GRAPH ====================

  /**
   * Get network graph using BFS traversal
   * @param depth - Maximum depth to traverse (1-5)
   * @param centerUserId - Optional user to center the graph on (ego network)
   */
  async getNetworkGraph(depth: number = 2, centerUserId?: number): Promise<NetworkGraph> {
    console.log(`[DatabaseStorage] Getting network graph (depth: ${depth}, centerUser: ${centerUserId || 'all'})`);

    const nodes = new Map<number, NetworkGraph['nodes'][0]>();
    const links: NetworkGraph['links'] = [];
    const visited = new Set<number>();
    const queue: Array<{ userId: number; currentDepth: number }> = [];

    // Build adjacency map for efficient lookup
    const allConnections = await this.getConnections();
    const adjacencyMap = new Map<number, Connection[]>();
    for (const conn of allConnections) {
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
        console.log(`[DatabaseStorage] Center user not found: ${centerUserId}`);
        return { nodes: [], links: [] };
      }
      queue.push({ userId: centerUserId, currentDepth: 0 });
      visited.add(centerUserId);
    } else {
      // Full network: start from all users
      const allUsers = await this.getUsers();
      for (const user of allUsers) {
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

    console.log(`[DatabaseStorage] Network graph built: ${result.nodes.length} nodes, ${result.links.length} links`);
    return result;
  }

  /**
   * Calculate network statistics for a user
   * @param userId - User ID to calculate stats for
   */
  async getNetworkStats(userId: number): Promise<NetworkStats> {
    console.log(`[DatabaseStorage] Calculating network stats for user: ${userId}`);

    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // Get direct connections
    const directConnections = await this.getConnectionsByUserId(userId);
    const directConnectionIds = new Set(directConnections.map((c) => c.connectedUserId));
    const directCount = directConnections.length;

    console.log(`[DatabaseStorage] Direct connections: ${directCount}`);

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

    console.log(`[DatabaseStorage] Second-degree connections: ${secondDegreeCount}`);

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
    console.log(`[DatabaseStorage] Network size (reachable nodes): ${networkSize}`);

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

    console.log(`[DatabaseStorage] Clustering coefficient: ${clusteringCoefficient} (triangles: ${triangles})`);

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

    console.log(`[DatabaseStorage] Average path length: ${averagePathLength}`);

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
    console.log(`[DatabaseStorage] Getting super connectors (limit: ${limit})`);

    // Build connection counts
    const allConnections = await this.getConnections();
    const connectionCounts = new Map<number, number>();
    for (const conn of allConnections) {
      const currentCount = connectionCounts.get(conn.userId) || 0;
      connectionCounts.set(conn.userId, currentCount + 1);
    }

    // Get all users with their connection counts
    const allUsers = await this.getUsers();
    const userWithCounts = await Promise.all(
      allUsers.map(async (user) => {
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

    console.log(`[DatabaseStorage] Super connectors found: ${result.length}`);
    return result;
  }
}
