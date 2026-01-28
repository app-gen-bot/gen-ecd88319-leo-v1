# HotelIQ - Intelligent Multi-Tenant Hotel Management Platform

## Overview
HotelIQ is a secure, scalable, multi-tenant Hotel Management SaaS platform designed to serve hotels of all sizes. Each hotel receives an isolated tenant environment with comprehensive features for property management, reservations, inventory control, housekeeping, revenue management, and guest engagement. The platform combines operational efficiency with data-driven insights to help hoteliers maximize revenue and deliver exceptional guest experiences.

**Brand Identity**: "HotelIQ" - Intelligence that elevates hospitality
**Tagline**: "Smarter Stays, Seamless Operations"

## Multi-Tenant Architecture

### Tenant Isolation
- **Complete Data Isolation**: Each hotel's data is completely separated using application-level security (tenant_id filtering in all queries via Drizzle ORM)
- **Custom Subdomain Support**: Each hotel gets `{hotel-slug}.hoteliq.app` or custom domain
- **Tenant-Specific Configuration**: Branding, policies, rate rules per tenant
- **Resource Quotas**: Storage, API calls, user limits based on subscription tier

### Tenant Onboarding
- Self-service hotel registration with guided setup wizard
- Property configuration (rooms, rates, amenities, policies)
- Staff invitation and role assignment
- PMS data import from common systems (Opera, Cloudbeds, etc.)

## Core Features

### 1. Property Management System (PMS)

#### Room Management
- **Room Inventory**
  - Room types (Standard, Deluxe, Suite, etc.)
  - Room numbering and floor mapping
  - Amenities per room type
  - Bed configurations
  - Accessibility features
  - Connecting rooms support

- **Room Status Dashboard**
  - Real-time status: Available, Occupied, Dirty, Clean, Out of Order, Due Out
  - Housekeeping integration
  - Maintenance tracking
  - Color-coded visual grid view
  - Quick status updates

#### Reservation Management
- **Booking Engine**
  - Direct bookings with real-time availability
  - Rate plans and pricing rules
  - Package deals and add-ons
  - Group reservations
  - Corporate rates and negotiated contracts
  - Promo codes and discounts

- **Reservation Lifecycle**
  - Create, modify, cancel reservations
  - Waitlist management
  - Overbooking controls
  - No-show handling
  - Early check-in / late check-out
  - Room assignments and moves

- **Guest Profiles**
  - Contact information
  - Preferences and special requests
  - Stay history
  - VIP/loyalty status
  - Notes and alerts
  - GDPR-compliant data handling

### 2. Front Desk Operations

#### Check-in / Check-out
- **Streamlined Check-in**
  - Guest arrival list
  - ID verification workflow
  - Digital registration cards
  - Room key assignment
  - Deposit/payment processing
  - Welcome message customization

- **Express Checkout**
  - Mobile checkout
  - Automated folio delivery
  - Late checkout requests
  - Express key drop

#### Folio Management
- **Guest Billing**
  - Room charges
  - Incidental charges (minibar, room service, spa)
  - Tax calculations
  - Payment processing (Stripe)
  - Split billing
  - Invoice generation
  - Refunds and adjustments

### 3. Housekeeping Management

#### Task Assignment
- **Work Orders**
  - Automated room assignment based on checkout
  - Priority queue (VIP, early check-in, deep clean)
  - Time tracking per room
  - Supply requests
  - Maintenance escalation

- **Mobile App Interface**
  - Room status updates from mobile
  - Photo documentation
  - Lost and found reporting
  - Minibar consumption tracking

#### Inspection Workflow
- Supervisor inspection checklists
- Quality scoring
- Issue flagging
- Performance metrics per housekeeper

### 4. Inventory & Procurement

#### Consumables Tracking
- **Categories**
  - Guest amenities (toiletries, coffee, etc.)
  - Linens and towels
  - Cleaning supplies
  - Office supplies
  - F&B inventory (if applicable)

- **Stock Management**
  - Par levels and reorder points
  - Automated low-stock alerts
  - Consumption tracking
  - Waste reporting
  - Cost per occupied room metrics

