# NaijaDomot Real Estate Marketplace - Complete Specification

## CRITICAL: Development Approach

**IMPORTANT: Mock-First Development Strategy**

1. **Phase 1: Full Functionality with Mock/Memory** (PRIORITY)
   - Build ALL features using mock authentication and in-memory storage
   - Focus on getting complete functionality working
   - Test all user flows, features, and integrations
   - Validate the entire application works end-to-end
   - Environment: `AUTH_MODE=mock`, `STORAGE_MODE=memory`

2. **Phase 2: Supabase Migration** (AFTER Phase 1 Complete)
   - Only migrate to Supabase AFTER all functionality is validated
   - Switch to real authentication
   - Migrate to PostgreSQL database
   - Re-test all features with production database
   - Environment: `AUTH_MODE=supabase`, `STORAGE_MODE=supabase`

**Why This Approach:**
- Faster iteration during development
- No wasted infrastructure for broken features
- Full offline testing capability
- Easy rollback if database issues occur
- Validate business logic before persistence layer

---

## CRITICAL: Research & Planning First

**MANDATORY: Use Research Agent for Unknown Elements**

Before implementation, use the research agent to investigate and plan:

1. **Map Integration Research**
   - Best practices for Google Maps / MapBox / OpenStreetMap integration
   - Street view implementation patterns
   - Property pin clustering for performance
   - Polygon search implementation (if feasible)
   - Geolocation accuracy for Nigerian cities (Lagos, Abuja, Port Harcourt)

2. **Media Optimization Research**
   - Best approaches for handling 10-20 photo uploads per listing
   - Video compression strategies or cloud storage integration
   - Image optimization for web performance
   - CDN integration patterns

3. **Analytics Dashboard Research**
   - Lightweight analytics approaches for MVP
   - Key metrics to track (views, engagement, inquiries)
   - Dashboard UI patterns for agents vs admin
   - Basic traffic source tracking

4. **Property Verification Workflow Research**
   - Document management patterns
   - Status workflow best practices (Verified/Unverified/Pending)
   - Field verifier assignment patterns

**Deliverable from Research:**
- Comprehensive implementation plan
- Technology choices with justification
- Architecture decisions documented
- Known challenges and mitigation strategies

---

## Project Overview

Build **NaijaDomot**, a modern real estate marketplace platform for Nigeria where users can rent, buy, or sell properties. The platform serves multiple user types (Buyers/Renters, Agents, Landlords, Admins) with distinct capabilities and dashboards.

---

## Core Features (Phase 1 - All with Mock/Memory)

### 1. User Authentication & Account System

**User Roles:**
- **Buyer/Renter**: Browse listings, save favorites, send inquiries
- **Agent**: Create and manage listings, track performance, respond to leads
- **Landlord**: Similar to Agent (property owner managing their own properties)
- **Admin**: Platform management, verification, analytics

**Authentication Requirements:**
- Email + password authentication
- **Multi-Factor Authentication (MFA)** for all accounts
- Google social authentication (optional, Phase 2)
- Role-based access control (RBAC)
- Password reset flow
- Email verification

**Mock Credentials (Phase 1):**
```
Buyer: buyer@naijadomot.ng / Demo2025_
Agent: agent@naijadomot.ng / Demo2025_
Landlord: landlord@naijadomot.ng / Demo2025_
Admin: admin@naijadomot.ng / Demo2025_
```

---

### 2. Property Listing Management

**Listing Creation (Agents/Landlords):**
- Property type selection (Apartment, House, Land, Commercial, etc.)
- Location details with geolocation (interactive map pin)
- Pricing (rent/sale price, payment frequency)
- Property details:
  - Bedrooms, bathrooms, square footage
  - Amenities (parking, pool, security, generator, etc.)
  - Description (rich text)
  - Availability status
- **Photo uploads (10-20 images)**:
  - Auto-optimization for web (resize, compress)
  - Thumbnail generation
  - Primary photo selection
- **Video uploads**:
  - Compressed video support OR
  - Cloud storage links (YouTube, Vimeo, etc.)
- Property verification status (Verified, Unverified, Pending Inspection)

