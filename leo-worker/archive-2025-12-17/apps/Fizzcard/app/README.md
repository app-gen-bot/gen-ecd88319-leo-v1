# FizzCard 🪙

**Next-generation contact sharing and networking platform backed by FizzCoin crypto rewards**

FizzCard reimagines business card exchange by combining effortless QR-based contact sharing with contextual meeting data (GPS location, timestamps) and a crypto reward system that recognizes and rewards meaningful connections.

---

## 🚀 Features

### Core Features
- ✅ **Rich Digital Business Cards** - Create beautiful, shareable FizzCards with contact info and social links
- ✅ **QR Code Exchange** - Instantly share and receive contact info via QR scan
- ✅ **Contextual Memory** - Auto-capture when/where you met ("Met in San Juan on Sep 14")
- ✅ **FizzCoin Rewards** - Earn crypto tokens for verified connections, introductions, and event check-ins
- ✅ **Smart Search** - Filter connections by location, date, or tags
- ✅ **Super-Connector Discovery** - Find influential networkers with diverse connections
- ✅ **Leaderboard** - Compete on networking prowess and FizzCoin balance
- ✅ **Wallet System** - Track earnings, view transaction history
- ✅ **Gamification** - Earn badges like Super-Connector, Early Adopter, Top Earner
- ✅ **Event Management** - Discover and check in to networking events
- ✅ **Privacy Controls** - Manage location sharing, profile visibility, and consent

### Design Highlights
- 🌙 **Dark Mode First** - Vibrant colors with excellent contrast
- ✨ **Glass-morphism** - Modern backdrop blur effects
- 🎨 **Vibrant Animations** - Celebrate each connection with visual feedback
- 📱 **Mobile-First** - Optimized for on-the-go networking
- 🎮 **Gamified UX** - Particle effects, glow animations, achievement celebrations

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast development
- **Tailwind CSS** + custom design tokens
- **Wouter** for routing
- **TanStack Query** for data fetching
- **ts-rest** for type-safe API calls
- **react-qr-code** for QR generation
- **@yudiel/react-qr-scanner** for QR scanning
- **Framer Motion** for animations

### Backend
- **Node.js** + **Express**
- **TypeScript** with strict mode
- **Drizzle ORM** for database
- **PostgreSQL** for production storage
- **Zod** for validation
- **ts-rest** for type-safe contracts
- **Supabase** for production auth
- **OpenCage API** for geocoding

### Architecture Patterns
- **Factory Pattern** - Auth and Storage adapters with environment switching
- **Schema-First** - Zod as single source of truth
- **Type-Safe End-to-End** - From database to UI
- **Mock + Production** - Instant dev mode, production-ready with env vars

---

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm 9+
- PostgreSQL (for production mode)

### Quick Start

```bash
# Clone or navigate to project
cd /Users/labheshpatel/apps/app-factory/apps/Fizzcard/app

# Install dependencies
npm run install:all

# Start development servers (mock auth + in-memory storage)
npm run dev
```

The app will start:
- **Backend**: http://localhost:5013
- **Frontend**: http://localhost:5014

### Development Mode (Default)
- **Mock Auth**: Accepts any credentials for instant testing
- **In-Memory Storage**: Data resets on server restart
- **No Configuration Needed**: Works out of the box

---

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Development (default)
AUTH_MODE=mock
STORAGE_MODE=memory
PORT=5013
VITE_API_URL=http://localhost:5013

