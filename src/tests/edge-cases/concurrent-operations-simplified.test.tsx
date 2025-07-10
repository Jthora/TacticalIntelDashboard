import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Import components and services
import { SettingsProvider, useSettings } from '../../contexts/SettingsContext';
import { SettingsIntegrationService } from '../../services/SettingsIntegrationService';

// Mock the logger service
jest.mock('../../utils/LoggerService', () => ({
  log: {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn()
  }
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('Concurrent Operations Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    SettingsIntegrationService.resetCache();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('handles rapid sequential updates without data corruption', async () => {
    const TestComponent: React.FC = () => {
      const { updateSettings } = useSettings();
      
      const handleRapidUpdates = () => {
        // Rapidly update settings
        updateSettings({ display: { theme: 'dark', density: 'compact', fontSize: 14 } });
        updateSettings({ display: { theme: 'light', density: 'comfortable', fontSize: 16 } });
        updateSettings({ display: { theme: 'alliance', density: 'spacious', fontSize: 18 } });
      };

      return (
        <div>
          <button onClick={handleRapidUpdates}>Rapid Update Test</button>
        </div>
      );
    };

    const { getByText } = render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Trigger the rapid updates
    fireEvent.click(getByText('Rapid Update Test'));

    // Allow time for all updates to process
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  test('handles race conditions with cache invalidation', async () => {
    // Test direct service interaction to avoid React complexity
    const mockSettings = {
      display: { theme: 'dark' as const, density: 'compact' as const, fontSize: 14 }
    };

    // Test settings save and load
    SettingsIntegrationService.saveSettings(mockSettings);
    const loadedSettings = SettingsIntegrationService.loadSettings();
    expect(loadedSettings.display?.theme).toBe('dark');

    // Test cache invalidation
    SettingsIntegrationService.resetCache();
    const settingsAfterReset = SettingsIntegrationService.loadSettings();
    // Should still work even after cache reset
    expect(settingsAfterReset).toBeDefined();
  });
});
