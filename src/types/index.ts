export type RequestStatus = 'Open' | 'InProgress' | 'Completed';

export interface ServiceRequest {
  id: string;
  title: string;
  description: string | null;
  requesterId: string;
  requesterName: string;
  requesteeId: string;
  requesteeName: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}
