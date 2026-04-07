import { useQuery } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';

/**
 * Generic hook for fetching data
 * @param {string} queryKey - React Query key
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {object} options - useQuery options
 */
export const useApi = (queryKey, endpoint, options = {}) => {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await apiClient.get(endpoint);
      return data;
    },
    ...options
  });
};

export default useApi;