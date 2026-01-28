# Wallet Funding Guide - FizzCard Blockchain Integration

## 🎯 Objective

Fund the backend reward wallet with Base Sepolia ETH so it can pay gas fees for minting FizzCoin rewards on-chain.

---

## 📋 Quick Reference

**Reward Wallet Address**: `0x9c679c53e7a4D97079357E4aDd4ABa9300Cb68d9`

**Network**: Base Sepolia (Testnet)

**Amount Needed**: 0.05 - 0.1 ETH (for testing)

**Explorer**: https://sepolia.basescan.org/address/0x9c679c53e7a4D97079357E4aDd4ABa9300Cb68d9

---

## 🚀 Step-by-Step Funding Instructions

### Method 1: Coinbase Wallet + Base Faucet (Recommended)

#### Step 1: Install Coinbase Wallet
1. Download Coinbase Wallet extension: https://www.coinbase.com/wallet
2. Create a new wallet or import existing one
3. Secure your recovery phrase

#### Step 2: Get Sepolia ETH
1. Visit Ethereum Sepolia Faucet: https://sepoliafaucet.com/
2. Connect your Coinbase Wallet
3. Request 0.5 ETH (may require social verification)
4. Wait 1-2 minutes for transaction to confirm

#### Step 3: Bridge to Base Sepolia
1. Visit Base Bridge (Testnet): https://bridge.base.org/
2. **Important**: Switch to "Sepolia → Base Sepolia" mode
3. Connect your Coinbase Wallet
4. Bridge 0.1 ETH from Sepolia to Base Sepolia
5. Wait 2-5 minutes for bridge to complete

#### Step 4: Send to Reward Wallet
1. In Coinbase Wallet, click "Send"
2. Network: **Base Sepolia**
3. To Address: `0x9c679c53e7a4D97079357E4aDd4ABa9300Cb68d9`
4. Amount: `0.05 ETH`
5. Confirm transaction
6. Wait 30 seconds for confirmation

---

### Method 2: QuickNode Faucet (Fastest)

#### Step 1: Get Base Sepolia ETH Directly
1. Visit: https://faucet.quicknode.com/base/sepolia
2. Enter reward wallet address: `0x9c679c53e7a4D97079357E4aDd4ABa9300Cb68d9`
3. Complete CAPTCHA
4. Click "Continue"
5. Receive 0.05 ETH instantly

**Note**: May have rate limits (1 request per day per IP)

---

### Method 3: Alchemy Faucet

#### Step 1: Create Alchemy Account
1. Visit: https://www.alchemy.com/faucets/base-sepolia
2. Sign up for free Alchemy account
3. Verify email

#### Step 2: Request Base Sepolia ETH
1. Log in to Alchemy
2. Navigate to Base Sepolia Faucet
3. Enter wallet address: `0x9c679c53e7a4D97079357E4aDd4ABa9300Cb68d9`
4. Complete verification
5. Receive 0.1 ETH

---

## ✅ Verify Funding

### Check on BaseScan

1. **Visit Explorer**:
   ```
   https://sepolia.basescan.org/address/0x9c679c53e7a4D97079357E4aDd4ABa9300Cb68d9
   ```

2. **Check Balance**:
   - Look for "Balance" at top of page
   - Should show: `0.05 ETH` or more
   - Example: "Balance: 0.05 Ether ($0.00)"

3. **View Transactions**:
   - Click "Transactions" tab
   - You should see the incoming transfer
   - Status should be "Success" (green checkmark)

### Check via Script

Run this command to verify balance:

```bash
node verify-wallet-balance.js
```

---

## 🧪 Test Blockchain Integration

Once funded, test the integration:

### Step 1: Restart Server

```bash
# Kill existing server
pkill -f "tsx watch index.ts"
pkill -f "vite"

# Start fresh
npm run dev
```

### Step 2: Run Integration Test

```bash
./test-blockchain-connection.sh
```

**Expected Output**:
```
✅ Exchange accepted!
💰 FizzCoins earned: 25 FIZZ each

User 1 Pending Balance: 25 FIZZ
User 2 Pending Balance: 25 FIZZ

🎉 SUCCESS! Blockchain integration test PASSED
```

