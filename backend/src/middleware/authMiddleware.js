const authService = require('../services/authService');

/**
 * Authentication Middleware
 * Protects routes by validating session tokens
 */

/**
 * Middleware to require authentication
 * Validates session token from Authorization header or cookies
 */
async function requireAuth(req, res, next) {
  try {
    // Get token from Authorization header or cookie
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Validate session
    const user = await authService.validateSession(token);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
}

/**
 * Optional authentication middleware
 * Attaches user if authenticated, but doesn't block if not
 */
async function optionalAuth(req, res, next) {
  try {
    const token = extractToken(req);

    if (token) {
      const user = await authService.validateSession(token);
      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}

/**
 * Extract token from request
 * Checks Authorization header (Bearer token) and cookies
 */
function extractToken(req) {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookie
  if (req.cookies && req.cookies.session_token) {
    return req.cookies.session_token;
  }

  return null;
}

module.exports = {
  requireAuth,
  optionalAuth,
  extractToken
};