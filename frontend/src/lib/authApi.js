import { apiClient } from './apiClient';

const TOKEN_KEY = 'f1_admin_token';

/**
 * Auth API Client
 * Handles authentication-related API calls
 */

export const authApi = {
  /**
   * Login user
   */
  async login(username, password) {
    try {
      const response = await apiClient.post('/auth/login', {
        username,
        password
      });
      
      // The apiClient interceptor extracts data from the wrapper
      // response.data is now { user, token, expiresAt }
      if (response.data && response.data.token) {
        this.setToken(response.data.token);
        return {
          success: true,
          data: response.data
        };
      }
      
      return {
        success: false,
        message: 'Invalid response from server'
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || error.data?.message || 'Login failed'
      };
    }
  },

  /**
   * Logout user
   */
  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.removeToken();
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to get user'
      };
    }
  },

  /**
   * Register new user
   */
  async register(username, password) {
    try {
      const response = await apiClient.post('/auth/register', {
        username,
        password
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || error.data?.message || 'Registration failed',
        errors: error.data?.errors
      };
    }
  },

  /**
   * Get all users
   */
  async getUsers() {
    try {
      const response = await apiClient.get('/auth/users');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to get users'
      };
    }
  },

  /**
   * Update user
   */
  async updateUser(userId, username) {
    try {
      const response = await apiClient.put(`/auth/users/${userId}`, {
        username
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || error.data?.message || 'Failed to update user',
        errors: error.data?.errors
      };
    }
  },

  /**
   * Delete user
   */
  async deleteUser(userId) {
    try {
      await apiClient.delete(`/auth/users/${userId}`);
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to delete user'
      };
    }
  },

  /**
   * Reset user password
   */
  async resetPassword(userId, newPassword) {
    try {
      await apiClient.post(`/auth/users/${userId}/reset-password`, {
        newPassword
      });
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to reset password'
      };
    }
  },

  /**
   * Store token in localStorage
   */
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  /**
   * Get token from localStorage
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Remove token from localStorage
   */
  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getToken();
  }
};