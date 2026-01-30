import { z } from 'zod';

// ============================================================================
// USER ROLE AND STATUS ENUMS (for gated beta signup)
// ============================================================================

// User roles:
// - user: Restricted role, sees friendly logs only, NO app creation, sees ONLY assigned apps
// - user_plus: Standard role, sees friendly logs, CAN create apps, sees own apps
// - dev: Developer role, sees full terminal logs, CAN create apps, sees own apps
// - admin: Full access, can assign apps to users
export const userRoleEnum = z.enum(['user', 'user_plus', 'dev', 'admin']);
export const userStatusEnum = z.enum(['pending_approval', 'approved', 'rejected', 'suspended']);
export const creditTransactionTypeEnum = z.enum(['grant', 'deduction', 'refund', 'adjustment']);
export const subscriptionTierEnum = z.enum(['free', 'pro', 'enterprise']);

// ============================================================================
// PROFILES - Extended user profile with role, status, and credits
// ============================================================================

export const profileSchema = z.object({
  id: z.string().uuid(), // Same as auth.users.id
  email: z.string().email(),
  name: z.string().nullable(),
  role: userRoleEnum,
  status: userStatusEnum,
  creditsRemaining: z.number().int().min(0),
  creditsUsed: z.number().int().min(0),
  // Subscription fields
  stripeCustomerId: z.string().nullable().optional(),
  currentTier: subscriptionTierEnum.default('free'),
  // Developer token - NOT included in API responses (sensitive)
  // Use hasClaudeToken boolean flag instead
  hasClaudeToken: z.boolean().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const insertProfileSchema = profileSchema.omit({
  createdAt: true,
  updatedAt: true,
}).extend({
  creditsRemaining: z.number().int().min(0).default(0),
  creditsUsed: z.number().int().min(0).default(0),
  status: userStatusEnum.default('pending_approval'),
  role: userRoleEnum.default('user'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: userRoleEnum.optional(),
  status: userStatusEnum.optional(),
  creditsRemaining: z.number().int().min(0).optional(),
  creditsUsed: z.number().int().min(0).optional(),
  updatedAt: z.string().datetime().optional(),
});

// Profile response for API
export const profileResponseSchema = profileSchema;

// ============================================================================
// SETTINGS - System configuration
// ============================================================================

export const settingsSchema = z.object({
  id: z.number(),
  key: z.string().min(1),
  value: z.unknown(), // JSONB value
  description: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const insertSettingsSchema = settingsSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateSettingsSchema = z.object({
  value: z.unknown(),
  description: z.string().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Credit config shape for settings
export const creditConfigSchema = z.object({
  creditsPerGeneration: z.number().int().min(1).default(1),
  defaultCreditsForNewUsers: z.number().int().min(0).default(0),
  maxCreditsPerUser: z.number().int().min(0).default(100),
});

// ============================================================================
// CREDIT TRANSACTIONS - Audit log for credit changes
// ============================================================================

export const creditTransactionSchema = z.object({
  id: z.number(),
  userId: z.string().uuid(),
  type: creditTransactionTypeEnum,
  amount: z.number().int(), // Positive for grants, negative for deductions
  balanceBefore: z.number().int(),
  balanceAfter: z.number().int(),
  description: z.string().nullable(),
  generationRequestId: z.number().int().nullable(),
  createdAt: z.string().datetime(),
  createdBy: z.string().uuid().nullable(),
});

export const insertCreditTransactionSchema = creditTransactionSchema.omit({
  id: true,
  createdAt: true,
});

// ============================================================================
// USERS - Authentication and User Management (legacy - kept for compatibility)
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
  name: z.string().min(1, 'Name is required').optional(), // Name optional for OAuth
});

// For login
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// For password reset request
export const resetPasswordRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// For password reset (with token)
export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// User response (without password)
export const userResponse = users.omit({ password: true });

// ============================================================================
// APPS - Stable App Identity (Unique per user)
// ============================================================================

export const appSchema = z.object({
  id: z.number(),
  appUuid: z.string().uuid(), // Unique identifier for GitHub repo naming
  userId: z.string().uuid(), // Supabase Auth user UUID
  appName: z.string().min(1, 'App name is required'),
  githubUrl: z.string().url().nullable(),
  deploymentUrl: z.string().url().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  cumulativeCost: z.string().nullable(), // Total USD cost across all generations
});

export const insertAppSchema = appSchema.omit({
  id: true,
  appUuid: true, // Auto-generated
  createdAt: true,
  updatedAt: true,
}).extend({
  appUuid: z.string().uuid().optional(), // Can be provided for specific cases
});

export const updateAppSchema = z.object({
  appName: z.string().min(1).max(50).optional(),
  githubUrl: z.string().url().nullable().optional(),
  deploymentUrl: z.string().url().nullable().optional(),
  updatedAt: z.string().datetime().optional(),
  cumulativeCost: z.string().nullable().optional(),
});

// User app summary for Resume dropdown (minimal fields needed)
export const userAppSummarySchema = z.object({
  id: z.number(), // App ID (not generation request ID)
  appUuid: z.string().uuid(), // For linking to generations
  appName: z.string(),
  githubUrl: z.string().url().nullable(),
  deploymentUrl: z.string().url().nullable(),
  updatedAt: z.string().datetime(),
  generationCount: z.number().optional(), // How many times resumed
  lastStatus: z.string().optional(), // Status of most recent generation
  cumulativeCost: z.string().nullable().optional(), // Total cost across all generations
});

// ============================================================================
// APP ASSIGNMENTS - Assigns apps to users with 'user' role
// ============================================================================
// Users with 'user' role can only see apps that are explicitly assigned to them.

export const appAssignmentSchema = z.object({
  id: z.number(),
  appId: z.number(),
  userId: z.string().uuid(),
  assignedBy: z.string().uuid().nullable(), // Admin/dev who assigned
  canResume: z.boolean(), // Whether user can resume/modify the app
  assignedAt: z.string().datetime(),
});

export const insertAppAssignmentSchema = appAssignmentSchema.omit({
  id: true,
  assignedAt: true,
}).extend({
  canResume: z.boolean().default(false),
});

export const updateAppAssignmentSchema = z.object({
  canResume: z.boolean().optional(),
});

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

// Generation request - normalized (user_id, app_name, github_url, deployment_url derived from apps table)
export const generationRequests = z.object({
  id: z.number(),
  appRefId: z.number(), // FK to apps table - use this to get userId, appName, etc.
  prompt: z.string().min(10, 'Prompt must be at least 10 characters').max(15000, 'Prompt must not exceed 15000 characters'),
  status: generationStatusEnum,
  generationType: generationTypeEnum, // 'new' or 'resume'
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable(),
  errorMessage: z.string().nullable(),
  // REPL Autonomous Mode fields
  mode: generationModeEnum,
  initialPrompt: z.string(), // First prompt that started the generation
  maxIterations: z.number().int().min(1).max(20),
  currentIteration: z.number().int().min(0),
  lastSessionId: z.string().nullable(), // For resuming context continuity
  githubCommit: z.string().nullable(), // Commit SHA when generation pushes to GitHub
  // Cost and duration tracking (from all_work_complete message)
  totalCost: z.string().nullable(), // USD cost as string for precision
  totalDuration: z.number().int().nullable(), // Total duration in seconds
  // Warnings from all_work_complete message (RLS, security issues, etc.)
  warnings: z.array(z.object({
    code: z.string(),
    message: z.string(),
    details: z.object({
      remediation_url: z.string().optional(),
    }).optional(),
  })).nullable(),
  // Per-iteration cost and duration data
  iterationData: z.array(z.object({
    iteration: z.number(),
    cost: z.number(), // USD cost for this iteration
    duration: z.number(), // Duration in seconds for this iteration
  })).nullable(),
  // Pool tracking for multi-generation support
  poolIndex: z.number().int().nullable(), // Which Supabase pool this generation is using
  // File attachments for context
  attachments: z.array(z.object({
    name: z.string(),
    storagePath: z.string(),
    size: z.number(),
    mimeType: z.string(),
  })).nullable(),
});

export const insertGenerationRequestSchema = generationRequests.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
  errorMessage: true,
  lastSessionId: true,
  githubCommit: true, // Set later when pushing to GitHub
  totalCost: true, // Set on completion from all_work_complete
  totalDuration: true, // Set on completion from all_work_complete
  warnings: true, // Set on completion from all_work_complete
  iterationData: true, // Set incrementally during generation
  poolIndex: true, // Set when pool is acquired during generation start
  attachments: true, // Set during file upload in multipart handler
}).extend({
  status: generationStatusEnum.default('queued'),
  generationType: generationTypeEnum.default('new'),
  // REPL fields with defaults for backward compatibility
  mode: generationModeEnum.default('single-shot'),
  initialPrompt: z.string(), // Required field for REPL mode
  maxIterations: z.number().int().min(1).max(20).default(10),
  currentIteration: z.number().int().min(0).default(0),
});

// For creating new generation request (user provides prompt and app name)
// For resume: appUuid identifies the app to resume
export const createGenerationRequestSchema = z.object({
  appName: z.string().min(1, 'App name is required').max(50, 'App name must not exceed 50 characters'),
  prompt: z.string().min(10, 'Prompt must be at least 10 characters').max(15000, 'Prompt must not exceed 15000 characters'),
  mode: generationModeEnum.optional(), // Optional, defaults to 'single-shot'
  maxIterations: z.number().int().min(1).max(20).optional(), // Optional, defaults to 10
  generationType: generationTypeEnum.optional(), // Optional, defaults to 'new'
  // Resume field - identifies app to resume (apps.appUuid)
  appId: z.string().uuid().optional(), // apps.appUuid for resume
});

// For updating generation request status (internal use)
export const updateGenerationRequestSchema = z.object({
  status: generationStatusEnum.optional(),
  updatedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  errorMessage: z.string().optional(),
  // REPL fields
  currentIteration: z.number().int().min(0).optional(),
  lastSessionId: z.string().optional(),
  githubCommit: z.string().optional(), // Set when pushing to GitHub
  // Cost and duration tracking (from all_work_complete)
  totalCost: z.string().optional(), // USD cost as string
  totalDuration: z.number().int().optional(), // Total duration in seconds
  // Warnings from all_work_complete
  warnings: z.array(z.object({
    code: z.string(),
    message: z.string(),
    details: z.object({
      remediation_url: z.string().optional(),
    }).optional(),
  })).optional(),
  // Per-iteration data (appended during generation)
  iterationData: z.array(z.object({
    iteration: z.number(),
    cost: z.number(),
    duration: z.number(),
  })).optional(),
  // Pool tracking (set when acquiring, cleared on release)
  poolIndex: z.number().int().nullable().optional(),
  // File attachments
  attachments: z.array(z.object({
    name: z.string(),
    storagePath: z.string(),
    size: z.number(),
    mimeType: z.string(),
  })).optional(),
});

// Attachment metadata schema (for validation)
export const attachmentMetadataSchema = z.object({
  name: z.string().min(1).max(255),
  storagePath: z.string(),
  size: z.number().min(1).max(5 * 1024 * 1024), // 5MB max per file
  mimeType: z.string(),
});

// Attachment limits
export const ATTACHMENT_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB per file
  MAX_FILES: 10,
  MAX_TOTAL_SIZE: 20 * 1024 * 1024, // 20MB total
  ALLOWED_EXTENSIONS: [
    '.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.txt', '.py', '.css', '.html',
    '.png', '.jpg', '.jpeg', '.gif', '.svg',
  ],
  ALLOWED_MIME_TYPES: [
    'text/typescript', 'text/javascript', 'application/json', 'text/markdown',
    'text/plain', 'text/x-python', 'text/css', 'text/html',
    'image/png', 'image/jpeg', 'image/gif', 'image/svg+xml',
    // Additional common mime types
    'application/javascript', 'application/typescript',
  ],
} as const;

// Generation request with user information
export const generationRequestWithUser = generationRequests.extend({
  user: userResponse,
});

// Note: iteration_snapshots removed - table dropped

// ============================================================================
// GENERATION REQUEST WITH APP (for API responses)
// ============================================================================
// API responses include fields from both generation_requests and apps tables
// This is the denormalized view returned to clients

export const generationRequestWithAppSchema = generationRequests.extend({
  // Fields from apps table (joined via appRefId)
  userId: z.string().uuid(),
  appName: z.string(),
  appUuid: z.string().uuid(),
  githubUrl: z.string().url().nullable(),
  deploymentUrl: z.string().url().nullable(),
  cumulativeCost: z.string().nullable(), // Total cost across all generations
  // poolIndex is already in generationRequests
});

// ============================================================================
// USER FEEDBACK - Feature Requests and Bug Reports
// ============================================================================

export const feedbackTypeEnum = z.enum(['feature_request', 'bug_report']);
export const feedbackStatusEnum = z.enum(['new', 'reviewed', 'in_progress', 'resolved', 'closed']);

// Feedback attachment metadata schema
export const feedbackAttachmentSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  size: z.number(),
  mimeType: z.string(),
});

