import axios from 'axios';
import type { ServiceRequest } from '../types';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000',
});

export const getServiceRequests = (): Promise<ServiceRequest[]> =>
  client.get<ServiceRequest[]>('/api/service-requests').then(r => r.data);

export const getTopPending = (): Promise<ServiceRequest[]> =>
  client.get<ServiceRequest[]>('/api/service-requests/top-pending').then(r => r.data);

export const getServiceRequest = (id: string): Promise<ServiceRequest> =>
  client.get<ServiceRequest>(`/api/service-requests/${id}`).then(r => r.data);
