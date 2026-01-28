# Pricing Tiers Architecture for Leo SaaS

## Executive Summary

This document outlines a comprehensive plan for implementing subscription-based pricing tiers with Stripe integration for Leo SaaS. The architecture leverages the existing credits-based system, Supabase Auth, and profiles table to create a seamless subscription experience.

---

## 1. Architecture Overview

### Current State Analysis

**Existing Database Schema** (`shared/schema.ts`):
- `profiles` table with `creditsRemaining`, `creditsUsed`, `role`, `status`
- `credit_transactions` table for audit logging
- `settings` table with `credit_config` for system-wide credit settings

**Existing Auth Flow** (`client/src/contexts/AuthContext.tsx`):
- Supabase Auth with OAuth (Google/GitHub)
- Profile fetching on auth state change
- Status-based routing (pending_approval, approved, rejected, suspended)

**Existing Credit System** (`server/routes/profile.ts`):
- `deductCredits()` - Deducts credits with transaction logging
- `hasEnoughCredits()` - Checks balance before generation
- `getCreditConfig()` - Retrieves system credit configuration

### Proposed Architecture

```
+------------------+     +------------------+     +------------------+
|   Frontend       |     |   Backend        |     |   Stripe         |
|                  |     |                  |     |                  |
| - Pricing Page   |<--->| - Subscription   |<--->| - Customer       |
| - Checkout Flow  |     |   Routes         |     | - Subscriptions  |
| - Billing Portal |     | - Webhook Handler|     | - Checkout       |
| - Usage Display  |     | - Credit Sync    |     | - Billing Portal |
+------------------+     +------------------+     +------------------+
         |                       |
         v                       v
+------------------+     +------------------+
|   Supabase Auth  |     |   PostgreSQL     |
|   (existing)     |     |                  |
|                  |     | - profiles       |
|                  |     | - subscriptions  |
|                  |     | - credit_trans   |
+------------------+     +------------------+
```

---

## 2. Database Schema Changes

### New Enums

```typescript
// shared/schema.ts additions

export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'pro', 'enterprise']);

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'canceled',
  'past_due',
  'trialing',
  'incomplete',
  'incomplete_expired',
  'unpaid',
  'paused'
]);
```

### New Tables

