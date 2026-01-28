# FizzCard Deployment Guide

**Version**: 1.0
**Last Updated**: October 25, 2025
**Status**: Production Ready

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Smart Contract Deployment](#smart-contract-deployment)
5. [Backend Deployment](#backend-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [Post-Deployment Testing](#post-deployment-testing)
8. [Monitoring Setup](#monitoring-setup)
9. [Rollback Procedures](#rollback-procedures)

---

## Prerequisites

### Required Accounts

- [ ] **Supabase Account** (Database)
  - Sign up at: https://supabase.com
  - Create new project
  - Note: Project URL and API keys

- [ ] **Privy Account** (Wallet Integration)
  - Sign up at: https://dashboard.privy.io
  - Create new app
  - Configure Base network
  - Note: App ID and App Secret

- [ ] **Coinbase Developer Account** (Base Network)
  - Sign up at: https://www.coinbase.com/developer-platform
  - Access Base network
  - Get RPC URLs

- [ ] **Hosting Account** (Choose one):
  - Vercel: https://vercel.com (Recommended for frontend)
  - Railway: https://railway.app (Good for full-stack)
  - Render: https://render.com
  - DigitalOcean/AWS/GCP (Advanced)

- [ ] **Domain Name** (Optional but recommended)
  - Purchase from Namecheap, GoDaddy, or Cloudflare

### Required Tools

- [ ] **Node.js 20+** installed
- [ ] **npm** or **yarn** package manager
- [ ] **Git** for version control
- [ ] **Wallet with ETH** (for contract deployment)
  - Minimum 0.1 ETH for mainnet deployment
  - Get testnet ETH from Base Sepolia faucet for testing

---

## Environment Setup

### 1. Clone Repository

```bash
cd /path/to/projects
git clone <your-repo-url> fizzcard
cd fizzcard/app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create `.env` file in the root directory:

```bash
# ============================================
# FIZZCARD PRODUCTION ENVIRONMENT VARIABLES
# ============================================

# -----------------
# Server Configuration
# -----------------
NODE_ENV=production
PORT=5013

# -----------------
# Authentication Mode
# -----------------
AUTH_MODE=supabase
STORAGE_MODE=database

# -----------------
# Supabase Configuration
# -----------------
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project.supabase.co:5432/postgres

# -----------------
# Privy Configuration
# -----------------
PRIVY_APP_ID=your-production-app-id
PRIVY_APP_SECRET=your-app-secret
NEXT_PUBLIC_PRIVY_APP_ID=your-production-app-id

# -----------------
# Blockchain Configuration (Base Mainnet)
# -----------------
BACKEND_WALLET_PRIVATE_KEY=your-wallet-private-key-here
FIZZCOIN_CONTRACT_ADDRESS=0x... (deploy to mainnet)
REWARDS_CONTRACT_ADDRESS=0x... (deploy to mainnet)
BASE_RPC_URL=https://mainnet.base.org
PAYMASTER_URL=https://api.developer.coinbase.com/rpc/v1/base/paymaster

# -----------------
# AI Configuration (Optional)
# -----------------
# ANTHROPIC_API_KEY=sk-ant-api03-...

# -----------------
# Frontend Configuration
# -----------------
VITE_API_URL=https://api.fizzcard.app (or your production domain)
```

### 4. Verify Configuration

```bash
# Check environment variables
npm run env:check

# Test database connection
npm run db:test

# Verify all services
npm run health:check
```

---

## Database Setup

### 1. Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose organization
4. Enter project details:
   - **Name**: FizzCard Production
   - **Database Password**: Strong password (save it!)
   - **Region**: Choose closest to users
5. Wait for project to be provisioned (~2 minutes)

### 2. Get Database Credentials

From Supabase dashboard:
1. Go to **Settings** → **Database**
2. Copy **Connection String** (URI format)
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Run Database Migrations

```bash
# Generate migration from schema
npm run db:generate

# Push schema to database
npm run db:push

# Verify tables created
npm run db:studio
```

**Expected Tables** (15 total):
- users
- fizzCards
- connections
- cryptoWallets
- socialLinks
- events
- eventAttendees
- introductions
- leaderboardEntries
- transactions
- walletMonitorRecords
- ... and more

### 4. Seed Initial Data (Optional)

```bash
# Run seed script
npm run db:seed
```

---

## Smart Contract Deployment

### 1. Prepare Deployment Wallet

```bash
# Generate new wallet or import existing
# Save private key to BACKEND_WALLET_PRIVATE_KEY

# Fund wallet with ETH (Base mainnet)
# Minimum: 0.05 ETH for deployment + operations
```

### 2. Configure Hardhat

Update `hardhat.config.ts`:

```typescript
networks: {
  baseMainnet: {
    url: "https://mainnet.base.org",
    accounts: [process.env.BACKEND_WALLET_PRIVATE_KEY],
    chainId: 8453
  }
}
```

### 3. Deploy FizzCoin Token

```bash
cd contracts
npx hardhat run scripts/deploy-token.ts --network baseMainnet
```

**Expected Output**:
```
Deploying FizzCoin...
FizzCoin deployed to: 0x1234...
Verification command: npx hardhat verify --network baseMainnet 0x1234...
```

**Save the contract address** to `FIZZCOIN_CONTRACT_ADDRESS`

### 4. Deploy Rewards Contract

```bash
npx hardhat run scripts/deploy-rewards.ts --network baseMainnet
```

**Expected Output**:
```
Deploying FizzCoinRewards...
FizzCoinRewards deployed to: 0x5678...
Verification command: npx hardhat verify --network baseMainnet 0x5678...
```

**Save the contract address** to `REWARDS_CONTRACT_ADDRESS`

### 5. Verify Contracts on BaseScan

```bash
npx hardhat verify --network baseMainnet 0x1234... # FizzCoin
npx hardhat verify --network baseMainnet 0x5678... # Rewards
```

View verified contracts at: https://basescan.org

### 6. Configure Paymaster

1. Go to Coinbase Developer Platform
2. Navigate to Paymaster section
3. Configure policy:
   - **Contracts**: Add FizzCoinRewards address
   - **Functions**: Allow `claimRewards`
   - **Limits**: Set daily/monthly limits
4. Fund Paymaster account

### 7. Test Blockchain Integration

```bash
# Test reward crediting
npm run test:credit-reward

# Test claiming
npm run test:claim-reward

# Verify on BaseScan
```

---

## Backend Deployment

### Option A: Deploy to Railway (Recommended)

#### 1. Install Railway CLI

```bash
npm install -g @railway/cli
```

#### 2. Login and Initialize

```bash
railway login
railway init
```

#### 3. Configure Project

```bash
# Set environment variables
railway variables set NODE_ENV=production
railway variables set AUTH_MODE=supabase
railway variables set STORAGE_MODE=database
railway variables set SUPABASE_URL=https://...
railway variables set SUPABASE_ANON_KEY=...
# ... (set all env vars from .env)
```

#### 4. Deploy

```bash
railway up
```

#### 5. Get Service URL

```bash
railway domain
```

### Option B: Deploy to Vercel (API Routes)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard
```

### Option C: Deploy to Docker Container

```bash
# Build Docker image
docker build -t fizzcard-backend .

# Run container
docker run -p 5013:5013 \
  --env-file .env \
  fizzcard-backend

# Or use docker-compose
docker-compose up -d
```

### Verify Backend Deployment

```bash
# Health check
curl https://api.fizzcard.app/health

# Expected response:
# {
#   "status": "healthy",
#   "auth": "supabase",
#   "storage": "database",
#   "timestamp": "2025-10-25T..."
# }

# Test API endpoint
curl https://api.fizzcard.app/api/leaderboard
```

---

## Frontend Deployment

### Option A: Deploy to Vercel (Recommended)

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Build Production Bundle

```bash
cd client
npm run build
```

#### 3. Deploy

```bash
vercel --prod
```

#### 4. Configure Environment Variables

In Vercel dashboard:
- Go to **Settings** → **Environment Variables**
- Add:
  - `VITE_API_URL`: Your backend URL
  - `NEXT_PUBLIC_PRIVY_APP_ID`: Privy production app ID

#### 5. Configure Domain

1. Go to **Settings** → **Domains**
2. Add custom domain (e.g., fizzcard.app)
3. Configure DNS records as instructed

### Option B: Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd client
npm run build
netlify deploy --prod --dir=dist
```

### Option C: Self-Hosted (Nginx)

```bash
# Build
cd client
npm run build

# Copy to server
scp -r dist/* user@server:/var/www/fizzcard

# Configure Nginx
# (See nginx.conf example below)

# Restart Nginx
sudo systemctl restart nginx
```

**nginx.conf example**:
```nginx
server {
    listen 80;
    server_name fizzcard.app www.fizzcard.app;

    root /var/www/fizzcard;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5013;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Verify Frontend Deployment

1. Visit https://fizzcard.app
2. Test signup/login
3. Create FizzCard
4. Test QR code scanning
5. Test wallet creation
6. Test reward claiming

---

## Post-Deployment Testing

### Critical Path Testing

**Test 1: Authentication Flow**
- [ ] Sign up with email
- [ ] Verify email works
- [ ] Login with credentials
- [ ] Logout and login again

**Test 2: FizzCard Creation**
- [ ] Create FizzCard
- [ ] Add profile photo
- [ ] Add bio and details
- [ ] Generate QR code
- [ ] Scan QR code on another device

**Test 3: Networking**
- [ ] Send connection request
- [ ] Accept connection request
- [ ] Verify FizzCoin reward (25 FIZZ)
- [ ] Create introduction
- [ ] View network graph

**Test 4: Blockchain Integration**
- [ ] Verify wallet created automatically
- [ ] Check FizzCoin balance
- [ ] Claim rewards (gasless)
- [ ] Verify transaction on BaseScan
- [ ] Export wallet to MetaMask

**Test 5: Events**
- [ ] Create event
- [ ] Generate event QR code
- [ ] Check in to event
- [ ] Verify reward (20 FIZZ)
- [ ] View attendee list

**Test 6: Leaderboard**
- [ ] View leaderboard
- [ ] Verify user ranking
- [ ] Check points calculation

**Test 7: UX Features**
- [ ] Verify confetti on reward claim
- [ ] Check profile completion indicator
- [ ] Test social sharing (all 6 methods)
- [ ] Verify toast notifications

### Performance Testing

```bash
# Load test with Apache Bench
ab -n 1000 -c 10 https://api.fizzcard.app/health

# Expected:
# - Requests per second: >100
# - 95th percentile: <500ms
# - No failed requests
```

### Security Testing

- [ ] HTTPS enabled on all domains
- [ ] Environment variables not exposed
- [ ] API rate limiting works
- [ ] SQL injection protection verified
- [ ] XSS protection verified
- [ ] CSRF protection verified

---

## Monitoring Setup

### 1. Application Monitoring (Sentry)

```bash
# Install Sentry
npm install @sentry/react @sentry/node

# Configure frontend
# client/src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
  tracesSampleRate: 0.1,
});

# Configure backend
# server/index.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
});
```

### 2. Analytics (Google Analytics)

```html
<!-- Add to client/index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 3. Uptime Monitoring

Options:
- **UptimeRobot**: https://uptimerobot.com (Free)
- **Pingdom**: https://www.pingdom.com
- **Better Uptime**: https://betteruptime.com

Configure:
- Monitor: https://fizzcard.app
- Monitor: https://api.fizzcard.app/health
- Interval: 5 minutes
- Alert: Email/SMS on downtime

### 4. Database Monitoring

Supabase provides built-in monitoring:
- Go to **Database** → **Reports**
- Monitor:
  - Query performance
  - Connection count
  - Database size
  - Slow queries

### 5. Blockchain Monitoring

Monitor backend wallet:
```bash
# Add to cron job (runs hourly)
0 * * * * curl https://api.fizzcard.app/wallet-status
```

Set up alerts:
- Email when balance < 0.01 ETH
- Slack notification for transactions
- Daily balance report

---

## Rollback Procedures

### If Critical Bug Found

**Immediate Actions**:
1. Stop accepting new users (maintenance mode)
2. Assess impact and severity
3. Communicate to users (status page)

**Rollback Frontend**:
```bash
# Vercel
vercel rollback

# Netlify
netlify rollback

# Manual
git checkout <previous-commit>
npm run build
# Deploy previous version
```

**Rollback Backend**:
```bash
# Railway
railway rollback

# Docker
docker stop fizzcard-backend
docker run fizzcard-backend:previous-tag

# Manual
git checkout <previous-commit>
npm install
npm run build
pm2 restart fizzcard
```

**Rollback Database** (if schema changed):
```bash
# Revert migration
npm run db:rollback

# Restore from backup
# (Use Supabase backup restore)
```

### Communication Template

```
🚨 FizzCard Status Update

We've identified an issue affecting [describe issue].

What we're doing:
- [Action 1]
- [Action 2]

Impact:
- [Who is affected]
- [What doesn't work]

Timeline:
- We expect to resolve this by [time]

We apologize for the inconvenience and will keep you updated.

- FizzCard Team
```

---

## Production Checklist

### Pre-Launch

**Code**:
- [ ] All features tested
- [ ] No critical errors in logs
- [ ] TypeScript compilation successful
- [ ] Bundle size optimized (<500KB)

**Infrastructure**:
- [ ] Database provisioned and migrated
- [ ] Smart contracts deployed to mainnet
- [ ] Backend deployed and healthy
- [ ] Frontend deployed with custom domain
- [ ] SSL certificates configured

**Configuration**:
- [ ] All environment variables set
- [ ] Privy configured for production
- [ ] Paymaster funded
- [ ] Backend wallet funded (>0.05 ETH)

**Monitoring**:
- [ ] Error tracking (Sentry) configured
- [ ] Analytics (GA) configured
- [ ] Uptime monitoring configured
- [ ] Database monitoring enabled
- [ ] Wallet monitoring active

**Documentation**:
- [ ] API documentation complete
- [ ] User guides created
- [ ] FAQ prepared
- [ ] Support email set up

**Testing**:
- [ ] Critical path tested
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Mobile tested (iOS + Android)
- [ ] Cross-browser tested

### Post-Launch

**Day 1**:
- [ ] Monitor error rates
- [ ] Check server performance
- [ ] Verify blockchain transactions
- [ ] Respond to user feedback
- [ ] Fix critical bugs immediately

**Week 1**:
- [ ] Review analytics daily
- [ ] Collect user feedback
- [ ] Monitor costs (gas, hosting)
- [ ] Optimize performance
- [ ] Fix non-critical bugs

**Month 1**:
- [ ] Analyze user behavior
- [ ] Identify popular features
- [ ] Plan improvements
- [ ] Scale infrastructure if needed
- [ ] Review and adjust costs

---

## Support

### Getting Help

**Documentation**:
- Production Readiness Assessment
- Project Complete Summary
- Feature documentation in `/docs`

**Common Issues**:
1. **Database connection fails**: Check SUPABASE_URL and keys
2. **Smart contract errors**: Verify contract addresses and network
3. **Wallet creation fails**: Check Privy configuration
4. **Claiming fails**: Verify Paymaster is funded and configured

**Support Channels**:
- Email: support@fizzcard.app
- GitHub Issues: <repo-url>/issues
- Slack: #fizzcard-support

---

## Success Criteria

### Technical Metrics

**Performance**:
- ✅ Page load: <2 seconds
- ✅ API response: <500ms
- ✅ Uptime: >99.5%
- ✅ Error rate: <0.1%

**Blockchain**:
- ✅ Wallet creation: 100% success
- ✅ Claim success rate: >99%
- ✅ Transaction time: <10 seconds
- ✅ Gas costs: <$0.10 per transaction

### Business Metrics

**Week 1 Targets**:
- 100+ signups
- 50+ FizzCards created
- 25+ connections made
- 10+ rewards claimed

**Month 1 Targets**:
- 1,000+ users
- 500+ FizzCards
- 200+ connections
- 100+ rewards claimed

---

**Deployment Version**: 1.0
**Last Updated**: October 25, 2025
**Status**: Ready for Production Deployment

**Next Step**: Follow this guide to deploy FizzCard to production! 🚀
