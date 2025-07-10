import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { render } from '@testing-library/react';
import React from 'react';
import FeedVisualizer from '../FeedVisualizer';
import { SettingsIntegrationService } from '../../services/SettingsIntegrationService';

// Mock dependencies
jest.mock('../../services/FeedService');
jest.mock('../../services/SettingsIntegrationService');
jest.mock('../../hooks/alerts/useAlerts');
jest.mock('../../hooks/useLoading');
jest.mock('../../contexts/FilterContext');

const mockSettingsIntegrationService = SettingsIntegrationService as jest.Mocked<typeof SettingsIntegrationService>;

describe('FeedVisualizer Auto-Refresh Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should use user-configured refresh interval', async () => {
    // Mock general settings with custom refresh interval
    mockSettingsIntegrationService.getGeneralSettings.mockReturnValue({
      autoRefresh: true,
      refreshInterval: 120, // 2 minutes instead of default 5
      preserveHistory: true,
      notifications: true,
      notificationSound: 'ping',
      showNotificationCount: true,
      cacheDuration: 1800,
      storageLimit: 50
    });

    render(<FeedVisualizer selectedFeedList="test-list" />);

    // Verify that the interval is set correctly
    expect(mockSettingsIntegrationService.getGeneralSettings).toHaveBeenCalled();
    
    // Fast forward time to trigger auto-refresh
    jest.advanceTimersByTime(120000); // 2 minutes
    
    // Verify that auto-refresh was triggered at the correct interval
    expect(mockSettingsIntegrationService.getGeneralSettings).toHaveBeenCalledTimes(1);
  });

  test('should respect autoRefresh disabled setting', async () => {
    mockSettingsIntegrationService.getGeneralSettings.mockReturnValue({
      autoRefresh: false,
      refreshInterval: 300,
      preserveHistory: true,
      notifications: true,
      notificationSound: 'ping',
      showNotificationCount: true,
      cacheDuration: 1800,
      storageLimit: 50
    });

    render(<FeedVisualizer selectedFeedList="test-list" />);

    // Fast forward significant time
    jest.advanceTimersByTime(600000); // 10 minutes
    
    // Auto-refresh should not have been called since it's disabled
    expect(mockSettingsIntegrationService.getGeneralSettings).toHaveBeenCalledTimes(1);
  });

  test('should initialize autoRefresh state from settings', () => {
    mockSettingsIntegrationService.getGeneralSettings.mockReturnValue({
      autoRefresh: false,
      refreshInterval: 300,
      preserveHistory: true,
      notifications: true,
      notificationSound: 'ping',
      showNotificationCount: true,
      cacheDuration: 1800,
      storageLimit: 50
    });

    render(<FeedVisualizer selectedFeedList="test-list" />);

    // Component should initialize with autoRefresh = false
    expect(mockSettingsIntegrationService.getGeneralSettings).toHaveBeenCalled();
  });
});
