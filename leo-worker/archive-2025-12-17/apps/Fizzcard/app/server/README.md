# FizzCard Backend Server

Production-ready backend for FizzCard contact sharing platform with crypto rewards.

## Features

- **Factory Pattern Architecture**: Pluggable auth and storage adapters
- **Auth Modes**: Mock (dev) and Supabase (prod)
- **Storage Modes**: In-memory (dev) and PostgreSQL (prod)
- **FizzCoin Rewards**: Automatic reward calculation and distribution
- **GPS Geocoding**: Reverse geocode meeting locations
- **Super-Connector Algorithm**: Identify and rank top networkers

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### 3. Run Development Server

```bash
npm run dev
```

Server will start at `http://localhost:5013`

## Environment Modes

### Development (Default)
```env
AUTH_MODE=mock
STORAGE_MODE=memory
```
- Mock authentication (accepts any credentials)
- In-memory storage (data lost on restart)
- Perfect for local development

### Production
```env
AUTH_MODE=supabase
STORAGE_MODE=database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://user:password@localhost:5432/fizzcard
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Sign up new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user (protected)
- `GET /api/auth/me` - Get current user (protected)

### FizzCards
- `GET /api/fizzcards` - Get all FizzCards (paginated)
- `GET /api/fizzcards/my` - Get my FizzCards (protected)
- `GET /api/fizzcards/:id` - Get FizzCard by ID
- `POST /api/fizzcards` - Create FizzCard (protected)
- `PUT /api/fizzcards/:id` - Update FizzCard (protected)
- `DELETE /api/fizzcards/:id` - Delete FizzCard (protected)

### Social Links
- `GET /api/fizzcards/:fizzcardId/social-links` - Get social links
- `POST /api/fizzcards/:fizzcardId/social-links` - Add social link (protected)
- `DELETE /api/social-links/:id` - Delete social link (protected)

### Contact Exchanges
- `POST /api/contact-exchanges` - Initiate exchange (protected)
- `GET /api/contact-exchanges/received` - Get received requests (protected)
- `GET /api/contact-exchanges/sent` - Get sent requests (protected)
- `PUT /api/contact-exchanges/:id/accept` - Accept exchange (protected)
- `PUT /api/contact-exchanges/:id/reject` - Reject exchange (protected)

### Connections
- `GET /api/connections` - Get all connections with filters (protected)
- `GET /api/connections/:id` - Get connection by ID (protected)
- `PUT /api/connections/:id` - Update connection (protected)
- `DELETE /api/connections/:id` - Delete connection (protected)

### Wallet & FizzCoin
- `GET /api/wallet` - Get wallet balance (protected)
- `GET /api/wallet/transactions` - Get transaction history (protected)
- `POST /api/wallet/transfer` - Transfer FizzCoins (protected)

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard
- `GET /api/super-connectors` - Discover super-connectors
- `GET /api/leaderboard/my-rank` - Get my rank (protected)

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create event (protected)
- `POST /api/events/:id/attend` - Register for event (protected)
- `POST /api/events/:id/checkin` - Check in to event (protected)

## FizzCoin Rewards

- **Contact Exchange Accepted**: +25 FizzCoins (both users)
- **Introduction Completed**: +50 FizzCoins
- **Referral Signup**: +100 FizzCoins
- **Event Check-in**: +20 FizzCoins
- **Super-Connector Multiplier**: 2x all earnings

## Architecture

### Factory Pattern
```
server/
├── lib/
│   ├── auth/
│   │   ├── factory.ts          # Auth factory
│   │   ├── mock-adapter.ts     # Development auth
│   │   └── supabase-adapter.ts # Production auth
│   └── storage/
│       ├── factory.ts          # Storage factory
│       ├── mem-storage.ts      # In-memory storage
│       └── database-storage.ts # PostgreSQL storage
├── middleware/
│   └── auth.ts                 # Auth middleware
├── services/
│   ├── fizzcoin.service.ts     # FizzCoin logic
│   ├── geocoding.service.ts    # GPS geocoding
│   └── super-connector.service.ts # Ranking algorithm
├── routes/
│   └── *.ts                    # API routes
└── index.ts                    # Server entry point
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run type-check` - Type check without emitting files

## Testing the API

Use the health check endpoint to verify the server is running:

```bash
curl http://localhost:5013/health
```

Response:
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

## Authentication

Protected routes require a Bearer token:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5013/api/auth/me
```

## Logging

All major operations are logged to console for debugging:
- Auth attempts (signup, login, token verification)
- Storage operations (CRUD for all entities)
- FizzCoin transactions
- Route access and errors