**Listing Management Dashboard:**
- View all listings (table + card views)
- Edit/update listings
- Deactivate/reactivate listings
- Track performance metrics:
  - Total views
  - Unique visitors
  - Inquiry count
  - Save count
- Listing status indicators

---

### 3. Property Discovery & Search

**Browse Interface:**
- Card-based listing grid (responsive)
- List view option
- Pagination or infinite scroll

**Filters:**
- Location (city, neighborhood, address search)
- Price range (min/max)
- Property type
- Bedrooms/bathrooms
- Amenities (checkboxes)
- Verification status filter (Verified only / All)
- Listing type (Rent / Sale / Both)

**Property Detail Page:**
- Photo gallery with lightbox
- Video player (embedded or link)
- Property details and description
- Interactive map showing exact location
- Street view integration (if available via Google Maps)
- Agent/Landlord contact card
- "Save listing" button
- "Send inquiry" button
- Similar properties section

---

### 4. Interactive Map Integration

**Map Features:**
- Property pins showing all active listings
- Cluster markers for nearby properties
- Click pin to see property preview card
- "View on map" button from search results
- Zoom controls and map type selection
- **Target Cities**: Lagos, Abuja, Port Harcourt (expandable)

**Street View Integration:**
- Google Maps Street View (if API allows)
- Fallback to static map if street view unavailable

**Polygon Search (Optional/Phase 2):**
- Draw polygon on map to search within area
- May require advanced map library research

**Geolocation:**
- Accurate address → lat/long conversion
- Reverse geocoding for pin placement
- Location autocomplete during listing creation

---

### 5. Analytics Dashboard

**Agent/Landlord Analytics:**
- Total listings count
- Total views (all time, last 30 days)
- Total inquiries received
- Top performing listings
- Engagement rate chart
- Recent activity feed

**Admin Analytics Dashboard:**
- **Platform Overview:**
  - Total listings (overall, new today, new this week)
  - Verified vs Unverified ratio (pie chart)
  - User growth (line chart)
  - Regional activity (map heatmap or bar chart)
- **Listing Metrics:**
  - Listings by city/region
  - Listings by property type
  - Average price by type
- **User Metrics:**
  - New users (daily/weekly)
  - Active agents
  - User role distribution
- **Traffic Sources (Basic):**
  - Direct, referral, social (simple counters)
  - Most viewed listings

**Analytics Implementation:**
- Store view/inquiry events in database
- Aggregate data for dashboard display
- Use charting library (Chart.js, Recharts, or similar)
- Real-time updates not required (daily refresh acceptable)

---

### 6. Property Verification Workflow

**Admin Verification Interface:**
- **Listings Queue:**
  - View all unverified listings
  - Filter by status (Pending, Unverified, Verified)
  - Sort by date submitted
- **Verification Actions:**
  - Change status: Verified, Unverified, Pending Inspection
  - Upload verification documents (PDF, images)
  - Add verification notes
  - Assign to field verifier (manual dropdown selection for MVP)
- **Verification History:**
  - Track who verified each listing
  - Timestamp of verification
  - Verification documents stored

**Agent View:**
- See verification status badge on each listing
- Receive notification when status changes (optional)
- Upload requested documents for verification

**Verified Badge:**
- Display "Verified" badge on verified listings
- Highlight verified listings in search results
- Filter for verified-only properties

---

### 7. Inquiry & Lead Management

**Buyer/Renter Inquiry Flow:**
- "Send Inquiry" button on property detail page
- Inquiry form:
  - Pre-filled property details
  - Message text area
  - Contact info (name, email, phone)
  - Preferred contact method
- Inquiry confirmation message
- Save listing to favorites (heart icon)

**Agent/Landlord Lead Management:**
- **Inbox/Leads Dashboard:**
  - New inquiries count (badge notification)
  - List of all inquiries (newest first)
  - Mark as read/unread
  - Reply via email or phone
  - Filter by property, date, status
- **Inquiry Details:**
  - User contact info
  - Message content
  - Property details linked
  - Mark as "Contacted", "Interested", "Closed"

**Admin Lead Overview:**
- Total inquiries across platform
- Inquiries by property
- Agent response rate (optional metric)

---

