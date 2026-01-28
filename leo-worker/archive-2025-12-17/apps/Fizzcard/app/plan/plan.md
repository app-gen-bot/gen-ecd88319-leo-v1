# FizzCard - Plan & Feature Specification

## Overview
FizzCard is a mobile-first contact sharing and networking platform that combines rich digital business cards with a crypto reward system (FizzCoin). The app captures contextual meeting data (GPS location, timestamp) and rewards meaningful connections through a blockchain-based token economy.

## Core Value Proposition
- **Effortless Contact Exchange**: QR code, NFC, and direct share capabilities
- **Contextual Memory**: Auto-capture when/where you met someone
- **Crypto-Powered Social Capital**: Earn FizzCoin for verified connections
- **Super-Connector Discovery**: Find and reward influential networkers
- **Relationship Graph**: Navigate connections to find the right person

## User Roles & Permissions

### User Types
1. **Standard User** (default)
   - Create and share FizzCard
   - Exchange contacts
   - Earn FizzCoins
   - View basic leaderboard

2. **Verified User**
   - Enhanced profile visibility
   - Higher FizzCoin rewards
   - Access to verification badge

3. **Super-Connector** (earned status)
   - Top 10% networkers by connection quality
   - Exclusive event access
   - Bonus FizzCoin multipliers
   - Featured in discovery engine

4. **Admin**
   - Manage user reports
   - Monitor FizzCoin distribution
   - Event management

## Core Entities & Data Models

### 1. Users
- **Fields**: id, email, password_hash, name, title, phone, company, address, website, bio, avatar_url, role, is_verified, created_at, updated_at
- **Purpose**: Core user account and authentication

### 2. FizzCards
- **Fields**: id, user_id, display_name, title, company, phone, email, website, address, bio, avatar_url, theme_color, is_active, created_at, updated_at
- **Purpose**: Digital business card with rich profile information

### 3. SocialLinks
- **Fields**: id, fizzcard_id, platform (enum: linkedin, twitter, instagram, facebook, github, custom), url, created_at
- **Purpose**: Social media links associated with a FizzCard

### 4. ContactExchanges
- **Fields**: id, sender_id, receiver_id, method (enum: qr_code, nfc, direct_share), latitude, longitude, location_name, met_at, status (enum: pending, accepted, rejected), created_at, updated_at
- **Purpose**: Track contact exchanges with contextual data

### 5. Connections
- **Fields**: id, user_id, connected_user_id, exchange_id, relationship_note, tags, strength_score, created_at, updated_at
- **Purpose**: Verified bidirectional connections after acceptance

### 6. FizzCoinTransactions
- **Fields**: id, user_id, amount, transaction_type (enum: exchange, introduction, referral, bonus, trade), metadata, created_at
- **Purpose**: Track FizzCoin earnings and transfers

### 7. FizzCoinWallets
- **Fields**: id, user_id, balance, total_earned, total_spent, last_transaction_at, created_at, updated_at
- **Purpose**: User's FizzCoin balance and history

### 8. Introductions
- **Fields**: id, introducer_id, person_a_id, person_b_id, context, status (enum: pending, completed, declined), fizzcoin_reward, created_at, updated_at
- **Purpose**: Track introductions made by users (earns FizzCoins)

### 9. Events
- **Fields**: id, name, description, location, latitude, longitude, start_date, end_date, is_exclusive, min_fizzcoin_required, created_by, created_at, updated_at
- **Purpose**: Networking events (some exclusive for high FizzCoin holders)

### 10. EventAttendees
- **Fields**: id, event_id, user_id, check_in_at, created_at
- **Purpose**: Track event attendance

### 11. Badges
- **Fields**: id, user_id, badge_type (enum: super_connector, early_adopter, top_earner, event_host, verified), earned_at, created_at
- **Purpose**: Gamification badges

### 12. SearchHistory
- **Fields**: id, user_id, query, filters, created_at
- **Purpose**: Track user searches for network insights

## Key Features & User Flows

### 1. Onboarding Flow
**User Story**: As a new user, I want to quickly sign up and create my FizzCard so I can start networking.

