import { useQuery } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';

/**
 * Fetch available sessions for an event
 */
export const useAvailableSessions = (eventId) => {
  return useQuery({
    queryKey: ['sessions', eventId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/results/sessions/${eventId}`);
      return data;
    },
    enabled: !!eventId
  });
};

/**
 * Fetch results for a specific event and session
 */
export const useEventResults = (eventId, sessionType = 'GRAND_PRIX') => {
  return useQuery({
    queryKey: ['eventResults', eventId, sessionType],
    queryFn: async () => {
      const { data } = await apiClient.get(`/results/event/${eventId}?type=${sessionType}`);
      return data;
    },
    enabled: !!eventId && !!sessionType
  });
};

/**
 * Fetch Current Event
 */
export const useCurrentEvent = (eventId) => {
  return useQuery({
    queryKey: ['currentEvent', eventId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/calendar?event_id=${eventId}`);
      return data;
    },
    enabled: !!eventId
  });
};