// Feedback attachment limits
export const FEEDBACK_ATTACHMENT_LIMITS = {
  MAX_FILES: 3,
  MAX_FILE_SIZE: 2 * 1024 * 1024, // 2MB per file
  ALLOWED_TYPES: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'] as const,
  ALLOWED_EXTENSIONS: ['.png', '.jpg', '.jpeg', '.gif', '.webp'] as const,
};

export const userFeedbackSchema = z.object({
  id: z.number(),
  userId: z.string().uuid(),
  type: feedbackTypeEnum,
  content: z.string().min(10, 'Feedback must be at least 10 characters').max(5000),
  status: feedbackStatusEnum,
  sourcePage: z.string().max(100), // 'apps' | 'console' | etc.
  attachments: z.array(feedbackAttachmentSchema).nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createFeedbackSchema = z.object({
  type: feedbackTypeEnum,
  content: z.string().min(10, 'Feedback must be at least 10 characters').max(5000),
  sourcePage: z.string().max(100),
  attachments: z.array(feedbackAttachmentSchema).max(3).optional(),
});

export const updateFeedbackSchema = z.object({
  status: feedbackStatusEnum.optional(),
  updatedAt: z.string().datetime().optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Profile and credits types
export type UserRole = z.infer<typeof userRoleEnum>;
export type UserStatus = z.infer<typeof userStatusEnum>;
export type Profile = z.infer<typeof profileSchema>;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;

// Settings types
export type Settings = z.infer<typeof settingsSchema>;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type UpdateSettings = z.infer<typeof updateSettingsSchema>;
export type CreditConfig = z.infer<typeof creditConfigSchema>;

// Credit transaction types
export type CreditTransactionType = z.infer<typeof creditTransactionTypeEnum>;
export type CreditTransaction = z.infer<typeof creditTransactionSchema>;
export type InsertCreditTransaction = z.infer<typeof insertCreditTransactionSchema>;

// Legacy user types (kept for compatibility)
export type User = z.infer<typeof users>;
export type InsertUser = z.infer<typeof insertUsersSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type UserResponse = z.infer<typeof userResponse>;

// App types
export type App = z.infer<typeof appSchema>;
export type InsertApp = z.infer<typeof insertAppSchema>;
export type UpdateApp = z.infer<typeof updateAppSchema>;
export type UserAppSummary = z.infer<typeof userAppSummarySchema>;

// App assignment types
export type AppAssignment = z.infer<typeof appAssignmentSchema>;
export type InsertAppAssignment = z.infer<typeof insertAppAssignmentSchema>;
export type UpdateAppAssignment = z.infer<typeof updateAppAssignmentSchema>;

export type GenerationStatus = z.infer<typeof generationStatusEnum>;
export type GenerationMode = z.infer<typeof generationModeEnum>;
export type GenerationType = z.infer<typeof generationTypeEnum>;
export type GenerationRequest = z.infer<typeof generationRequests>;
export type InsertGenerationRequest = z.infer<typeof insertGenerationRequestSchema>;
export type CreateGenerationRequest = z.infer<typeof createGenerationRequestSchema>;
export type UpdateGenerationRequest = z.infer<typeof updateGenerationRequestSchema>;
export type GenerationRequestWithUser = z.infer<typeof generationRequestWithUser>;
export type GenerationRequestWithApp = z.infer<typeof generationRequestWithAppSchema>;

// Attachment types
export type AttachmentMetadata = z.infer<typeof attachmentMetadataSchema>;

// Feedback types
export type FeedbackType = z.infer<typeof feedbackTypeEnum>;
export type FeedbackStatus = z.infer<typeof feedbackStatusEnum>;
export type FeedbackAttachment = z.infer<typeof feedbackAttachmentSchema>;
export type UserFeedback = z.infer<typeof userFeedbackSchema>;
export type CreateFeedback = z.infer<typeof createFeedbackSchema>;
export type UpdateFeedback = z.infer<typeof updateFeedbackSchema>;
