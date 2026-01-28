import { pgTable, serial, text, timestamp, pgEnum, uuid, integer, jsonb, index } from 'drizzle-orm/pg-core';

// ============================================================================
// ENUMS
// ============================================================================

export const generationStatusEnum = pgEnum('generation_status', ['queued', 'generating', 'completed', 'failed', 'paused', 'cancelled']);
export const generationModeEnum = pgEnum('generation_mode', ['single-shot', 'autonomous', 'confirm_first']);
export const generationTypeEnum = pgEnum('generation_type', ['new', 'resume']);
export const snapshotTypeEnum = pgEnum('snapshot_type', ['automatic', 'manual', 'checkpoint']);

// ============================================================================
// GENERATION REQUESTS TABLE
// ============================================================================
// Note: We don't have a users table because Supabase Auth handles user management.
// The userId field stores the Supabase Auth user UUID.

export const generationRequests = pgTable('generation_requests', {
  id: serial('id').primaryKey(),
  appId: uuid('app_id').notNull().defaultRandom(), // Unique app identifier for GitHub repo naming
  userId: uuid('user_id').notNull(), // Supabase Auth UUID
  appName: text('app_name').notNull(), // User-friendly app name for display
  prompt: text('prompt').notNull(),
  status: generationStatusEnum('status').notNull().default('queued'),
  generationType: generationTypeEnum('generation_type').notNull().default('new'), // 'new' or 'resume'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
  githubUrl: text('github_url'), // GitHub repository URL for deployment
  deploymentUrl: text('deployment_url'), // Fly.io deployed app URL
  errorMessage: text('error_message'),
  // REPL Autonomous Mode fields
  mode: generationModeEnum('mode').notNull().default('single-shot'),
  initialPrompt: text('initial_prompt').notNull(), // First prompt that started generation
  maxIterations: integer('max_iterations').notNull().default(10),
  currentIteration: integer('current_iteration').notNull().default(0),
  lastSessionId: text('last_session_id'), // For resuming context continuity
}, (table) => ({
  userIdIdx: index('generation_requests_user_id_idx').on(table.userId),
  appIdIdx: index('generation_requests_app_id_idx').on(table.appId),
}));

// ============================================================================
// ITERATION SNAPSHOTS TABLE
// ============================================================================

export const iterationSnapshots = pgTable('iteration_snapshots', {
  id: serial('id').primaryKey(),
  generationRequestId: integer('generation_request_id').notNull().references(() => generationRequests.id, { onDelete: 'cascade' }),
  iterationNumber: integer('iteration_number').notNull(),
  snapshotType: snapshotTypeEnum('snapshot_type').notNull().default('automatic'),
  filesSnapshot: text('files_snapshot').notNull(), // JSON string
  promptUsed: text('prompt_used').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  metadata: jsonb('metadata'), // { tokensUsed, duration, changedFiles, summary }
}, (table) => ({
  generationIdIdx: index('iteration_snapshots_generation_id_idx').on(table.generationRequestId),
  iterationNumberIdx: index('iteration_snapshots_number_idx').on(table.generationRequestId, table.iterationNumber),
}));
