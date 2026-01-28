# How to View FIZZ Transactions on BaseScan

This guide explains how to view your FizzCoin transactions on the Base Sepolia blockchain using BaseScan.

## Overview

FizzCard uses a **two-tier reward system**:

1. **Database Rewards** - FIZZ tokens earned through app actions (stored in database)
2. **Blockchain Rewards** - FIZZ tokens claimed to the blockchain (permanent, on-chain)

## Step 1: Earn FIZZ Tokens

You can earn FIZZ tokens through various actions:

- **Contact Exchange**: 25 FIZZ (both users)
- **Introduction**: 50 FIZZ
- **Referral**: 100 FIZZ
- **Event Check-in**: 20 FIZZ

### Quick Test: Earn FIZZ via API

Run the test script to quickly earn 50 FIZZ:

```bash
npx tsx test-earn-fizz-api.ts
```

This will:
1. Login as your account (labhesh@gmail.com)
2. Create a test user (test2@example.com)
3. Create and accept a contact exchange
4. Award 50 FIZZ to both users

## Step 2: Connect Your Privy Wallet

Before you can claim FIZZ to the blockchain, you need to connect a wallet:

1. Go to http://localhost:5014/wallet
2. Click **"Connect Wallet"**
3. Complete email verification with Privy
4. Privy will create an embedded wallet for you

Your wallet address will be displayed on the page (e.g., `0x1234...5678`)

## Step 3: Claim FIZZ to Blockchain

Once you have:
- ✅ FIZZ balance in the database (from earning rewards)
- ✅ Connected Privy wallet

You can claim your FIZZ to the blockchain:

1. Go to the Wallet page
2. Scroll to the **"Blockchain Wallet"** section
3. You'll see:
   - **On-Chain Balance**: FIZZ already on blockchain
   - **Pending Balance**: FIZZ in database (ready to claim)
   - **Total Balance**: Sum of both

4. Click **"Claim Rewards"** button
5. Wait for the blockchain transaction to complete (~5-10 seconds)
6. You'll see a success toast with:
   - Transaction hash
   - **"View on BaseScan"** button

## Step 4: View Transactions on BaseScan

### Option A: Click the BaseScan Link (Easiest)

After claiming rewards:
1. Click the **"View on BaseScan"** button in the success toast
2. This opens BaseScan showing your transaction

### Option B: Manual Navigation

1. Copy your wallet address from the Wallet page
2. Go to: **https://sepolia.basescan.org**
3. Paste your wallet address in the search bar
4. Click search

### Option C: View from Transaction History

1. Scroll to the **"Transaction History"** section on the Wallet page
2. Find transactions with a blockchain icon (🔗)
3. Click **"View on BaseScan"** link under the transaction

## What You'll See on BaseScan

### Transaction Details

When you click a transaction link, BaseScan shows:

- **Transaction Hash**: Unique identifier for the transaction
- **Status**: Success ✓ or Failed ✗
- **Block**: Block number where transaction was included
- **Timestamp**: When the transaction was mined
- **From**: The FizzCard backend wallet (reward distributor)
- **Interacted With (To)**: FizzCoinRewards contract
- **Tokens Transferred**: Amount of FIZZ credited to you

### Your Wallet Address Page

When you view your wallet address on BaseScan:

- **Balance**: Total FIZZ tokens in your wallet
- **Token Holdings**: List of all tokens (including FIZZ)
- **Transactions**: Complete history of all transactions
- **Token Transfers**: Filtered view of FIZZ transfers only

## Understanding the Smart Contracts

FizzCard uses two smart contracts deployed on Base Sepolia:

### 1. FizzCoin (ERC-20 Token)
- **Address**: `0x8C6E04f93BB1c639ca1CBacF145D624e7BDF4Ca7`
- **View on BaseScan**: https://sepolia.basescan.org/address/0x8C6E04f93BB1c639ca1CBacF145D624e7BDF4Ca7
- **Purpose**: The actual FIZZ token contract

