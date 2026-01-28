# Supabase Setup Guide for FizzCard

This guide will help you migrate from in-memory storage to Supabase as the persistent database.

## Prerequisites

- Supabase account (create at https://supabase.com)
- Supabase CLI installed (already installed: v2.51.0)

## Step 1: Create a Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in the details:
   - **Name**: FizzCard
   - **Database Password**: (create a strong password and save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is sufficient for development

4. Wait for the project to be provisioned (~2 minutes)

## Step 2: Get Your Connection Credentials

Once your project is ready:

1. Go to **Project Settings** → **Database**
2. Find the **Connection String** section
3. Select **URI** tab
4. Copy the connection string (it looks like):
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

## Step 3: Update Environment Variables

Update `server/.env` file:

```env
# Server Configuration
PORT=5013
NODE_ENV=development

# Auth Configuration
AUTH_MODE=mock

# Storage Configuration
STORAGE_MODE=database

# Supabase Database
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Replace the DATABASE_URL** with your actual connection string from Step 2.

## Step 4: Disable Email Confirmations in Supabase

1. Go to **Authentication** → **Providers** → **Email**
2. Scroll down to **Confirmation Options**
3. **Disable**: "Confirm email"
4. Click **Save**

This allows users to sign up without email verification (good for development).

## Step 5: Push Database Schema

Run the following command from the `server` directory:

```bash
cd server
npx drizzle-kit push
```

This will:
- Read your Drizzle schema from `../shared/schema.ts`
- Generate SQL migrations
- Push the schema to your Supabase database

You should see output like:
```
✔ Applying migrations...
✔ All migrations applied successfully
```

## Step 6: Verify Tables

1. Go to your Supabase dashboard
2. Click **Table Editor** (left sidebar)
3. You should see all tables:
   - users
   - fizzCards
   - socialLinks
   - contactExchanges
   - connections
   - fizzCoinWallets
   - fizzCoinTransactions
   - introductions
   - events
   - eventAttendees
   - badges
   - searchHistory

## Step 7: Seed the Database

From the server directory:

```bash
npm run seed
```

Or manually:

```bash
tsx seed.ts
```

This will populate your database with:
- 20 test users (Google, Meta, VCs, startups)
- 116 connections forming realistic network
- 15 introductions with FizzCoin rewards
- Badges and wallets

## Step 8: Restart the Server

Stop the current dev server and restart:

```bash
# Kill existing server (Ctrl+C in the terminal running it)
cd .. # Go back to app root
npm run dev
```

The server should now connect to Supabase:

```
[Storage Factory] Initializing storage in database mode
[DatabaseStorage] Database storage initialized
Server is running at http://localhost:5013
```

## Step 9: Test the Application

1. Open http://localhost:5014
2. Try logging in with a seeded user:
   - Email: alex.chen@gmail.com
   - Password: password123

3. You should see:
   - Full network graph with 20 users
   - 11 connections for Alex Chen
   - 1,975 FizzCoins
   - Rank #1-2 on leaderboard

## Troubleshooting

### Connection String Issues

If you get "CONNECTION_TIMED_OUT" errors:

1. Use the **Connection pooling** string (port 6543) instead of direct connection (port 5432)
2. Make sure you replaced `[YOUR-PASSWORD]` with your actual password
3. Check that there are no extra spaces in the DATABASE_URL

### Schema Push Fails

If `drizzle-kit push` fails:

1. Verify DATABASE_URL is correct:
   ```bash
   echo $DATABASE_URL
   ```

2. Test connection with psql:
   ```bash
   psql $DATABASE_URL -c "SELECT version();"
   ```

3. Make sure your IP is allowed in Supabase (usually auto-allowed)

### Seed Script Fails

If seeding fails:

1. Check that tables were created:
   ```bash
   psql $DATABASE_URL -c "\dt"
   ```

2. Make sure STORAGE_MODE=database in .env

3. Run seed with verbose logging:
   ```bash
   DEBUG=* tsx seed.ts
   ```

## Environment Variables Reference

```env
# Required for Supabase
STORAGE_MODE=database                    # Use database storage (not memory)
DATABASE_URL=postgresql://postgres...    # Your Supabase connection string

# Optional (keep mock auth for now)
AUTH_MODE=mock                           # Can switch to 'supabase' later

# Server config
PORT=5013
NODE_ENV=development
```

## Next Steps

### Switch to Supabase Auth (Optional)

Once database is working, you can also use Supabase Auth:

1. Get your Supabase URL and Anon Key:
   - Go to **Project Settings** → **API**
   - Copy **Project URL** and **anon/public key**

2. Update `.env`:
   ```env
   AUTH_MODE=supabase
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   ```

3. The app will use Supabase's built-in authentication system

## Verification Checklist

- [ ] Supabase project created
- [ ] Connection string obtained
- [ ] DATABASE_URL set in .env
- [ ] STORAGE_MODE=database in .env
- [ ] Email confirmations disabled in Supabase dashboard
- [ ] Schema pushed successfully (drizzle-kit push)
- [ ] Tables visible in Supabase Table Editor
- [ ] Seed script run successfully
- [ ] Server restarts without errors
- [ ] Can login with alex.chen@gmail.com / password123
- [ ] Network graph shows 20 users
- [ ] Connections, leaderboard, wallet all populated

## Benefits of Supabase

✅ **Persistent Storage** - Data survives server restarts
✅ **Real Database** - PostgreSQL with full ACID compliance
✅ **Scalable** - Handles thousands of users
✅ **Dashboard** - Visual interface to view/edit data
✅ **Backups** - Automatic daily backups (paid plans)
✅ **Auth System** - Built-in authentication (optional)
✅ **Real-time** - Websocket subscriptions available
✅ **Free Tier** - 500MB database, 2GB file storage

Your FizzCard app is now production-ready! 🎉