#### Vendor Management
- Preferred vendor list
- Purchase orders
- Receiving and reconciliation
- Invoice matching
- Vendor performance tracking

### 5. Revenue Management

#### Dynamic Pricing
- **Rate Engine**
  - Base rates by room type
  - Seasonal adjustments
  - Day-of-week variations
  - Length-of-stay pricing
  - Occupancy-based pricing
  - Competitor rate monitoring (manual input)

- **Yield Management**
  - Occupancy forecasting
  - RevPAR tracking
  - ADR (Average Daily Rate) analytics
  - Demand calendar
  - Blackout dates

#### Reporting & Analytics
- **Financial Reports**
  - Daily revenue summary
  - Room revenue by type
  - Ancillary revenue breakdown
  - Tax reports
  - Accounts receivable aging

- **Operational Reports**
  - Occupancy trends
  - Guest demographics
  - Source of business
  - Cancellation analysis
  - No-show patterns

### 6. Guest Engagement

#### Pre-Arrival
- **Automated Communications**
  - Booking confirmation
  - Pre-arrival survey (preferences, arrival time)
  - Upsell opportunities (room upgrades, packages)
  - Local recommendations

#### During Stay
- **In-Stay Services**
  - Service requests via app/web
  - Feedback collection
  - Concierge requests
  - Issue resolution tracking

#### Post-Stay
- **Guest Feedback**
  - Automated review request
  - NPS surveys
  - Issue follow-up
  - Thank you messages
  - Loyalty program enrollment

### 7. Staff Management

#### User Roles & Permissions
- **Role Types**
  - Hotel Owner/GM: Full access
  - Front Desk Manager: Reservations, check-in, billing
  - Front Desk Agent: Limited reservation and check-in
  - Housekeeping Manager: Room status, staff assignment
  - Housekeeper: Room status updates only
  - Accounting: Financial reports, billing
  - Maintenance: Work orders only

- **Access Control**
  - Role-based permissions
  - Shift-based access restrictions
  - Audit logging
  - Two-factor authentication option

#### Staff Scheduling
- Shift management
- Time tracking
- Overtime alerts
- Department coverage

### 8. Channel Manager Integration (Future)

#### OTA Connectivity
- Structure for future integration with:
  - Booking.com
  - Expedia
  - Airbnb
  - Agoda
- Rate parity management
- Inventory sync
- Booking retrieval

### 9. Multi-Property Support (Enterprise)

#### Portfolio Management
- **Central Dashboard**
  - KPIs across all properties
  - Consolidated reporting
  - Cross-property analytics
  - Best practice sharing

- **Brand Standards**
  - Template management
  - Policy enforcement
  - Training materials
  - Quality audits

## Technical Requirements

### Database Schema (Supabase)

#### Tenant & Organization
- **tenants** - Hotel organizations (tenant_id is the isolation key)
- **tenant_settings** - Configuration per tenant
- **tenant_subscriptions** - Subscription tier and limits

#### Users & Access
- **users** - All platform users (linked to Supabase Auth)
- **staff_profiles** - Hotel staff with tenant association
- **roles** - Permission templates
- **user_roles** - User-role assignments

#### Property
- **properties** - Individual hotel properties per tenant
- **room_types** - Room category definitions
- **rooms** - Individual room inventory
- **amenities** - Room and property amenities
- **rate_plans** - Pricing configurations

#### Reservations
- **reservations** - Booking records
- **reservation_rooms** - Room assignments per reservation
- **guests** - Guest profiles
- **guest_preferences** - Stored preferences

#### Operations
- **room_status** - Current status per room
- **housekeeping_tasks** - Cleaning assignments
- **maintenance_requests** - Repair tickets
- **lost_and_found** - Lost items tracking

#### Billing
- **folios** - Guest bills
- **folio_items** - Line items (charges, payments)
- **invoices** - Generated invoices
- **payments** - Payment transactions (Stripe)

#### Inventory
- **inventory_items** - Stock items
- **inventory_transactions** - Stock movements
- **purchase_orders** - PO management
- **vendors** - Supplier information

#### Engagement
- **communications** - Email/SMS logs
- **feedback** - Guest reviews and surveys
- **service_requests** - Guest requests during stay

