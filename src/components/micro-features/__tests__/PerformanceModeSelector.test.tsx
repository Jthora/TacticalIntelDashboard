import '@testing-library/jest-dom';

import { fireEvent,render, screen } from '@testing-library/react';

import PerformanceModeSelector from '../PerformanceModeSelector';

// Mock data for testing
const mockOnModeChange = jest.fn();
const mockOnSettingsApply = jest.fn();

describe('PerformanceModeSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Basic Rendering Tests
  describe('Basic Rendering', () => {
    it('renders performance mode selector button', () => {
      render(
        <PerformanceModeSelector 
          onModeChange={mockOnModeChange}
          onSettingsApply={mockOnSettingsApply}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('perf-btn');
    });

    it('displays normal mode by default', () => {
      render(
        <PerformanceModeSelector 
          onModeChange={mockOnModeChange}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('normal');
      expect(button).toHaveAttribute('title', 'Performance: NORMAL');
    });

    it('displays correct icon for normal mode', () => {
      render(
        <PerformanceModeSelector 
          onModeChange={mockOnModeChange}
        />
      );
      
      const icon = screen.getByText('⚡');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('perf-icon');
    });

    it('displays mode label correctly', () => {
      render(
        <PerformanceModeSelector 
          onModeChange={mockOnModeChange}
        />
      );
      
      const label = screen.getByText('NORMAL');
      expect(label).toBeInTheDocument();
      expect(label).toHaveClass('perf-label');
    });

    it('applies default CSS classes', () => {
      render(
        <PerformanceModeSelector 
          onModeChange={mockOnModeChange}
        />
      );
      
      const container = screen.getByTestId('performance-selector');
      expect(container).toHaveClass('performance-selector');
    });
  });

  // State Management Tests
  describe('State Management', () => {
    it('cycles from normal to turbo when clicked', () => {
      render(
        <PerformanceModeSelector 
          onModeChange={mockOnModeChange}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(button).toHaveClass('turbo');
      expect(button).toHaveAttribute('title', 'Performance: TURBO');
      expect(screen.getByText('🚀')).toBeInTheDocument();
      expect(screen.getByText('TURBO')).toBeInTheDocument();
    });

    it('cycles from turbo to eco when clicked twice', () => {
      render(
        <PerformanceModeSelector 
          onModeChange={mockOnModeChange}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button); // normal -> turbo
      fireEvent.click(button); // turbo -> eco
      
      expect(button).toHaveClass('eco');
      expect(button).toHaveAttribute('title', 'Performance: ECO');
      expect(screen.getByText('🌱')).toBeInTheDocument();
      expect(screen.getByText('ECO')).toBeInTheDocument();
    });

    it('cycles from eco back to normal when clicked three times', () => {
      render(
        <PerformanceModeSelector 
          onModeChange={mockOnModeChange}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button); // normal -> turbo
      fireEvent.click(button); // turbo -> eco
      fireEvent.click(button); // eco -> normal
      
      expect(button).toHaveClass('normal');
      expect(button).toHaveAttribute('title', 'Performance: NORMAL');
      expect(screen.getByText('⚡')).toBeInTheDocument();
      expect(screen.getByText('NORMAL')).toBeInTheDocument();
    });

    it('maintains state across multiple cycles', () => {
      render(
        <PerformanceModeSelector 
          onModeChange={mockOnModeChange}
        />
      );
      
      const button = screen.getByRole('button');
      
      // Complete cycle: normal -> turbo -> eco -> normal
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(button).toHaveClass('normal');
      
      // Another cycle
      fireEvent.click(button);
      expect(button).toHaveClass('turbo');
    });

    it('starts with custom initial mode when provided', () => {
      render(
        <PerformanceModeSelector 
          initialMode="eco"
          onModeChange={mockOnModeChange}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('eco');
      expect(screen.getByText('🌱')).toBeInTheDocument();
      expect(screen.getByText('ECO')).toBeInTheDocument();
    });
  });

  // Visual States and CSS Classes Tests
  describe('Visual States and CSS Classes', () => {
    it('applies eco mode styles correctly', () => {
      render(
        <PerformanceModeSelector 
          initialMode="eco"
          onModeChange={mockOnModeChange}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('perf-btn', 'eco');
      expect(screen.getByText('🌱')).toBeInTheDocument();
    });

    it('applies normal mode styles correctly', () => {
      render(
        <PerformanceModeSelector 
          initialMode="normal"
          onModeChange={mockOnModeChange}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('perf-btn', 'normal');
      expect(screen.getByText('⚡')).toBeInTheDocument();
    });

    it('applies turbo mode styles correctly', () => {
      render(
        <PerformanceModeSelector 
          initialMode="turbo"
          onModeChange={mockOnModeChange}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('perf-btn', 'turbo');
      expect(screen.getByText('🚀')).toBeInTheDocument();
    });

    it('updates CSS classes when mode changes', () => {
      render(
        <PerformanceModeSelector 
          onModeChange={mockOnModeChange}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('normal');
      
      fireEvent.click(button);
      expect(button).toHaveClass('turbo');
      expect(button).not.toHaveClass('normal');
    });
  });

  // Callback Integration Tests
  describe('Callback Integration', () => {
    it('calls onModeChange when mode is changed', () => {
      render(
        <PerformanceModeSelector 
          onModeChange={mockOnModeChange}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnModeChange).toHaveBeenCalledWith('turbo', expect.objectContaining({
        previousMode: 'normal',
        newMode: 'turbo',
        timestamp: expect.any(Number)
      }));
    });

    it('calls onModeChange with correct sequence of modes', () => {
      render(
        <PerformanceModeSelector 
          onModeChange={mockOnModeChange}
        />
      );
      
      const button = screen.getByRole('button');
      
      fireEvent.click(button); // normal -> turbo
      expect(mockOnModeChange).toHaveBeenCalledWith('turbo', expect.objectContaining({
        previousMode: 'normal',
        newMode: 'turbo'
      }));
      
      fireEvent.click(button); // turbo -> eco
      expect(mockOnModeChange).toHaveBeenCalledWith('eco', expect.objectContaining({
        previousMode: 'turbo',
        newMode: 'eco'
      }));
      
      fireEvent.click(button); // eco -> normal
      expect(mockOnModeChange).toHaveBeenCalledWith('normal', expect.objectContaining({
        previousMode: 'eco',
        newMode: 'normal'
      }));
      
      expect(mockOnModeChange).toHaveBeenCalledTimes(3);
    });

    it('calls onSettingsApply when settings are applied', () => {
      render(
        <PerformanceModeSelector 
          onModeChange={mockOnModeChange}
          onSettingsApply={mockOnSettingsApply}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnSettingsApply).toHaveBeenCalledWith('turbo', expect.objectContaining({
        refreshInterval: expect.any(Number),
        enableAnimations: expect.any(Boolean),
        fetchStrategy: expect.any(String),
        cacheSize: expect.any(Number),
        concurrentRequests: expect.any(Number),
        cpuThrottling: expect.any(Boolean)
      }));
    });

    it('calls callbacks multiple times for multiple mode changes', () => {
      render(
        <PerformanceModeSelector 
          onModeChange={mockOnModeChange}
          onSettingsApply={mockOnSettingsApply}
        />
      );
      
      const button = screen.getByRole('button');
      
      fireEvent.click(button); // Click 1
      fireEvent.click(button); // Click 2
      fireEvent.click(button); // Click 3
      
      expect(mockOnModeChange).toHaveBeenCalledTimes(3);
      expect(mockOnSettingsApply).toHaveBeenCalledTimes(3);
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('has proper button role', () => {
      render(
        <PerformanceModeSelector 
          onModeChange={mockOnModeChange}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('has descriptive title attributes for all modes', () => {
      render(
        <PerformanceModeSelector 
          onModeChange={mockOnModeChange}
        />
      );
      
      const button = screen.getByRole('button');
      
      // Normal mode (initial)
      expect(button).toHaveAttribute('title', 'Performance: NORMAL');
      
      // Turbo mode
      fireEvent.click(button);
      expect(button).toHaveAttribute('title', 'Performance: TURBO');
      
      // Eco mode
      fireEvent.click(button);
      expect(button).toHaveAttribute('title', 'Performance: ECO');
    });

    it('is keyboard accessible', () => {
      render(
        <PerformanceModeSelector 
          onModeChange={mockOnModeChange}
        />
      );
      
      const button = screen.getByRole('button');
      
      // Simulate keyboard interaction
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(mockOnModeChange).toHaveBeenCalledWith('turbo', expect.objectContaining({
        previousMode: 'normal',
        newMode: 'turbo'
      }));
      
      // Reset mock and test Space key
      mockOnModeChange.mockClear();
      fireEvent.keyDown(button, { key: ' ' });
      expect(mockOnModeChange).toHaveBeenCalledWith('eco', expect.objectContaining({
        previousMode: 'turbo',
        newMode: 'eco'
      }));
    });

    it('maintains focus after mode change', () => {
      render(
        <PerformanceModeSelector 
          onModeChange={mockOnModeChange}
        />
      );
      
      const button = screen.getByRole('button');
      button.focus();
      
      fireEvent.click(button);
      expect(document.activeElement).toBe(button);
    });

    it('has appropriate aria attributes', () => {
      render(
        <PerformanceModeSelector 
          onModeChange={mockOnModeChange}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', expect.stringContaining('Performance mode'));
    });
  });

  // Props Validation Tests
  describe('Props Validation', () => {
    it('handles missing onModeChange callback gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      render(<PerformanceModeSelector />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Should not crash and should still update visual state
      expect(button).toHaveClass('turbo');
      
      consoleSpy.mockRestore();
    });

    it('handles missing onSettingsApply callback gracefully', () => {
      render(
        <PerformanceModeSelector 
          onModeChange={mockOnModeChange}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Should not crash
      expect(button).toHaveClass('turbo');
      expect(mockOnModeChange).toHaveBeenCalled();
    });

    it('handles invalid initial mode gracefully', () => {
      render(
        <PerformanceModeSelector 
          initialMode={'invalid' as any}
          onModeChange={mockOnModeChange}
        />
      );
      
      // Should default to normal mode
      const button = screen.getByRole('button');
      expect(button).toHaveClass('normal');
      expect(screen.getByText('NORMAL')).toBeInTheDocument();
    });

    it('handles rapid successive clicks without errors', () => {
      render(
        <PerformanceModeSelector 
          onModeChange={mockOnModeChange}
        />
      );
      
      const button = screen.getByRole('button');
      
      // Rapid clicks
      for (let i = 0; i < 10; i++) {
        fireEvent.click(button);
      }
      
      // Should handle gracefully and end up in eco mode (10 % 3 = 1, so normal -> turbo)
      expect(button).toHaveClass('turbo');
      expect(mockOnModeChange).toHaveBeenCalledTimes(10);
    });
  });

  // Performance Settings Tests
  describe('Performance Settings', () => {
    it('returns correct settings for eco mode', () => {
      let appliedSettings: any = null;
      
      render(
        <PerformanceModeSelector 
          initialMode="normal"
          onModeChange={mockOnModeChange}
          onSettingsApply={(_mode: any, settings: any) => {
            appliedSettings = settings;
          }}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button); // normal -> turbo
      fireEvent.click(button); // turbo -> eco
      
      expect(appliedSettings).toEqual(expect.objectContaining({
        refreshInterval: 120,
        enableAnimations: false,
        fetchStrategy: 'lazy',
        cacheSize: 50,
        concurrentRequests: 2,
        cpuThrottling: true
      }));
    });

    it('returns correct settings for normal mode', () => {
      let appliedSettings: any = null;
      
      render(
        <PerformanceModeSelector 
          initialMode="eco"
          onModeChange={mockOnModeChange}
          onSettingsApply={(_mode: any, settings: any) => {
            appliedSettings = settings;
          }}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button); // eco -> normal
      
      expect(appliedSettings).toEqual(expect.objectContaining({
        refreshInterval: 60,
        enableAnimations: true,
        fetchStrategy: 'eager',
        cacheSize: 100,
        concurrentRequests: 5,
        cpuThrottling: false
      }));
    });

    it('returns correct settings for turbo mode', () => {
      let appliedSettings: any = null;
      
      render(
        <PerformanceModeSelector 
          initialMode="normal"
          onModeChange={mockOnModeChange}
          onSettingsApply={(_mode: any, settings: any) => {
            appliedSettings = settings;
          }}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button); // normal -> turbo
      
      expect(appliedSettings).toEqual(expect.objectContaining({
        refreshInterval: 15,
        enableAnimations: true,
        fetchStrategy: 'aggressive',
        cacheSize: 200,
        concurrentRequests: 10,
        cpuThrottling: false
      }));
    });
  });

  // Edge Cases Tests
  describe('Edge Cases', () => {
    it('handles async onModeChange callback', async () => {
      const asyncCallback = jest.fn().mockResolvedValue(undefined);
      
      render(
        <PerformanceModeSelector 
          onModeChange={asyncCallback}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(asyncCallback).toHaveBeenCalledWith('turbo', expect.objectContaining({
        previousMode: 'normal',
        newMode: 'turbo'
      }));
    });

    it('handles error in onModeChange callback gracefully', () => {
      const errorCallback = jest.fn().mockImplementation(() => {
        throw new Error('Callback error');
      });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <PerformanceModeSelector 
          onModeChange={errorCallback}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Should not crash
      expect(button).toHaveClass('turbo');
      
      consoleSpy.mockRestore();
    });

    it('handles simultaneous rapid mode changes', () => {
      render(
        <PerformanceModeSelector 
          onModeChange={mockOnModeChange}
        />
      );
      
      const button = screen.getByRole('button');
      
      // Simulate rapid simultaneous clicks
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      // Should handle gracefully
      expect(mockOnModeChange).toHaveBeenCalledTimes(3);
      expect(button).toHaveClass('normal'); // After 3 clicks: normal -> turbo -> eco -> normal
    });
  });

  // Integration Tests
  describe('Integration', () => {
    it('works with different callback functions', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      const { rerender } = render(
        <PerformanceModeSelector 
          onModeChange={callback1}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(callback1).toHaveBeenCalledWith('turbo', expect.objectContaining({
        previousMode: 'normal',
        newMode: 'turbo'
      }));
      
      // Re-render with different callback
      rerender(
        <PerformanceModeSelector 
          onModeChange={callback2}
        />
      );
      
      fireEvent.click(button);
      expect(callback2).toHaveBeenCalledWith('eco', expect.objectContaining({
        previousMode: 'turbo',
        newMode: 'eco'
      }));
    });

    it('maintains mode state when props change', () => {
      const { rerender } = render(
        <PerformanceModeSelector 
          onModeChange={mockOnModeChange}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button); // normal -> turbo
      
      expect(button).toHaveClass('turbo');
      
      // Re-render with different callback but same mode
      rerender(
        <PerformanceModeSelector 
          onModeChange={jest.fn()}
        />
      );
      
      expect(button).toHaveClass('turbo'); // Should maintain turbo mode
    });

    it('provides operational context in callbacks', () => {
      let capturedContext: any = null;
      
      render(
        <PerformanceModeSelector 
          onModeChange={(_mode: any, context: any) => {
            capturedContext = context;
          }}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(capturedContext).toEqual(expect.objectContaining({
        previousMode: 'normal',
        newMode: 'turbo',
        timestamp: expect.any(Number)
      }));
    });
  });
});
