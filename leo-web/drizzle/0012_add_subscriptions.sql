-- Migration: Add Stripe subscription support
-- Adds subscription tiers, subscription tables, and extends profiles/credit_transactions

-- ============================================================================
-- NEW ENUMS
-- ============================================================================

-- Add new transaction types to existing enum
ALTER TYPE "credit_transaction_type" ADD VALUE IF NOT EXISTS 'subscription_grant';
ALTER TYPE "credit_transaction_type" ADD VALUE IF NOT EXISTS 'subscription_reset';

-- Create subscription tier enum
DO $$ BEGIN
  CREATE TYPE "subscription_tier" AS ENUM ('free', 'pro', 'enterprise');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create subscription status enum
DO $$ BEGIN
  CREATE TYPE "subscription_status" AS ENUM (
    'active',
    'canceled',
    'past_due',
    'trialing',
    'incomplete',
    'incomplete_expired',
    'unpaid',
    'paused'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- MODIFY PROFILES TABLE
-- ============================================================================

-- Add Stripe customer ID
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "stripe_customer_id" text;

-- Add current tier (default to 'free')
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "current_tier" "subscription_tier" NOT NULL DEFAULT 'free';

-- Add index on Stripe customer ID
CREATE INDEX IF NOT EXISTS "profiles_stripe_customer_idx" ON "profiles" ("stripe_customer_id");

-- ============================================================================
-- CREATE SUBSCRIPTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "subscriptions" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
  "stripe_customer_id" text NOT NULL,
  "stripe_subscription_id" text UNIQUE,
  "tier" "subscription_tier" NOT NULL DEFAULT 'free',
  "status" "subscription_status" NOT NULL DEFAULT 'active',
  "current_period_start" timestamp,
  "current_period_end" timestamp,
  "cancel_at_period_end" boolean DEFAULT false,
  "canceled_at" timestamp,
  "monthly_credits_included" integer NOT NULL DEFAULT 0,
  "monthly_credits_used" integer NOT NULL DEFAULT 0,
  "credits_reset_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "subscriptions_user_unique" UNIQUE ("user_id")
);

-- Create indexes for subscriptions table
CREATE INDEX IF NOT EXISTS "subscriptions_stripe_customer_idx" ON "subscriptions" ("stripe_customer_id");
CREATE INDEX IF NOT EXISTS "subscriptions_stripe_sub_idx" ON "subscriptions" ("stripe_subscription_id");
CREATE INDEX IF NOT EXISTS "subscriptions_status_idx" ON "subscriptions" ("status");

-- ============================================================================
-- CREATE SUBSCRIPTION EVENTS TABLE (Webhook audit log)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "subscription_events" (
  "id" serial PRIMARY KEY NOT NULL,
  "stripe_event_id" text UNIQUE NOT NULL,
  "event_type" text NOT NULL,
  "stripe_customer_id" text,
  "stripe_subscription_id" text,
  "user_id" uuid REFERENCES "profiles"("id"),
  "payload" jsonb NOT NULL,
  "processed_at" timestamp NOT NULL DEFAULT now(),
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- Create indexes for subscription_events table
CREATE INDEX IF NOT EXISTS "subscription_events_type_idx" ON "subscription_events" ("event_type");
CREATE INDEX IF NOT EXISTS "subscription_events_customer_idx" ON "subscription_events" ("stripe_customer_id");
