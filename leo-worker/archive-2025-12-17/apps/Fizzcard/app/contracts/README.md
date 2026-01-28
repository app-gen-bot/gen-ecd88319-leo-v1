# FizzCoin Smart Contracts

Smart contracts for FizzCard's blockchain-integrated reward system on Base L2.

## 📋 Overview

- **FizzCoin.sol**: ERC-20 token with controlled minting (100M initial, 1B max supply)
- **FizzCoinRewards.sol**: Reward distribution with gasless claiming via Paymaster

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│          FizzCoin Token (ERC-20)         │
│  - 100M initial supply                   │
│  - 1B max supply (capped)                │
│  - Controlled minting by distributor     │
└──────────────────┬──────────────────────┘
                   │ owns
                   ▼
┌─────────────────────────────────────────┐
│       FizzCoinRewards Contract           │
│  - Holds reward pool                     │
│  - Credits pending rewards (owner only)  │
│  - Gasless claiming (ERC2771)            │
│  - Batch operations                      │
└─────────────────────────────────────────┘
```

## 🚀 Prerequisites

### Install Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Install Dependencies

```bash
cd contracts
forge install OpenZeppelin/openzeppelin-contracts
```

## 🧪 Testing

### Run All Tests

```bash
forge test -vvv
```

### Run Specific Test

```bash
forge test --match-test testCreditReward -vvv
```

### Coverage Report

```bash
forge coverage
```

### Gas Snapshot

```bash
forge snapshot
```

## 📦 Deployment

### 1. Set Environment Variables

Create `.env` file in contracts directory:

```bash
# Deployer wallet
DEPLOYER_PRIVATE_KEY=0x...

# RPC URLs
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_MAINNET_RPC_URL=https://mainnet.base.org

# BaseScan API Key (for verification)
BASESCAN_API_KEY=your_api_key_here
```

### 2. Get Testnet ETH

Visit [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-sepolia-faucet)

### 3. Deploy to Testnet (Base Sepolia)

```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

### 4. Deploy to Mainnet (Base)

**⚠️ IMPORTANT: Double-check everything before mainnet deployment!**

```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $BASE_MAINNET_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

## 📝 Post-Deployment Steps

### 1. Update Backend Environment

Add contract addresses to `/Users/labheshpatel/apps/app-factory/apps/Fizzcard/app/.env`:

```bash
# Blockchain Configuration
BLOCKCHAIN_MODE=testnet  # or mainnet
FIZZCOIN_CONTRACT_ADDRESS=0x...  # from deployment output
REWARDS_CONTRACT_ADDRESS=0x...   # from deployment output
BASE_RPC_URL=https://sepolia.base.org  # or mainnet.base.org
REWARD_WALLET_PRIVATE_KEY=0x...  # backend wallet for crediting rewards
```

### 2. Configure Paymaster (Optional - for gasless claiming)

1. Visit [Coinbase Developer Platform](https://www.coinbase.com/cloud)
2. Create Paymaster for your rewards contract
3. Get up to $10k/month in sponsored gas
4. Update FizzCoinRewards with trusted forwarder address

### 3. Verify Contracts Manually (if auto-verify failed)

```bash
# FizzCoin
forge verify-contract \
  --chain-id 84532 \
  --compiler-version v0.8.20+commit.a1b79de6 \
  <FIZZCOIN_ADDRESS> \
  src/FizzCoin.sol:FizzCoin \
  --etherscan-api-key $BASESCAN_API_KEY

# FizzCoinRewards
forge verify-contract \
  --chain-id 84532 \
  --compiler-version v0.8.20+commit.a1b79de6 \
  --constructor-args $(cast abi-encode "constructor(address,address)" <FIZZCOIN_ADDRESS> <TRUSTED_FORWARDER>) \
  <REWARDS_ADDRESS> \
  src/FizzCoinRewards.sol:FizzCoinRewards \
  --etherscan-api-key $BASESCAN_API_KEY
