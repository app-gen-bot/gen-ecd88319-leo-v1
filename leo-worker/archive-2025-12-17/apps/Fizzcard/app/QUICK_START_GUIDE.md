# FizzCard - Quick Start Guide

**Last Updated**: October 25, 2025
**Status**: Production Ready ✅

---

## 🚀 Get Started in 30 Seconds

```bash
# 1. Start the development servers
cd /Users/labheshpatel/apps/app-factory/apps/Fizzcard/app
npm run dev

# 2. Open your browser
# Backend:  http://localhost:5013
# Frontend: http://localhost:5014

# 3. Test with existing accounts
# Email: test1@example.com
# Password: password123
```

---

## 📋 Current Status

**Application**: FizzCard - Professional Networking + Blockchain Rewards
**Mode**: Database (PostgreSQL via Supabase)
**Blockchain**: Base Sepolia (testnet)
**Phase**: 3 Complete (Blockchain Reward Distribution)

### ✅ What's Working

- User signup & authentication (mock mode)
- Crypto wallet creation (Privy embedded wallets)
- Contact exchanges (QR code, manual, introductions)
- FizzCoin rewards (database + blockchain)
- Blockchain reward distribution (live on Base Sepolia)
- Claim rewards (gasless for users)
- Event check-ins
- Badge system (Super-Connector)
- Real-time leaderboards
- Transaction history with BaseScan links

### ⏳ What's Pending

- Backend wallet funding (current: 0.0032 ETH, recommended: 0.05 ETH)
- Paymaster implementation (for gasless transactions)

---

## 🔑 Test Accounts

| Email | Password | User ID | Features |
|-------|----------|---------|----------|
| test1@example.com | password123 | 82 | Has crypto wallet |
| test2@example.com | password123 | 83 | Has crypto wallet |
| rewardtest@example.com | password123 | 86 | E2E tested |

---

## 🌐 Important URLs

### Frontend Pages
- **Home**: http://localhost:5014/
- **Signup**: http://localhost:5014/signup
- **Login**: http://localhost:5014/login
- **Wallet**: http://localhost:5014/wallet
- **Scanner**: http://localhost:5014/scanner
- **Dashboard**: http://localhost:5014/dashboard

### Backend Endpoints
- **Health**: http://localhost:5013/health
- **API Docs**: Check `shared/contracts/*.contract.ts`

### Blockchain
- **BaseScan**: https://sepolia.basescan.org/
- **FizzCoin Contract**: https://sepolia.basescan.org/address/0x8C6E04f93BB1c639ca1CBacF145D624e7BDF4Ca7
- **Rewards Contract**: https://sepolia.basescan.org/address/0x9c8376CA2ffdCfBA55AB46dBe168b8c1d09dA21a

---

## 💰 Reward Amounts

| Action | Amount | Blockchain | Notes |
|--------|--------|------------|-------|
| Accept Connection | 25 FIZZ | ✅ Yes | Both users earn |
| Complete Introduction | 50 FIZZ | ✅ Yes | Introducer earns |
| Super-Connector Intro | 100 FIZZ | ✅ Yes | With badge |
| Event Check-In | 20 FIZZ | ✅ Yes | Per attendee |

---

## 🛠️ Common Tasks

### Create New User with Crypto Wallet

```bash
# 1. Open http://localhost:5014/signup
# 2. Fill in form:
#    - Email: newuser@example.com
#    - Password: password123
#    - Name: New User
# 3. Submit
# 4. Navigate to /wallet
# 5. Click "Connect Wallet"
# 6. Verify email in Privy modal
# 7. Wallet created automatically
```

### Test Reward Flow

```bash
# 1. Login as user A (test1@example.com)
# 2. Go to /scanner
# 3. Share QR code or manual connection with user B
# 4. User B accepts connection
# 5. Both users earn 25 FIZZ
# 6. Check /wallet to see pending rewards
# 7. Click "Claim Rewards"
# 8. Tokens transferred on blockchain
```

### Check Blockchain Transaction

```bash
# 1. Complete any reward action
# 2. Check server logs for TX hash
# 3. Visit: https://sepolia.basescan.org/tx/<TX_HASH>
# 4. Verify transaction confirmed
# 5. Check "To" address is Rewards contract
```

### Query Database

```bash
# Get user's crypto wallet
SELECT u.id, u.email, cw.wallet_address, cw.pending_claim_amount
FROM users u
LEFT JOIN crypto_wallets cw ON u.id = cw.user_id
WHERE u.email = 'test1@example.com';

# Get recent transactions
SELECT id, user_id, amount, transaction_type, tx_hash, created_at
FROM fizzCoinTransactions
WHERE user_id = 82
ORDER BY created_at DESC
LIMIT 10;

# Check pending claims
SELECT user_id, pending_claim_amount, last_claim_at
FROM crypto_wallets
WHERE pending_claim_amount > 0;
```

