# FizzCard Backend Implementation Summary

## Overview

Complete backend implementation for FizzCard contact sharing platform with crypto rewards. The backend follows the factory pattern for auth and storage, allowing seamless switching between development and production modes.

## File Structure

```
server/
├── lib/
│   ├── auth/
│   │   ├── factory.ts               # Auth factory with IAuthAdapter interface
│   │   ├── mock-adapter.ts          # Mock auth for development
│   │   └── supabase-adapter.ts      # Supabase auth for production
│   └── storage/
│       ├── factory.ts               # Storage factory with IStorage interface
│       ├── mem-storage.ts           # In-memory storage for development
│       └── database-storage.ts      # PostgreSQL/Drizzle storage for production
├── middleware/
│   └── auth.ts                      # Auth middleware for protected routes
├── services/
│   ├── fizzcoin.service.ts          # FizzCoin reward calculation logic
│   ├── geocoding.service.ts         # GPS reverse geocoding (OpenCage API)
│   └── super-connector.service.ts  # Super-connector ranking algorithm
├── routes/
│   ├── auth.ts                      # Auth endpoints (signup, login, logout, me)
│   ├── fizzCards.ts                 # FizzCard CRUD operations
│   ├── socialLinks.ts               # Social links management
│   ├── contactExchanges.ts          # Contact exchange with GPS capture
│   ├── connections.ts               # Connection management with filters
│   ├── wallet.ts                    # Wallet and transaction endpoints
│   ├── leaderboard.ts               # Leaderboard and super-connector discovery
│   ├── events.ts                    # Event management and check-ins
│   └── index.ts                     # Route aggregator
├── index.ts                         # Express server entry point
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Dependencies and scripts
├── .env                             # Environment variables (development)
├── .env.example                     # Environment template
└── README.md                        # Server documentation
```

## Implementation Details

### 1. Auth Factory Pattern

**Files:**
- `server/lib/auth/factory.ts`
- `server/lib/auth/mock-adapter.ts`
- `server/lib/auth/supabase-adapter.ts`

**Features:**
- IAuthAdapter interface with `signup()`, `login()`, `verifyToken()`, `logout()`
- Environment-based switching via `AUTH_MODE` (mock | supabase)
- Mock adapter accepts any credentials (dev mode)
- Supabase adapter integrates with Supabase Auth
- Comprehensive logging for debugging

**Usage:**
```typescript
import { auth } from '../lib/auth/factory';
const authResponse = await auth.signup(email, password, name);
```

### 2. Storage Factory Pattern

**Files:**
- `server/lib/storage/factory.ts`
- `server/lib/storage/mem-storage.ts`
- `server/lib/storage/database-storage.ts`

**Features:**
- IStorage interface with methods for all 12 entities:
  - Users, FizzCards, SocialLinks, ContactExchanges
  - Connections, FizzCoinWallets, FizzCoinTransactions
  - Introductions, Events, EventAttendees, Badges, SearchHistory
- Environment-based switching via `STORAGE_MODE` (memory | database)
- In-memory storage with auto-increment IDs
- Database storage using Drizzle ORM with PostgreSQL
- Type-safe operations with proper error handling

**Usage:**
```typescript
import { storage } from '../lib/storage/factory';
const user = await storage.getUserByEmail(email);
```

### 3. Auth Middleware

**File:** `server/middleware/auth.ts`

**Features:**
- Extract Bearer token from Authorization header
- Verify token and attach user to `req.user`
- Return 401 on invalid/missing token
- Optional auth middleware for public endpoints with optional user context

**Usage:**
```typescript
import { authMiddleware } from '../middleware/auth';
router.post('/protected', authMiddleware(), async (req, res) => {
  console.log(req.user); // Authenticated user
});
```

### 4. Business Logic Services

#### FizzCoin Service
**File:** `server/services/fizzcoin.service.ts`

**Reward Rules:**
- Contact exchange accepted: +25 FizzCoins (both users)
- Introduction completed: +50 FizzCoins (introducer)
- Referral signup: +100 FizzCoins (referrer)
- Event check-in: +20 FizzCoins
- Super-connector multiplier: 2x all earnings

