import '@testing-library/jest-dom';

import { fireEvent,render, screen } from '@testing-library/react';

import CompactModeToggle from '../CompactModeToggle';

// Mock data for testing
const mockOnCompactModeChange = jest.fn();

describe('CompactModeToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset localStorage
    localStorage.clear();
    // Reset document styles and classes
    document.documentElement.style.cssText = '';
    document.documentElement.className = '';
  });

  // Basic Rendering Tests
  describe('Basic Rendering', () => {
    it('renders compact mode toggle button', () => {
      render(<CompactModeToggle onCompactModeChange={mockOnCompactModeChange} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('compact-btn');
    });

    it('displays normal mode by default', () => {
      render(<CompactModeToggle onCompactModeChange={mockOnCompactModeChange} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('inactive');
      expect(button).toHaveAttribute('title', 'Compact Mode: OFF');
    });

    it('displays correct icon for normal mode', () => {
      render(<CompactModeToggle onCompactModeChange={mockOnCompactModeChange} />);
      
      const icon = screen.getByText('⬜');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('compact-icon');
    });

    it('applies default CSS classes', () => {
      render(<CompactModeToggle onCompactModeChange={mockOnCompactModeChange} />);
      
      const container = screen.getByRole('button').parentElement;
      expect(container).toHaveClass('compact-toggle');
    });

    it('displays label correctly when provided', () => {
      render(<CompactModeToggle onCompactModeChange={mockOnCompactModeChange} showLabel={true} />);
      
      expect(screen.getByText('COMPACT')).toBeInTheDocument();
    });
  });

  // State Management Tests
  describe('State Management', () => {
    it('toggles from normal to compact when clicked', () => {
      render(<CompactModeToggle onCompactModeChange={mockOnCompactModeChange} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(button).toHaveClass('active');
      expect(button).toHaveAttribute('title', 'Compact Mode: ON');
      expect(screen.getByText('⬛')).toBeInTheDocument();
    });

    it('toggles back to normal when clicked twice', () => {
      render(<CompactModeToggle onCompactModeChange={mockOnCompactModeChange} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button); // normal -> compact
      fireEvent.click(button); // compact -> normal
      
      expect(button).toHaveClass('inactive');
      expect(button).toHaveAttribute('title', 'Compact Mode: OFF');
      expect(screen.getByText('⬜')).toBeInTheDocument();
    });

    it('maintains state across multiple toggles', () => {
      render(<CompactModeToggle onCompactModeChange={mockOnCompactModeChange} />);
      
      const button = screen.getByRole('button');
      
      // Multiple toggles
      for (let i = 0; i < 6; i++) {
        fireEvent.click(button);
      }
      
      // Should be back to normal mode (even number of clicks)
      expect(button).toHaveClass('inactive');
    });

    it('starts with custom initial mode when provided', () => {
      render(<CompactModeToggle initialCompactMode={true} onCompactModeChange={mockOnCompactModeChange} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('active');
      expect(screen.getByText('⬛')).toBeInTheDocument();
    });

    it('respects disabled state', () => {
      render(<CompactModeToggle onCompactModeChange={mockOnCompactModeChange} disabled={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      
      fireEvent.click(button);
      expect(mockOnCompactModeChange).not.toHaveBeenCalled();
    });
  });

  // Visual States and CSS Classes Tests
  describe('Visual States and CSS Classes', () => {
    it('applies active styles correctly', () => {
      render(<CompactModeToggle initialCompactMode={true} onCompactModeChange={mockOnCompactModeChange} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('compact-btn', 'active');
      expect(screen.getByText('⬛')).toBeInTheDocument();
    });

    it('applies inactive styles correctly', () => {
      render(<CompactModeToggle onCompactModeChange={mockOnCompactModeChange} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('compact-btn', 'inactive');
      expect(screen.getByText('⬜')).toBeInTheDocument();
    });

    it('updates CSS classes when mode changes', () => {
      render(<CompactModeToggle onCompactModeChange={mockOnCompactModeChange} />);
      
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('inactive');
      fireEvent.click(button);
      expect(button).toHaveClass('active');
      expect(button).not.toHaveClass('inactive');
    });

    it('applies disabled styles correctly', () => {
      render(<CompactModeToggle onCompactModeChange={mockOnCompactModeChange} disabled={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('compact-btn');
    });
  });

  // Callback Integration Tests
  describe('Callback Integration', () => {
    it('calls onCompactModeChange when mode is toggled', () => {
      render(<CompactModeToggle onCompactModeChange={mockOnCompactModeChange} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnCompactModeChange).toHaveBeenCalledWith(true, expect.objectContaining({
        cssVariables: expect.any(Object),
        documentClass: 'compact-mode'
      }));
    });

    it('calls onCompactModeChange with correct sequence', () => {
      render(<CompactModeToggle onCompactModeChange={mockOnCompactModeChange} />);
      
      const button = screen.getByRole('button');
      
      fireEvent.click(button); // normal -> compact
      expect(mockOnCompactModeChange).toHaveBeenCalledWith(true, expect.any(Object));
      
      fireEvent.click(button); // compact -> normal
      expect(mockOnCompactModeChange).toHaveBeenCalledWith(false, expect.any(Object));
    });

    it('calls callbacks multiple times for multiple toggles', () => {
      render(<CompactModeToggle onCompactModeChange={mockOnCompactModeChange} />);
      
      const button = screen.getByRole('button');
      
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(mockOnCompactModeChange).toHaveBeenCalledTimes(3);
    });

    it('provides correct CSS variables in callback', () => {
      render(<CompactModeToggle onCompactModeChange={mockOnCompactModeChange} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      const [isCompact, config] = mockOnCompactModeChange.mock.calls[0];
      expect(isCompact).toBe(true);
      expect(config.cssVariables).toHaveProperty('--header-height');
      expect(config.cssVariables).toHaveProperty('--sidebar-width');
      expect(config.cssVariables).toHaveProperty('--font-size-base');
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('has proper button role', () => {
      render(<CompactModeToggle onCompactModeChange={mockOnCompactModeChange} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('has descriptive title attributes for both states', () => {
      render(<CompactModeToggle onCompactModeChange={mockOnCompactModeChange} />);
      
      const button = screen.getByRole('button');
      
      // Normal mode
      expect(button).toHaveAttribute('title', 'Compact Mode: OFF');
      
      // Compact mode
      fireEvent.click(button);
      expect(button).toHaveAttribute('title', 'Compact Mode: ON');
    });

    it('is keyboard accessible', () => {
      render(<CompactModeToggle onCompactModeChange={mockOnCompactModeChange} />);
      
      const button = screen.getByRole('button');
      
      // Test Enter key
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      expect(mockOnCompactModeChange).toHaveBeenCalled();
      
      // Test Space key
      fireEvent.keyDown(button, { key: ' ', code: 'Space' });
      expect(mockOnCompactModeChange).toHaveBeenCalledTimes(2);
    });

    it('maintains focus after mode change', () => {
      render(<CompactModeToggle onCompactModeChange={mockOnCompactModeChange} />);
      
      const button = screen.getByRole('button');
      button.focus();
      
      fireEvent.click(button);
      
      expect(document.activeElement).toBe(button);
    });

    it('has appropriate aria attributes', () => {
      render(<CompactModeToggle onCompactModeChange={mockOnCompactModeChange} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title');
      expect(button).toHaveProperty('tagName', 'BUTTON');
    });

    it('supports aria-pressed for toggle state', () => {
      render(<CompactModeToggle onCompactModeChange={mockOnCompactModeChange} />);
      
      const button = screen.getByRole('button');
      
      // Initial state
      expect(button).toHaveAttribute('aria-pressed', 'false');
      
      // After toggle
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });
  });

  // Props Validation Tests
  describe('Props Validation', () => {
    it('handles missing onCompactModeChange callback gracefully', () => {
      expect(() => {
        render(<CompactModeToggle />);
      }).not.toThrow();
      
      const button = screen.getByRole('button');
      expect(() => {
        fireEvent.click(button);
      }).not.toThrow();
    });

    it('handles invalid initial mode gracefully', () => {
      render(<CompactModeToggle initialCompactMode={'invalid' as any} onCompactModeChange={mockOnCompactModeChange} />);
      
      const button = screen.getByRole('button');
      // Should default to normal mode
      expect(button).toHaveClass('inactive');
      expect(screen.getByText('⬜')).toBeInTheDocument();
    });

    it('handles rapid successive clicks without errors', () => {
      render(<CompactModeToggle onCompactModeChange={mockOnCompactModeChange} />);
      
      const button = screen.getByRole('button');
      
      // Rapid clicks
      for (let i = 0; i < 10; i++) {
        fireEvent.click(button);
      }
      
      expect(mockOnCompactModeChange).toHaveBeenCalledTimes(10);
    });

    it('handles custom className prop', () => {
      render(<CompactModeToggle className="custom-class" onCompactModeChange={mockOnCompactModeChange} />);
      
      const container = screen.getByRole('button').parentElement;
      expect(container).toHaveClass('compact-toggle', 'custom-class');
    });
  });

  // CSS Variables and DOM Integration Tests
  describe('CSS Variables and DOM Integration', () => {
    it('provides compact mode CSS variables', () => {
      render(<CompactModeToggle onCompactModeChange={mockOnCompactModeChange} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      const [, config] = mockOnCompactModeChange.mock.calls[0];
      const vars = config.cssVariables;
      
      expect(vars['--header-height']).toBe('16px');
      expect(vars['--sidebar-width']).toBe('120px');
      expect(vars['--font-size-base']).toBe('6px');
      expect(vars['--spacing-unit']).toBe('1px');
    });

    it('provides normal mode CSS variables', () => {
      render(<CompactModeToggle initialCompactMode={true} onCompactModeChange={mockOnCompactModeChange} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button); // Switch to normal
      
      const [, config] = mockOnCompactModeChange.mock.calls[0];
      const vars = config.cssVariables;
      
      expect(vars['--header-height']).toBe('24px');
      expect(vars['--sidebar-width']).toBe('200px');
      expect(vars['--font-size-base']).toBe('8px');
      expect(vars['--spacing-unit']).toBe('2px');
    });

    it('provides document class information', () => {
      render(<CompactModeToggle onCompactModeChange={mockOnCompactModeChange} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      const [, config] = mockOnCompactModeChange.mock.calls[0];
      expect(config.documentClass).toBe('compact-mode');
    });
  });

  // Edge Cases Tests
  describe('Edge Cases', () => {
    it('handles async onCompactModeChange callback', async () => {
      const asyncCallback = jest.fn().mockResolvedValue(undefined);
      render(<CompactModeToggle onCompactModeChange={asyncCallback} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(asyncCallback).toHaveBeenCalled();
    });

    it('handles error in onCompactModeChange callback gracefully', () => {
      const errorCallback = jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      
      expect(() => {
        render(<CompactModeToggle onCompactModeChange={errorCallback} />);
        const button = screen.getByRole('button');
        fireEvent.click(button);
      }).not.toThrow();
    });

    it('handles simultaneous rapid mode changes', () => {
      render(<CompactModeToggle onCompactModeChange={mockOnCompactModeChange} />);
      
      const button = screen.getByRole('button');
      
      // Simulate simultaneous events
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(mockOnCompactModeChange).toHaveBeenCalledTimes(3);
      expect(button).toHaveClass('active'); // Should be compact (odd number of clicks)
    });

    it('handles component unmounting during operation', () => {
      const { unmount } = render(<CompactModeToggle onCompactModeChange={mockOnCompactModeChange} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(() => unmount()).not.toThrow();
    });
  });

  // Persistence Tests
  describe('Persistence', () => {
    it('saves mode preference to localStorage', () => {
      render(<CompactModeToggle onCompactModeChange={mockOnCompactModeChange} persistPreference={true} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(localStorage.getItem('tactical-compact-mode')).toBe('true');
    });

    it('loads mode preference from localStorage', () => {
      localStorage.setItem('tactical-compact-mode', 'true');
      
      render(<CompactModeToggle onCompactModeChange={mockOnCompactModeChange} persistPreference={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('active');
    });

    it('handles invalid localStorage data gracefully', () => {
      localStorage.setItem('tactical-compact-mode', 'invalid-data');
      
      expect(() => {
        render(<CompactModeToggle onCompactModeChange={mockOnCompactModeChange} persistPreference={true} />);
      }).not.toThrow();
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('inactive'); // Should default to normal
    });
  });

  // Integration Tests
  describe('Integration', () => {
    it('works with different callback functions', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      const { rerender } = render(<CompactModeToggle onCompactModeChange={callback1} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(callback1).toHaveBeenCalled();
      
      rerender(<CompactModeToggle onCompactModeChange={callback2} />);
      fireEvent.click(button);
      
      expect(callback2).toHaveBeenCalled();
    });

    it('maintains mode state when props change', () => {
      const { rerender } = render(<CompactModeToggle onCompactModeChange={mockOnCompactModeChange} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button); // Switch to compact
      
      expect(button).toHaveClass('active');
      
      // Re-render with new callback
      const newCallback = jest.fn();
      rerender(<CompactModeToggle onCompactModeChange={newCallback} />);
      
      // Mode state should be maintained
      expect(button).toHaveClass('active');
    });

    it('provides complete configuration in callbacks', () => {
      render(<CompactModeToggle onCompactModeChange={mockOnCompactModeChange} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      const [isCompact, config] = mockOnCompactModeChange.mock.calls[0];
      expect(typeof isCompact).toBe('boolean');
      expect(config).toHaveProperty('cssVariables');
      expect(config).toHaveProperty('documentClass');
      expect(typeof config.cssVariables).toBe('object');
      expect(typeof config.documentClass).toBe('string');
    });
  });
});