---

## 🐛 Troubleshooting

### Issue: Servers won't start

```bash
# Kill existing processes
pkill -f "npm run dev"

# Restart
npm run dev
```

### Issue: Database connection error

```bash
# Check .env file
cat .env | grep DATABASE_URL

# Should be:
# DATABASE_URL=postgresql://postgres.luhlijxjiceeyjqdyyyx:rBXA2UxRRzPWTTI0@aws-1-us-east-1.pooler.supabase.com:5432/postgres

# Verify connection
npm run db:push
```

### Issue: Blockchain transactions failing

```bash
# Check backend wallet balance
npm run check:balance

# Should show > 0.001 ETH

# Check logs
tail -50 dev.log | grep -i "blockchain"

# Look for initialization message:
# [BlockchainFizzCoinService] Initialized
# [WalletService] Initialized on Base Sepolia
```

### Issue: Pending rewards not showing

```bash
# Check if user has crypto wallet
SELECT * FROM crypto_wallets WHERE user_id = <USER_ID>;

# Check if transaction was recorded
SELECT * FROM fizzCoinTransactions
WHERE user_id = <USER_ID>
ORDER BY created_at DESC
LIMIT 5;

# Manually increment (if needed)
UPDATE crypto_wallets
SET pending_claim_amount = pending_claim_amount + 25
WHERE user_id = <USER_ID>;
```

---

## 📚 Documentation

### Main Documents
- **SESSION_COMPLETE_SUMMARY.md** - Complete session overview
- **DATABASE_MIGRATION_AND_PHASE3_COMPLETE.md** - Migration + Phase 3 details
- **BLOCKCHAIN_INTEGRATION.md** - Technical architecture (400+ lines)
- **PHASE3_BLOCKCHAIN_REWARD_E2E_TEST_REPORT.md** - Test results (655 lines)

### Code Documentation
- **Smart Contracts**: `server/contracts/abis/`
- **API Contracts**: `shared/contracts/`
- **Services**: `server/services/blockchain/`
- **Schemas**: `shared/schema.zod.ts` (source of truth)

---

## 🚢 Deployment Checklist

Before deploying to production:

- [ ] Fund backend wallet to 0.05 ETH
- [ ] Verify smart contract ABIs match deployed contracts
- [ ] Change AUTH_MODE to 'supabase' (if using Supabase auth)
- [ ] Update BLOCKCHAIN_MODE to 'mainnet' (when ready)
- [ ] Update smart contract addresses for mainnet
- [ ] Test end-to-end flow on mainnet
- [ ] Set up monitoring for gas usage
- [ ] Configure automated wallet funding alerts
- [ ] Update CORS settings for production domain
- [ ] Enable rate limiting
- [ ] Set up error tracking (e.g., Sentry)

---

## 💡 Tips & Best Practices

### Development
- Always check server logs when testing blockchain features
- Use test accounts (test1, test2) to avoid creating too many users
- Clear browser localStorage if authentication seems stuck
- Check BaseScan for transaction confirmations

### Testing
- Test both database-only and blockchain flows
- Verify fallback works when blockchain unavailable
- Check pending claims update correctly
- Validate BaseScan links in transaction history

### Blockchain
- Monitor backend wallet balance (should stay above 0.01 ETH)
- Each transaction costs ~0.00005 ETH in gas
- Transactions confirm in ~2-3 seconds on Base Sepolia
- Use BaseScan to verify all on-chain activity

### Database
- Backup database before major changes
- Check crypto_wallets table has unique constraints
- Verify transactions have tx_hash when using blockchain
- Monitor pending_claim_amount for accuracy

---

## 🎯 Quick Commands Reference

```bash
# Start development servers
npm run dev

# Stop development servers
pkill -f "npm run dev"

# Check wallet balance
npm run check:balance

# Fund wallet (opens browser)
npm run fund:wallet

# Database migration
npm run db:push

# Run blockchain test
npm run test:blockchain

# Build for production
npm run build

# Type check
npm run type-check

# Health check
curl http://localhost:5013/health
```

---

## 📞 Support

### Issues Found?
1. Check server logs: `tail -100 dev.log`
2. Check browser console for frontend errors
3. Verify database connection
4. Check blockchain service initialization
5. Review documentation in this directory

### Need Help?
- Read: `SESSION_COMPLETE_SUMMARY.md` for complete overview
- Read: `BLOCKCHAIN_INTEGRATION.md` for technical details
- Read: `PHASE3_BLOCKCHAIN_REWARD_E2E_TEST_REPORT.md` for test scenarios

---

**Last Updated**: October 25, 2025
**Version**: Phase 3 Complete
**Status**: Production Ready ✅