#### Analytics
- **daily_stats** - Aggregated daily metrics
- **revenue_snapshots** - Financial summaries

### Authentication & Authorization
- **Supabase Auth** for production authentication (follows standard pipeline flow)
- **Application-level security** with tenant_id filtering in ALL Drizzle ORM queries (NOT RLS)
- Role-based access control within each tenant
- Multi-factor authentication for admin roles

### API Structure
- RESTful API with ts-rest contracts
- `/api/auth/*` - Authentication endpoints
- `/api/tenants/*` - Tenant management
- `/api/properties/*` - Property configuration
- `/api/rooms/*` - Room management
- `/api/reservations/*` - Booking operations
- `/api/guests/*` - Guest profiles
- `/api/housekeeping/*` - Housekeeping operations
- `/api/inventory/*` - Stock management
- `/api/billing/*` - Folio and payments
- `/api/reports/*` - Analytics and reports
- `/api/staff/*` - Staff management
- `/api/settings/*` - Tenant configuration

### Frontend Pages

#### Public Pages
- `/` - Marketing landing page
- `/pricing` - Subscription tiers
- `/demo` - Request demo form
- `/login` - Authentication
- `/register` - Hotel registration wizard
- `/forgot-password` - Password recovery

#### Dashboard (Authenticated)
- `/dashboard` - Overview with key metrics
- `/tape-chart` - Visual room grid (7-day view)
- `/arrivals` - Today's arrivals list
- `/departures` - Today's departures list
- `/in-house` - Current guests

#### Reservations
- `/reservations` - Reservation list with search/filter
- `/reservations/new` - Create reservation
- `/reservations/:id` - Reservation details
- `/reservations/:id/folio` - Guest bill
- `/calendar` - Availability calendar

#### Rooms & Housekeeping
- `/rooms` - Room inventory management
- `/rooms/:id` - Room details
- `/housekeeping` - Housekeeping dashboard
- `/housekeeping/tasks` - Task list
- `/maintenance` - Maintenance requests

#### Guests
- `/guests` - Guest database
- `/guests/:id` - Guest profile
- `/guests/:id/history` - Stay history

#### Inventory
- `/inventory` - Stock levels
- `/inventory/orders` - Purchase orders
- `/inventory/vendors` - Vendor management

#### Reports & Analytics
- `/reports` - Report selection
- `/reports/occupancy` - Occupancy analysis
- `/reports/revenue` - Revenue reports
- `/reports/housekeeping` - Staff performance
- `/reports/forecast` - Demand forecasting

#### Settings
- `/settings/property` - Property configuration
- `/settings/room-types` - Room type setup
- `/settings/rates` - Rate plan management
- `/settings/staff` - Staff management
- `/settings/integrations` - Third-party connections
- `/settings/billing` - Subscription management

## UI/UX Requirements

### Design System
- Modern, professional hospitality aesthetic
- **Brand Colors**:
  - Primary: Deep navy blue (represents trust and professionalism)
  - Accent: Warm gold/amber (represents hospitality and warmth)
  - Secondary: Soft teal (represents cleanliness and calm)
  - Semantic: Success green, warning amber, error red
- Dark mode support (default for night shift operations)
- Responsive design (tablet-first for front desk operations)
- Accessible (WCAG 2.1 AA compliance)
- Shadcn/ui component library
- Tailwind CSS for styling

### Branding
- Logo: Stylized "IQ" with hotel building silhouette
- Footer: "Powered by HotelIQ" on all pages
- Loading states: "HotelIQ is processing..." with progress indicator
- Empty states: Contextual calls-to-action

### Key Interactions
- **Tape Chart**
  - Drag-and-drop room moves
  - Click to create reservation
  - Color-coded by status
  - Hover for guest details

- **Quick Actions**
  - Check-in button on arrival cards
  - One-click room status update
  - Rapid charge entry
  - Mobile-optimized workflows

### Performance
- Dashboard loads in < 2 seconds
- Real-time updates via WebSocket for room status
- Offline capability for critical functions
- Lazy loading for large datasets

## Security & Compliance

### Data Protection
- Tenant data isolation via application-level security (Drizzle ORM queries with tenant_id filtering)
- PCI DSS compliance for payment handling
- GDPR-compliant guest data handling
- Data encryption at rest and in transit
- Regular security audits

