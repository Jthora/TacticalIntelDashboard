/**
 * COMPREHENSIVE UI TESTS - 100 Critical Test Suite
 * Priority 2: FeedVisualizer Component (Tests 26-40)
 * Focus: Core feed display, loading states, error handling, auto-refresh
 */

import '@testing-library/jest-dom';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import FeedVisualizer from '../../src/components/FeedVisualizer';
import { FilterProvider } from '../../src/contexts/FilterContext';
import { IntelligenceProvider } from '../../src/contexts/IntelligenceContext';
import { SettingsProvider } from '../../src/contexts/SettingsContext';

let feedSkeletonRenderCount = 0;

const DEFAULT_FEED_LIST_ID = 'test-feed-list';
const ALT_FEED_LIST_ID = 'alt-feed-list';

jest.mock('../../src/contexts/MissionModeContext', () => ({
  useMissionMode: () => ({
    mode: 'SPACEFORCE',
    profile: {
      badge: '🚀',
      label: 'SpaceForce Command',
      tagline: 'Orbital events + SDA.',
      defaultFeedListId: 'spaceforce-intel-feed',
      defaultTheme: 'spaceforce',
      description: 'Mock mission profile for tests.'
    },
    availableModes: [],
    setMode: jest.fn()
  })
}));

// Mock services
jest.mock('../../src/services/FeedService', () => ({
  __esModule: true,
  default: {
    getFeedsByList: jest.fn(() => Promise.resolve([
      { id: '1', title: 'Test Feed 1', description: 'Test Description 1', url: 'http://test1.com' },
      { id: '2', title: 'Test Feed 2', description: 'Test Description 2', url: 'http://test2.com' }
    ])),
    enrichFeedWithMetadata: jest.fn(feed => ({
      ...feed,
      metadata: { lastUpdated: new Date(), feedHealth: 'good' }
    }))
  }
}));

jest.mock('../../src/services/ModernFeedService', () => ({
  modernFeedService: {
    fetchAllIntelligenceData: jest.fn(() => Promise.resolve({
      feeds: [],
      fetchedAt: new Date().toISOString()
    }))
  }
}));

jest.mock('../../src/services/SettingsIntegrationService', () => ({
  SettingsIntegrationService: {
    getGeneralSettings: jest.fn(() => ({
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
    }))
  }
}));

jest.mock('../../src/shared/components/LoadingStates', () => {
  const actual = jest.requireActual('../../src/shared/components/LoadingStates');
  return {
    ...actual,
    FeedVisualizerSkeleton: () => {
      feedSkeletonRenderCount += 1;
      return <div data-testid="feed-visualizer-skeleton">Loading feeds...</div>;
    }
  };
});

// Test wrapper with providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SettingsProvider>
    <IntelligenceProvider>
      <FilterProvider>
        {children}
      </FilterProvider>
    </IntelligenceProvider>
  </SettingsProvider>
);

