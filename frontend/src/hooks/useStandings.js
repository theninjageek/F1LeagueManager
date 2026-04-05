import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useStandings = (type = 'drivers') => {
  return useQuery({
    queryKey: ['standings', type], // Key changes when type changes -> triggers refetch
    queryFn: async () => {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/standings/${type}`);
      return data;
    },
    refetchInterval: 30000,
  });
};