### Audit Trail
- All data changes logged
- User action tracking
- Login history
- Permission changes

## Development Notes

### CRITICAL: Follow Pipeline Order
**The pipeline-prompt.md defines the MANDATORY order of operations. DO NOT deviate.**

Pipeline order for backend:
1. **FIRST**: Create `shared/schema.zod.ts` (foundation - no dependencies)
2. **SECOND**: Create `shared/schema.ts` (Drizzle schema, imports from schema.zod.ts)
3. **THIRD**: Create `shared/contracts/*.contract.ts` (imports from schema.zod.ts)
4. **FOURTH**: Provision Supabase using `mcp__supabase_setup__create_supabase_project`
5. **THEN**: Create server files (db.ts, auth, storage, routes)

### Reference Implementation
If you encounter errors or issues during development, look at the **matchmind** app implementation for guidance:
- Located at: `apps/matchmind/app/`
- Reference for: Supabase setup, auth patterns, /api routing, storage patterns
- Especially check matchmind for any confusion about `/api` prefix usage

### Database & Storage Configuration
- **STORAGE_MODE=database**: Uses Drizzle ORM with Supabase pooler connection (NOT 'supabase')
- **Application-level security**: Filter ALL queries by tenant_id in Drizzle ORM (NOT RLS)
- Supabase is provisioned AFTER schema files are created (needs schema SQL)

### Supabase Configuration
- Provision Supabase project using MCP tool AFTER schema.zod.ts exists
- The MCP tool generates SQL migrations from your schema
- Set up storage buckets for documents and images
- Configure auth providers (email/password minimum)

### API Path Convention
- All API routes should NOT have `/api` prefix in contracts
- The `/api` prefix is added at the Express router mount level
- See matchmind implementation for the correct pattern
- Server mounts routes at `/api` path

### Email Service Implementation
- Create `server/lib/email/resend-service.ts` for email abstraction
- Implement methods: `sendConfirmation()`, `sendPreArrival()`, `sendFolio()`, etc.
- Use HTML email templates with hotel branding
- Handle Resend API errors gracefully

### Third-Party Integrations
- **Stripe** - For subscription billing and guest payments
- **Resend** - For transactional emails
- Set up integration structure, keys will be provided

### Multi-Tenant Best Practices
- Always filter queries by tenant_id in Drizzle ORM queries
- Use application-level security (NOT RLS) - filter in every query
- Never expose tenant_id in URLs (use slug instead)
- Validate tenant context on every API request

## Environment Variables Required

### Already Configured
```env
# Email Service (from existing apps)
RESEND_API_KEY=re_LX2tSg9r_Dd4EwvA9BYH2MW3SLXq7f8eC
FROM_EMAIL=hello@leodavinci.ai

# Authentication & Storage (set after Supabase provisioning)
AUTH_MODE=supabase
STORAGE_MODE=database  # Drizzle ORM with pooler (NOT 'supabase')
```

### Supabase (Will be provisioned)
```env
SUPABASE_URL=<will be provisioned>
SUPABASE_ANON_KEY=<will be provisioned>
SUPABASE_SERVICE_ROLE_KEY=<will be provisioned>
```

### To Be Provided Later
```env
# Stripe (set up integration structure now)
STRIPE_SECRET_KEY=<will be provided>
STRIPE_WEBHOOK_SECRET=<will be provided>
```

## Success Metrics
- Reservation creation time < 30 seconds
- Check-in workflow < 60 seconds
- Dashboard load time < 2 seconds
- Room status sync < 5 seconds
- 99.9% uptime SLA
- Tenant data isolation verified

## Application Metadata

**Application Name**: HotelIQ
**Tagline**: Smarter Stays, Seamless Operations
**Domain**: Multi-Tenant Hotel Property Management
**Technology**: Full-stack TypeScript with Supabase backend
**Target Users**:
- Independent Hotels: Small to medium properties seeking modern PMS
- Hotel Groups: Multi-property portfolios needing centralized management
- Boutique Hotels: Unique properties wanting customizable operations
- Staff: Front desk, housekeeping, management, accounting roles
