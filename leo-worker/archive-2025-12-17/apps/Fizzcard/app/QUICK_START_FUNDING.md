# Quick Start: Fund Wallet & Test Blockchain

## 🎯 Your Reward Wallet

```
Address: 0x9c679c53e7a4D97079357E4aDd4ABa9300Cb68d9
Network: Base Sepolia (Testnet)
Current Balance: ~0.0001 ETH (LOW - needs more funding)
```

---

## ⚡ Fastest Method: QuickNode Faucet

### 3-Minute Setup:

1. **Visit Faucet**:
   ```
   https://faucet.quicknode.com/base/sepolia
   ```

2. **Enter Address**:
   ```
   0x9c679c53e7a4D97079357E4aDd4ABa9300Cb68d9
   ```

3. **Complete CAPTCHA** → Click "Continue"

4. **Receive 0.05 ETH** (instant)

---

## ✅ Verify Funding

### Option 1: Use Our Script
```bash
node verify-wallet-balance.js
```

**Expected Output**:
```
✅ WALLET FUNDED
Balance is sufficient for testing!
Ready to test blockchain integration
```

### Option 2: Check BaseScan
```
https://sepolia.basescan.org/address/0x9c679c53e7a4D97079357E4aDd4ABa9300Cb68d9
```

Look for: **Balance: 0.05 ETH** or more

---

## 🧪 Test Blockchain Integration

Once funded (≥ 0.05 ETH):

```bash
# 1. Restart server
npm run dev

# 2. Run test (in new terminal)
./test-blockchain-connection.sh
```

**Success looks like**:
```
✅ Exchange accepted!
💰 FizzCoins earned: 25 FIZZ each
🎉 SUCCESS! Blockchain integration test PASSED
```

---

## 🔍 Verify Transaction on Blockchain

1. Check server logs:
   ```bash
   grep "Reward credited" /tmp/fizzcard-dev-server.log
   grep "TX:" /tmp/fizzcard-dev-server.log
   ```

2. Copy transaction hash and visit:
   ```
   https://sepolia.basescan.org/tx/[TRANSACTION_HASH]
   ```

3. Confirm:
   - ✅ Status: Success
   - ✅ Function: creditReward
   - ✅ From: Your reward wallet
   - ✅ To: Rewards contract (0x9c8376...)

---

## 🆘 Troubleshooting

### Faucet Not Working?

**Try Alternative Faucets**:
1. Alchemy: https://www.alchemy.com/faucets/base-sepolia
2. Coinbase: https://www.coinbase.com/faucets (Sepolia → Bridge to Base)

### Transaction Fails?

**Check**:
```bash
# Verify balance
node verify-wallet-balance.js

# Check server logs
tail -50 /tmp/fizzcard-dev-server.log
```

**Common Issues**:
- "Insufficient funds" → Need more ETH
- "Invalid network" → Server not using Base Sepolia
- "Contract error" → Check contract addresses in .env

---

## 📚 Need More Details?

See: `WALLET_FUNDING_GUIDE.md` for:
- Multiple funding methods
- Detailed troubleshooting
- Security best practices
- Gas cost estimates

---

**Current Status**: Wallet has 0.0001 ETH → **NEEDS FUNDING**

**Action Required**: Add 0.05 ETH using QuickNode faucet (link above)

**ETA**: 5 minutes to fund → 2 minutes to test → ✅ Done!