### 2. FizzCoinRewards (Rewards Distribution)
- **Address**: `0x9c8376CA2ffdCfBA55AB46dBe168b8c1d09dA21a`
- **View on BaseScan**: https://sepolia.basescan.org/address/0x9c8376CA2ffdCfBA55AB46dBe168b8c1d09dA21a
- **Purpose**: Manages reward distribution and claiming

## How the Claiming Process Works

1. **You earn FIZZ** → Stored in database as `pendingClaims`
2. **You click "Claim Rewards"** → Triggers blockchain transaction
3. **Backend calls `creditReward()`** → Smart contract function
4. **Contract adds to your `pendingRewards`** → On-chain accounting
5. **User calls `claimRewards()`** → Transfers FIZZ to your wallet
6. **FIZZ appears in wallet** → You can see it on BaseScan

## Transaction Types on BaseScan

### RewardCredited Event
- **Emitted by**: FizzCoinRewards contract
- **When**: Backend credits rewards to your address
- **What to look for**: `user` (your address) and `amount` (FIZZ credited)

### RewardClaimed Event
- **Emitted by**: FizzCoinRewards contract
- **When**: You claim pending rewards
- **What to look for**: `user` (your address) and `amount` (FIZZ claimed)

### Transfer Event
- **Emitted by**: FizzCoin token contract
- **When**: FIZZ tokens are transferred
- **What to look for**: `from`, `to`, and `value` (amount)

## Troubleshooting

### "No FIZZ to claim"
- **Cause**: You don't have any database balance to claim
- **Solution**: Earn FIZZ through app actions first

### "No wallet address connected"
- **Cause**: You haven't connected a Privy wallet
- **Solution**: Click "Connect Wallet" and complete email verification

### "Blockchain features are currently disabled"
- **Cause**: Contract addresses not configured in .env
- **Solution**: Check that `.env` has `FIZZCOIN_CONTRACT_ADDRESS` and `REWARDS_CONTRACT_ADDRESS`

### Transaction shows on BaseScan but balance is 0
- **Cause**: Transaction credited rewards but you haven't claimed them yet
- **Solution**: The `creditReward` transaction adds to `pendingRewards`. You need to call `claimRewards()` to transfer FIZZ to your wallet (this is automatic in FizzCard)

## Testing the Complete Flow

Here's a complete test scenario:

```bash
# 1. Start the app
npm run dev

# 2. In another terminal, earn FIZZ
npx tsx test-earn-fizz-api.ts

# 3. Open browser
open http://localhost:5014/wallet

# 4. Login with labhesh@gmail.com / 12345678

# 5. Connect Privy wallet (click button, verify email)

# 6. Click "Claim Rewards"

# 7. Click "View on BaseScan" in the toast

# 8. Verify transaction on BaseScan shows:
#    - Status: Success
#    - From: Backend wallet
#    - To: FizzCoinRewards contract
#    - Event: RewardCredited with your address
```

## Base Sepolia Blockchain Info

- **Network Name**: Base Sepolia Testnet
- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Block Explorer**: https://sepolia.basescan.org
- **Currency**: ETH (Sepolia testnet ETH)

## Advanced: Direct Contract Interaction

If you want to interact with the contracts directly:

1. Go to the contract on BaseScan (e.g., FizzCoinRewards)
2. Click **"Contract"** tab
3. Click **"Read Contract"** to view balances:
   - `getPendingRewards(your_address)` - FIZZ ready to claim
   - `getClaimedRewards(your_address)` - FIZZ already claimed
4. Click **"Write Contract"** to manually claim:
   - Connect wallet (MetaMask, etc.)
   - Call `claimRewards()` function

## Summary

To see your FIZZ transactions on BaseScan:

1. ✅ Earn FIZZ in the app
2. ✅ Connect Privy wallet
3. ✅ Claim rewards to blockchain
4. ✅ Click "View on BaseScan" link
5. ✅ See your transaction details, balance, and token transfers!

---

**Contract Addresses** (Base Sepolia):
- FizzCoin: `0x8C6E04f93BB1c639ca1CBacF145D624e7BDF4Ca7`
- Rewards: `0x9c8376CA2ffdCfBA55AB46dBe168b8c1d09dA21a`

**Block Explorer**: https://sepolia.basescan.org
