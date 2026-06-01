import { useQuery } from '@tanstack/react-query';
import { getServiceRequests, getTopPending, getServiceRequest } from '../services/api';

export function useServiceRequests() {
  return useQuery({ queryKey: ['service-requests'], queryFn: getServiceRequests });
}

export function useTopPending() {
  return useQuery({ queryKey: ['service-requests', 'top-pending'], queryFn: getTopPending });
}

export function useServiceRequest(id: string | null) {
  return useQuery({
    queryKey: ['service-requests', id],
    queryFn: () => getServiceRequest(id!),
    enabled: id !== null,
  });
}
