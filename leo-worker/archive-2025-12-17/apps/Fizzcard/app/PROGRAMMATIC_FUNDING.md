# Programmatic Wallet Funding Guide

## 🎯 Objective

Automate the wallet funding process so you don't have to manually use faucets.

---

## ⚡ Quick Start (Automated)

### Option 1: Use NPM Script (Easiest)

```bash
# Check current balance
npm run check:balance

# Attempt automated funding
npm run fund:wallet
```

### Option 2: Run Script Directly

```bash
# Simple automated funding
node fund-wallet-simple.js

# Or check balance first
node verify-wallet-balance.js
```

---

## 🔧 How It Works

### Current Setup

Your **reward wallet** and **deployer wallet** are **the same**:

```
Address: 0x9c679c53e7a4D97079357E4aDd4ABa9300Cb68d9
Private Key: Set in REWARD_WALLET_PRIVATE_KEY
```

**This means**: Fund this one address and both "wallets" are funded!

### Automated Funding Methods

The scripts try multiple methods in order:

1. **Check if already funded** → If yes, done! ✅
2. **Self-transfer check** → If deployer = reward wallet with funds, done! ✅
3. **Transfer from deployer** → If deployer has extra funds, transfer to reward wallet
4. **Alchemy API** (if API key set) → Request from faucet programmatically
5. **Fallback to manual** → Show instructions for manual funding

---

## 📋 Three Automated Approaches

### Approach 1: Fund Once Manually, Never Again (RECOMMENDED)

Since deployer = reward wallet, you only need to fund it **once**:

**Step 1**: Fund the wallet manually (one time only)
```bash
# Use Alchemy web faucet
https://www.alchemy.com/faucets/base-sepolia

# Enter: 0x9c679c53e7a4D97079357E4aDd4ABa9300Cb68d9
# Request: 0.1 ETH
```

**Step 2**: Verify
```bash
npm run check:balance
```

**Step 3**: You're done!
```bash
# The wallet now has funds
# No more manual steps needed
# ETH will last for 2000+ test transactions
```

**Why this works**:
- 0.1 ETH = ~2000 reward transactions
- Testnet ETH doesn't run out quickly
- When you need more, just repeat Step 1

---

### Approach 2: Use Alchemy API (Fully Automated)

Set up Alchemy API key once, then automate everything:

**Step 1**: Get Alchemy API Key
1. Visit: https://www.alchemy.com/
2. Sign up (free)
3. Create a Base Sepolia app
4. Copy API key

**Step 2**: Add to `.env`
```bash
# Add this line to .env
ALCHEMY_API_KEY=your-api-key-here
```

**Step 3**: Run automated funding
```bash
npm run fund:wallet
```

**Step 4**: Script automatically:
- Checks balance
- Requests ETH from Alchemy API
- Waits for confirmation
- Verifies new balance
- Tells you when ready to test

**Benefits**:
- ✅ Fully automated
- ✅ No manual browser steps
- ✅ Can be included in CI/CD
- ✅ Repeatable

**Limitations**:
- Requires Alchemy account (free)
- Rate limits (usually 1 request per 24 hours)

---

### Approach 3: Use Separate Deployer Wallet

If you want to keep deployer and reward wallets separate:

**Step 1**: Fund your deployer wallet
```bash
# Current deployer address
node get-wallet-address.js

# Fund this address with 0.1 ETH using any faucet
```

**Step 2**: Script automatically transfers
```bash
npm run fund:wallet

# Script will:
# - Detect deployer has funds
# - Transfer 0.05 ETH to reward wallet
# - Keep 0.05 ETH in deployer for gas
```

**Benefits**:
- ✅ Separation of concerns
- ✅ Deployer can fund multiple wallets
- ✅ Automated transfers

---

## 🤖 Complete Automation (CI/CD Ready)

For fully automated testing in CI/CD:

### Option A: Pre-funded Wallet

```bash
# In CI/CD environment
export REWARD_WALLET_PRIVATE_KEY="0x..."  # Pre-funded wallet
npm run check:balance  # Verify funds
npm run dev &          # Start server
npm run test:blockchain  # Run tests
```

### Option B: Alchemy API in CI

```bash
# In CI/CD environment
export ALCHEMY_API_KEY="your-key"
npm run fund:wallet    # Auto-fund if needed
npm run dev &
npm run test:blockchain
```

### Option C: Local Testnet (Hardhat/Anvil)

For completely offline testing:

```bash
# Start local testnet with pre-funded accounts
npx hardhat node  # or anvil

# Update .env to use local network
BASE_RPC_URL=http://localhost:8545

# Deploy contracts
npm run deploy:local

# Test without real testnet
npm run test:blockchain
```

---

## 📊 Funding Scripts Comparison

