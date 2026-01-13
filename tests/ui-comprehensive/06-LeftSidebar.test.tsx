/**
 * COMPREHENSIVE UI TESTS - 100 Critical Test Suite
 * Priority 6: LeftSidebar Component (Tests 81-90)
 * Focus: Feed list navigation, source management, filtering
 */

import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import LeftSidebar from '../../src/components/LeftSidebar';
import { FilterProvider } from '../../src/contexts/FilterContext';
import { IntelligenceProvider } from '../../src/contexts/IntelligenceContext';

// Mock IntelSources component
jest.mock('../../src/components/IntelSources', () => {
  return function MockIntelSources({ setSelectedFeedList }: { setSelectedFeedList: Function }) {
    return (
      <div data-testid="intel-sources">
        <button onClick={() => setSelectedFeedList('mock-list')}>
          Mock Feed List
        </button>
      </div>
    );
  };
});

// Test wrapper with providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <IntelligenceProvider>
    <FilterProvider>{children}</FilterProvider>
  </IntelligenceProvider>
);

const renderSidebar = (setSelectedFeedList: jest.Mock, selectedFeedList: string | null = null) =>
  render(
    <TestWrapper>
      <LeftSidebar selectedFeedList={selectedFeedList} setSelectedFeedList={setSelectedFeedList} />
    </TestWrapper>
  );

describe.skip('🎯 UI COMPREHENSIVE TESTS - LeftSidebar Component (Tests 81-90)', () => {
  const mockSetSelectedFeedList = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('🔧 Basic Structure (Tests 81-85)', () => {
    test('UI_081: Should render LeftSidebar component', () => {
      renderSidebar(mockSetSelectedFeedList);

      const sidebar = document.querySelector('.tactical-sidebar-left');
      expect(sidebar).toBeInTheDocument();
    });

    test('UI_082: Should have tactical module structure', () => {
      renderSidebar(mockSetSelectedFeedList);

      expect(document.querySelector('.tactical-module')).toBeInTheDocument();
      expect(document.querySelector('.module-sources')).toBeInTheDocument();
    });

    test('UI_083: Should display sidebar header', () => {
      renderSidebar(mockSetSelectedFeedList);

      expect(screen.getByText('INTELLIGENCE SOURCES')).toBeInTheDocument();
    });

    test('UI_084: Should show satellite icon in header', () => {
      renderSidebar(mockSetSelectedFeedList);

      expect(screen.getByText('🛰️')).toBeInTheDocument();
    });

    test('UI_085: Should include IntelSources component', () => {
      renderSidebar(mockSetSelectedFeedList);

      expect(screen.getByTestId('intel-sources')).toBeInTheDocument();
    });
  });

  describe('🎛️ Feed List Management (Tests 86-90)', () => {
    test('UI_086: Should pass setSelectedFeedList to IntelSources', async () => {
      const user = userEvent.setup();
      renderSidebar(mockSetSelectedFeedList);

      const mockButton = screen.getByText('Mock Feed List');
      await user.click(mockButton);

      expect(mockSetSelectedFeedList).toHaveBeenCalledWith('mock-list');
    });

    test('UI_087: Should handle multiple feed list selections', async () => {
      const user = userEvent.setup();
      renderSidebar(mockSetSelectedFeedList);

      const mockButton = screen.getByText('Mock Feed List');

      // Multiple clicks
      await user.click(mockButton);
      await user.click(mockButton);
      await user.click(mockButton);

      expect(mockSetSelectedFeedList).toHaveBeenCalledTimes(3);
    });

    test('UI_088: Should maintain proper callback reference', () => {
      const { rerender } = renderSidebar(mockSetSelectedFeedList);

      expect(screen.getByTestId('intel-sources')).toBeInTheDocument();

      const newMockCallback = jest.fn();
      rerender(
        <TestWrapper>
          <LeftSidebar selectedFeedList={null} setSelectedFeedList={newMockCallback} />
        </TestWrapper>
      );

      expect(screen.getByTestId('intel-sources')).toBeInTheDocument();
    });

    test('UI_089: Should have proper animation classes', () => {
      renderSidebar(mockSetSelectedFeedList);

      const animatedElement = document.querySelector('.animate-fade-in-left');
      expect(animatedElement).toBeInTheDocument();
    });

    test('UI_090: Should maintain responsive layout', () => {
      renderSidebar(mockSetSelectedFeedList);

      const sidebar = document.querySelector('.tactical-sidebar-left');
      const module = document.querySelector('.tactical-module');

      expect(sidebar).toBeInTheDocument();
      expect(module).toBeInTheDocument();

      // Should have proper CSS classes for layout
      expect(module).toHaveClass('module-sources');
    });
  });
});
