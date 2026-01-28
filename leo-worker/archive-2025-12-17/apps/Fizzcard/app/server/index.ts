/**
 * FizzCard Backend Server
 *
 * Express server with factory-pattern auth and storage
 */

// CRITICAL: Load environment variables FIRST, before any other imports
// This ensures factories get the correct environment configuration
import dotenv from 'dotenv';
import path from 'path';

// Try multiple paths for .env file to handle both dev and production
// In production: __dirname is /app/server/dist/server
// In development: __dirname is /app/server
const possibleEnvPaths = [
  path.resolve(__dirname, '../../../.env'),  // Production: /app/.env
  path.resolve(__dirname, '../.env'),        // Development: /app/.env
  path.resolve(__dirname, '../../.env'),     // Alternative path
];

let envLoaded = false;
for (const envPath of possibleEnvPaths) {
  try {
    const result = dotenv.config({ path: envPath });
    if (!result.error) {
      console.log('[ENV] Loaded from:', envPath);
      envLoaded = true;
      break;
    }
  } catch (error) {
    // Silently continue to next path
  }
}

if (!envLoaded) {
  console.log('[ENV] No .env file found, using environment variables from system');
  // This is expected in production where env vars come from Fly.io secrets
} else {
  console.log('[ENV] FIZZCOIN_CONTRACT_ADDRESS:', process.env.FIZZCOIN_CONTRACT_ADDRESS ? 'SET' : 'NOT SET');
}

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import routes from './routes';
import { walletMonitorService } from './services/wallet-monitor.service';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5013;

// Middleware
app.use(cors());
// Increase JSON body limit to handle base64 encoded images (up to 10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
    );
  });
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: {
      authMode: process.env.AUTH_MODE || 'mock',
      storageMode: process.env.STORAGE_MODE || 'memory',
      nodeEnv: process.env.NODE_ENV || 'development',
    },
  });
});

// Mount API routes
app.use('/api', routes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // __dirname is /app/server/dist/server, so we need to go up to /app, then to client/dist
  const clientDistPath = path.join(__dirname, '../../../client/dist');
  app.use(express.static(clientDistPath));

  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // 404 handler for development (frontend runs separately)
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not found',
      path: req.path,
    });
  });
}

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[Server Error]', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('='.repeat(60));
  console.log('  FizzCard Backend Server');
  console.log('='.repeat(60));
  console.log(`  Port:         ${PORT}`);
  console.log(`  Auth Mode:    ${process.env.AUTH_MODE || 'mock'}`);
  console.log(`  Storage Mode: ${process.env.STORAGE_MODE || 'memory'}`);
  console.log(`  Environment:  ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(60));
  console.log('');
  console.log(`  Server is running at http://localhost:${PORT}`);
  console.log(`  Health check: http://localhost:${PORT}/health`);
  console.log('');

  // Start wallet balance monitoring (check every 5 minutes)
  if (process.env.STORAGE_MODE === 'database') {
    walletMonitorService.startMonitoring(5);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n[Server] SIGTERM signal received: closing HTTP server');
  walletMonitorService.stopMonitoring();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n[Server] SIGINT signal received: closing HTTP server');
  walletMonitorService.stopMonitoring();
  process.exit(0);
});

export default app;