| Script | Purpose | Use Case |
|--------|---------|----------|
| `fund-wallet-simple.js` | Simple check & transfer | Quick automated check |
| `scripts/fund-wallet-auto.ts` | Multi-method attempt | Comprehensive automation |
| `scripts/fund-with-alchemy.js` | Alchemy API only | When Alchemy key available |
| `verify-wallet-balance.js` | Check balance only | Status check |

**Recommended**: Use `npm run fund:wallet` which runs `fund-wallet-simple.js`

---

## 🔄 Automated Workflow Example

### Development Workflow

```bash
# 1. Check if wallet needs funding
npm run check:balance

# 2. If needed, fund automatically
npm run fund:wallet

# 3. Start development
npm run dev

# 4. Test blockchain integration
npm run test:blockchain
```

### CI/CD Workflow

```yaml
# .github/workflows/test.yml
name: Test Blockchain Integration

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Fund wallet (if needed)
        env:
          ALCHEMY_API_KEY: ${{ secrets.ALCHEMY_API_KEY }}
        run: npm run fund:wallet

      - name: Start server
        run: npm run dev &

      - name: Wait for server
        run: sleep 10

      - name: Test blockchain integration
        run: npm run test:blockchain
```

---

## 💡 Best Practices

### For Development

1. **Fund once at start of project**
   ```bash
   # Manual fund: https://www.alchemy.com/faucets/base-sepolia
   # Then never worry about it again
   ```

2. **Check before testing**
   ```bash
   npm run check:balance
   ```

3. **Automate if low**
   ```bash
   npm run fund:wallet
   ```

### For Production

1. **Use separate wallets**
   - Deployer: For contract deployment
   - Reward: For minting rewards (auto-refill from treasury)

2. **Monitor balance**
   ```bash
   # Add to monitoring
   npm run check:balance
   # Alert if < 0.01 ETH
   ```

3. **Auto-refill from treasury**
   ```typescript
   // Backend job
   if (rewardWalletBalance < threshold) {
     await treasuryWallet.transfer(rewardWallet, refillAmount);
   }
   ```

---

## 🆘 Troubleshooting

### "Insufficient funds" after running fund script

**Cause**: Automated methods failed

**Solution**:
```bash
# Check what happened
npm run check:balance

# If still low, fund manually (one time)
# Visit: https://www.alchemy.com/faucets/base-sepolia
# Enter: 0x9c679c53e7a4D97079357E4aDd4ABa9300Cb68d9
```

### "Alchemy API request failed"

**Cause**: Rate limit or invalid API key

**Solution**:
```bash
# Check .env has correct key
cat .env | grep ALCHEMY_API_KEY

# If missing, add it:
# ALCHEMY_API_KEY=your-key-here

# Try again in 24 hours (rate limit)
# Or use manual method
```

### "Transaction failed"

**Cause**: Network issues or insufficient gas

**Solution**:
```bash
# Retry
npm run fund:wallet

# Or fund manually with higher gas
```

---

## 📝 Summary: Your Options

### 🥇 Best for Most Cases: Fund Once Manually
```bash
# 1. Visit faucet (one time)
https://www.alchemy.com/faucets/base-sepolia

# 2. Enter address
0x9c679c53e7a4D97079357E4aDd4ABa9300Cb68d9

# 3. Get 0.1 ETH

# 4. Done for months!
```

**Why**: Simple, fast, lasts 2000+ transactions

---

### 🥈 Best for Automation: Alchemy API
```bash
# 1. Add API key to .env
ALCHEMY_API_KEY=your-key

# 2. Run script
npm run fund:wallet

# 3. Automated forever
```

**Why**: Fully automated, repeatable, CI/CD ready

---

### 🥉 Best for CI/CD: Pre-funded Wallet
```bash
# 1. Fund wallet once with 1 ETH
# 2. Use in CI/CD
# 3. Refill every few months
```

**Why**: No external dependencies, fast, reliable

---

## ✅ Checklist

- [ ] Choose funding approach (manual once / API / pre-funded)
- [ ] Run `npm run check:balance` to see current status
- [ ] If low, run `npm run fund:wallet` or fund manually
- [ ] Verify with `npm run check:balance` again
- [ ] Test with `npm run test:blockchain`
- [ ] Document which approach you chose

---

## 🎉 Ready to Go!

Once funded (≥ 0.01 ETH), you can:

```bash
# Start development
npm run dev

# Test blockchain
npm run test:blockchain

# Check balance anytime
npm run check:balance

# Refund if needed
npm run fund:wallet
```

**Your wallet**: `0x9c679c53e7a4D97079357E4aDd4ABa9300Cb68d9`

**Current approach**: Use `npm run fund:wallet` first, then fallback to manual if needed

---

## 📚 Related Documentation

- `EASY_FUNDING_FIX.md` - Manual funding steps
- `ALTERNATIVE_FUNDING_METHODS.md` - All faucet options
- `WALLET_FUNDING_GUIDE.md` - Comprehensive guide
- `fund-wallet-simple.js` - Simple automation script
- `verify-wallet-balance.js` - Balance checker
