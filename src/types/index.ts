export interface ServiceRequest {
  id: string;
  title: string;
  description: string | null;
  requesterId: string;
  requesterName: string;
  requesteeId: string;
  requesteeName: string;
  createdAt: string;
  updatedAt: string;
}
