export type RequestStatus = 'Open' | 'InProgress' | 'Completed';
export type Priority = 'Low' | 'Medium' | 'High';

export interface ServiceRequest {
  id: string;
  title: string;
  description: string | null;
  status: RequestStatus;
  priority: Priority;
  requesterId: string;
  requesterName: string;
  requesteeId: string;
  requesteeName: string;
  createdAt: string;
  updatedAt: string;
}
