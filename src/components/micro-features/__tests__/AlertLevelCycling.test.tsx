import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { AlertLevelCycling, AlertLevelCyclingProps } from '../AlertLevelCycling';

// Mock console.log to test logging functionality
const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('AlertLevelCycling', () => {
  beforeEach(() => {
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  const defaultProps: AlertLevelCyclingProps = {
    initialLevel: 'green',
  };

  describe('Rendering', () => {
    test('renders with default alert level', () => {
      render(<AlertLevelCycling {...defaultProps} />);
      
      const alertElement = screen.getByRole('button');
      expect(alertElement).toBeInTheDocument();
      expect(alertElement).toHaveTextContent('▲');
      expect(alertElement).toHaveAttribute('data-level', 'green');
    });

    test('renders with custom initial level', () => {
      render(<AlertLevelCycling initialLevel="red" />);
      
      const alertElement = screen.getByRole('button');
      expect(alertElement).toHaveAttribute('data-level', 'red');
    });

    test('has correct accessibility attributes', () => {
      render(<AlertLevelCycling {...defaultProps} />);
      
      const alertElement = screen.getByRole('button');
      expect(alertElement).toHaveAttribute('tabIndex', '0');
      expect(alertElement).toHaveAttribute('aria-label');
      expect(alertElement.getAttribute('title')).toContain('NORMAL OPERATIONS');
    });
  });

  describe('Alert Level Cycling', () => {
    test('cycles through levels correctly: green → yellow → red → green', async () => {
      const user = userEvent.setup();
      render(<AlertLevelCycling initialLevel="green" />);
      
      const alertElement = screen.getByRole('button');
      
      // Initial state
      expect(alertElement).toHaveAttribute('data-level', 'green');
      
      // First click: green → yellow
      await user.click(alertElement);
      expect(alertElement).toHaveAttribute('data-level', 'yellow');
      
      // Second click: yellow → red
      await user.click(alertElement);
      expect(alertElement).toHaveAttribute('data-level', 'red');
      
      // Third click: red → green
      await user.click(alertElement);
      expect(alertElement).toHaveAttribute('data-level', 'green');
    });

    test('handles keyboard navigation (Enter key)', async () => {
      const user = userEvent.setup();
      render(<AlertLevelCycling initialLevel="green" />);
      
      const alertElement = screen.getByRole('button');
      alertElement.focus();
      
      await user.keyboard('{Enter}');
      expect(alertElement).toHaveAttribute('data-level', 'yellow');
    });

    test('handles keyboard navigation (Space key)', async () => {
      const user = userEvent.setup();
      render(<AlertLevelCycling initialLevel="green" />);
      
      const alertElement = screen.getByRole('button');
      alertElement.focus();
      
      await user.keyboard(' ');
      expect(alertElement).toHaveAttribute('data-level', 'yellow');
    });
  });

  describe('Visual Feedback', () => {
    test('applies correct CSS classes for each level', async () => {
      const user = userEvent.setup();
      render(<AlertLevelCycling initialLevel="green" />);
      
      const alertElement = screen.getByRole('button');
      
      // Green state
      expect(alertElement).toHaveClass('status-micro', 'alert-level');
      expect(alertElement).toHaveAttribute('data-level', 'green');
      
      // Yellow state
      await user.click(alertElement);
      expect(alertElement).toHaveAttribute('data-level', 'yellow');
      
      // Red state
      await user.click(alertElement);
      expect(alertElement).toHaveAttribute('data-level', 'red');
    });

    test('applies correct colors for each level', async () => {
      const user = userEvent.setup();
      render(<AlertLevelCycling initialLevel="green" />);
      
      const alertElement = screen.getByRole('button');
      
      // Green state (initial)
      expect(alertElement.style.color).toBe('rgb(0, 255, 65)'); // Green
      
      // Yellow state
      await user.click(alertElement);
      expect(alertElement.style.color).toBe('rgb(255, 149, 0)'); // Orange/Yellow
      
      // Red state
      await user.click(alertElement);
      expect(alertElement.style.color).toBe('rgb(255, 0, 64)'); // Red
    });
  });

  describe('Alert Descriptions', () => {
    test('provides correct operational descriptions for each level', async () => {
      const user = userEvent.setup();
      render(<AlertLevelCycling initialLevel="green" />);
      
      const alertElement = screen.getByRole('button');
      
      // Green level
      expect(alertElement.getAttribute('title')).toContain('All systems nominal');
      
      // Yellow level
      await user.click(alertElement);
      expect(alertElement.getAttribute('title')).toContain('Heightened awareness');
      
      // Red level
      await user.click(alertElement);
      expect(alertElement.getAttribute('title')).toContain('Immediate action required');
    });
  });

  describe('Callback Functions', () => {
    test('calls onLevelChange callback when level changes', async () => {
      const user = userEvent.setup();
      const mockCallback = jest.fn();
      
      render(
        <AlertLevelCycling 
          initialLevel="green" 
          onLevelChange={mockCallback}
        />
      );
      
      const alertElement = screen.getByRole('button');
      await user.click(alertElement);
      
      expect(mockCallback).toHaveBeenCalledWith('yellow');
    });

    test('logs alert level changes correctly', async () => {
      const user = userEvent.setup();
      render(<AlertLevelCycling initialLevel="green" />);
      
      const alertElement = screen.getByRole('button');
      await user.click(alertElement);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Alert Level Changed: GREEN → YELLOW')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Operational Status: Heightened awareness')
      );
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels for screen readers', () => {
      render(<AlertLevelCycling initialLevel="green" />);
      
      const alertElement = screen.getByRole('button');
      expect(alertElement).toHaveAttribute('aria-label');
      expect(alertElement.getAttribute('aria-label')).toContain('Alert level');
    });

    test('updates aria-pressed for critical alerts', async () => {
      const user = userEvent.setup();
      render(<AlertLevelCycling initialLevel="green" />);
      
      const alertElement = screen.getByRole('button');
      
      // Initially not pressed (green/yellow)
      expect(alertElement).toHaveAttribute('aria-pressed', 'false');
      
      // Navigate to red level
      await user.click(alertElement); // green → yellow
      await user.click(alertElement); // yellow → red
      
      // Red level should be "pressed" state
      expect(alertElement).toHaveAttribute('aria-pressed', 'true');
    });

    test('provides meaningful tooltips with operational context', () => {
      render(<AlertLevelCycling initialLevel="yellow" />);
      
      const alertElement = screen.getByRole('button');
      const title = alertElement.getAttribute('title');
      expect(title).toContain('ELEVATED ALERT');
      expect(title).toContain('potential threats detected');
      expect(title).toContain('Click to cycle');
    });

    test('is focusable and keyboard navigable', () => {
      render(<AlertLevelCycling initialLevel="green" />);
      
      const alertElement = screen.getByRole('button');
      expect(alertElement).toHaveAttribute('tabIndex', '0');
      
      alertElement.focus();
      expect(alertElement).toHaveFocus();
    });
  });

  describe('Props Validation', () => {
    test('handles invalid initial level gracefully', () => {
      // @ts-ignore - Testing runtime behavior
      render(<AlertLevelCycling initialLevel="invalid" />);
      
      const alertElement = screen.getByRole('button');
      // Should default to green or handle gracefully
      expect(alertElement).toBeInTheDocument();
    });

    test('works without optional props', () => {
      render(<AlertLevelCycling />);
      
      const alertElement = screen.getByRole('button');
      expect(alertElement).toBeInTheDocument();
      expect(alertElement).toHaveAttribute('data-level', 'green');
    });

    test('applies custom className', () => {
      render(<AlertLevelCycling className="custom-alert-class" />);
      
      const alertElement = screen.getByRole('button');
      expect(alertElement).toHaveClass('custom-alert-class');
    });
  });

  describe('Operational Context', () => {
    test('provides tactical threat level information', () => {
      render(<AlertLevelCycling initialLevel="red" />);
      
      const alertElement = screen.getByRole('button');
      expect(alertElement.getAttribute('title')).toContain('CRITICAL THREAT');
      expect(alertElement.getAttribute('aria-label')).toContain('CRITICAL THREAT');
    });

    test('maintains operational readiness awareness', async () => {
      const user = userEvent.setup();
      render(<AlertLevelCycling initialLevel="green" />);
      
      const alertElement = screen.getByRole('button');
      
      // Each level should provide operational context
      expect(alertElement.getAttribute('title')).toContain('routine monitoring');
      
      await user.click(alertElement);
      expect(alertElement.getAttribute('title')).toContain('potential threats');
      
      await user.click(alertElement);
      expect(alertElement.getAttribute('title')).toContain('active threat');
    });
  });

  describe('Performance', () => {
    test('handles rapid level changes efficiently', async () => {
      const user = userEvent.setup();
      render(<AlertLevelCycling initialLevel="green" />);
      
      const alertElement = screen.getByRole('button');
      
      // Rapid clicks should work smoothly
      await user.click(alertElement);
      await user.click(alertElement);
      await user.click(alertElement);
      
      // Should cycle back to green
      expect(alertElement).toHaveAttribute('data-level', 'green');
      expect(alertElement).toBeInTheDocument();
    });
  });
});
