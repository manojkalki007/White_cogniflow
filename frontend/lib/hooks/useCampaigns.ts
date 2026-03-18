import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

// Types
export interface Campaign {
  id: string;
  name: string;
  smallestAgentId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED' | 'FAILED';
  totalContacts: number;
  processedCount: number;
  failedCount: number;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  activeHoursFrom: string | null;
  activeHoursTo: string | null;
  createdAt: string;
}

export const useCampaigns = (organizationId: string, page = 1) => {
  return useQuery({
    queryKey: ['campaigns', organizationId, page],
    queryFn: async () => {
      const { data } = await api.get<{ data: Campaign[]; total: number }>(`/campaigns`, {
        params: { organizationId, page },
      });
      return data;
    },
  });
};

export const useCampaign = (id: string) => {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: async () => {
      const { data } = await api.get<{ data: Campaign }>(`/campaigns/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Campaign>;
    }) => {
      const { data } = await api.patch(`/campaigns/${id}`, updates);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns', variables.id] });
    },
  });
};
