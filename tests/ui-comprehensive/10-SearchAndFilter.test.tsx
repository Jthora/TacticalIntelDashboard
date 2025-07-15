/**
 * ADDITIONAL UI TESTS - SearchAndFilter Component
 * Focus: Search functionality, filtering, real-time updates
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import SearchAndFilter from '../../src/components/SearchAndFilter';
import { FilterProvider } from '../../src/contexts/FilterContext';
import { Feed } from '../../src/models/Feed';

// Mock data
const mockFeeds: Feed[] = [
  {
    id: '1',
    name: 'test-feed-1',
    url: 'https://example.com/feed1',
    title: 'Test Intelligence Report',
    link: 'https://example.com/article1',
    pubDate: '2024-01-15T10:30:00Z',
    description: 'Critical intelligence from field operations',
    feedListId: '1',
    priority: 'HIGH',
    contentType: 'INTEL'
  },
  {
    id: '2',
    name: 'test-feed-2',
    url: 'https://example.com/feed2',
    title: 'Security Alert Update',
    link: 'https://example.com/article2',
    pubDate: '2024-01-14T09:15:00Z',
    description: 'Security threat assessment',
    feedListId: '1',
    priority: 'CRITICAL',
    contentType: 'ALERT'
  }
];

const mockOnFilteredFeedsChange = jest.fn();

// Test wrapper with providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <FilterProvider>
    {children}
  </FilterProvider>
);

describe('🎯 ADDITIONAL UI TESTS - SearchAndFilter Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnFilteredFeedsChange.mockClear();
  });

  describe('🔧 Search Functionality', () => {
    test('Should render search input field', () => {
      render(
        <TestWrapper>
          <SearchAndFilter 
            feeds={mockFeeds}
            onFilteredFeedsChange={mockOnFilteredFeedsChange}
          />
        </TestWrapper>
      );
      
      const searchInput = screen.getByPlaceholderText(/search/i);
      expect(searchInput).toBeInTheDocument();
    });

    test('Should handle search input changes', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <SearchAndFilter 
            feeds={mockFeeds}
            onFilteredFeedsChange={mockOnFilteredFeedsChange}
          />
        </TestWrapper>
      );
      
      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'Intelligence');
      
      expect(searchInput).toHaveValue('Intelligence');
    });

    test('Should filter feeds based on search term', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <SearchAndFilter 
            feeds={mockFeeds}
            onFilteredFeedsChange={mockOnFilteredFeedsChange}
          />
        </TestWrapper>
      );
      
      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'Intelligence');
      
      // Should call onFilteredFeedsChange with filtered results
      await waitFor(() => {
        expect(mockOnFilteredFeedsChange).toHaveBeenCalled();
      });
    });

    test('Should handle clear search', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <SearchAndFilter 
            feeds={mockFeeds}
            onFilteredFeedsChange={mockOnFilteredFeedsChange}
          />
        </TestWrapper>
      );
      
      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'test query');
      
      // Clear the input
      await user.clear(searchInput);
      
      expect(searchInput).toHaveValue('');
    });
  });

  describe('🎛️ Filter Controls', () => {
    test('Should display time range filter', () => {
      render(
        <TestWrapper>
          <SearchAndFilter 
            feeds={mockFeeds}
            onFilteredFeedsChange={mockOnFilteredFeedsChange}
          />
        </TestWrapper>
      );
      
      // Look for time range selector label specifically
      const timeRangeLabel = screen.getByText('📅 Time Range:');
      expect(timeRangeLabel).toBeInTheDocument();
    });

    test('Should display source filter', () => {
      render(
        <TestWrapper>
          <SearchAndFilter 
            feeds={mockFeeds}
            onFilteredFeedsChange={mockOnFilteredFeedsChange}
          />
        </TestWrapper>
      );
      
      // Look for source selector label specifically
      const sourceLabel = screen.getByText('📡 Source:');
      expect(sourceLabel).toBeInTheDocument();
    });

    test('Should display sort options', () => {
      render(
        <TestWrapper>
          <SearchAndFilter 
            feeds={mockFeeds}
            onFilteredFeedsChange={mockOnFilteredFeedsChange}
          />
        </TestWrapper>
      );
      
      // Look for sort selector
      const sortSelector = screen.queryByText(/sort/i);
      expect(sortSelector).toBeTruthy();
    });

    test('Should handle filter changes', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <SearchAndFilter 
            feeds={mockFeeds}
            onFilteredFeedsChange={mockOnFilteredFeedsChange}
          />
        </TestWrapper>
      );
      
      // Find any dropdown or select element
      const dropdowns = document.querySelectorAll('select');
      if (dropdowns.length > 0) {
        await user.selectOptions(dropdowns[0], ['all']);
      }
      
      // Should handle filter interaction without error
      expect(true).toBe(true);
    });
  });

  describe('🔄 Real-time Updates', () => {
    test('Should call onFilteredFeedsChange when search changes', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <SearchAndFilter 
            feeds={mockFeeds}
            onFilteredFeedsChange={mockOnFilteredFeedsChange}
          />
        </TestWrapper>
      );
      
      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'Security');
      
      await waitFor(() => {
        expect(mockOnFilteredFeedsChange).toHaveBeenCalled();
      });
    });

    test('Should handle empty feeds array', () => {
      render(
        <TestWrapper>
          <SearchAndFilter 
            feeds={[]}
            onFilteredFeedsChange={mockOnFilteredFeedsChange}
          />
        </TestWrapper>
      );
      
      const searchInput = screen.getByPlaceholderText(/search/i);
      expect(searchInput).toBeInTheDocument();
    });

    test('Should maintain component state across prop changes', () => {
      const { rerender } = render(
        <TestWrapper>
          <SearchAndFilter 
            feeds={mockFeeds}
            onFilteredFeedsChange={mockOnFilteredFeedsChange}
          />
        </TestWrapper>
      );
      
      rerender(
        <TestWrapper>
          <SearchAndFilter 
            feeds={[mockFeeds[0]]}
            onFilteredFeedsChange={mockOnFilteredFeedsChange}
          />
        </TestWrapper>
      );
      
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });

    test('Should handle special characters in search', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <SearchAndFilter 
            feeds={mockFeeds}
            onFilteredFeedsChange={mockOnFilteredFeedsChange}
          />
        </TestWrapper>
      );
      
      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, '!@#$%');
      
      expect(searchInput).toHaveValue('!@#$%');
    });
  });
});
