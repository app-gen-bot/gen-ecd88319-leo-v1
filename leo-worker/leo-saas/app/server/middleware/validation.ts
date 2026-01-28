import { Request, Response, NextFunction } from 'express';
import { body, validationResult, param, query } from 'express-validator';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Input Validation and Sanitization Middleware
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 * Allows only safe HTML tags and attributes
 */
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'title', 'target'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
};

/**
 * Common Validation Rules
 */
export const validationRules = {
  /**
   * Email validation
   */
  email: body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),

  /**
   * Password validation
   * Requires at least 8 characters
   */
  password: body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),

  /**
   * Strong password validation
   * Requires uppercase, lowercase, number, and special character
   */
  strongPassword: body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character (@$!%*?&)'
    ),

  /**
   * User ID validation (UUID format)
   */
  userId: param('userId')
    .isUUID()
    .withMessage('Invalid user ID format'),

  /**
   * Numeric ID validation
   */
  numericId: param('id')
    .isInt({ min: 1 })
    .toInt()
    .withMessage('Invalid ID - must be a positive integer'),

  /**
   * Pagination parameters
   */
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .toInt()
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .toInt()
      .withMessage('Limit must be between 1 and 100'),
  ],

  /**
   * Generation prompt validation
   */
  generationPrompt: body('prompt')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Prompt must be between 10 and 5000 characters')
    .customSanitizer((value) => {
      // Remove any potential script tags or dangerous HTML
      return sanitizeHtml(value);
    }),

  /**
   * Sanitize all string inputs
   */
  sanitizeAllStrings: body('*').customSanitizer((value) => {
    if (typeof value === 'string') {
      // Trim whitespace
      let sanitized = value.trim();

      // Remove null bytes
      sanitized = sanitized.replace(/\0/g, '');

      // Sanitize HTML
      sanitized = sanitizeHtml(sanitized);

      return sanitized;
    }
    return value;
  }),
};

/**
 * Validation Error Handler Middleware
 * Collects and formats validation errors from express-validator
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined,
    }));

    console.log('[Validation] ❌ Validation failed:', formattedErrors);

    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: formattedErrors,
    });
  }

  next();
};

/**
 * SQL Injection Prevention Helper
 * Use this for raw queries (though you should prefer parameterized queries)
 */
export const preventSqlInjection = (input: string): string => {
  // Remove or escape dangerous characters
  return input
    .replace(/['";\\]/g, '') // Remove quotes, semicolons, backslashes
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove multi-line comments start
    .replace(/\*\//g, '') // Remove multi-line comments end
    .replace(/xp_/gi, '') // Remove extended stored procedures
    .replace(/script/gi, '') // Remove script tags
    .replace(/union/gi, '') // Remove UNION statements
    .replace(/select/gi, '') // Remove SELECT statements
    .replace(/insert/gi, '') // Remove INSERT statements
    .replace(/update/gi, '') // Remove UPDATE statements
    .replace(/delete/gi, '') // Remove DELETE statements
    .replace(/drop/gi, '') // Remove DROP statements
    .replace(/create/gi, '') // Remove CREATE statements
    .replace(/alter/gi, ''); // Remove ALTER statements
};

/**
 * NoSQL Injection Prevention Helper
 * Use for MongoDB or similar NoSQL databases
 */
export const preventNoSqlInjection = (input: any): any => {
  if (typeof input === 'string') {
    // Remove $ operators and other dangerous patterns
    return input.replace(/[${}]/g, '');
  }

  if (typeof input === 'object' && input !== null) {
    // Check for $-prefixed keys (MongoDB operators)
    const keys = Object.keys(input);
    const hasDangerousKeys = keys.some(key => key.startsWith('$') || key.includes('.'));

    if (hasDangerousKeys) {
      console.warn('[Validation] ⚠️ Potential NoSQL injection attempt detected');
      throw new Error('Invalid input: Operators not allowed');
    }

    // Recursively sanitize nested objects
    const sanitized: any = {};
    for (const key of keys) {
      sanitized[key] = preventNoSqlInjection(input[key]);
    }
    return sanitized;
  }

  return input;
};

/**
 * Request Body Size Limiter
 * Prevents DoS attacks via large payloads
 */
export const limitRequestSize = (maxSizeBytes: number = 10 * 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSizeBytes) {
      console.log(`[Validation] 🚫 Request body too large: ${contentLength} bytes (max: ${maxSizeBytes})`);
      return res.status(413).json({
        error: 'Request body too large',
        code: 'PAYLOAD_TOO_LARGE',
        maxSize: maxSizeBytes,
      });
    }

    next();
  };
};
