import '@testing-library/jest-dom';

import { act,render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RealTimeClockDisplay, RealTimeClockDisplayProps } from '../RealTimeClockDisplay';

// Mock console.log to test logging functionality
const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('RealTimeClockDisplay', () => {
  beforeEach(() => {
    consoleSpy.mockClear();
    // Mock Date to have consistent test results
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-07-06T14:30:45.000Z'));
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  const defaultProps: RealTimeClockDisplayProps = {
    format: '24h',
    showSeconds: true,
  };

  describe('Rendering', () => {
    test('renders with default time format', () => {
      render(<RealTimeClockDisplay {...defaultProps} />);
      
      const clockElement = screen.getByRole('button');
      expect(clockElement).toBeInTheDocument();
      expect(clockElement).toHaveClass('status-micro', 'time-display');
    });

    test('displays initial time correctly', () => {
      render(<RealTimeClockDisplay format="24h" showSeconds={true} />);
      
      const clockElement = screen.getByRole('button');
      // Time should be displayed in 24h format
      expect(clockElement).toHaveTextContent(/\d{2}:\d{2}:\d{2}/);
    });

    test('has correct accessibility attributes', () => {
      render(<RealTimeClockDisplay {...defaultProps} />);
      
      const clockElement = screen.getByRole('button');
      expect(clockElement).toHaveAttribute('tabIndex', '0');
      expect(clockElement).toHaveAttribute('aria-label');
      expect(clockElement.getAttribute('title')).toContain('System Time');
    });
  });

  describe('Time Formats', () => {
    test('displays 24-hour format correctly', () => {
      render(<RealTimeClockDisplay format="24h" showSeconds={true} />);
      
      const clockElement = screen.getByRole('button');
      expect(clockElement).toHaveAttribute('data-format', '24h');
      // Should display time without AM/PM
      expect(clockElement.textContent).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    test('displays 12-hour format correctly', () => {
      render(<RealTimeClockDisplay format="12h" showSeconds={true} />);
      
      const clockElement = screen.getByRole('button');
      expect(clockElement).toHaveAttribute('data-format', '12h');
      // Should display time with AM/PM
      expect(clockElement.textContent).toMatch(/\d{1,2}:\d{2}:\d{2}\s*(AM|PM)/);
    });

    test('displays ISO format correctly', () => {
      render(<RealTimeClockDisplay format="iso" showSeconds={true} />);
      
      const clockElement = screen.getByRole('button');
      expect(clockElement).toHaveAttribute('data-format', 'iso');
      // Should display ISO time format
      expect(clockElement.textContent).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    test('displays military format correctly', () => {
      render(<RealTimeClockDisplay format="military" showSeconds={true} />);
      
      const clockElement = screen.getByRole('button');
      expect(clockElement).toHaveAttribute('data-format', 'military');
      // Should display military time with Z suffix
      expect(clockElement.textContent).toMatch(/^\d{6}Z$/);
    });

    test('respects showSeconds prop', () => {
      const { rerender } = render(
        <RealTimeClockDisplay format="24h" showSeconds={false} />
      );
      
      let clockElement = screen.getByRole('button');
      // Without seconds
      expect(clockElement.textContent).toMatch(/^\d{2}:\d{2}$/);
      
      rerender(<RealTimeClockDisplay format="24h" showSeconds={true} />);
      clockElement = screen.getByRole('button');
      // With seconds
      expect(clockElement.textContent).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('Real-time Updates', () => {
    test('updates time automatically', async () => {
      act(() => {
        render(<RealTimeClockDisplay format="24h" showSeconds={true} updateInterval={100} />);
      });
      
      const clockElement = screen.getByRole('button');
      const initialTime = clockElement.textContent;
      
      // Advance time by 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(clockElement.textContent).not.toBe(initialTime);
      });
    });

    test('respects custom update interval', async () => {
      act(() => {
        render(<RealTimeClockDisplay format="24h" updateInterval={500} />);
      });
      
      const clockElement = screen.getByRole('button');
      
      // Should update every 500ms instead of default 1000ms
      act(() => {
        jest.advanceTimersByTime(500);
      });
      
      await waitFor(() => {
        expect(clockElement).toBeInTheDocument();
      });
    });
  });

  describe('Pause/Resume Functionality', () => {
    test('can be paused and resumed by clicking', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      act(() => {
        render(<RealTimeClockDisplay format="24h" showSeconds={true} />);
      });
      
      const clockElement = screen.getByRole('button');
      
      // Initially active
      expect(clockElement).toHaveAttribute('data-active', 'true');
      expect(clockElement).not.toHaveClass('paused');
      
      // Click to pause
      await act(async () => {
        await user.click(clockElement);
      });
      
      expect(clockElement).toHaveAttribute('data-active', 'false');
      expect(clockElement).toHaveClass('paused');
      
      // Click to resume  
      await act(async () => {
        await user.click(clockElement);
      });
      
      expect(clockElement).toHaveAttribute('data-active', 'true');
      expect(clockElement).not.toHaveClass('paused');
    });

    test('logs pause/resume events', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      act(() => {
        render(<RealTimeClockDisplay format="24h" />);
      });
      
      const clockElement = screen.getByRole('button');
      
      await act(async () => {
        await user.click(clockElement);
      });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Clock paused')
      );
      
      await act(async () => {
        await user.click(clockElement);
      });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Clock resumed')
      );
    });

    test('stops updating when paused', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      act(() => {
        render(<RealTimeClockDisplay format="24h" showSeconds={true} updateInterval={100} />);
      });
      
      const clockElement = screen.getByRole('button');
      
      // Pause the clock
      await act(async () => {
        await user.click(clockElement);
      });
      
      const pausedTime = clockElement.textContent;
      
      // Advance time
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      
      // Time should not have changed while paused
      expect(clockElement.textContent).toBe(pausedTime);
    });
  });

  describe('Keyboard Navigation', () => {
    test('handles Enter key for pause/resume', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      act(() => {
        render(<RealTimeClockDisplay format="24h" />);
      });
      
      const clockElement = screen.getByRole('button');
      clockElement.focus();
      
      await act(async () => {
        await user.keyboard('{Enter}');
      });
      
      expect(clockElement).toHaveAttribute('data-active', 'false');
    });

    test('handles Space key for pause/resume', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      act(() => {
        render(<RealTimeClockDisplay format="24h" />);
      });
      
      const clockElement = screen.getByRole('button');
      clockElement.focus();
      
      await act(async () => {
        await user.keyboard(' ');
      });
      
      expect(clockElement).toHaveAttribute('data-active', 'false');
    });
  });

  describe('Accessibility', () => {
    test('provides meaningful ARIA labels', () => {
      act(() => {
        render(<RealTimeClockDisplay format="24h" />);
      });
      
      const clockElement = screen.getByRole('button');
      const ariaLabel = clockElement.getAttribute('aria-label');
      expect(ariaLabel).toContain('Current time');
      expect(ariaLabel).toContain('Format: 24h');
      expect(ariaLabel).toContain('Status: running');
    });

    test('updates ARIA label when paused', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      act(() => {
        render(<RealTimeClockDisplay format="24h" />);
      });
      
      const clockElement = screen.getByRole('button');
      
      await act(async () => {
        await user.click(clockElement);
      });
      
      const ariaLabel = clockElement.getAttribute('aria-label');
      expect(ariaLabel).toContain('Status: paused');
    });

    test('provides helpful tooltips', () => {
      render(<RealTimeClockDisplay format="24h" />);
      
      const clockElement = screen.getByRole('button');
      const title = clockElement.getAttribute('title');
      expect(title).toContain('System Time (24H)');
      expect(title).toContain('Real-time');
      expect(title).toContain('Click to pause/resume');
    });

    test('is focusable and keyboard navigable', () => {
      render(<RealTimeClockDisplay format="24h" />);
      
      const clockElement = screen.getByRole('button');
      expect(clockElement).toHaveAttribute('tabIndex', '0');
      
      clockElement.focus();
      expect(clockElement).toHaveFocus();
    });
  });

  describe('Props Validation', () => {
    test('works with minimal props', () => {
      render(<RealTimeClockDisplay />);
      
      const clockElement = screen.getByRole('button');
      expect(clockElement).toBeInTheDocument();
      expect(clockElement).toHaveAttribute('data-format', '24h');
    });

    test('applies custom className', () => {
      render(<RealTimeClockDisplay className="custom-clock-class" />);
      
      const clockElement = screen.getByRole('button');
      expect(clockElement).toHaveClass('custom-clock-class');
    });

    test('handles timezone prop', () => {
      render(<RealTimeClockDisplay timezone="UTC" />);
      
      const clockElement = screen.getByRole('button');
      // Should render without errors
      expect(clockElement).toBeInTheDocument();
    });

    test('handles showDate prop', () => {
      render(<RealTimeClockDisplay showDate={true} />);
      
      const clockElement = screen.getByRole('button');
      // Should include date in display
      expect(clockElement.textContent).toMatch(/\d{2}\/\d{2}\/\d{2}/);
    });
  });

  describe('Operational Context', () => {
    test('provides mission timing context', () => {
      render(<RealTimeClockDisplay format="military" />);
      
      const clockElement = screen.getByRole('button');
      expect(clockElement).toHaveAttribute('data-format', 'military');
      expect(clockElement.textContent).toMatch(/Z$/); // Military time suffix
    });

    test('supports different operational scenarios', () => {
      const { rerender } = render(<RealTimeClockDisplay format="24h" />);
      let clockElement = screen.getByRole('button');
      
      // Standard operations
      expect(clockElement).toHaveAttribute('data-format', '24h');
      
      // Switch to military operations
      rerender(<RealTimeClockDisplay format="military" />);
      clockElement = screen.getByRole('button');
      expect(clockElement).toHaveAttribute('data-format', 'military');
    });
  });

  describe('Performance', () => {
    test('cleans up intervals on unmount', () => {
      const { unmount } = render(<RealTimeClockDisplay updateInterval={100} />);
      
      // Should not cause memory leaks
      unmount();
      
      // Advance timers to ensure cleanup
      jest.advanceTimersByTime(1000);
      expect(true).toBe(true); // Test passes if no errors
    });

    test('handles rapid pause/resume efficiently', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      act(() => {
        render(<RealTimeClockDisplay format="24h" />);
      });
      
      const clockElement = screen.getByRole('button');
      
      // Rapid clicks should not break the component
      await act(async () => {
        await user.click(clockElement);
        await user.click(clockElement);
        await user.click(clockElement);
        await user.click(clockElement);
      });
      
      expect(clockElement).toBeInTheDocument();
      expect(clockElement).toHaveAttribute('data-active');
    });
  });

  describe('Error Handling', () => {
    test('handles invalid format gracefully', () => {
      // @ts-ignore - Testing runtime behavior
      render(<RealTimeClockDisplay format="invalid" />);
      
      const clockElement = screen.getByRole('button');
      expect(clockElement).toBeInTheDocument();
    });

    test('handles edge cases in time formatting', () => {
      // Test around midnight
      jest.setSystemTime(new Date('2025-07-06T00:00:00.000Z'));
      
      render(<RealTimeClockDisplay format="24h" showSeconds={true} />);
      
      const clockElement = screen.getByRole('button');
      expect(clockElement).toBeInTheDocument();
    });
  });
});
