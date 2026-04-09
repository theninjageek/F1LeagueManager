const argon2 = require('argon2');
const crypto = require('crypto');
const pool = require('../config/db');

/**
 * Authentication Service
 * Handles user authentication, session management, and password operations
 */

class AuthService {
  /**
   * Hash password using Argon2id
   * @param {string} password - Plain text password
   * @returns {Promise<string>} - Hashed password
   */
  async hashPassword(password) {
    try {
      return await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 65536, // 64 MB
        timeCost: 3,
        parallelism: 4
      });
    } catch (error) {
      throw new Error('Password hashing failed');
    }
  }

  /**
   * Verify password against hash
   * @param {string} hash - Stored password hash
   * @param {string} password - Plain text password to verify
   * @returns {Promise<boolean>} - True if password matches
   */
  async verifyPassword(hash, password) {
    try {
      return await argon2.verify(hash, password);
    } catch (error) {
      return false;
    }
  }

  /**
   * Create a new user
   * @param {string} username - Username
   * @param {string} password - Plain text password
   * @returns {Promise<Object>} - Created user (without password)
   */
  async createUser(username, password) {
    const passwordHash = await this.hashPassword(password);
    
    const result = await pool.query(
      `INSERT INTO admin_users (username, password_hash, created_at)
       VALUES ($1, $2, NOW())
       RETURNING id, username, created_at`,
      [username, passwordHash]
    );

    return result.rows[0];
  }

  /**
   * Authenticate user with username and password
   * @param {string} username - Username
   * @param {string} password - Plain text password
   * @returns {Promise<Object|null>} - User object if authenticated, null otherwise
   */
  async authenticateUser(username, password) {
    // Fetch user with password hash
    const result = await pool.query(
      'SELECT id, username, password_hash, created_at, last_login FROM admin_users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      // User not found - still verify a dummy password to prevent timing attacks
      await argon2.hash('dummy_password');
      return null;
    }

    const user = result.rows[0];
    
    // Verify password
    const isValid = await this.verifyPassword(user.password_hash, password);
    
    if (!isValid) {
      return null;
    }

    // Update last login
    await pool.query(
      'UPDATE admin_users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Create a session for a user
   * @param {number} userId - User ID
   * @returns {Promise<Object>} - Session object with token
   */
  async createSession(userId) {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await pool.query(
      `INSERT INTO sessions (id, user_id, created_at, expires_at)
       VALUES ($1, $2, NOW(), $3)`,
      [sessionId, userId, expiresAt]
    );

    return {
      token: sessionId,
      expiresAt
    };
  }

  /**
   * Validate a session token
   * @param {string} token - Session token
   * @returns {Promise<Object|null>} - User object if session is valid, null otherwise
   */
  async validateSession(token) {
    if (!token) {
      return null;
    }

    const result = await pool.query(
      `SELECT s.id, s.user_id, s.expires_at, u.username, u.created_at, u.last_login
       FROM sessions s
       JOIN admin_users u ON s.user_id = u.id
       WHERE s.id = $1 AND s.expires_at > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return {
      id: result.rows[0].user_id,
      username: result.rows[0].username,
      created_at: result.rows[0].created_at,
      last_login: result.rows[0].last_login
    };
  }

  /**
   * Destroy a session (logout)
   * @param {string} token - Session token
   * @returns {Promise<boolean>} - True if session was deleted
   */
  async destroySession(token) {
    const result = await pool.query(
      'DELETE FROM sessions WHERE id = $1',
      [token]
    );

    return result.rowCount > 0;
  }

  /**
   * Clean up expired sessions
   * @returns {Promise<number>} - Number of deleted sessions
   */
  async cleanupExpiredSessions() {
    const result = await pool.query(
      'DELETE FROM sessions WHERE expires_at < NOW()'
    );

    return result.rowCount;
  }

  /**
   * Get user by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} - User object (without password)
   */
  async getUserById(userId) {
    const result = await pool.query(
      'SELECT id, username, created_at, last_login FROM admin_users WHERE id = $1',
      [userId]
    );

    return result.rows[0] || null;
  }

  /**
   * Get user by username
   * @param {string} username - Username
   * @returns {Promise<Object|null>} - User object (without password)
   */
  async getUserByUsername(username) {
    const result = await pool.query(
      'SELECT id, username, created_at, last_login FROM admin_users WHERE username = $1',
      [username]
    );

    return result.rows[0] || null;
  }

  /**
   * Change user password
   * @param {number} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} - True if password was changed
   */
  async changePassword(userId, currentPassword, newPassword) {
    // Fetch user with password hash
    const result = await pool.query(
      'SELECT password_hash FROM admin_users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return false;
    }

    const user = result.rows[0];
    
    // Verify current password
    const isValid = await this.verifyPassword(user.password_hash, currentPassword);
    
    if (!isValid) {
      return false;
    }

    // Hash new password and update
    const newPasswordHash = await this.hashPassword(newPassword);
    
    await pool.query(
      'UPDATE admin_users SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, userId]
    );

    // Invalidate all existing sessions for this user (force re-login)
    await pool.query(
      'DELETE FROM sessions WHERE user_id = $1',
      [userId]
    );

    return true;
  }

  /**
   * Reset user password (admin action)
   * @param {number} userId - User ID
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} - True if password was reset
   */
  async resetPassword(userId, newPassword) {
    const newPasswordHash = await this.hashPassword(newPassword);
    
    const result = await pool.query(
      'UPDATE admin_users SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, userId]
    );

    // Invalidate all existing sessions for this user
    await pool.query(
      'DELETE FROM sessions WHERE user_id = $1',
      [userId]
    );

    return result.rowCount > 0;
  }

  /**
   * Delete a user
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} - True if user was deleted
   */
  async deleteUser(userId) {
    const result = await pool.query(
      'DELETE FROM admin_users WHERE id = $1',
      [userId]
    );

    return result.rowCount > 0;
  }

  /**
   * Get all users
   * @returns {Promise<Array>} - Array of user objects (without passwords)
   */
  async getAllUsers() {
    const result = await pool.query(
      'SELECT id, username, created_at, last_login FROM admin_users ORDER BY created_at DESC'
    );

    return result.rows;
  }

  /**
   * Check if username exists
   * @param {string} username - Username to check
   * @returns {Promise<boolean>} - True if username exists
   */
  async usernameExists(username) {
    const result = await pool.query(
      'SELECT id FROM admin_users WHERE username = $1',
      [username]
    );

    return result.rows.length > 0;
  }
}

module.exports = new AuthService();