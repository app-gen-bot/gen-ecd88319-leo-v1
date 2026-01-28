# Quick Start: Migrate to Supabase

Follow these steps to migrate from in-memory storage to Supabase in **under 10 minutes**.

## Option 1: Use Supabase Cloud (Recommended)

### 1. Create Supabase Project (2 minutes)

```bash
# Open Supabase dashboard
open https://supabase.com/dashboard
```

Click **"New Project"**, fill in:
- **Name**: FizzCard
- **Database Password**: (save this!)
- **Region**: US East (or closest to you)
- **Plan**: Free tier

Wait ~2 minutes for provisioning.

### 2. Get Connection String (1 minute)

Once ready:
1. Go to **Settings** → **Database**
2. Scroll to **Connection String**
3. Select **URI** tab (NOT "Transaction" or "Session")
4. Copy the connection string

It looks like:
```
postgresql://postgres.abc123xyz:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### 3. Configure Environment (30 seconds)

Edit `server/.env`:

```env
STORAGE_MODE=database
DATABASE_URL=postgresql://postgres.abc123xyz:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**IMPORTANT**: Replace with YOUR actual connection string!

### 4. Disable Email Confirmations (1 minute)

In Supabase dashboard:
1. **Authentication** → **Providers** → **Email**
2. Find "Confirm email" toggle
3. **Turn it OFF**
4. Click **Save**

### 5. Push Database Schema (2 minutes)

```bash
cd server
npm run db:push
```

You should see:
```
✓ Pulling schema from database...
✓ Changes applied
```

### 6. Verify Tables Created (30 seconds)

In Supabase dashboard:
1. Click **Table Editor** (left sidebar)
2. You should see 12 tables:
   - users
   - fizzCards
   - socialLinks
   - connections
   - ... and 8 more

### 7. Seed the Database (1 minute)

```bash
npm run seed
```

You should see:
```
🌱 Starting enhanced database seeding...
✅ Created 20 users with FizzCards and wallets
✅ Created 116 connections across network
✅ Created 15 introductions with rewards
```

### 8. Restart Server (30 seconds)

Stop current server (Ctrl+C), then:

```bash
cd .. # back to app root
npm run dev
```

Look for:
```
[Storage Factory] Initializing storage in database mode
[DatabaseStorage] Database storage initialized
Server is running at http://localhost:5013
```

### 9. Test Login (1 minute)

1. Open http://localhost:5014
2. Login with:
   - **Email**: alex.chen@gmail.com
   - **Password**: password123

3. You should see:
   - ✅ Alex Chen's dashboard
   - ✅ 1,975 FizzCoins
   - ✅ 11 connections
   - ✅ Network graph with 20 users!

## Option 2: Use Local Supabase (If Docker Works)

If Docker is running properly on your machine:

```bash
# Start local Supabase
cd server
supabase start

# You'll see output with local URLs:
# API URL: http://localhost:54321
# DB URL:  postgresql://postgres:postgres@localhost:54322/postgres

# Update .env
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
STORAGE_MODE=database

# Push schema
npm run db:push

# Seed database
npm run seed

# Restart server
cd ..
npm run dev
```

## Verification Checklist

Run through this checklist to confirm everything works:

- [ ] ✅ Supabase project created (cloud or local)
- [ ] ✅ Connection string copied
- [ ] ✅ DATABASE_URL set in .env
- [ ] ✅ STORAGE_MODE=database in .env
- [ ] ✅ Email confirmations disabled (cloud only)
- [ ] ✅ `npm run db:push` succeeded
- [ ] ✅ 12 tables visible in Supabase
- [ ] ✅ `npm run seed` succeeded
- [ ] ✅ Server started with "database mode"
- [ ] ✅ Can login as alex.chen@gmail.com
- [ ] ✅ Dashboard shows 20-user network
- [ ] ✅ Data persists after server restart

## Troubleshooting

### "Database connection failed"

**Check 1**: Is DATABASE_URL correct?
```bash
echo $DATABASE_URL
```

**Check 2**: Did you replace [YOUR-PASSWORD]?

**Check 3**: Using pooler connection (port 6543)?

**Fix**: Copy connection string again from Supabase → Settings → Database → URI

---

### "Permission denied for table users"

**Issue**: Wrong connection string (using anon key instead of postgres password)

**Fix**: Use the connection string from **Settings → Database** (NOT from Settings → API)

---

### "drizzle-kit: command not found"

**Fix**: Install drizzle-kit
```bash
npm install -D drizzle-kit
```

---

### Seed script fails with "user already exists"

**Issue**: Database already has data

**Fix**: Reset tables or use fresh Supabase project
```bash
# Option 1: Create new Supabase project

# Option 2: Drop tables (CAREFUL - deletes all data!)
# In Supabase SQL Editor:
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

# Then re-run:
npm run db:push
npm run seed
```

---

### "Cannot find module '../shared/schema'"

**Issue**: Working directory is wrong

**Fix**: Make sure you're in the `server` directory
```bash
pwd  # Should show: .../FizzCard/app/server
cd server  # if not in server dir
```

## What Changed?

| Before (Memory) | After (Supabase) |
|----------------|------------------|
| Data lost on restart | ✅ Persistent storage |
| Single user testing | ✅ Multi-user ready |
| No scalability | ✅ Scales to thousands |
| No backup | ✅ Auto backups (paid) |
| Development only | ✅ Production ready |

## Next Steps

Your app is now using Supabase! 🎉

**Test the persistence**:
1. Stop server (Ctrl+C)
2. Restart server (`npm run dev`)
3. Login as alex.chen@gmail.com
4. Data should still be there!

**Optional**: Enable Supabase Auth
- See `SUPABASE_SETUP.md` for details
- Adds real authentication with JWTs
- Supports OAuth (Google, GitHub, etc.)

**Deploy to Production**:
- Your Supabase database is already live!
- Just deploy your server code to any hosting
- Update frontend API URL to production server

## Support

Questions? Issues?

1. Check `SUPABASE_SETUP.md` for detailed guide
2. Check `server/.env.example` for configuration reference
3. View tables in Supabase dashboard → Table Editor
4. Run SQL queries in Supabase dashboard → SQL Editor

---

**Total Time**: ~10 minutes
**Difficulty**: Easy
**Result**: Production-ready database! 🚀
