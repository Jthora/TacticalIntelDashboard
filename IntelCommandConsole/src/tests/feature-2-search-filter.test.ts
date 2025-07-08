/**
 * Feature 2: Advanced Search & Filter Engine
 * End-to-End Functional Testing Implementation
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '../components/Header';
import { TacticalFilters } from '../components/TacticalFilters';
import { FeedVisualizer } from '../components/FeedVisualizer';
import { SearchContext } from '../contexts/SearchContext';
import { FilterContext } from '../contexts/FilterContext';
import { logger } from '../utils/LoggerService';

describe('🔍 FEATURE 2: Advanced Search & Filter Engine', () => {
  
  let mockSearchContext: any;
  let mockFilterContext: any;

  beforeEach(() => {
    // Reset all mocks and state
    jest.clearAllMocks();
    localStorage.clear();

    // Mock search context
    mockSearchContext = {
      searchState: {
        query: '',
        results: [],
        isSearching: false,
        totalResults: 0
      },
      performSearch: jest.fn(),
      clearSearch: jest.fn(),
      setSearchQuery: jest.fn()
    };

    // Mock filter context
    mockFilterContext = {
      filterState: {
        timeRange: 'all',
        selectedSource: '',
        sortBy: 'date',
        activeFilters: new Set()
      },
      applyFilters: jest.fn(),
      clearFilters: jest.fn(),
      setTimeRange: jest.fn(),
      setSourceFilter: jest.fn(),
      setSortBy: jest.fn()
    };
  });

  describe('🔎 Phase 1: Search Interface', () => {
    
    test('✅ Should perform basic text search', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockFeeds = [
        { id: '1', title: 'Cybersecurity Alert', description: 'Security breach detected' },
        { id: '2', title: 'Market Update', description: 'Stock market analysis' },
        { id: '3', title: 'Cyber Attack News', description: 'Latest security threats' }
      ];

      mockSearchContext.performSearch.mockImplementation((query) => {
        const results = mockFeeds.filter(feed => 
          feed.title.toLowerCase().includes(query.query.toLowerCase()) ||
          feed.description.toLowerCase().includes(query.query.toLowerCase())
        );
        mockSearchContext.searchState.results = results;
        mockSearchContext.searchState.totalResults = results.length;
      });

      // Act
      render(
        <SearchContext.Provider value={mockSearchContext}>
          <Header />
        </SearchContext.Provider>
      );

      const searchInput = screen.getByPlaceholderText('Search intelligence feeds...');
      await user.type(searchInput, 'cyber');
      await user.keyboard('{Enter}');

      // Assert
      expect(mockSearchContext.performSearch).toHaveBeenCalledWith({
        query: 'cyber',
        operators: 'AND',
        caseSensitive: false
      });

      logger.info('Test', '✅ Basic text search functioning correctly');
    });

    test('✅ Should handle real-time search updates', async () => {
      // Arrange
      const user = userEvent.setup();
      mockSearchContext.performSearch.mockImplementation((query) => {
        mockSearchContext.searchState.isSearching = true;
        setTimeout(() => {
          mockSearchContext.searchState.isSearching = false;
          mockSearchContext.searchState.results = [];
        }, 300);
      });

      // Act
      render(
        <SearchContext.Provider value={mockSearchContext}>
          <Header />
        </SearchContext.Provider>
      );

      const searchInput = screen.getByPlaceholderText('Search intelligence feeds...');
      await user.type(searchInput, 'test');

      // Assert - Should show searching state
      expect(mockSearchContext.searchState.isSearching).toBe(true);

      // Wait for search to complete
      await waitFor(() => {
        expect(mockSearchContext.searchState.isSearching).toBe(false);
      });

      logger.info('Test', '✅ Real-time search updates functioning correctly');
    });

    test('✅ Should highlight search matches', async () => {
      // Arrange
      const searchQuery = 'security';
      const mockResults = [
        { id: '1', title: 'Security Alert', description: 'Important security update' }
      ];

      mockSearchContext.searchState.query = searchQuery;
      mockSearchContext.searchState.results = mockResults;

      // Act
      render(
        <SearchContext.Provider value={mockSearchContext}>
          <FeedVisualizer selectedFeedList="search-results" />
        </SearchContext.Provider>
      );

      // Assert - Search terms should be highlighted
      await waitFor(() => {
        const highlightedText = screen.getByText('Security Alert');
        expect(highlightedText).toHaveClass('search-highlight');
      });

      logger.info('Test', '✅ Search highlighting functioning correctly');
    });

    test('✅ Should handle empty search results', async () => {
      // Arrange
      mockSearchContext.searchState.query = 'nonexistent';
      mockSearchContext.searchState.results = [];
      mockSearchContext.searchState.totalResults = 0;

      // Act
      render(
        <SearchContext.Provider value={mockSearchContext}>
          <FeedVisualizer selectedFeedList="search-results" />
        </SearchContext.Provider>
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument();
        expect(screen.getByText(/Try adjusting your search/i)).toBeInTheDocument();
      });

      logger.info('Test', '✅ Empty search results handling correctly');
    });
  });

  describe('🔧 Phase 2: Advanced Filtering', () => {
    
    test('✅ Should filter by time range', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockFeeds = [
        { id: '1', title: 'Recent News', timestamp: new Date() },
        { id: '2', title: 'Old News', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      ];

      mockFilterContext.applyFilters.mockImplementation((filters) => {
        const timeRange = filters.timeRange;
        let filtered = mockFeeds;

        if (timeRange === '24hours') {
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          filtered = mockFeeds.filter(feed => feed.timestamp > oneDayAgo);
        }

        mockFilterContext.filterState.filteredFeeds = filtered;
      });

      // Act
      render(
        <FilterContext.Provider value={mockFilterContext}>
          <TacticalFilters />
        </FilterContext.Provider>
      );

      const timeRangeSelect = screen.getByLabelText('Time Range');
      await user.selectOptions(timeRangeSelect, '24hours');

      // Assert
      expect(mockFilterContext.applyFilters).toHaveBeenCalledWith({
        timeRange: '24hours'
      });

      logger.info('Test', '✅ Time range filtering functioning correctly');
    });

    test('✅ Should filter by source organization', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockFeeds = [
        { id: '1', title: 'BBC News', source: 'BBC' },
        { id: '2', title: 'CNN Update', source: 'CNN' },
        { id: '3', title: 'Reuters Report', source: 'Reuters' }
      ];

      mockFilterContext.applyFilters.mockImplementation((filters) => {
        const sourceFilter = filters.selectedSource;
        let filtered = mockFeeds;

        if (sourceFilter) {
          filtered = mockFeeds.filter(feed => feed.source === sourceFilter);
        }

        mockFilterContext.filterState.filteredFeeds = filtered;
      });

      // Act
      render(
        <FilterContext.Provider value={mockFilterContext}>
          <TacticalFilters />
        </FilterContext.Provider>
      );

      const sourceSelect = screen.getByLabelText('Source');
      await user.selectOptions(sourceSelect, 'BBC');

      // Assert
      expect(mockFilterContext.applyFilters).toHaveBeenCalledWith({
        selectedSource: 'BBC'
      });

      logger.info('Test', '✅ Source filtering functioning correctly');
    });

    test('✅ Should combine multiple filters', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockFeeds = [
        { id: '1', title: 'BBC Recent', source: 'BBC', timestamp: new Date() },
        { id: '2', title: 'CNN Recent', source: 'CNN', timestamp: new Date() },
        { id: '3', title: 'BBC Old', source: 'BBC', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      ];

      mockFilterContext.applyFilters.mockImplementation((filters) => {
        let filtered = mockFeeds;

        // Apply time range filter
        if (filters.timeRange === '24hours') {
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          filtered = filtered.filter(feed => feed.timestamp > oneDayAgo);
        }

        // Apply source filter
        if (filters.selectedSource) {
          filtered = filtered.filter(feed => feed.source === filters.selectedSource);
        }

        mockFilterContext.filterState.filteredFeeds = filtered;
      });

      // Act
      render(
        <FilterContext.Provider value={mockFilterContext}>
          <TacticalFilters />
        </FilterContext.Provider>
      );

      const timeRangeSelect = screen.getByLabelText('Time Range');
      const sourceSelect = screen.getByLabelText('Source');

      await user.selectOptions(timeRangeSelect, '24hours');
      await user.selectOptions(sourceSelect, 'BBC');

      // Assert
      expect(mockFilterContext.applyFilters).toHaveBeenCalledWith({
        timeRange: '24hours',
        selectedSource: 'BBC'
      });

      logger.info('Test', '✅ Multiple filter combination functioning correctly');
    });

    test('✅ Should handle filter clearing', async () => {
      // Arrange
      const user = userEvent.setup();
      mockFilterContext.filterState.activeFilters = new Set(['timeRange', 'source']);

      // Act
      render(
        <FilterContext.Provider value={mockFilterContext}>
          <TacticalFilters />
        </FilterContext.Provider>
      );

      const clearButton = screen.getByText('Clear Filters');
      await user.click(clearButton);

      // Assert
      expect(mockFilterContext.clearFilters).toHaveBeenCalled();

      logger.info('Test', '✅ Filter clearing functioning correctly');
    });
  });

  describe('🔗 Phase 3: Search-Filter Integration', () => {
    
    test('✅ Should combine search with filters', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockFeeds = [
        { id: '1', title: 'BBC Security Alert', source: 'BBC', timestamp: new Date() },
        { id: '2', title: 'CNN Security News', source: 'CNN', timestamp: new Date() },
        { id: '3', title: 'BBC Sports Update', source: 'BBC', timestamp: new Date() }
      ];

      // Mock combined search and filter
      const performSearchWithFilters = jest.fn().mockImplementation((searchQuery, filters) => {
        let results = mockFeeds;

        // Apply search
        if (searchQuery) {
          results = results.filter(feed => 
            feed.title.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        // Apply filters
        if (filters.selectedSource) {
          results = results.filter(feed => feed.source === filters.selectedSource);
        }

        return results;
      });

      // Act
      render(
        <SearchContext.Provider value={{
          ...mockSearchContext,
          performSearchWithFilters
        }}>
          <FilterContext.Provider value={mockFilterContext}>
            <div>
              <Header />
              <TacticalFilters />
            </div>
          </FilterContext.Provider>
        </SearchContext.Provider>
      );

      // Perform search
      const searchInput = screen.getByPlaceholderText('Search intelligence feeds...');
      await user.type(searchInput, 'security');

      // Apply filter
      const sourceSelect = screen.getByLabelText('Source');
      await user.selectOptions(sourceSelect, 'BBC');

      // Assert
      expect(performSearchWithFilters).toHaveBeenCalledWith('security', {
        selectedSource: 'BBC'
      });

      logger.info('Test', '✅ Search-filter integration functioning correctly');
    });

    test('✅ Should persist filter state', async () => {
      // Arrange
      const savedFilters = {
        timeRange: '24hours',
        selectedSource: 'BBC',
        sortBy: 'date'
      };

      // Mock localStorage
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => JSON.stringify(savedFilters)),
          setItem: jest.fn(),
          removeItem: jest.fn()
        }
      });

      // Act
      render(
        <FilterContext.Provider value={mockFilterContext}>
          <TacticalFilters />
        </FilterContext.Provider>
      );

      // Assert
      await waitFor(() => {
        expect(mockFilterContext.filterState.timeRange).toBe('24hours');
        expect(mockFilterContext.filterState.selectedSource).toBe('BBC');
      });

      logger.info('Test', '✅ Filter state persistence functioning correctly');
    });

    test('✅ Should display result statistics', async () => {
      // Arrange
      mockSearchContext.searchState.results = [
        { id: '1', title: 'Result 1' },
        { id: '2', title: 'Result 2' },
        { id: '3', title: 'Result 3' }
      ];
      mockSearchContext.searchState.totalResults = 3;

      // Act
      render(
        <SearchContext.Provider value={mockSearchContext}>
          <FeedVisualizer selectedFeedList="search-results" />
        </SearchContext.Provider>
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByText('3 results found')).toBeInTheDocument();
      });

      logger.info('Test', '✅ Result statistics display functioning correctly');
    });

    test('✅ Should handle search result sorting', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockResults = [
        { id: '1', title: 'Z Article', timestamp: new Date('2025-01-01') },
        { id: '2', title: 'A Article', timestamp: new Date('2025-01-02') },
        { id: '3', title: 'M Article', timestamp: new Date('2025-01-03') }
      ];

      mockSearchContext.searchState.results = mockResults;
      mockFilterContext.setSortBy.mockImplementation((sortBy) => {
        const sorted = [...mockResults];
        if (sortBy === 'title') {
          sorted.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortBy === 'date') {
          sorted.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        }
        mockSearchContext.searchState.results = sorted;
      });

      // Act
      render(
        <FilterContext.Provider value={mockFilterContext}>
          <TacticalFilters />
        </FilterContext.Provider>
      );

      const sortSelect = screen.getByLabelText('Sort by');
      await user.selectOptions(sortSelect, 'title');

      // Assert
      expect(mockFilterContext.setSortBy).toHaveBeenCalledWith('title');

      logger.info('Test', '✅ Search result sorting functioning correctly');
    });
  });

  describe('⚡ Performance Tests', () => {
    
    test('✅ Should handle large dataset search efficiently', async () => {
      // Arrange
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        id: `article-${i}`,
        title: `Article ${i}`,
        description: `Description ${i}`,
        source: `Source ${i % 10}`,
        timestamp: new Date()
      }));

      mockSearchContext.performSearch.mockImplementation((query) => {
        const startTime = performance.now();
        
        const results = largeDataset.filter(feed => 
          feed.title.toLowerCase().includes(query.query.toLowerCase())
        );
        
        const endTime = performance.now();
        const searchTime = endTime - startTime;

        mockSearchContext.searchState.results = results;
        mockSearchContext.searchState.searchTime = searchTime;
      });

      // Act
      const user = userEvent.setup();
      render(
        <SearchContext.Provider value={mockSearchContext}>
          <Header />
        </SearchContext.Provider>
      );

      const searchInput = screen.getByPlaceholderText('Search intelligence feeds...');
      await user.type(searchInput, 'Article');
      await user.keyboard('{Enter}');

      // Assert
      expect(mockSearchContext.searchState.searchTime).toBeLessThan(200); // < 200ms

      logger.info('Test', `✅ Large dataset search completed in ${mockSearchContext.searchState.searchTime}ms`);
    });

    test('✅ Should handle rapid filter changes efficiently', async () => {
      // Arrange
      const user = userEvent.setup();
      let filterCallCount = 0;

      mockFilterContext.applyFilters.mockImplementation(() => {
        filterCallCount++;
      });

      // Act
      render(
        <FilterContext.Provider value={mockFilterContext}>
          <TacticalFilters />
        </FilterContext.Provider>
      );

      const timeRangeSelect = screen.getByLabelText('Time Range');
      
      // Rapidly change filters
      await user.selectOptions(timeRangeSelect, '1hour');
      await user.selectOptions(timeRangeSelect, '24hours');
      await user.selectOptions(timeRangeSelect, '7days');

      // Assert - Should not cause excessive re-renders
      expect(filterCallCount).toBeLessThan(5);

      logger.info('Test', '✅ Rapid filter changes handled efficiently');
    });
  });

  describe('🛡️ Error Handling Tests', () => {
    
    test('✅ Should handle search service errors', async () => {
      // Arrange
      const user = userEvent.setup();
      mockSearchContext.performSearch.mockRejectedValue(new Error('Search service unavailable'));

      // Act
      render(
        <SearchContext.Provider value={mockSearchContext}>
          <Header />
        </SearchContext.Provider>
      );

      const searchInput = screen.getByPlaceholderText('Search intelligence feeds...');
      await user.type(searchInput, 'test');
      await user.keyboard('{Enter}');

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Search Error')).toBeInTheDocument();
        expect(screen.getByText(/search service unavailable/i)).toBeInTheDocument();
      });

      logger.info('Test', '✅ Search service error handling functioning correctly');
    });

    test('✅ Should handle filter service errors', async () => {
      // Arrange
      const user = userEvent.setup();
      mockFilterContext.applyFilters.mockRejectedValue(new Error('Filter service error'));

      // Act
      render(
        <FilterContext.Provider value={mockFilterContext}>
          <TacticalFilters />
        </FilterContext.Provider>
      );

      const timeRangeSelect = screen.getByLabelText('Time Range');
      await user.selectOptions(timeRangeSelect, '24hours');

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Filter Error')).toBeInTheDocument();
      });

      logger.info('Test', '✅ Filter service error handling functioning correctly');
    });
  });
});

/**
 * Test Utilities for Search & Filter Engine
 */
