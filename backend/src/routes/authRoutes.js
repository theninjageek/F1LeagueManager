const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/authMiddleware');
const { validatePassword, validateUsername, sanitizeInput, validateRequiredFields } = require('../utils/authValidators');
const rateLimit = require('express-rate-limit');

/**
 * Rate limiters for auth endpoints
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour
  message: {
    success: false,
    message: 'Too many registration attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/auth/login
 * Authenticate user and create session
 */
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    const validation = validateRequiredFields(req.body, ['username', 'password']);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Sanitize username
    const sanitizedUsername = sanitizeInput(username);

    // Authenticate user
    const user = await authService.authenticateUser(sanitizedUsername, password);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Create session
    const session = await authService.createSession(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          created_at: user.created_at,
          last_login: user.last_login
        },
        token: session.token,
        expiresAt: session.expiresAt
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout
 * Destroy user session
 */
router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    const token = req.headers.authorization?.substring(7) || req.cookies?.session_token;

    if (token) {
      await authService.destroySession(token);
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/change-password
 * Change current user's password
 */
router.post('/change-password', requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    const validation = validateRequiredFields(req.body, ['currentPassword', 'newPassword']);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors
      });
    }

    // Change password
    const success = await authService.changePassword(req.user.id, currentPassword, newPassword);

    if (!success) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    res.json({
      success: true,
      message: 'Password changed successfully. Please log in again.'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/register
 * Create a new admin user (requires authentication)
 */
router.post('/register', requireAuth, registerLimiter, async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    const validation = validateRequiredFields(req.body, ['username', 'password']);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Sanitize username
    const sanitizedUsername = sanitizeInput(username);

    // Validate username
    const usernameValidation = validateUsername(sanitizedUsername);
    if (!usernameValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Username validation failed',
        errors: usernameValidation.errors
      });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors
      });
    }

    // Check if username already exists
    const exists = await authService.usernameExists(sanitizedUsername);
    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Create user
    const user = await authService.createUser(sanitizedUsername, password);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: user.id,
          username: user.username,
          created_at: user.created_at
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/users
 * Get all users (requires authentication)
 */
router.get('/users', requireAuth, async (req, res, next) => {
  try {
    const users = await authService.getAllUsers();

    res.json({
      success: true,
      data: {
        users
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/auth/users/:userId
 * Delete a user (requires authentication)
 */
router.delete('/users/:userId', requireAuth, async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);

    // Prevent user from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const success = await authService.deleteUser(userId);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/auth/users/:userId
 * Update user details (admin action, requires authentication)
 */
router.put('/users/:userId', requireAuth, async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    // Sanitize username
    const sanitizedUsername = sanitizeInput(username);

    // Validate username
    const usernameValidation = validateUsername(sanitizedUsername);
    if (!usernameValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Username validation failed',
        errors: usernameValidation.errors
      });
    }

    // Check if username already exists (excluding current user)
    const existingUser = await authService.getUserByUsername(sanitizedUsername);
    if (existingUser && existingUser.id !== userId) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Update username
    const result = await pool.query(
      'UPDATE admin_users SET username = $1 WHERE id = $2 RETURNING id, username, created_at, last_login',
      [sanitizedUsername, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: result.rows[0]
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/users/:userId/reset-password
 * Reset user password (admin action, requires authentication)
 */
router.post('/users/:userId/reset-password', requireAuth, async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);
    const { newPassword } = req.body;

    // Validate required fields
    const validation = validateRequiredFields(req.body, ['newPassword']);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Validate password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors
      });
    }

    const success = await authService.resetPassword(userId, newPassword);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;