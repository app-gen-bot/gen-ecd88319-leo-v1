# Crypto Testing Roadmap

**Status**: 🔴 Cannot proceed until contracts are deployed
**Prerequisites**: Complete deployment steps from `CRYPTO_IMPLEMENTATION_AUDIT.md`

---

## Phase 0: Prerequisites (MUST COMPLETE FIRST)

Before ANY testing can begin, you must:

### 1. Deploy Contracts to Base Sepolia
```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install dependencies
cd contracts
forge install OpenZeppelin/openzeppelin-contracts --no-commit

# Deploy (with NEW private key)
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://sepolia.base.org \
  --broadcast
```

### 2. Update Environment Variables
```bash
# Update .env with REAL contract addresses from deployment
FIZZCOIN_CONTRACT_ADDRESS=0x_ACTUAL_DEPLOYED_ADDRESS
REWARDS_CONTRACT_ADDRESS=0x_ACTUAL_DEPLOYED_ADDRESS
REWARD_WALLET_PRIVATE_KEY=0x_NEW_SECURE_KEY
```

### 3. Verify Deployment
```bash
# Test contract exists
cast call $FIZZCOIN_CONTRACT_ADDRESS "name()(string)" --rpc-url https://sepolia.base.org
# Should return: "FizzCoin"

cast call $FIZZCOIN_CONTRACT_ADDRESS "symbol()(string)" --rpc-url https://sepolia.base.org
# Should return: "FIZZ"
```

---

## Phase 1: Smart Contract Testing

### Automated Tests (Foundry)

#### Existing Test Coverage
```bash
cd contracts
forge test -vvv

# Expected output:
# ✅ 15 tests for FizzCoin.sol
# ✅ 18 tests for FizzCoinRewards.sol
```

#### Additional Tests to Write

**1. Integration Tests** (`test/Integration.t.sol`)
```solidity
// Test complete flow: deploy → fund → credit → claim
function testEndToEndRewardFlow() public {
    // Deploy contracts
    // Transfer tokens to rewards contract
    // Credit user rewards
    // User claims rewards
    // Verify balances
}

function testGasOptimization() public {
    // Measure gas for single credit
    // Measure gas for batch credit (10 users)
    // Compare and ensure batch is more efficient
}
```

**2. Fork Tests** (`test/Fork.t.sol`)
```bash
# Run against live Base Sepolia
forge test --fork-url https://sepolia.base.org -vvv

# Test with real network conditions
function testRealisticGasPrices() public {
    // Credit rewards with current gas prices
    // Ensure transaction succeeds
    // Log actual gas costs
}
```

**3. Fuzzing Tests**
```bash
# Run extensive fuzzing
forge test --fuzz-runs 10000

# Test edge cases
function testFuzzCreditAmount(uint256 amount) public {
    // Test with random amounts
    // Ensure no overflows
    // Verify max supply enforcement
}
```

### Manual Contract Testing

#### Using Cast CLI
```bash
# 1. Check initial state
cast call $FIZZCOIN_CONTRACT_ADDRESS "totalSupply()(uint256)" --rpc-url https://sepolia.base.org
# Expected: 100000000000000000000000000 (100M tokens)

# 2. Check rewards contract balance
cast call $FIZZCOIN_CONTRACT_ADDRESS "balanceOf(address)(uint256)" $REWARDS_CONTRACT_ADDRESS --rpc-url https://sepolia.base.org
# Expected: 50000000000000000000000000 (50M tokens)

# 3. Credit test reward (from backend wallet)
cast send $REWARDS_CONTRACT_ADDRESS \
  "creditReward(address,uint256)" \
  0xTestUserAddress \
  25000000000000000000 \
  --private-key $REWARD_WALLET_PRIVATE_KEY \
  --rpc-url https://sepolia.base.org

# 4. Check pending rewards
cast call $REWARDS_CONTRACT_ADDRESS \
  "getPendingRewards(address)(uint256)" \
  0xTestUserAddress \
  --rpc-url https://sepolia.base.org
# Expected: 25000000000000000000 (25 FIZZ)
```

---

## Phase 2: Backend Integration Testing

### Service Unit Tests

**Create**: `server/services/__tests__/blockchain.test.ts`