describe('🎯 UI COMPREHENSIVE TESTS - FeedVisualizer Component (Tests 26-40)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('🔧 Core Feed Display (Tests 26-30)', () => {
    test('UI_026: Should render FeedVisualizer with null selectedFeedList', () => {
      render(
        <TestWrapper>
          <FeedVisualizer selectedFeedList={null} />
        </TestWrapper>
      );
      
      expect(screen.getByText(/NO INTELLIGENCE AVAILABLE/i)).toBeInTheDocument();
    });

    test('UI_027: Should display loading state initially', async () => {
      const FeedService = require('../../src/services/FeedService').default;
      let resolveFeeds!: (feeds: any[]) => void;

      FeedService.getFeedsByList.mockImplementationOnce(() => new Promise(resolve => {
        resolveFeeds = resolve;
      }));

      feedSkeletonRenderCount = 0;

      render(
        <TestWrapper>
          <FeedVisualizer selectedFeedList={DEFAULT_FEED_LIST_ID} />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(feedSkeletonRenderCount).toBeGreaterThan(0);
      });

      resolveFeeds([
        { id: 'delayed-1', title: 'Delayed Feed', description: 'Pending', url: 'http://pending.test' }
      ]);
    });

    test('UI_028: Should display feeds when selectedFeedList is provided', async () => {
      render(
        <TestWrapper>
          <FeedVisualizer selectedFeedList={DEFAULT_FEED_LIST_ID} />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Test Feed 1')).toBeInTheDocument();
        expect(screen.getByText('Test Feed 2')).toBeInTheDocument();
      });
    });

    test('UI_029: Should show feed count in header', async () => {
      render(
        <TestWrapper>
          <FeedVisualizer selectedFeedList={DEFAULT_FEED_LIST_ID} />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/2 feeds/i)).toBeInTheDocument();
      });
    });

    test('UI_030: Should handle empty feed list gracefully', async () => {
      const FeedService = require('../../src/services/FeedService').default;
      FeedService.getFeedsByList.mockResolvedValueOnce([]);

      render(
        <TestWrapper>
          <FeedVisualizer selectedFeedList="empty" />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/NO INTELLIGENCE AVAILABLE/i)).toBeInTheDocument();
      });
    });
  });

  describe('🔄 Auto-Refresh Functionality (Tests 31-35)', () => {
    test('UI_031: Should have auto-refresh toggle button', async () => {
      render(
        <TestWrapper>
          <FeedVisualizer selectedFeedList={DEFAULT_FEED_LIST_ID} />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByTitle(/auto-refresh/i)).toBeInTheDocument();
      });
    });

    test('UI_032: Should toggle auto-refresh state when clicked', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <FeedVisualizer selectedFeedList={DEFAULT_FEED_LIST_ID} />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByTitle(/auto-refresh/i)).toBeInTheDocument();
      });

      const autoRefreshBtn = screen.getByTitle(/auto-refresh/i);
      await user.click(autoRefreshBtn);
      
      await waitFor(() => {
        expect(screen.getByTitle(/auto-refresh/i)).toHaveClass('active');
      });
    });

    test('UI_033: Should display last updated timestamp', async () => {
      render(
        <TestWrapper>
          <FeedVisualizer selectedFeedList={DEFAULT_FEED_LIST_ID} />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/updated:/i)).toBeInTheDocument();
      });
    });

    test('UI_034: Should show refresh button', async () => {
      render(
        <TestWrapper>
          <FeedVisualizer selectedFeedList={DEFAULT_FEED_LIST_ID} />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByTitle(/refresh feeds/i)).toBeInTheDocument();
      });
    });

    test('UI_035: Should handle manual refresh', async () => {
      const user = userEvent.setup();
      const FeedService = require('../../src/services/FeedService').default;
      
      render(
        <TestWrapper>
          <FeedVisualizer selectedFeedList={DEFAULT_FEED_LIST_ID} />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByTitle(/refresh feeds/i)).toBeInTheDocument();
      });

      const refreshBtn = screen.getByTitle(/refresh feeds/i);
      const initialCallCount = FeedService.getFeedsByList.mock.calls.length;
      await user.click(refreshBtn);
      
      await waitFor(() => {
        expect(FeedService.getFeedsByList.mock.calls.length).toBeGreaterThan(initialCallCount);
      });
    });
  });

  describe('⚠️ Error Handling (Tests 36-40)', () => {
    test('UI_036: Should display error message when service fails', async () => {
      const FeedService = require('../../src/services/FeedService').default;
      FeedService.getFeedsByList.mockRejectedValueOnce(new Error('Network error'));

      render(
        <TestWrapper>
          <FeedVisualizer selectedFeedList={DEFAULT_FEED_LIST_ID} />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/feed load error/i)).toBeInTheDocument();
        expect(screen.getByText(/failed to load feeds/i)).toBeInTheDocument();
      });
    });

    test('UI_037: Should show retry button on error', async () => {
      const FeedService = require('../../src/services/FeedService').default;
      FeedService.getFeedsByList.mockRejectedValueOnce(new Error('Network error'));

      render(
        <TestWrapper>
          <FeedVisualizer selectedFeedList={DEFAULT_FEED_LIST_ID} />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      });
    });

    test('UI_038: Should retry loading when retry button clicked', async () => {
      const user = userEvent.setup();
      const FeedService = require('../../src/services/FeedService').default;
      FeedService.getFeedsByList
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce([
          { id: '1', title: 'Retry Test Feed', description: 'Test', url: 'http://test.com' }
        ]);

      render(
        <TestWrapper>
          <FeedVisualizer selectedFeedList={DEFAULT_FEED_LIST_ID} />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      });

      const retryBtn = screen.getByRole('button', { name: /try again/i });
      await user.click(retryBtn);
      
      await waitFor(() => {
        expect(screen.getByText('Retry Test Feed')).toBeInTheDocument();
      });
    });

    test('UI_039: Should handle prop changes correctly', async () => {
      const { rerender } = render(
        <TestWrapper>
          <FeedVisualizer selectedFeedList={DEFAULT_FEED_LIST_ID} />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Test Feed 1')).toBeInTheDocument();
      });

      // Change selectedFeedList
      rerender(
        <TestWrapper>
          <FeedVisualizer selectedFeedList={ALT_FEED_LIST_ID} />
        </TestWrapper>
      );
      
      const FeedService = require('../../src/services/FeedService').default;
      await waitFor(() => {
        expect(FeedService.getFeedsByList).toHaveBeenCalledWith(ALT_FEED_LIST_ID);
      });
    });

    test('UI_040: Should clear feeds when selectedFeedList becomes null', async () => {
      const { rerender } = render(
        <TestWrapper>
          <FeedVisualizer selectedFeedList={DEFAULT_FEED_LIST_ID} />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Test Feed 1')).toBeInTheDocument();
      });

      // Change to null
      rerender(
        <TestWrapper>
          <FeedVisualizer selectedFeedList={null} />
        </TestWrapper>
      );
      
      expect(screen.getByText(/NO INTELLIGENCE AVAILABLE/i)).toBeInTheDocument();
      expect(screen.queryByText('Test Feed 1')).not.toBeInTheDocument();
    });
  });
});