**Methods:**
- `awardExchangeReward(senderId, receiverId)` → awards both users
- `awardIntroductionReward(introducerId, introId)` → with multiplier
- `awardReferralReward(referrerId, newUserId)` → with multiplier
- `awardEventCheckinReward(userId, eventId)`
- `getSuperConnectorMultiplier(userId)` → returns 1 or 2
- `transferCoins(senderId, receiverId, amount, note?)`
- `canAfford(userId, amount)` → balance check

#### Geocoding Service
**File:** `server/services/geocoding.service.ts`

**Features:**
- Reverse geocode GPS coordinates to human-readable location names
- Uses OpenCage Geocoding API
- Caching to minimize API calls
- Graceful fallback to coordinates if API unavailable
- Formats location as: "City, State, Country"

**Methods:**
- `reverseGeocode(lat, lng)` → Promise<string>
- `clearCache()`, `getCacheSize()`

#### Super-Connector Service
**File:** `server/services/super-connector.service.ts`

**Algorithm:**
Calculates connection strength score (0-100) based on:
- Connection count (max 40 points)
- Location diversity (max 20 points)
- Introduction success rate (max 20 points)
- FizzCoin balance (max 20 points)

**Methods:**
- `calculateConnectionStrength(userId)` → Promise<number>
- `getSuperConnectors(limit)` → Promise<SuperConnectorProfile[]>
- `isSuperConnector(userId)` → Promise<boolean> (top 10%)
- `updateSuperConnectorBadges()` → awards badges
- `getUserRank(userId)` → rank, percentile, stats

### 5. API Routes

#### Auth Routes (`/api/auth`)
- `POST /signup` - Create new user + wallet
- `POST /login` - Authenticate user
- `POST /logout` - Invalidate token (protected)
- `GET /me` - Get current user (protected)

#### FizzCards Routes (`/api/fizzcards`)
- `GET /` - Get all FizzCards (paginated, optional auth)
- `GET /my` - Get my FizzCards (protected)
- `GET /:id` - Get single FizzCard
- `POST /` - Create FizzCard (protected)
- `PUT /:id` - Update FizzCard (protected, ownership check)
- `DELETE /:id` - Delete FizzCard (protected, ownership check)

#### Social Links Routes
- `GET /fizzcards/:fizzcardId/social-links` - Get links for FizzCard
- `POST /fizzcards/:fizzcardId/social-links` - Add link (protected, ownership check)
- `DELETE /social-links/:id` - Delete link (protected, ownership check)

#### Contact Exchanges Routes (`/api/contact-exchanges`)
- `POST /` - Initiate exchange (protected)
  - Captures GPS coordinates
  - Reverse geocodes to location name
  - Creates pending exchange
- `GET /received` - Get received requests (protected, paginated, with sender details)
- `GET /sent` - Get sent requests (protected, paginated, with receiver details)
- `PUT /:id/accept` - Accept exchange (protected)
  - Creates bidirectional connections
  - Awards FizzCoins to both users
- `PUT /:id/reject` - Reject exchange (protected)

#### Connections Routes (`/api/connections`)
- `GET /` - Get all connections (protected, with filters)
  - Filters: location, dateFrom, dateTo, tags, sortBy
  - Enriched with user details, exchange location, metAt
  - Paginated
- `GET /:id` - Get single connection (protected, ownership check)
- `PUT /:id` - Update connection (protected, ownership check)
  - Update: relationshipNote, tags, strengthScore
- `DELETE /:id` - Delete connection (protected, ownership check)

#### Wallet Routes (`/api/wallet`)
- `GET /` - Get wallet balance (protected)
- `GET /transactions` - Get transaction history (protected, filtered, paginated)
- `POST /transfer` - Transfer FizzCoins (protected, balance check)

#### Leaderboard Routes (`/api/leaderboard`, `/api/super-connectors`)
- `GET /leaderboard` - Get leaderboard (public, sorted by FizzCoin balance)
- `GET /super-connectors` - Discover super-connectors (public, with filters)
  - Filters: location, industry, minConnections
- `GET /leaderboard/my-rank` - Get my rank (protected)

#### Events Routes (`/api/events`)
- `GET /` - Get all events (public, optional isExclusive filter)
- `GET /:id` - Get event by ID
- `POST /` - Create event (protected)
- `POST /:id/attend` - Register for event (protected, FizzCoin balance check for exclusive)
- `POST /:id/checkin` - Check in to event (protected, awards FizzCoins)

### 6. Server Entry Point

**File:** `server/index.ts`

