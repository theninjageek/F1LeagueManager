import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../lib/authApi';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (authApi.isAuthenticated()) {
        const response = await authApi.getCurrentUser();
        if (response.success) {
          setUser(response.data.user);
        }
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      authApi.removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setError(null);
      const response = await authApi.login(username, password);
      
      console.log('Login response:', response); // Debug log
      
      if (response.success && response.data && response.data.user) {
        setUser(response.data.user);
        return { success: true };
      }
      
      const message = response.message || 'Login failed';
      setError(message);
      return { success: false, message };
    } catch (err) {
      console.error('Login error:', err);
      const message = err.message || 'Login failed';
      setError(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setError(null);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      const response = await authApi.changePassword(currentPassword, newPassword);
      
      if (response.success) {
        // Password changed successfully, need to re-login
        await logout();
        return { success: true, message: response.message };
      }
      
      return { success: false, message: response.message || 'Password change failed' };
    } catch (err) {
      const message = err.message || 'Password change failed';
      setError(message);
      return { success: false, message };
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    changePassword,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};