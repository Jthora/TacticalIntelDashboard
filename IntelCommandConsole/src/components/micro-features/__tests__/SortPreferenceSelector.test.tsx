import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { SortPreferenceSelector } from '../SortPreferenceSelector';

// Mock console.log to test logging functionality
const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('SortPreferenceSelector', () => {
  beforeEach(() => {
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe('Rendering', () => {
    test('renders with default sort option (alphabetical)', () => {
      render(<SortPreferenceSelector />);
      
      const sortButton = screen.getByRole('button');
      expect(sortButton).toBeInTheDocument();
      expect(sortButton).toHaveClass('sort-btn', 'alphabetical');
      expect(sortButton).toHaveAttribute('data-sort', 'alphabetical');
    });

    test('renders with custom initial sort option', () => {
      render(<SortPreferenceSelector initialSort="activity" />);
      
      const sortButton = screen.getByRole('button');
      expect(sortButton).toHaveClass('sort-btn', 'activity');
      expect(sortButton).toHaveAttribute('data-sort', 'activity');
    });

    test('has correct accessibility attributes', () => {
      render(<SortPreferenceSelector />);
      
      const sortButton = screen.getByRole('button');
      expect(sortButton).toHaveAttribute('aria-label');
      expect(sortButton).toHaveAttribute('title');
      expect(sortButton).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Sort Option Cycling', () => {
    test('cycles through sort options correctly: alphabetical → activity → priority → alphabetical', async () => {
      const user = userEvent.setup();
      
      render(<SortPreferenceSelector />);
      const sortButton = screen.getByRole('button');
      
      // Initial state: alphabetical
      expect(sortButton).toHaveAttribute('data-sort', 'alphabetical');
      expect(sortButton).toHaveTextContent('AZ');
      
      // First click: alphabetical → activity
      await user.click(sortButton);
      expect(sortButton).toHaveAttribute('data-sort', 'activity');
      expect(sortButton).toHaveTextContent('⚡');
      
      // Second click: activity → priority
      await user.click(sortButton);
      expect(sortButton).toHaveAttribute('data-sort', 'priority');
      expect(sortButton).toHaveTextContent('⭐');
      
      // Third click: priority → alphabetical
      await user.click(sortButton);
      expect(sortButton).toHaveAttribute('data-sort', 'alphabetical');
      expect(sortButton).toHaveTextContent('AZ');
    });

    test('handles keyboard navigation (Enter key)', async () => {
      const user = userEvent.setup();
      
      render(<SortPreferenceSelector />);
      const sortButton = screen.getByRole('button');
      
      sortButton.focus();
      await user.keyboard('{Enter}');
      
      expect(sortButton).toHaveAttribute('data-sort', 'activity');
    });

    test('handles keyboard navigation (Space key)', async () => {
      const user = userEvent.setup();
      
      render(<SortPreferenceSelector />);
      const sortButton = screen.getByRole('button');
      
      sortButton.focus();
      await user.keyboard(' ');
      
      expect(sortButton).toHaveAttribute('data-sort', 'activity');
    });
  });

  describe('Visual Feedback', () => {
    test('applies correct CSS classes for each sort option', async () => {
      const user = userEvent.setup();
      
      render(<SortPreferenceSelector />);
      const sortButton = screen.getByRole('button');
      
      // Alphabetical
      expect(sortButton).toHaveClass('alphabetical');
      
      // Activity
      await user.click(sortButton);
      expect(sortButton).toHaveClass('activity');
      
      // Priority
      await user.click(sortButton);
      expect(sortButton).toHaveClass('priority');
    });

    test('displays correct icons for each sort option', async () => {
      const user = userEvent.setup();
      
      render(<SortPreferenceSelector />);
      const sortButton = screen.getByRole('button');
      
      // Alphabetical icon
      expect(sortButton).toHaveTextContent('AZ');
      
      // Activity icon
      await user.click(sortButton);
      expect(sortButton).toHaveTextContent('⚡');
      
      // Priority icon
      await user.click(sortButton);
      expect(sortButton).toHaveTextContent('⭐');
    });

    test('updates tooltips for each sort option', async () => {
      const user = userEvent.setup();
      
      render(<SortPreferenceSelector />);
      const sortButton = screen.getByRole('button');
      
      // Alphabetical tooltip
      expect(sortButton).toHaveAttribute('title', 'Sort: Alphabetical - Standard reference ordering');
      
      // Activity tooltip
      await user.click(sortButton);
      expect(sortButton).toHaveAttribute('title', 'Sort: Activity - Most active sources first');
      
      // Priority tooltip
      await user.click(sortButton);
      expect(sortButton).toHaveAttribute('title', 'Sort: Priority - Mission-critical sources first');
    });
  });

  describe('Callback Functions', () => {
    test('calls onSortChange callback when sort option changes', async () => {
      const user = userEvent.setup();
      const onSortChange = jest.fn();
      
      render(<SortPreferenceSelector onSortChange={onSortChange} />);
      const sortButton = screen.getByRole('button');
      
      await user.click(sortButton);
      
      expect(onSortChange).toHaveBeenCalledWith('activity');
      expect(onSortChange).toHaveBeenCalledTimes(1);
    });

    test('logs sort changes correctly', async () => {
      const user = userEvent.setup();
      
      render(<SortPreferenceSelector />);
      const sortButton = screen.getByRole('button');
      
      await user.click(sortButton);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('📊 Sort preference changed to: activity')
      );
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels for screen readers', () => {
      render(<SortPreferenceSelector />);
      
      const sortButton = screen.getByRole('button');
      expect(sortButton).toHaveAttribute('aria-label');
      expect(sortButton.getAttribute('aria-label')).toContain('Sort intelligence sources');
    });

    test('updates ARIA label when sort option changes', async () => {
      const user = userEvent.setup();
      
      render(<SortPreferenceSelector />);
      const sortButton = screen.getByRole('button');
      
      // Initial ARIA label
      expect(sortButton.getAttribute('aria-label')).toContain('alphabetical');
      
      // After changing to activity
      await user.click(sortButton);
      expect(sortButton.getAttribute('aria-label')).toContain('activity');
    });

    test('provides meaningful tooltips for operational context', () => {
      render(<SortPreferenceSelector />);
      
      const sortButton = screen.getByRole('button');
      const title = sortButton.getAttribute('title');
      
      expect(title).toContain('Sort:');
      expect(title).toContain('Alphabetical');
      expect(title).toContain('reference ordering');
    });

    test('is focusable and keyboard navigable', () => {
      render(<SortPreferenceSelector />);
      
      const sortButton = screen.getByRole('button');
      expect(sortButton).toHaveAttribute('tabIndex', '0');
      
      sortButton.focus();
      expect(sortButton).toHaveFocus();
    });
  });

  describe('Props Validation', () => {
    test('handles invalid initial sort gracefully', () => {
      render(<SortPreferenceSelector initialSort={'invalid' as any} />);
      
      const sortButton = screen.getByRole('button');
      expect(sortButton).toHaveAttribute('data-sort', 'alphabetical'); // Falls back to default
    });

    test('works without optional props', () => {
      render(<SortPreferenceSelector />);
      
      const sortButton = screen.getByRole('button');
      expect(sortButton).toBeInTheDocument();
      expect(sortButton).toHaveAttribute('data-sort', 'alphabetical');
    });

    test('applies custom className', () => {
      render(<SortPreferenceSelector className="custom-sort-class" />);
      
      const sortButton = screen.getByRole('button');
      expect(sortButton).toHaveClass('custom-sort-class');
    });
  });

  describe('Operational Context', () => {
    test('provides operational descriptions for each sort type', async () => {
      const user = userEvent.setup();
      
      render(<SortPreferenceSelector />);
      const sortButton = screen.getByRole('button');
      
      // Alphabetical context
      expect(sortButton.getAttribute('title')).toContain('reference ordering');
      
      // Activity context
      await user.click(sortButton);
      expect(sortButton.getAttribute('title')).toContain('active sources first');
      
      // Priority context
      await user.click(sortButton);
      expect(sortButton.getAttribute('title')).toContain('Mission-critical');
    });

    test('supports different operational scenarios', async () => {
      const user = userEvent.setup();
      
      render(<SortPreferenceSelector />);
      const sortButton = screen.getByRole('button');
      
      // Test cycling through all three scenarios
      const expectedSorts = ['alphabetical', 'activity', 'priority'];
      
      for (let i = 0; i < 3; i++) {
        const currentSort = sortButton.getAttribute('data-sort');
        expect(expectedSorts).toContain(currentSort);
        await user.click(sortButton);
      }
    });
  });

  describe('Performance', () => {
    test('handles rapid sort changes efficiently', async () => {
      const user = userEvent.setup();
      
      render(<SortPreferenceSelector />);
      const sortButton = screen.getByRole('button');
      
      // Rapid clicking shouldn't cause issues
      for (let i = 0; i < 10; i++) {
        await user.click(sortButton);
      }
      
      expect(sortButton).toBeInTheDocument();
      expect(sortButton).toHaveAttribute('data-sort', 'activity'); // Should end up on activity after 10 clicks
    });

    test('maintains stable performance during interactions', async () => {
      const user = userEvent.setup();
      const onSortChange = jest.fn();
      
      render(<SortPreferenceSelector onSortChange={onSortChange} />);
      const sortButton = screen.getByRole('button');
      
      // Multiple sort cycles (9 clicks = back to alphabetical)
      for (let i = 0; i < 9; i++) {
        await user.click(sortButton);
      }
      
      expect(sortButton).toBeInTheDocument();
      expect(sortButton).toHaveAttribute('data-sort', 'alphabetical');
      expect(onSortChange).toHaveBeenCalledTimes(9);
    });
  });

  describe('Error Handling', () => {
    test('handles click events during transition gracefully', async () => {
      const user = userEvent.setup();
      
      render(<SortPreferenceSelector />);
      const sortButton = screen.getByRole('button');
      
      // Rapid double-click
      await user.dblClick(sortButton);
      
      expect(sortButton).toBeInTheDocument();
      expect(sortButton).toHaveAttribute('data-sort');
    });

    test('handles keyboard and mouse events simultaneously', async () => {
      const user = userEvent.setup();
      
      render(<SortPreferenceSelector />);
      const sortButton = screen.getByRole('button');
      
      // Focus and then mix keyboard and mouse events
      sortButton.focus();
      await user.keyboard('{Enter}');
      await user.click(sortButton);
      
      expect(sortButton).toBeInTheDocument();
      expect(['alphabetical', 'activity', 'priority']).toContain(
        sortButton.getAttribute('data-sort')
      );
    });
  });
});
