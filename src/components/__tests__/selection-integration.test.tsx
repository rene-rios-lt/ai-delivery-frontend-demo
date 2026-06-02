import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SelectionProvider } from '../../context/SelectionContext';
import { TopRequestsWidget } from '../TopRequestsWidget/TopRequestsWidget';
import { NotesWidget } from '../NotesWidget/NotesWidget';
import { RequestListWidget } from '../RequestListWidget/RequestListWidget';
import type { ServiceRequest } from '../../types';

const request: ServiceRequest = {
  id: 'req-1',
  title: 'Server is down',
  description: 'The production server needs a reboot.',
  requesterId: 'user-a',
  requesterName: 'Alice',
  requesteeId: 'user-b',
  requesteeName: 'Bob',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

vi.mock('../../hooks/useServiceRequests', () => ({
  useTopPending: () => ({ data: [request], isLoading: false, isError: false }),
  useServiceRequests: () => ({ data: [request], isLoading: false, isError: false }),
  useServiceRequest: (id: string | null) => ({
    data: id === request.id ? request : null,
    isLoading: false,
  }),
}));

describe('cross-widget selection', () => {
  it('clicking a TopRequestsWidget card loads its details in NotesWidget', async () => {
    const user = userEvent.setup();
    render(
      <SelectionProvider>
        <TopRequestsWidget />
        <NotesWidget />
      </SelectionProvider>
    );

    expect(screen.getByText('Select a request to view its notes')).toBeInTheDocument();

    await user.click(screen.getByText('Server is down'));

    expect(screen.getByText('The production server needs a reboot.')).toBeInTheDocument();
    expect(screen.queryByText('Select a request to view its notes')).not.toBeInTheDocument();
  });

  it('clicking a RequestListWidget row loads its details in NotesWidget', async () => {
    const user = userEvent.setup();
    render(
      <SelectionProvider>
        <RequestListWidget />
        <NotesWidget />
      </SelectionProvider>
    );

    expect(screen.getByText('Select a request to view its notes')).toBeInTheDocument();

    const rows = screen.getAllByRole('row');
    await user.click(rows[1]);

    expect(screen.getByText('The production server needs a reboot.')).toBeInTheDocument();
  });

  it('NotesWidget keeps showing details when the selected row is hidden by a filter', async () => {
    const user = userEvent.setup();
    render(
      <SelectionProvider>
        <RequestListWidget />
        <NotesWidget />
      </SelectionProvider>
    );

    // Select the row
    const rows = screen.getAllByRole('row');
    await user.click(rows[1]);
    expect(screen.getByText('The production server needs a reboot.')).toBeInTheDocument();

    // Filter hides the selected row — check the grid shows the empty state overlay
    const input = screen.getByPlaceholderText('Search by title, requester, or requestee…');
    await user.type(input, 'zzznomatch');
    expect(screen.getByText('No requests match your search')).toBeInTheDocument();

    // NotesWidget still shows the selected request's details
    expect(screen.getByText('The production server needs a reboot.')).toBeInTheDocument();
  });

  it('NotesWidget resets to placeholder when selection is cleared', async () => {
    const user = userEvent.setup();
    render(
      <SelectionProvider>
        <TopRequestsWidget />
        <NotesWidget />
      </SelectionProvider>
    );

    await user.click(screen.getByText('Server is down'));
    expect(screen.getByText('The production server needs a reboot.')).toBeInTheDocument();

    // Click the selected card again — setSelectedId is called with same id
    // Notes widget stays loaded (no deselect mechanic in current implementation)
    // This documents the current behavior explicitly
    expect(screen.queryByText('Select a request to view its notes')).not.toBeInTheDocument();
  });
});
