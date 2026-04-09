import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';

// Drivers
export const useDrivers = () => {
  return useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      const { data } = await apiClient.get('/drivers');
      return data;
    }
  });
};

export const useCreateDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (driverData) => apiClient.post('/drivers', driverData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    }
  });
};

export const useTransferDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ driverId, teamId }) => 
      apiClient.put(`/drivers/${driverId}/transfer`, { teamId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    }
  });
};

export const useDeleteDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (driverId) => apiClient.delete(`/drivers/${driverId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    }
  });
};

// Teams
export const useTeams = () => {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data } = await apiClient.get('/teams');
      return data;
    }
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamData) => apiClient.post('/teams', teamData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    }
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId) => apiClient.delete(`/teams/${teamId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['teams']);
    }
  });
};

// Seasons
export const useSeasons = () => {
  return useQuery({
    queryKey: ['seasons'],
    queryFn: async () => {
      const { data } = await apiClient.get('/seasons');
      return data;
    }
  });
};

export const useSeasonEvents = (seasonId) => {
  return useQuery({
    queryKey: ['seasonEvents', seasonId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/seasons/${seasonId}/events`);
      return data;
    },
    enabled: !!seasonId
  });
};

export const useCreateSeason = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (seasonData) => apiClient.post('/seasons', seasonData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seasons'] });
    }
  });
};

export const useUpdateSeason = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ seasonId, updates }) => 
      apiClient.put(`/seasons/${seasonId}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['seasons']);
    }
  });
};

export const useAddEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ seasonId, eventData }) => 
      apiClient.post(`/seasons/${seasonId}/events`, eventData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['seasonEvents', variables.seasonId] });
    }
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, updates }) => 
      apiClient.patch(`/seasons/events/${eventId}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seasonEvents'] });
    }
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId) => apiClient.delete(`/seasons/events/${eventId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seasonEvents'] });
    }
  });
};

export const useTracks = () => {
  return useQuery({
    queryKey: ['tracks'],
    queryFn: async () => {
      const { data } = await apiClient.get('/tracks');
      return data;
    }
  })
};

// Calendar & Results
export const useCalendarForPaddock = () => {
  return useQuery({
    queryKey: ['calendar'],
    queryFn: async () => {
      const { data } = await apiClient.get('/calendar');
      return data;
    }
  });
};

export const useStartingGrid = (eventId, sessionType) => {
  return useQuery({
    queryKey: ['startingGrid', eventId, sessionType],
    queryFn: async () => {
      const { data } = await apiClient.get(`/events/${eventId}/starting-grid?session=${sessionType}`);
      // data now contains { type, gridSourceSession?, data: [...] }
      return data;
    },
    enabled: !!eventId && !!sessionType
  });
};

export const useFinalizeResults = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (resultsPayload) => apiClient.post('/events/finalize', resultsPayload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['startingGrid'] });
    }
  });
};