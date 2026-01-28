# FizzCoin Blockchain Integration - Quick Start Guide

**Status**: ✅ Foundation Complete - Ready for Deployment
**Timeline**: 6 weeks to production
**Current Phase**: Week 1 (Foundation) → Week 2 (Wallet Integration)

---

## 🎯 What's Been Done

✅ Smart contracts written and tested (FizzCoin + FizzCoinRewards)
✅ Backend blockchain services implemented
✅ Database schema updated for blockchain integration
✅ Deployment scripts and infrastructure ready
✅ Comprehensive documentation created

**See**: `specs/IMPLEMENTATION-STATUS.md` for complete details

---

## 🚀 Next Steps (Choose Your Path)

### Option A: Quick Test (No Blockchain - 2 minutes)

Current state works without blockchain. Just run the app:

```bash
npm run dev
```

FizzCard app runs normally with database-only rewards (legacy mode).

### Option B: Deploy to Testnet (Full Blockchain - 30 minutes)

Follow this guide to enable real blockchain rewards on Base Sepolia testnet.

---

## 📋 Testnet Deployment Checklist

### Step 1: Install Foundry (5 minutes)

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash

# Reload shell
source ~/.bashrc  # or ~/.zshrc

# Update Foundry
foundryup

# Verify installation
forge --version
```

### Step 2: Install Contract Dependencies (2 minutes)

```bash
cd contracts
forge install OpenZeppelin/openzeppelin-contracts
cd ..
```

### Step 3: Run Contract Tests (2 minutes)

```bash
cd contracts
forge test -vvv
```

Expected: All tests pass ✅

### Step 4: Get Testnet ETH (5 minutes)

1. Create a new wallet (or use existing):
   ```bash
   cast wallet new
   ```

   **⚠️ SAVE THE PRIVATE KEY SECURELY!**

2. Visit Base Sepolia Faucet:
   https://www.coinbase.com/faucets/base-sepolia-faucet

3. Enter your wallet address and get free testnet ETH

4. Verify you received ETH:
   ```bash
   cast balance YOUR_WALLET_ADDRESS --rpc-url https://sepolia.base.org
   ```

### Step 5: Deploy Contracts (5 minutes)

1. Create `contracts/.env`:
   ```bash
   DEPLOYER_PRIVATE_KEY=0x...  # Your private key from Step 4
   BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
   BASESCAN_API_KEY=  # Optional for verification
   ```

2. Deploy:
   ```bash
   cd contracts

   forge script script/Deploy.s.sol:DeployScript \
     --rpc-url $BASE_SEPOLIA_RPC_URL \
     --broadcast \
     --verify \
     -vvvv
   ```

3. **IMPORTANT**: Save the contract addresses from the output:
   ```
   FizzCoin Token: 0x...
   FizzCoinRewards: 0x...
   ```

### Step 6: Configure Backend (5 minutes)

1. Create `apps/Fizzcard/app/.env` (if it doesn't exist):
   ```bash
   cp .env.example .env
   ```

2. Update with blockchain configuration:
   ```bash
   # Blockchain Configuration
   BLOCKCHAIN_MODE=testnet
   FIZZCOIN_CONTRACT_ADDRESS=0x...  # From Step 5
   REWARDS_CONTRACT_ADDRESS=0x...   # From Step 5
   BASE_RPC_URL=https://sepolia.base.org
   REWARD_WALLET_PRIVATE_KEY=0x...  # Same as DEPLOYER_PRIVATE_KEY or different

   # Keep existing settings
   AUTH_MODE=mock
   STORAGE_MODE=memory
   PORT=5013
   ```

### Step 7: Test Backend Integration (2 minutes)

```bash
# From app root directory
npm run dev
```

**Look for these log messages**:
```
[WalletService] Initialized on Base Sepolia
[WalletService] Backend wallet: 0x...
[BlockchainFizzCoinService] Initialized
[BlockchainFizzCoinService] FizzCoin: 0x...
[BlockchainFizzCoinService] Rewards: 0x...
```

✅ **Success!** Blockchain integration is active.

### Step 8: Verify on BaseScan (2 minutes)

1. Visit: https://sepolia.basescan.org/
2. Search for your contract addresses
3. Verify you can see:
   - FizzCoin token with 100M supply
   - FizzCoinRewards contract with ~50M FIZZ balance

---

## 🧪 Testing Blockchain Features

### Test 1: Credit Reward

```bash
# In Node.js console or create a test script
const { blockchainFizzCoinService } = require('./server/services/blockchain/fizzcoin.service');

// Credit 25 FIZZ to a test wallet
const result = await blockchainFizzCoinService.creditReward(
  '0xYourTestWalletAddress',
  25,
  'test_reward'
);

console.log('Transaction hash:', result.hash);
```

### Test 2: Check Pending Rewards

```bash
const pending = await blockchainFizzCoinService.getPendingRewards(
  '0xYourTestWalletAddress'
);

