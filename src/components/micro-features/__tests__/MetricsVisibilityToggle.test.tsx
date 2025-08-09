import '@testing-library/jest-dom';

import { fireEvent,render, screen } from '@testing-library/react';

import MetricsVisibilityToggle from '../MetricsVisibilityToggle';

// Mock data for testing
const mockSources = [
  { id: '1', name: 'Source Alpha', isOnline: true, status: 'active', lastUpdate: new Date().toISOString() },
  { id: '2', name: 'Source Beta', isOnline: false, status: 'inactive', lastUpdate: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: '3', name: 'Source Gamma', isOnline: true, status: 'error', lastUpdate: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  { id: '4', name: 'Source Delta', isOnline: true, status: 'active', lastUpdate: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
];

const mockOnMetricsToggle = jest.fn();

describe('MetricsVisibilityToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Basic Rendering Tests
  describe('Basic Rendering', () => {
    it('renders metrics toggle button', () => {
      render(
        <MetricsVisibilityToggle 
          sources={mockSources}
          onMetricsToggle={mockOnMetricsToggle}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('displays metrics icon when visible', () => {
      render(
        <MetricsVisibilityToggle 
          sources={mockSources}
          onMetricsToggle={mockOnMetricsToggle}
          initialVisible={true}
        />
      );
      
      expect(screen.getByText('📊')).toBeInTheDocument();
    });

    it('displays hidden icon when hidden', () => {
      render(
        <MetricsVisibilityToggle 
          sources={mockSources}
          onMetricsToggle={mockOnMetricsToggle}
          initialVisible={false}
        />
      );
      
      expect(screen.getByText('📋')).toBeInTheDocument();
    });

    it('has correct default title attribute', () => {
      render(
        <MetricsVisibilityToggle 
          sources={mockSources}
          onMetricsToggle={mockOnMetricsToggle}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Metrics: Visible');
    });

    it('applies default CSS classes', () => {
      render(
        <MetricsVisibilityToggle 
          sources={mockSources}
          onMetricsToggle={mockOnMetricsToggle}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('metrics-btn', 'visible');
      
      const icon = screen.getByText('📊');
      expect(icon).toHaveClass('metrics-icon');
    });
  });

  // State Management Tests
  describe('State Management', () => {
    it('toggles to hidden state when clicked', () => {
      render(
        <MetricsVisibilityToggle 
          sources={mockSources}
          onMetricsToggle={mockOnMetricsToggle}
          initialVisible={true}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(button).toHaveClass('metrics-btn', 'hidden');
      expect(button).toHaveAttribute('title', 'Metrics: Hidden');
      expect(screen.getByText('📋')).toBeInTheDocument();
    });

    it('toggles to visible state when clicked twice', () => {
      render(
        <MetricsVisibilityToggle 
          sources={mockSources}
          onMetricsToggle={mockOnMetricsToggle}
          initialVisible={true}
        />
      );
      
      const button = screen.getByRole('button');
      
      // First click - hide
      fireEvent.click(button);
      expect(button).toHaveClass('metrics-btn', 'hidden');
      
      // Second click - show
      fireEvent.click(button);
      expect(button).toHaveClass('metrics-btn', 'visible');
      expect(button).toHaveAttribute('title', 'Metrics: Visible');
    });

    it('maintains state across multiple toggles', () => {
      render(
        <MetricsVisibilityToggle 
          sources={mockSources}
          onMetricsToggle={mockOnMetricsToggle}
        />
      );
      
      const button = screen.getByRole('button');
      
      // Multiple toggles
      fireEvent.click(button); // hidden
      fireEvent.click(button); // visible
      fireEvent.click(button); // hidden
      
      expect(button).toHaveClass('metrics-btn', 'hidden');
      expect(screen.getByText('📋')).toBeInTheDocument();
    });

    it('starts with correct initial state', () => {
      const { rerender } = render(
        <MetricsVisibilityToggle 
          sources={mockSources}
          onMetricsToggle={mockOnMetricsToggle}
          initialVisible={false}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('metrics-btn', 'hidden');
      
      rerender(
        <MetricsVisibilityToggle 
          sources={mockSources}
          onMetricsToggle={mockOnMetricsToggle}
          initialVisible={true}
        />
      );
      
      expect(button).toHaveClass('metrics-btn', 'visible');
    });
  });

  // Metrics Panel Tests
  describe('Metrics Panel Display', () => {
    it('shows metrics panel when visible', () => {
      render(
        <MetricsVisibilityToggle 
          sources={mockSources}
          onMetricsToggle={mockOnMetricsToggle}
          initialVisible={true}
        />
      );
      
      expect(screen.getByText('Total:')).toBeInTheDocument();
      expect(screen.getByText('Active:')).toBeInTheDocument();
      expect(screen.getByText('Errors:')).toBeInTheDocument();
    });

    it('hides metrics panel when hidden', () => {
      render(
        <MetricsVisibilityToggle 
          sources={mockSources}
          onMetricsToggle={mockOnMetricsToggle}
          initialVisible={false}
        />
      );
      
      expect(screen.queryByText('Total:')).not.toBeInTheDocument();
      expect(screen.queryByText('Active:')).not.toBeInTheDocument();
      expect(screen.queryByText('Errors:')).not.toBeInTheDocument();
    });

    it('shows correct metric calculations', () => {
      render(
        <MetricsVisibilityToggle 
          sources={mockSources}
          onMetricsToggle={mockOnMetricsToggle}
          initialVisible={true}
        />
      );
      
      // Total sources: 4
      expect(screen.getByTestId('total-sources')).toHaveTextContent('4');
      
      // Active sources: 2 (Alpha and Delta are online and active)
      expect(screen.getByTestId('active-sources')).toHaveTextContent('2');
      
      // Error sources: 1 (Gamma has error status)
      expect(screen.getByTestId('error-sources')).toHaveTextContent('1');
    });

    it('updates metrics when sources change', () => {
      const { rerender } = render(
        <MetricsVisibilityToggle 
          sources={mockSources}
          onMetricsToggle={mockOnMetricsToggle}
          initialVisible={true}
        />
      );
      
      expect(screen.getByTestId('total-sources')).toHaveTextContent('4');
      
      const newSources = [...mockSources, {
        id: '5', 
        name: 'Source Echo', 
        isOnline: true, 
        status: 'active', 
        lastUpdate: new Date().toISOString()
      }];
      
      rerender(
        <MetricsVisibilityToggle 
          sources={newSources}
          onMetricsToggle={mockOnMetricsToggle}
          initialVisible={true}
        />
      );
      
      expect(screen.getByTestId('total-sources')).toHaveTextContent('5');
    });

    it('shows metrics panel with slide-in animation class', () => {
      render(
        <MetricsVisibilityToggle 
          sources={mockSources}
          onMetricsToggle={mockOnMetricsToggle}
          initialVisible={true}
        />
      );
      
      const panel = screen.getByText('Total:').closest('.metrics-panel');
      expect(panel).toHaveClass('slide-in');
    });
  });

  // Callback Integration Tests
  describe('Callback Integration', () => {
    it('calls onMetricsToggle when toggled', () => {
      render(
        <MetricsVisibilityToggle 
          sources={mockSources}
          onMetricsToggle={mockOnMetricsToggle}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnMetricsToggle).toHaveBeenCalledTimes(1);
      expect(mockOnMetricsToggle).toHaveBeenCalledWith(false);
    });

    it('calls onMetricsToggle with correct visibility state', () => {
      render(
        <MetricsVisibilityToggle 
          sources={mockSources}
          onMetricsToggle={mockOnMetricsToggle}
          initialVisible={false}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnMetricsToggle).toHaveBeenCalledWith(true);
    });

    it('calls onMetricsToggle multiple times for multiple toggles', () => {
      render(
        <MetricsVisibilityToggle 
          sources={mockSources}
          onMetricsToggle={mockOnMetricsToggle}
        />
      );
      
      const button = screen.getByRole('button');
      
      fireEvent.click(button);
      expect(mockOnMetricsToggle).toHaveBeenNthCalledWith(1, false);
      
      fireEvent.click(button);
      expect(mockOnMetricsToggle).toHaveBeenNthCalledWith(2, true);
      
      fireEvent.click(button);
      expect(mockOnMetricsToggle).toHaveBeenNthCalledWith(3, false);
      
      expect(mockOnMetricsToggle).toHaveBeenCalledTimes(3);
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('has proper button role', () => {
      render(
        <MetricsVisibilityToggle 
          sources={mockSources}
          onMetricsToggle={mockOnMetricsToggle}
        />
      );
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('has descriptive title attributes', () => {
      render(
        <MetricsVisibilityToggle 
          sources={mockSources}
          onMetricsToggle={mockOnMetricsToggle}
          initialVisible={true}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Metrics: Visible');
      
      fireEvent.click(button);
      expect(button).toHaveAttribute('title', 'Metrics: Hidden');
    });

    it('is keyboard accessible', () => {
      render(
        <MetricsVisibilityToggle 
          sources={mockSources}
          onMetricsToggle={mockOnMetricsToggle}
        />
      );
      
      const button = screen.getByRole('button');
      
      // Focus and activate with keyboard
      button.focus();
      fireEvent.keyDown(button, { key: 'Enter' });
      
      expect(mockOnMetricsToggle).toHaveBeenCalledTimes(1);
    });

    it('maintains focus after toggle', () => {
      render(
        <MetricsVisibilityToggle 
          sources={mockSources}
          onMetricsToggle={mockOnMetricsToggle}
        />
      );
      
      const button = screen.getByRole('button');
      button.focus();
      fireEvent.click(button);
      
      expect(document.activeElement).toBe(button);
    });

    it('has appropriate aria attributes', () => {
      render(
        <MetricsVisibilityToggle 
          sources={mockSources}
          onMetricsToggle={mockOnMetricsToggle}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label');
      expect(button).toHaveAttribute('aria-pressed');
    });
  });

  // Props Validation Tests
  describe('Props Validation', () => {
    it('handles missing onMetricsToggle callback gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      render(
        <MetricsVisibilityToggle 
          sources={mockSources}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Should not crash, but may log error
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('handles empty sources array', () => {
      render(
        <MetricsVisibilityToggle 
          sources={[]}
          onMetricsToggle={mockOnMetricsToggle}
          initialVisible={true}
        />
      );
      
      expect(screen.getByTestId('total-sources')).toHaveTextContent('0');
    });

    it('handles malformed source data', () => {
      const malformedSources = [
        { id: '1', name: 'Source Alpha' }, // missing required fields
        { id: '2', isOnline: true }, // missing name
        null, // null source
        undefined, // undefined source
      ] as any; // Type assertion for malformed test data
      
      render(
        <MetricsVisibilityToggle 
          sources={malformedSources}
          onMetricsToggle={mockOnMetricsToggle}
          initialVisible={true}
        />
      );
      
      // Should handle gracefully without crashing
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('handles undefined sources prop', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      render(
        <MetricsVisibilityToggle 
          onMetricsToggle={mockOnMetricsToggle}
        />
      );
      
      expect(screen.getByRole('button')).toBeInTheDocument();
      consoleSpy.mockRestore();
    });
  });

  // Edge Cases Tests
  describe('Edge Cases', () => {
    it('handles rapid successive clicks', () => {
      render(
        <MetricsVisibilityToggle 
          sources={mockSources}
          onMetricsToggle={mockOnMetricsToggle}
        />
      );
      
      const button = screen.getByRole('button');
      
      // Rapid clicks
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(mockOnMetricsToggle).toHaveBeenCalledTimes(5);
      // Should end up in hidden state (odd number of clicks)
      expect(button).toHaveClass('metrics-btn', 'hidden');
    });

    it('handles very large source arrays', () => {
      const largeSources = Array.from({ length: 1000 }, (_, i) => ({
        id: `source-${i}`,
        name: `Source ${i}`,
        isOnline: i % 2 === 0,
        status: i % 10 === 0 ? 'error' : 'active',
        lastUpdate: new Date(Date.now() - i * 1000).toISOString()
      }));
      
      render(
        <MetricsVisibilityToggle 
          sources={largeSources}
          onMetricsToggle={mockOnMetricsToggle}
          initialVisible={true}
        />
      );
      
      expect(screen.getByTestId('total-sources')).toHaveTextContent('1000');
    });

    it('handles sources with invalid date formats', () => {
      const sourcesWithBadDates = [
        { id: '1', name: 'Source Alpha', isOnline: true, status: 'active', lastUpdate: 'invalid-date' },
        { id: '2', name: 'Source Beta', isOnline: true, status: 'active', lastUpdate: null },
        { id: '3', name: 'Source Gamma', isOnline: true, status: 'active', lastUpdate: undefined },
      ] as any; // Type assertion for malformed test data
      
      render(
        <MetricsVisibilityToggle 
          sources={sourcesWithBadDates}
          onMetricsToggle={mockOnMetricsToggle}
          initialVisible={true}
        />
      );
      
      // Should handle gracefully without crashing
      expect(screen.getByTestId('total-sources')).toHaveTextContent('3');
    });

    it('handles async onMetricsToggle callback', async () => {
      const asyncToggleCallback = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      
      render(
        <MetricsVisibilityToggle 
          sources={mockSources}
          onMetricsToggle={asyncToggleCallback}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(asyncToggleCallback).toHaveBeenCalledTimes(1);
      
      // Should continue to work for subsequent calls
      fireEvent.click(button);
      expect(asyncToggleCallback).toHaveBeenCalledTimes(2);
    });
  });

  // Performance Tests
  describe('Performance', () => {
    it('only calculates metrics when visible', () => {
      const { rerender } = render(
        <MetricsVisibilityToggle 
          sources={mockSources}
          onMetricsToggle={mockOnMetricsToggle}
          initialVisible={false}
        />
      );
      
      // Metrics should not be calculated when hidden
      expect(screen.queryByText('Total:')).not.toBeInTheDocument();
      
      rerender(
        <MetricsVisibilityToggle 
          sources={mockSources}
          onMetricsToggle={mockOnMetricsToggle}
          initialVisible={true}
        />
      );
      
      // Metrics should be calculated when visible
      expect(screen.getByText('Total:')).toBeInTheDocument();
    });

    it('memoizes metrics calculations', () => {
      const { rerender } = render(
        <MetricsVisibilityToggle 
          sources={mockSources}
          onMetricsToggle={mockOnMetricsToggle}
          initialVisible={true}
        />
      );
      
      const originalTotal = screen.getByTestId('total-sources');
      
      // Re-render with same sources should not recalculate
      rerender(
        <MetricsVisibilityToggle 
          sources={mockSources}
          onMetricsToggle={mockOnMetricsToggle}
          initialVisible={true}
        />
      );
      
      expect(screen.getByTestId('total-sources')).toBe(originalTotal);
    });
  });

  // Integration Tests
  describe('Integration', () => {
    it('works with different callback functions', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      const { rerender } = render(
        <MetricsVisibilityToggle 
          sources={mockSources}
          onMetricsToggle={callback1}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(callback1).toHaveBeenCalledTimes(1);
      
      // Change callback
      rerender(
        <MetricsVisibilityToggle 
          sources={mockSources}
          onMetricsToggle={callback2}
        />
      );
      
      fireEvent.click(button);
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(callback1).toHaveBeenCalledTimes(1); // Should not be called again
    });

    it('maintains visibility state when sources change', () => {
      const { rerender } = render(
        <MetricsVisibilityToggle 
          sources={mockSources}
          onMetricsToggle={mockOnMetricsToggle}
          initialVisible={true}
        />
      );
      
      const button = screen.getByRole('button');
      
      // Hide metrics
      fireEvent.click(button);
      expect(button).toHaveClass('metrics-btn', 'hidden');
      
      // Change sources
      const newSources = [...mockSources, { 
        id: '5', 
        name: 'Source Echo', 
        isOnline: true, 
        status: 'active', 
        lastUpdate: new Date().toISOString()
      }];
      
      rerender(
        <MetricsVisibilityToggle 
          sources={newSources}
          onMetricsToggle={mockOnMetricsToggle}
          initialVisible={true}
        />
      );
      
      // Should remain hidden
      expect(button).toHaveClass('metrics-btn', 'hidden');
    });
  });
});
