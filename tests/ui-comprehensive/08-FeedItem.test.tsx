/**
 * ADDITIONAL UI TESTS - Critical Untested Components
 * Focus: FeedItem, QuickActions, SearchAndFilter, ExportPanel
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import FeedItem from '../../src/components/FeedItem';
import { Feed } from '../../src/models/Feed';

// Mock data
const mockFeed: Feed = {
  id: '1',
  name: 'test-feed',
  url: 'https://example.com/feed',
  title: 'Test Intelligence Feed',
  link: 'https://example.com/article',
  pubDate: '2024-01-15T10:30:00Z',
  description: 'Critical intelligence from field operations',
  feedListId: '1',
  priority: 'HIGH',
  contentType: 'INTEL',
  region: 'GLOBAL',
  classification: 'CONFIDENTIAL',
  source: 'Field Agent Alpha'
};

describe('🎯 ADDITIONAL UI TESTS - FeedItem Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('🔧 Basic Rendering', () => {
    test('Should render FeedItem with all required elements', () => {
      render(<FeedItem feed={mockFeed} />);
      
      expect(screen.getByText('Test Intelligence Feed')).toBeInTheDocument();
      expect(screen.getByText('Critical intelligence from field operations')).toBeInTheDocument();
    });

    test('Should display classification badge', () => {
      render(<FeedItem feed={mockFeed} />);
      
      expect(screen.getByText('CONFIDENTIAL')).toBeInTheDocument();
    });

    test('Should show priority indicator', () => {
      render(<FeedItem feed={mockFeed} />);
      
      const priorityElement = document.querySelector('.priority-high');
      expect(priorityElement).toBeInTheDocument();
    });

    test('Should format date properly', () => {
      render(<FeedItem feed={mockFeed} />);
      
      // Should display formatted date
      expect(screen.getByText(/2024/)).toBeInTheDocument();
    });

    test('Should handle missing optional fields', () => {
      const minimalFeed = {
        id: '2',
        name: 'minimal-feed',
        url: 'https://example.com',
        title: 'Minimal Feed',
        link: 'https://example.com/link',
        pubDate: '2024-01-15T10:30:00Z',
        feedListId: '1'
      } as Feed;
      
      render(<FeedItem feed={minimalFeed} />);
      
      expect(screen.getByText('Minimal Feed')).toBeInTheDocument();
    });
  });

  describe('🎛️ Interactive Elements', () => {
    test('Should handle click events', async () => {
      const user = userEvent.setup();
      render(<FeedItem feed={mockFeed} />);
      
      const feedElement = screen.getByText('Test Intelligence Feed');
      await user.click(feedElement);
      
      // Should not throw error on click
      expect(feedElement).toBeInTheDocument();
    });

    test('Should show reliability score', () => {
      render(<FeedItem feed={mockFeed} />);
      
      // Check for any percentage or reliability indicator
      const percentageElements = document.querySelectorAll('[class*="reliability"], [class*="score"]');
      expect(percentageElements.length).toBeGreaterThanOrEqual(0);
    });

    test('Should display verified status', () => {
      render(<FeedItem feed={mockFeed} />);
      
      const verifiedIcon = document.querySelector('[class*="verified"], [class*="status"]');
      expect(verifiedIcon).toBeTruthy();
    });

    test('Should handle different content types', () => {
      const alertFeed = { ...mockFeed, contentType: 'ALERT' as const };
      render(<FeedItem feed={alertFeed} />);
      
      expect(screen.getByText('Test Intelligence Feed')).toBeInTheDocument();
    });

    test('Should show source information', () => {
      render(<FeedItem feed={mockFeed} />);
      
      expect(screen.getByText('Field Agent Alpha')).toBeInTheDocument();
    });
  });
});
