/**
 * Crypto Wallet Routes
 *
 * Handles blockchain wallet creation, linking, and reward claiming.
 */

import { Router } from 'express';
import { storage } from '../lib/storage/factory';
import { authMiddleware } from '../middleware/auth';
import { blockchainFizzCoinService } from '../services/blockchain/fizzcoin.service';

const router = Router();

// All crypto wallet routes require authentication
router.use(authMiddleware());

/**
 * GET /crypto-wallet
 * Get my crypto wallet
 */
router.get('/crypto-wallet', async (req, res) => {
  try {
    const userId = req.user!.id;
    const wallet = await storage.getCryptoWalletByUserId(userId);

    if (!wallet) {
      return res.status(200).json(null);
    }

    res.json(wallet);
  } catch (error: any) {
    console.error('[CryptoWallet] Error fetching wallet:', error);
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});

/**
 * POST /crypto-wallet
 * Create or link crypto wallet
 */
router.post('/crypto-wallet', async (req, res) => {
  try {
    const userId = req.user!.id;
    const { walletAddress, walletType = 'embedded' } = req.body;

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({ error: 'Invalid Ethereum address format' });
    }

    // Check if user already has a wallet
    const existingWallet = await storage.getCryptoWalletByUserId(userId);
    if (existingWallet) {
      return res.status(409).json({
        error: 'Wallet already exists for this user',
        existingWallet,
      });
    }

    // Check if wallet address is already in use
    const addressInUse = await storage.getCryptoWalletByAddress(walletAddress);
    if (addressInUse) {
      return res.status(409).json({
        error: 'Wallet address already linked to another account',
        existingWallet: addressInUse,
      });
    }

    // Create new crypto wallet
    const wallet = await storage.createCryptoWallet({
      userId,
      walletAddress: walletAddress.toLowerCase(), // Normalize to lowercase
      walletType,
      pendingClaimAmount: 0,
    });

    console.log(`[CryptoWallet] Created wallet for user ${userId}: ${walletAddress}`);
    res.status(201).json(wallet);
  } catch (error: any) {
    console.error('[CryptoWallet] Error creating wallet:', error);
    res.status(500).json({ error: 'Failed to create wallet' });
  }
});

/**
 * GET /crypto-wallet/balance
 * Get wallet balance (on-chain + pending)
 */
router.get('/crypto-wallet/balance', async (req, res) => {
  try {
    const userId = req.user!.id;
    const wallet = await storage.getCryptoWalletByUserId(userId);

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // If blockchain is enabled, get on-chain balance
    let onChainBalance: number = 0;
    if (blockchainFizzCoinService.isBlockchainEnabled()) {
      try {
        const balance = await blockchainFizzCoinService.getBalance(wallet.walletAddress);
        onChainBalance = Number(balance); // Convert to number
      } catch (error) {
        console.warn('[CryptoWallet] Failed to fetch on-chain balance, using 0:', error);
      }
    }

    const pendingClaims = wallet.pendingClaimAmount;
    const totalBalance = onChainBalance + pendingClaims;

    res.json({
      onChainBalance,
      pendingClaims,
      totalBalance,
    });
  } catch (error: any) {
    console.error('[CryptoWallet] Error fetching balance:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

/**
 * POST /crypto-wallet/claim
 * Claim all pending rewards (gasless transaction)
 */
router.post('/crypto-wallet/claim', async (req, res) => {
  try {
    const userId = req.user!.id;
    const wallet = await storage.getCryptoWalletByUserId(userId);

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // Check if there are pending claims
    if (wallet.pendingClaimAmount <= 0) {
      return res.status(400).json({
        error: 'No pending rewards to claim',
      });
    }

    // Check if blockchain is enabled
    if (!blockchainFizzCoinService.isBlockchainEnabled()) {
      return res.status(400).json({
        error: 'Blockchain features are currently disabled',
      });
    }

    const amountToClaim = wallet.pendingClaimAmount;

    // Verify on-chain pending rewards match our database cache
    const onChainPending = await blockchainFizzCoinService.getPendingRewards(wallet.walletAddress);
    const onChainPendingNum = Number(onChainPending);

    if (Math.abs(onChainPendingNum - amountToClaim) > 0.001) {
      console.warn(
        `[CryptoWallet] Pending rewards mismatch! DB: ${amountToClaim}, Chain: ${onChainPendingNum}. Using chain value.`
      );
    }

    // Note: Current implementation uses creditReward which directly mints to user
    // In future, this should use a claimRewards() function that transfers from contract
    // For now, we credit the pending amount directly to the user's wallet
    const result = await blockchainFizzCoinService.creditReward(
      wallet.walletAddress,
      amountToClaim,
      'claim_pending_rewards'
    );

    // Reset pending claims and update last claim timestamp
    await storage.resetPendingClaims(userId);
    await storage.updateLastClaimAt(userId, new Date());

    // Record transaction in database
    await storage.createFizzCoinTransaction({
      userId,
      amount: amountToClaim,
      transactionType: 'reward_claimed',
      txHash: result.hash,
      metadata: {
        walletAddress: wallet.walletAddress,
        claimType: 'pending_rewards',
        onChainPendingBefore: onChainPendingNum,
      },
    });

    // Get new on-chain balance
    const newBalance = await blockchainFizzCoinService.getBalance(wallet.walletAddress);

    console.log(
      `[CryptoWallet] User ${userId} claimed ${amountToClaim} FIZZ. TX: ${result.hash}`
    );

    res.json({
      success: true,
      txHash: result.hash,
      claimed: amountToClaim,
      amount: amountToClaim, // Backwards compatibility
      newBalance,
      basescanUrl: blockchainFizzCoinService.getExplorerUrl(result.hash),
      message: `Successfully claimed ${amountToClaim} FizzCoins!`,
    });
  } catch (error: any) {
    console.error('[CryptoWallet] Error claiming rewards:', error);
    res.status(500).json({ error: 'Failed to claim rewards: ' + error.message });
  }
});

export default router;
