import { beforeEach,describe, expect, it, jest } from '@jest/globals';
import { fireEvent,render, screen } from '@testing-library/react';

import { SettingsProvider } from '../../../contexts/SettingsContext';
import { SettingsModal } from '../SettingsModal';

// Mock CORSSettings default export correctly
jest.mock('../tabs/CORSSettings', () => ({
  __esModule: true,
  default: () => <div data-testid="cors-settings">CORS Settings Mock</div>
}));

describe('SettingsModal', () => {
  const mockOnClose = jest.fn();
  beforeEach(() => { jest.clearAllMocks(); });
  const renderWithProvider = () => render(<SettingsProvider><SettingsModal onClose={mockOnClose} /></SettingsProvider>);

  it('renders core tabs only', () => {
    renderWithProvider();
    expect(screen.getByText('Settings')).toBeTruthy();
    ['general','cors','protocols','verification','display'].forEach(name => {
      expect(screen.getByRole('button', { name: new RegExp(name,'i') })).toBeTruthy();
    });
    expect(screen.queryByRole('button', { name: /advanced/i })).toBeNull();
  });

  it('calls onClose when close button clicked', () => {
    renderWithProvider();
    fireEvent.click(screen.getByRole('button', { name: /close settings/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('switches tabs and shows mock CORS', () => {
    renderWithProvider();
    fireEvent.click(screen.getByRole('button', { name: /cors/i }));
    expect(screen.getByTestId('cors-settings')).toBeTruthy();
  });
});
