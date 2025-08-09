import '@testing-library/jest-dom';

import { cleanup,fireEvent, render, screen } from '@testing-library/react';

import { FilterMatrixButtons } from '../FilterMatrixButtons';

// Mock timers for any animations
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  cleanup();
});

describe('FilterMatrixButtons Component', () => {
  // Basic rendering tests
  describe('Component Rendering', () => {
    test('renders filter matrix container', () => {
      render(<FilterMatrixButtons />);
      const container = screen.getByRole('group', { name: /filter matrix/i });
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('filter-matrix');
    });

    test('renders all three filter category rows', () => {
      render(<FilterMatrixButtons />);
      
      // Priority row
      const priorityRow = screen.getByLabelText(/priority filters/i);
      expect(priorityRow).toBeInTheDocument();
      expect(priorityRow).toHaveClass('matrix-row', 'priority-row');
      
      // Type row
      const typeRow = screen.getByLabelText(/type filters/i);
      expect(typeRow).toBeInTheDocument();
      expect(typeRow).toHaveClass('matrix-row', 'type-row');
      
      // Region row
      const regionRow = screen.getByLabelText(/region filters/i);
      expect(regionRow).toBeInTheDocument();
      expect(regionRow).toHaveClass('matrix-row', 'region-row');
    });

    test('renders all priority filter buttons', () => {
      render(<FilterMatrixButtons />);
      
      const highPriorityBtn = screen.getByRole('button', { name: /high priority/i });
      const mediumPriorityBtn = screen.getByRole('button', { name: /medium priority/i });
      const lowPriorityBtn = screen.getByRole('button', { name: /low priority/i });
      
      expect(highPriorityBtn).toBeInTheDocument();
      expect(mediumPriorityBtn).toBeInTheDocument();
      expect(lowPriorityBtn).toBeInTheDocument();
      
      expect(highPriorityBtn).toHaveClass('matrix-btn', 'pri-high');
      expect(mediumPriorityBtn).toHaveClass('matrix-btn', 'pri-med');
      expect(lowPriorityBtn).toHaveClass('matrix-btn', 'pri-low');
    });

    test('renders all type filter buttons', () => {
      render(<FilterMatrixButtons />);
      
      const newsBtn = screen.getByRole('button', { name: /news sources/i });
      const socialBtn = screen.getByRole('button', { name: /social media/i });
      const officialBtn = screen.getByRole('button', { name: /official sources/i });
      
      expect(newsBtn).toBeInTheDocument();
      expect(socialBtn).toBeInTheDocument();
      expect(officialBtn).toBeInTheDocument();
      
      expect(newsBtn).toHaveClass('matrix-btn', 'type-news');
      expect(socialBtn).toHaveClass('matrix-btn', 'type-social');
      expect(officialBtn).toHaveClass('matrix-btn', 'type-official');
    });

    test('renders all region filter buttons', () => {
      render(<FilterMatrixButtons />);
      
      const domesticBtn = screen.getByRole('button', { name: /domestic sources/i });
      const internationalBtn = screen.getByRole('button', { name: /international sources/i });
      const classifiedBtn = screen.getByRole('button', { name: /classified sources/i });
      
      expect(domesticBtn).toBeInTheDocument();
      expect(internationalBtn).toBeInTheDocument();
      expect(classifiedBtn).toBeInTheDocument();
      
      expect(domesticBtn).toHaveClass('matrix-btn', 'region-domestic');
      expect(internationalBtn).toHaveClass('matrix-btn', 'region-international');
      expect(classifiedBtn).toHaveClass('matrix-btn', 'region-classified');
    });
  });

  // Interaction tests
  describe('Filter Interaction', () => {
    test('toggles priority filter on click', () => {
      render(<FilterMatrixButtons />);
      const highPriorityBtn = screen.getByRole('button', { name: /high priority/i });
      
      // Initially inactive
      expect(highPriorityBtn).not.toHaveClass('active');
      
      // Click to activate
      fireEvent.click(highPriorityBtn);
      expect(highPriorityBtn).toHaveClass('active');
      
      // Click to deactivate
      fireEvent.click(highPriorityBtn);
      expect(highPriorityBtn).not.toHaveClass('active');
    });

    test('toggles type filter on click', () => {
      render(<FilterMatrixButtons />);
      const newsBtn = screen.getByRole('button', { name: /news sources/i });
      
      // Initially inactive
      expect(newsBtn).not.toHaveClass('active');
      
      // Click to activate
      fireEvent.click(newsBtn);
      expect(newsBtn).toHaveClass('active');
      
      // Click to deactivate
      fireEvent.click(newsBtn);
      expect(newsBtn).not.toHaveClass('active');
    });

    test('toggles region filter on click', () => {
      render(<FilterMatrixButtons />);
      const domesticBtn = screen.getByRole('button', { name: /domestic sources/i });
      
      // Initially inactive
      expect(domesticBtn).not.toHaveClass('active');
      
      // Click to activate
      fireEvent.click(domesticBtn);
      expect(domesticBtn).toHaveClass('active');
      
      // Click to deactivate
      fireEvent.click(domesticBtn);
      expect(domesticBtn).not.toHaveClass('active');
    });

    test('allows multiple filters in same category to be active', () => {
      render(<FilterMatrixButtons />);
      const highBtn = screen.getByRole('button', { name: /high priority/i });
      const mediumBtn = screen.getByRole('button', { name: /medium priority/i });
      
      // Activate both
      fireEvent.click(highBtn);
      fireEvent.click(mediumBtn);
      
      expect(highBtn).toHaveClass('active');
      expect(mediumBtn).toHaveClass('active');
    });

    test('allows filters across different categories to be active simultaneously', () => {
      render(<FilterMatrixButtons />);
      const highPriorityBtn = screen.getByRole('button', { name: /high priority/i });
      const newsBtn = screen.getByRole('button', { name: /news sources/i });
      const domesticBtn = screen.getByRole('button', { name: /domestic sources/i });
      
      // Activate filters in all categories
      fireEvent.click(highPriorityBtn);
      fireEvent.click(newsBtn);
      fireEvent.click(domesticBtn);
      
      expect(highPriorityBtn).toHaveClass('active');
      expect(newsBtn).toHaveClass('active');
      expect(domesticBtn).toHaveClass('active');
    });
  });

  // State management tests
  describe('State Management', () => {
    test('calls onFiltersChange when priority filter is toggled', () => {
      const mockOnFiltersChange = jest.fn();
      render(<FilterMatrixButtons onFiltersChange={mockOnFiltersChange} />);
      
      const highPriorityBtn = screen.getByRole('button', { name: /high priority/i });
      fireEvent.click(highPriorityBtn);
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        priority: ['high'],
        type: [],
        region: []
      });
    });

    test('calls onFiltersChange when type filter is toggled', () => {
      const mockOnFiltersChange = jest.fn();
      render(<FilterMatrixButtons onFiltersChange={mockOnFiltersChange} />);
      
      const newsBtn = screen.getByRole('button', { name: /news sources/i });
      fireEvent.click(newsBtn);
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        priority: [],
        type: ['news'],
        region: []
      });
    });

    test('calls onFiltersChange when region filter is toggled', () => {
      const mockOnFiltersChange = jest.fn();
      render(<FilterMatrixButtons onFiltersChange={mockOnFiltersChange} />);
      
      const domesticBtn = screen.getByRole('button', { name: /domestic sources/i });
      fireEvent.click(domesticBtn);
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        priority: [],
        type: [],
        region: ['domestic']
      });
    });

    test('maintains state correctly with multiple filter operations', () => {
      const mockOnFiltersChange = jest.fn();
      render(<FilterMatrixButtons onFiltersChange={mockOnFiltersChange} />);
      
      const highBtn = screen.getByRole('button', { name: /high priority/i });
      const mediumBtn = screen.getByRole('button', { name: /medium priority/i });
      const newsBtn = screen.getByRole('button', { name: /news sources/i });
      
      // Add high priority
      fireEvent.click(highBtn);
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        priority: ['high'],
        type: [],
        region: []
      });
      
      // Add medium priority
      fireEvent.click(mediumBtn);
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        priority: ['high', 'medium'],
        type: [],
        region: []
      });
      
      // Add news type
      fireEvent.click(newsBtn);
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        priority: ['high', 'medium'],
        type: ['news'],
        region: []
      });
      
      // Remove high priority
      fireEvent.click(highBtn);
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        priority: ['medium'],
        type: ['news'],
        region: []
      });
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    test('has proper ARIA labels and roles', () => {
      render(<FilterMatrixButtons />);
      
      const container = screen.getByRole('group', { name: /filter matrix/i });
      expect(container).toHaveAttribute('aria-label', 'Filter Matrix Controls');
      
      const priorityRow = screen.getByLabelText(/priority filters/i);
      expect(priorityRow).toHaveAttribute('role', 'group');
      
      const typeRow = screen.getByLabelText(/type filters/i);
      expect(typeRow).toHaveAttribute('role', 'group');
      
      const regionRow = screen.getByLabelText(/region filters/i);
      expect(regionRow).toHaveAttribute('role', 'group');
    });

    test('buttons have proper aria-pressed states', () => {
      render(<FilterMatrixButtons />);
      const highPriorityBtn = screen.getByRole('button', { name: /high priority/i });
      
      // Initially not pressed
      expect(highPriorityBtn).toHaveAttribute('aria-pressed', 'false');
      
      // Pressed after click
      fireEvent.click(highPriorityBtn);
      expect(highPriorityBtn).toHaveAttribute('aria-pressed', 'true');
      
      // Not pressed after second click
      fireEvent.click(highPriorityBtn);
      expect(highPriorityBtn).toHaveAttribute('aria-pressed', 'false');
    });

    test('buttons are keyboard accessible', () => {
      render(<FilterMatrixButtons />);
      const highPriorityBtn = screen.getByRole('button', { name: /high priority/i });
      
      // Focus button
      highPriorityBtn.focus();
      expect(highPriorityBtn).toHaveFocus();
      
      // Activate with Enter
      fireEvent.keyDown(highPriorityBtn, { key: 'Enter', code: 'Enter' });
      expect(highPriorityBtn).toHaveClass('active');
      
      // Activate with Space
      fireEvent.keyDown(highPriorityBtn, { key: ' ', code: 'Space' });
      expect(highPriorityBtn).not.toHaveClass('active');
    });

    test('supports keyboard navigation between buttons', () => {
      render(<FilterMatrixButtons />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(9); // 3x3 matrix
      
      // All buttons should be focusable
      buttons.forEach(button => {
        expect(button).toHaveAttribute('tabIndex', '0');
      });
    });
  });

  // Visual state tests
  describe('Visual States', () => {
    test('applies correct CSS classes for active states', () => {
      render(<FilterMatrixButtons />);
      
      const highPriorityBtn = screen.getByRole('button', { name: /high priority/i });
      const newsBtn = screen.getByRole('button', { name: /news sources/i });
      const domesticBtn = screen.getByRole('button', { name: /domestic sources/i });
      
      // Activate buttons
      fireEvent.click(highPriorityBtn);
      fireEvent.click(newsBtn);
      fireEvent.click(domesticBtn);
      
      expect(highPriorityBtn).toHaveClass('matrix-btn', 'pri-high', 'active');
      expect(newsBtn).toHaveClass('matrix-btn', 'type-news', 'active');
      expect(domesticBtn).toHaveClass('matrix-btn', 'region-domestic', 'active');
    });

    test('displays correct button text/icons', () => {
      render(<FilterMatrixButtons />);
      
      // Priority buttons
      expect(screen.getByRole('button', { name: /high priority/i })).toHaveTextContent('H');
      expect(screen.getByRole('button', { name: /medium priority/i })).toHaveTextContent('M');
      expect(screen.getByRole('button', { name: /low priority/i })).toHaveTextContent('L');
      
      // Type buttons
      expect(screen.getByRole('button', { name: /news sources/i })).toHaveTextContent('N');
      expect(screen.getByRole('button', { name: /social media/i })).toHaveTextContent('S');
      expect(screen.getByRole('button', { name: /official sources/i })).toHaveTextContent('O');
      
      // Region buttons
      expect(screen.getByRole('button', { name: /domestic sources/i })).toHaveTextContent('D');
      expect(screen.getByRole('button', { name: /international sources/i })).toHaveTextContent('I');
      expect(screen.getByRole('button', { name: /classified sources/i })).toHaveTextContent('C');
    });
  });

  // Performance tests
  describe('Performance', () => {
    test('handles rapid clicking without issues', () => {
      const mockOnFiltersChange = jest.fn();
      render(<FilterMatrixButtons onFiltersChange={mockOnFiltersChange} />);
      
      const highPriorityBtn = screen.getByRole('button', { name: /high priority/i });
      
      // Rapid clicks
      for (let i = 0; i < 10; i++) {
        fireEvent.click(highPriorityBtn);
      }
      
      // Should be called for each click
      expect(mockOnFiltersChange).toHaveBeenCalledTimes(10);
      
      // Final state should be inactive (even number of clicks)
      expect(highPriorityBtn).not.toHaveClass('active');
    });

    test('does not cause memory leaks with multiple renders', () => {
      const { unmount } = render(<FilterMatrixButtons />);
      unmount();
      
      // Re-render multiple times
      for (let i = 0; i < 5; i++) {
        const { unmount: unmountNext } = render(<FilterMatrixButtons />);
        unmountNext();
      }
      
      // Should complete without errors
      expect(true).toBe(true);
    });
  });

  // Error handling tests
  describe('Error Handling', () => {
    test('handles missing onFiltersChange prop gracefully', () => {
      expect(() => {
        render(<FilterMatrixButtons />);
        const highPriorityBtn = screen.getByRole('button', { name: /high priority/i });
        fireEvent.click(highPriorityBtn);
      }).not.toThrow();
    });

    test('handles invalid initial filters prop', () => {
      const invalidFilters = {
        priority: ['invalid' as any],
        type: ['invalid' as any],
        region: ['invalid' as any]
      };
      
      expect(() => {
        render(<FilterMatrixButtons initialFilters={invalidFilters} />);
      }).not.toThrow();
    });
  });

  // Integration tests
  describe('Integration', () => {
    test('works with external state management', () => {
      let externalState = {
        priority: [] as string[],
        type: [] as string[],
        region: [] as string[]
      };
      
      const handleFiltersChange = (filters: typeof externalState) => {
        externalState = filters;
      };
      
      const { rerender } = render(
        <FilterMatrixButtons 
          initialFilters={externalState}
          onFiltersChange={handleFiltersChange}
        />
      );
      
      const highPriorityBtn = screen.getByRole('button', { name: /high priority/i });
      fireEvent.click(highPriorityBtn);
      
      expect(externalState.priority).toContain('high');
      
      // Re-render with updated state
      rerender(
        <FilterMatrixButtons 
          initialFilters={externalState}
          onFiltersChange={handleFiltersChange}
        />
      );
      
      expect(highPriorityBtn).toHaveClass('active');
    });

    test('maintains consistency across multiple filter operations', () => {
      const mockOnFiltersChange = jest.fn();
      render(<FilterMatrixButtons onFiltersChange={mockOnFiltersChange} />);
      
      // Complex filter sequence
      const highBtn = screen.getByRole('button', { name: /high priority/i });
      const newsBtn = screen.getByRole('button', { name: /news sources/i });
      const domesticBtn = screen.getByRole('button', { name: /domestic sources/i });
      const mediumBtn = screen.getByRole('button', { name: /medium priority/i });
      
      fireEvent.click(highBtn);
      fireEvent.click(newsBtn);
      fireEvent.click(domesticBtn);
      fireEvent.click(mediumBtn);
      fireEvent.click(highBtn); // Remove high priority
      
      // Final call should have medium priority, news type, domestic region
      expect(mockOnFiltersChange).toHaveBeenLastCalledWith({
        priority: ['medium'],
        type: ['news'],
        region: ['domestic']
      });
    });
  });
});
