# 🎴 Wallet Funding - Quick Reference Card

> **Print this or keep it handy for instant reference**

---

## ⚡ Quick Commands

```bash
# Check wallet balance
npm run check:balance

# Fund wallet (opens browser automatically)
npm run fund:wallet

# Alternative: Try API automation
npm run fund:wallet:automated

# Self-transfer (if deployer funded)
npm run fund:wallet:simple
```

---

## 🎯 3-Step Process

### 1️⃣ Check Balance
```bash
npm run check:balance
```
**Output**: ✅ Funded / ⚠️ Low / ❌ Empty

### 2️⃣ Fund Wallet
```bash
npm run fund:wallet
```
**Browser opens automatically** to Coinbase faucet

### 3️⃣ In Browser (3 clicks)
1. Select: **"Base Sepolia"**
2. Paste: `0x9c679c53e7a4D97079357E4aDd4ABa9300Cb68d9`
3. Click: **"Send me ETH"**

**Done!** Wait 30 seconds, verify with `npm run check:balance`

---

## 📋 Wallet Info

| Item | Value |
|------|-------|
| **Address** | `0x9c679c53e7a4D97079357E4aDd4ABa9300Cb68d9` |
| **Network** | Base Sepolia (Testnet) |
| **Explorer** | https://sepolia.basescan.org/ |
| **Faucet** | https://portal.cdp.coinbase.com/products/faucet |

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Browser didn't open | Visit manually: https://portal.cdp.coinbase.com/products/faucet |
| Still low balance | Wait 1-2 minutes, run `npm run check:balance` |
| Transaction pending | Check explorer: https://sepolia.basescan.org/address/0x9c679c53e7a4D97079357E4aDd4ABa9300Cb68d9 |
| Need help | Read `START_HERE_FUNDING.md` or `WALLET_FUNDING_COMPLETE.md` |

---

## 📚 Documentation Quick Links

| Need | Read This | Time |
|------|-----------|------|
| **Just fund wallet** | `START_HERE_FUNDING.md` | 1 min |
| **Quick commands** | `README_WALLET_FUNDING.md` | 2 min |
| **Complete guide** | `WALLET_FUNDING_COMPLETE.md` | 10 min |
| **Understand scripts** | `FUNDING_SCRIPTS_OVERVIEW.md` | 10 min |
| **What was tried** | `AUTOMATION_JOURNEY.md` | 15 min |
| **All faucets** | `ALTERNATIVE_FUNDING_METHODS.md` | 5 min |
| **CI/CD setup** | `PROGRAMMATIC_FUNDING.md` | 15 min |
| **Navigation** | `WALLET_FUNDING_INDEX.md` | 1 min |

---

## ✅ Daily Workflow

### Morning Routine
```bash
npm run check:balance  # Verify funds
npm run dev            # Start development
```

### When Balance Low (months later)
```bash
npm run fund:wallet    # Opens browser
# 3 clicks in browser
npm run check:balance  # Verify funding
```

---

## 💰 Funding Facts

| Fact | Value |
|------|-------|
| Amount received | 0.1 ETH |
| Transactions possible | ~2000 |
| Lasts for | 3-6 months of active dev |
| Time to fund | < 1 minute |
| Mainnet ETH required | ❌ No |
| Automation level | 95% |

---

## 🔧 Script Reference

| Script | Purpose | Use When |
|--------|---------|----------|
| `fund-wallet-final.js` ⭐ | Coinbase faucet | **Default choice** |
| `fund-wallet-no-mainnet.js` | API attempts | Want to try automation |
| `fund-wallet-simple.js` | Self-transfer | Deployer is funded |
| `verify-wallet-balance.js` | Check balance | Anytime |

---

## 🎯 Success Indicators

**Wallet Funded** when you see:
```
✅ WALLET FUNDED
Balance: 0.1 ETH (or more)
Estimated transactions: 1000+
```

**Ready to Develop** when you see:
```
✅ Server running on http://localhost:5013
✅ Client running on http://localhost:5173
```

---

## 📞 Resources

| Resource | URL |
|----------|-----|
| Coinbase Faucet | https://portal.cdp.coinbase.com/products/faucet |
| Base Sepolia Explorer | https://sepolia.basescan.org/ |
| Your Wallet | https://sepolia.basescan.org/address/0x9c679c53e7a4D97079357E4aDd4ABa9300Cb68d9 |
| Alternative Faucets | See `ALTERNATIVE_FUNDING_METHODS.md` |

---

## 🚨 Important Notes

1. **No Mainnet ETH Required** ✅
   - Coinbase faucet works without it
   - Best option for beginners

2. **One Manual Step** ⚠️
   - Browser click is unavoidable (anti-bot)
   - 95% automation is the best possible

3. **Fund Once, Use for Months** 💡
   - 0.1 ETH lasts thousands of transactions
   - Only refund when balance gets low

4. **Always Check Balance First** 📊
   - Run `npm run check:balance` before funding
   - Avoid unnecessary faucet requests

---

## ⚡ One-Liner Cheat Sheet

```bash
# Complete funding in one go:
npm run check:balance && npm run fund:wallet
# Then 3 clicks in browser
```

---

## 🎉 Bottom Line

**Command**: `npm run fund:wallet`
**Time**: < 1 minute
**Steps**: 3 clicks in browser
**Result**: 0.1 ETH (months of testing)

**That's it!** Simple, fast, reliable. 🚀

---

*Keep this card handy - everything you need on one page!*