### 8. User Interface Requirements

**Design Principles:**
- **Mobile-First Responsive Design**
  - Works perfectly on 375px+ screens
  - Touch-friendly buttons (min 44px)
  - Collapsible navigation on mobile
- **Fast Load Times:**
  - Optimized images (WebP format, lazy loading)
  - Code splitting
  - Minimal JavaScript bundle
- **SEO-Optimized:**
  - Server-side rendering (SSR) with Next.js
  - Meta tags for each property listing
  - Structured data (JSON-LD) for properties
  - Clean URLs (/properties/lagos/apartment-in-lekki-123)
- **Clean, Modern UI:**
  - Professional color scheme (blues, greens, or neutral tones)
  - Clear typography (readable fonts)
  - Consistent spacing and layout
  - Loading states for async operations
  - Error handling with user-friendly messages

**Tech Stack (Frontend):**
- Next.js 14+ (App Router for SSR)
- React 18
- TypeScript
- Tailwind CSS + shadcn/ui components
- TanStack Query for data fetching
- Wouter or Next.js routing

---

### 9. Backend Architecture

**Tech Stack (Backend):**
- **Runtime**: Node.js
- **Framework**: Express + TypeScript
- **Database**: PostgreSQL (via Supabase in Phase 2)
- **ORM**: Drizzle ORM
- **API Design**: RESTful with ts-rest contracts
- **File Storage**: AWS S3 / Cloudinary (Phase 2) or local for mock
- **Authentication**: JWT + bcrypt (mock in Phase 1)

**API Endpoints (Planned):**
- **Auth**: /api/auth/login, /api/auth/signup, /api/auth/logout, /api/auth/verify-email, /api/auth/mfa
- **Listings**: /api/listings (GET, POST), /api/listings/:id (GET, PUT, DELETE)
- **Media**: /api/listings/:id/photos, /api/listings/:id/videos
- **Inquiries**: /api/inquiries (GET, POST), /api/inquiries/:id (GET, PUT)
- **Analytics**: /api/analytics/agent/:id, /api/analytics/admin
- **Verification**: /api/admin/verify/:listingId, /api/admin/verifications
- **Users**: /api/users/me, /api/users/:id (admin only)

**Security:**
- Password hashing (bcrypt)
- JWT token-based authentication
- Role-based middleware for protected routes
- Input validation with Zod
- SQL injection prevention (parameterized queries via Drizzle)
- Rate limiting on auth endpoints
- CORS configuration
- Helmet.js for security headers

**Scalability Considerations:**
- Database indexing (location, price, property type)
- Pagination for listings
- Caching strategy (Redis optional for Phase 2)
- Image optimization pipeline
- CDN for static assets (Phase 2)

---

### 10. Database Schema (High-Level)

**Tables:**
1. **users**
   - id, email, password_hash, role, name, phone, mfa_enabled, mfa_secret, email_verified, created_at, updated_at

2. **listings**
   - id, user_id (agent/landlord), title, description, property_type, listing_type (rent/sale), price, bedrooms, bathrooms, square_footage, location_address, location_city, location_state, latitude, longitude, amenities (JSON), verification_status, created_at, updated_at, views_count, inquiries_count

3. **listing_photos**
   - id, listing_id, url, is_primary, order, created_at

4. **listing_videos**
   - id, listing_id, url, type (upload/link), created_at

5. **inquiries**
   - id, listing_id, user_id (buyer), agent_id, message, contact_email, contact_phone, status (new/contacted/closed), created_at, updated_at

6. **verification_documents**
   - id, listing_id, document_url, uploaded_by (admin), notes, created_at

7. **favorites**
   - id, user_id, listing_id, created_at

8. **analytics_events** (optional for tracking)
   - id, listing_id, event_type (view/inquiry/save), user_id, ip_address, timestamp

---

## Development Phases

### **Phase 1: Mock/Memory Development (COMPLETE THIS FIRST)**

**Goal**: Get ALL functionality working with mock auth and in-memory storage.

