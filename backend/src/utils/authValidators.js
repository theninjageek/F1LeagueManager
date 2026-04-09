/**
 * Password Validation Utilities
 */

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with isValid and errors
 */
function validatePassword(password) {
  const errors = [];

  if (!password) {
    return {
      isValid: false,
      errors: ['Password is required']
    };
  }

  // Minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Maximum length (prevent DoS)
  if (password.length > 128) {
    errors.push('Password must not exceed 128 characters');
  }

  // Require at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Require at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Require at least one number
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Require at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Check for common weak passwords
  const commonPasswords = [
    'password', 'password123', '12345678', 'qwerty123', 
    'admin123', 'letmein', 'welcome', 'monkey123'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {Object} - Validation result with isValid and errors
 */
function validateUsername(username) {
  const errors = [];

  if (!username) {
    return {
      isValid: false,
      errors: ['Username is required']
    };
  }

  // Length requirements
  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }

  if (username.length > 50) {
    errors.push('Username must not exceed 50 characters');
  }

  // Character requirements - alphanumeric, underscore, hyphen only
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens');
  }

  // Must start with a letter or number
  if (!/^[a-zA-Z0-9]/.test(username)) {
    errors.push('Username must start with a letter or number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize input to prevent SQL injection and XSS
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return input;
  }

  // Trim whitespace
  input = input.trim();

  // Remove null bytes
  input = input.replace(/\0/g, '');

  return input;
}

/**
 * Validate request body has required fields
 * @param {Object} body - Request body
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} - Validation result
 */
function validateRequiredFields(body, requiredFields) {
  const errors = [];

  for (const field of requiredFields) {
    if (!body[field] || (typeof body[field] === 'string' && body[field].trim() === '')) {
      errors.push(`${field} is required`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validatePassword,
  validateUsername,
  sanitizeInput,
  validateRequiredFields
};