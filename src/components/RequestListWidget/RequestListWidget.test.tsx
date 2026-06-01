import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RequestListWidget } from './RequestListWidget';

vi.mock('../../hooks/useServiceRequests', () => ({
  useServiceRequests: () => ({
    data: [
      {
        id: '1', title: 'Fix the printer', status: 'Open', priority: 'High',
        requesterName: 'Alice', requesteeName: 'Bob',
        createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z',
        description: null, requesterId: 'a', requesteeId: 'b',
      },
    ],
    isLoading: false,
    isError: false,
  }),
}));

const mockSetSelectedId = vi.fn();
vi.mock('../../context/SelectionContext', () => ({
  useSelection: () => ({ selectedId: null, setSelectedId: mockSetSelectedId }),
}));

describe('RequestListWidget', () => {
  it('renders the widget heading', () => {
    render(<RequestListWidget />);
    expect(screen.getByText('All Requests')).toBeInTheDocument();
  });

  it('shows request data in the grid', () => {
    render(<RequestListWidget />);
    expect(screen.getByText('Fix the printer')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });
});
