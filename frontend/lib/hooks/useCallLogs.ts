import { useQuery } from '@tanstack/react-query';
import api from '../api';

export interface CallLog {
  id: string;
  campaignId: string;
  contactId: string;
  smallestAiCallId: string | null;
  status:
    | 'PENDING'
    | 'INITIATED'
    | 'RINGING'
    | 'IN_CALL'
    | 'COMPLETED'
    | 'FAILED'
    | 'NO_ANSWER'
    | 'BUSY';
  duration: number | null;
  recordingUrl: string | null;
  transcript: string | null;
  disconnectReason: string | null;
  postCallMetrics: any;
  createdAt: string;

  contact: {
    name: string | null;
    phoneNumber: string;
    email: string | null;
  };
  campaign: {
    name: string;
    smallestAgentId: string;
  };
}

export const useCallLogs = ({
  organizationId,
  campaignId,
  page = 1,
}: {
  organizationId?: string;
  campaignId?: string;
  page?: number;
}) => {
  return useQuery({
    queryKey: ['callLogs', { organizationId, campaignId, page }],
    queryFn: async () => {
      const { data } = await api.get<{ data: CallLog[]; total: number }>(`/call-logs`, {
        params: { organizationId, campaignId, page },
      });
      return data;
    },
  });
};

export const useCallLogDetails = (id: string) => {
  return useQuery({
    queryKey: ['callLogs', id],
    queryFn: async () => {
      const { data } = await api.get<{ data: CallLog }>(`/call-logs/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};
