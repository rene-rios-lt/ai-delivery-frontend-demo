import { Chip } from '@mui/material';
import type { RequestStatus } from '../../types';

const colorMap: Record<RequestStatus, 'primary' | 'warning' | 'success'> = {
  Open: 'primary',
  InProgress: 'warning',
  Completed: 'success',
};

interface Props {
  status: RequestStatus;
}

export function StatusChip({ status }: Props) {
  return <Chip label={status} color={colorMap[status]} size="small" />;
}
