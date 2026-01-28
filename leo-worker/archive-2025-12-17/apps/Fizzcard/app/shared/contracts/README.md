# FizzCard API Contracts

Complete ts-rest API contracts for the FizzCard application - a contact sharing and networking platform with crypto rewards.

## Overview

This directory contains type-safe API contracts using `@ts-rest/core`. All contracts import Zod schemas from `../schema.zod.ts` to ensure type consistency across the application.

## Contract Files

### 1. **auth.contract.ts** - Authentication
Authentication endpoints for user signup, login, logout, and session management.

**Endpoints:**
- `POST /api/auth/signup` - Sign up new user
  - Body: `{ email, password, name }`
  - Response: `{ user, token }`
- `POST /api/auth/login` - Login user
  - Body: `{ email, password }`
  - Response: `{ user, token }`
- `POST /api/auth/logout` - Logout user (requires auth)
  - Response: `{ message }`
- `GET /api/auth/me` - Get current authenticated user
  - Response: `User` (without password hash)

### 2. **fizzCards.contract.ts** - Digital Business Cards
CRUD operations for FizzCards (digital business cards).

**Endpoints:**
- `GET /api/fizzcards` - Get all public FizzCards
  - Query: `{ page?, limit?, isActive? }`
  - Response: Paginated list of FizzCards
- `GET /api/fizzcards/my` - Get my FizzCards (requires auth)
  - Response: Array of FizzCards
- `GET /api/fizzcards/:id` - Get single FizzCard
  - Response: FizzCard
- `POST /api/fizzcards` - Create FizzCard (requires auth)
  - Body: `{ displayName, title?, company?, phone?, email?, ... }`
  - Response: Created FizzCard
- `PUT /api/fizzcards/:id` - Update FizzCard (requires auth)
  - Body: Partial FizzCard fields
  - Response: Updated FizzCard
- `DELETE /api/fizzcards/:id` - Delete FizzCard (requires auth)
  - Response: Success message

### 3. **socialLinks.contract.ts** - Social Media Links
Manage social media links associated with FizzCards.

**Endpoints:**
- `GET /api/fizzcards/:fizzCardId/social-links` - Get all social links for a FizzCard
  - Response: Array of SocialLinks
- `POST /api/fizzcards/:fizzCardId/social-links` - Create social link (requires auth)
  - Body: `{ platform, url }`
  - Response: Created SocialLink
- `PUT /api/social-links/:id` - Update social link (requires auth)
  - Body: `{ platform?, url? }`
  - Response: Updated SocialLink
- `DELETE /api/social-links/:id` - Delete social link (requires auth)
  - Response: Success message

### 4. **contactExchanges.contract.ts** - Contact Exchange Flow
Initiate and manage contact exchanges (QR code scanning).

**Endpoints:**
- `POST /api/contact-exchanges` - Initiate contact exchange (requires auth)
  - Body: `{ receiverId, method, latitude?, longitude?, locationName?, metAt? }`
  - Response: ContactExchange
- `GET /api/contact-exchanges/received` - Get received requests (requires auth)
  - Query: `{ status?, page?, limit? }`
  - Response: Paginated list with sender details
- `GET /api/contact-exchanges/sent` - Get sent requests (requires auth)
  - Query: `{ status?, page?, limit? }`
  - Response: Paginated list with receiver details
- `PUT /api/contact-exchanges/:id/accept` - Accept exchange (requires auth)
  - Response: `{ exchange, connection, fizzcoinsEarned }`
- `PUT /api/contact-exchanges/:id/reject` - Reject exchange (requires auth)
  - Response: Updated ContactExchange

### 5. **connections.contract.ts** - Verified Connections
Manage verified connections after exchange acceptance.

**Endpoints:**
- `GET /api/connections` - Get all my connections (requires auth)
  - Query: `{ location?, dateFrom?, dateTo?, tags?, sortBy?, page?, limit? }`
  - Response: Paginated connections with user details
- `GET /api/connections/:id` - Get single connection (requires auth)
  - Response: Connection with details
- `PUT /api/connections/:id` - Update connection (requires auth)
  - Body: `{ relationshipNote?, tags?, strengthScore? }`
  - Response: Updated Connection
- `DELETE /api/connections/:id` - Remove connection (requires auth)
  - Response: Success message

### 6. **fizzCoin.contract.ts** - Wallet & Transactions
FizzCoin wallet balance and transaction history.

**Endpoints:**
- `GET /api/wallet` - Get my wallet balance (requires auth)
  - Response: `{ balance, totalEarned, totalSpent, ... }`
- `GET /api/wallet/transactions` - Get transaction history (requires auth)
  - Query: `{ type?, dateFrom?, dateTo?, page?, limit? }`
  - Response: Paginated transactions
- `POST /api/wallet/transfer` - Transfer FizzCoins (requires auth)
  - Body: `{ recipientUserId, amount, note? }`
  - Response: `{ transaction, newBalance }`

### 7. **leaderboard.contract.ts** - Leaderboard & Super-Connectors
Leaderboard rankings and super-connector discovery.

**Endpoints:**
- `GET /api/leaderboard` - Get leaderboard
  - Query: `{ filter?, location?, timeRange?, page?, limit? }`
  - Response: Paginated leaderboard entries with ranks
