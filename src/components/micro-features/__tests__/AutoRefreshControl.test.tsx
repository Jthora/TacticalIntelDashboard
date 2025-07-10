import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import AutoRefreshControl from '../AutoRefreshControl';

// Mock data for testing
const mockRefreshCallback = jest.fn();

// Mock timer functions
jest.useFakeTimers();

describe('AutoRefreshControl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  // Basic Rendering Tests
  describe('Basic Rendering', () => {
    it('renders refresh control button', () => {
      render(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('displays refresh icon', () => {
      render(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
        />
      );
      
      expect(screen.getByText('⟲')).toBeInTheDocument();
    });

    it('has correct default title attribute', () => {
      render(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Auto-refresh: OFF (30s)');
    });

    it('applies default CSS classes', () => {
      render(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('refresh-btn', 'inactive');
      
      const icon = screen.getByText('⟲');
      expect(icon).toHaveClass('refresh-icon');
      expect(icon).not.toHaveClass('spinning');
    });

    it('does not show interval display when inactive', () => {
      render(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
        />
      );
      
      expect(screen.queryByText('30s')).not.toBeInTheDocument();
    });
  });

  // State Management Tests
  describe('State Management', () => {
    it('toggles to active state when clicked', () => {
      render(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(button).toHaveClass('refresh-btn', 'active');
      expect(button).toHaveAttribute('title', 'Auto-refresh: ON (30s)');
      
      const icon = screen.getByText('⟲');
      expect(icon).toHaveClass('refresh-icon', 'spinning');
    });

    it('shows interval display when active', () => {
      render(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(screen.getByText('30s')).toBeInTheDocument();
    });

    it('toggles back to inactive when clicked twice', () => {
      render(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
        />
      );
      
      const button = screen.getByRole('button');
      
      // First click - activate
      fireEvent.click(button);
      expect(button).toHaveClass('refresh-btn', 'active');
      
      // Second click - deactivate
      fireEvent.click(button);
      expect(button).toHaveClass('refresh-btn', 'inactive');
      expect(button).toHaveAttribute('title', 'Auto-refresh: OFF (30s)');
    });

    it('maintains state across multiple toggles', () => {
      render(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
        />
      );
      
      const button = screen.getByRole('button');
      
      // Multiple toggles
      fireEvent.click(button); // active
      fireEvent.click(button); // inactive
      fireEvent.click(button); // active
      
      expect(button).toHaveClass('refresh-btn', 'active');
      expect(screen.getByText('30s')).toBeInTheDocument();
    });
  });

  // Auto-Refresh Logic Tests
  describe('Auto-Refresh Logic', () => {
    it('starts auto-refresh when activated', () => {
      render(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
          refreshInterval={30}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Fast-forward time to trigger refresh
      act(() => {
        jest.advanceTimersByTime(30000);
      });
      
      expect(mockRefreshCallback).toHaveBeenCalledTimes(1);
    });

    it('calls refresh callback multiple times at interval', () => {
      render(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
          refreshInterval={10}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Fast-forward time for multiple intervals
      act(() => {
        jest.advanceTimersByTime(10000); // First refresh
      });
      expect(mockRefreshCallback).toHaveBeenCalledTimes(1);
      
      act(() => {
        jest.advanceTimersByTime(10000); // Second refresh
      });
      expect(mockRefreshCallback).toHaveBeenCalledTimes(2);
      
      act(() => {
        jest.advanceTimersByTime(10000); // Third refresh
      });
      expect(mockRefreshCallback).toHaveBeenCalledTimes(3);
    });

    it('stops auto-refresh when deactivated', () => {
      render(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
          refreshInterval={10}
        />
      );
      
      const button = screen.getByRole('button');
      
      // Start auto-refresh
      fireEvent.click(button);
      
      act(() => {
        jest.advanceTimersByTime(10000);
      });
      expect(mockRefreshCallback).toHaveBeenCalledTimes(1);
      
      // Stop auto-refresh
      fireEvent.click(button);
      
      // Advance time - should not trigger more refreshes
      act(() => {
        jest.advanceTimersByTime(20000);
      });
      expect(mockRefreshCallback).toHaveBeenCalledTimes(1);
    });

    it('uses custom refresh interval', () => {
      render(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
          refreshInterval={60}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Should not trigger at 30s
      act(() => {
        jest.advanceTimersByTime(30000);
      });
      expect(mockRefreshCallback).not.toHaveBeenCalled();
      
      // Should trigger at 60s
      act(() => {
        jest.advanceTimersByTime(30000);
      });
      expect(mockRefreshCallback).toHaveBeenCalledTimes(1);
    });

    it('shows correct interval in title and display', () => {
      render(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
          refreshInterval={120}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Auto-refresh: OFF (120s)');
      
      fireEvent.click(button);
      expect(button).toHaveAttribute('title', 'Auto-refresh: ON (120s)');
      expect(screen.getByText('120s')).toBeInTheDocument();
    });
  });

  // Cleanup Tests
  describe('Cleanup and Memory Management', () => {
    it('cleans up interval on unmount', () => {
      const { unmount } = render(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
          refreshInterval={10}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Unmount component
      unmount();
      
      // Advance time - should not trigger refresh after unmount
      act(() => {
        jest.advanceTimersByTime(20000);
      });
      expect(mockRefreshCallback).not.toHaveBeenCalled();
    });

    it('prevents memory leaks with rapid toggle', () => {
      render(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
          refreshInterval={10}
        />
      );
      
      const button = screen.getByRole('button');
      
      // Rapid toggle multiple times
      for (let i = 0; i < 10; i++) {
        fireEvent.click(button); // activate
        fireEvent.click(button); // deactivate
      }
      
      // End in activated state
      fireEvent.click(button);
      
      // Should only have one active interval
      act(() => {
        jest.advanceTimersByTime(10000);
      });
      expect(mockRefreshCallback).toHaveBeenCalledTimes(1);
    });

    it('clears previous interval when restarting', () => {
      const { rerender } = render(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
          refreshInterval={10}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Change interval while active
      rerender(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
          refreshInterval={20}
        />
      );
      
      // Should use new interval, not old one
      act(() => {
        jest.advanceTimersByTime(10000);
      });
      expect(mockRefreshCallback).not.toHaveBeenCalled();
      
      act(() => {
        jest.advanceTimersByTime(10000);
      });
      expect(mockRefreshCallback).toHaveBeenCalledTimes(1);
    });
  });

  // Visual States Tests
  describe('Visual States', () => {
    it('applies active CSS classes when enabled', () => {
      render(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(button).toHaveClass('refresh-btn', 'active');
      expect(button).not.toHaveClass('inactive');
      
      const icon = screen.getByText('⟲');
      expect(icon).toHaveClass('refresh-icon', 'spinning');
    });

    it('applies inactive CSS classes when disabled', () => {
      render(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('refresh-btn', 'inactive');
      expect(button).not.toHaveClass('active');
      
      const icon = screen.getByText('⟲');
      expect(icon).toHaveClass('refresh-icon');
      expect(icon).not.toHaveClass('spinning');
    });

    it('shows and hides interval display correctly', () => {
      render(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
          refreshInterval={45}
        />
      );
      
      // Initially hidden
      expect(screen.queryByText('45s')).not.toBeInTheDocument();
      
      // Shown when active
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(screen.getByText('45s')).toBeInTheDocument();
      
      // Hidden when inactive
      fireEvent.click(button);
      expect(screen.queryByText('45s')).not.toBeInTheDocument();
    });

    it('updates display when interval changes', () => {
      const { rerender } = render(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
          refreshInterval={30}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(screen.getByText('30s')).toBeInTheDocument();
      
      rerender(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
          refreshInterval={90}
        />
      );
      
      expect(screen.getByText('90s')).toBeInTheDocument();
      expect(screen.queryByText('30s')).not.toBeInTheDocument();
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('has proper button role', () => {
      render(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
        />
      );
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('has descriptive title attributes', () => {
      render(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
          refreshInterval={60}
        />
      );
      
      const button = screen.getByRole('button');
      
      // Inactive state
      expect(button).toHaveAttribute('title', 'Auto-refresh: OFF (60s)');
      
      // Active state
      fireEvent.click(button);
      expect(button).toHaveAttribute('title', 'Auto-refresh: ON (60s)');
    });

    it('is keyboard accessible', () => {
      render(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
        />
      );
      
      const button = screen.getByRole('button');
      
      // Focus and click
      button.focus();
      fireEvent.click(button);
      
      expect(button).toHaveClass('refresh-btn', 'active');
    });

    it('maintains focus after toggle', () => {
      render(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
        />
      );
      
      const button = screen.getByRole('button');
      button.focus();
      fireEvent.click(button);
      
      expect(document.activeElement).toBe(button);
    });
  });

  // Props Validation Tests
  describe('Props Validation', () => {
    it('handles missing onRefresh callback gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      render(
        <AutoRefreshControl />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      act(() => {
        jest.advanceTimersByTime(30000);
      });
      
      // Should not crash, but may log error
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('handles invalid refresh interval gracefully', () => {
      render(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
          refreshInterval={0}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Auto-refresh: OFF (30s)'); // Should default to 30s
    });

    it('handles negative refresh interval', () => {
      render(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
          refreshInterval={-10}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Auto-refresh: OFF (30s)'); // Should default to 30s
    });

    it('handles very large refresh intervals', () => {
      render(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
          refreshInterval={999999}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Auto-refresh: OFF (999999s)');
      
      fireEvent.click(button);
      expect(screen.getByText('999999s')).toBeInTheDocument();
    });
  });

  // Edge Cases Tests
  describe('Edge Cases', () => {
    it('handles rapid successive clicks', () => {
      render(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
          refreshInterval={10}
        />
      );
      
      const button = screen.getByRole('button');
      
      // Rapid clicks
      fireEvent.click(button); // active
      fireEvent.click(button); // inactive
      fireEvent.click(button); // active
      fireEvent.click(button); // inactive
      fireEvent.click(button); // active
      
      // Should end up active
      expect(button).toHaveClass('refresh-btn', 'active');
      
      act(() => {
        jest.advanceTimersByTime(10000);
      });
      expect(mockRefreshCallback).toHaveBeenCalledTimes(1);
    });

    it('handles async onRefresh callback', async () => {
      const asyncRefreshCallback = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      
      render(
        <AutoRefreshControl 
          onRefresh={asyncRefreshCallback}
          refreshInterval={10}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      act(() => {
        jest.advanceTimersByTime(10000);
      });
      
      expect(asyncRefreshCallback).toHaveBeenCalledTimes(1);
      
      // Should continue to work for subsequent calls
      act(() => {
        jest.advanceTimersByTime(10000);
      });
      
      expect(asyncRefreshCallback).toHaveBeenCalledTimes(2);
    });

    it('handles error in onRefresh callback', () => {
      const errorCallback = jest.fn().mockImplementation(() => {
        throw new Error('Refresh failed');
      });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      render(
        <AutoRefreshControl 
          onRefresh={errorCallback}
          refreshInterval={10}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      act(() => {
        jest.advanceTimersByTime(10000);
      });
      
      expect(errorCallback).toHaveBeenCalledTimes(1);
      
      // Should continue working despite error
      act(() => {
        jest.advanceTimersByTime(10000);
      });
      
      expect(errorCallback).toHaveBeenCalledTimes(2);
      
      consoleSpy.mockRestore();
    });

    it('handles component remounting with active state', () => {
      const { unmount } = render(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
          refreshInterval={10}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      unmount();
      
      // Remount component with fresh render
      render(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
          refreshInterval={10}
        />
      );
      
      // Should start in inactive state
      const newButton = screen.getByRole('button');
      expect(newButton).toHaveClass('refresh-btn', 'inactive');
    });
  });

  // Integration Tests
  describe('Integration', () => {
    it('works with different callback functions', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      const { rerender } = render(
        <AutoRefreshControl 
          onRefresh={callback1}
          refreshInterval={10}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      act(() => {
        jest.advanceTimersByTime(10000);
      });
      expect(callback1).toHaveBeenCalledTimes(1);
      
      // Change callback
      rerender(
        <AutoRefreshControl 
          onRefresh={callback2}
          refreshInterval={10}
        />
      );
      
      act(() => {
        jest.advanceTimersByTime(10000);
      });
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(callback1).toHaveBeenCalledTimes(1); // Should not be called again
    });

    it('maintains active state when props change', () => {
      const { rerender } = render(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
          refreshInterval={30}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(button).toHaveClass('refresh-btn', 'active');
      
      // Change props
      rerender(
        <AutoRefreshControl 
          onRefresh={mockRefreshCallback}
          refreshInterval={60}
        />
      );
      
      // Should remain active
      expect(button).toHaveClass('refresh-btn', 'active');
      expect(screen.getByText('60s')).toBeInTheDocument();
    });
  });
});