**Steps**:
1. Sign up with email/password
2. Grant GPS location permission
3. Create FizzCard (name, title, company, phone, email, social links)
4. Optional: Upload avatar
5. See QR code immediately
6. Tutorial: "Scan someone's QR to earn your first FizzCoin!"

### 2. Contact Exchange Flow
**User Story**: As a user, I want to exchange contact info with someone I just met and have it automatically tagged with when/where we met.

**Steps**:
1. **Sharing Methods**:
   - Generate QR code from my FizzCard
   - Tap NFC (if supported)
   - Direct share link via SMS/email

2. **Receiving**:
   - Scan QR code / tap NFC / click link
   - Auto-capture GPS location + timestamp
   - Preview contact details
   - Send connection request

3. **Acceptance**:
   - Receiver gets notification
   - Accept/Reject connection
   - On accept: Both earn FizzCoins, contextual data saved
   - Connection appears in both networks

### 3. FizzCoin Reward System
**User Story**: As a user, I want to earn FizzCoins for building meaningful connections.

**Earning Mechanisms**:
- **New Contact Exchange**: +10 FizzCoins (both parties)
- **Verified Connection** (mutual accept): +25 FizzCoins (both parties)
- **Introduction** (connect two people): +50 FizzCoins
- **Referral** (invite new user who joins): +100 FizzCoins
- **Super-Connector Bonus**: 2x multiplier on all earnings
- **Event Check-in**: +20 FizzCoins

**FizzCoin Uses**:
- Unlock exclusive events (min FizzCoin threshold)
- Trade with other users (future feature)
- Premium profile features (future feature)

### 4. Super-Connector Discovery
**User Story**: As a user, I want to find influential networkers who can introduce me to the right people.

**Discovery Engine**:
- Algorithm based on:
  - Number of verified connections
  - Connection diversity (different industries/locations)
  - Introduction success rate
  - FizzCoin balance
  - Engagement frequency

- **Super-Connector Badge**: Top 10% users
- Display on leaderboard
- Searchable by skill tags, industry, location

### 5. Contextual Search & Filtering
**User Story**: As a user, I want to find "people I met in San Juan" or "contacts from September 2025."

**Search Capabilities**:
- Filter by city/location
- Filter by date range
- Filter by event
- Filter by tags
- Search by name, company, title
- Sort by connection strength, recent activity

### 6. Relationship Graph Navigation
**User Story**: As a user, I want to find the best path to reach someone through my network.

**Features**:
- Visual network graph (nodes = people, edges = connections)
- "Find path to..." feature
- Highlight mutual connections
- Suggest best introducer based on:
  - Relationship strength
  - Super-connector status
  - Shared context (met at same events)

### 7. Wallet & Leaderboard
**User Story**: As a user, I want to see my FizzCoin balance and compare my networking success.

**Wallet View**:
- Current balance
- Total earned
- Recent transactions
- Earnings breakdown by type

**Leaderboard**:
- Top 100 globally
- Filter by city/country
- Filter by time period (weekly, monthly, all-time)
- Badges displayed

### 8. Privacy & Consent Management
**User Story**: As a user, I want control over who sees my location and contact details.

**Settings**:
- Location sharing (always, only during exchange, never)
- Profile visibility (public, connections only, private)
- Data retention (keep location history, delete after X days)
- Block/report users
- Export my data

## Technical Considerations

### QR Code & NFC
- **Research needed**: Best libraries for React Native-style QR generation/scanning
- QR payload: Encrypted FizzCard ID + timestamp
- NFC: Use Web NFC API where supported

### Geolocation
- **Research needed**: Best geolocation library with reverse geocoding
- Capture: latitude, longitude, location_name (city)
- Privacy: Store hashed locations, allow user deletion

### Blockchain/FizzCoin
- **Research needed**: Lightweight blockchain/token solution (consider Ethereum Layer 2, Solana, or custom ledger)
- Requirements:
  - Fast transactions (sub-second)
  - Low/no gas fees
  - Auditable transaction history
  - Future tradability support

