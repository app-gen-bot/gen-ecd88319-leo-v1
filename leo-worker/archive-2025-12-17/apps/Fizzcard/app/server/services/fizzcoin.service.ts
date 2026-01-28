/**
 * FizzCoin Service
 *
 * Business logic for FizzCoin reward calculations and transactions.
 * Implements the reward system based on user actions.
 */

import { storage } from '../lib/storage/factory';

/**
 * FizzCoin reward amounts
 */
const REWARDS = {
  EXCHANGE_ACCEPTED: 25, // Both sender and receiver get this
  INTRODUCTION_COMPLETED: 50,
  REFERRAL_SIGNUP: 100,
  EVENT_CHECKIN: 20,
  SUPER_CONNECTOR_MULTIPLIER: 2,
};

export class FizzCoinService {
  /**
   * Award FizzCoins for an accepted contact exchange
   * Both users get rewarded
   */
  async awardExchangeReward(senderId: number, receiverId: number): Promise<number> {
    console.log(`[FizzCoin] Awarding exchange reward to users ${senderId} and ${receiverId}`);

    const amount = REWARDS.EXCHANGE_ACCEPTED;

    // Award to sender
    await this.awardCoins(senderId, amount, 'exchange', {
      receiverId,
      action: 'exchange_accepted',
    });

    // Award to receiver
    await this.awardCoins(receiverId, amount, 'exchange', {
      senderId,
      action: 'exchange_accepted',
    });

    console.log(`[FizzCoin] Exchange reward completed: ${amount} coins to each user`);
    return amount;
  }

  /**
   * Award FizzCoins for a completed introduction
   */
  async awardIntroductionReward(introducerId: number, introductionId: number): Promise<number> {
    console.log(`[FizzCoin] Awarding introduction reward to user ${introducerId}`);

    const baseAmount = REWARDS.INTRODUCTION_COMPLETED;
    const multiplier = await this.getSuperConnectorMultiplier(introducerId);
    const amount = baseAmount * multiplier;

    await this.awardCoins(introducerId, amount, 'introduction', {
      introductionId,
      baseAmount,
      multiplier,
    });

    console.log(
      `[FizzCoin] Introduction reward completed: ${amount} coins (base: ${baseAmount}, multiplier: ${multiplier})`
    );
    return amount;
  }

  /**
   * Award FizzCoins for a referral signup
   */
  async awardReferralReward(referrerId: number, newUserId: number): Promise<number> {
    console.log(`[FizzCoin] Awarding referral reward to user ${referrerId}`);

    const baseAmount = REWARDS.REFERRAL_SIGNUP;
    const multiplier = await this.getSuperConnectorMultiplier(referrerId);
    const amount = baseAmount * multiplier;

    await this.awardCoins(referrerId, amount, 'referral', {
      newUserId,
      baseAmount,
      multiplier,
    });

    console.log(
      `[FizzCoin] Referral reward completed: ${amount} coins (base: ${baseAmount}, multiplier: ${multiplier})`
    );
    return amount;
  }

  /**
   * Award FizzCoins for event check-in
   */
  async awardEventCheckinReward(userId: number, eventId: number): Promise<number> {
    console.log(`[FizzCoin] Awarding event check-in reward to user ${userId}`);

    const amount = REWARDS.EVENT_CHECKIN;

    await this.awardCoins(userId, amount, 'bonus', {
      eventId,
      action: 'event_checkin',
    });

    console.log(`[FizzCoin] Event check-in reward completed: ${amount} coins`);
    return amount;
  }

  /**
   * Get super-connector multiplier for a user
   * Returns 2 if user is a super-connector, 1 otherwise
   */
  async getSuperConnectorMultiplier(userId: number): Promise<number> {
    const badges = await storage.getBadgesByUserId(userId);
    const isSuperConnector = badges.some((badge) => badge.badgeType === 'super_connector');

    return isSuperConnector ? REWARDS.SUPER_CONNECTOR_MULTIPLIER : 1;
  }

  /**
   * Award FizzCoins to a user
   * Creates transaction and updates wallet balance
   */
  private async awardCoins(
    userId: number,
    amount: number,
    transactionType: 'exchange' | 'introduction' | 'referral' | 'bonus' | 'trade',
    metadata?: Record<string, any>
  ): Promise<void> {
    console.log(`[FizzCoin] Awarding ${amount} coins to user ${userId} (type: ${transactionType})`);

    // Create transaction
    await storage.createTransaction({
      userId,
      amount,
      transactionType,
      metadata: metadata || null,
    });

    // Update wallet balance
    await storage.updateWalletBalance(userId, amount, true);
  }

  /**
   * Deduct FizzCoins from a user (for spending)
   */
  async deductCoins(
    userId: number,
    amount: number,
    transactionType: 'trade',
    metadata?: Record<string, any>
  ): Promise<boolean> {
    console.log(`[FizzCoin] Deducting ${amount} coins from user ${userId}`);

    // Check if user has sufficient balance
    const wallet = await storage.getWalletByUserId(userId);
    if (!wallet || wallet.balance < amount) {
      console.log(`[FizzCoin] Insufficient balance for user ${userId}`);
      return false;
    }

    // Create transaction (negative amount)
    await storage.createTransaction({
      userId,
      amount: -amount,
      transactionType,
      metadata: metadata || null,
    });

    // Update wallet balance
    await storage.updateWalletBalance(userId, -amount, false);

    console.log(`[FizzCoin] Successfully deducted ${amount} coins from user ${userId}`);
    return true;
  }

  /**
   * Transfer FizzCoins between users
   */
  async transferCoins(
    senderId: number,
    receiverId: number,
    amount: number,
    note?: string
  ): Promise<boolean> {
    console.log(`[FizzCoin] Transferring ${amount} coins from ${senderId} to ${receiverId}`);

    // Deduct from sender
    const deducted = await this.deductCoins(senderId, amount, 'trade', {
      receiverId,
      note,
      action: 'transfer_sent',
    });

    if (!deducted) {
      return false;
    }

    // Add to receiver
    await this.awardCoins(receiverId, amount, 'trade', {
      senderId,
      note,
      action: 'transfer_received',
    });

    console.log(`[FizzCoin] Transfer completed: ${amount} coins from ${senderId} to ${receiverId}`);
    return true;
  }

  /**
   * Check if user can afford a specific amount
   */
  async canAfford(userId: number, amount: number): Promise<boolean> {
    const wallet = await storage.getWalletByUserId(userId);
    return wallet !== null && wallet.balance >= amount;
  }
}

// Export singleton instance
export const fizzCoinService = new FizzCoinService();
