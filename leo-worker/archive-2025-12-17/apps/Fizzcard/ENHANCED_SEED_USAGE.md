# Enhanced Seed Data - Network Graph Visualization

## Overview

The enhanced seed data creates a realistic professional networking graph with **20 users**, **56 unique connections** (112 bidirectional), and **15 introductions** showcasing network effects.

## Network Architecture

### Hub Nodes (Super-Connectors)
1. **Alex Chen** (alex.chen@gmail.com) - 11 connections
   - Angel Investor & Advisor
   - Bridges between VCs, startups, and big tech
   - 1,850 FizzCoins

2. **Priya Sharma** (priya.sharma@sequoia.com) - 10 connections
   - Sequoia Capital Partner
   - Connects startups with investors and talent
   - 2,000 FizzCoins

3. **Sophia Williams** (sophia.williams@stanford.edu) - 9 connections
   - Stanford Professor
   - Bridges academia and industry
   - 1,150 FizzCoins

### Company Clusters

#### Google Cluster (4 members)
- Sarah Johnson (Staff SWE, verified)
- David Park (Senior PM)
- Emily Washington (UX Design Lead)
- Raj Patel (Engineering Manager)
- **Internal connections**: 5 strong ties

#### Meta Cluster (4 members)
- Michael Rodriguez (Director of Engineering, verified)
- Jessica Liu (Senior Data Scientist)
- Carlos Santos (Product Marketing Manager)
- Amanda Foster (Research Scientist)
- **Internal connections**: 5 strong ties

#### VC/Startup Cluster (6 members)
- Thomas Anderson (a16z General Partner, verified)
- Nina Gupta (YC Partner, verified)
- James Kim (OpenAI Engineer)
- Olivia Martinez (Anthropic Research Engineer)
- Lisa Thompson (Founder, DataFlow AI)
- Daniel Brooks (Co-Founder, CloudSync)
- **Internal connections**: 7 ties

### Bridge Connections
- **Sarah Johnson**: Google → Meta (former colleague)
- **Marcus Zhang**: Stripe → Startups (customer relationships)
- **Sophia Williams**: Academia → Industry (advisor/research)

### Weak Ties (Strength 1-2)
- Recent conference meetings
- LinkedIn connections without in-person meetings
- Brief poster session encounters

## Usage

### Option 1: Import in API Route (Recommended)

Update `/Users/labheshpatel/apps/app-factory/apps/Fizzcard/app/server/routes/seed.ts`:

```typescript
import { seedEnhancedDatabase } from '../lib/seed-data-enhanced';

router.post('/', async (req: Request, res: Response) => {
  // Use enhanced seeding instead of basic
  const summary = await seedEnhancedDatabase();

  res.status(200).json({
    success: true,
    message: 'Database seeded with enhanced network data',
    summary,
  });
});
```

### Option 2: Direct CLI Script

Create `/Users/labheshpatel/apps/app-factory/apps/Fizzcard/app/server/seed-enhanced.ts`:

```typescript
import { seedEnhancedDatabase } from './lib/seed-data-enhanced';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema';

async function main() {
  try {
    const summary = await seedEnhancedDatabase();
    console.log('Seeding complete:', summary);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

main();
```

Run with:
```bash
cd /Users/labheshpatel/apps/app-factory/apps/Fizzcard/app
npx tsx server/seed-enhanced.ts
```

### Option 3: API Endpoint

```bash
curl -X POST http://localhost:5013/api/seed
```

## Test Credentials

All users have password: `password123`

**Hub Nodes:**
- alex.chen@gmail.com
- priya.sharma@sequoia.com
- sophia.williams@stanford.edu

**Cluster Representatives:**
- sarah.johnson@google.com (Google)
- michael.rodriguez@meta.com (Meta)
- thomas.anderson@a16z.com (VC)

**Startup Founders:**
- lisa.thompson@startup.io (DataFlow AI, Sequoia-backed)
- daniel.brooks@startup.io (CloudSync, YC S22)

## Network Metrics

- **Users**: 20
- **Connections**: 112 (56 unique edges, bidirectional)
- **Hub Nodes**: 3 (users with 8+ connections)
- **Clusters**: 3 (Google, Meta, VC/Startup)
- **Introductions**: 15 (showing referral network)
- **Badges**: 13 (verified + early_adopter)
- **Avg FizzCoins**: ~1,120 per user
- **Connection Strength Range**: 1-5 (20-100 in DB)

## Introduction Network

The seed data includes **15 introductions** showing how hub nodes facilitate connections:

**Top Introducers:**
1. **Alex Chen**: 3 introductions (connecting startups, VCs, talent)
2. **Priya Sharma**: 3 introductions (investing, hiring, advising)
3. **Nina Gupta**: 2 introductions (YC founders)
4. **Sophia Williams**: 2 introductions (academic-industry bridge)

**Rewards Distributed:**
- Completed introductions: 10 × 50 FizzCoins = 500 FizzCoins
- Completed with 25 reward: 5 × 25 FizzCoins = 125 FizzCoins
- Total rewards: 625 FizzCoins distributed

## Visualizing the Network

The enhanced data supports rich network graph visualizations:

1. **Force-directed graph** - See clustering patterns
2. **Node size by connections** - Identify hub nodes
3. **Edge thickness by strength** - Show relationship quality
4. **Color by company** - Visualize clusters
5. **Introduction paths** - Track referral chains

## File Location

Enhanced seed data: `/Users/labheshpatel/apps/app-factory/apps/Fizzcard/app/server/lib/seed-data-enhanced.ts`
