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
  status: 'Open' as const,
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

  it('renders a status chip in the grid row', () => {
    render(<RequestListWidget />);
    expect(screen.getByText('Open')).toBeInTheDocument();
    const chip = screen.getByText('Open').closest('.MuiChip-root');
    expect(chip).toHaveClass('MuiChip-colorPrimary');
  });
});
