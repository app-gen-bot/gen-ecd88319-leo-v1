# Testing Guide: Wallet Integration

This guide will help you test the Privy wallet integration end-to-end.

---

## Prerequisites

✅ Privy App ID configured in `.env`
✅ Server and client dependencies installed
✅ Database running (if using `STORAGE_MODE=database`)

---

## Test 1: Server Startup

**Expected**: Server starts without errors

```bash
npm run dev --workspace=fizzcard-server
```

**Look for**:
```
✅ Server running at http://localhost:5013
✅ [BlockchainFizzCoinService] Contract addresses not set - blockchain features disabled
```

This is EXPECTED - blockchain features gracefully disabled without contracts.

---

## Test 2: Client Startup

**Expected**: Client builds and starts

```bash
# In a new terminal
npm run dev --workspace=fizzcard-client
```

**Look for**:
```
✅ VITE v5.x.x ready in XXX ms
✅ Local: http://localhost:5173/
```

---

## Test 3: Privy Integration Check

**Expected**: Privy loads without errors

1. Open browser to `http://localhost:5173`
2. Open browser console (F12)
3. Look for Privy logs:
   ```
   ✅ No warnings about "VITE_PRIVY_APP_ID not configured"
   ```

---

## Test 4: Wallet Creation on Signup

**Expected**: Embedded wallet created automatically

### Steps:

1. **Navigate to signup**:
   - Go to `http://localhost:5173/signup`

2. **Create account**:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Click "Sign Up"

3. **Watch for**:
   - ✅ Toast notification: "Crypto wallet created! 🎉"
   - ✅ Redirect to dashboard
   - ✅ Console log: `[Signup] Creating crypto wallet: 0x...`

4. **Verify in database** (if using database mode):
   ```sql
   SELECT * FROM crypto_wallets ORDER BY id DESC LIMIT 1;
   ```
   Should show newly created wallet with:
   - `user_id` matching your user
   - `wallet_address` starting with `0x`
   - `wallet_type` = `embedded`

---

## Test 5: View Wallet Page

**Expected**: Blockchain wallet card displays

### Steps:

1. **Navigate to wallet**:
   - Click "Wallet" in navigation
   - OR go to `http://localhost:5173/wallet`

2. **Verify blockchain wallet card**:
   - ✅ Card appears at top with gold/fizzCoin border
   - ✅ "Blockchain Wallet" heading
   - ✅ Badge showing "Embedded"
   - ✅ Wallet address displayed (e.g., `0x1234...5678`)
   - ✅ Copy button next to address
   - ✅ Basescan link (external link icon)

3. **Verify balance display**:
   - ✅ Three columns: On-Chain, Pending, Total
   - ✅ All showing 0 (no rewards yet)

4. **Verify NO claim button**:
   - ✅ Button should NOT appear (no pending rewards)

5. **Verify legacy balance card**:
   - ✅ Shows "Legacy Balance" (since blockchain wallet exists)
   - ✅ Current balance, total earned, total spent

---

## Test 6: Copy Wallet Address

**Expected**: Address copies to clipboard

### Steps:

1. On wallet page, click the **Copy** button (next to wallet address)

2. **Verify**:
   - ✅ Toast: "Address copied to clipboard!"
   - ✅ Copy icon briefly changes to checkmark
   - ✅ Paste somewhere to verify correct address

---

## Test 7: Basescan Link

**Expected**: Opens Basescan in new tab

### Steps:

1. Click the **External Link** icon next to wallet address

2. **Verify**:
   - ✅ Opens https://basescan.org/address/0x... in new tab
   - ✅ Shows "This address has not been claimed"
   - This is EXPECTED - new wallet has no on-chain activity yet

---

## Test 8: Transaction History (No Blockchain)

**Expected**: Legacy transactions display correctly

### Steps:

1. If you have no transactions yet, create some:
   - Exchange a contact (scan QR code or connect manually)
   - OR seed the database with test transactions

2. **Verify transaction display**:
   - ✅ Transactions show with correct icons and types
   - ✅ Dates formatted correctly
   - ✅ Amounts show with + or - prefix

3. **Verify NO blockchain links**:
   - ✅ Legacy transactions should NOT show "View on blockchain" link
   - (Only transactions with `txHash` will show this link)

