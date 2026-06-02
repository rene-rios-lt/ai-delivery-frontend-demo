import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RequestListWidget } from './RequestListWidget';

const mockSetSelectedId = vi.fn();

// Default mock state — individual tests override via mockReturnValueOnce
const mockUseServiceRequests = vi.fn();
vi.mock('../../hooks/useServiceRequests', () => ({
  useServiceRequests: () => mockUseServiceRequests(),
}));

const mockUseSelection = vi.fn();
vi.mock('../../context/SelectionContext', () => ({
  useSelection: () => mockUseSelection(),
}));

const sampleRow = {
  id: '1',
  title: 'Fix the printer',
  requesterName: 'Alice',
  requesteeName: 'Bob',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  description: null,
  requesterId: 'a',
  requesteeId: 'b',
};

const secondRow = {
  id: '2',
  title: 'Network outage',
  requesterName: 'Charlie',
  requesteeName: 'Diana',
  createdAt: '2024-01-02T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
  description: null,
  requesterId: 'c',
  requesteeId: 'd',
};

beforeEach(() => {
  mockSetSelectedId.mockClear();
  mockUseServiceRequests.mockReturnValue({ data: [sampleRow], isLoading: false, isError: false });
  mockUseSelection.mockReturnValue({ selectedId: null, setSelectedId: mockSetSelectedId });
});

describe('RequestListWidget', () => {
  it('renders a search input with the correct placeholder', () => {
    render(<RequestListWidget />);
    expect(
      screen.getByPlaceholderText('Search by title, requester, or requestee…')
    ).toBeInTheDocument();
  });

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

  it('hides grid content when isLoading is true', () => {
    mockUseServiceRequests.mockReturnValue({ data: [], isLoading: true, isError: false });
    const { container } = render(<RequestListWidget />);
    // MUI DataGrid v9 adds this class when loading={true} to hide content before skeleton rows render
    expect(container.querySelector('.MuiDataGrid-main--hiddenContent')).toBeInTheDocument();
  });

  it('renders error message when isError is true', () => {
    mockUseServiceRequests.mockReturnValue({ data: [], isLoading: false, isError: true });
    render(<RequestListWidget />);
    expect(screen.getByText('Failed to load requests.')).toBeInTheDocument();
  });

  it('fires setSelectedId with the row id when a data row is clicked', async () => {
    const user = userEvent.setup();
    render(<RequestListWidget />);
    // getAllByRole('row'): index 0 is the header row, index 1 is the first data row
    const rows = screen.getAllByRole('row');
    const dataRow = rows[1];
    await user.click(dataRow);
    expect(mockSetSelectedId).toHaveBeenCalledWith('1');
  });

  it('puts matching row in the selection model when selectedId is set', () => {
    mockUseSelection.mockReturnValue({ selectedId: '1', setSelectedId: mockSetSelectedId });
    render(<RequestListWidget />);
    // The selected row gets aria-selected="true"
    const rows = screen.getAllByRole('row');
    const dataRow = rows[1];
    expect(dataRow).toHaveAttribute('aria-selected', 'true');
  });

  describe('search filtering', () => {
    beforeEach(() => {
      mockUseServiceRequests.mockReturnValue({
        data: [sampleRow, secondRow],
        isLoading: false,
        isError: false,
      });
    });

    it('filters rows by title (case-insensitive)', async () => {
      const user = userEvent.setup();
      render(<RequestListWidget />);
      const input = screen.getByPlaceholderText('Search by title, requester, or requestee…');

      await user.type(input, 'PRINTER');

      expect(screen.getByText('Fix the printer')).toBeInTheDocument();
      expect(screen.queryByText('Network outage')).not.toBeInTheDocument();
    });

    it('filters rows by requester name (case-insensitive)', async () => {
      const user = userEvent.setup();
      render(<RequestListWidget />);
      const input = screen.getByPlaceholderText('Search by title, requester, or requestee…');

      await user.type(input, 'charlie');

      expect(screen.getByText('Network outage')).toBeInTheDocument();
      expect(screen.queryByText('Fix the printer')).not.toBeInTheDocument();
    });

    it('filters rows by requestee name (case-insensitive)', async () => {
      const user = userEvent.setup();
      render(<RequestListWidget />);
      const input = screen.getByPlaceholderText('Search by title, requester, or requestee…');

      await user.type(input, 'diana');

      expect(screen.getByText('Network outage')).toBeInTheDocument();
      expect(screen.queryByText('Fix the printer')).not.toBeInTheDocument();
    });

    it('restores all rows when the search input is cleared', async () => {
      const user = userEvent.setup();
      render(<RequestListWidget />);
      const input = screen.getByPlaceholderText('Search by title, requester, or requestee…');

      await user.type(input, 'printer');
      expect(screen.queryByText('Network outage')).not.toBeInTheDocument();

      await user.clear(input);

      expect(screen.getByText('Fix the printer')).toBeInTheDocument();
      expect(screen.getByText('Network outage')).toBeInTheDocument();
    });

    it('shows "No requests match your search" when no rows match', async () => {
      const user = userEvent.setup();
      render(<RequestListWidget />);
      const input = screen.getByPlaceholderText('Search by title, requester, or requestee…');

      await user.type(input, 'zzznomatch');

      expect(screen.getByText('No requests match your search')).toBeInTheDocument();
    });

    it('does not show the empty-state message when the search input is empty', () => {
      render(<RequestListWidget />);
      expect(screen.queryByText('No requests match your search')).not.toBeInTheDocument();
    });

    it('does not clear selection when the filter hides the selected row', async () => {
      mockUseSelection.mockReturnValue({ selectedId: '1', setSelectedId: mockSetSelectedId });
      const user = userEvent.setup();
      render(<RequestListWidget />);
      const input = screen.getByPlaceholderText('Search by title, requester, or requestee…');

      // Type a term that matches only sampleRow's title in a partial way — wait, we need
      // to hide sampleRow. Type 'outage' to match only secondRow, hiding sampleRow (id='1').
      await user.type(input, 'outage');

      // sampleRow (id='1') is hidden from the grid, but setSelectedId must NOT have been called
      expect(screen.queryByText('Fix the printer')).not.toBeInTheDocument();
      expect(mockSetSelectedId).not.toHaveBeenCalled();
    });

    it('resets to page 1 when the search term changes', async () => {
      // 11 rows — enough to have a second page (pageSize=10)
      const manyRows = Array.from({ length: 11 }, (_, i) => ({
        id: String(i + 1),
        title: `Item ${i + 1}`,
        requesterName: 'User',
        requesteeName: 'Agent',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        description: null,
        requesterId: 'u',
        requesteeId: 'a',
      }));
      mockUseServiceRequests.mockReturnValue({ data: manyRows, isLoading: false, isError: false });

      const user = userEvent.setup();
      render(<RequestListWidget />);

      // Navigate to page 2 — "Item 11" is the only row on page 2
      const nextBtn = screen.getByRole('button', { name: /next page/i });
      await user.click(nextBtn);
      expect(screen.getByText('Item 11')).toBeInTheDocument();
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument();

      // Type a search that matches all rows — pagination should reset to page 1
      const input = screen.getByPlaceholderText('Search by title, requester, or requestee…');
      await user.type(input, 'item');

      // After reset, rows 1-10 are on page 1; Item 11 is on page 2 (not visible)
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.queryByText('Item 11')).not.toBeInTheDocument();
    });
  });
});
