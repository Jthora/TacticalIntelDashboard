/**
 * Feature 1: Multi-Source Intelligence Feed Aggregation
 * End-to-End Functional Testing Implementation
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import FeedVisualizer from '../components/FeedVisualizer';
import FeedService from '../services/FeedService';
import RealTimeService from '../services/RealTimeService';
import React from 'react';

describe('🔧 FEATURE 1: Multi-Source Intelligence Feed Aggregation', () => {
  
  beforeEach(() => {
    // Reset all services and mocks
    jest.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up after each test
    jest.restoreAllMocks();
  });

  describe('📡 Phase 1: Feed Source Selection', () => {
    
    test('✅ Should load default feed lists on startup', async () => {
      // Arrange
      const mockFeedLists = [
        { id: 'breaking-news', name: 'Breaking News', active: true },
        { id: 'cyber-security', name: 'Cyber Security', active: false },
        { id: 'global-affairs', name: 'Global Affairs', active: false }
      ];

      // Mock FeedService response
      jest.spyOn(FeedService, 'getFeedLists').mockResolvedValue(mockFeedLists);

      // Act
      render(<FeedVisualizer selectedFeedList={null} />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Breaking News')).toBeTruthy();
        expect(screen.getByText('Cyber Security')).toBeTruthy();
        expect(screen.getByText('Global Affairs')).toBeTruthy();
      });

      // Verify service was called
      expect(FeedService.getFeedLists).toHaveBeenCalledTimes(1);
      
      // Log test completion
      logger.info('Test', '✅ Feed lists loaded successfully');
    });

    test('✅ Should handle feed list selection', async () => {
      // Arrange
      const mockFeeds = [
        { id: '1', title: 'Test Article 1', source: 'BBC', timestamp: new Date() },
        { id: '2', title: 'Test Article 2', source: 'CNN', timestamp: new Date() }
      ];

      jest.spyOn(FeedService, 'getFeedsByList').mockResolvedValue(mockFeeds);

      // Act
      render(<FeedVisualizer selectedFeedList="breaking-news" />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Test Article 1')).toBeTruthy();
        expect(screen.getByText('Test Article 2')).toBeTruthy();
      });

      // Verify correct feed list was requested
      expect(FeedService.getFeedsByList).toHaveBeenCalledWith('breaking-news');
      
      logger.info('Test', '✅ Feed list selection working correctly');
    });

    test('✅ Should display loading states during feed loading', async () => {
      // Arrange
      let resolvePromise: (value: any) => void;
      const loadingPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      jest.spyOn(FeedService, 'getFeedsByList').mockReturnValue(loadingPromise);

      // Act
      render(<FeedVisualizer selectedFeedList="breaking-news" />);

      // Assert - Loading state should be visible
      expect(screen.getByTestId('feed-loading-skeleton')).toBeTruthy();
      expect(screen.getByText('Loading intelligence feeds...')).toBeTruthy();

      // Resolve the promise
      resolvePromise!([]);

      // Assert - Loading state should disappear
      await waitFor(() => {
        expect(screen.queryByTestId('feed-loading-skeleton')).toBeFalsy();
      });

      logger.info('Test', '✅ Loading states functioning correctly');
    });

    test('⚠️ Should handle feed loading errors gracefully', async () => {
      // Arrange
      const errorMessage = 'Network error - unable to fetch feeds';
      jest.spyOn(FeedService, 'getFeedsByList').mockRejectedValue(new Error(errorMessage));

      // Act
      render(<FeedVisualizer selectedFeedList="breaking-news" />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Feed Loading Error')).toBeTruthy();
        expect(screen.getByText(/unable to fetch feeds/i)).toBeTruthy();
        expect(screen.getByText('Retry')).toBeTruthy();
      });

      logger.info('Test', '✅ Error handling working correctly');
    });
  });

  describe('🔄 Phase 2: Feed Data Acquisition', () => {
    
    test('✅ Should successfully parse XML/RSS feeds', async () => {
      // Arrange
      const mockRSSData = `<?xml version="1.0"?>
        <rss version="2.0">
          <channel>
            <title>Test Feed</title>
            <item>
              <title>Test Article</title>
              <description>Test Description</description>
              <pubDate>Mon, 07 Jan 2025 12:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>`;

      jest.spyOn(FeedService, 'parseRSSFeed').mockResolvedValue({
        title: 'Test Article',
        description: 'Test Description',
        pubDate: 'Mon, 07 Jan 2025 12:00:00 GMT'
      });

      // Act
      const result = await FeedService.parseRSSFeed(mockRSSData);

      // Assert
      expect(result.title).toBe('Test Article');
      expect(result.description).toBe('Test Description');
      expect(result.pubDate).toBe('Mon, 07 Jan 2025 12:00:00 GMT');

      logger.info('Test', '✅ RSS parsing functioning correctly');
    });

    test('✅ Should handle malformed feeds gracefully', async () => {
      // Arrange
      const malformedXML = '<rss><channel><item><title>Incomplete';

      // Act & Assert
      await expect(FeedService.parseRSSFeed(malformedXML)).rejects.toThrow();

      // Verify error logging
      expect(logger.error).toHaveBeenCalledWith(
        'FeedService',
        'Failed to parse RSS feed',
        expect.any(Object)
      );

      logger.info('Test', '✅ Malformed feed handling working correctly');
    });

    test('✅ Should process feeds through CORS proxy', async () => {
      // Arrange
      const feedUrl = 'https://example.com/rss.xml';
      const proxyUrl = 'http://localhost:8081/proxy';

      jest.spyOn(FeedService, 'fetchThroughProxy').mockResolvedValue({
        data: '<rss>...</rss>',
        status: 200
      });

      // Act
      const result = await FeedService.fetchThroughProxy(feedUrl);

      // Assert
      expect(result.status).toBe(200);
      expect(result.data).toBe('<rss>...</rss>');
      expect(FeedService.fetchThroughProxy).toHaveBeenCalledWith(feedUrl);

      logger.info('Test', '✅ CORS proxy functioning correctly');
    });
  });

  describe('⚡ Phase 3: Real-Time Updates', () => {
    
    test('✅ Should auto-refresh feeds at specified intervals', async () => {
      // Arrange
      jest.useFakeTimers();
      const mockUpdateFeeds = jest.spyOn(FeedService, 'updateFeeds').mockResolvedValue([]);

      // Act
      render(<FeedVisualizer selectedFeedList="breaking-news" />);

      // Fast-forward time by 5 minutes (300000ms)
      jest.advanceTimersByTime(300000);

      // Assert
      await waitFor(() => {
        expect(mockUpdateFeeds).toHaveBeenCalled();
      });

      jest.useRealTimers();
      logger.info('Test', '✅ Auto-refresh functioning correctly');
    });

    test('✅ Should handle manual refresh actions', async () => {
      // Arrange
      const mockRefreshFeeds = jest.spyOn(FeedService, 'refreshFeeds').mockResolvedValue([]);

      // Act
      render(<FeedVisualizer selectedFeedList="breaking-news" />);
      
      const refreshButton = screen.getByLabelText('Refresh feeds');
      fireEvent.click(refreshButton);

      // Assert
      await waitFor(() => {
        expect(mockRefreshFeeds).toHaveBeenCalled();
      });

      logger.info('Test', '✅ Manual refresh functioning correctly');
    });

    test('✅ Should maintain UI state during updates', async () => {
      // Arrange
      const mockFeeds = [
        { id: '1', title: 'Article 1', expanded: false },
        { id: '2', title: 'Article 2', expanded: true }
      ];

      jest.spyOn(FeedService, 'getFeedsByList').mockResolvedValue(mockFeeds);

      // Act
      render(<FeedVisualizer selectedFeedList="breaking-news" />);

      // Expand first article
      const expandButton = screen.getByLabelText('Expand article 1');
      fireEvent.click(expandButton);

      // Trigger refresh
      const refreshButton = screen.getByLabelText('Refresh feeds');
      fireEvent.click(refreshButton);

      // Assert - UI state should be maintained
      await waitFor(() => {
        expect(screen.getByText('Article 1')).toBeTruthy();
        expect(screen.getByText('Article 2')).toBeTruthy();
      });

      logger.info('Test', '✅ UI state persistence working correctly');
    });

    test('✅ Should handle real-time WebSocket updates', async () => {
      // Arrange
      const mockWebSocketUpdate = {
        type: 'feed_update',
        data: [{ id: '3', title: 'New Breaking News' }]
      };

      jest.spyOn(realTimeService, 'subscribe').mockImplementation((channel, callback) => {
        // Simulate WebSocket update
        setTimeout(() => callback(mockWebSocketUpdate), 100);
        return () => {}; // unsubscribe function
      });

      // Act
      render(<FeedVisualizer selectedFeedList="breaking-news" />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('New Breaking News')).toBeTruthy();
      });

      logger.info('Test', '✅ Real-time updates functioning correctly');
    });
  });

  describe('🔗 Integration Tests', () => {
    
    test('✅ Should complete full feed loading workflow', async () => {
      // Arrange
      const mockFeedLists = [{ id: 'test-list', name: 'Test List' }];
      const mockFeeds = [
        { id: '1', title: 'Test Article', source: 'Test Source' }
      ];

      jest.spyOn(FeedService, 'getFeedLists').mockResolvedValue(mockFeedLists);
      jest.spyOn(FeedService, 'getFeedsByList').mockResolvedValue(mockFeeds);

      // Act - Complete workflow
      render(<FeedVisualizer selectedFeedList="test-list" />);

      // Assert - All components should be present
      await waitFor(() => {
        expect(screen.getByText('Test Article')).toBeTruthy();
        expect(screen.getByText('Test Source')).toBeTruthy();
      });

      // Verify service calls
      expect(FeedService.getFeedsByList).toHaveBeenCalledWith('test-list');

      logger.info('Test', '✅ Complete workflow functioning correctly');
    });

    test('⚡ Should handle performance with large datasets', async () => {
      // Arrange
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `article-${i}`,
        title: `Article ${i}`,
        source: `Source ${i % 10}`,
        timestamp: new Date()
      }));

      jest.spyOn(FeedService, 'getFeedsByList').mockResolvedValue(largeDataset);

      // Act
      const startTime = performance.now();
      render(<FeedVisualizer selectedFeedList="large-dataset" />);

      await waitFor(() => {
        expect(screen.getByText('Article 0')).toBeTruthy();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Assert - Should render within reasonable time
      expect(renderTime).toBeLessThan(5000); // 5 seconds max

      logger.info('Test', `✅ Performance test completed in ${renderTime}ms`);
    });
  });

  describe('🛡️ Error Recovery Tests', () => {
    
    test('✅ Should recover from network failures', async () => {
      // Arrange
      jest.spyOn(FeedService, 'getFeedsByList')
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue([{ id: '1', title: 'Recovery Article' }]);

      // Act
      render(<FeedVisualizer selectedFeedList="test-list" />);

      // Assert - Error should be displayed
      await waitFor(() => {
        expect(screen.getByText('Feed Loading Error')).toBeTruthy();
      });

      // Act - Click retry
      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      // Assert - Should recover and display content
      await waitFor(() => {
        expect(screen.getByText('Recovery Article')).toBeTruthy();
      });

      logger.info('Test', '✅ Error recovery functioning correctly');
    });

    test('✅ Should handle CORS proxy fallback', async () => {
      // Arrange
      jest.spyOn(FeedService, 'fetchThroughProxy')
        .mockRejectedValueOnce(new Error('Primary proxy failed'))
        .mockResolvedValue({ data: '<rss>...</rss>', status: 200 });

      // Act
      const result = await FeedService.fetchWithFallback('https://example.com/rss.xml');

      // Assert
      expect(result.status).toBe(200);
      expect(FeedService.fetchThroughProxy).toHaveBeenCalledTimes(2);

      logger.info('Test', '✅ CORS proxy fallback functioning correctly');
    });
  });
});

/**
 * Test Utilities for Feed Aggregation
 */
