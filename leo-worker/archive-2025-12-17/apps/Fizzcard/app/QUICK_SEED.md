# Quick Seed Reference

One-page reference for the FizzCard network seeding script.

## Quick Start

```bash
# From the app directory
node seed-network.js
```

Expected time: ~1-2 minutes

## What It Does

1. Logs in 15 users (IDs 63-77)
2. Creates 31 unique connections
3. Establishes 62 bidirectional links
4. Awards FizzCoins to all participants
5. Triggers badge eligibility checks

## Network Structure at a Glance

```
Alice (10) ━━━ Bob (7)
    ↓            ↓
Charlie (5) - Bridge
    ↓
Diana (5) & Eve (6) - Cluster Leaders
    ↓
10 regular users with 2-4 connections each
```

## Users & Credentials

All passwords: `password123`

| ID  | Email              | Role          |
|-----|--------------------|---------------|
| 63  | alice@fizzcard.com | Primary Hub   |
| 64  | bob@fizzcard.com   | Secondary Hub |
| 65  | charlie@fizzcard.com | Bridge      |
| 66  | diana@fizzcard.com | Cluster Lead  |
| 67  | eve@fizzcard.com   | Cluster Lead  |
| 68-77 | user1-10@demo.com | Network Members |

## Expected Results

### Connections Created
- **Alice**: 10 connections
- **Bob**: 7 connections
- **Charlie**: 5 connections (bridges both hubs)
- **Diana**: 5 connections
- **Eve**: 6 connections
- **Others**: 2-4 connections each

### FizzCoins Earned
- **Alice**: ~200 coins
- **Bob**: ~140 coins
- **Charlie**: ~100 coins
- **Diana**: ~100 coins
- **Eve**: ~120 coins
- **Others**: 40-80 coins each

### Badges Awarded
- **Alice**: Bronze + Silver Super Connector
- **Bob**: Bronze Super Connector
- **Charlie**: Bronze Super Connector
- **Diana**: Bronze Super Connector
- **Eve**: Bronze Super Connector

## Meetup Locations Used

- TechCrunch Disrupt, Moscone Center
- Y Combinator Demo Day
- Starbucks, Market St
- Google SF Office
- Salesforce Park
- GitHub Office
- Blue Bottle Coffee, Hayes Valley
- SF Startup Week, Fort Mason
- Caltrain Station
- Ferry Building

## Troubleshooting

### Script fails immediately
→ Check that API is accessible at https://fizzcard.fly.dev

### Login failures
→ Verify users 63-77 exist in database with correct passwords

### Some connections fail
→ Normal - may be duplicates or rate limiting. Check error messages.

### Rate limited
→ Script includes 200ms delays. Increase if needed.

## Verification Steps

After running, verify:

1. **Login as Alice** (alice@fizzcard.com)
   - Check Connections page → Should see 10 connections
   - Check Network page → Should see graph with Alice at center
   - Check Wallet → Should have ~200 FizzCoins
   - Check Profile → Should have Super Connector badges

2. **Login as Bob** (bob@fizzcard.com)
   - Check Connections page → Should see 7 connections
   - Check mutual connections with Alice → Should see Charlie, Diana, Eve

3. **Check Leaderboard**
   - Visit /leaderboard
   - Alice should be #1
   - Bob should be #2

## API Endpoints Used

- `POST /api/auth/login` - Authenticate users
- `POST /api/contact-exchanges` - Create exchange (sender)
- `PUT /api/contact-exchanges/:id/accept` - Accept exchange (receiver)

## Files Created

- `seed-network.js` - Main seeding script
- `SEED_NETWORK_GUIDE.md` - Detailed documentation
- `NETWORK_DIAGRAM.md` - Visual network map
- `QUICK_SEED.md` - This quick reference

## Reset Network (If Needed)

To start fresh:

```sql
-- Connect to your database and run:
DELETE FROM connections WHERE user_id BETWEEN 63 AND 77;
DELETE FROM contact_exchanges WHERE sender_id BETWEEN 63 AND 77;
DELETE FROM fizzcoin_transactions WHERE user_id BETWEEN 63 AND 77;
UPDATE wallets SET balance = 0, total_earned = 0 WHERE user_id BETWEEN 63 AND 77;
```

Then run the script again.

## Support

For issues:
1. Check script output for specific error messages
2. Verify all users exist in database
3. Check API server logs
4. Review SEED_NETWORK_GUIDE.md for detailed troubleshooting

## Next Steps After Seeding

1. Test network visualization at /network
2. Verify connection lists for each user
3. Check FizzCoin wallet balances
4. Confirm badge awards
5. Test leaderboard rankings
6. Demo introduction system (Alice introduces Charlie to Bob)
7. Test connection recommendations

---

**Pro Tip**: Run the script when demonstrating FizzCard to stakeholders. It creates an impressive, realistic network in under 2 minutes!