# Production
AUTH_MODE=supabase
STORAGE_MODE=database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# OpenCage Geocoding (optional but recommended)
OPENCAGE_API_KEY=your-api-key
```

### Switching to Production Mode

1. **Set up Supabase**:
   - Create project at https://supabase.com
   - Get SUPABASE_URL and SUPABASE_ANON_KEY from project settings
   - Get DATABASE_URL from database settings

2. **Run Drizzle migrations**:
   ```bash
   cd server
   npm run db:push  # Push schema to PostgreSQL
   ```

3. **Update .env**:
   ```bash
   AUTH_MODE=supabase
   STORAGE_MODE=database
   ```

4. **Restart servers**:
   ```bash
   npm run dev
   ```

---

## 📚 Project Structure

```
/Users/labheshpatel/apps/app-factory/apps/Fizzcard/app/
├── client/              # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── contexts/    # React contexts (Auth)
│   │   ├── lib/         # Utilities (API client, geolocation)
│   │   ├── pages/       # Page components
│   │   ├── styles/      # Design tokens, global styles
│   │   ├── App.tsx      # Main app component
│   │   └── main.tsx     # Entry point
│   └── package.json
│
├── server/              # Backend (Node.js + Express)
│   ├── lib/
│   │   ├── auth/        # Auth factory (mock + Supabase)
│   │   └── storage/     # Storage factory (memory + database)
│   ├── middleware/      # Auth middleware
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic (FizzCoin, geocoding)
│   ├── index.ts         # Server entry point
│   └── package.json
│
├── shared/              # Shared between client and server
│   ├── contracts/       # ts-rest API contracts
│   ├── schema.zod.ts    # Zod validation schemas
│   └── schema.ts        # Drizzle ORM schemas
│
├── plan/
│   └── plan.md          # Feature specification
│
├── .env                 # Environment configuration
├── package.json         # Root package (workspace)
└── README.md            # This file
```

---

## 🌱 Demo Network Seeding

Quickly populate your FizzCard instance with a realistic social network for demos and testing:

```bash
npm run seed:network
```

This creates:
- 31 unique contact exchanges
- 62 bidirectional connections
- Hub-and-spoke network pattern
- Realistic GPS locations and timestamps
- FizzCoin rewards for all participants
- Badge eligibility for top connectors

**Documentation:**
- Quick Reference: `QUICK_SEED.md`
- Full Guide: `SEED_NETWORK_GUIDE.md`
- Network Diagram: `NETWORK_DIAGRAM.md`
- Summary: `NETWORK_SEEDING_SUMMARY.md`

**Users included:**
- alice@fizzcard.com (Primary hub - 10 connections)
- bob@fizzcard.com (Secondary hub - 7 connections)
- charlie@fizzcard.com (Bridge - 5 connections)
- diana@fizzcard.com, eve@fizzcard.com (Cluster leaders)
- user1-10@demo.com (Network members)

All passwords: `password123`

---

## 🎯 Usage

### Development Workflow

1. **Sign Up**
   - Navigate to http://localhost:5014/signup
   - Use any email/password (mock mode)
   - Grant location permission when prompted

2. **Create FizzCard**
   - Auto-created on signup with your profile info
   - Visit "My FizzCard" to edit details
   - Add social links (LinkedIn, Twitter, etc.)

3. **Share Your FizzCard**
   - View your QR code on "My FizzCard" page
   - Share link or show QR code to others

4. **Scan QR Codes**
   - Click "Scan" button (center of bottom nav)
   - Allow camera permission
   - Scan another user's QR code
   - GPS location auto-captured
   - Send connection request

5. **Accept Connections**
   - View pending requests on "Requests" page
   - Accept to earn +25 FizzCoins (each party)
   - Connection appears in both users' networks

6. **View Wallet**
   - See FizzCoin balance
   - View transaction history
   - Track earnings by type

7. **Explore Leaderboard**
   - See top networkers globally
   - Filter by location or time period
   - Find super-connectors

---

## 🪙 FizzCoin Reward System

### How to Earn FizzCoins

| Action | Reward | Notes |
|--------|--------|-------|
| **Accept Connection** | +25 | Both parties earn |
| **Complete Introduction** | +50 | Introducer earns (2x if Super-Connector) |
| **Referral Signup** | +100 | When invited user joins |
| **Event Check-in** | +20 | Per event attended |
| **Super-Connector Bonus** | 2x | Multiplier on all earnings |

### Super-Connector Status
Earned by top 10% of users based on:
- Number of verified connections
- Connection diversity (different cities, industries)
- Introduction success rate
- FizzCoin balance

Benefits:
- 2x earnings multiplier
- Badge on profile
- Featured in discovery engine
- Access to exclusive events

---

## 🧪 Testing

### Type Check
```bash
npm run typecheck
```

### Build Test
```bash
npm run build
```

### Manual Testing
1. Start dev servers: `npm run dev`
2. Open http://localhost:5014
3. Sign up and create FizzCard
4. Open in second browser/incognito window
5. Sign up as second user
6. Share QR codes and test connection flow

---

## 🚢 Deployment

### Backend (Node.js)
Deploy to:
- **Heroku**: `git push heroku main`
- **Railway**: Connect GitHub repo
- **Render**: Connect GitHub repo
- **AWS/Google Cloud**: Deploy as Node.js app

Set environment variables:
- `AUTH_MODE=supabase`
- `STORAGE_MODE=database`
- `DATABASE_URL=...`
- `SUPABASE_URL=...`
- `SUPABASE_ANON_KEY=...`

### Frontend (Static Site)
Deploy to:
- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy`
- **Cloudflare Pages**: Connect GitHub repo

