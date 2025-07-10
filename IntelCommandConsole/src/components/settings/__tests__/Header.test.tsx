import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../../Header';
import { SearchProvider } from '../../../contexts/SearchContext';
import { SettingsProvider } from '../../../contexts/SettingsContext';
import '@testing-library/jest-dom';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock the FeedManager component
jest.mock('../../FeedManager', () => () => <div data-testid="feed-manager">Feed Manager Mock</div>);

// Mock the SettingsModal component
jest.mock('../SettingsModal', () => ({
  SettingsModal: ({ onClose }) => (
    <div data-testid="settings-modal">
      Settings Modal Mock
      <button onClick={onClose}>Close</button>
    </div>
  )
}));

// Mock logo
jest.mock('../../../assets/images/WingCommanderLogo-288x162.gif', () => 'mock-logo-path');

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithProviders = () => {
    return render(
      <SearchProvider>
        <SettingsProvider>
          <Header />
        </SettingsProvider>
      </SearchProvider>
    );
  };

  it('renders correctly with settings button', () => {
    renderWithProviders();
    
    // Check if the settings button is present
    const settingsButton = screen.getByRole('button', { name: /open settings/i });
    expect(settingsButton).toBeInTheDocument();
    
    // Check other header elements
    expect(screen.getByAltText('TC')).toBeInTheDocument();
    expect(screen.getByText('TACTICAL INTEL DASHBOARD')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('SEARCH INTEL...')).toBeInTheDocument();
  });

  it('opens settings modal when settings button is clicked', () => {
    renderWithProviders();
    
    // Initially settings modal should not be present
    expect(screen.queryByTestId('settings-modal')).not.toBeInTheDocument();
    
    // Click settings button
    const settingsButton = screen.getByRole('button', { name: /open settings/i });
    fireEvent.click(settingsButton);
    
    // Now settings modal should be visible
    expect(screen.getByTestId('settings-modal')).toBeInTheDocument();
  });

  it('closes settings modal when close button is clicked', () => {
    renderWithProviders();
    
    // Open settings modal
    const settingsButton = screen.getByRole('button', { name: /open settings/i });
    fireEvent.click(settingsButton);
    
    // Settings modal should be visible
    expect(screen.getByTestId('settings-modal')).toBeInTheDocument();
    
    // Click close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    // Now settings modal should be closed
    expect(screen.queryByTestId('settings-modal')).not.toBeInTheDocument();
  });

  it('opens feed manager when feed button is clicked', () => {
    renderWithProviders();
    
    // Feed manager should not be initially present
    expect(screen.queryByTestId('feed-manager')).not.toBeInTheDocument();
    
    // Find and click the feed manager button (first control button)
    const feedButton = screen.getAllByRole('button', { name: /feed manager/i })[0];
    fireEvent.click(feedButton);
    
    // Now feed manager should be visible
    expect(screen.getByTestId('feed-manager')).toBeInTheDocument();
  });
});
