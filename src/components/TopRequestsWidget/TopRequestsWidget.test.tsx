import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TopRequestsWidget } from './TopRequestsWidget';

const mockSetSelectedId = vi.fn();

const mockUseTopPending = vi.fn();
vi.mock('../../hooks/useServiceRequests', () => ({
  useTopPending: () => mockUseTopPending(),
}));

const mockUseSelection = vi.fn();
vi.mock('../../context/SelectionContext', () => ({
  useSelection: () => mockUseSelection(),
}));

const sampleRequests = [
  {
    id: '1',
    title: 'Server is down',
    requesterName: 'Carol',
    requesteeName: 'Dave',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    description: null,
    requesterId: 'c',
    requesteeId: 'd',
  },
  {
    id: '2',
    title: 'Printer jammed',
    requesterName: 'Eve',
    requesteeName: 'Frank',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    description: null,
    requesterId: 'e',
    requesteeId: 'f',
  },
];

beforeEach(() => {
  mockSetSelectedId.mockClear();
  mockUseTopPending.mockReturnValue({ data: sampleRequests, isLoading: false, isError: false });
  mockUseSelection.mockReturnValue({ selectedId: null, setSelectedId: mockSetSelectedId });
});

describe('TopRequestsWidget', () => {
  it('renders the heading', () => {
    render(<TopRequestsWidget />);
    expect(screen.getByText('Top Pending Requests')).toBeInTheDocument();
  });

  it('renders card title for a request', () => {
    render(<TopRequestsWidget />);
    expect(screen.getByText('Server is down')).toBeInTheDocument();
  });

  it('renders 3 Skeleton elements when isLoading is true', () => {
    mockUseTopPending.mockReturnValue({ data: [], isLoading: true, isError: false });
    render(<TopRequestsWidget />);
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons).toHaveLength(3);
  });

  it('renders error message when isError is true', () => {
    mockUseTopPending.mockReturnValue({ data: [], isLoading: false, isError: true });
    render(<TopRequestsWidget />);
    expect(screen.getByText('Failed to load.')).toBeInTheDocument();
  });

  it('fires setSelectedId with the correct id when a card is clicked', async () => {
    const user = userEvent.setup();
    render(<TopRequestsWidget />);
    await user.click(screen.getByText('Server is down'));
    expect(mockSetSelectedId).toHaveBeenCalledWith('1');
  });

  it('renders no cards when data is an empty array', () => {
    mockUseTopPending.mockReturnValue({ data: [], isLoading: false, isError: false });
    render(<TopRequestsWidget />);
    // No card action areas should exist
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders requesterName → requesteeName caption', () => {
    render(<TopRequestsWidget />);
    expect(screen.getByText('Carol → Dave')).toBeInTheDocument();
  });
});