```typescript
describe('BlockchainFizzCoinService', () => {
  it('should initialize with contract addresses', async () => {
    expect(blockchainFizzCoinService.isBlockchainEnabled()).toBe(true);
    const addresses = blockchainFizzCoinService.getContractAddresses();
    expect(addresses.fizzcoin).toBeDefined();
    expect(addresses.rewards).toBeDefined();
  });

  it('should credit rewards successfully', async () => {
    const result = await blockchainFizzCoinService.creditReward(
      '0xTestWallet',
      25,
      'test reward'
    );
    expect(result.hash).toMatch(/^0x[a-f0-9]{64}$/);
    expect(result.amount).toBe(25);
  });

  it('should handle network errors gracefully', async () => {
    // Simulate network failure
    // Verify retry logic works
    // Check error is logged properly
  });

  it('should batch credit rewards efficiently', async () => {
    const credits = [
      { walletAddress: '0xUser1', amount: 25 },
      { walletAddress: '0xUser2', amount: 50 },
      { walletAddress: '0xUser3', amount: 75 }
    ];
    const result = await blockchainFizzCoinService.batchCreditRewards(credits);
    expect(result.totalAmount).toBe(150);
  });
});
```

### Integration Tests

**Create**: `server/__tests__/reward-flow.integration.test.ts`

```typescript
describe('End-to-End Reward Flow', () => {
  let testUserId: number;
  let testWalletAddress: string;

  beforeAll(async () => {
    // Create test user
    // Create crypto wallet for user
    // Fund backend wallet with test ETH
  });

  it('should complete full reward cycle', async () => {
    // 1. Trigger reward-earning action (contact exchange)
    const exchange = await createContactExchange(testUserId, otherUserId);

    // 2. Verify local DB shows pending reward
    const wallet = await getCryptoWallet(testUserId);
    expect(wallet.pendingClaimAmount).toBe(25);

    // 3. Verify blockchain shows pending reward
    const pending = await blockchainFizzCoinService.getPendingRewards(testWalletAddress);
    expect(parseFloat(pending)).toBe(25);

    // 4. Simulate claim (would be from frontend)
    // This tests the claim endpoint

    // 5. Verify claimed rewards on blockchain
    const balance = await blockchainFizzCoinService.getBalance(testWalletAddress);
    expect(parseFloat(balance)).toBe(25);
  });
});
```

### API Endpoint Tests

```typescript
describe('Crypto API Endpoints', () => {
  it('GET /api/crypto/balance', async () => {
    const response = await request(app)
      .get('/api/crypto/balance')
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('balance');
    expect(response.body).toHaveProperty('pendingRewards');
  });

  it('POST /api/crypto/claim', async () => {
    // Credit test rewards first
    await blockchainFizzCoinService.creditReward(testWallet, 100, 'test');

    const response = await request(app)
      .post('/api/crypto/claim')
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('transactionHash');
    expect(response.body.claimed).toBe(100);
  });
});
```

---

## Phase 3: Manual Integration Testing

### Test Scenario 1: New User Onboarding
```bash
# 1. Create new user account
# 2. Verify crypto wallet is created
SELECT * FROM crypto_wallets WHERE user_id = ?;

# 3. Complete first contact exchange
# 4. Check pending rewards in DB
SELECT pending_claim_amount FROM crypto_wallets WHERE user_id = ?;

# 5. Check pending rewards on blockchain
cast call $REWARDS_CONTRACT_ADDRESS \
  "getPendingRewards(address)(uint256)" \
  $USER_WALLET_ADDRESS \
  --rpc-url https://sepolia.base.org
```

### Test Scenario 2: Reward Distribution
```bash
# 1. Trigger multiple reward events
- Contact exchange (25 FIZZ)
- Introduction completed (50 FIZZ)
- Event check-in (20 FIZZ)

# 2. Verify batch crediting works
# Check transaction on BaseScan

# 3. Verify gas costs are reasonable
# Should be < $0.10 per batch of 10 users
```

### Test Scenario 3: Claim Flow (Simulated)
```bash
# Since frontend not ready, test via cast:

# 1. Check pending before claim
cast call $REWARDS_CONTRACT_ADDRESS "getPendingRewards(address)(uint256)" $TEST_WALLET

# 2. Claim rewards (would be gasless in production)
cast send $REWARDS_CONTRACT_ADDRESS "claimRewards()" \
  --private-key $TEST_USER_PRIVATE_KEY \
  --rpc-url https://sepolia.base.org

# 3. Verify tokens received
cast call $FIZZCOIN_CONTRACT_ADDRESS "balanceOf(address)(uint256)" $TEST_WALLET
```

---

## Phase 4: Load Testing

### Stress Test Scenarios

#### 1. Bulk User Registration
```javascript
// Test script: bulk-register.js
async function bulkRegister() {
  const users = [];
  for (let i = 0; i < 100; i++) {
    users.push({
      email: `test${i}@example.com`,
      name: `Test User ${i}`
    });
  }

  // Register all users
  // Measure: wallet creation time, gas costs
  // Target: < 5 seconds per user
}
```

