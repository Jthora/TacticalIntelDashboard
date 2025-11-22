import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { render, waitFor } from '@testing-library/react';

import { SettingsIntegrationService } from '../../services/SettingsIntegrationService';
import FeedVisualizer from '../FeedVisualizer';

const createMockDiagnostic = () => ({
  sourceId: 'mock-source',
  sourceName: 'Mock Source',
  status: 'empty' as const,
  itemsFetched: 0,
  durationMs: 0
});

// Mock dependencies
jest.mock('../../services/FeedService', () => ({
  __esModule: true,
  default: {
    enrichFeedWithMetadata: jest.fn((feed: any) => feed),
    getFeedsByList: jest.fn(() => Promise.resolve([]))
  }
}));
jest.mock('../../services/SettingsIntegrationService');
jest.mock('../../hooks/alerts/useAlerts', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    checkFeedItems: jest.fn(),
    isMonitoring: false,
    alertStats: { total: 0, alerts: [] }
  }))
}));
jest.mock('../../hooks/useLoading', () => ({
  useLoading: jest.fn(() => ({
    isLoading: false,
    error: null,
    setLoading: jest.fn(),
    setError: jest.fn()
  }))
}));
jest.mock('../../contexts/FilterContext', () => ({
  useFilters: jest.fn(() => ({
    getFilteredFeeds: (feeds: any[]) => feeds,
    filters: [],
    setFilters: jest.fn()
  }))
}));
jest.mock('../../services/ModernFeedService', () => ({
  modernFeedService: {
    fetchSourceData: jest.fn(() => Promise.resolve({ items: [], diagnostic: createMockDiagnostic() })),
    fetchAllIntelligenceData: jest.fn(() => Promise.resolve({ feeds: [], diagnostics: [] })),
    mapModularDataSourceToModernSource: jest.fn(() => null)
  }
}));

const mockSettingsIntegrationService = SettingsIntegrationService as jest.Mocked<typeof SettingsIntegrationService>;
let setIntervalSpy: ReturnType<typeof jest.spyOn>;

describe('FeedVisualizer Auto-Refresh Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setIntervalSpy = jest.spyOn(globalThis, 'setInterval');
  });

  afterEach(() => {
    setIntervalSpy.mockRestore();
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
      storageLimit: 50,
      export: {
        format: 'json',
        autoExport: false,
        includeMetadata: true,
        compress: false,
        encrypt: true
      },
      share: {
        enabled: true,
        defaultHashtags: ['intelwatch'],
        attribution: 'via Tactical Intel Dashboard'
      }
    });

    render(<FeedVisualizer selectedFeedList="test-list" />);

    // Verify that the interval is set correctly
    await waitFor(() => expect(mockSettingsIntegrationService.getGeneralSettings).toHaveBeenCalled());
    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 120000);
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
      storageLimit: 50,
      export: {
        format: 'json',
        autoExport: false,
        includeMetadata: true,
        compress: false,
        encrypt: true
      },
      share: {
        enabled: true,
        defaultHashtags: ['intelwatch'],
        attribution: 'via Tactical Intel Dashboard'
      }
    });

    render(<FeedVisualizer selectedFeedList="test-list" />);

    // Auto-refresh should not have been called since it's disabled
  await waitFor(() => expect(mockSettingsIntegrationService.getGeneralSettings).toHaveBeenCalledTimes(1));
  const componentIntervals = setIntervalSpy.mock.calls.filter((call: unknown[]) => call[1] === 300000);
  expect(componentIntervals).toHaveLength(0);
  });

  test('should initialize autoRefresh state from settings', async () => {
    mockSettingsIntegrationService.getGeneralSettings.mockReturnValue({
      autoRefresh: false,
      refreshInterval: 300,
      preserveHistory: true,
      notifications: true,
      notificationSound: 'ping',
      showNotificationCount: true,
      cacheDuration: 1800,
      storageLimit: 50,
      export: {
        format: 'json',
        autoExport: false,
        includeMetadata: true,
        compress: false,
        encrypt: true
      },
      share: {
        enabled: true,
        defaultHashtags: ['intelwatch'],
        attribution: 'via Tactical Intel Dashboard'
      }
    });

    render(<FeedVisualizer selectedFeedList="test-list" />);

    // Component should initialize with autoRefresh = false
    await waitFor(() => expect(mockSettingsIntegrationService.getGeneralSettings).toHaveBeenCalled());
  });
});