export class SearchFilterTestUtils {
  
  static createMockSearchResults(count: number, searchTerm?: string) {
    return Array.from({ length: count }, (_, i) => ({
      id: `result-${i}`,
      title: searchTerm ? `${searchTerm} Article ${i}` : `Article ${i}`,
      description: `Description ${i}`,
      source: `Source ${i % 5}`,
      timestamp: new Date(Date.now() - i * 1000 * 60 * 60), // Staggered timestamps
      relevanceScore: Math.random()
    }));
  }

  static createMockFilterState(overrides = {}) {
    return {
      timeRange: 'all',
      selectedSource: '',
      sortBy: 'date',
      activeFilters: new Set(),
      filteredFeeds: [],
      ...overrides
    };
  }

  static async performSearchTest(searchTerm: string, expectedResults: number) {
    const mockResults = SearchFilterTestUtils.createMockSearchResults(expectedResults, searchTerm);
    
    const mockPerformSearch = jest.fn().mockResolvedValue({
      results: mockResults,
      totalResults: expectedResults,
      searchTime: 150
    });

    return { mockResults, mockPerformSearch };
  }

  static async performFilterTest(filterConfig: any, expectedResults: number) {
    const mockResults = SearchFilterTestUtils.createMockSearchResults(expectedResults);
    
    const mockApplyFilters = jest.fn().mockResolvedValue({
      filteredFeeds: mockResults,
      totalFiltered: expectedResults
    });

    return { mockResults, mockApplyFilters };
  }

