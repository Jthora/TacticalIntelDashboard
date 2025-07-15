/**
 * COMPREHENSIVE UI TESTS - 100 Critical Test Suite
 * Priority 2: FeedVisualizer Component (Tests 26-40)
 * Focus: Core feed display, loading states, error handling, auto-refresh
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import FeedVisualizer from '../../src/components/FeedVisualizer';
import { FilterProvider } from '../../src/contexts/FilterContext';
import { IntelligenceProvider } from '../../src/contexts/IntelligenceContext';

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

// Test wrapper with providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <IntelligenceProvider>
    <FilterProvider>
      {children}
    </FilterProvider>
  </IntelligenceProvider>
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
      render(
        <TestWrapper>
          <FeedVisualizer selectedFeedList="1" />
        </TestWrapper>
      );
      
      // Should show loading state briefly
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    test('UI_028: Should display feeds when selectedFeedList is provided', async () => {
      render(
        <TestWrapper>
          <FeedVisualizer selectedFeedList="1" />
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
          <FeedVisualizer selectedFeedList="1" />
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
          <FeedVisualizer selectedFeedList="1" />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/auto-refresh/i)).toBeInTheDocument();
      });
    });

    test('UI_032: Should toggle auto-refresh state when clicked', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <FeedVisualizer selectedFeedList="1" />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const autoRefreshBtn = screen.getByText(/auto-refresh/i);
        expect(autoRefreshBtn).toBeInTheDocument();
      });

      const autoRefreshBtn = screen.getByText(/auto-refresh/i);
      await user.click(autoRefreshBtn);
      
      // Check if button state changed (visual feedback)
      expect(autoRefreshBtn).toHaveClass('active');
    });

    test('UI_033: Should display last updated timestamp', async () => {
      render(
        <TestWrapper>
          <FeedVisualizer selectedFeedList="1" />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/last updated/i)).toBeInTheDocument();
      });
    });

    test('UI_034: Should show refresh button', async () => {
      render(
        <TestWrapper>
          <FeedVisualizer selectedFeedList="1" />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/refresh/i)).toBeInTheDocument();
      });
    });

    test('UI_035: Should handle manual refresh', async () => {
      const user = userEvent.setup();
      const FeedService = require('../../src/services/FeedService').default;
      
      render(
        <TestWrapper>
          <FeedVisualizer selectedFeedList="1" />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const refreshBtn = screen.getByText(/refresh/i);
        expect(refreshBtn).toBeInTheDocument();
      });

      const refreshBtn = screen.getByText(/refresh/i);
      await user.click(refreshBtn);
      
      // Should call getFeedsByList again
      expect(FeedService.getFeedsByList).toHaveBeenCalledTimes(2);
    });
  });

  describe('⚠️ Error Handling (Tests 36-40)', () => {
    test('UI_036: Should display error message when service fails', async () => {
      const FeedService = require('../../src/services/FeedService').default;
      FeedService.getFeedsByList.mockRejectedValueOnce(new Error('Network error'));

      render(
        <TestWrapper>
          <FeedVisualizer selectedFeedList="1" />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/error loading feeds/i)).toBeInTheDocument();
      });
    });

    test('UI_037: Should show retry button on error', async () => {
      const FeedService = require('../../src/services/FeedService').default;
      FeedService.getFeedsByList.mockRejectedValueOnce(new Error('Network error'));

      render(
        <TestWrapper>
          <FeedVisualizer selectedFeedList="1" />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/retry/i)).toBeInTheDocument();
      });
    });

    test('UI_038: Should retry loading when retry button clicked', async () => {
      const user = userEvent.setup();
      const FeedService = require('../../src/services/FeedService').default;
      FeedService.getFeedsByList
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce([
          { id: '1', title: 'Retry Test Feed', description: 'Test', url: 'http://test.com' }
        ]);

      render(
        <TestWrapper>
          <FeedVisualizer selectedFeedList="1" />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/retry/i)).toBeInTheDocument();
      });

      const retryBtn = screen.getByText(/retry/i);
      await user.click(retryBtn);
      
      await waitFor(() => {
        expect(screen.getByText('Retry Test Feed')).toBeInTheDocument();
      });
    });

    test('UI_039: Should handle prop changes correctly', async () => {
      const { rerender } = render(
        <TestWrapper>
          <FeedVisualizer selectedFeedList="1" />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Test Feed 1')).toBeInTheDocument();
      });

      // Change selectedFeedList
      rerender(
        <TestWrapper>
          <FeedVisualizer selectedFeedList="2" />
        </TestWrapper>
      );
      
      const FeedService = require('../../src/services/FeedService').default;
      expect(FeedService.getFeedsByList).toHaveBeenCalledWith("2");
    });

    test('UI_040: Should clear feeds when selectedFeedList becomes null', async () => {
      const { rerender } = render(
        <TestWrapper>
          <FeedVisualizer selectedFeedList="1" />
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