```

Chain IDs:
- Base Sepolia: 84532
- Base Mainnet: 8453

## 🔍 Contract Interaction Examples

### Using Cast (Foundry)

```bash
# Check token balance
cast call $FIZZCOIN_CONTRACT_ADDRESS \
  "balanceOf(address)(uint256)" \
  0xYourWalletAddress \
  --rpc-url $BASE_SEPOLIA_RPC_URL

# Credit reward (owner only)
cast send $REWARDS_CONTRACT_ADDRESS \
  "creditReward(address,uint256)" \
  0xUserWalletAddress \
  $(cast --to-wei 25) \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $REWARD_WALLET_PRIVATE_KEY

# Claim rewards (as user)
cast send $REWARDS_CONTRACT_ADDRESS \
  "claimRewards()" \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $USER_PRIVATE_KEY

# Check pending rewards
cast call $REWARDS_CONTRACT_ADDRESS \
  "getPendingRewards(address)(uint256)" \
  0xUserWalletAddress \
  --rpc-url $BASE_SEPOLIA_RPC_URL
```

## 📊 Contract Details

### FizzCoin Token

- **Name**: FizzCoin
- **Symbol**: FIZZ
- **Decimals**: 18
- **Initial Supply**: 100,000,000 FIZZ
- **Max Supply**: 1,000,000,000 FIZZ (capped)
- **Standard**: ERC-20 + ERC20Permit (gasless approvals)

### Token Distribution

| Pool | Amount | Percentage | Purpose |
|------|--------|------------|---------|
| Rewards Pool | 50M FIZZ | 50% | User rewards (in contract) |
| Platform Reserve | 50M FIZZ | 50% | Future use (deployer wallet) |
| Future Minting | 900M FIZZ | 90% | On-demand based on growth |

### Reward Amounts

| Action | Reward | Notes |
|--------|--------|-------|
| Accept Connection | 25 FIZZ | Both parties earn |
| Complete Introduction | 50 FIZZ | 100 FIZZ if Super-Connector |
| Referral Signup | 100 FIZZ | Referrer earns |
| Event Check-in | 20 FIZZ | Per event |

## 🔒 Security

### Audited Libraries

- OpenZeppelin Contracts v5.x (industry-standard, audited)

### Security Features

- **Ownable**: Admin functions protected
- **ReentrancyGuard**: Prevents reentrancy attacks
- **Max Supply Cap**: Cannot mint beyond 1B tokens
- **ERC2771**: Secure meta-transactions for gasless claiming

### Recommendations

- ✅ Use hardware wallet for deployer key
- ✅ Store private keys in secure environment (AWS KMS, etc.)
- ✅ Never commit private keys to git
- ✅ Test thoroughly on testnet before mainnet
- ✅ Consider external audit before mainnet (optional)

## 🛠️ Development

### Compile Contracts

```bash
forge build
```

### Format Code

```bash
forge fmt
```

### Clean Build Artifacts

```bash
forge clean
```

### Update Dependencies

```bash
forge update
```

## 📚 Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/5.x/)
- [Base Documentation](https://docs.base.org)
- [Base Paymaster Guide](https://docs.base.org/paymaster)
- [BaseScan Explorer](https://basescan.org)

## 🆘 Troubleshooting

### "Failed to get EIP-1559 fees"

Use legacy gas pricing:

```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --broadcast \
  --verify \
  --legacy
```

### "Verification failed"

Manually verify with correct constructor args:

```bash
cast abi-encode "constructor(address,address)" <FIZZCOIN_ADDR> <FORWARDER_ADDR>
```

### "Insufficient funds"

Get more testnet ETH from faucet or check wallet balance:

```bash
cast balance $YOUR_WALLET_ADDRESS --rpc-url $BASE_SEPOLIA_RPC_URL
```

## 📄 License

MIT License - see contracts for details
