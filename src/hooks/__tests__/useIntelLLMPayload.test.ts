import { renderHook } from '@testing-library/react';
import useIntelLLMPayload from '../useIntelLLMPayload';
import { Feed } from '../../models/Feed';
import { FeedFetchDiagnostic } from '../../types/FeedTypes';

jest.mock('../../contexts/FeedDataContext', () => ({
  useFeedData: jest.fn()
}));

jest.mock('../../contexts/FilterContext', () => ({
  useFilters: jest.fn()
}));

jest.mock('../../contexts/MissionModeContext', () => ({
  useMissionMode: jest.fn()
}));

jest.mock('../alerts/useAlerts', () => ({ __esModule: true, default: jest.fn() }));

jest.mock('../../intel/export/FeedIntelAdapter', () => ({
  mapFeedToIntel: jest.fn((feed: Feed) => ({
    id: feed.id,
    title: feed.title,
    created: '2025-01-01T00:00:00Z',
    classification: 'UNCLASS',
    priority: 'medium',
    sources: ['SRC'],
    body: feed.content || feed.description || ''
  }))
}));

describe('useIntelLLMPayload', () => {
  const mockFeed: Feed = {
    id: 'f1',
    name: 'Source One',
    url: 'https://example.com/rss',
    title: 'Example Title',
    link: 'https://example.com/article',
    pubDate: '2025-01-02T00:00:00Z',
    description: 'Desc',
    content: 'Body content',
    feedListId: 'modern-api'
  };

  const mockDiagnostics: FeedFetchDiagnostic[] = [
    {
      sourceId: 's1',
      sourceName: 'Source One',
      status: 'failed',
      itemsFetched: 0,
      durationMs: 123,
      error: 'timeout'
    }
  ];

  beforeEach(() => {
    jest.resetAllMocks();

    const { useFeedData } = require('../../contexts/FeedDataContext');
    useFeedData.mockReturnValue({
      filteredFeeds: [mockFeed],
      feeds: [mockFeed],
      lastUpdated: new Date('2025-01-03T00:00:00Z')
    });

    const { useFilters } = require('../../contexts/FilterContext');
    useFilters.mockReturnValue({
      filterState: {
        activeFilters: new Set(['HIGH']),
        timeRange: null,
        sortBy: { field: 'timestamp', direction: 'desc' },
        searchQuery: ''
      }
    });

    const { useMissionMode } = require('../../contexts/MissionModeContext');
    useMissionMode.mockReturnValue({
      mode: 'MILTECH',
      profile: { label: 'Mission MilTech' }
    });

    const useAlerts = require('../alerts/useAlerts').default;
    useAlerts.mockReturnValue({
      alertHistory: [
        {
          id: 't1',
          alertId: 'a1',
          triggeredAt: new Date('2025-01-04T00:00:00Z'),
          matchedKeywords: ['critical'],
          feedItem: {
            title: 'Example Title',
            description: 'Desc',
            link: 'https://example.com/article',
            source: 'Source One',
            pubDate: '2025-01-02T00:00:00Z'
          },
          priority: 'high',
          acknowledged: false
        }
      ]
    });
  });

  it('builds payload with limits and diagnostics summary', () => {
    const { result } = renderHook(() => useIntelLLMPayload({
      maxFeeds: 1,
      maxAlerts: 1,
      diagnostics: mockDiagnostics,
      selectedFeedList: 'modern-api'
    }));

    expect(result.current.feeds.intel).toHaveLength(1);
    expect(result.current.alerts.triggers).toHaveLength(1);
    expect(result.current.diagnostics.summary.failed).toBe(1);
    expect(result.current.mission.selectedFeedList).toBe('modern-api');
    expect(result.current.filters.activeFilters).toEqual(['HIGH']);
  });

  it('aggregates diagnostics statuses across entries', () => {
    const diagnostics: FeedFetchDiagnostic[] = [
      { sourceId: 's1', sourceName: 'S1', status: 'success', itemsFetched: 2, durationMs: 10 },
      { sourceId: 's2', sourceName: 'S2', status: 'empty', itemsFetched: 0, durationMs: 5 },
      { sourceId: 's3', sourceName: 'S3', status: 'failed', itemsFetched: 0, durationMs: 7, error: 'timeout' }
    ];

    const { result } = renderHook(() => useIntelLLMPayload({ diagnostics }));

    expect(result.current.diagnostics.summary).toEqual({ success: 1, empty: 1, failed: 1 });
    expect(result.current.diagnostics.entries).toHaveLength(3);
  });
});
