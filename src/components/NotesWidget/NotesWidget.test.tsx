import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NotesWidget } from './NotesWidget';

const mockUseServiceRequest = vi.fn();
vi.mock('../../hooks/useServiceRequests', () => ({
  useServiceRequest: (id: string | null) => mockUseServiceRequest(id),
}));

const mockUseSelection = vi.fn();
vi.mock('../../context/SelectionContext', () => ({
  useSelection: () => mockUseSelection(),
}));

const sampleRequest = {
  id: 'req-1',
  title: 'Fix the server',
  description: 'The server needs a reboot and config update.',
  requesterName: 'Alice',
  requesteeName: 'Bob',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  requesterId: 'a',
  requesteeId: 'b',
};

beforeEach(() => {
  // Default: no selection, no loading
  mockUseSelection.mockReturnValue({ selectedId: null });
  mockUseServiceRequest.mockReturnValue({ data: null, isLoading: false });
});

describe('NotesWidget', () => {
  it('shows placeholder when no request is selected', () => {
    render(<NotesWidget />);
    expect(screen.getByText('Select a request to view its notes')).toBeInTheDocument();
  });

  it('shows "Loading..." when selectedId is set and isLoading is true', () => {
    mockUseSelection.mockReturnValue({ selectedId: 'req-1' });
    mockUseServiceRequest.mockReturnValue({ data: null, isLoading: true });
    render(<NotesWidget />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows title and description when request is loaded with a description', () => {
    mockUseSelection.mockReturnValue({ selectedId: 'req-1' });
    mockUseServiceRequest.mockReturnValue({ data: sampleRequest, isLoading: false });
    render(<NotesWidget />);
    expect(screen.getByText('Fix the server')).toBeInTheDocument();
    expect(screen.getByText('The server needs a reboot and config update.')).toBeInTheDocument();
  });

  it('shows "No description provided." when request has description: null', () => {
    mockUseSelection.mockReturnValue({ selectedId: 'req-1' });
    mockUseServiceRequest.mockReturnValue({
      data: { ...sampleRequest, description: null },
      isLoading: false,
    });
    render(<NotesWidget />);
    expect(screen.getByText('Fix the server')).toBeInTheDocument();
    expect(screen.getByText('No description provided.')).toBeInTheDocument();
  });
});
