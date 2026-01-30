import { pgTable, serial, text, timestamp, pgEnum, uuid, integer, index, unique, jsonb, boolean } from 'drizzle-orm/pg-core';

// ============================================================================
// ENUMS
// ============================================================================

export const generationStatusEnum = pgEnum('generation_status', ['queued', 'generating', 'completed', 'failed', 'paused', 'cancelled']);
export const generationModeEnum = pgEnum('generation_mode', ['single-shot', 'autonomous', 'confirm_first']);
export const generationTypeEnum = pgEnum('generation_type', ['new', 'resume']);
export const feedbackTypeEnum = pgEnum('feedback_type', ['feature_request', 'bug_report']);
export const feedbackStatusEnum = pgEnum('feedback_status', ['new', 'reviewed', 'in_progress', 'resolved', 'closed']);

// User role and status enums for gated beta signup
// Roles:
// - user: Restricted role, sees friendly logs only, NO app creation, sees ONLY assigned apps
// - user_plus: Standard role, sees friendly logs, CAN create apps, sees own apps
// - dev: Developer role, sees full terminal logs, CAN create apps, sees own apps
// - admin: Full access, can assign apps to users
export const userRoleEnum = pgEnum('user_role', ['user', 'user_plus', 'dev', 'admin']);
export const userStatusEnum = pgEnum('user_status', ['pending_approval', 'approved', 'rejected', 'suspended']);

// Credit transaction type enum
export const creditTransactionTypeEnum = pgEnum('credit_transaction_type', [
  'grant',
  'deduction',
  'refund',
  'adjustment',
  'subscription_grant',
  'subscription_reset'
]);

// Subscription tier enum
export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'pro', 'enterprise']);

// Subscription status enum (maps to Stripe subscription statuses)
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

// ============================================================================
// PROFILES TABLE - Extended user profile with role, status, and credits
// ============================================================================
// Linked to Supabase Auth users via id (auth.users.id)
// Contains gated beta signup status and credits balance

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // Same as auth.users.id
  email: text('email').notNull(),
  name: text('name'),
  role: userRoleEnum('role').notNull().default('user'),
  status: userStatusEnum('status').notNull().default('pending_approval'),
  creditsRemaining: integer('credits_remaining').notNull().default(0),
  creditsUsed: integer('credits_used').notNull().default(0),
  // Subscription fields
  stripeCustomerId: text('stripe_customer_id'),
  currentTier: subscriptionTierEnum('current_tier').notNull().default('free'),
  // Developer tokens (BYOT - Bring Your Own Token)
  // Required for dev/admin roles to run generations
  claudeOauthToken: text('claude_oauth_token'),       // Or anthropicApiKey (one or other)
  supabaseAccessToken: text('supabase_access_token'), // For creating per-app Supabase projects
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  emailIdx: index('profiles_email_idx').on(table.email),
  statusIdx: index('profiles_status_idx').on(table.status),
  stripeCustomerIdx: index('profiles_stripe_customer_idx').on(table.stripeCustomerId),
}));

// ============================================================================
// SETTINGS TABLE - System configuration including credit settings
// ============================================================================

export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: jsonb('value').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================================================
// CREDIT TRANSACTIONS TABLE - Audit log for all credit changes
// ============================================================================

export const creditTransactions = pgTable('credit_transactions', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  type: creditTransactionTypeEnum('type').notNull(),
  amount: integer('amount').notNull(), // Positive for grants, negative for deductions
  balanceBefore: integer('balance_before').notNull(),
  balanceAfter: integer('balance_after').notNull(),
  description: text('description'),
  generationRequestId: integer('generation_request_id'), // Optional reference to generation
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdBy: uuid('created_by'), // Admin who granted/adjusted, null for system deductions
}, (table) => ({
  userIdIdx: index('credit_transactions_user_id_idx').on(table.userId),
  createdAtIdx: index('credit_transactions_created_at_idx').on(table.createdAt),
}));

// ============================================================================
// APPS TABLE - Stable identity for apps, unique per user
// ============================================================================
// Each app has a unique (user_id, app_name) combination.
// Multiple generation_requests can link to the same app (resume functionality).

export const apps = pgTable('apps', {
  id: serial('id').primaryKey(),
  appUuid: uuid('app_uuid').notNull().defaultRandom(), // Unique identifier for GitHub repo naming
  userId: uuid('user_id').notNull(), // Supabase Auth UUID
  appName: text('app_name').notNull(), // User-friendly app name for display
  githubUrl: text('github_url'), // GitHub repository URL
  deploymentUrl: text('deployment_url'), // Fly.io deployed app URL
  cumulativeCost: text('cumulative_cost').default('0'), // Total USD cost across all generations
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('apps_user_id_idx').on(table.userId),
  appUuidIdx: index('apps_app_uuid_idx').on(table.appUuid),
  userAppUnique: unique('apps_user_app_unique').on(table.userId, table.appName),
}));

// ============================================================================
// APP ASSIGNMENTS TABLE - Assigns apps to users with 'user' role
// ============================================================================
// Users with 'user' role can only see apps that are explicitly assigned to them.
// This enables admins/devs to share specific apps with restricted users.