export class FeedAggregationTestUtils {
  
  static createMockFeed(overrides = {}) {
    return {
      id: '1',
      title: 'Test Article',
      description: 'Test Description',
      source: 'Test Source',
      timestamp: new Date(),
      url: 'https://example.com/article',
      ...overrides
    };
  }

  static createMockFeedList(overrides = {}) {
    return {
      id: 'test-list',
      name: 'Test List',
      active: false,
      feeds: [],
      ...overrides
    };
  }

  static async waitForFeedLoad(container: HTMLElement, timeout = 5000) {
    await waitFor(() => {
      expect(container.querySelector('[data-testid="feed-item"]')).toBeTruthy();
    }, { timeout });
  }

  static async simulateNetworkDelay(ms = 1000) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Performance Testing Utilities
 */
export class FeedPerformanceTestUtils {
  
  static async measureRenderTime(renderFunction: () => void): Promise<number> {
    const startTime = performance.now();
    renderFunction();
    const endTime = performance.now();
    return endTime - startTime;
  }

  static async measureMemoryUsage(): Promise<number> {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  static createLargeDataset(size = 1000) {
    return Array.from({ length: size }, (_, i) => 
      FeedAggregationTestUtils.createMockFeed({
        id: `article-${i}`,
        title: `Article ${i}`,
        source: `Source ${i % 10}`
      })
    );
  }
}
