import { useApi } from './useApi';

/**
 * Fetch driver or constructor standings
 * @param {string} type - 'drivers' or 'constructors'
 */
export const useStandings = (type = 'drivers') => {
  return useApi(
    ['standings', type],
    `/standings/${type}`,
    {
      refetchInterval: 30000, // Refetch every 30 seconds
      staleTime: 30000
    }
  );
};