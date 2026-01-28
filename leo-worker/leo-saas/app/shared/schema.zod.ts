import { z } from 'zod';

// ============================================================================
// USERS - Authentication and User Management
// ============================================================================

export const users = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().min(1, 'Name is required'),
  password: z.string(), // Hashed password stored in DB
  role: z.enum(['user', 'admin']),
  createdAt: z.string().datetime(),
});

export const insertUsersSchema = users.omit({ id: true, createdAt: true });

// For registration (includes password validation)
export const registerUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
});

// For login
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// User response (without password)
export const userResponse = users.omit({ password: true });

// ============================================================================
// GENERATION REQUESTS - Application Generation Tracking
// ============================================================================

export const generationStatusEnum = z.enum([
  'queued',
  'generating',
  'completed',
  'failed',
  'paused', // Paused autonomous mode
  'cancelled', // User cancelled generation
]);

export const generationModeEnum = z.enum([
  'single-shot', // V1 behavior: generate once and complete
  'autonomous',  // V2 REPL: iterative generation without stopping
  'confirm_first', // V2 REPL: ask user approval before each iteration
]);

export const generationTypeEnum = z.enum([
  'new',    // New app generation
  'resume', // Resuming existing app
]);

export const generationRequests = z.object({
  id: z.number(),
  appId: z.string().uuid(), // Unique app identifier for GitHub repo naming
  userId: z.string().uuid(), // Supabase Auth user UUID
  appName: z.string().min(1, 'App name is required'), // User-friendly app name for display
  prompt: z.string().min(10, 'Prompt must be at least 10 characters').max(5000, 'Prompt must not exceed 5000 characters'),
  status: generationStatusEnum,
  generationType: generationTypeEnum, // 'new' or 'resume'
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable(),
  githubUrl: z.string().url().nullable(),
  deploymentUrl: z.string().url().nullable(),
  errorMessage: z.string().nullable(),
  // REPL Autonomous Mode fields
  mode: generationModeEnum,
  initialPrompt: z.string(), // First prompt that started the generation
  maxIterations: z.number().int().min(1).max(20),
  currentIteration: z.number().int().min(0),
  lastSessionId: z.string().nullable(), // For resuming context continuity
});

export const insertGenerationRequestSchema = generationRequests.omit({
  id: true,
  appId: true, // Auto-generated for new, provided for resume
  createdAt: true,
  updatedAt: true,
  completedAt: true,
  githubUrl: true,
  deploymentUrl: true,
  errorMessage: true,
  lastSessionId: true,
}).extend({
  appId: z.string().uuid().optional(), // Provided for resume (same app)
  status: generationStatusEnum.default('queued'),
  generationType: generationTypeEnum.default('new'),
  // REPL fields with defaults for backward compatibility
  mode: generationModeEnum.default('single-shot'),
  initialPrompt: z.string(), // Required field for REPL mode
  maxIterations: z.number().int().min(1).max(20).default(10),
  currentIteration: z.number().int().min(0).default(0),
  // Resume fields - copied from original app
  githubUrl: z.string().url().nullable().optional(),
  deploymentUrl: z.string().url().nullable().optional(),
});

// For creating new generation request (user provides prompt and app name)
// For resume: appId, githubUrl, deploymentUrl are copied from original
export const createGenerationRequestSchema = z.object({
  appName: z.string().min(1, 'App name is required').max(50, 'App name must not exceed 50 characters'),
  prompt: z.string().min(10, 'Prompt must be at least 10 characters').max(5000, 'Prompt must not exceed 5000 characters'),
  mode: generationModeEnum.optional(), // Optional, defaults to 'single-shot'
  maxIterations: z.number().int().min(1).max(20).optional(), // Optional, defaults to 10
  generationType: generationTypeEnum.optional(), // Optional, defaults to 'new'
  // Resume fields - copied from original app when resuming
  appId: z.string().uuid().optional(), // Same appId for resume
  githubUrl: z.string().url().optional(), // Copied from original for resume
  deploymentUrl: z.string().url().optional(), // Copied from original for resume
});

// For updating generation request status (internal use)
export const updateGenerationRequestSchema = z.object({
  status: generationStatusEnum.optional(),
  updatedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  githubUrl: z.string().url().optional(),
  deploymentUrl: z.string().url().optional(),
  errorMessage: z.string().optional(),
  // REPL fields
  currentIteration: z.number().int().min(0).optional(),
  lastSessionId: z.string().optional(),
});

// Generation request with user information
export const generationRequestWithUser = generationRequests.extend({
  user: userResponse,
});

// ============================================================================
// ITERATION SNAPSHOTS - History Tracking and Rollback
// ============================================================================

export const snapshotTypeEnum = z.enum(['automatic', 'manual', 'checkpoint']);

export const iterationSnapshotSchema = z.object({
  id: z.number(),
  generationRequestId: z.number(), // Foreign key to generation_requests
  iterationNumber: z.number().int().min(1),
  snapshotType: snapshotTypeEnum,
  filesSnapshot: z.string(), // JSON string of file tree
  promptUsed: z.string(), // Prompt that created this iteration
  timestamp: z.string().datetime(),
  metadata: z.object({
    tokensUsed: z.number().optional(),
    duration: z.number().optional(), // milliseconds
    changedFiles: z.array(z.string()).optional(),
    summary: z.string().optional(), // AI-generated summary of changes
  }).nullable().optional(),
});

export const insertIterationSnapshotSchema = iterationSnapshotSchema.omit({
  id: true,
  timestamp: true,
});

export const updateIterationSnapshotSchema = iterationSnapshotSchema.partial().omit({
  id: true,
  generationRequestId: true,
  iterationNumber: true,
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type User = z.infer<typeof users>;
export type InsertUser = z.infer<typeof insertUsersSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type UserResponse = z.infer<typeof userResponse>;

export type GenerationStatus = z.infer<typeof generationStatusEnum>;
export type GenerationMode = z.infer<typeof generationModeEnum>;
export type GenerationType = z.infer<typeof generationTypeEnum>;
export type GenerationRequest = z.infer<typeof generationRequests>;
export type InsertGenerationRequest = z.infer<typeof insertGenerationRequestSchema>;
export type CreateGenerationRequest = z.infer<typeof createGenerationRequestSchema>;
export type UpdateGenerationRequest = z.infer<typeof updateGenerationRequestSchema>;
export type GenerationRequestWithUser = z.infer<typeof generationRequestWithUser>;

export type SnapshotType = z.infer<typeof snapshotTypeEnum>;
export type IterationSnapshot = z.infer<typeof iterationSnapshotSchema>;
export type InsertIterationSnapshot = z.infer<typeof insertIterationSnapshotSchema>;
export type UpdateIterationSnapshot = z.infer<typeof updateIterationSnapshotSchema>;
