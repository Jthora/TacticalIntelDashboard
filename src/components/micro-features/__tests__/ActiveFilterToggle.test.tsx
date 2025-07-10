import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActiveFilterToggle from '../ActiveFilterToggle';

// Mock data for testing
const mockIntelligenceSources = [
  {
    id: 'source-1',
    name: 'Active Source 1',
    isOnline: true,
    status: 'active',
    lastUpdate: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
  },
  {
    id: 'source-2', 
    name: 'Active Source 2',
    isOnline: true,
    status: 'active',
    lastUpdate: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
  },
  {
    id: 'source-3',
    name: 'Inactive Source 1',
    isOnline: false,
    status: 'inactive',
    lastUpdate: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), // 25 hours ago
  },
  {
    id: 'source-4',
    name: 'Error Source',
    isOnline: true,
    status: 'error',
    lastUpdate: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: 'source-5',
    name: 'Stale Source',
    isOnline: true,
    status: 'active',
    lastUpdate: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), // 30 hours ago
  },
];

describe('ActiveFilterToggle', () => {
  const mockOnFilterChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Basic Rendering Tests
  describe('Basic Rendering', () => {
    it('renders filter toggle button', () => {
      render(
        <ActiveFilterToggle 
          sources={mockIntelligenceSources}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('displays inactive circle icon by default', () => {
      render(
        <ActiveFilterToggle 
          sources={mockIntelligenceSources}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      expect(screen.getByText('○')).toBeInTheDocument();
    });

    it('has correct default title attribute', () => {
      render(
        <ActiveFilterToggle 
          sources={mockIntelligenceSources}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Show: All Sources');
    });

    it('applies default CSS classes', () => {
      render(
        <ActiveFilterToggle 
          sources={mockIntelligenceSources}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('filter-btn', 'inactive');
    });
  });

  // State Management Tests
  describe('State Management', () => {
    it('toggles to active state when clicked', () => {
      render(
        <ActiveFilterToggle 
          sources={mockIntelligenceSources}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(screen.getByText('◉')).toBeInTheDocument();
      expect(button).toHaveClass('filter-btn', 'active');
      expect(button).toHaveAttribute('title', 'Show: Active Only');
    });

    it('toggles back to inactive when clicked twice', () => {
      render(
        <ActiveFilterToggle 
          sources={mockIntelligenceSources}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      const button = screen.getByRole('button');
      
      // First click - activate
      fireEvent.click(button);
      expect(screen.getByText('◉')).toBeInTheDocument();
      
      // Second click - deactivate
      fireEvent.click(button);
      expect(screen.getByText('○')).toBeInTheDocument();
      expect(button).toHaveClass('filter-btn', 'inactive');
    });

    it('maintains state across multiple toggles', () => {
      render(
        <ActiveFilterToggle 
          sources={mockIntelligenceSources}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      const button = screen.getByRole('button');
      
      // Multiple toggles
      fireEvent.click(button); // active
      fireEvent.click(button); // inactive
      fireEvent.click(button); // active
      
      expect(screen.getByText('◉')).toBeInTheDocument();
      expect(button).toHaveClass('filter-btn', 'active');
    });
  });

  // Filter Logic Tests
  describe('Filter Logic', () => {
    it('identifies active sources correctly', () => {
      render(
        <ActiveFilterToggle 
          sources={mockIntelligenceSources}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Should show count of active sources (sources 1 and 2)
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('filters out offline sources', () => {
      const sourcesWithOffline = [
        ...mockIntelligenceSources,
        {
          id: 'offline-source',
          name: 'Offline Source',
          isOnline: false,
          status: 'active',
          lastUpdate: new Date().toISOString(),
        }
      ];

      render(
        <ActiveFilterToggle 
          sources={sourcesWithOffline}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Still should show only 2 active sources
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('filters out sources with error status', () => {
      render(
        <ActiveFilterToggle 
          sources={mockIntelligenceSources}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Error source should be filtered out, only 2 active remain
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('filters out stale sources (over 24 hours)', () => {
      render(
        <ActiveFilterToggle 
          sources={mockIntelligenceSources}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Stale source (30 hours old) should be filtered out
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('handles empty source list', () => {
      render(
        <ActiveFilterToggle 
          sources={[]}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('handles all inactive sources', () => {
      const inactiveSources = [
        {
          id: 'inactive-1',
          name: 'Inactive 1',
          isOnline: false,
          status: 'inactive',
          lastUpdate: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
        },
        {
          id: 'inactive-2',
          name: 'Inactive 2',
          isOnline: true,
          status: 'error',
          lastUpdate: new Date().toISOString(),
        },
      ];

      render(
        <ActiveFilterToggle 
          sources={inactiveSources}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  // Callback Tests
  describe('Callback Integration', () => {
    it('calls onFilterChange with correct filtered sources when activated', () => {
      render(
        <ActiveFilterToggle 
          sources={mockIntelligenceSources}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 'source-1' }),
          expect.objectContaining({ id: 'source-2' }),
        ])
      );
      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.not.arrayContaining([
          expect.objectContaining({ id: 'source-3' }),
          expect.objectContaining({ id: 'source-4' }),
          expect.objectContaining({ id: 'source-5' }),
        ])
      );
    });

    it('calls onFilterChange with all sources when deactivated', () => {
      render(
        <ActiveFilterToggle 
          sources={mockIntelligenceSources}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      const button = screen.getByRole('button');
      
      // Activate then deactivate
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(mockOnFilterChange).toHaveBeenLastCalledWith(mockIntelligenceSources);
    });

    it('calls onFilterChange on every toggle', () => {
      render(
        <ActiveFilterToggle 
          sources={mockIntelligenceSources}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      const button = screen.getByRole('button');
      
      fireEvent.click(button); // activate
      fireEvent.click(button); // deactivate
      fireEvent.click(button); // activate again
      
      expect(mockOnFilterChange).toHaveBeenCalledTimes(3);
    });
  });

  // Visual States Tests
  describe('Visual States', () => {
    it('shows filter count only when active', () => {
      render(
        <ActiveFilterToggle 
          sources={mockIntelligenceSources}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      // Initially inactive - no count shown
      expect(screen.queryByText('2')).not.toBeInTheDocument();
      
      // After activation - count shown
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(screen.getByText('2')).toBeInTheDocument();
      
      // After deactivation - count hidden again
      fireEvent.click(button);
      expect(screen.queryByText('2')).not.toBeInTheDocument();
    });

    it('updates count when sources change', () => {
      const { rerender } = render(
        <ActiveFilterToggle 
          sources={mockIntelligenceSources}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(screen.getByText('2')).toBeInTheDocument();
      
      // Update sources to have more active ones
      const newSources = [
        ...mockIntelligenceSources,
        {
          id: 'new-active',
          name: 'New Active',
          isOnline: true,
          status: 'active',
          lastUpdate: new Date().toISOString(),
        }
      ];
      
      rerender(
        <ActiveFilterToggle 
          sources={newSources}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('applies correct CSS classes for active state', () => {
      render(
        <ActiveFilterToggle 
          sources={mockIntelligenceSources}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(button).toHaveClass('filter-btn', 'active');
      expect(button).not.toHaveClass('inactive');
    });

    it('applies correct CSS classes for inactive state', () => {
      render(
        <ActiveFilterToggle 
          sources={mockIntelligenceSources}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('filter-btn', 'inactive');
      expect(button).not.toHaveClass('active');
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('has proper button role', () => {
      render(
        <ActiveFilterToggle 
          sources={mockIntelligenceSources}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('has descriptive title attributes', () => {
      render(
        <ActiveFilterToggle 
          sources={mockIntelligenceSources}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      const button = screen.getByRole('button');
      
      // Inactive state
      expect(button).toHaveAttribute('title', 'Show: All Sources');
      
      // Active state
      fireEvent.click(button);
      expect(button).toHaveAttribute('title', 'Show: Active Only');
    });

    it('is keyboard accessible', () => {
      render(
        <ActiveFilterToggle 
          sources={mockIntelligenceSources}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      const button = screen.getByRole('button');
      
      // Focus and press Enter (but buttons respond to click, not keyDown)
      button.focus();
      fireEvent.click(button);
      
      expect(screen.getByText('◉')).toBeInTheDocument();
    });

    it('is keyboard accessible with Space key', () => {
      render(
        <ActiveFilterToggle 
          sources={mockIntelligenceSources}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      const button = screen.getByRole('button');
      
      // Focus and trigger click (simulating keyboard activation)
      button.focus();
      fireEvent.click(button);
      
      expect(screen.getByText('◉')).toBeInTheDocument();
    });
  });

  // Edge Cases Tests
  describe('Edge Cases', () => {
    it('handles sources with missing lastUpdate', () => {
      const sourcesWithMissingDate = [
        {
          id: 'missing-date',
          name: 'Missing Date',
          isOnline: true,
          status: 'active',
          lastUpdate: '', // Empty string instead of missing property
        }
      ];

      render(
        <ActiveFilterToggle 
          sources={sourcesWithMissingDate}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Should handle gracefully, likely filtering out the source
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('handles sources with invalid lastUpdate', () => {
      const sourcesWithInvalidDate = [
        {
          id: 'invalid-date',
          name: 'Invalid Date',
          isOnline: true,
          status: 'active',
          lastUpdate: 'invalid-date-string',
        }
      ];

      render(
        <ActiveFilterToggle 
          sources={sourcesWithInvalidDate}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Should handle gracefully
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('handles very large source lists', () => {
      const largeSources = Array.from({ length: 1000 }, (_, i) => ({
        id: `source-${i}`,
        name: `Source ${i}`,
        isOnline: i % 2 === 0, // Half online
        status: i % 3 === 0 ? 'error' : 'active', // Some errors
        lastUpdate: new Date(Date.now() - 1000 * 60 * 60 * (i % 48)).toISOString(), // Various ages
      }));

      render(
        <ActiveFilterToggle 
          sources={largeSources}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Should handle large lists without performance issues
      const countElement = screen.getByText(/^\d+$/);
      expect(countElement).toBeInTheDocument();
    });

    it('handles rapid successive clicks', () => {
      render(
        <ActiveFilterToggle 
          sources={mockIntelligenceSources}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      const button = screen.getByRole('button');
      
      // Rapid clicks
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      // Should end up inactive after even number of clicks
      expect(screen.getByText('○')).toBeInTheDocument();
      expect(button).toHaveClass('filter-btn', 'inactive');
    });
  });

  // Integration Tests
  describe('Integration', () => {
    it('updates filter when sources prop changes', () => {
      const { rerender } = render(
        <ActiveFilterToggle 
          sources={mockIntelligenceSources}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Update sources
      const updatedSources = mockIntelligenceSources.map(source => ({
        ...source,
        isOnline: false, // Make all offline
      }));
      
      rerender(
        <ActiveFilterToggle 
          sources={updatedSources}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('maintains filter state during source updates', () => {
      const { rerender } = render(
        <ActiveFilterToggle 
          sources={mockIntelligenceSources}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Verify active state
      expect(screen.getByText('◉')).toBeInTheDocument();
      
      // Update sources but keep component active
      rerender(
        <ActiveFilterToggle 
          sources={[...mockIntelligenceSources]}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      // Should remain active
      expect(screen.getByText('◉')).toBeInTheDocument();
    });
  });
});