**Features:**
- Express server with CORS and JSON parsing
- Request logging with duration tracking
- Health check endpoint: `GET /health`
- Mounted API routes under `/api`
- 404 and error handlers
- Graceful shutdown handlers (SIGTERM, SIGINT)
- Startup banner with configuration info

**Health Check Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": {
    "authMode": "mock",
    "storageMode": "memory",
    "nodeEnv": "development"
  }
}
```

## Environment Configuration

### Development (Default)
```env
PORT=5013
NODE_ENV=development
AUTH_MODE=mock
STORAGE_MODE=memory
```

### Production
```env
PORT=5013
NODE_ENV=production
AUTH_MODE=supabase
STORAGE_MODE=database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://user:password@localhost:5432/fizzcard
OPENCAGE_API_KEY=your-opencage-api-key
```

## Type Safety

All types imported from `shared/schema.zod.ts`:
- User, InsertUser
- FizzCard, InsertFizzCard
- SocialLink, InsertSocialLink
- ContactExchange, InsertContactExchange
- Connection, InsertConnection
- FizzCoinWallet, InsertFizzCoinWallet
- FizzCoinTransaction, InsertFizzCoinTransaction
- Introduction, InsertIntroduction
- Event, InsertEvent
- EventAttendee, InsertEventAttendee
- Badge, InsertBadge
- SearchHistory, InsertSearchHistory

All schemas validated with Zod before database operations.

## Error Handling

- Zod validation errors → 400 Bad Request
- Authentication errors → 401 Unauthorized
- Authorization errors → 403 Forbidden
- Not found errors → 404 Not Found
- Server errors → 500 Internal Server Error
- All errors logged to console

## Logging

Comprehensive logging for debugging:
- `[Auth Factory]` - Auth mode initialization
- `[MockAuth]` / `[SupabaseAuth]` - Auth operations
- `[AuthMiddleware]` - Token verification
- `[Storage Factory]` - Storage mode initialization
- `[MemoryStorage]` / `[DatabaseStorage]` - All CRUD operations
- `[FizzCoin]` - Reward calculations and transfers
- `[Geocoding]` - Reverse geocoding results
- `[SuperConnector]` - Ranking calculations
- `[Route Name Routes]` - Route access and errors
- Request logging: `[timestamp] METHOD path - statusCode (duration)`

## Dependencies

**Production:**
- express: Web framework
- cors: CORS middleware
- dotenv: Environment variables
- zod: Schema validation
- bcryptjs: Password hashing
- @supabase/supabase-js: Supabase client
- drizzle-orm: Type-safe ORM
- pg: PostgreSQL driver
- axios: HTTP client (for geocoding)
- @ts-rest/core: Type-safe API contracts

**Development:**
- typescript: Type checking
- tsx: TypeScript execution with hot reload
- @types/*: Type definitions

## Running the Server

### Install Dependencies
```bash
cd server
npm install
```

### Development Mode
```bash
npm run dev
```
Server runs at http://localhost:5013 with hot reload

### Production Build
```bash
npm run build
npm start
```

### Type Check
```bash
npm run type-check
```

## Testing the Implementation

### 1. Health Check
```bash
curl http://localhost:5013/health
```

### 2. Sign Up
```bash
curl -X POST http://localhost:5013/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

### 3. Login
```bash
curl -X POST http://localhost:5013/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 4. Create FizzCard (Protected)
```bash
curl -X POST http://localhost:5013/api/fizzcards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"displayName":"John Doe","title":"Software Engineer","isActive":true}'
```

## Next Steps

1. **Install Dependencies**: Run `npm install` in the server directory
2. **Run Development Server**: `npm run dev`
3. **Test API Endpoints**: Use curl, Postman, or your API client of choice
4. **Configure Production**: Set up Supabase and PostgreSQL for production use
5. **Add Geocoding**: Get OpenCage API key for location features
6. **Database Migration**: Run Drizzle migrations when using database mode

## Notes

- All routes follow REST conventions
- All protected routes require `Authorization: Bearer TOKEN` header
- Pagination implemented manually (in-memory filtering)
- FizzCoin rewards awarded automatically on exchange acceptance
- Super-connector badges can be awarded via service method
- Geocoding is optional (falls back to coordinates if API unavailable)
- All timestamps in ISO 8601 format
- All numeric IDs auto-increment
- Bidirectional connections created on exchange acceptance
