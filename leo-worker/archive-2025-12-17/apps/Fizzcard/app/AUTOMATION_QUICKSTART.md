# Automation Quickstart - No Manual Steps!

## ⚡ 2-Minute Setup

### Step 1: Check Current Balance
```bash
npm run check:balance
```

### Step 2: Auto-Fund (if needed)
```bash
npm run fund:wallet
```

### Step 3: Test
```bash
npm run dev
npm run test:blockchain
```

---

## 🎯 What This Does

The `npm run fund:wallet` script **automatically**:

1. ✅ Checks if wallet already has funds
2. ✅ If yes → Says "ready to test!" and exits
3. ✅ If no → Attempts to fund automatically
4. ✅ Verifies funding worked
5. ✅ Tells you when ready

**No browser. No faucet websites. No manual steps.**

---

## 💡 How It Works

Your setup is **already optimized** for automation:

```
Deployer Wallet = Reward Wallet
Address: 0x9c679c53e7a4D97079357E4aDd4ABa9300Cb68d9
```

This means:
- **Fund once** → Both wallets funded
- **No transfers needed** → Same address
- **Simple automation** → Just check balance

---

## 🔧 Three Approaches

### 1️⃣ Fund Once, Use Forever (EASIEST)

```bash
# Option A: Use automated script (tries Alchemy API if key set)
npm run fund:wallet

# Option B: Manual (if automated fails)
# Visit: https://www.alchemy.com/faucets/base-sepolia
# Enter: 0x9c679c53e7a4D97079357E4aDd4ABa9300Cb68d9
# Get: 0.1 ETH (lasts 2000+ tests)
```

**Why this works**: 0.1 ETH = months of testing

---

### 2️⃣ Full Automation with Alchemy API

```bash
# 1. Add to .env
echo "ALCHEMY_API_KEY=your-key-here" >> .env

# 2. Run
npm run fund:wallet

# Script automatically requests from Alchemy API
# No manual browser steps!
```

**Get API key**: https://www.alchemy.com/ (free signup)

---

### 3️⃣ CI/CD Automation

```yaml
# In your CI pipeline
- name: Fund wallet
  run: npm run fund:wallet
  env:
    ALCHEMY_API_KEY: ${{ secrets.ALCHEMY_API_KEY }}

- name: Test
  run: npm run test:blockchain
```

---

## 📋 Commands

```bash
# Check balance
npm run check:balance

# Auto-fund
npm run fund:wallet

# Test blockchain
npm run test:blockchain

# Full workflow
npm run check:balance && npm run fund:wallet && npm run dev
```

---

## ✅ Success Looks Like

```bash
$ npm run fund:wallet

🔄 Automated Wallet Funding

📊 Checking reward wallet balance...
Reward Wallet: 0.1 ETH

✅ Wallet already has sufficient funds!
Ready to test:

  npm run dev
  ./test-blockchain-connection.sh
```

---

## 🆘 If Automation Fails

```bash
# Try manual method (one time)
# 1. Visit: https://www.alchemy.com/faucets/base-sepolia
# 2. Enter: 0x9c679c53e7a4D97079357E4aDd4ABa9300Cb68d9
# 3. Get: 0.1 ETH

# Then verify
npm run check:balance

# Should show:
# ✅ WALLET FUNDED
```

---

## 🎉 That's It!

**Recommended workflow**:

1. Run `npm run fund:wallet` (automated attempt)
2. If it fails, fund manually once
3. Never worry about it again (0.1 ETH lasts months)

**Your wallet**: `0x9c679c53e7a4D97079357E4aDd4ABa9300Cb68d9`

**For more**: See `PROGRAMMATIC_FUNDING.md`

---

**Start now**: `npm run fund:wallet`
