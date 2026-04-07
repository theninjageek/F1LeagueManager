import { useApi } from './useApi';

/**
 * Fetch the full race calendar
 */
export const useCalendar = () => {
  return useApi(
    ['calendar'],
    '/calendar',
    {
      refetchInterval: 60000, // Refetch every minute
      staleTime: 60000
    }
  );
};