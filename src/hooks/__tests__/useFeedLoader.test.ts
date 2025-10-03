jest.mock('../../services/FeedService', () => ({
  __esModule: true,
  default: {
    getFeedsByList: jest.fn(),
    enrichFeedWithMetadata: jest.fn()
  }
}));

jest.mock('../../services/ModernFeedService', () => ({
  modernFeedService: {
    fetchSourceData: jest.fn(),
    fetchAllIntelligenceData: jest.fn()
  }
}));

jest.mock('../../services/SearchService', () => ({
  SearchService: {
    initializeFeeds: jest.fn(),
    clearData: jest.fn()
  }
}));

jest.mock('../../utils/LoggerService', () => ({
  log: {
    debug: jest.fn()
  }
}));

jest.mock('../../constants/ModernIntelligenceSources', () => ({
  getSourceById: jest.fn(() => undefined)
}));

import { act, renderHook } from '@testing-library/react';
import { describe, expect, jest, test } from '@jest/globals';

import type { Feed } from '../../models/Feed';
import { useFeedLoader } from '../useFeedLoader';

const createBaseParams = () => ({
  selectedFeedList: null as string | null,
  isMonitoring: false,
  checkFeedItems: jest.fn(() => []),
  setLoading: jest.fn(),
  setError: jest.fn(),
  logSuccess: jest.fn(),
  logWarning: jest.fn()
});

const createDeps = () => ({
  feedService: {
    getFeedsByList: jest.fn(async () => [] as Feed[])
  } as any,
  modernFeedService: {
    fetchSourceData: jest.fn(),
    fetchAllIntelligenceData: jest.fn()
  } as any,
  searchService: {
    initializeFeeds: jest.fn(),
    clearData: jest.fn()
  } as any,
  logger: {
    debug: jest.fn()
  } as any,
  getSourceById: jest.fn(() => undefined)
});

describe('useFeedLoader', () => {
  test('clears feeds when no list is selected', async () => {
    const params = createBaseParams();
    const deps = createDeps();

    const { result } = renderHook(() => useFeedLoader(params, deps));

    await act(async () => {
      await result.current.loadFeeds();
    });

    expect(deps.searchService.clearData).toHaveBeenCalledTimes(1);
    expect(params.setLoading).toHaveBeenCalledWith(false);
    expect(result.current.feeds).toEqual([]);
  });

  test('loads modern feeds via modern feed service', async () => {
    const params = createBaseParams();
    params.selectedFeedList = 'modern-api';

    const deps = createDeps();
    deps.modernFeedService.fetchAllIntelligenceData.mockResolvedValue({
      feeds: [
        {
          id: 'intel-1',
          author: 'Analyst Bot',
          link: 'https://example.com/intel/1',
          title: 'Critical Update',
          pubDate: '2025-10-02T00:00:00.000Z'
        }
      ]
    });

    const { result } = renderHook(() => useFeedLoader(params, deps));

    await act(async () => {
      await result.current.loadFeeds();
    });

    expect(params.setLoading).toHaveBeenCalledWith(true, 'Loading intelligence feeds...');
    expect(deps.modernFeedService.fetchAllIntelligenceData).toHaveBeenCalledTimes(1);
    expect(deps.searchService.initializeFeeds).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'intel-1',
          title: 'Critical Update',
          link: 'https://example.com/intel/1'
        })
      ])
    );
    expect(result.current.feeds).toHaveLength(1);
    expect(result.current.lastUpdated).toBeInstanceOf(Date);
    expect(params.setError).toHaveBeenCalledWith(null);
  });
});
