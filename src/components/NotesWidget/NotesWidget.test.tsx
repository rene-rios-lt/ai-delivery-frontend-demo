import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NotesWidget } from './NotesWidget';

vi.mock('../../hooks/useServiceRequests', () => ({
  useServiceRequest: () => ({ data: null, isLoading: false }),
}));

vi.mock('../../context/SelectionContext', () => ({
  useSelection: () => ({ selectedId: null }),
}));

describe('NotesWidget', () => {
  it('shows placeholder when no request is selected', () => {
    render(<NotesWidget />);
    expect(screen.getByText('Select a request to view its notes')).toBeInTheDocument();
  });
});