- `GET /api/super-connectors` - Discover super-connectors
  - Query: `{ location?, industry?, minConnections?, page?, limit? }`
  - Response: Paginated super-connector profiles
- `GET /api/leaderboard/my-rank` - Get my rank (requires auth)
  - Response: `{ rank, totalUsers, percentile, fizzCoinBalance, connectionCount }`

### 8. **introductions.contract.ts** - Introduction System
Create and manage introductions between connections.

**Endpoints:**
- `POST /api/introductions` - Create introduction (requires auth)
  - Body: `{ personAId, personBId, context? }`
  - Response: Introduction
- `GET /api/introductions/received` - Get received introductions (requires auth)
  - Query: `{ status?, page?, limit? }`
  - Response: Paginated introductions
- `GET /api/introductions/made` - Get introductions I made (requires auth)
  - Query: `{ status?, page?, limit? }`
  - Response: Paginated introductions
- `PUT /api/introductions/:id/accept` - Accept introduction (requires auth)
  - Response: `{ introduction, fizzcoinsAwarded }`
- `PUT /api/introductions/:id/decline` - Decline introduction (requires auth)
  - Response: Updated Introduction

### 9. **events.contract.ts** - Event Management
Create and manage networking events.

**Endpoints:**
- `GET /api/events` - Get all events
  - Query: `{ upcoming?, exclusive?, location?, page?, limit? }`
  - Response: Paginated events with details
- `GET /api/events/:id` - Get single event
  - Response: Event with creator and attendee count
- `POST /api/events` - Create event (requires auth, admin only)
  - Body: `{ name, description?, location?, startDate, endDate, ... }`
  - Response: Created Event
- `PUT /api/events/:id` - Update event (requires auth, admin/creator)
  - Body: Partial Event fields
  - Response: Updated Event
- `DELETE /api/events/:id` - Delete event (requires auth, admin/creator)
  - Response: Success message
- `POST /api/events/:id/checkin` - Check in to event (requires auth)
  - Response: `{ attendee, fizzcoinsEarned }`
- `GET /api/events/:id/attendees` - Get event attendees
  - Query: `{ page?, limit? }`
  - Response: Paginated attendees with user details

### 10. **badges.contract.ts** - User Badges
Gamification badges and achievements.

**Endpoints:**
- `GET /api/badges/my` - Get my badges (requires auth)
  - Response: Array of badges with details
- `GET /api/users/:userId/badges` - Get user's badges
  - Response: Array of badges
- `GET /api/badges/types` - Get all badge types and criteria
  - Response: Array of badge types with descriptions

### 11. **search.contract.ts** - Search
Advanced search for connections and users.

**Endpoints:**
- `GET /api/search/connections` - Search my connections (requires auth)
  - Query: `{ q?, location?, dateFrom?, dateTo?, tags?, company?, title?, minStrength?, sortBy?, page?, limit? }`
  - Response: Paginated search results with available filters
- `GET /api/search/users` - Search all users (public)
  - Query: `{ q, location?, isSuperConnector?, page?, limit? }`
  - Response: Paginated user search results

## Usage

### Import Combined API Contract

```typescript
import { apiContract } from './shared/contracts';

// Use in ts-rest client
const client = initClient(apiContract, {
  baseUrl: 'http://localhost:3000',
  baseHeaders: {
    Authorization: `Bearer ${token}`,
  },
});

// Make type-safe API calls
const result = await client.auth.signup({
  body: {
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe',
  },
});
```

### Import Individual Contracts

```typescript
import { authContract } from './shared/contracts/auth.contract';
import { fizzCardsContract } from './shared/contracts/fizzCards.contract';
```

## Response Codes

All endpoints use standard HTTP status codes:

- **200** - Success (GET, PUT)
- **201** - Created (POST)
- **400** - Bad Request (validation error)
- **401** - Unauthorized (missing/invalid auth)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **409** - Conflict (e.g., duplicate email)
- **500** - Internal Server Error

## Authentication

Protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

The token is returned from `/api/auth/signup` and `/api/auth/login` endpoints.

## Pagination

Most list endpoints support pagination with these query parameters:

- `page` (default: 1) - Page number
- `limit` (default: 20, max: 100) - Items per page

Response format:
```typescript
{
  data: T[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number,
  }
}
```

## FizzCoin Earning System

Users earn FizzCoins through various activities:

- **Contact Exchange** (+10 FizzCoins for both parties)
- **Verified Connection** (+25 FizzCoins for both parties on accept)
- **Introduction** (+50 FizzCoins to introducer when completed)
- **Referral** (+100 FizzCoins when new user joins)
- **Event Check-in** (+20 FizzCoins)
- **Super-Connector Bonus** (2x multiplier on all earnings)

## Entity Relationships

```
users → fizzCards → socialLinks
users → contactExchanges (sender/receiver)
contactExchanges → connections (after acceptance)
users → fizzCoinWallets → fizzCoinTransactions
users → introductions (introducer/personA/personB)
events → eventAttendees → users
users → badges
```

## Next Steps

After implementing these contracts:

1. Create Express route handlers in `server/routes/`
2. Implement storage layer (memory + database modes)
3. Add authentication middleware
4. Create ts-rest server and client instances
5. Implement business logic (FizzCoin rewards, super-connector algorithm)

## License

Part of the FizzCard application.