export const appAssignments = pgTable('app_assignments', {
  id: serial('id').primaryKey(),
  appId: integer('app_id').notNull().references(() => apps.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  assignedBy: uuid('assigned_by').references(() => profiles.id), // Admin/dev who assigned
  canResume: boolean('can_resume').notNull().default(false), // Whether user can resume/modify the app
  assignedAt: timestamp('assigned_at').notNull().defaultNow(),
}, (table) => ({
  appUserUnique: unique('app_assignments_app_user_unique').on(table.appId, table.userId),
  userIdIdx: index('app_assignments_user_id_idx').on(table.userId),
  appIdIdx: index('app_assignments_app_id_idx').on(table.appId),
}));

// ============================================================================
// GENERATION REQUESTS TABLE
// ============================================================================
// Normalized to 3NF - user_id, app_name, github_url, deployment_url are derived
// from apps table via appRefId FK. No denormalized columns.

export const generationRequests = pgTable('generation_requests', {
  id: serial('id').primaryKey(),
  appRefId: integer('app_ref_id').notNull().references(() => apps.id, { onDelete: 'cascade' }), // FK to apps table
  prompt: text('prompt').notNull(),
  status: generationStatusEnum('status').notNull().default('queued'),
  generationType: generationTypeEnum('generation_type').notNull().default('new'), // 'new' or 'resume'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
  errorMessage: text('error_message'),
  // REPL Autonomous Mode fields
  mode: generationModeEnum('mode').notNull().default('single-shot'),
  initialPrompt: text('initial_prompt').notNull(), // First prompt that started generation
  maxIterations: integer('max_iterations').notNull().default(10),
  currentIteration: integer('current_iteration').notNull().default(0),
  lastSessionId: text('last_session_id'), // For resuming context continuity
  githubCommit: text('github_commit'), // Commit SHA when generation pushes to GitHub
  // Cost and duration tracking (from all_work_complete message)
  totalCost: text('total_cost'), // USD cost as string (e.g., "0.0523") for precision
  totalDuration: integer('total_duration'), // Total duration in seconds
  // Warnings from all_work_complete message (RLS, security issues, etc.)
  warnings: jsonb('warnings'), // Array of {code, message, details: {remediation_url}} objects
  // Per-iteration cost and duration data
  iterationData: jsonb('iteration_data'), // Array of {iteration: number, cost: number, duration: number} objects
  // Pool tracking for multi-generation support
  poolIndex: integer('pool_index'), // Which Supabase pool this generation is using (null = not assigned)
  // File attachments for context
  attachments: jsonb('attachments'), // Array of {name, storagePath, size, mimeType}
}, (table) => ({
  appRefIdIdx: index('generation_requests_app_ref_id_idx').on(table.appRefId),
}));

// Note: iteration_snapshots table removed - was unused

// ============================================================================
// USER FEEDBACK TABLE - Feature Requests and Bug Reports
// ============================================================================

export const userFeedback = pgTable('user_feedback', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull(), // Supabase Auth UUID
  type: feedbackTypeEnum('type').notNull(), // 'feature_request' | 'bug_report'
  content: text('content').notNull(), // Feedback content
  status: feedbackStatusEnum('status').notNull().default('new'),
  sourcePage: text('source_page').notNull(), // Page where feedback was submitted
  attachments: jsonb('attachments'), // Array of {name, url, size, mimeType} for image attachments
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('user_feedback_user_id_idx').on(table.userId),
  statusIdx: index('user_feedback_status_idx').on(table.status),
}));

// ============================================================================
// SUBSCRIPTIONS TABLE - Stripe subscription tracking
// ============================================================================

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
  // Credit tracking for subscription period
  monthlyCreditsIncluded: integer('monthly_credits_included').notNull().default(0),
  monthlyCreditsUsed: integer('monthly_credits_used').notNull().default(0),
  creditsResetAt: timestamp('credits_reset_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: unique('subscriptions_user_unique').on(table.userId),
  stripeCustomerIdx: index('subscriptions_stripe_customer_idx').on(table.stripeCustomerId),
  stripeSubIdx: index('subscriptions_stripe_sub_idx').on(table.stripeSubscriptionId),
  statusIdx: index('subscriptions_status_idx').on(table.status),
}));

// ============================================================================
// SUBSCRIPTION EVENTS TABLE - Webhook audit log for idempotency
// ============================================================================

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
}, (table) => ({
  eventTypeIdx: index('subscription_events_type_idx').on(table.eventType),
  stripeCustomerIdx: index('subscription_events_customer_idx').on(table.stripeCustomerId),
}));

// ============================================================================
// APP CREDENTIALS TABLE - Encrypted credentials stored in Supabase Vault
// ============================================================================
// Maps app credentials (SUPABASE_URL, DATABASE_URL, etc.) to Vault secrets.
// Credentials survive between sessions and are restored on resume.

export const appCredentials = pgTable('app_credentials', {
  id: serial('id').primaryKey(),
  appId: integer('app_id').notNull().references(() => apps.id, { onDelete: 'cascade' }),
  envKey: text('env_key').notNull(), // e.g., 'SUPABASE_URL', 'DATABASE_URL'
  vaultSecretId: uuid('vault_secret_id').notNull(), // Reference to vault.secrets.id
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  appIdIdx: index('app_credentials_app_id_idx').on(table.appId),
  appEnvUnique: unique('app_credentials_app_env_unique').on(table.appId, table.envKey),
}));
