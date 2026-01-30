// Load local environment config first (non-secrets only)
// This sets AWS_PROFILE, USE_AWS_ORCHESTRATOR, etc. before AWS SDK initializes
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: true });
dotenv.config({ override: true }); // Also load .env - override container env vars

// Now load secrets from AWS Secrets Manager (works locally too!)
import { loadConfig } from './config/aws-config.js';
import type { ValidationResult } from './config/aws-config.js';

const validation: ValidationResult = await loadConfig();

// Reset and re-initialize feedback storage with correct env vars after config loads
// Use dynamic import to avoid hoisting - the storage module may have been initialized
// with old container env vars before dotenv.config() ran
const { resetStorageClient, ensureFeedbackBucketExists } = await import('./lib/feedback-attachment-storage');
resetStorageClient();
ensureFeedbackBucketExists().catch(console.error);

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import generationsRoutes from './routes/generations';
import iterationsRoutes from './routes/iterations';
import transcribeRoutes from './routes/transcribe';
import feedbackRoutes from './routes/feedback';
import profileRoutes from './routes/profile';
import settingsRoutes from './routes/settings';
import analyticsRoutes from './routes/analytics';
import subscriptionsRoutes from './routes/subscriptions';
import stripeWebhooksRoutes from './routes/stripe-webhooks';
import assignmentsRoutes from './routes/assignments';
import { PRICING_TIERS } from './lib/stripe/client.js';
import { getWSIServer } from './lib/wsi/index.js';
import { securityHeaders, customSecurityHeaders, blockSensitivePaths } from './middleware/security';
import { apiLimiter, generationLimiter, downloadLimiter } from './middleware/rateLimiter';
import { authMiddleware } from './middleware/auth';
import { startStaleGenerationCleanup } from './lib/storage/database-storage';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load baked-in version manifest (immutable, written at build time)
// This provides provenance - proof of exactly which code is running
interface BuildManifest {
  commit: string;
  commitFull: string;
  buildTime: string;
  buildHost: string;
  repo: string;
}

let buildManifest: BuildManifest | null = null;
try {
  buildManifest = JSON.parse(fs.readFileSync('/build-manifest.json', 'utf-8'));
  console.log(`[VERSION] Loaded build manifest: ${buildManifest?.commit} (built ${buildManifest?.buildTime})`);
} catch {
  console.log('[VERSION] No build manifest found (dev mode)');
}

const app = express();
const PORT = process.env.PORT || 5013;

// REQUIRED: Trust ALB proxy headers for AWS deployment
// This ensures rate limiting and security work correctly behind load balancers
app.set('trust proxy', true);

// ============================================================================
// SECURITY MIDDLEWARE (Applied in specific order for maximum protection)
// ============================================================================

// 1. Block sensitive paths FIRST (before any processing)
app.use(blockSensitivePaths);

// 2. Security headers (helmet + custom headers)
app.use(securityHeaders);
app.use(customSecurityHeaders);

// 3. CORS configuration
// For SPA served from same origin, CORS is not needed for most requests
// But we still need to allow CORS for the ALB URL in production
// @ts-ignore - allowedOrigins reserved for future ALB allowlist implementation
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5173',  // Vite dev server
  'http://localhost:5013',  // Production local
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman, same-origin requests)
    if (!origin) return callback(null, true);

    // Allow all origins for now (SPA is served from same domain, so same-origin requests won't have Origin header)
    // TODO: Restrict to specific ALB URL once domain is configured
    callback(null, true);
  },
  credentials: true,
}));

// 4. Stripe Webhook route (MUST use raw body parser for signature verification)
// This MUST come BEFORE express.json() middleware
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhooksRoutes);

// 5. Body parsing with size limits (prevent DoS attacks via large payloads)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. General API rate limiting (applies to all /api/* routes)
app.use('/api/', apiLimiter);

// 🔍 COMPREHENSIVE REQUEST LOGGING (for debugging and security monitoring)
app.use((req, _res, next) => {
  const timestamp = new Date().toISOString();
  const authHeader = req.headers.authorization;
  const hasAuth = authHeader ? '✅ Auth Present' : '❌ No Auth';
  const authPreview = authHeader ? authHeader.substring(0, 20) + '...' : 'NONE';

  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  console.log(`  └─ Auth: ${hasAuth} (${authPreview})`);
  console.log(`  └─ Origin: ${req.headers.origin || 'NONE'}`);
  console.log(`  └─ IP: ${req.ip || req.socket.remoteAddress}`);
  console.log(`  └─ User-Agent: ${req.headers['user-agent']?.substring(0, 50) || 'NONE'}`);

  if (req.method === 'POST' && req.path.includes('/api/generations')) {
    console.log(`  └─ Body Keys: ${Object.keys(req.body).join(', ')}`);
  }

  next();
});

// Serve static files from dist directory in production
// Exclude index.html (handled by SPA fallback for config injection)
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath, {
    index: false,  // Don't serve index.html automatically
  }));
  console.log(`📦 Serving static files from: ${distPath}`);
}

// Startup logging - log ALL env vars and build manifest for debugging
console.log('========================================');
console.log('STARTUP CONFIG');
console.log('========================================');

// Log build manifest
try {
  const manifest = JSON.parse(fs.readFileSync('/build-manifest.json', 'utf-8'));
  console.log('Build:');
  Object.entries(manifest).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
} catch {
  console.log('Build: (no manifest - local dev?)');
}

// Log ALL environment variables
console.log('Environment:');
Object.entries(process.env)
  .sort(([a], [b]) => a.localeCompare(b))
  .forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });

console.log('========================================');