console.log('Pending rewards:', pending, 'FIZZ');
```

### Test 3: Verify on Blockchain

Visit BaseScan and search for the transaction hash to see it on-chain!

---

## 🔍 Troubleshooting

### "Wallet not initialized"

**Cause**: Environment variables not set correctly

**Fix**:
1. Check `.env` file exists
2. Verify `REWARD_WALLET_PRIVATE_KEY` is set
3. Verify `FIZZCOIN_CONTRACT_ADDRESS` and `REWARDS_CONTRACT_ADDRESS` are set
4. Restart server: `npm run dev`

### "Blockchain integration not enabled"

**Cause**: Contract addresses missing or invalid

**Fix**:
1. Check `.env` has `FIZZCOIN_CONTRACT_ADDRESS` and `REWARDS_CONTRACT_ADDRESS`
2. Verify addresses start with `0x` and are 42 characters long
3. Restart server

### "Insufficient funds"

**Cause**: Backend wallet needs more ETH for gas

**Fix**:
1. Get more testnet ETH from faucet
2. Check balance: `cast balance YOUR_WALLET_ADDRESS --rpc-url https://sepolia.base.org`

### "Transaction failed"

**Cause**: Various reasons (gas, contract issue, etc.)

**Fix**:
1. Check BaseScan for transaction details
2. Verify contract has enough FIZZ tokens
3. Check gas price isn't too low

---

## 📚 Next Phase: Wallet Integration (Week 2)

Once testnet deployment is working, proceed to Phase 2:

### Phase 2 Tasks

1. **Create Privy Account**
   - Visit: https://dashboard.privy.io/
   - Sign up and create new app
   - Save App ID

2. **Install Dependencies**
   ```bash
   cd client
   npm install @privy-io/react-auth wagmi viem
   ```

3. **Follow Implementation Plan**
   - See: `specs/implementation-plan.md` → Phase 2 section
   - Estimated time: 3-5 days

---

## 📊 Implementation Timeline

- ✅ **Week 1** (Current): Foundation - Smart contracts deployed ✅
- ⏳ **Week 2** (Next): Wallet Integration - Privy setup
- ⏳ **Week 3**: Backend Integration - Reward system blockchain-enabled
- ⏳ **Week 4**: Frontend Integration - UI for claiming/viewing
- ⏳ **Week 5**: Mainnet Deployment - Production contracts
- ⏳ **Week 6**: Production Launch - Real users earning crypto

**Total**: 6 weeks to production-ready crypto rewards

---

## 🎓 Learning Resources

### Smart Contracts
- [Foundry Book](https://book.getfoundry.sh/) - Comprehensive guide
- [OpenZeppelin Docs](https://docs.openzeppelin.com/contracts/5.x/) - Security patterns
- [Solidity Docs](https://docs.soliditylang.org) - Language reference

### Blockchain Integration
- [Viem Docs](https://viem.sh) - TypeScript blockchain library
- [Base Docs](https://docs.base.org) - Base L2 documentation
- [BaseScan](https://sepolia.basescan.org/) - Blockchain explorer

### FizzCard Specific
- [Implementation Plan](specs/implementation-plan.md) - Complete 6-week guide
- [Crypto Spec](specs/crypto.md) - Technical decisions explained
- [Contracts README](contracts/README.md) - Deployment details
- [Status Report](specs/IMPLEMENTATION-STATUS.md) - Current progress

---

## ✅ Success Checklist

After completing testnet deployment, you should have:

- [x] Foundry installed
- [x] Smart contracts deployed to Base Sepolia
- [x] Contract addresses saved
- [x] Backend .env configured
- [x] Server logs showing blockchain initialization
- [x] Contracts visible on BaseScan
- [x] Test reward credit transaction successful

**All checked?** You're ready for Phase 2: Wallet Integration! 🎉

---

## 💡 Pro Tips

1. **Use Testnet First**: Always test on Base Sepolia before mainnet
2. **Save Private Keys**: Store them securely (never commit to git)
3. **Monitor Gas Costs**: Track transaction costs to estimate production expenses
4. **Read Logs**: Backend logs show detailed blockchain activity
5. **Check BaseScan**: Verify all transactions on blockchain explorer
6. **Test Thoroughly**: Run at least 100 test transactions before mainnet
7. **Document Changes**: Update .env.example when adding new variables

---

## 🆘 Need Help?

1. **Check Documentation**:
   - [Implementation Status](specs/IMPLEMENTATION-STATUS.md)
   - [Contracts README](contracts/README.md)
   - [Implementation Plan](specs/implementation-plan.md)

2. **Review Logs**:
   - Backend: Check server console output
   - Contracts: Use `forge test -vvv` for detailed output
   - Blockchain: Visit BaseScan for transaction details

3. **Common Issues**:
   - Environment variables → Check .env file
   - Gas fees → Get more testnet ETH
   - Contract errors → Check BaseScan transaction details

---

## 🚀 Ready to Deploy?

Follow the steps above, and you'll have a working blockchain-integrated FizzCard app running on Base Sepolia testnet in about 30 minutes!

**Good luck! 🎉**
