const validator = require('validator');

/**
 * Input Sanitization Middleware - Medium Security Enhancement
 * Protects against XSS attacks by sanitizing user inputs
 */

/**
 * Sanitize a string value
 */
function sanitizeString(value) {
  if (typeof value !== 'string') return value;
  
  // Escape HTML entities to prevent XSS
  return validator.escape(value);
}

/**
 * Sanitize an object recursively
 */
function sanitizeObject(obj) {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Don't sanitize password fields or already hashed values
      if (key.toLowerCase().includes('password') || 
          key.toLowerCase().includes('hash') ||
          key.toLowerCase().includes('token')) {
        sanitized[key] = value;
      } else {
        sanitized[key] = sanitizeObject(value);
      }
    }
    return sanitized;
  }
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  return obj;
}

/**
 * Middleware to sanitize request body
 */
function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
}

/**
 * Middleware to sanitize query parameters
 */
function sanitizeQuery(req, res, next) {
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  next();
}

/**
 * Middleware to sanitize URL parameters
 */
function sanitizeParams(req, res, next) {
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  next();
}

/**
 * Combined sanitization middleware
 */
function sanitizeAll(req, res, next) {
  sanitizeBody(req, res, () => {
    sanitizeQuery(req, res, () => {
      sanitizeParams(req, res, next);
    });
  });
}

/**
 * Validate and sanitize email
 */
function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') return null;
  
  const normalized = validator.normalizeEmail(email);
  if (!normalized || !validator.isEmail(normalized)) {
    return null;
  }
  
  return normalized;
}

/**
 * Validate and sanitize URL
 */
function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return null;
  
  if (!validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true })) {
    return null;
  }
  
  return validator.escape(url);
}

/**
 * Sanitize filename to prevent path traversal
 */
function sanitizeFilename(filename) {
  if (!filename || typeof filename !== 'string') return null;
  
  // Remove path separators and special characters
  return filename
    .replace(/[\/\\]/g, '')
    .replace(/\.\./g, '')
    .replace(/[<>:"|?*]/g, '')
    .trim();
}

module.exports = {
  sanitizeString,
  sanitizeObject,
  sanitizeBody,
  sanitizeQuery,
  sanitizeParams,
  sanitizeAll,
  sanitizeEmail,
  sanitizeUrl,
  sanitizeFilename,
};

// Made with Bob
