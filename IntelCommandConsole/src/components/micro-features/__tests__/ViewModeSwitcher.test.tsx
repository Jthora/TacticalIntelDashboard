import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ViewModeSwitcher, ViewModeSwitcherProps } from '../ViewModeSwitcher';

// Mock console.log to test logging functionality
const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('ViewModeSwitcher', () => {
  beforeEach(() => {
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  const defaultProps: ViewModeSwitcherProps = {
    initialMode: 'list',
  };

  describe('Rendering', () => {
    test('renders with default view mode', () => {
      render(<ViewModeSwitcher {...defaultProps} />);
      
      const switcherElement = screen.getByRole('button');
      expect(switcherElement).toBeInTheDocument();
      expect(switcherElement).toHaveClass('view-btn', 'list');
    });

    test('renders with custom initial mode', () => {
      render(<ViewModeSwitcher initialMode="grid" />);
      
      const switcherElement = screen.getByRole('button');
      expect(switcherElement).toHaveAttribute('data-mode', 'grid');
      expect(switcherElement).toHaveClass('grid');
    });

    test('has correct accessibility attributes', () => {
      render(<ViewModeSwitcher {...defaultProps} />);
      
      const switcherElement = screen.getByRole('button');
      expect(switcherElement).toHaveAttribute('tabIndex', '0');
      expect(switcherElement).toHaveAttribute('aria-label');
      expect(switcherElement.getAttribute('title')).toContain('View:');
    });
  });

  describe('View Mode Cycling', () => {
    test('cycles through modes correctly: list → grid → compact → list', async () => {
      const user = userEvent.setup();
      
      render(<ViewModeSwitcher initialMode="list" />);
      
      const switcherElement = screen.getByRole('button');
      
      // Initially list mode
      expect(switcherElement).toHaveAttribute('data-mode', 'list');
      expect(switcherElement.textContent).toBe('☰');
      
      // Click to grid mode
      await user.click(switcherElement);
      expect(switcherElement).toHaveAttribute('data-mode', 'grid');
      expect(switcherElement.textContent).toBe('▦');
      
      // Click to compact mode
      await user.click(switcherElement);
      expect(switcherElement).toHaveAttribute('data-mode', 'compact');
      expect(switcherElement.textContent).toBe('≡');
      
      // Click back to list mode
      await user.click(switcherElement);
      expect(switcherElement).toHaveAttribute('data-mode', 'list');
      expect(switcherElement.textContent).toBe('☰');
    });

    test('handles keyboard navigation (Enter key)', async () => {
      const user = userEvent.setup();
      
      render(<ViewModeSwitcher initialMode="list" />);
      
      const switcherElement = screen.getByRole('button');
      switcherElement.focus();
      
      await user.keyboard('{Enter}');
      expect(switcherElement).toHaveAttribute('data-mode', 'grid');
    });

    test('handles keyboard navigation (Space key)', async () => {
      const user = userEvent.setup();
      
      render(<ViewModeSwitcher initialMode="list" />);
      
      const switcherElement = screen.getByRole('button');
      switcherElement.focus();
      
      await user.keyboard(' ');
      expect(switcherElement).toHaveAttribute('data-mode', 'grid');
    });
  });

  describe('Visual Feedback', () => {
    test('applies correct CSS classes for each mode', async () => {
      const user = userEvent.setup();
      
      render(<ViewModeSwitcher initialMode="list" />);
      
      const switcherElement = screen.getByRole('button');
      
      // List mode
      expect(switcherElement).toHaveClass('view-btn', 'list');
      
      // Grid mode
      await user.click(switcherElement);
      expect(switcherElement).toHaveClass('view-btn', 'grid');
      
      // Compact mode
      await user.click(switcherElement);
      expect(switcherElement).toHaveClass('view-btn', 'compact');
    });

    test('displays correct icons for each mode', async () => {
      const user = userEvent.setup();
      
      render(<ViewModeSwitcher initialMode="list" />);
      
      const switcherElement = screen.getByRole('button');
      const iconElement = switcherElement.querySelector('.view-icon');
      
      // List mode icon
      expect(iconElement).toHaveTextContent('☰');
      
      // Grid mode icon
      await user.click(switcherElement);
      expect(iconElement).toHaveTextContent('▦');
      
      // Compact mode icon
      await user.click(switcherElement);
      expect(iconElement).toHaveTextContent('≡');
    });

    test('updates tooltips for each mode', async () => {
      const user = userEvent.setup();
      
      render(<ViewModeSwitcher initialMode="list" />);
      
      const switcherElement = screen.getByRole('button');
      
      // List mode tooltip
      expect(switcherElement.getAttribute('title')).toContain('LIST');
      
      // Grid mode tooltip
      await user.click(switcherElement);
      expect(switcherElement.getAttribute('title')).toContain('GRID');
      
      // Compact mode tooltip
      await user.click(switcherElement);
      expect(switcherElement.getAttribute('title')).toContain('COMPACT');
    });
  });

  describe('Callback Functions', () => {
    test('calls onModeChange callback when mode changes', async () => {
      const mockCallback = jest.fn();
      const user = userEvent.setup();
      
      render(<ViewModeSwitcher initialMode="list" onModeChange={mockCallback} />);
      
      const switcherElement = screen.getByRole('button');
      
      await user.click(switcherElement);
      expect(mockCallback).toHaveBeenCalledWith('grid');
      
      await user.click(switcherElement);
      expect(mockCallback).toHaveBeenCalledWith('compact');
    });

    test('logs view mode changes correctly', async () => {
      const user = userEvent.setup();
      
      render(<ViewModeSwitcher initialMode="list" />);
      
      const switcherElement = screen.getByRole('button');
      
      await user.click(switcherElement);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('View mode changed to: grid')
      );
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels for screen readers', () => {
      render(<ViewModeSwitcher initialMode="list" />);
      
      const switcherElement = screen.getByRole('button');
      const ariaLabel = switcherElement.getAttribute('aria-label');
      expect(ariaLabel).toContain('Switch view mode');
      expect(ariaLabel).toContain('Currently: list');
    });

    test('updates ARIA label when mode changes', async () => {
      const user = userEvent.setup();
      
      render(<ViewModeSwitcher initialMode="list" />);
      
      const switcherElement = screen.getByRole('button');
      
      await user.click(switcherElement);
      
      const ariaLabel = switcherElement.getAttribute('aria-label');
      expect(ariaLabel).toContain('Currently: grid');
    });

    test('provides meaningful tooltips for operational context', () => {
      render(<ViewModeSwitcher initialMode="list" />);
      
      const switcherElement = screen.getByRole('button');
      const tooltip = switcherElement.getAttribute('title');
      expect(tooltip).toContain('View: LIST');
      expect(tooltip).toContain('detailed analysis');
    });

    test('is focusable and keyboard navigable', () => {
      render(<ViewModeSwitcher initialMode="list" />);
      
      const switcherElement = screen.getByRole('button');
      expect(switcherElement).toHaveAttribute('tabIndex', '0');
      
      switcherElement.focus();
      expect(switcherElement).toHaveFocus();
    });
  });

  describe('Props Validation', () => {
    test('handles invalid initial mode gracefully', () => {
      // @ts-ignore - Testing runtime behavior
      render(<ViewModeSwitcher initialMode="invalid" />);
      
      const switcherElement = screen.getByRole('button');
      expect(switcherElement).toHaveAttribute('data-mode', 'list'); // fallback
    });

    test('works without optional props', () => {
      render(<ViewModeSwitcher />);
      
      const switcherElement = screen.getByRole('button');
      expect(switcherElement).toBeInTheDocument();
      expect(switcherElement).toHaveAttribute('data-mode', 'list'); // default
    });

    test('applies custom className', () => {
      render(<ViewModeSwitcher className="custom-class" />);
      
      const switcherElement = screen.getByRole('button');
      expect(switcherElement).toHaveClass('custom-class');
    });
  });

  describe('Operational Context', () => {
    test('provides layout optimization information', () => {
      render(<ViewModeSwitcher initialMode="list" />);
      
      const switcherElement = screen.getByRole('button');
      const tooltip = switcherElement.getAttribute('title');
      expect(tooltip).toContain('detailed analysis');
    });

    test('supports different operational scenarios', async () => {
      const user = userEvent.setup();
      
      render(<ViewModeSwitcher initialMode="list" />);
      
      const switcherElement = screen.getByRole('button');
      
      // Analysis scenario (list mode)
      expect(switcherElement.getAttribute('title')).toContain('detailed analysis');
      
      // Quick scanning scenario (grid mode)
      await user.click(switcherElement);
      expect(switcherElement.getAttribute('title')).toContain('visual scanning');
      
      // Overview scenario (compact mode)
      await user.click(switcherElement);
      expect(switcherElement.getAttribute('title')).toContain('maximum source count');
    });
  });

  describe('Performance', () => {
    test('handles rapid mode changes efficiently', async () => {
      const user = userEvent.setup();
      
      render(<ViewModeSwitcher initialMode="list" />);
      
      const switcherElement = screen.getByRole('button');
      
      // Rapid clicks should not break the component
      await user.click(switcherElement);
      await user.click(switcherElement);
      await user.click(switcherElement);
      await user.click(switcherElement);
      
      expect(switcherElement).toBeInTheDocument();
      expect(switcherElement).toHaveAttribute('data-mode');
    });

    test('maintains stable performance during interactions', async () => {
      const user = userEvent.setup();
      
      render(<ViewModeSwitcher initialMode="list" />);
      
      const switcherElement = screen.getByRole('button');
      
      // Multiple mode cycles (9 clicks should bring us back to list: 0->1->2->0->1->2->0->1->2->0)
      for (let i = 0; i < 9; i++) {
        await user.click(switcherElement);
      }
      
      expect(switcherElement).toBeInTheDocument();
      expect(switcherElement).toHaveAttribute('data-mode', 'list'); // Should cycle back after 9 clicks
    });
  });

  describe('Error Handling', () => {
    test('handles click events during transition gracefully', async () => {
      const user = userEvent.setup();
      
      render(<ViewModeSwitcher initialMode="list" />);
      
      const switcherElement = screen.getByRole('button');
      
      // Multiple rapid clicks
      await user.click(switcherElement);
      await user.click(switcherElement);
      
      expect(switcherElement).toBeInTheDocument();
      expect(switcherElement).toHaveAttribute('data-mode', 'compact');
    });

    test('handles keyboard and mouse events simultaneously', async () => {
      const user = userEvent.setup();
      
      render(<ViewModeSwitcher initialMode="list" />);
      
      const switcherElement = screen.getByRole('button');
      switcherElement.focus();
      
      // Mix of click and keyboard events
      await user.keyboard('{Enter}');
      await user.click(switcherElement);
      
      expect(switcherElement).toBeInTheDocument();
      expect(switcherElement).toHaveAttribute('data-mode', 'compact');
    });
  });
});
