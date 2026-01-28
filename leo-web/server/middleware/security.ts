import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

/**
 * Security Headers Middleware
 * Implements comprehensive HTTP security headers using helmet
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for React inline scripts
        "https://cdn.jsdelivr.net",
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for styled-components and CSS-in-JS
      ],
      imgSrc: [
        "'self'",
        "data:", // Required for inline images
        "https:", // Allow HTTPS images
      ],
      connectSrc: [
        "'self'",
        "wss:", // WebSocket connections
        "ws:", // WebSocket connections (HTTP)
        "https:", // API calls (HTTPS)
        "http:", // API calls (HTTP - for development/HTTP-only deployment)
        process.env.SUPABASE_URL || '',
      ].filter(Boolean),
      fontSrc: [
        "'self'",
        "https:",
        "data:",
      ],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      // Explicitly disable upgrade-insecure-requests for HTTP-only deployment
      upgradeInsecureRequests: null,
    },
  },
  // Explicitly disable HSTS until HTTPS/domain is configured
  hsts: false,
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  hidePoweredBy: true, // Remove X-Powered-By header
});

/**
 * Custom Security Headers Middleware
 * Adds additional security headers not covered by helmet
 */
export const customSecurityHeaders = (_req: Request, res: Response, next: NextFunction) => {
  // Permissions Policy (formerly Feature Policy)
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(self), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );

  // Ensure X-Powered-By is removed (belt and suspenders approach)
  res.removeHeader('X-Powered-By');

  // Add custom security header to identify protected responses
  res.setHeader('X-Security-Version', '1.0');

  next();
};

/**
 * Block Sensitive Paths Middleware
 * Returns 404 (not 401/403) to avoid information disclosure
 */
export const blockSensitivePaths = (req: Request, res: Response, next: NextFunction) => {
  const path = req.path.toLowerCase();

  const blockedPaths = [
    '.env',
    '.git',
    '.aws',
    '.ssh',
    'config',
    'backup',
    'admin.php',
    'phpmyadmin',
    'mysql',
    'wp-admin',
    'wp-login',
    '.htaccess',
    '.htpasswd',
    'credentials',
    'secrets',
    '.npmrc',
    '.dockerenv',
  ];

  // Check if path contains any blocked patterns
  const isBlocked = blockedPaths.some(blocked => path.includes(blocked));

  if (isBlocked) {
    console.log(`[Security] 🚫 Blocked attempt to access sensitive path: ${req.path}`);
    console.log(`[Security]    IP: ${req.ip || req.socket.remoteAddress}`);
    console.log(`[Security]    User-Agent: ${req.headers['user-agent']?.substring(0, 100)}`);

    // Return 404 instead of 401/403 to avoid information disclosure
    return res.status(404).send('Not Found');
  }

  next();
};