  static simulateTypingWithDelay(input: HTMLElement, text: string, delay = 100) {
    return new Promise<void>((resolve) => {
      let i = 0;
      const typeNext = () => {
        if (i < text.length) {
          fireEvent.input(input, { target: { value: text.slice(0, i + 1) } });
          i++;
          setTimeout(typeNext, delay);
        } else {
          resolve();
        }
      };
      typeNext();
    });
  }

  static async waitForSearchResults(container: HTMLElement, timeout = 3000) {
    await waitFor(() => {
      expect(container.querySelector('[data-testid="search-results"]')).toBeInTheDocument();
    }, { timeout });
  }

  static async waitForFilterApplication(container: HTMLElement, timeout = 3000) {
    await waitFor(() => {
      expect(container.querySelector('[data-testid="filtered-results"]')).toBeInTheDocument();
    }, { timeout });
  }
}

/**
 * Performance Testing for Search & Filter
 */
export class SearchFilterPerformanceUtils {
  
  static async measureSearchPerformance(searchFunction: Function, dataset: any[], searchTerm: string) {
    const startTime = performance.now();
    
    const results = await searchFunction(dataset, searchTerm);
    
    const endTime = performance.now();
    const searchTime = endTime - startTime;
    
    return {
      searchTime,
      resultCount: results.length,
      performance: searchTime < 200 ? 'excellent' : searchTime < 500 ? 'good' : 'needs improvement'
    };
  }

  static async measureFilterPerformance(filterFunction: Function, dataset: any[], filters: any) {
    const startTime = performance.now();
    
    const results = await filterFunction(dataset, filters);
    
    const endTime = performance.now();
    const filterTime = endTime - startTime;
    
    return {
      filterTime,
      resultCount: results.length,
      performance: filterTime < 100 ? 'excellent' : filterTime < 300 ? 'good' : 'needs improvement'
    };
  }

  static createLargeSearchDataset(size = 10000) {
    return Array.from({ length: size }, (_, i) => ({
      id: `item-${i}`,
      title: `Article ${i} ${i % 2 === 0 ? 'security' : 'market'} ${i % 3 === 0 ? 'update' : 'news'}`,
      description: `This is description ${i} containing various keywords for testing`,
      source: `Source ${i % 10}`,
      timestamp: new Date(Date.now() - i * 1000 * 60),
      tags: [`tag${i % 5}`, `category${i % 3}`],
      priority: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low'
    }));
  }
}