#### 2. Concurrent Reward Credits
```javascript
// Test script: concurrent-rewards.js
async function concurrentRewards() {
  const promises = [];
  for (let i = 0; i < 50; i++) {
    promises.push(
      blockchainFizzCoinService.creditReward(
        wallets[i],
        Math.floor(Math.random() * 100),
        'load test'
      )
    );
  }

  const results = await Promise.allSettled(promises);
  // Measure: success rate, average time
  // Target: 95% success, < 10 seconds average
}
```

#### 3. Gas Optimization Testing
```bash
# Single credit gas cost
SINGLE_GAS=$(cast estimate $REWARDS_CONTRACT_ADDRESS \
  "creditReward(address,uint256)" \
  0xUser1 \
  25000000000000000000)

# Batch credit gas cost (10 users)
BATCH_GAS=$(cast estimate $REWARDS_CONTRACT_ADDRESS \
  "batchCreditRewards(address[],uint256[])" \
  "[addresses]" "[amounts]")

# Calculate savings
echo "Single x10: $((SINGLE_GAS * 10))"
echo "Batch: $BATCH_GAS"
echo "Savings: $((SINGLE_GAS * 10 - BATCH_GAS))%"
```

---

## Phase 5: Monitoring & Observability

### Transaction Monitoring

**Create**: `scripts/monitor-blockchain.js`

```javascript
const { createPublicClient, http } = require('viem');
const { baseSepolia } = require('viem/chains');

const client = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org')
});

// Monitor reward credits
client.watchContractEvent({
  address: REWARDS_CONTRACT_ADDRESS,
  abi: rewardsABI,
  eventName: 'RewardCredited',
  onLogs: (logs) => {
    console.log('Reward credited:', logs);
    // Log to monitoring service
    // Alert if unusual activity
  }
});

// Monitor claims
client.watchContractEvent({
  address: REWARDS_CONTRACT_ADDRESS,
  abi: rewardsABI,
  eventName: 'RewardClaimed',
  onLogs: (logs) => {
    console.log('Reward claimed:', logs);
    // Update database
    // Track claim patterns
  }
});
```

### Gas Cost Tracking

```sql
-- Create gas tracking table
CREATE TABLE gas_metrics (
  id SERIAL PRIMARY KEY,
  operation VARCHAR(50),
  gas_used INTEGER,
  gas_price BIGINT,
  total_cost_wei BIGINT,
  total_cost_usd DECIMAL(10,4),
  tx_hash VARCHAR(66),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Query average gas costs
SELECT
  operation,
  AVG(gas_used) as avg_gas,
  AVG(total_cost_usd) as avg_cost_usd,
  COUNT(*) as tx_count
FROM gas_metrics
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY operation;
```

### Health Checks

```typescript
// Health check endpoint
app.get('/health/blockchain', async (req, res) => {
  const checks = {
    wallet_balance: 'unknown',
    contracts_accessible: false,
    recent_transaction: null,
    pending_rewards_total: 0
  };

  try {
    // Check backend wallet balance
    const balance = await walletService.getBalance();
    checks.wallet_balance = formatEther(balance);

    // Check contract accessibility
    const totalSupply = await blockchainFizzCoinService.getTotalSupply();
    checks.contracts_accessible = totalSupply > 0;

    // Get recent transaction
    const recentTx = await getRecentTransaction();
    checks.recent_transaction = recentTx;

    // Calculate total pending rewards
    const pending = await getTotalPendingRewards();
    checks.pending_rewards_total = pending;

    res.json({ status: 'healthy', checks });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message, checks });
  }
});
```

---

## Phase 6: Security Testing

### Smart Contract Security

```bash
# Run Slither static analysis
pip3 install slither-analyzer
cd contracts
slither . --print human-summary

# Run Mythril symbolic analysis
pip3 install mythril
myth analyze src/FizzCoin.sol
myth analyze src/FizzCoinRewards.sol
```

### Access Control Testing

```javascript
describe('Access Control', () => {
  it('should prevent unauthorized reward credits', async () => {
    // Try to credit from non-owner account
    await expect(
      rewardsContract.connect(attacker).creditReward(user, amount)
    ).to.be.revertedWith('Ownable: caller is not the owner');
  });

  it('should prevent double claiming', async () => {
    // Credit rewards
    await rewardsContract.creditReward(user, 100);

    // First claim succeeds
    await rewardsContract.connect(user).claimRewards();

    // Second claim fails
    await expect(
      rewardsContract.connect(user).claimRewards()
    ).to.be.revertedWith('FizzCoinRewards: no pending rewards');
  });
});
```

