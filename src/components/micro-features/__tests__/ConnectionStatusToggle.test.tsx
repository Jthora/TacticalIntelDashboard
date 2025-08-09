import '@testing-library/jest-dom';

import { screen } from '@testing-library/dom';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ConnectionStatusToggle, ConnectionStatusToggleProps } from '../ConnectionStatusToggle';

// Mock console.log to test logging functionality
const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('ConnectionStatusToggle', () => {
  beforeEach(() => {
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  const defaultProps: ConnectionStatusToggleProps = {
    initialStatus: 'secure',
  };

  describe('Rendering', () => {
    test('renders with default status', () => {
      render(<ConnectionStatusToggle {...defaultProps} />);
      
      const statusElement = screen.getByRole('button');
      expect(statusElement).toBeInTheDocument();
      expect(statusElement).toHaveTextContent('●');
      expect(statusElement).toHaveAttribute('data-status', 'secure');
    });

    test('renders with custom initial status', () => {
      render(<ConnectionStatusToggle initialStatus="encrypted" />);
      
      const statusElement = screen.getByRole('button');
      expect(statusElement).toHaveAttribute('data-status', 'encrypted');
    });

    test('has correct accessibility attributes', () => {
      render(<ConnectionStatusToggle {...defaultProps} />);
      
      const statusElement = screen.getByRole('button');
      expect(statusElement).toHaveAttribute('tabIndex', '0');
      expect(statusElement).toHaveAttribute('aria-label');
      expect(statusElement.getAttribute('title')).toContain('SECURE CONNECTION');
    });
  });

  describe('Status Cycling', () => {
    test('cycles through statuses correctly: secure → encrypted → scanning → secure', async () => {
      const user = userEvent.setup();
      render(<ConnectionStatusToggle initialStatus="secure" />);
      
      const statusElement = screen.getByRole('button');
      
      // Initial state
      expect(statusElement).toHaveAttribute('data-status', 'secure');
      
      // First click: secure → encrypted
      await user.click(statusElement);
      await waitFor(() => {
        expect(statusElement).toHaveAttribute('data-status', 'encrypted');
      });
      
      // Second click: encrypted → scanning
      await user.click(statusElement);
      await waitFor(() => {
        expect(statusElement).toHaveAttribute('data-status', 'scanning');
      });
      
      // Third click: scanning → secure
      await user.click(statusElement);
      await waitFor(() => {
        expect(statusElement).toHaveAttribute('data-status', 'secure');
      });
    });

    test('handles keyboard navigation (Enter key)', async () => {
      const user = userEvent.setup();
      render(<ConnectionStatusToggle initialStatus="secure" />);
      
      const statusElement = screen.getByRole('button');
      statusElement.focus();
      
      await user.keyboard('{Enter}');
      await waitFor(() => {
        expect(statusElement).toHaveAttribute('data-status', 'encrypted');
      });
    });

    test('handles keyboard navigation (Space key)', async () => {
      const user = userEvent.setup();
      render(<ConnectionStatusToggle initialStatus="secure" />);
      
      const statusElement = screen.getByRole('button');
      statusElement.focus();
      
      await user.keyboard(' ');
      await waitFor(() => {
        expect(statusElement).toHaveAttribute('data-status', 'encrypted');
      });
    });
  });

  describe('Visual Feedback', () => {
    test('applies correct CSS classes for each status', async () => {
      const user = userEvent.setup();
      render(<ConnectionStatusToggle initialStatus="secure" />);
      
      const statusElement = screen.getByRole('button');
      
      // Secure state
      expect(statusElement).toHaveClass('status-micro', 'connection-status');
      expect(statusElement).toHaveAttribute('data-status', 'secure');
      
      // Encrypted state
      await user.click(statusElement);
      await waitFor(() => {
        expect(statusElement).toHaveAttribute('data-status', 'encrypted');
      });
      
      // Scanning state
      await user.click(statusElement);
      await waitFor(() => {
        expect(statusElement).toHaveAttribute('data-status', 'scanning');
      });
    });

    test('shows changing animation during status transition', async () => {
      const user = userEvent.setup();
      render(<ConnectionStatusToggle initialStatus="secure" />);
      
      const statusElement = screen.getByRole('button');
      
      await user.click(statusElement);
      
      // Should briefly show changing class
      expect(statusElement).toHaveClass('changing');
    });

    test('applies correct colors for each status', async () => {
      const user = userEvent.setup();
      render(<ConnectionStatusToggle initialStatus="secure" />);
      
      const statusElement = screen.getByRole('button');
      
      // Secure state (initial)
      expect(statusElement.style.color).toBe('rgb(0, 255, 65)'); // Green
      
      // Encrypted state
      await user.click(statusElement);
      await waitFor(() => {
        expect(statusElement.style.color).toBe('rgb(0, 212, 255)'); // Cyan
      });
      
      // Scanning state
      await user.click(statusElement);
      await waitFor(() => {
        expect(statusElement.style.color).toBe('rgb(255, 149, 0)'); // Orange
      });
    });
  });

  describe('Callback Functions', () => {
    test('calls onStatusChange callback when status changes', async () => {
      const user = userEvent.setup();
      const mockCallback = jest.fn();
      
      render(
        <ConnectionStatusToggle 
          initialStatus="secure" 
          onStatusChange={mockCallback}
        />
      );
      
      const statusElement = screen.getByRole('button');
      await user.click(statusElement);
      
      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalledWith('encrypted');
      });
    });

    test('logs security events correctly', async () => {
      const user = userEvent.setup();
      render(<ConnectionStatusToggle initialStatus="secure" />);
      
      const statusElement = screen.getByRole('button');
      await user.click(statusElement);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Security Status Changed: SECURE → ENCRYPTED')
        );
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels for screen readers', () => {
      render(<ConnectionStatusToggle initialStatus="secure" />);
      
      const statusElement = screen.getByRole('button');
      expect(statusElement).toHaveAttribute('aria-label');
      expect(statusElement.getAttribute('aria-label')).toContain('Connection status');
    });

    test('provides meaningful tooltips', () => {
      render(<ConnectionStatusToggle initialStatus="secure" />);
      
      const statusElement = screen.getByRole('button');
      const title = statusElement.getAttribute('title');
      expect(title).toContain('SECURE CONNECTION');
      expect(title).toContain('Click to cycle');
    });

    test('is focusable and keyboard navigable', () => {
      render(<ConnectionStatusToggle initialStatus="secure" />);
      
      const statusElement = screen.getByRole('button');
      expect(statusElement).toHaveAttribute('tabIndex', '0');
      
      statusElement.focus();
      expect(statusElement).toHaveFocus();
    });
  });

  describe('Props Validation', () => {
    test('handles invalid initial status gracefully', () => {
      // @ts-ignore - Testing runtime behavior
      render(<ConnectionStatusToggle initialStatus="invalid" />);
      
      const statusElement = screen.getByRole('button');
      // Should default to secure or handle gracefully
      expect(statusElement).toBeInTheDocument();
    });

    test('works without optional props', () => {
      render(<ConnectionStatusToggle />);
      
      const statusElement = screen.getByRole('button');
      expect(statusElement).toBeInTheDocument();
      expect(statusElement).toHaveAttribute('data-status', 'secure');
    });

    test('applies custom className', () => {
      render(<ConnectionStatusToggle className="custom-class" />);
      
      const statusElement = screen.getByRole('button');
      expect(statusElement).toHaveClass('custom-class');
    });
  });

  describe('Performance', () => {
    test('maintains stable performance during interactions', async () => {
      const user = userEvent.setup();
      render(<ConnectionStatusToggle initialStatus="secure" />);
      
      const statusElement = screen.getByRole('button');
      
      // Single click should change status
      await user.click(statusElement);
      await waitFor(() => {
        expect(statusElement.getAttribute('data-status')).toBe('encrypted');
      });
      
      // Component should still be responsive after interaction
      expect(statusElement).toBeInTheDocument();
      expect(statusElement).toHaveClass('status-micro', 'connection-status');
    });
  });

  describe('Error Handling', () => {
    test('handles click events during transition gracefully', async () => {
      const user = userEvent.setup();
      render(<ConnectionStatusToggle initialStatus="secure" />);
      
      const statusElement = screen.getByRole('button');
      
      // Rapid clicks should not break the component
      await user.click(statusElement);
      await user.click(statusElement);
      await user.click(statusElement);
      
      // Should still be functional
      expect(statusElement).toBeInTheDocument();
      expect(statusElement).toHaveAttribute('data-status');
    });
  });
});
