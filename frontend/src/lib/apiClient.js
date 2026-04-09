import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = 'f1_admin_token';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle the new API response format
apiClient.interceptors.response.use(
  (response) => {
    // Extract data from { success, data, message } wrapper
    if (response.data?.success !== undefined) {
      return {
        ...response,
        data: response.data.data // Get just the data
      };
    }
    // Fallback for old format
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - remove invalid token
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      // Redirect to home page if trying to access paddock
      if (window.location.pathname.startsWith('/paddock')) {
        window.location.href = '/';
      }
    }

    // Handle errors
    const message = error.response?.data?.message || error.message || 'An error occurred';
    console.error('API Error:', message);
    
    // You can add more sophisticated error handling here
    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

export { apiClient };
export default apiClient;