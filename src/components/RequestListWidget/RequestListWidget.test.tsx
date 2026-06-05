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
});

const anotherRow = {
  id: '2',
  title: 'Server upgrade',
  requesterName: 'Charlie',
  requesteeName: 'Diana',
  createdAt: '2024-01-02T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
  description: null,
  requesterId: 'c',
  requesteeId: 'd',
};

describe('search filter behavior', () => {
  beforeEach(() => {
    mockUseServiceRequests.mockReturnValue({
      data: [sampleRow, anotherRow],
      isLoading: false,
      isError: false,
    });
  });

  it('typing filters rows by title (AC2, AC3)', async () => {
    const user = userEvent.setup();
    render(<RequestListWidget />);
    await user.type(screen.getByPlaceholderText('Search by title, requester, or requestee…'), 'fix');
    expect(screen.getByText('Fix the printer')).toBeInTheDocument();
    expect(screen.queryByText('Server upgrade')).not.toBeInTheDocument();
  });

  it('filter is case-insensitive (AC3)', async () => {
    const user = userEvent.setup();
    render(<RequestListWidget />);
    await user.type(screen.getByPlaceholderText('Search by title, requester, or requestee…'), 'FIX');
    expect(screen.getByText('Fix the printer')).toBeInTheDocument();
    expect(screen.queryByText('Server upgrade')).not.toBeInTheDocument();
  });

  it('filters by requesterName (AC3)', async () => {
    const user = userEvent.setup();
    render(<RequestListWidget />);
    await user.type(screen.getByPlaceholderText('Search by title, requester, or requestee…'), 'charlie');
    expect(screen.getByText('Server upgrade')).toBeInTheDocument();
    expect(screen.queryByText('Fix the printer')).not.toBeInTheDocument();
  });

  it('filters by requesteeName (AC3)', async () => {
    const user = userEvent.setup();
    render(<RequestListWidget />);
    await user.type(screen.getByPlaceholderText('Search by title, requester, or requestee…'), 'diana');
    expect(screen.getByText('Server upgrade')).toBeInTheDocument();
    expect(screen.queryByText('Fix the printer')).not.toBeInTheDocument();
  });

  it('shows "No requests match your search" when nothing matches (AC4)', async () => {
    const user = userEvent.setup();
    render(<RequestListWidget />);
    await user.type(screen.getByPlaceholderText('Search by title, requester, or requestee…'), 'zzz');
    expect(screen.getByText('No requests match your search')).toBeInTheDocument();
  });

  it('clearing the filter restores all rows (AC5)', async () => {
    const user = userEvent.setup();
    render(<RequestListWidget />);
    const input = screen.getByPlaceholderText('Search by title, requester, or requestee…');
    await user.type(input, 'fix');
    expect(screen.queryByText('Server upgrade')).not.toBeInTheDocument();
    await user.clear(input);
    expect(screen.getByText('Fix the printer')).toBeInTheDocument();
    expect(screen.getByText('Server upgrade')).toBeInTheDocument();
  });
});