### Type Safety
- All schemas defined in Zod (schema.zod.ts)
- Auto-generate TypeScript types
- Drizzle ORM for database
- ts-rest for API contracts

### Real-time Features
- WebSocket for instant connection notifications
- Live leaderboard updates
- Push notifications for contact requests

### Mobile-First Design
- Progressive Web App (PWA)
- Responsive design (works on desktop too)
- Touch-optimized interactions
- Offline support for viewing saved contacts

## UI/UX Design Goals

### Design Principles
- **Vibrant & Rewarding**: Celebrate each connection
- **Dark Mode First**: Modern aesthetic with excellent contrast
- **Minimalistic**: Clean, uncluttered interface
- **Gamified**: Visual feedback for FizzCoin earnings
- **Fast**: Instant QR code generation, smooth animations

### Key Screens
1. **Home/Dashboard**: FizzCoin balance, recent connections, quick actions
2. **My FizzCard**: Editable profile, QR code generator
3. **Scanner**: QR/NFC reader with contextual info capture
4. **Connections**: Searchable/filterable contact list with context tags
5. **Network Graph**: Visual relationship map
6. **Wallet**: FizzCoin balance, transaction history
7. **Leaderboard**: Top connectors with badges
8. **Discovery**: Find super-connectors by skill/location
9. **Events**: Upcoming events, exclusive access
10. **Settings**: Privacy, notifications, profile management

### Color Palette (Dark Mode)
- Primary: Vibrant cyan/electric blue (#00D9FF)
- Accent: Neon purple (#B744FF)
- Background: Deep dark (#0A0A0F)
- Cards: Dark slate (#1A1A24)
- Text: White (#FFFFFF), gray (#A0A0B0)
- Success (FizzCoin): Gold (#FFD700)
- Borders: Subtle glow (#2A2A3A)

## Success Metrics

### MVP Must-Haves
- ✅ User authentication (signup, login, logout)
- ✅ Create/edit FizzCard
- ✅ QR code generation and scanning
- ✅ Contact exchange with GPS + timestamp
- ✅ Connection acceptance flow
- ✅ FizzCoin earning on verified connections
- ✅ Wallet view
- ✅ Basic leaderboard
- ✅ Search contacts by location/date

### Phase 2 (Post-MVP)
- NFC support
- Relationship graph visualization
- Introduction flow with rewards
- Exclusive events
- Advanced super-connector algorithm
- FizzCoin trading

## Database Relationships

```
users (1) → (many) fizzCards
fizzCards (1) → (many) socialLinks
users (1) → (many) contactExchanges (as sender)
users (1) → (many) contactExchanges (as receiver)
contactExchanges (1) → (1) connections (after acceptance)
users (1) → (many) connections
users (1) → (1) fizzCoinWallets
users (1) → (many) fizzCoinTransactions
users (1) → (many) introductions (as introducer)
users (1) → (many) badges
events (1) → (many) eventAttendees
users (1) → (many) eventAttendees
```

## Development Phases

### Phase 1: Foundation (Current)
- Schema design (all entities)
- API contracts
- Auth scaffolding (mock + Supabase ready)
- Storage scaffolding (memory + database ready)

### Phase 2: Core Features
- FizzCard CRUD
- QR code exchange
- Contact acceptance flow
- FizzCoin wallet + transactions
- Basic leaderboard

### Phase 3: Advanced Features
- Super-connector algorithm
- Network graph
- Introduction system
- Event management
- Advanced search

### Phase 4: Polish
- Animations and micro-interactions
- Push notifications
- PWA optimization
- Performance tuning

## Notes for Implementation

- **Mobile-first but web-based**: Use responsive design, not React Native
- **PWA**: Add manifest.json, service worker
- **Geolocation**: Request permission during onboarding
- **QR Library**: Research best option (qrcode.react, react-qr-code)
- **Blockchain**: Start with centralized ledger (FizzCoinTransactions table), plan for decentralization
- **Real-time**: WebSocket for notifications (consider Socket.io)
- **Image Upload**: Use Supabase Storage or Cloudinary for avatars
