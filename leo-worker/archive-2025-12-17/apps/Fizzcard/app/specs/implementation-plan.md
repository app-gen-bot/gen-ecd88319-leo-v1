# FizzCoin Crypto Implementation Plan
## Complete Greenfield Implementation Strategy

**Timeline**: 6 weeks to production
**Approach**: Blockchain-first architecture on Base L2

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Implementation Phases](#implementation-phases)
3. [Technical Architecture](#technical-architecture)
4. [Detailed Task Breakdown](#detailed-task-breakdown)
5. [Database Schema Changes](#database-schema-changes)
6. [Smart Contract Design](#smart-contract-design)
7. [Backend Implementation](#backend-implementation)
8. [Frontend Implementation](#frontend-implementation)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Process](#deployment-process)
11. [Monitoring & Operations](#monitoring--operations)
12. [Risk Mitigation](#risk-mitigation)

---

## Executive Summary

### Key Decisions (From crypto.md)

✅ **Blockchain Platform**: Base (Coinbase L2)
- Transaction costs: $0.003-$0.09
- Native Paymaster support (gasless transactions)
- EVM-compatible (Solidity)

✅ **Wallet Integration**: Privy (embedded wallets)
- Email login → automatic wallet creation
- Zero crypto knowledge required
- Progressive enhancement to self-custody

✅ **Distribution Pattern**: Claim pattern with gasless transactions
- Users earn rewards instantly (credited to smart contract)
- Users claim rewards when ready (zero gas fees via Paymaster)
- Platform only pays gas when users claim

✅ **Token Economics**: Keep existing amounts
- 25 FIZZ: Accept connection (both parties)
- 50 FIZZ: Complete introduction (2x for Super-Connector)
- 100 FIZZ: Referral signup
- 20 FIZZ: Event check-in

✅ **Initial Supply**: 100M FIZZ for rewards (expandable to 1B max)

✅ **Architecture**: Blockchain-first from day 1
- No migration needed (greenfield advantage)
- Database stores wallet addresses + pending claims cache
- Blockchain is source of truth for balances

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
**Objective**: Deploy smart contracts and establish blockchain infrastructure

- [ ] Set up Coinbase Developer Platform account
- [ ] Deploy FizzCoin ERC-20 token contract to Base Sepolia testnet
- [ ] Deploy FizzCoinRewards contract with gasless claiming
- [ ] Configure Base Paymaster for gas sponsorship
- [ ] Verify contracts on BaseScan
- [ ] Get testnet ETH and test token transfers
- [ ] Create backend wallet management service
- [ ] Test reward crediting and claiming flow

**Deliverables**:
- ✅ FizzCoin token contract deployed and verified
- ✅ FizzCoinRewards contract deployed and verified
- ✅ Paymaster configured and tested
- ✅ 100+ successful test transactions on testnet

### Phase 2: Wallet Integration (Week 2)
**Objective**: Integrate Privy for seamless wallet creation

- [ ] Set up Privy account and configure app
- [ ] Add Privy SDK dependencies (@privy-io/react-auth, @privy-io/cross-app-connect)
- [ ] Create PrivyProvider wrapper component
- [ ] Integrate wallet creation on user signup
- [ ] Update database schema (add cryptoWallets table)
- [ ] Build wallet linking flow for existing crypto users
- [ ] Test embedded wallet creation and management
- [ ] Add wallet export to MetaMask feature

**Deliverables**:
- ✅ Privy integrated and configured
- ✅ Automatic wallet creation on signup
- ✅ Database schema updated with cryptoWallets table
- ✅ 50+ test accounts with wallets created

### Phase 3: Backend Integration (Week 3)
**Objective**: Build blockchain reward distribution system

- [ ] Create BlockchainFizzCoinService (replaces existing database-only service)
- [ ] Update reward logic to credit smart contract
- [ ] Build gasless claim transaction flow
- [ ] Add pending claims tracking in database (cache)
- [ ] Update all reward triggers (connections, introductions, referrals, events)
- [ ] Create balance query service (blockchain + pending)
- [ ] Add transaction history indexer
- [ ] Test end-to-end reward flow on testnet

**Deliverables**:
- ✅ Blockchain-integrated reward system
- ✅ Gasless claiming working reliably
- ✅ All existing reward triggers updated
- ✅ 200+ reward transactions processed on testnet

### Phase 4: Frontend Integration (Week 4)
**Objective**: Build beautiful crypto wallet UI

- [ ] Install wagmi, viem dependencies
- [ ] Create useFizzCoin hook for balance queries
- [ ] Build WalletConnect component (top nav)
- [ ] Create FizzCoinBalance display with available + claimable
- [ ] Build ClaimRewards button with loading states
- [ ] Add transaction history page with blockchain links
- [ ] Create animated reward earning notifications
- [ ] Update leaderboard to show blockchain balances
- [ ] Add wallet connection flow for crypto-native users

**Deliverables**:
- ✅ Beautiful wallet UI matching design system
- ✅ Real-time balance updates
- ✅ Smooth claim flow with animations
- ✅ Transaction history with BaseScan links

### Phase 5: Mainnet Deployment (Week 5)
**Objective**: Deploy to Base mainnet and prepare for production

- [ ] Deploy FizzCoin token to Base mainnet
- [ ] Deploy FizzCoinRewards contract to mainnet
- [ ] Verify contracts on BaseScan
- [ ] Transfer 100M FIZZ to rewards contract
- [ ] Configure Paymaster for mainnet
- [ ] Update frontend environment variables to mainnet
- [ ] Internal team testing with real transactions
- [ ] Monitor gas costs and optimize if needed
- [ ] Security review of all contracts and services
- [ ] Load testing with simulated user activity

**Deliverables**:
- ✅ Contracts deployed and verified on mainnet
- ✅ 50+ internal test transactions successful
- ✅ Gas costs under $1/day
- ✅ Security review completed

### Phase 6: Production Launch (Week 6)
**Objective**: Go live with real users

- [ ] Clear all seeded test data from database
- [ ] Run fresh database migrations
- [ ] Final environment configuration review
- [ ] Prepare incident response plan
- [ ] Set up monitoring and alerting (Sentry, gas tracking)
- [ ] Soft launch with first 50 users
- [ ] Monitor system health and user feedback
- [ ] Iterate based on feedback
- [ ] Scale to broader audience

**Deliverables**:
- ✅ Production system live and stable
- ✅ 100+ real users earning crypto rewards
- ✅ Zero critical bugs in first week
- ✅ User satisfaction > 90%

---

## Technical Architecture

### System Overview

```
┌─────────────────┐
│   User Signup   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  Privy Creates Wallet       │
│  - Embedded wallet           │
│  - No user action needed     │
└─────────┬───────────────────┘
          │
          ▼
┌─────────────────────────────┐
│  Database Stores Address    │
│  cryptoWallets table         │
└─────────┬───────────────────┘
          │
          ▼
┌─────────────────────────────┐
│  User Earns Reward          │
│  (accepts connection, etc.)  │
└─────────┬───────────────────┘
          │
          ▼
┌─────────────────────────────┐
│  Backend Credits Contract   │
│  rewardsContract.creditReward│
└─────────┬───────────────────┘
          │
          ▼
┌─────────────────────────────┐
│  Database Updates Cache     │
│  pendingClaimAmount += X     │
└─────────┬───────────────────┘
          │
          ▼
┌─────────────────────────────┐
│  User Sees "+25 FIZZ!"      │
│  Balance: 150 claimable      │
└─────────┬───────────────────┘
          │
          ▼
┌─────────────────────────────┐
│  User Clicks "Claim"        │
│  Gasless via Paymaster       │
└─────────┬───────────────────┘
          │
          ▼
┌─────────────────────────────┐
│  Tokens in User's Wallet    │
│  Visible on Base blockchain  │
└─────────────────────────────┘
```

### Data Flow

**Source of Truth**:
- **Wallet Address**: Database (fast lookups)
- **Token Balance**: Blockchain (user's actual holdings)
- **Pending Claims**: Smart Contract + Database cache (fast UI)
- **Transaction History**: Blockchain + Database cache (fast queries)

**Why Both Database and Blockchain?**
- Database = Cache for fast queries and UI responsiveness
- Blockchain = Authoritative source of truth
- If they diverge, blockchain wins (can resync from blockchain)

---

## Detailed Task Breakdown

### 1. Smart Contract Development

#### 1.1 FizzCoin Token Contract

**File**: `contracts/FizzCoin.sol`

**Requirements**:
- ERC-20 standard token
- 18 decimals (standard)
- Max supply: 1B FIZZ (1,000,000,000 * 10^18)
- Initial mint: 100M FIZZ to deployer
- Ownable (for controlled minting)
- ERC20Permit for gasless approvals

**Code Structure**:
```solidity
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FizzCoin is ERC20, ERC20Permit, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;
    address public rewardDistributor;

    constructor()
        ERC20("FizzCoin", "FIZZ")
        ERC20Permit("FizzCoin")
        Ownable(msg.sender)
    {
        _mint(msg.sender, 100_000_000 * 10**18);
    }

    function setRewardDistributor(address _distributor) external onlyOwner {
        rewardDistributor = _distributor;
    }

    function mintRewards(address to, uint256 amount) external {
        require(msg.sender == rewardDistributor, "Not authorized");
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
    }
}
```

**Testing Checklist**:
- [ ] Initial supply minted correctly (100M)
- [ ] Max supply enforced (cannot mint beyond 1B)
- [ ] Only reward distributor can mint
- [ ] Owner can set reward distributor
- [ ] ERC20 standard compliance (transfer, approve, transferFrom)
- [ ] Permit functionality works (gasless approvals)

#### 1.2 FizzCoinRewards Contract

**File**: `contracts/FizzCoinRewards.sol`

**Requirements**:
- Manages pending rewards
- Supports gasless claiming via ERC2771 (meta-transactions)
- Batch credit rewards (gas optimization)
- Owner-controlled crediting
- User-initiated claiming

**Code Structure**:
```solidity
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract FizzCoinRewards is Ownable, ERC2771Context {
    IERC20 public fizzcoin;
    mapping(address => uint256) public pendingRewards;
    mapping(address => uint256) public claimedRewards;

    event RewardCredited(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);

    constructor(address _fizzcoin, address _trustedForwarder)
        ERC2771Context(_trustedForwarder)
        Ownable(msg.sender)
    {
        fizzcoin = IERC20(_fizzcoin);
    }

    function creditReward(address user, uint256 amount) external onlyOwner {
        pendingRewards[user] += amount;
        emit RewardCredited(user, amount);
    }

    function claimRewards() external {
        address user = _msgSender(); // Works with meta-transactions
        uint256 amount = pendingRewards[user];
        require(amount > 0, "No pending rewards");

        pendingRewards[user] = 0;
        claimedRewards[user] += amount;

        require(fizzcoin.transfer(user, amount), "Transfer failed");
        emit RewardClaimed(user, amount);
    }

    function batchCreditRewards(
        address[] calldata users,
        uint256[] calldata amounts
    ) external onlyOwner {
        require(users.length == amounts.length, "Length mismatch");
        for (uint i = 0; i < users.length; i++) {
            pendingRewards[users[i]] += amounts[i];
            emit RewardCredited(users[i], amounts[i]);
        }
    }

    function getPendingRewards(address user) external view returns (uint256) {
        return pendingRewards[user];
    }
}
```

**Testing Checklist**:
- [ ] Owner can credit rewards
- [ ] User can claim rewards (gasless)
- [ ] Batch crediting works
- [ ] Cannot claim twice
- [ ] Cannot claim with zero balance
- [ ] Events emitted correctly
- [ ] Meta-transaction support verified

### 2. Database Schema Changes

#### 2.1 New Table: cryptoWallets

**File**: `shared/schema.zod.ts`

**Add**:
```typescript
export const cryptoWallets = z.object({
  id: z.number(),
  userId: z.number(),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/), // Ethereum address
  walletType: z.enum(['embedded', 'external']),
  pendingClaimAmount: z.number().min(0), // Cache for fast UI
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
```

**File**: `shared/schema.ts` (Drizzle)

**Add**:
```typescript
export const cryptoWallets = pgTable('crypto_wallets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  walletAddress: text('wallet_address').notNull().unique(),
  walletType: text('wallet_type').notNull().default('embedded'),
  pendingClaimAmount: integer('pending_claim_amount').notNull().default(0),
  lastClaimAt: timestamp('last_claim_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

#### 2.2 Update Table: fizzCoinTransactions

**Current**: Tracks database-only transactions
**Update**: Add blockchain transaction hash and block number

**File**: `shared/schema.zod.ts`

**Update**:
```typescript
export const fizzCoinTransactions = z.object({
  id: z.number(),
  userId: z.number(),
  amount: z.number(),
  transactionType: z.enum([
    'reward_earned',    // NEW: Reward credited to contract
    'reward_claimed',   // NEW: User claimed from contract
    'exchange',         // Keep for backwards compatibility
    'introduction',
    'referral',
    'bonus',
    'trade'
  ]),
  txHash: z.string().optional().nullable(),          // NEW: Blockchain tx hash
  blockNumber: z.number().optional().nullable(),     // NEW: Block number
  metadata: z.record(z.any()).optional().nullable(),
  createdAt: z.string().datetime(),
});
```

**File**: `shared/schema.ts` (Drizzle)

**Update**:
```typescript
export const fizzCoinTransactions = pgTable('fizz_coin_transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  amount: integer('amount').notNull(),
  transactionType: text('transaction_type').notNull(),
  txHash: text('tx_hash'),              // Blockchain transaction hash
  blockNumber: integer('block_number'), // Block number for indexing
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

#### 2.3 Keep Table: fizzCoinWallets (For Backwards Compatibility)

**Strategy**: Keep existing table but deprecate over time
- During transition, read from blockchain for balances
- Eventually remove balance/totalEarned/totalSpent columns
- Or rename table to fizzCoinWalletsLegacy and mark deprecated

### 3. Backend Implementation

#### 3.1 Blockchain Services

**File**: `server/services/blockchain/wallet.service.ts`

**Purpose**: Manage backend wallet for reward distribution

```typescript
import { createWalletClient, http, createPublicClient } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

class WalletService {
  private walletClient;
  private publicClient;
  private account;
  private chain;

  constructor() {
    const isTestnet = process.env.BLOCKCHAIN_MODE === 'testnet';
    this.chain = isTestnet ? baseSepolia : base;

    // Backend wallet for managing contracts
    this.account = privateKeyToAccount(
      process.env.REWARD_WALLET_PRIVATE_KEY as `0x${string}`
    );

    this.walletClient = createWalletClient({
      account: this.account,
      chain: this.chain,
      transport: http(process.env.BASE_RPC_URL)
    });

    this.publicClient = createPublicClient({
      chain: this.chain,
      transport: http(process.env.BASE_RPC_URL)
    });
  }

  async getBalance(address: string) {
    return await this.publicClient.getBalance({ address });
  }

  async sendTransaction(to: string, value: bigint) {
    const hash = await this.walletClient.sendTransaction({
      to,
      value,
      gas: 21000n
    });
    return hash;
  }
}

export const walletService = new WalletService();
```

**File**: `server/services/blockchain/fizzcoin.service.ts`

**Purpose**: Main service for FizzCoin blockchain operations

```typescript
import { createPublicClient, createWalletClient, http, parseEther, formatEther } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { storage } from '../storage';

// ABI imports (generated from contracts)
import { fizzCoinABI } from './abis/FizzCoin';
import { rewardsABI } from './abis/FizzCoinRewards';

class BlockchainFizzCoinService {
  private publicClient;
  private walletClient;
  private account;
  private fizzCoinAddress: `0x${string}`;
  private rewardsAddress: `0x${string}`;

  constructor() {
    const isTestnet = process.env.BLOCKCHAIN_MODE === 'testnet';
    const chain = isTestnet ? baseSepolia : base;

    this.fizzCoinAddress = process.env.FIZZCOIN_CONTRACT_ADDRESS as `0x${string}`;
    this.rewardsAddress = process.env.REWARDS_CONTRACT_ADDRESS as `0x${string}`;

    this.account = privateKeyToAccount(
      process.env.REWARD_WALLET_PRIVATE_KEY as `0x${string}`
    );

    this.publicClient = createPublicClient({
      chain,
      transport: http(process.env.BASE_RPC_URL)
    });

    this.walletClient = createWalletClient({
      account: this.account,
      chain,
      transport: http(process.env.BASE_RPC_URL)
    });
  }

  /**
   * Credit reward to user's wallet (pending claim)
   */
  async creditReward(userId: number, amount: number, reason: string) {
    console.log(`[FizzCoin] Crediting ${amount} FIZZ to user ${userId}`);

    // Get user's wallet address
    const wallet = await storage.getCryptoWalletByUserId(userId);
    if (!wallet) {
      throw new Error(`User ${userId} has no crypto wallet`);
    }

    // Convert amount to wei (18 decimals)
    const amountInWei = parseEther(amount.toString());

    // Credit on smart contract
    const hash = await this.walletClient.writeContract({
      address: this.rewardsAddress,
      abi: rewardsABI,
      functionName: 'creditReward',
      args: [wallet.walletAddress, amountInWei],
    });

    console.log(`[FizzCoin] Reward credited. TX: ${hash}`);

    // Update pending claim amount in database (cache)
    await storage.incrementPendingClaims(userId, amount);

    // Log transaction
    await storage.createFizzCoinTransaction({
      userId,
      amount,
      transactionType: 'reward_earned',
      txHash: hash,
      metadata: { reason }
    });

    return { hash, amount };
  }

  /**
   * Get user's balance (on-chain)
   */
  async getBalance(walletAddress: string): Promise<string> {
    const balance = await this.publicClient.readContract({
      address: this.fizzCoinAddress,
      abi: fizzCoinABI,
      functionName: 'balanceOf',
      args: [walletAddress],
    });

    return formatEther(balance as bigint);
  }

  /**
   * Get pending rewards (from contract)
   */
  async getPendingRewards(walletAddress: string): Promise<string> {
    const pending = await this.publicClient.readContract({
      address: this.rewardsAddress,
      abi: rewardsABI,
      functionName: 'pendingRewards',
      args: [walletAddress],
    });

    return formatEther(pending as bigint);
  }

  /**
   * Prepare gasless claim transaction
   * User will sign this on frontend via Privy
   */
  async prepareClaimTransaction(userId: number) {
    const wallet = await storage.getCryptoWalletByUserId(userId);
    if (!wallet) {
      throw new Error(`User ${userId} has no crypto wallet`);
    }

    // Return transaction data for frontend to execute
    return {
      to: this.rewardsAddress,
      abi: rewardsABI,
      functionName: 'claimRewards',
      args: [],
      // Paymaster will sponsor gas
    };
  }

  /**
   * After claim completes, update database
   */
  async recordClaimCompletion(userId: number, txHash: string, amount: number) {
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash: txHash as `0x${string}`
    });

    // Reset pending claims
    await storage.resetPendingClaims(userId);

    // Update last claim timestamp
    await storage.updateLastClaimAt(userId, new Date());

    // Log transaction
    await storage.createFizzCoinTransaction({
      userId,
      amount,
      transactionType: 'reward_claimed',
      txHash,
      blockNumber: Number(receipt.blockNumber),
      metadata: { gasUsed: receipt.gasUsed.toString() }
    });

    console.log(`[FizzCoin] Claim recorded. User ${userId} claimed ${amount} FIZZ`);
  }
}

export const blockchainFizzCoinService = new BlockchainFizzCoinService();
```

#### 3.2 Update Existing Reward Logic

**Files to Update**:
- `server/routes/contactExchanges.ts` (accept connection → 25 FIZZ)
- `server/routes/introductions.ts` (complete intro → 50 FIZZ, 100 if super-connector)
- `server/routes/auth.ts` (signup with referral → 100 FIZZ)
- `server/routes/events.ts` (check-in → 20 FIZZ)

**Pattern**:
```typescript
// BEFORE (database only)
await fizzCoinService.creditReward(userId, 25, 'connection_accepted');

// AFTER (blockchain)
await blockchainFizzCoinService.creditReward(
  userId,
  25,
  'connection_accepted'
);
```

### 4. Frontend Implementation

#### 4.1 Privy Provider Setup

**File**: `client/src/contexts/PrivyProvider.tsx`

```typescript
import { PrivyProvider as Privy } from '@privy-io/react-auth';
import { WagmiProvider, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { http } from 'viem';

const config = createConfig({
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  const isTestnet = import.meta.env.VITE_BLOCKCHAIN_MODE === 'testnet';

  return (
    <Privy
      appId={import.meta.env.VITE_PRIVY_APP_ID}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#00D9FF', // FizzCard cyan
          logo: '/fizzcoin-logo.png'
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          showWalletUIs: true
        },
        loginMethods: ['email', 'google', 'wallet'],
        defaultChain: isTestnet ? baseSepolia : base,
        supportedChains: [base, baseSepolia]
      }}
    >
      <WagmiProvider config={config}>
        {children}
      </WagmiProvider>
    </Privy>
  );
}
```

#### 4.2 FizzCoin Hook

**File**: `client/src/hooks/useFizzCoin.ts`

```typescript
import { useAccount, useReadContract } from 'wagmi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatEther } from 'viem';
import { apiClient } from '@/lib/api-client';

export function useFizzCoin() {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  // Get on-chain balance
  const { data: onChainBalance } = useReadContract({
    address: import.meta.env.VITE_FIZZCOIN_CONTRACT_ADDRESS,
    abi: fizzCoinABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    watch: true, // Auto-refresh
  });

  // Get pending claims from backend (cached in DB)
  const { data: pendingData } = useQuery({
    queryKey: ['pending-rewards', address],
    queryFn: async () => {
      const response = await apiClient.wallet.getPendingRewards();
      return response.body;
    },
    enabled: !!address,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Claim rewards mutation
  const claimMutation = useMutation({
    mutationFn: async () => {
      // Frontend signs and submits gasless transaction
      const response = await apiClient.wallet.claimRewards();
      return response.body;
    },
    onSuccess: () => {
      // Invalidate queries to refresh balance
      queryClient.invalidateQueries(['pending-rewards']);
      queryClient.invalidateQueries(['fizzcoin-balance']);
    },
  });

  return {
    balance: onChainBalance ? formatEther(onChainBalance as bigint) : '0',
    pendingClaims: pendingData?.amount || 0,
    totalBalance:
      parseFloat(formatEther((onChainBalance as bigint) || 0n)) +
      (pendingData?.amount || 0),
    isConnected: !!address,
    claimRewards: claimMutation.mutate,
    isClaiming: claimMutation.isPending,
  };
}
```

#### 4.3 Balance Display Component

**File**: `client/src/components/crypto/FizzCoinBalance.tsx`

```typescript
import { useFizzCoin } from '@/hooks/useFizzCoin';
import { Coins } from 'lucide-react';

export function FizzCoinBalance() {
  const { balance, pendingClaims, totalBalance } = useFizzCoin();

  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl bg-background-secondary border border-primary-500/20">
      <div className="flex items-center gap-2">
        <Coins className="w-5 h-5 text-fizzCoin-500" />
        <span className="text-sm text-text-secondary">Your FizzCoin</span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-text-primary">
          {Math.floor(totalBalance)}
        </span>
        <span className="text-sm text-text-secondary">FIZZ</span>
      </div>

      {pendingClaims > 0 && (
        <div className="text-xs text-text-tertiary">
          {Math.floor(balance)} available • {pendingClaims} claimable
        </div>
      )}
    </div>
  );
}
```

#### 4.4 Claim Rewards Component

**File**: `client/src/components/crypto/ClaimRewards.tsx`

```typescript
import { useFizzCoin } from '@/hooks/useFizzCoin';
import { Button } from '@/components/ui/Button';
import { Loader2 } from 'lucide-react';

export function ClaimRewards() {
  const { pendingClaims, claimRewards, isClaiming } = useFizzCoin();

  if (pendingClaims === 0) {
    return null;
  }

  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-500/30">
      <h3 className="text-xl font-semibold mb-2">Rewards Ready!</h3>
      <p className="text-text-secondary mb-4">
        You have {pendingClaims} FIZZ ready to claim
      </p>

      <Button
        onClick={() => claimRewards()}
        disabled={isClaiming}
        className="w-full"
      >
        {isClaiming ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Claiming...
          </>
        ) : (
          <>Claim {pendingClaims} FIZZ</>
        )}
      </Button>

      <p className="text-xs text-text-tertiary mt-2 text-center">
        Gas fees sponsored by FizzCard • Zero cost to you
      </p>
    </div>
  );
}
```

### 5. Testing Strategy

#### 5.1 Smart Contract Tests

**Tool**: Foundry (forge)

**File**: `contracts/test/FizzCoin.t.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../FizzCoin.sol";
import "../FizzCoinRewards.sol";

contract FizzCoinTest is Test {
    FizzCoin public token;
    FizzCoinRewards public rewards;
    address public owner;
    address public user1;
    address public user2;

    function setUp() public {
        owner = address(this);
        user1 = address(0x1);
        user2 = address(0x2);

        token = new FizzCoin();
        rewards = new FizzCoinRewards(address(token), address(0)); // No forwarder in tests

        // Transfer tokens to rewards contract
        token.transfer(address(rewards), 50_000_000 * 10**18);
    }

    function testInitialSupply() public {
        assertEq(token.totalSupply(), 100_000_000 * 10**18);
    }

    function testCreditReward() public {
        rewards.creditReward(user1, 100 * 10**18);
        assertEq(rewards.pendingRewards(user1), 100 * 10**18);
    }

    function testClaimReward() public {
        rewards.creditReward(user1, 100 * 10**18);

        vm.prank(user1);
        rewards.claimRewards();

        assertEq(token.balanceOf(user1), 100 * 10**18);
        assertEq(rewards.pendingRewards(user1), 0);
    }

    function testBatchCredit() public {
        address[] memory users = new address[](3);
        uint256[] memory amounts = new uint256[](3);

        users[0] = user1;
        users[1] = user2;
        users[2] = address(0x3);

        amounts[0] = 50 * 10**18;
        amounts[1] = 75 * 10**18;
        amounts[2] = 100 * 10**18;

        rewards.batchCreditRewards(users, amounts);

        assertEq(rewards.pendingRewards(user1), 50 * 10**18);
        assertEq(rewards.pendingRewards(user2), 75 * 10**18);
    }

    function testCannotClaimTwice() public {
        rewards.creditReward(user1, 100 * 10**18);

        vm.prank(user1);
        rewards.claimRewards();

        vm.prank(user1);
        vm.expectRevert("No pending rewards");
        rewards.claimRewards();
    }

    function testMaxSupply() public {
        vm.expectRevert("Max supply exceeded");
        token.mintRewards(owner, 901_000_000 * 10**18);
    }
}
```

**Run Tests**:
```bash
forge test -vvv
forge coverage
forge snapshot
```

#### 5.2 Integration Tests

**File**: `server/tests/blockchain.test.ts`

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { blockchainFizzCoinService } from '../services/blockchain/fizzcoin.service';
import { storage } from '../storage';

describe('Blockchain FizzCoin Service', () => {
  let testUserId: number;
  let testWalletAddress: string;

  beforeAll(async () => {
    // Create test user and wallet
    const user = await storage.createUser({
      email: 'test@fizzcoin.com',
      passwordHash: 'test',
      name: 'Test User',
      role: 'user',
      isVerified: false
    });
    testUserId = user.id;

    const wallet = await storage.createCryptoWallet({
      userId: testUserId,
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      walletType: 'embedded',
      pendingClaimAmount: 0
    });
    testWalletAddress = wallet.walletAddress;
  });

  it('should credit reward to contract', async () => {
    const result = await blockchainFizzCoinService.creditReward(
      testUserId,
      25,
      'test_connection'
    );

    expect(result.amount).toBe(25);
    expect(result.hash).toMatch(/^0x[a-fA-F0-9]{64}$/);
  });

  it('should get pending rewards', async () => {
    const pending = await blockchainFizzCoinService.getPendingRewards(
      testWalletAddress
    );

    expect(parseFloat(pending)).toBeGreaterThanOrEqual(25);
  });

  it('should get balance', async () => {
    const balance = await blockchainFizzCoinService.getBalance(
      testWalletAddress
    );

    expect(balance).toBeDefined();
  });
});
```

#### 5.3 E2E Tests

**File**: `client/tests/e2e/crypto-flow.spec.ts`

**Test Scenarios**:
1. New user signup → wallet created automatically
2. User accepts connection → earns 25 FIZZ
3. User views balance → sees claimable amount
4. User claims rewards → balance updates
5. User views transaction history → sees blockchain link

### 6. Deployment Process

#### 6.1 Testnet Deployment (Week 1)

**Step 1: Get Testnet ETH**
```bash
# Visit Coinbase Faucet
open https://www.coinbase.com/faucets/base-sepolia-faucet
```

**Step 2: Deploy Contracts**
```bash
cd contracts

# Set environment
export DEPLOYER_PRIVATE_KEY="0x..."
export BASE_RPC_URL="https://sepolia.base.org"

# Deploy FizzCoin
forge create FizzCoin \
  --rpc-url $BASE_RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --verify

# Save contract address
export FIZZCOIN_ADDRESS="0x..."

# Deploy Rewards contract
forge create FizzCoinRewards \
  --rpc-url $BASE_RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --constructor-args $FIZZCOIN_ADDRESS "0x0000000000000000000000000000000000000000" \
  --verify

export REWARDS_ADDRESS="0x..."
```

**Step 3: Fund Rewards Contract**
```bash
# Transfer 100M FIZZ to rewards contract
cast send $FIZZCOIN_ADDRESS \
  "transfer(address,uint256)" \
  $REWARDS_ADDRESS \
  100000000000000000000000000 \
  --rpc-url $BASE_RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY
```

**Step 4: Update .env**
```bash
# .env.testnet
BLOCKCHAIN_MODE=testnet
FIZZCOIN_CONTRACT_ADDRESS=0x...
REWARDS_CONTRACT_ADDRESS=0x...
BASE_RPC_URL=https://sepolia.base.org
REWARD_WALLET_PRIVATE_KEY=0x...
```

#### 6.2 Mainnet Deployment (Week 5)

**Same steps as testnet, but**:
- Use `https://mainnet.base.org`
- Double-check all addresses
- Verify contracts on BaseScan
- Monitor gas costs carefully

### 7. Monitoring & Operations

#### 7.1 Gas Cost Tracking

**File**: `server/services/monitoring/gas-tracker.ts`

```typescript
class GasCostTracker {
  async logTransaction(txHash: string) {
    const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
    const gasUsed = receipt.gasUsed;
    const gasPrice = receipt.effectiveGasPrice;
    const costInETH = (gasUsed * gasPrice) / 10n**18n;

    // Log to database
    await db.insert(gasCosts).values({
      txHash,
      gasUsed: gasUsed.toString(),
      gasPrice: gasPrice.toString(),
      costInETH: costInETH.toString(),
      timestamp: new Date()
    });

    // Alert if cost exceeds threshold
    if (costInETH > parseEther('0.001')) {
      await sendAlert(`High gas cost: ${formatEther(costInETH)} ETH`);
    }
  }

  async getDailyCost() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const costs = await db
      .select()
      .from(gasCosts)
      .where(gte(gasCosts.timestamp, today));

    const total = costs.reduce((sum, cost) => {
      return sum + BigInt(cost.costInETH);
    }, 0n);

    return formatEther(total);
  }
}
```

#### 7.2 Alert System

**Alerts**:
- Gas costs exceed $10/day
- Reward pool below 20M FIZZ (20% remaining)
- Failed transactions > 5% rate
- Claim failures
- RPC provider errors

### 8. Risk Mitigation

#### 8.1 Smart Contract Risks

**Mitigation**:
- Use OpenZeppelin audited contracts
- Comprehensive unit tests (>95% coverage)
- Internal security review
- External audit before mainnet (optional but recommended)
- Pause mechanism for emergencies

#### 8.2 Operational Risks

**Mitigation**:
- Backup RPC providers (Alchemy + Coinbase)
- Rate limiting on reward crediting
- Database backups
- Monitoring and alerting
- Incident response plan

#### 8.3 User Experience Risks

**Mitigation**:
- Clear error messages
- Graceful fallbacks
- Transaction status tracking
- Support documentation
- User testing before launch

---

## Implementation Checklist

### Pre-Development
- [ ] Create Coinbase Developer Platform account
- [ ] Set up Privy account
- [ ] Install Foundry for contract development
- [ ] Get Base Sepolia testnet ETH
- [ ] Configure development environment

### Week 1: Smart Contracts
- [ ] Write FizzCoin.sol contract
- [ ] Write FizzCoinRewards.sol contract
- [ ] Write comprehensive tests
- [ ] Deploy to Base Sepolia
- [ ] Verify contracts on BaseScan
- [ ] Test reward crediting and claiming

### Week 2: Wallet Integration
- [ ] Add Privy dependencies
- [ ] Create PrivyProvider component
- [ ] Update user signup to create wallets
- [ ] Add cryptoWallets table to schema
- [ ] Run database migrations
- [ ] Test wallet creation flow

### Week 3: Backend Integration
- [ ] Create BlockchainFizzCoinService
- [ ] Update all reward trigger points
- [ ] Add transaction hash tracking
- [ ] Build balance query endpoints
- [ ] Test end-to-end reward flow
- [ ] Monitor testnet gas costs

### Week 4: Frontend Integration
- [ ] Install wagmi, viem dependencies
- [ ] Create useFizzCoin hook
- [ ] Build FizzCoinBalance component
- [ ] Build ClaimRewards component
- [ ] Add transaction history page
- [ ] Test UI flows thoroughly

### Week 5: Mainnet Deployment
- [ ] Deploy contracts to Base mainnet
- [ ] Transfer 100M FIZZ to rewards contract
- [ ] Configure Paymaster for mainnet
- [ ] Update frontend to mainnet
- [ ] Internal team testing
- [ ] Security review

### Week 6: Production Launch
- [ ] Clear test data
- [ ] Final environment checks
- [ ] Set up monitoring
- [ ] Soft launch (50 users)
- [ ] Monitor and iterate
- [ ] Scale to broader audience

---

## Success Criteria

### Technical
- ✅ Smart contracts deployed and verified
- ✅ 200+ test transactions successful
- ✅ Gas costs under $50/month
- ✅ Zero critical bugs in production
- ✅ 99.9% uptime for blockchain services

### User Experience
- ✅ Wallet creation takes < 2 seconds
- ✅ Reward earning feels instant (<500ms UI update)
- ✅ Claiming completes in < 5 seconds
- ✅ Balance displays correctly 100% of time
- ✅ User satisfaction > 90%

### Business
- ✅ 100+ real users with crypto wallets in first week
- ✅ 1,000+ reward transactions processed
- ✅ Positive user feedback on crypto integration
- ✅ Total costs under $100/month
- ✅ Foundation for future token utility

---

## Next Steps After Launch

### Month 2-3: Optimization
- Monitor gas costs and optimize batch operations
- Improve transaction indexing speed
- Add more wallet providers (RainbowKit)
- Implement wallet export to MetaMask

### Month 4-6: Token Utility
- Premium events requiring FIZZ to enter
- Profile boost features (spend FIZZ for visibility)
- NFT badges for achievements

### Month 7-12: Advanced Features
- DEX listing consideration (if demand exists)
- Governance features (community voting)
- Token swap functionality
- Mobile app wallet integration

---

## Resources & Documentation

### Base Blockchain
- [Base Docs](https://docs.base.org)
- [Base Paymaster Guide](https://docs.base.org/paymaster)
- [BaseScan Explorer](https://basescan.org)

### Smart Contracts
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/5.x/)
- [Foundry Book](https://book.getfoundry.sh)
- [Solidity Docs](https://docs.soliditylang.org)

### Wallet Integration
- [Privy Docs](https://docs.privy.io)
- [Wagmi Docs](https://wagmi.sh)
- [Viem Docs](https://viem.sh)

### Support
- [Base Discord](https://discord.gg/buildonbase)
- [Privy Discord](https://discord.gg/privy)

---

## Conclusion

This implementation plan provides a complete roadmap for integrating real cryptocurrency rewards into FizzCard using Base L2 blockchain. The greenfield advantage allows us to build blockchain-first architecture from day 1, avoiding complex migration logic and technical debt.

**Key Advantages**:
- ✅ 6-week timeline (vs 13+ weeks with migration)
- ✅ Simpler architecture (blockchain as source of truth)
- ✅ Lower costs (< $100/month operational)
- ✅ Better user experience (gasless transactions)
- ✅ Production-ready from launch

**Timeline Summary**:
- Week 1: Smart contracts deployed to testnet
- Week 2: Wallets integrated via Privy
- Week 3: Backend reward system blockchain-enabled
- Week 4: Frontend crypto UI completed
- Week 5: Mainnet deployment and testing
- Week 6: Production launch with real users

The system is designed to scale from dozens to thousands of users without requiring architectural changes. All code follows best practices for security, maintainability, and performance.

Let's build the future of social networking with real crypto rewards! 🚀
