/**
 * COMPREHENSIVE UI TESTS - 100 Critical Test Suite
 * Priority 3: CentralView Component (Tests 41-55)
 * Focus: Main content area, feed integration, status display
 */

import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import React from 'react';

import CentralView from '../../src/components/CentralView';
import { FilterProvider } from '../../src/contexts/FilterContext';
import { IntelligenceProvider } from '../../src/contexts/IntelligenceContext';

// Mock FeedVisualizer component
jest.mock('../../src/components/FeedVisualizer', () => {
  return function MockFeedVisualizer({ selectedFeedList }: { selectedFeedList: string | null }) {
    return (
      <div data-testid="feed-visualizer">
        {selectedFeedList ? `Feeds for list: ${selectedFeedList}` : 'No feeds selected'}
      </div>
    );
  };
});

// Test wrapper with providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <IntelligenceProvider>
    <FilterProvider>
      {children}
    </FilterProvider>
  </IntelligenceProvider>
);

describe('🎯 UI COMPREHENSIVE TESTS - CentralView Component (Tests 41-55)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('🔧 Basic Structure & Layout (Tests 41-45)', () => {
    test('UI_041: Should render CentralView component', () => {
      render(
        <TestWrapper>
          <CentralView selectedFeedList="1" />
        </TestWrapper>
      );
      
      expect(screen.getByTestId('feed-visualizer')).toBeInTheDocument();
    });

    test('UI_042: Should have tactical-main class', () => {
      render(
        <TestWrapper>
          <CentralView selectedFeedList="1" />
        </TestWrapper>
      );
      
      const mainElement = document.querySelector('.tactical-main');
      expect(mainElement).toBeInTheDocument();
    });

    test('UI_043: Should display module header with intelligence feed title', () => {
      render(
        <TestWrapper>
          <CentralView selectedFeedList="1" />
        </TestWrapper>
      );
      
      expect(screen.getByText('INTELLIGENCE FEED')).toBeInTheDocument();
    });

    test('UI_044: Should show module icon', () => {
      render(
        <TestWrapper>
          <CentralView selectedFeedList="1" />
        </TestWrapper>
      );
      
      expect(screen.getByText('📡')).toBeInTheDocument();
    });

    test('UI_045: Should have fade-in animation class', () => {
      render(
        <TestWrapper>
          <CentralView selectedFeedList="1" />
        </TestWrapper>
      );
      
      const moduleElement = document.querySelector('.animate-fade-in-up');
      expect(moduleElement).toBeInTheDocument();
    });
  });

  describe('📊 Status Display (Tests 46-50)', () => {
    test('UI_046: Should show ACTIVE status when feed list is selected', () => {
      render(
        <TestWrapper>
          <CentralView selectedFeedList="1" />
        </TestWrapper>
      );
      
      expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    });

    test('UI_047: Should show STANDBY status when no feed list selected', () => {
      render(
        <TestWrapper>
          <CentralView selectedFeedList={null} />
        </TestWrapper>
      );
      
      expect(screen.getByText('STANDBY')).toBeInTheDocument();
    });

    test('UI_048: Should have active status dot when feed selected', () => {
      render(
        <TestWrapper>
          <CentralView selectedFeedList="1" />
        </TestWrapper>
      );
      
      const statusDot = document.querySelector('.status-dot.active');
      expect(statusDot).toBeInTheDocument();
    });

    test('UI_049: Should have idle status dot when no feed selected', () => {
      render(
        <TestWrapper>
          <CentralView selectedFeedList={null} />
        </TestWrapper>
      );
      
      const statusDot = document.querySelector('.status-dot.idle');
      expect(statusDot).toBeInTheDocument();
    });

    test('UI_050: Should display header status section', () => {
      render(
        <TestWrapper>
          <CentralView selectedFeedList="1" />
        </TestWrapper>
      );
      
      const headerStatus = document.querySelector('.header-status');
      expect(headerStatus).toBeInTheDocument();
    });
  });

  describe('🔄 Feed Integration (Tests 51-55)', () => {
    test('UI_051: Should pass selectedFeedList to FeedVisualizer', () => {
      render(
        <TestWrapper>
          <CentralView selectedFeedList="test-list-123" />
        </TestWrapper>
      );
      
      expect(screen.getByText('Feeds for list: test-list-123')).toBeInTheDocument();
    });

    test('UI_052: Should handle null selectedFeedList', () => {
      render(
        <TestWrapper>
          <CentralView selectedFeedList={null} />
        </TestWrapper>
      );
      
      expect(screen.getByText('No feeds selected')).toBeInTheDocument();
    });

    test('UI_053: Should update when selectedFeedList changes', () => {
      const { rerender } = render(
        <TestWrapper>
          <CentralView selectedFeedList="list-1" />
        </TestWrapper>
      );
      
      expect(screen.getByText('Feeds for list: list-1')).toBeInTheDocument();
      
      rerender(
        <TestWrapper>
          <CentralView selectedFeedList="list-2" />
        </TestWrapper>
      );
      
      expect(screen.getByText('Feeds for list: list-2')).toBeInTheDocument();
    });

    test('UI_054: Should maintain component structure with different props', () => {
      const { rerender } = render(
        <TestWrapper>
          <CentralView selectedFeedList="1" />
        </TestWrapper>
      );
      
      expect(screen.getByText('INTELLIGENCE FEED')).toBeInTheDocument();
      
      rerender(
        <TestWrapper>
          <CentralView selectedFeedList={null} />
        </TestWrapper>
      );
      
      // Structure should remain the same
      expect(screen.getByText('INTELLIGENCE FEED')).toBeInTheDocument();
      expect(screen.getByText('📡')).toBeInTheDocument();
    });

    test('UI_055: Should have proper content padding', () => {
      render(
        <TestWrapper>
          <CentralView selectedFeedList="1" />
        </TestWrapper>
      );
      
      const tacticalContent = document.querySelector('.tactical-content');
      expect(tacticalContent).toHaveStyle('padding: 0');
    });
  });
});
