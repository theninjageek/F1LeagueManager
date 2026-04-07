import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000
});

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

export default apiClient;