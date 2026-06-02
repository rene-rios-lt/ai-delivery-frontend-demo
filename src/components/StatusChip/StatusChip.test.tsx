import { render, screen } from '@testing-library/react';
import { StatusChip } from './StatusChip';

describe('StatusChip', () => {
  it('renders "Open" with blue (primary) color', () => {
    render(<StatusChip status="Open" />);
    const chip = screen.getByText('Open').closest('.MuiChip-root');
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveClass('MuiChip-colorPrimary');
  });

  it('renders "InProgress" with orange (warning) color', () => {
    render(<StatusChip status="InProgress" />);
    const chip = screen.getByText('InProgress').closest('.MuiChip-root');
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveClass('MuiChip-colorWarning');
  });

  it('renders "Completed" with green (success) color', () => {
    render(<StatusChip status="Completed" />);
    const chip = screen.getByText('Completed').closest('.MuiChip-root');
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveClass('MuiChip-colorSuccess');
  });
});
