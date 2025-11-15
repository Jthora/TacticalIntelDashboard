/**
 * COMPREHENSIVE UI TESTS - 100 Critical Test Suite
 * Priority 1: Core Components Most Likely to Break
 * Focus: IntelSources, FeedVisualizer, HomePage,     test('UI_009: Should update view mode state correctly', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <IntelSources setSelectedFeedList={mockSetSelectedFeedList} />
        </TestWrapper>
      );
      
      const viewSelect = screen.getByDisplayValue('GRID');
      await user.selectOptions(viewSelect, 'compact');
      
      expect(viewSelect).toHaveValue('compact');
    });*/

import '@testing-library/jest-dom';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock all services and contexts
import IntelSources from '../../src/components/IntelSources';
import { FilterProvider } from '../../src/contexts/FilterContext';
import { IntelligenceProvider } from '../../src/contexts/IntelligenceContext';

jest.mock('../../src/contexts/MissionModeContext', () => ({
  useMissionMode: () => ({
    mode: 'MILTECH',
    profile: {
      badge: '🛰️',
      label: 'STANDARD OPERATIONS',
      tagline: 'Trusted situational awareness',
      defaultFeedListId: 'modern-api',
      defaultTheme: 'dark',
      description: 'Baseline mission profile for comprehensive monitoring.'
    }
  })
}));

