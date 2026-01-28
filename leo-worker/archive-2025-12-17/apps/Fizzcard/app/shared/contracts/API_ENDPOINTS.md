# FizzCard API Endpoints Summary

Complete list of all API endpoints with their methods, authentication requirements, and descriptions.

## Authentication Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/signup` | No | Sign up new user |
| POST | `/api/auth/login` | No | Login user |
| POST | `/api/auth/logout` | Yes | Logout user |
| GET | `/api/auth/me` | Yes | Get current authenticated user |

## Upload Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/upload/avatar` | Yes | Upload profile avatar image (returns data URI) |

## FizzCard Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/fizzcards` | No | Get all public FizzCards (paginated) |
| GET | `/api/fizzcards/my` | Yes | Get my FizzCards |
| GET | `/api/fizzcards/:id` | No | Get single FizzCard by ID |
| POST | `/api/fizzcards` | Yes | Create new FizzCard |
| PUT | `/api/fizzcards/:id` | Yes | Update FizzCard |
| DELETE | `/api/fizzcards/:id` | Yes | Delete FizzCard |

## Social Links Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/fizzcards/:fizzCardId/social-links` | No | Get all social links for a FizzCard |
| POST | `/api/fizzcards/:fizzCardId/social-links` | Yes | Create social link |
| PUT | `/api/social-links/:id` | Yes | Update social link |
| DELETE | `/api/social-links/:id` | Yes | Delete social link |

## Contact Exchange Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/contact-exchanges` | Yes | Initiate contact exchange (scan QR) |
| GET | `/api/contact-exchanges/received` | Yes | Get received exchange requests |
| GET | `/api/contact-exchanges/sent` | Yes | Get sent exchange requests |
| PUT | `/api/contact-exchanges/:id/accept` | Yes | Accept exchange (earns FizzCoins) |
| PUT | `/api/contact-exchanges/:id/reject` | Yes | Reject exchange |

## Connection Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/connections` | Yes | Get all my connections (with filters) |
| GET | `/api/connections/:id` | Yes | Get single connection |
| PUT | `/api/connections/:id` | Yes | Update connection (notes, tags, strength) |
| DELETE | `/api/connections/:id` | Yes | Remove connection |

## FizzCoin/Wallet Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/wallet` | Yes | Get my wallet balance |
| GET | `/api/wallet/transactions` | Yes | Get transaction history (paginated) |
| POST | `/api/wallet/transfer` | Yes | Transfer FizzCoins to another user |

## Leaderboard Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/leaderboard` | No | Get leaderboard (with filters) |
| GET | `/api/leaderboard/my-rank` | Yes | Get my current rank |
| GET | `/api/super-connectors` | No | Discover super-connectors |

## Introduction Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/introductions` | Yes | Create introduction between two connections |
| GET | `/api/introductions/received` | Yes | Get introduction requests received |
| GET | `/api/introductions/made` | Yes | Get introductions I have made |
| PUT | `/api/introductions/:id/accept` | Yes | Accept introduction (earns FizzCoins) |
| PUT | `/api/introductions/:id/decline` | Yes | Decline introduction |

## Event Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/events` | No | Get all events (paginated) |
| GET | `/api/events/:id` | No | Get single event |
| POST | `/api/events` | Yes (Admin) | Create new event |
| PUT | `/api/events/:id` | Yes (Admin/Creator) | Update event |
| DELETE | `/api/events/:id` | Yes (Admin/Creator) | Delete event |
| POST | `/api/events/:id/checkin` | Yes | Check in to event (earns FizzCoins) |
| GET | `/api/events/:id/attendees` | No | Get event attendees |

## Badge Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/badges/my` | Yes | Get my earned badges |
| GET | `/api/users/:userId/badges` | No | Get user's badges |
| GET | `/api/badges/types` | No | Get all badge types and criteria |

## Search Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/search/connections` | Yes | Search my connections (advanced filters) |
| GET | `/api/search/users` | No | Search all users |

---

## Total Endpoints: 52

### Breakdown by Category:
- **Authentication**: 4 endpoints
- **FizzCards**: 6 endpoints
- **Social Links**: 4 endpoints
- **Contact Exchanges**: 5 endpoints
- **Connections**: 4 endpoints
- **FizzCoin/Wallet**: 3 endpoints
- **Leaderboard**: 3 endpoints
- **Introductions**: 5 endpoints
- **Events**: 7 endpoints
- **Badges**: 3 endpoints
- **Search**: 2 endpoints

### Authentication Requirements:
- **Public endpoints**: 20 (no authentication required)
- **Protected endpoints**: 32 (authentication required)
- **Admin-only endpoints**: 1 (event creation)

## Query Parameters

### Common Pagination Parameters
Most list endpoints support:
- `page` (default: 1)
- `limit` (default: 20, max: 100)

### Filter Parameters by Endpoint

**GET /api/fizzcards**
- `page`, `limit`, `isActive`

**GET /api/contact-exchanges/received**
- `status`, `page`, `limit`

**GET /api/contact-exchanges/sent**
- `status`, `page`, `limit`

**GET /api/connections**
- `location`, `dateFrom`, `dateTo`, `tags`, `sortBy`, `page`, `limit`

**GET /api/wallet/transactions**
- `type`, `dateFrom`, `dateTo`, `page`, `limit`

**GET /api/leaderboard**
- `filter`, `location`, `timeRange`, `page`, `limit`

**GET /api/super-connectors**
- `location`, `industry`, `minConnections`, `page`, `limit`

**GET /api/introductions/received**
- `status`, `page`, `limit`

**GET /api/introductions/made**
- `status`, `page`, `limit`

**GET /api/events**
- `upcoming`, `exclusive`, `location`, `page`, `limit`

**GET /api/events/:id/attendees**
- `page`, `limit`

**GET /api/search/connections**
- `q`, `location`, `dateFrom`, `dateTo`, `tags`, `company`, `title`, `minStrength`, `sortBy`, `page`, `limit`

**GET /api/search/users**
- `q`, `location`, `isSuperConnector`, `page`, `limit`

## FizzCoin Rewards

Endpoints that earn FizzCoins:

| Endpoint | Action | FizzCoins Earned |
|----------|--------|------------------|
| `PUT /api/contact-exchanges/:id/accept` | Accept exchange | +25 (both parties) |
| `PUT /api/introductions/:id/accept` | Accept introduction | +50 (introducer) |
| `POST /api/events/:id/checkin` | Check in to event | +20 |

Additional rewards (handled by business logic):
- Referral system: +100 FizzCoins
- Super-connector bonus: 2x multiplier

## Error Responses

All endpoints return consistent error responses:

```typescript
{
  error: string
}
```

Status codes:
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **409**: Conflict
- **500**: Internal Server Error
