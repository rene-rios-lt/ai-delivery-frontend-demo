import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TopRequestsWidget } from './TopRequestsWidget';

vi.mock('../../hooks/useServiceRequests', () => ({
  useTopPending: () => ({
    data: [
      {
        id: '1', title: 'Server is down', status: 'Open', priority: 'High',
        requesterName: 'Carol', requesteeName: 'Dave',
        createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z',
        description: null, requesterId: 'c', requesteeId: 'd',
      },
    ],
    isLoading: false,
    isError: false,
  }),
}));

vi.mock('../../context/SelectionContext', () => ({
  useSelection: () => ({ selectedId: null, setSelectedId: vi.fn() }),
}));

describe('TopRequestsWidget', () => {
  it('renders heading', () => {
    render(<TopRequestsWidget />);
    expect(screen.getByText('Top Pending Requests')).toBeInTheDocument();
  });

  it('renders request cards', () => {
    render(<TopRequestsWidget />);
    expect(screen.getByText('Server is down')).toBeInTheDocument();
  });
});