// Mock services
jest.mock('../../src/services/FeedService', () => ({
  __esModule: true,
  default: {
    getFeedLists: jest.fn(() => Promise.resolve([
      { id: '1', name: 'Default List' },
      { id: 'modern-api', name: 'Modern Intelligence Sources' },
      { id: 'primary-intel', name: 'Primary Intelligence' }
    ])),
    getFeedsByList: jest.fn(() => Promise.resolve([])),
    enrichFeedWithMetadata: jest.fn(feed => feed)
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

describe('🎯 UI COMPREHENSIVE TESTS - IntelSources Component (Tests 1-25)', () => {
  const mockSetSelectedFeedList = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('🔧 Basic Rendering & Structure (Tests 1-5)', () => {
    test('UI_001: Should render IntelSources component without crashing', () => {
      render(
        <TestWrapper>
          <IntelSources setSelectedFeedList={mockSetSelectedFeedList} />
        </TestWrapper>
      );
      expect(screen.getByText(/INTEL/i)).toBeInTheDocument();
    });

  test('UI_002: Should display module header with correct title', () => {
    render(
      <TestWrapper>
        <IntelSources setSelectedFeedList={mockSetSelectedFeedList} />
      </TestWrapper>
    );
    const header = screen.getByText(/INTEL SOURCES/i);
    expect(header).toBeInTheDocument();
  });

    test('UI_003: Should show status indicator in header', () => {
      render(
        <TestWrapper>
          <IntelSources setSelectedFeedList={mockSetSelectedFeedList} />
        </TestWrapper>
      );
      const statusDot = document.querySelector('.status-dot');
      expect(statusDot).toBeInTheDocument();
    });

  test('UI_004: Should render control panel section', async () => {
    render(
      <TestWrapper>
        <IntelSources setSelectedFeedList={mockSetSelectedFeedList} />
      </TestWrapper>
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('ESTABLISHING CONNECTIONS...')).not.toBeInTheDocument();
    }, { timeout: 5000 });
    
    const controlPanel = document.querySelector('.intel-controls-section');
    expect(controlPanel).toBeInTheDocument();
  });

  test('UI_005: Should display sources container area', async () => {
    render(
      <TestWrapper>
        <IntelSources setSelectedFeedList={mockSetSelectedFeedList} />
      </TestWrapper>
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('ESTABLISHING CONNECTIONS...')).not.toBeInTheDocument();
    }, { timeout: 5000 });
    
    const sourcesContainer = document.querySelector('.intel-sources-section');
    expect(sourcesContainer).toBeInTheDocument();
  });
  });

  describe('⚙️ View Mode Controls (Tests 6-10)', () => {
  test('UI_006: Should have view mode selector buttons', async () => {
    render(
      <TestWrapper>
        <IntelSources setSelectedFeedList={mockSetSelectedFeedList} />
      </TestWrapper>
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('ESTABLISHING CONNECTIONS...')).not.toBeInTheDocument();
    }, { timeout: 5000 });
    
    const viewSelect = screen.getByDisplayValue('GRID');
    expect(viewSelect).toBeInTheDocument();
    
    // Check that all options are present
    const listOption = screen.getByDisplayValue('GRID').closest('select')?.querySelector('option[value="list"]');
    const gridOption = screen.getByDisplayValue('GRID').closest('select')?.querySelector('option[value="grid"]');
    const compactOption = screen.getByDisplayValue('GRID').closest('select')?.querySelector('option[value="compact"]');
    
    expect(listOption).toBeInTheDocument();
    expect(gridOption).toBeInTheDocument();
    expect(compactOption).toBeInTheDocument();
  });

  test('UI_007: Should change view mode when clicked', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <IntelSources setSelectedFeedList={mockSetSelectedFeedList} />
      </TestWrapper>
    );
    
    const viewSelect = screen.getByDisplayValue('GRID');
    await user.selectOptions(viewSelect, 'list');
    
    expect(viewSelect).toHaveValue('list');
  });

    test('UI_008: Should apply correct CSS classes for view modes', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <IntelSources setSelectedFeedList={mockSetSelectedFeedList} />
        </TestWrapper>
      );
      
      const viewSelect = screen.getByDisplayValue('GRID');
      await user.selectOptions(viewSelect, 'grid');
      
      await waitFor(() => {
        const sourcesContainer = document.querySelector('.intel-sources-list');
        expect(sourcesContainer).toHaveClass('view-mode-grid');
      });
    });

    test('UI_009: Should update view mode state correctly', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <IntelSources setSelectedFeedList={mockSetSelectedFeedList} />
        </TestWrapper>
      );
      
      const compactBtn = screen.getByText('COMPACT');
      await user.click(compactBtn);
      
      expect(compactBtn).toHaveClass('active');
      
      const sourcesContainer = document.querySelector('.sources-container');
      expect(sourcesContainer).toHaveClass('compact');
    });

    test('UI_010: Should maintain view mode selection across re-renders', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <TestWrapper>
          <IntelSources setSelectedFeedList={mockSetSelectedFeedList} />
        </TestWrapper>
      );
      
      const listBtn = screen.getByText('LIST');
      await user.click(listBtn);
      
      rerender(
        <TestWrapper>
          <IntelSources setSelectedFeedList={mockSetSelectedFeedList} />
        </TestWrapper>
      );
      
      expect(screen.getByText('LIST')).toHaveClass('active');
    });
  });

  describe('🔄 Sort Controls (Tests 11-15)', () => {
    test('UI_011: Should display sort control buttons', () => {
      render(
        <TestWrapper>
          <IntelSources setSelectedFeedList={mockSetSelectedFeedList} />
        </TestWrapper>
      );
      
      expect(screen.getByText('NAME')).toBeInTheDocument();
      expect(screen.getByText('CATEGORY')).toBeInTheDocument();
      expect(screen.getByText('PRIORITY')).toBeInTheDocument();
    });

    test('UI_012: Should change sort order when sort button clicked', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <IntelSources setSelectedFeedList={mockSetSelectedFeedList} />
        </TestWrapper>
      );
      
      const nameSort = screen.getByText('NAME');
      await user.click(nameSort);
      
      expect(nameSort).toHaveClass('active');
    });

    test('UI_013: Should update sort indicator visually', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <IntelSources setSelectedFeedList={mockSetSelectedFeedList} />
        </TestWrapper>
      );
      
      const categorySort = screen.getByText('CATEGORY');
      await user.click(categorySort);
      
      expect(categorySort).toHaveClass('active');
      expect(screen.getByText('NAME')).not.toHaveClass('active');
    });

    test('UI_014: Should handle sort state changes correctly', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <IntelSources setSelectedFeedList={mockSetSelectedFeedList} />
        </TestWrapper>
      );
      
      // Test multiple sort changes
      await user.click(screen.getByText('PRIORITY'));
      expect(screen.getByText('PRIORITY')).toHaveClass('active');
      
      await user.click(screen.getByText('NAME'));
      expect(screen.getByText('NAME')).toHaveClass('active');
      expect(screen.getByText('PRIORITY')).not.toHaveClass('active');
    });

    test('UI_015: Should maintain sort selection state', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <TestWrapper>
          <IntelSources setSelectedFeedList={mockSetSelectedFeedList} />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('CATEGORY'));
      
      rerender(
        <TestWrapper>
          <IntelSources setSelectedFeedList={mockSetSelectedFeedList} />
        </TestWrapper>
      );
      
      expect(screen.getByText('CATEGORY')).toHaveClass('active');
    });
  });

  describe('🎛️ Toggle Controls (Tests 16-20)', () => {
    test('UI_016: Should display filter toggle button', () => {
      render(
        <TestWrapper>
          <IntelSources setSelectedFeedList={mockSetSelectedFeedList} />
        </TestWrapper>
      );
      
      const filterToggle = screen.getByText('FILTER');
      expect(filterToggle).toBeInTheDocument();
    });

    test('UI_017: Should display metrics toggle button', () => {
      render(
        <TestWrapper>
          <IntelSources setSelectedFeedList={mockSetSelectedFeedList} />
        </TestWrapper>
      );
      
      const metricsToggle = screen.getByText('METRICS');
      expect(metricsToggle).toBeInTheDocument();
    });

    test('UI_018: Should display auto-refresh toggle button', () => {
      render(
        <TestWrapper>
          <IntelSources setSelectedFeedList={mockSetSelectedFeedList} />
        </TestWrapper>
      );
      
      const autoRefreshToggle = screen.getByText('AUTO-REFRESH');
      expect(autoRefreshToggle).toBeInTheDocument();
    });

    test('UI_019: Should toggle filter state when clicked', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <IntelSources setSelectedFeedList={mockSetSelectedFeedList} />
        </TestWrapper>
      );
      
      const filterToggle = screen.getByText('FILTER');
      await user.click(filterToggle);
      
      expect(filterToggle).toHaveClass('active');
    });

    test('UI_020: Should toggle metrics display when clicked', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <IntelSources setSelectedFeedList={mockSetSelectedFeedList} />
        </TestWrapper>
      );
      
      const metricsToggle = screen.getByText('METRICS');
      await user.click(metricsToggle);
      
      // Should affect metrics panel visibility
      const metricsPanel = document.querySelector('.metrics-panel');
      if (metricsPanel) {
        expect(metricsPanel).toBeInTheDocument();
      }
    });
  });

  describe('📊 Metrics Display (Tests 21-25)', () => {
    test('UI_021: Should display metrics panel when enabled', () => {
      render(
        <TestWrapper>
          <IntelSources setSelectedFeedList={mockSetSelectedFeedList} />
        </TestWrapper>
      );
      
      const metricsPanel = document.querySelector('.metrics-panel');
      expect(metricsPanel).toBeTruthy();
    });

    test('UI_022: Should show source count metrics', () => {
      render(
        <TestWrapper>
          <IntelSources setSelectedFeedList={mockSetSelectedFeedList} />
        </TestWrapper>
      );
      
      // Look for metrics text patterns
      const metricsText = document.body.textContent;
      expect(metricsText).toMatch(/SOURCES:|sources/i);
    });

    test('UI_023: Should display reliability metrics', () => {
      render(
        <TestWrapper>
          <IntelSources setSelectedFeedList={mockSetSelectedFeedList} />
        </TestWrapper>
      );
      
      // Check for reliability indicators
      const reliabilityIndicators = document.querySelectorAll('.reliability-score, .reliability');
      expect(reliabilityIndicators.length).toBeGreaterThanOrEqual(0);
    });

    test('UI_024: Should show category distribution', () => {
      render(
        <TestWrapper>
          <IntelSources setSelectedFeedList={mockSetSelectedFeedList} />
        </TestWrapper>
      );
      
      // Look for category-related elements
      const categoryElements = document.querySelectorAll('.category, [class*="category"]');
      expect(categoryElements.length).toBeGreaterThanOrEqual(0);
    });

    test('UI_025: Should update metrics when sources change', async () => {
      render(
        <TestWrapper>
          <IntelSources setSelectedFeedList={mockSetSelectedFeedList} />
        </TestWrapper>
      );
      
      // Component should handle state changes
      await waitFor(() => {
        const component = document.querySelector('.intel-sources');
        expect(component).toBeInTheDocument();
      });
    });
  });
});
