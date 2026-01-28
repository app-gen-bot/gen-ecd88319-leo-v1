-- Migration: Add profiles, settings, and credit_transactions tables for gated beta signup
-- This enables role-based access (user/dev/admin), approval status, and credits system

-- Create new enums
DO $$ BEGIN
    CREATE TYPE "public"."user_role" AS ENUM('user', 'dev', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."user_status" AS ENUM('pending_approval', 'approved', 'rejected', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."credit_transaction_type" AS ENUM('grant', 'deduction', 'refund', 'adjustment');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create profiles table (linked to auth.users via id)
CREATE TABLE IF NOT EXISTS "profiles" (
    "id" uuid PRIMARY KEY NOT NULL,
    "email" text NOT NULL,
    "name" text,
    "role" "user_role" DEFAULT 'user' NOT NULL,
    "status" "user_status" DEFAULT 'pending_approval' NOT NULL,
    "credits_remaining" integer DEFAULT 0 NOT NULL,
    "credits_used" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create settings table for system configuration
CREATE TABLE IF NOT EXISTS "settings" (
    "id" serial PRIMARY KEY NOT NULL,
    "key" text NOT NULL UNIQUE,
    "value" jsonb NOT NULL,
    "description" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create credit_transactions audit table
CREATE TABLE IF NOT EXISTS "credit_transactions" (
    "id" serial PRIMARY KEY NOT NULL,
    "user_id" uuid NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
    "type" "credit_transaction_type" NOT NULL,
    "amount" integer NOT NULL,
    "balance_before" integer NOT NULL,
    "balance_after" integer NOT NULL,
    "description" text,
    "generation_request_id" integer,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "created_by" uuid
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "profiles_email_idx" ON "profiles" USING btree ("email");
CREATE INDEX IF NOT EXISTS "profiles_status_idx" ON "profiles" USING btree ("status");
CREATE INDEX IF NOT EXISTS "credit_transactions_user_id_idx" ON "credit_transactions" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "credit_transactions_created_at_idx" ON "credit_transactions" USING btree ("created_at");

-- Insert default credit config
INSERT INTO "settings" ("key", "value", "description")
VALUES (
    'credit_config',
    '{"creditsPerGeneration": 1, "defaultCreditsForNewUsers": 0, "maxCreditsPerUser": 100}'::jsonb,
    'Configuration for credits system: how many credits per generation, default credits for new users, max credits limit'
) ON CONFLICT ("key") DO NOTHING;

-- RLS policies for profiles (users can read their own profile)
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON "profiles" FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile name"
    ON "profiles" FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- RLS policies for credit_transactions (users can view their own transactions)
ALTER TABLE "credit_transactions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
    ON "credit_transactions" FOR SELECT
    USING (auth.uid() = user_id);

-- Settings table: only admins can read/write (via service role key on server)
-- No RLS needed as it should only be accessed server-side