// ============================================================================
// APPLICATION ROUTES (with specific rate limiters)
// ============================================================================

// Apply generation-specific rate limiting to generation endpoints
import { Router } from 'express';
const generationsRouter = Router();
generationsRouter.use('/api/generations', generationLimiter);
app.use(generationsRouter);

// Apply download rate limiting to download endpoints
const downloadRouter = Router();
downloadRouter.use('/api/generations/:id/download', downloadLimiter);
app.use(downloadRouter);

// Main routes
app.use(generationsRoutes);
app.use(iterationsRoutes);
app.use(transcribeRoutes);
app.use(feedbackRoutes);
app.use(profileRoutes);
app.use(settingsRoutes);
app.use(assignmentsRoutes);  // App assignments for user role visibility
app.use('/api/admin/analytics', authMiddleware, analyticsRoutes);
// Public endpoint for pricing tiers (no auth required)
app.get('/api/subscriptions/products', (_req, res) => {
  res.json({ success: true, data: PRICING_TIERS });
});
// Protected subscription routes (require auth)
app.use('/api/subscriptions', authMiddleware, subscriptionsRoutes);

// ============================================================================
// HEALTH CHECK ENDPOINTS
// ============================================================================

// Minimal health check for ALB (unauthenticated)
// Returns status and version for deployment verification
// This endpoint is used by AWS Application Load Balancer for health checks
// Version is safe to expose - it's just a commit hash, provides provenance
app.get('/health', (_req, res) => {
  res.json({
    status: validation.valid ? 'ok' : 'degraded',
    version: buildManifest?.commit || 'dev',
    timestamp: new Date().toISOString(),
  });
});

// Detailed health check (authenticated - requires valid JWT)
// Returns comprehensive system information for debugging and monitoring
// SECURITY: Only accessible by authenticated users to prevent info disclosure
app.get('/api/health/detailed', authMiddleware, (_req, res) => {
  res.json({
    status: validation.valid ? 'healthy' : 'degraded',
    version: process.env.APP_VERSION || 'dev',
    mode: {
      useAwsOrchestrator: validation.mode.useAwsOrchestrator,
      useGithubIntegration: validation.mode.useGithubIntegration,
      local: validation.mode.local,
    },
    timestamp: new Date().toISOString(),
    // SECURITY: Intentionally excluded to prevent info disclosure:
    // - gitCommit (can be used to search GitHub for source code)
    // - buildTime (timing correlation for vulnerabilities)
    // - imageDigest (AWS infrastructure details)
    // - environment variable names (reveals attack surface)
  });
});

// Build manifest endpoint (for deployment verification)
// Serves the build manifest baked into the Docker image at build time
app.get('/build-manifest.json', (_req, res) => {
  try {
    const manifest = JSON.parse(fs.readFileSync('/build-manifest.json', 'utf-8'));
    res.json(manifest);
  } catch {
    res.status(404).json({ error: 'Build manifest not found (local dev?)' });
  }
});

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

// 404 handler for unknown API routes
app.use('/api/*', (_req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    code: 'NOT_FOUND',
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Log error details
  console.error('[Error Handler] ❌ Unhandled error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(err.status || 500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }

  // In development, return detailed error information
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
    stack: err.stack,
  });
});

// SPA fallback - serve index.html for all non-API routes in production
if (process.env.NODE_ENV === 'production') {
  const fs = await import('fs/promises');
  const distPath = path.join(__dirname, '..', 'dist', 'index.html');

  // Read index.html once at startup
  const indexHtmlTemplate = await fs.readFile(distPath, 'utf-8');

  app.get('*', (_req, res) => {
    // Inject runtime config into HTML
    const config = {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      apiUrl: process.env.API_URL || `http://localhost:${PORT}`,
    };

    const configScript = `<script>window.__APP_CONFIG__=${JSON.stringify(config)}</script>`;
    const htmlWithConfig = indexHtmlTemplate.replace('</head>', `${configScript}</head>`);

    res.setHeader('Content-Type', 'text/html');
    res.send(htmlWithConfig);
  });
}

// Create HTTP server and attach WSI Server
const server = createServer(app);
const wsiServer = getWSIServer();
wsiServer.attach(server, '/wsi');

// Start server
server.listen(PORT, async () => {
  const { getGitCommitShort } = await import('./lib/version.js');
  const gitCommit = await getGitCommitShort();

  // Start periodic stale generation cleanup (marks stuck generations as failed)
  startStaleGenerationCleanup();

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🚀 Leo Server - Production Ready with Security');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log(`📦 SAAS Version: ${gitCommit}`);
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log('🔌 WSI Server ready on ws://localhost:' + PORT + '/wsi');
  console.log('');
  console.log('📡 API Endpoints:');
  console.log('   POST /api/generations        - Create new generation');
  console.log('   GET  /api/generations        - List generations');
  console.log('   GET  /api/generations/:id    - Get generation details');
  console.log('   GET  /api/generations/:id/download - Download generated app');
  console.log('   POST /api/generations/:id/deploy   - Deploy to Fly.io');
  console.log('   GET  /health                 - Health check');
  console.log('');
  console.log('🔐 Security Features:');
  console.log('   ✓ Helmet security headers');
  console.log('   ✓ HSTS enforcement');
  console.log('   ✓ Content Security Policy');
  console.log('   ✓ Rate limiting (API, Auth, Generation)');
  console.log('   ✓ Sensitive path blocking');
  console.log('   ✓ Input validation & sanitization');
  console.log('   ✓ XSS protection');
  console.log('   ✓ Request size limits');
  console.log('');
  console.log('🔐 Auth: Frontend → Supabase SDK (JWT validation on backend)');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
});