**Deliverables:**
1. ✅ Complete authentication system (mock mode)
2. ✅ Full listing CRUD with photo/video uploads (mock storage)
3. ✅ Property search and filtering
4. ✅ Interactive map with property pins
5. ✅ Analytics dashboards (agent + admin)
6. ✅ Verification workflow (admin interface)
7. ✅ Inquiry/lead management system
8. ✅ Mobile-responsive UI
9. ✅ All user flows tested end-to-end

**Testing:**
- Use Chrome DevTools to verify all pages render
- Test all CRUD operations
- Verify role-based access control
- Test map interactions
- Validate analytics calculations
- Test inquiry flow from buyer to agent

**Environment:**
```bash
AUTH_MODE=mock
STORAGE_MODE=memory
PORT=5000
```

---

### **Phase 2: Supabase Migration (ONLY AFTER Phase 1 COMPLETE)**

**Goal**: Migrate to production-ready database and authentication.

**Migration Steps:**
1. ✅ Create Supabase project
2. ✅ Push database schema via Drizzle
3. ✅ Configure Supabase authentication adapters
4. ✅ Migrate to Supabase storage for media
5. ✅ Switch environment to `AUTH_MODE=supabase`, `STORAGE_MODE=supabase`
6. ✅ Re-run all tests with real database
7. ✅ Verify data persistence across server restarts

**New Environment:**
```bash
AUTH_MODE=supabase
STORAGE_MODE=supabase
DATABASE_URL=postgresql://...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

---

## Required Skills (For Reference)

- Full-stack TypeScript development
- React/Next.js expertise
- Node.js/Express backend
- PostgreSQL database design
- Map API integration (Google Maps/MapBox)
- Cloud deployment (AWS/DigitalOcean/Render)
- RESTful API design
- File upload handling
- Authentication & authorization
- Analytics implementation

---

## Success Criteria

**Phase 1 Complete When:**
- ✅ All user roles can log in (mock credentials)
- ✅ Agents can create listings with photos/videos
- ✅ Buyers can search, filter, and view properties
- ✅ Map displays all listings with pins
- ✅ Analytics dashboards show correct data
- ✅ Admin can verify listings
- ✅ Inquiry system works end-to-end
- ✅ UI is mobile-responsive and fast
- ✅ No console errors in browser
- ✅ All quality checks pass

**Phase 2 Complete When:**
- ✅ All Phase 1 features work with Supabase
- ✅ Data persists across server restarts
- ✅ Real authentication with email verification
- ✅ Media files stored in cloud (S3/Cloudinary)
- ✅ Production deployment successful

---

## Final Deliverables

1. **Fully Functional Marketplace MVP**
   - Complete source code (frontend + backend)
   - All features implemented and tested

2. **Admin Dashboard**
   - Analytics overview
   - Verification management
   - User management

3. **Agent Dashboard**
   - Listing management
   - Lead tracking
   - Performance analytics

4. **Deployment**
   - Hosted on cloud platform (Fly.io, Render, or DigitalOcean)
   - Environment variables configured
   - Database migrations applied

5. **Documentation**
   - API documentation
   - Environment setup instructions
   - Deployment guide
   - User role guide

6. **Testing & Quality**
   - All CRUD operations validated
   - Browser testing complete (Chrome DevTools)
   - Mobile responsiveness verified
   - SEO optimization confirmed

---

## Important Notes

1. **Research First**: Use research agent to investigate map APIs, media handling, and analytics before implementation
2. **Mock-First**: Build and validate ALL features with mock/memory before migrating to Supabase
3. **Iterative Development**: Build one feature at a time, test thoroughly, then move to next
4. **Quality Checks**: Use quality_assurer agent after each major feature
5. **Visual Validation**: Always take screenshots to verify UI renders correctly
6. **Nigerian Market**: Consider Nigerian property market specifics (pricing in Naira, local amenities, etc.)

---

## Future Enhancements (Post-MVP)

- Mobile app (React Native or Flutter)
- Advanced map features (polygon search, heatmaps)
- Payment integration (escrow, booking fees)
- Virtual tours (360° photos, 3D walkthroughs)
- AI-powered property recommendations
- Chat system (real-time messaging)
- Property comparison tool
- Mortgage calculator
- Neighborhood insights (schools, transport, safety)

---

**END OF SPECIFICATION**