### Private Key Security Audit

```bash
# Check for exposed keys in codebase
grep -r "0x[a-fA-F0-9]\{64\}" . --exclude-dir=node_modules

# Verify no keys in git history
git log -p | grep -E "PRIVATE_KEY|SECRET|0x[a-fA-F0-9]{64}"

# Check environment variable usage
grep -r "process.env.*PRIVATE_KEY" .
```

---

## Test Data Requirements

### Testnet Wallets Needed

| Wallet Type | Purpose | Funding Required |
|-------------|---------|------------------|
| Backend Wallet | Credit rewards | 0.1 ETH |
| Test User 1 | Manual testing | 0.01 ETH |
| Test User 2 | Manual testing | 0.01 ETH |
| Load Test Pool (10) | Load testing | 0.001 ETH each |
| Attack Tester | Security testing | 0.01 ETH |

### Test Scenarios Coverage

| Scenario | Priority | Status |
|----------|----------|--------|
| New user gets wallet | Critical | ❌ Not Started |
| Contact exchange rewards | Critical | ❌ Not Started |
| Batch reward crediting | High | ❌ Not Started |
| Claim flow (gasless) | Critical | ❌ Not Started |
| Super connector multiplier | Medium | ❌ Not Started |
| Gas optimization | High | ❌ Not Started |
| Error handling | Critical | ❌ Not Started |
| Network failures | High | ❌ Not Started |
| Concurrent operations | Medium | ❌ Not Started |
| Security exploits | Critical | ❌ Not Started |

---

## CI/CD Integration

### GitHub Actions Workflow

**Create**: `.github/workflows/crypto-tests.yml`

```yaml
name: Crypto Tests

on:
  push:
    paths:
      - 'contracts/**'
      - 'server/services/blockchain/**'
  pull_request:
    paths:
      - 'contracts/**'
      - 'server/services/blockchain/**'

jobs:
  contract-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install Foundry
        uses: foundry-rs/foundry-toolchain@v1

      - name: Run tests
        run: |
          cd contracts
          forge test -vvv

      - name: Check gas usage
        run: |
          cd contracts
          forge test --gas-report

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run blockchain integration tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          BLOCKCHAIN_MODE: testnet
          BASE_RPC_URL: ${{ secrets.BASE_RPC_URL }}
        run: npm run test:blockchain
```

---

## Success Metrics

### Technical Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Contract deployment | ✅ Deployed & Verified | ❌ Not deployed |
| Test coverage | > 90% | 0% (not run) |
| Gas per reward credit | < $0.01 | Unknown |
| Claim success rate | > 99% | 0% |
| Transaction confirmation | < 10 seconds | Unknown |
| Batch efficiency | > 50% gas savings | Unknown |

### Business Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Users with wallets | 100% new signups | 0% |
| Rewards claimed | > 80% within 7 days | 0% |
| Transaction errors | < 1% | Unknown |
| Gas costs (monthly) | < $100 | $0 |
| User satisfaction | > 4.5/5 | N/A |

---

## Troubleshooting Guide

### Common Issues

#### 1. "Contract not deployed"
```bash
# Check if contracts exist
cast code $FIZZCOIN_CONTRACT_ADDRESS --rpc-url https://sepolia.base.org
# If returns "0x", contracts not deployed
```

#### 2. "Insufficient funds for gas"
```bash
# Check backend wallet balance
cast balance $BACKEND_WALLET --rpc-url https://sepolia.base.org
# Must have > 0.01 ETH for operations
```

#### 3. "Transaction reverted"
```bash
# Debug transaction
cast run $TX_HASH --rpc-url https://sepolia.base.org
# Shows revert reason
```

#### 4. "RPC rate limited"
```javascript
// Add retry logic with exponential backoff
const withRetry = async (fn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 2 ** i * 1000));
    }
  }
};
```

---

## Next Steps Priority

1. **🔴 CRITICAL**: Deploy contracts (nothing works without this)
2. **🔴 CRITICAL**: Verify contracts on BaseScan
3. **🟡 HIGH**: Run existing Foundry tests
4. **🟡 HIGH**: Test backend service integration
5. **🟡 HIGH**: Create monitoring dashboard
6. **🟢 MEDIUM**: Write additional test cases
7. **🟢 MEDIUM**: Load testing
8. **🟢 MEDIUM**: Security audit

---

**Remember**: No testing can proceed until contracts are deployed. Start with Phase 0 prerequisites.

---

**Document Version**: 1.0
**Last Updated**: January 29, 2025
**Status**: Waiting for contract deployment