---

## Test 9: Claim Button (Pending Rewards)

**Expected**: Button appears when pending claims > 0

### Steps:

1. **Manually increment pending claims** (for testing):

   **Option A - Direct Database**:
   ```sql
   UPDATE crypto_wallets
   SET pending_claim_amount = 100
   WHERE user_id = 1;
   ```

   **Option B - API Call**:
   ```bash
   curl -X POST http://localhost:5013/api/crypto-wallet/claim \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json"
   ```

2. **Refresh wallet page**

3. **Verify**:
   - ✅ "Pending" column shows 100
   - ✅ "Total" column shows 100
   - ✅ Claim button appears: "Claim 100 FIZZ Rewards"

4. **Click claim button**:
   - ⚠️ Will fail with: "Blockchain features are currently disabled"
   - This is EXPECTED - no smart contracts deployed yet

---

## Test 10: Filter Transactions

**Expected**: New transaction types appear in filter

### Steps:

1. On wallet page, click "Filter" button

2. **Verify dropdown includes**:
   - ✅ All Types
   - ✅ Reward Earned (new)
   - ✅ Reward Claimed (new)
   - ✅ Contact Exchange
   - ✅ Introduction
   - ✅ Referral
   - ✅ Bonus
   - ✅ Transfer

---

## Test 11: Multiple Users

**Expected**: Each user gets their own wallet

### Steps:

1. **Create second user**:
   - Logout (if logged in)
   - Go to `/signup`
   - Create account with different email

2. **Verify**:
   - ✅ Toast: "Crypto wallet created! 🎉"
   - ✅ Different wallet address than first user

3. **Check database**:
   ```sql
   SELECT id, user_id, wallet_address FROM crypto_wallets;
   ```
   Should show 2 wallets with different addresses

---

## Test 12: Wallet Already Exists

**Expected**: Graceful handling of duplicate wallet creation

### Steps:

1. Try to create wallet again (manually via API or code)

2. **Expected behavior**:
   - Returns 409 Conflict
   - Error: "Wallet already exists for this user"
   - Returns existing wallet data

---

## Common Issues & Solutions

### Issue: No toast on signup
**Solution**:
- Check Privy is configured: `grep VITE_PRIVY_APP_ID .env`
- Check browser console for errors
- Privy may take a few seconds to create wallet

### Issue: Wallet card not showing
**Solution**:
- Check database: `SELECT * FROM crypto_wallets`
- If no wallet, manually create via API
- Check console for API errors

### Issue: Basescan link goes to wrong network
**Solution**:
- This is expected in development
- Use Base Sepolia explorer: https://sepolia.basescan.org
- Or wait until mainnet deployment

### Issue: Claim button does nothing
**Solution**:
- This is EXPECTED without smart contracts
- Deploy contracts to enable claiming
- See implementation plan for deployment steps

---

## Success Checklist

After completing all tests, you should have:

- ✅ Server starting successfully
- ✅ Client loading without errors
- ✅ Privy integrated (no config warnings)
- ✅ Wallets created on signup
- ✅ Wallet addresses stored in database
- ✅ Wallet page displaying blockchain card
- ✅ Balance breakdown showing correctly
- ✅ Copy address working
- ✅ Basescan link opening
- ✅ Claim button appearing when pending > 0
- ✅ Transaction types updated
- ✅ Multiple users each get unique wallets

---

## Next Steps

Once all tests pass:

1. **Deploy Smart Contracts**:
   - Follow `specs/implementation-plan.md` Phase 1
   - Deploy to Base Sepolia testnet
   - Add contract addresses to `.env`

2. **Test Claiming with Real Blockchain**:
   - Increment pending claims
   - Click claim button
   - Should succeed and show transaction hash
   - Verify on Basescan

3. **Integrate Backend Rewards**:
   - Follow Phase 3 of implementation plan
   - Update all reward triggers to credit blockchain
   - Test end-to-end reward flow

---

## Questions?

If any test fails or behaves unexpectedly:

1. Check browser console for errors
2. Check server logs for API errors
3. Verify database state
4. Review `WALLET_INTEGRATION_COMPLETE.md` for implementation details
5. Check `PHASE2_WALLET_INTEGRATION.md` for architecture

**Happy Testing!** 🎉