import '@testing-library/jest-dom';

import { render, waitFor } from '@testing-library/react';

type Feed = {
  id: string;
  title: string;
  link: string;
  name: string;
  pubDate: string;
  feedListId: string;
};

const initializeFeedsMock = jest.fn();
const clearDataMock = jest.fn();
const checkFeedItemsMock = jest.fn().mockReturnValue([]);
const acknowledgeAlertMock = jest.fn();
const setLoadingMock = jest.fn();
const setErrorMock = jest.fn();

jest.mock('../services/SearchService', () => ({
  SearchService: {
    initializeFeeds: initializeFeedsMock,
    clearData: clearDataMock
  }
}));

jest.mock('../services/PerformanceManager', () => ({
  __esModule: true,
  default: {
    getCache: jest.fn(() => null),
    setCache: jest.fn(),
    cleanup: jest.fn()
  }
}));

jest.mock('../contexts/FilterContext', () => ({
  useFilters: () => ({
    getFilteredFeeds: (feeds: Feed[]) => feeds
  })
}));

jest.mock('../hooks/alerts/useAlerts', () => ({
  __esModule: true,
  default: () => ({
    checkFeedItems: checkFeedItemsMock,
    isMonitoring: false,
    alertStats: { totalAlerts: 0, activeAlerts: 0, totalTriggers: 0, triggersToday: 0 },
    alertHistory: [],
    acknowledgeAlert: acknowledgeAlertMock
  })
}));

jest.mock('../hooks/useLoading', () => ({
  useLoading: () => ({
    isLoading: false,
    error: null,
    setLoading: setLoadingMock,
    setError: setErrorMock
  })
}));

jest.mock('../services/SettingsIntegrationService', () => ({
  SettingsIntegrationService: {
    getGeneralSettings: () => ({
      autoRefresh: false,
      refreshInterval: 300,
      preserveHistory: true,
      notifications: { enabled: true, sound: false },
      showNotificationCount: true,
      cacheDuration: 300,
      storageLimit: 50
    }),
    resetCache: jest.fn()
  }
}));

const mockFeeds: Feed[] = [
  {
    id: 'demo-1',
    title: 'Demo Item 1',
    link: 'https://example.com/demo-1',
    name: 'Demo Source',
    pubDate: new Date().toISOString(),
    feedListId: 'modern-api'
  },
  {
    id: 'demo-2',
    title: 'Demo Item 2',
    link: 'https://example.com/demo-2',
    name: 'Demo Source',
    pubDate: new Date().toISOString(),
    feedListId: 'modern-api'
  }
];

jest.mock('../services/ModernFeedService', () => ({
  modernFeedService: {
    fetchAllIntelligenceData: jest.fn().mockResolvedValue({
      feeds: mockFeeds.map(feed => ({
        id: feed.id,
        title: feed.title,
        link: feed.link,
        name: feed.name,
        author: feed.name,
        pubDate: feed.pubDate,
        description: '',
        content: '',
        categories: []
      })),
      fetchedAt: new Date().toISOString()
    })
  }
}));

jest.mock('../services/FeedService', () => ({
  __esModule: true,
  default: {
    getFeedsByList: jest.fn().mockResolvedValue([]),
    enrichFeedWithMetadata: (feed: Feed) => feed
  }
}));

jest.mock('../constants/ModernIntelligenceSources', () => ({
  getSourceById: jest.fn(() => undefined)
}));

jest.mock('../shared/components/LoadingStates', () => ({
  FeedVisualizerSkeleton: () => <div data-testid="feed-visualizer-skeleton" />,
  ErrorOverlay: ({ message }: { message: string }) => (
    <div data-testid="feed-visualizer-error">{message}</div>
  )
}));

jest.mock('../components/FeedItem', () => ({
  __esModule: true,
  default: ({ feed }: { feed: Feed }) => (
    <div data-testid="mock-feed-item">{feed.title}</div>
  )
}));

jest.mock('../utils/LoggerService', () => ({
  log: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

// Ensure window.open exists for marquee interactions
beforeAll(() => {
  Object.defineProperty(window, 'open', {
    value: jest.fn(),
    writable: true
  });
});

afterEach(() => {
  warnSpy?.mockRestore();
  logSpy?.mockRestore();
  errorSpy?.mockRestore();
  jest.clearAllMocks();
});

import FeedVisualizer from '../components/FeedVisualizer';
import { SearchService } from '../services/SearchService';

let warnSpy: jest.SpyInstance | undefined;
let logSpy: jest.SpyInstance | undefined;
let errorSpy: jest.SpyInstance | undefined;

beforeEach(() => {
  warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('FeedVisualizer search integration', () => {
  test('initializes SearchService with loaded feeds when modern sources load', async () => {
    render(<FeedVisualizer selectedFeedList="modern-api" />);

    await waitFor(() => {
      expect(SearchService.initializeFeeds).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 'demo-1' }),
          expect.objectContaining({ id: 'demo-2' })
        ])
      );
    });

    expect(SearchService.clearData).not.toHaveBeenCalled();
  });

  test('clears SearchService data when no feed list is selected', async () => {
    render(<FeedVisualizer selectedFeedList={null} />);

    await waitFor(() => {
      expect(SearchService.clearData).toHaveBeenCalled();
    });
  });
});
