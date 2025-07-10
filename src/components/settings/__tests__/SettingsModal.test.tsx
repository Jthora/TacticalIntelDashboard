import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsModal } from '../SettingsModal';
import { SettingsProvider, SettingsTab } from '../../../contexts/SettingsContext';
import '@testing-library/jest-dom';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock the CORSSettings component
jest.mock('../tabs/CORSSettings', () => ({
  CORSSettings: () => <div data-testid="cors-settings">CORS Settings Mock</div>
}));

describe('SettingsModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithProvider = () => {
    return render(
      <SettingsProvider>
        <SettingsModal onClose={mockOnClose} />
      </SettingsProvider>
    );
  };

  it('renders correctly with default tab', () => {
    renderWithProvider();
    
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close settings/i })).toBeInTheDocument();
    
    // Check if tabs are rendered
    expect(screen.getByRole('button', { name: /general/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cors/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /protocols/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /verification/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /display/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /advanced/i })).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    renderWithProvider();
    
    const closeButton = screen.getByRole('button', { name: /close settings/i });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('switches tabs when tab buttons are clicked', () => {
    renderWithProvider();
    
    // Initial tab content
    expect(screen.getByText('General Settings Content')).toBeInTheDocument();
    
    // Switch to CORS tab
    fireEvent.click(screen.getByRole('button', { name: /cors/i }));
    
    // Should now show CORS settings
    expect(screen.getByTestId('cors-settings')).toBeInTheDocument();
    
    // Switch to another tab
    fireEvent.click(screen.getByRole('button', { name: /display/i }));
    
    // Should now show Display settings
    expect(screen.getByText('Display Settings Content')).toBeInTheDocument();
  });

  it('persists the last selected tab', () => {
    // First render and select CORS tab
    const { unmount } = renderWithProvider();
    fireEvent.click(screen.getByRole('button', { name: /cors/i }));
    unmount();
    
    // Re-render the component
    renderWithProvider();
    
    // Should show CORS tab content immediately due to persistence
    expect(screen.getByTestId('cors-settings')).toBeInTheDocument();
  });
});