### Step 3: Verify on Blockchain

1. Check server logs for transaction hash:
   ```bash
   grep "TX:" /tmp/fizzcard-dev-server.log
   ```

2. Visit transaction on BaseScan:
   ```
   https://sepolia.basescan.org/tx/[TX_HASH]
   ```

3. Verify:
   - ✅ Status: Success
   - ✅ From: 0x9c679c53e7a4D97079357E4aDd4ABa9300Cb68d9 (reward wallet)
   - ✅ To: 0x9c8376CA2ffdCfBA55AB46dBe168b8c1d09dA21a (Rewards contract)
   - ✅ Function: creditReward(address,uint256)

---

## 📊 Gas Cost Estimates

**Per Reward Transaction**:
- Gas Used: ~50,000 - 80,000 gas
- Gas Price: ~0.001 Gwei (Base Sepolia is cheap)
- Cost per Transaction: ~0.00005 - 0.0001 ETH

**With 0.05 ETH**:
- Estimated Transactions: 500 - 1,000 rewards
- Enough for: Full testing + demos

---

## 🔍 Troubleshooting

### Problem: Faucet Rate Limited

**Solution 1**: Use a different faucet (try all 3 methods above)

**Solution 2**: Use a VPN to change IP address

**Solution 3**: Wait 24 hours and try again

### Problem: Transaction Fails

**Check**:
1. Network is "Base Sepolia" (not Sepolia or Base Mainnet)
2. Address is correct: `0x9c679c53e7a4D97079357E4aDd4ABa9300Cb68d9`
3. Wallet has enough ETH for transaction + gas

**Solution**: Double-check network in wallet

### Problem: Balance Shows 0 After Funding

**Wait**: Transactions take 30 seconds - 2 minutes

**Check**:
1. Refresh BaseScan page
2. Click on latest transaction
3. Verify status is "Success"

**If Pending**: Wait up to 5 minutes

**If Failed**: Check error message on BaseScan

---

## 🎉 Success Checklist

Before marking as complete:

- [ ] Reward wallet balance shows ≥ 0.05 ETH on BaseScan
- [ ] Balance visible at https://sepolia.basescan.org/address/0x9c679c53e7a4D97079357E4aDd4ABa9300Cb68d9
- [ ] Server restarted after funding
- [ ] Integration test runs successfully
- [ ] Transaction hash appears in server logs
- [ ] Transaction verified on BaseScan
- [ ] Both test users receive 25 FIZZ each

---

## 📝 Additional Resources

### Faucets
- QuickNode: https://faucet.quicknode.com/base/sepolia
- Alchemy: https://www.alchemy.com/faucets/base-sepolia
- Coinbase: https://www.coinbase.com/faucets

### Bridge
- Base Bridge (Testnet): https://bridge.base.org/

### Explorers
- Base Sepolia: https://sepolia.basescan.org/
- Ethereum Sepolia: https://sepolia.etherscan.io/

### Documentation
- Base Docs: https://docs.base.org/
- Viem Docs: https://viem.sh/
- FizzCard Blockchain Guide: `BLOCKCHAIN_CONNECTION_TESTING.md`

---

## 🚨 Security Note

**Private Key**: The private key in `.env` is for **testnet only**

**Never**:
- ❌ Use this key on mainnet
- ❌ Fund this wallet with real ETH
- ❌ Share this key publicly
- ❌ Commit to public repos

**For Production**:
- Generate new private key
- Store in secure environment variables
- Use hardware wallet or KMS
- Never commit to version control

---

## 📞 Support

If you encounter issues:

1. Check troubleshooting section above
2. Review server logs: `tail -f /tmp/fizzcard-dev-server.log`
3. Verify environment variables: `cat .env | grep REWARD`
4. Check wallet service logs in server output

**Common Issues**:
- "Insufficient funds" → Wallet not funded yet
- "Invalid address" → Wrong network selected
- "Transaction reverted" → Contract issue (check contract deployment)

---

**Last Updated**: October 25, 2025
**Network**: Base Sepolia Testnet
**Wallet**: 0x9c679c53e7a4D97079357E4aDd4ABa9300Cb68d9
