import rateLimit from 'express-rate-limit';

/**
 * Rate Limiting Middleware
 *
 * NOTE: This implementation uses in-memory rate limiting for simplicity.
 * For production deployments with multiple instances, consider using Redis:
 *
 * import RedisStore from 'rate-limit-redis';
 * import Redis from 'ioredis';
 *
 * const redisClient = new Redis({
 *   host: process.env.REDIS_HOST,
 *   port: parseInt(process.env.REDIS_PORT || '6379'),
 *   password: process.env.REDIS_PASSWORD,
 * });
 *
 * Then add to each limiter:
 * store: new RedisStore({
 *   client: redisClient,
 *   prefix: 'rl:api:',
 * }),
 */

/**
 * General API Rate Limiter
 * Applies to all API endpoints except read-only operations
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: 15 * 60, // seconds
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  // Skip rate limiting for successful requests (optional)
  skipSuccessfulRequests: false,
  // Skip rate limiting for failed requests (optional)
  skipFailedRequests: false,
  // Skip rate limiting for GET requests (read-only operations that need polling)
  skip: (req) => {
    // Allow GET requests to poll without hitting rate limits
    // POST/PUT/DELETE still get rate limited
    return req.method === 'GET';
  },
  handler: (req, res) => {
    console.log(`[Rate Limiter] 🚫 API rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: 900, // 15 minutes in seconds
    });
  },
});

/**
 * Strict Rate Limiter for Authentication Endpoints
 * Prevents brute force attacks
 * 5 attempts per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    retryAfter: 15 * 60,
  },
  skipSuccessfulRequests: true, // Don't count successful logins
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`[Rate Limiter] 🚫 Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many authentication attempts. Please try again in 15 minutes.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      retryAfter: 900,
    });
  },
});

/**
 * Generation Endpoint Rate Limiter
 * Prevents abuse of resource-intensive generation endpoints
 * 10 POST requests per minute per IP (GET requests for polling are not limited)
 */
export const generationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit to 10 generations per minute
  message: {
    error: 'Generation rate limit exceeded. Please wait before requesting more.',
    code: 'GENERATION_RATE_LIMIT_EXCEEDED',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for GET requests (polling for generation status)
    // Only rate-limit POST/PUT/DELETE for creating/modifying generations
    return req.method === 'GET';
  },
  handler: (req, res) => {
    console.log(`[Rate Limiter] 🚫 Generation rate limit exceeded for ${(req as any).user?.id || req.ip}`);
    res.status(429).json({
      error: 'You are creating generations too quickly. Please wait a minute before trying again.',
      code: 'GENERATION_RATE_LIMIT_EXCEEDED',
      retryAfter: 60,
    });
  },
});

/**
 * Download Rate Limiter
 * Prevents bandwidth abuse
 * 20 downloads per hour per IP/user
 */
export const downloadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit to 20 downloads per hour
  message: {
    error: 'Download rate limit exceeded. Please try again later.',
    code: 'DOWNLOAD_RATE_LIMIT_EXCEEDED',
    retryAfter: 60 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (_req) => {
    // Optional: Skip rate limiting for certain conditions
    return false;
  },
  handler: (req, res) => {
    console.log(`[Rate Limiter] 🚫 Download rate limit exceeded for ${(req as any).user?.id || req.ip}`);
    res.status(429).json({
      error: 'Too many downloads. Please try again in an hour.',
      code: 'DOWNLOAD_RATE_LIMIT_EXCEEDED',
      retryAfter: 3600,
    });
  },
});