**`subscriptions` table:**
```typescript
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  stripeCustomerId: text('stripe_customer_id').notNull(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  tier: subscriptionTierEnum('tier').notNull().default('free'),
  status: subscriptionStatusEnum('status').notNull().default('active'),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  canceledAt: timestamp('canceled_at'),
  monthlyCreditsIncluded: integer('monthly_credits_included').notNull().default(0),
  monthlyCreditsUsed: integer('monthly_credits_used').notNull().default(0),
  creditsResetAt: timestamp('credits_reset_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

**`subscription_events` table (Webhook audit log):**
```typescript
export const subscriptionEvents = pgTable('subscription_events', {
  id: serial('id').primaryKey(),
  stripeEventId: text('stripe_event_id').unique().notNull(),
  eventType: text('event_type').notNull(),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  userId: uuid('user_id').references(() => profiles.id),
  payload: jsonb('payload').notNull(),
  processedAt: timestamp('processed_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

### Modifications to Existing Tables

**`profiles` table additions:**
```typescript
// Add to profiles table
stripeCustomerId: text('stripe_customer_id'),
currentTier: subscriptionTierEnum('current_tier').notNull().default('free'),
```

**`credit_transactions` - Add new transaction types:**
```typescript
// Extend creditTransactionTypeEnum
export const creditTransactionTypeEnum = pgEnum('credit_transaction_type', [
  'grant',
  'deduction',
  'refund',
  'adjustment',
  'subscription_grant',    // NEW
  'subscription_reset'     // NEW
]);

// Add optional subscription reference
subscriptionId: integer('subscription_id').references(() => subscriptions.id),
```

---

## 3. Pricing Tiers Configuration

| Tier | Monthly Price | Annual Price | Monthly Credits | Features |
|------|---------------|--------------|-----------------|----------|
| **Free** | $0 | $0 | 3 | Basic generation, Community support |
| **Pro** | $29 | $290 (17% off) | 50 | Priority queue, GitHub integration, Deploy to Fly.io |
| **Enterprise** | Custom | Custom | Unlimited | SSO, SLA, Dedicated support, Custom integrations |

### Stripe Product Setup

Configure in Stripe Dashboard:
1. Create Product: "Leo Pro Subscription"
2. Create Prices:
   - `price_pro_monthly` - $29/month recurring
   - `price_pro_annual` - $290/year recurring
3. Configure metadata:
   - `tier`: "pro"
   - `monthly_credits`: "50"

---

## 4. Stripe Integration Points

### Integration Approach: Stripe Checkout + Custom Pricing Page

**Recommended Flow:**
1. Custom pricing page with tier cards (matches Leo design system)
2. "Upgrade" button calls backend to create Checkout Session
3. Redirect to Stripe Checkout for payment
4. Webhook processes `checkout.session.completed`
5. Billing portal link for subscription management

### Webhook Events to Handle

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Create subscription record, grant initial credits |
| `customer.subscription.created` | Record subscription, set tier |
| `customer.subscription.updated` | Sync status, handle upgrades/downgrades |
| `customer.subscription.deleted` | Cancel subscription, reset to free tier |
| `invoice.paid` | Reset monthly credits, log transaction |
| `invoice.payment_failed` | Mark status as past_due, send notification |
| `customer.subscription.trial_will_end` | Send trial ending notification |

---

## 5. API Endpoints Required

### Subscription Routes: `server/routes/subscriptions.ts`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/subscriptions` | Get current user's subscription |
| `POST` | `/api/subscriptions/checkout` | Create Stripe Checkout session |
| `POST` | `/api/subscriptions/portal` | Create Stripe Billing Portal session |
| `GET` | `/api/subscriptions/products` | Get available pricing tiers |
| `POST` | `/api/subscriptions/cancel` | Cancel subscription at period end |
| `POST` | `/api/subscriptions/resume` | Resume canceled subscription |
| `GET` | `/api/subscriptions/usage` | Get credit usage for current period |

### Webhook Route: `server/routes/stripe-webhooks.ts`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/webhooks/stripe` | Handle Stripe webhook events |

**Critical:** Use `express.raw({ type: 'application/json' })` for webhook route - signature verification requires raw body.

---

## 6. Frontend Components Required

### New Pages

**`client/src/pages/PricingPage.tsx`**
- Display pricing tiers (Free, Pro, Enterprise)
- Monthly/Annual toggle
- Show current subscription for logged-in users
- CTAs: "Get Started" / "Upgrade" / "Contact Sales"

**`client/src/pages/BillingPage.tsx`**
- Current subscription details
- Credit usage visualization
- Billing history (via Stripe portal)
- Cancel/resume subscription controls

### New Components

**`client/src/components/subscription/PricingCard.tsx`**
```typescript
interface PricingCardProps {
  tier: 'free' | 'pro' | 'enterprise';
  price: number;
  period: 'monthly' | 'annual';
  features: string[];
  isPopular?: boolean;
  ctaText: string;
  onSelect: () => void;
  disabled?: boolean;
  currentTier?: boolean;
}
```

**`client/src/components/subscription/CreditUsageBar.tsx`**
- Visual progress bar for credits used/remaining
- Threshold warnings at 75%, 90%, 95%

**`client/src/components/subscription/UpgradeBanner.tsx`**
- Contextual upgrade prompts when credits low
- Dismissable, non-intrusive

### Context Extensions

**Extend `AuthContext.tsx`:**
```typescript
interface AuthContextValue {
  // ... existing fields
  subscription: Subscription | null;
  currentTier: 'free' | 'pro' | 'enterprise';
  refreshSubscription: () => Promise<void>;
}
```

---

## 7. Implementation Phases

### Phase 1: Database & Backend Foundation (3-4 days)
- [ ] Create database migrations for new tables/enums
- [ ] Add `stripe` package to dependencies
- [ ] Create `server/lib/stripe/client.ts` - Stripe SDK configuration
- [ ] Create `server/routes/subscriptions.ts` skeleton
- [ ] Create `server/routes/stripe-webhooks.ts` with signature verification

### Phase 2: Stripe Integration (3-4 days)
- [ ] Configure Stripe products and prices in dashboard
- [ ] Implement checkout session creation endpoint
- [ ] Implement billing portal session endpoint
- [ ] Complete webhook event handlers
- [ ] Implement credit sync logic on subscription events

### Phase 3: Frontend - Pricing Page (2-3 days)
- [ ] Create PricingPage with tier cards
- [ ] Implement Stripe Checkout redirect flow
- [ ] Add authentication-aware CTAs
- [ ] Create monthly/annual pricing toggle
- [ ] Add route to App.tsx

### Phase 4: Frontend - Billing & Usage (2-3 days)
- [ ] Create BillingPage component
- [ ] Implement credit usage visualization
- [ ] Add subscription management controls
- [ ] Extend AuthContext with subscription state
- [ ] Add UserMenu billing link

### Phase 5: Polish & Testing (2-3 days)
- [ ] Implement low-credit warning banners
- [ ] Add upgrade prompts in console
- [ ] End-to-end testing with Stripe test mode
- [ ] Error handling and edge cases
- [ ] Documentation updates

---

## 8. Security Considerations

1. **Webhook Signature Verification**: Always verify `stripe-signature` header
2. **Idempotency**: Store processed event IDs in `subscription_events` to prevent duplicates
3. **Service Role Access**: Use Supabase service role for webhook credit updates
4. **Rate Limiting**: Apply rate limits to subscription endpoints
5. **Audit Logging**: Log all subscription events in `subscription_events` table

---

## 9. Environment Variables Required

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (configure in Stripe Dashboard first)
STRIPE_PRICE_ID_PRO_MONTHLY=price_...
STRIPE_PRICE_ID_PRO_ANNUAL=price_...
```

---

## 10. Dependencies

**Backend:**
```bash
npm install stripe
```

**Types:**
```bash
npm install -D @types/stripe  # Not needed - stripe package includes types
```

**Frontend:** No new dependencies - use Stripe.js via redirect to Checkout

---

## 11. File Structure

```
server/
├── lib/
│   └── stripe/
│       ├── client.ts           # Stripe SDK initialization
│       ├── webhooks.ts         # Webhook event handlers
│       └── subscription-sync.ts # Credit sync logic
├── routes/
│   ├── subscriptions.ts        # Subscription API routes
│   └── stripe-webhooks.ts      # Webhook endpoint

client/src/
├── pages/
│   ├── PricingPage.tsx         # Public pricing page
│   └── BillingPage.tsx         # User billing management
├── components/
│   └── subscription/
│       ├── PricingCard.tsx     # Tier card component
│       ├── CreditUsageBar.tsx  # Usage visualization
│       └── UpgradeBanner.tsx   # Upgrade prompts

shared/
└── schema.ts                   # Add subscription tables/enums
```

---

## 12. Testing Strategy

### Stripe Test Mode
- Use `sk_test_*` keys during development
- Test card: `4242 4242 4242 4242`
- Stripe CLI for webhook testing: `stripe listen --forward-to localhost:5000/api/webhooks/stripe`

### Test Scenarios
1. New user subscribes to Pro monthly
2. Existing user upgrades from Free to Pro
3. User cancels subscription (verify credits until period end)
4. User resumes canceled subscription
5. Payment fails (verify past_due status)
6. Credits reset on new billing period

---

## Prerequisites Before Implementation

1. **Stripe Account Setup**
   - Create Stripe account (or use existing)
   - Configure test mode products and prices
   - Set up webhook endpoint in Stripe Dashboard

2. **Environment Configuration**
   - Add Stripe keys to `.env`
   - Configure webhook secret

3. **Database Migration**
   - Ensure database is accessible
   - Run migrations for new tables

---

## References

- [Stripe Subscriptions Documentation](https://docs.stripe.com/billing/subscriptions)
- [Stripe Checkout](https://stripe.com/payments/checkout)
- [Stripe Webhooks](https://docs.stripe.com/webhooks)
- [Credits-Based Pricing Model](https://docs.stripe.com/billing/subscriptions/usage-based/use-cases/credits-based-pricing-model)
