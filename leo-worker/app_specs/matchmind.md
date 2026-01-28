# MatchMind - AI-Powered B2B Vendor Matching Platform

## Overview
MatchMind is an intelligent B2B marketplace that uses AI to connect buyers with the perfect vendors based on detailed program requirements and scenarios. The platform trains AI on vendor program details and intelligently matches buyer queries to the most suitable vendors through conversational analysis.

**Brand Identity**: "MatchMind" - The intelligent mind that creates perfect vendor matches
**Tagline**: "Where AI Meets Perfect Matches"

## Core Features

### 1. AI-Powered Vendor Matching
- **Intelligent Query System**
  - Buyers input scenarios describing their needs
  - AI analyzes the scenario and asks clarifying questions if needed
  - AI matches buyer requirements against trained vendor program data
  - Results show ranked vendor matches with relevance explanations and confidence scores

- **Training & Knowledge Base**
  - Admin interface to train AI on vendor programs and requirements
  - Support for uploading vendor program documentation
  - Continuous learning from query patterns and results
  - Version control for AI training data updates

### 2. User Management

#### Buyers
- **Registration & Authentication**
  - Optional registration (guest searches allowed)
  - Email/password authentication via Supabase
  - Profile management (company details, industry, preferences)

- **Query History**
  - Registered buyers can view all past queries
  - Access to previous AI responses and vendor matches
  - Ability to save favorite searches
  - Export query history to CSV/PDF

#### Vendors
- **Dashboard Access**
  - View all queries where their programs matched
  - See buyer information (anonymized until permission granted)
  - Filter matches by date, relevance score, industry
  - Analytics on match frequency and query patterns

- **Webhook Integration**
  - Vendors can configure webhook URLs
  - Automatic push of buyer data to vendor CRMs
  - Support for common CRM formats (Salesforce, HubSpot, etc.)
  - Webhook event logs and retry mechanisms

#### Admins
- **Complete System Management**
  - User management (buyers and vendors)
  - Manual user creation and role assignment
  - Update contact details and account status
  - Deactivate/reactivate accounts

### 3. AI Training Interface (Admin)
- **Program Management**
  - Create/update vendor program profiles
  - Upload and parse program documentation (PDF, Word, etc.)
  - Define matching criteria and requirements
  - Set program visibility and availability

- **Training Dashboard**
  - Visual interface for AI model training
  - Review and approve training data
  - Monitor AI matching accuracy
  - A/B test different matching algorithms

### 4. Billing System
- **Stripe Integration**
  - Subscription management for vendors
  - Tiered pricing based on match volume
  - Usage-based billing for premium features
  - **Note**: Set up the integration structure now, API keys will be provided later

- **Billing Admin**
  - Automated recurring billing
  - Manual invoice generation
  - Payment history and reporting
  - Failed payment handling and retry logic
  - Proration for plan changes

### 5. Support Ticket System
- **In-App Support**
  - Ticket creation from any page
  - File attachment support
  - Real-time status updates
  - Email notifications for ticket updates (via Resend)

- **Admin Support Dashboard**
  - Ticket queue management
  - Assignment to support staff
  - Canned responses library
  - SLA tracking and reporting

### 6. Email Notifications (Resend)
All transactional emails should use Resend API:
- **Buyer Emails**
  - Query result notifications with matched vendors
  - Account registration/verification
  - Password reset
  - Weekly digest of saved searches

- **Vendor Emails**
  - New match notifications
  - Webhook delivery failure alerts
  - Subscription and billing updates

- **Admin Emails**
  - New support ticket alerts
  - System health notifications
  - Failed payment alerts

## Technical Requirements

### Database Schema (Supabase)
- **users** - Authentication and basic profile
- **buyer_profiles** - Extended buyer information
- **vendor_profiles** - Extended vendor information and webhooks
- **vendor_programs** - Detailed program information for AI training
- **queries** - Buyer search queries and AI responses
- **matches** - Query-to-vendor matches with relevance scores
- **webhooks** - Vendor webhook configurations
- **webhook_events** - Webhook delivery logs
- **subscriptions** - Stripe subscription data
- **invoices** - Billing records
- **support_tickets** - Support ticket system
- **ticket_messages** - Ticket conversation threads
- **ai_training_data** - Data used to train the AI model

### Authentication & Authorization
- **Supabase Auth** for all authentication
- Row Level Security (RLS) for data protection
- Role-based access control:
  - Guest (read-only queries, no history)
  - Buyer (queries + history)
  - Vendor (dashboard + webhooks)
  - Admin (full system access)

### AI Integration
- **Anthropic Claude** for query processing and intelligent matching
- Use Claude Sonnet for conversational AI and vendor matching
- Vector embeddings for program similarity matching
- Conversational AI for clarifying questions
- Confidence scores for match quality

**API Configuration:**
```env
ANTHROPIC_API_KEY=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
```

### API Structure
- RESTful API with ts-rest contracts
- `/api/auth/*` - Authentication endpoints
- `/api/queries/*` - Query submission and retrieval
- `/api/vendors/*` - Vendor management and webhooks
- `/api/admin/*` - Administrative functions
- `/api/billing/*` - Stripe integration endpoints
- `/api/support/*` - Support ticket system

### Frontend Pages

