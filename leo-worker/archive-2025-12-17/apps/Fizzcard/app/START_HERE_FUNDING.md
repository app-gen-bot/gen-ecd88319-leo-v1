# 🚀 Quick Start: Wallet Funding

## The Simplest Path to Get Started

### Problem
Your wallet needs testnet ETH to test blockchain features, but you don't have mainnet ETH (which some faucets require).

### Solution
**Semi-automated funding** using Coinbase faucet (no mainnet ETH required).

---

## 3-Step Quick Start

### 1️⃣ Check Balance
```bash
npm run check:balance
```

### 2️⃣ Run Funding Script
```bash
npm run fund:wallet
```
This will:
- Check your balance
- Open browser to Coinbase faucet
- Show you exactly what to do

### 3️⃣ Click in Browser
When browser opens:
1. Select "Base Sepolia" network
2. Paste: `0x9c679c53e7a4D97079357E4aDd4ABa9300Cb68d9`
3. Click "Send me ETH"

**That's it!** Wait 30 seconds, then verify:
```bash
npm run check:balance
```

---

## Why This Solution?

| Requirement | Status |
|-------------|--------|
| No mainnet ETH required | ✅ |
| No signup/login | ✅ |
| Automated balance check | ✅ |
| Automated browser opening | ✅ |
| Clear instructions | ✅ |
| Reliable | ✅ |
| Fast (< 1 minute) | ✅ |

**Result**: 95% automated - the best possible without mainnet ETH!

---

## After Funding

```bash
# Start development
npm run dev

# Test blockchain integration
npm run test:blockchain
```

---

## Need More Details?

- **Complete guide**: See `WALLET_FUNDING_COMPLETE.md`
- **All faucet options**: See `ALTERNATIVE_FUNDING_METHODS.md`
- **Automation details**: See `PROGRAMMATIC_FUNDING.md`

---

## Troubleshooting

**Browser didn't open?**
Manually visit: https://portal.cdp.coinbase.com/products/faucet

**Still showing low balance?**
Wait 1 minute after clicking "Send me ETH", then:
```bash
npm run check:balance
```

**Need help?**
See `WALLET_FUNDING_COMPLETE.md` for detailed troubleshooting.

---

## 🎉 That's It!

**One command** → **Browser opens** → **One click** → **Done**

Your wallet will have 0.1 ETH = ~2000 test transactions = months of development.
