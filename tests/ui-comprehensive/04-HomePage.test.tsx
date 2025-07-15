/**
 * COMPREHENSIVE UI TESTS - 100 Critical Test Suite
 * Priority 4: HomePage Component (Tests 56-70)
 * Focus: Main layout, state management, component orchestration
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import HomePage from '../../src/pages/HomePage';
import { FilterProvider } from '../../src/contexts/FilterContext';
import { IntelligenceProvider } from '../../src/contexts/IntelligenceContext';

// Mock all child components
jest.mock('../../src/components/LeftSidebar', () => {
  return function MockLeftSidebar({ setSelectedFeedList }: { setSelectedFeedList: Function }) {
    return (
      <div data-testid="left-sidebar">
        <button onClick={() => setSelectedFeedList('test-list')}>
          Select Test List
        </button>
      </div>
    );
  };
});

jest.mock('../../src/components/CentralView', () => {
  return function MockCentralView({ selectedFeedList }: { selectedFeedList: string | null }) {
    return (
      <div data-testid="central-view">
        Central View - {selectedFeedList || 'No list'}
      </div>
    );
  };
});

jest.mock('../../src/components/RightSidebar', () => {
  return function MockRightSidebar() {
    return <div data-testid="right-sidebar">Right Sidebar</div>;
  };
});

jest.mock('../../src/components/QuickActions', () => {
  return function MockQuickActions({ 
    selectedFeedList, 
    onRefreshAll, 
    onExportData 
  }: { 
    selectedFeedList: string | null;
    onRefreshAll: Function;
    onExportData: Function;
  }) {
    return (
      <div data-testid="quick-actions">
        <button onClick={() => onRefreshAll()}>Refresh All</button>
        <button onClick={() => onExportData()}>Export Data</button>
      </div>
    );
  };
});

jest.mock('../../src/components/alerts/AlertNotificationPanel', () => {
  return function MockAlertNotificationPanel() {
    return <div data-testid="alert-panel">Alert Panel</div>;
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

describe('🎯 UI COMPREHENSIVE TESTS - HomePage Component (Tests 56-70)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock URL.createObjectURL and related methods
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    global.URL.revokeObjectURL = jest.fn();
    
    // Mock DOM methods
    const mockCreateElement = jest.fn(() => ({
      href: '',
      download: '',
      click: jest.fn()
    }));
    document.createElement = mockCreateElement;
  });

  describe('🔧 Layout Structure (Tests 56-60)', () => {
    test('UI_056: Should render HomePage with all required components', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );
      
      expect(screen.getByTestId('left-sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('central-view')).toBeInTheDocument();
      expect(screen.getByTestId('right-sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
      expect(screen.getByTestId('alert-panel')).toBeInTheDocument();
    });

    test('UI_057: Should have home-page-container class', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );
      
      const container = document.querySelector('.home-page-container');
      expect(container).toBeInTheDocument();
    });

    test('UI_058: Should have tactical sidebar layout classes', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );
      
      expect(document.querySelector('.tactical-sidebar-left')).toBeInTheDocument();
      expect(document.querySelector('.tactical-main')).toBeInTheDocument();
      expect(document.querySelector('.tactical-sidebar-right')).toBeInTheDocument();
      expect(document.querySelector('.tactical-footer')).toBeInTheDocument();
    });

    test('UI_059: Should initialize with null selectedFeedList', () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );
      
      // Should show "No list" initially until auto-selection kicks in
      expect(screen.getByText(/Central View - No list/)).toBeInTheDocument();
    });

    test('UI_060: Should auto-select default feed list', async () => {
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );
      
      // Should auto-select "1" as default feed list
      await waitFor(() => {
        expect(screen.getByText(/Central View - 1/)).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('🎛️ State Management (Tests 61-65)', () => {
    test('UI_061: Should update selectedFeedList when LeftSidebar triggers change', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );
      
      const selectButton = screen.getByText('Select Test List');
      await user.click(selectButton);
      
      expect(screen.getByText(/Central View - test-list/)).toBeInTheDocument();
    });

    test('UI_062: Should pass selectedFeedList to child components', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );
      
      const selectButton = screen.getByText('Select Test List');
      await user.click(selectButton);
      
      // CentralView should receive the selected feed list
      expect(screen.getByText(/Central View - test-list/)).toBeInTheDocument();
    });

    test('UI_063: Should maintain state consistency across re-renders', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );
      
      const selectButton = screen.getByText('Select Test List');
      await user.click(selectButton);
      
      rerender(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );
      
      // State should be maintained after re-render
      expect(screen.getByText(/Central View - test-list/)).toBeInTheDocument();
    });

    test('UI_064: Should handle rapid state changes', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );
      
      const selectButton = screen.getByText('Select Test List');
      
      // Rapid clicks
      await user.click(selectButton);
      await user.click(selectButton);
      await user.click(selectButton);
      
      expect(screen.getByText(/Central View - test-list/)).toBeInTheDocument();
    });

    test('UI_065: Should log state changes for debugging', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );
      
      const selectButton = screen.getByText('Select Test List');
      await user.click(selectButton);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('TDD_SUCCESS_069'),
        'test-list'
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('⚡ Action Handlers (Tests 66-70)', () => {
    test('UI_066: Should handle refresh all action', async () => {
      const reloadSpy = jest.spyOn(window.location, 'reload').mockImplementation();
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );
      
      const refreshButton = screen.getByText('Refresh All');
      await user.click(refreshButton);
      
      expect(reloadSpy).toHaveBeenCalled();
      reloadSpy.mockRestore();
    });

    test('UI_067: Should handle export data action', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );
      
      const exportButton = screen.getByText('Export Data');
      await user.click(exportButton);
      
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    test('UI_068: Should create proper export data structure', async () => {
      const user = userEvent.setup();
      const blobSpy = jest.spyOn(global, 'Blob');
      
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );
      
      const exportButton = screen.getByText('Export Data');
      await user.click(exportButton);
      
      expect(blobSpy).toHaveBeenCalledWith(
        [expect.stringContaining('timestamp')],
        { type: 'application/json' }
      );
    });

    test('UI_069: Should include selectedFeedList in export data', async () => {
      const user = userEvent.setup();
      const blobSpy = jest.spyOn(global, 'Blob');
      
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );
      
      // First select a feed list
      const selectButton = screen.getByText('Select Test List');
      await user.click(selectButton);
      
      // Then export
      const exportButton = screen.getByText('Export Data');
      await user.click(exportButton);
      
      const exportData = JSON.parse(blobSpy.mock.calls[0][0][0]);
      expect(exportData.selectedFeedList).toBe('test-list');
    });

    test('UI_070: Should generate unique export filenames', async () => {
      const user = userEvent.setup();
      const mockElement = { href: '', download: '', click: jest.fn() };
      document.createElement = jest.fn(() => mockElement);
      
      render(
        <TestWrapper>
          <HomePage />
        </TestWrapper>
      );
      
      const exportButton = screen.getByText('Export Data');
      await user.click(exportButton);
      
      expect(mockElement.download).toMatch(/tactical-intel-export-\d+\.json/);
    });
  });
});