#### Public/Buyer Pages
- `/` - Landing page with hero "Ask MatchMind anything about vendors"
- `/search` - Conversational AI search interface with progressive clarifying questions
- `/results` - Query results with intelligent match explanations and confidence scores
- `/history` - Query history dashboard with saved searches (registered users only)
- `/register` - Buyer registration with value proposition
- `/login` - Authentication
- `/about` - About MatchMind AI matching technology

#### Vendor Portal
- `/vendor/dashboard` - Match analytics and insights
- `/vendor/matches` - List of buyer matches
- `/vendor/webhooks` - Webhook configuration
- `/vendor/settings` - Profile and preferences

#### Admin Portal
- `/admin/dashboard` - System overview and metrics
- `/admin/users` - User management
- `/admin/vendors` - Vendor management
- `/admin/ai-training` - AI training interface
- `/admin/billing` - Billing administration
- `/admin/support` - Support ticket management

## UI/UX Requirements

### Design System
- Modern, professional B2B aesthetic with "intelligent" visual language
- **Brand Colors**:
  - Primary: Deep purple/indigo (represents intelligence and trust)
  - Accent: Bright cyan/teal (represents connections and insights)
  - Semantic: Success green, warning amber, error red
- Dark mode support throughout (default)
- Responsive design (mobile-first)
- Accessible (WCAG 2.1 AA compliance)
- Shadcn/ui component library
- Tailwind CSS for styling

### Branding
- Logo: Brain/neural network icon with "MatchMind" wordmark
- Footer: Include "Powered by MatchMind AI" on all public pages
- Loading states: "MatchMind is thinking..." with animated brain/pulse icon
- Empty states: Encourage users with "Ask MatchMind anything about vendors"

### Key Interactions
- **Search Flow**
  - Conversational AI interface with "MatchMind is thinking..." loading state
  - Progressive disclosure of results with confidence scores
  - Real-time match scoring visualization
  - Filter and sort results by relevance, industry, program type
  - Clarifying questions appear as cards: "To help me find better matches, can you tell me..."

- **Admin Training**
  - Drag-and-drop document upload
  - Rich text editor for program details
  - Preview matching behavior
  - Bulk operations support

### Performance
- Query results in < 3 seconds
- Real-time webhook delivery
- Optimistic UI updates
- Lazy loading for large lists

## Security & Privacy

### Data Protection
- Buyer information anonymized in vendor dashboard
- Explicit consent for data sharing
- GDPR compliance for data export/deletion
- Encrypted data at rest and in transit

### Webhook Security
- HMAC signature verification
- IP whitelisting support
- Rate limiting per vendor
- Automatic retry with exponential backoff

## Monitoring & Analytics

### System Health
- Query success rate tracking
- AI matching accuracy metrics
- Webhook delivery monitoring
- Performance metrics dashboard

### Business Analytics
- Query volume trends
- Popular vendor matches
- Conversion tracking (query to engagement)
- Revenue reporting

## Development Notes

### Database Setup
- Use Supabase from the start (no in-memory storage)
- Set up migrations immediately
- Configure RLS policies during schema creation
- Set AUTH_MODE=supabase and STORAGE_MODE=supabase

### Email Service Implementation
- Create `server/lib/email/resend-service.ts` for email abstraction
- Implement methods: `sendQueryResults()`, `sendMatchNotification()`, `sendSupportTicketUpdate()`, etc.
- Use HTML email templates with proper styling
- Include unsubscribe links in all marketing emails
- Handle Resend API errors gracefully with retry logic
- Log all email sending attempts for debugging

### Third-Party Integrations
- **Anthropic Claude API** - For AI matching and conversation (key provided)
  - Use Claude Sonnet model for intelligent query processing
  - Implement streaming responses for real-time interaction
- **Stripe API** - For billing and subscriptions (set up integration, keys provided later)
  - Create webhook endpoints for payment events
  - Implement subscription lifecycle management
- **Resend Email Service** - For transactional emails and notifications (key provided from reclamatch)
  - Query result notifications
  - Support ticket updates
  - Billing and subscription emails
  - Vendor match alerts
- **File Storage** - Supabase Storage for vendor program documents

### Testing Requirements
- Unit tests for AI matching logic
- Integration tests for webhook delivery
- E2E tests for critical user flows
- Load testing for query processing

## Environment Variables Required

### Already Configured
```env
# AI Integration (from KidIQ app)
ANTHROPIC_API_KEY=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

# Email Service (from reclamatch app)
RESEND_API_KEY=re_LX2tSg9r_Dd4EwvA9BYH2MW3SLXq7f8eC
FROM_EMAIL=hello@leodavinci.ai

# Authentication & Storage
AUTH_MODE=supabase
STORAGE_MODE=supabase
```

### To Be Provided Later
```env
# Stripe (set up integration structure now)
STRIPE_SECRET_KEY=<will be provided>
STRIPE_WEBHOOK_SECRET=<will be provided>
```

## Success Metrics
- Query-to-match conversion rate > 70%
- Average AI response time < 3s (MatchMind's "thinking time")
- Vendor webhook success rate > 95%
- User satisfaction score > 4.0/5.0
- AI match accuracy > 85% (vendor-confirmed relevance)

## Application Metadata

**Application Name**: MatchMind
**Tagline**: Where AI Meets Perfect Matches
**Domain**: B2B Vendor Matching & Procurement Intelligence
**Technology**: AI-powered conversational matching with Claude Sonnet
**Target Users**:
- Buyers: Companies seeking specialty B2B vendors
- Vendors: B2B service/product providers seeking quality leads
- Admins: Platform operators managing AI training, billing, and support