Set environment variable:
- `VITE_API_URL=https://your-backend.com`

---

## 📖 Documentation

**Complete documentation index**: [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) - **Master index of all 91 documentation files**

### Key Documentation:
- **Project Handoff**: [PROJECT_HANDOFF.md](PROJECT_HANDOFF.md) - Complete handoff for new team members
- **Deployment Guide**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Production deployment steps
- **Feature Docs**: [docs/README.md](docs/README.md) - Feature-specific documentation
- **Contracts**: `shared/contracts/` - ts-rest API contracts
- **API Reference**: `shared/contracts/API_ENDPOINTS.md` - All API endpoints

### Example API Calls

```typescript
import { apiClient } from '@/lib/api-client';

// Get my connections
const connections = await apiClient.connections.getConnections({
  query: { filter_location: 'San Juan' }
});

// Create contact exchange
const exchange = await apiClient.contactExchanges.initiateExchange({
  body: {
    receiverId: 2,
    method: 'qr_code',
    latitude: 18.4655,
    longitude: -66.1057,
    locationName: 'San Juan, Puerto Rico'
  }
});
```

---

## 🛡️ Privacy & Security

### User Privacy
- Location data is **opt-in** (requested during onboarding)
- Users can **disable location tracking** in settings
- Connections require **mutual consent** (accept/reject flow)
- Profile visibility is **user-controlled** (public/connections-only/private)
- All data can be **exported or deleted** on request

### Security
- Passwords hashed with **bcryptjs**
- Bearer token authentication
- **Ownership checks** on all protected routes
- SQL injection prevention via **Drizzle ORM**
- Input validation with **Zod schemas**

---

## 🗺️ Roadmap

### Phase 1: MVP (Current)
- ✅ Core contact exchange
- ✅ FizzCoin rewards
- ✅ Basic leaderboard
- ✅ QR code sharing

### Phase 2: Social Features
- ⏳ Introduction system with rewards
- ⏳ Relationship graph visualization
- ⏳ Advanced super-connector algorithm
- ⏳ Event management and check-ins

### Phase 3: Blockchain Integration
- ⏳ Migrate from centralized ledger to blockchain (Polygon/Solana)
- ⏳ FizzCoin trading between users
- ⏳ NFT badges for achievements
- ⏳ Exclusive event NFTs

### Phase 4: Advanced Features
- ⏳ NFC tap-to-share (Android Chrome)
- ⏳ AI-powered connection recommendations
- ⏳ Premium profile features
- ⏳ Business/enterprise plans

---

## 🤝 Contributing

FizzCard is currently a private project. For questions or collaboration:
- Email: [your-email]
- Issues: [GitHub Issues]

---

## 📄 License

Proprietary. All rights reserved.

---

## 🙏 Acknowledgments

- **Design Inspiration**: Modern crypto wallets, networking apps
- **Libraries**: React, Vite, Drizzle ORM, ts-rest, OpenCage
- **Icons**: Lucide React
- **Fonts**: Inter, DM Sans, JetBrains Mono

---

## 💡 Tips

### For Developers
- Use **mock mode** for rapid development (no setup needed)
- Check `plan/plan.md` for complete feature specification
- Review `shared/contracts/API_ENDPOINTS.md` for all endpoints
- Design system tokens at `client/src/styles/design-tokens.ts`

### For Users
- Grant location permission for contextual tagging
- Accept connections to earn FizzCoins
- Check leaderboard to find super-connectors
- Attend events to boost your network and earnings

---

**Built with ❤️ using the AI App Factory pipeline**

🚀 **Start networking and earning FizzCoins today!**
