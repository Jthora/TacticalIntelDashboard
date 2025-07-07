import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import AutoExportScheduler from '../AutoExportScheduler';

// Mock data for testing
const mockOnExportChange = jest.fn();

const mockExportData = {
  timestamp: new Date(),
  data: [
    { id: 1, type: 'intelligence', source: 'SIGINT', content: 'Sample data 1' },
    { id: 2, type: 'threat', source: 'HUMINT', content: 'Sample data 2' },
  ]
};

describe('AutoExportScheduler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // Reset any global state
    localStorage.clear();
    // Ensure DOM is clean
    cleanup();
  });

  afterEach(() => {
    jest.useRealTimers();
    cleanup();
  });

  describe('Basic Rendering', () => {
    it('renders auto-export scheduler button', () => {
      render(<AutoExportScheduler onExportChange={mockOnExportChange} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('export-btn');
    });

    it('displays disabled state by default', () => {
      render(<AutoExportScheduler onExportChange={mockOnExportChange} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('inactive');
      expect(button).not.toHaveClass('active');
    });

    it('displays correct icon for disabled state', () => {
      render(<AutoExportScheduler onExportChange={mockOnExportChange} />);
      
      const icon = screen.getByText('📁');
      expect(icon).toBeInTheDocument();
    });

    it('applies default CSS classes', () => {
      render(<AutoExportScheduler onExportChange={mockOnExportChange} />);
      
      const container = screen.getByTestId('auto-export-scheduler');
      expect(container).toHaveClass('auto-export-scheduler');
    });

    it('does not show timer initially', () => {
      render(<AutoExportScheduler onExportChange={mockOnExportChange} />);
      
      const timer = screen.queryByText(/min|sec/);
      expect(timer).not.toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('toggles from disabled to enabled when clicked', async () => {
      render(<AutoExportScheduler onExportChange={mockOnExportChange} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(button).toHaveClass('active');
      expect(button).not.toHaveClass('inactive');
    });

    it('toggles back to disabled when clicked twice', async () => {
      render(<AutoExportScheduler onExportChange={mockOnExportChange} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(button).toHaveClass('inactive');
      expect(button).not.toHaveClass('active');
    });

    it('maintains state across multiple toggles', async () => {
      render(<AutoExportScheduler onExportChange={mockOnExportChange} />);
      
      const button = screen.getByRole('button');
      
      // Start disabled
      expect(button).toHaveClass('inactive');
      
      // Enable
      fireEvent.click(button);
      expect(button).toHaveClass('active');
      
      // Disable
      fireEvent.click(button);
      expect(button).toHaveClass('inactive');
      
      // Enable again
      fireEvent.click(button);
      expect(button).toHaveClass('active');
    });

    it('starts with custom initial state when provided', () => {
      render(
        <AutoExportScheduler 
          onExportChange={mockOnExportChange} 
          initialEnabled={true}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('active');
    });

    it('respects disabled state', async () => {
      render(<AutoExportScheduler onExportChange={mockOnExportChange} disabled={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      
      fireEvent.click(button);
      expect(button).toHaveClass('inactive'); // Should not change
    });
  });

  describe('Visual States and CSS Classes', () => {
    it('applies active styles correctly', async () => {
      render(<AutoExportScheduler onExportChange={mockOnExportChange} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(button).toHaveClass('export-btn', 'active');
    });

    it('applies inactive styles correctly', () => {
      render(<AutoExportScheduler onExportChange={mockOnExportChange} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('export-btn', 'inactive');
    });

    it('updates CSS classes when state changes', async () => {
      render(<AutoExportScheduler onExportChange={mockOnExportChange} />);
      
      const button = screen.getByRole('button');
      
      // Initial state
      expect(button).toHaveClass('inactive');
      expect(button).not.toHaveClass('active');
      
      // After clicking
      fireEvent.click(button);
      expect(button).toHaveClass('active');
      expect(button).not.toHaveClass('inactive');
    });

    it('applies disabled styles correctly', () => {
      render(<AutoExportScheduler onExportChange={mockOnExportChange} disabled={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('disabled');
    });

    it('shows timer when enabled', async () => {
      render(<AutoExportScheduler onExportChange={mockOnExportChange} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        const timer = screen.getByTestId('export-timer');
        expect(timer).toBeInTheDocument();
        expect(timer).toHaveClass('export-timer');
      });
    });

    it('does not show timer when disabled', async () => {
      render(<AutoExportScheduler onExportChange={mockOnExportChange} initialEnabled={true} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button); // Disable
      
      const timer = screen.queryByTestId('export-timer');
      expect(timer).not.toBeInTheDocument();
    });
  });

  describe('Export Scheduling', () => {
    it('schedules export when enabled', async () => {
      render(
        <AutoExportScheduler 
          onExportChange={mockOnExportChange} 
          exportInterval={60} // 1 minute
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnExportChange).toHaveBeenCalledWith(
        true,
        expect.objectContaining({
          enabled: true,
          interval: 60,
          format: 'json'
        })
      );
    });

    it('cancels export when disabled', async () => {
      render(
        <AutoExportScheduler 
          onExportChange={mockOnExportChange} 
          initialEnabled={true}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button); // Disable
      
      expect(mockOnExportChange).toHaveBeenCalledWith(
        false,
        expect.objectContaining({
          enabled: false
        })
      );
    });

    it('triggers export after specified interval', async () => {
      const mockOnExportExecute = jest.fn();
      
      render(
        <AutoExportScheduler 
          onExportChange={mockOnExportChange} 
          exportInterval={5} // 5 seconds
          exportData={mockExportData}
          onExportExecute={mockOnExportExecute}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      await waitFor(() => {
        expect(mockOnExportExecute).toHaveBeenCalledWith(
          mockExportData,
          expect.objectContaining({
            format: 'json',
            filename: expect.stringMatching(/export_.*\.json/)
          })
        );
      });
    });

    it('uses custom export interval', async () => {
      render(
        <AutoExportScheduler 
          onExportChange={mockOnExportChange} 
          exportInterval={120} // 2 minutes
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', expect.stringContaining('2min'));
    });

    it('handles different export formats', async () => {
      render(
        <AutoExportScheduler 
          onExportChange={mockOnExportChange} 
          exportFormat="csv"
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnExportChange).toHaveBeenCalledWith(
        true,
        expect.objectContaining({
          format: 'csv'
        })
      );
    });
  });

  describe('Timer Display', () => {
    it('displays time until next export', async () => {
      render(
        <AutoExportScheduler 
          onExportChange={mockOnExportChange} 
          exportInterval={300} // 5 minutes
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        const timer = screen.getByTestId('export-timer');
        expect(timer.textContent).toMatch(/\d+:\d+/); // MM:SS format
      });
    });    it('updates timer countdown', async () => {
      render(
        <AutoExportScheduler 
          onExportChange={mockOnExportChange} 
          exportInterval={60} // 1 minute
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const timer = screen.getByTestId('export-timer');
        expect(timer).toBeInTheDocument();
        expect(timer.textContent).toMatch(/\d+:\d{2}/); // Should show timer format (e.g., "1:00", "0:59", etc.)
      });
    });

    it('resets timer after export', async () => {
      render(
        <AutoExportScheduler 
          onExportChange={mockOnExportChange} 
          exportInterval={30} // 30 seconds
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Wait for first export
      act(() => {
        jest.advanceTimersByTime(30000);
      });
      
      await waitFor(() => {
        const timer = screen.getByTestId('export-timer');
        expect(timer.textContent).toMatch(/0:3\d/); // Should reset to ~30 seconds
      });
    });
  });

  describe('Callback Integration', () => {
    it('calls onExportChange when state is toggled', async () => {
      render(<AutoExportScheduler onExportChange={mockOnExportChange} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnExportChange).toHaveBeenCalledTimes(1);
      expect(mockOnExportChange).toHaveBeenCalledWith(
        true,
        expect.objectContaining({
          enabled: true,
          interval: expect.any(Number),
          format: expect.any(String)
        })
      );
    });

    it('calls onExportChange with correct sequence', async () => {
      render(<AutoExportScheduler onExportChange={mockOnExportChange} />);
      
      const button = screen.getByRole('button');
      
      // Enable
      fireEvent.click(button);
      expect(mockOnExportChange).toHaveBeenLastCalledWith(true, expect.any(Object));
      
      // Disable
      fireEvent.click(button);
      expect(mockOnExportChange).toHaveBeenLastCalledWith(false, expect.any(Object));
    });

    it('calls callbacks multiple times for multiple toggles', async () => {
      render(<AutoExportScheduler onExportChange={mockOnExportChange} />);
      
      const button = screen.getByRole('button');
      
      fireEvent.click(button); // Enable
      fireEvent.click(button); // Disable
      fireEvent.click(button); // Enable again
      
      expect(mockOnExportChange).toHaveBeenCalledTimes(3);
    });

    it('provides complete export configuration in callback', async () => {
      render(
        <AutoExportScheduler 
          onExportChange={mockOnExportChange}
          exportInterval={1800}
          exportFormat="xml"
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnExportChange).toHaveBeenCalledWith(
        true,
        expect.objectContaining({
          enabled: true,
          interval: 1800,
          format: 'xml',
          lastExportTime: null,
          exportCount: 0
        })
      );
    });
  });

  describe('Export Execution', () => {
    it('performs export with provided data', async () => {
      const exportSpy = jest.fn();
      render(
        <AutoExportScheduler 
          onExportChange={mockOnExportChange}
          exportData={mockExportData}
          onExportExecute={exportSpy}
          exportInterval={5}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      await waitFor(() => {
        expect(exportSpy).toHaveBeenCalledWith(
          mockExportData,
          expect.objectContaining({
            format: 'json',
            filename: expect.stringMatching(/export_.*\.json/)
          })
        );
      });
    });

    it('handles export errors gracefully', async () => {
      const errorSpy = jest.fn();
      const failingExportSpy = jest.fn().mockRejectedValue(new Error('Export failed'));
      
      render(
        <AutoExportScheduler 
          onExportChange={mockOnExportChange}
          exportData={mockExportData}
          onExportExecute={failingExportSpy}
          onExportError={errorSpy}
          exportInterval={5}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      await waitFor(() => {
        expect(failingExportSpy).toHaveBeenCalledWith(
          mockExportData,
          expect.objectContaining({
            format: 'json'
          })
        );
      });
      
      await waitFor(() => {
        expect(errorSpy).toHaveBeenCalledWith(expect.any(Error));
      });
    });

    it('continues scheduling after successful export', async () => {
      const exportSpy = jest.fn().mockResolvedValue(true);
      render(
        <AutoExportScheduler 
          onExportChange={mockOnExportChange}
          exportData={mockExportData}
          onExportExecute={exportSpy}
          exportInterval={10}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // First export
      act(() => {
        jest.advanceTimersByTime(10000);
      });
      
      await waitFor(() => {
        expect(exportSpy).toHaveBeenCalledTimes(1);
      });
      
      // Second export
      act(() => {
        jest.advanceTimersByTime(10000);
      });
      
      await waitFor(() => {
        expect(exportSpy).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper button role', () => {
      render(<AutoExportScheduler onExportChange={mockOnExportChange} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('has descriptive title attributes for both states', async () => {
      render(<AutoExportScheduler onExportChange={mockOnExportChange} exportInterval={3600} />);
      
      const button = screen.getByRole('button');
      
      // Disabled state
      expect(button).toHaveAttribute('title', 'Auto-Export: OFF (60min)');
      
      // Enabled state
      fireEvent.click(button);
      expect(button).toHaveAttribute('title', 'Auto-Export: ON (60min)');
    });

    it('is keyboard accessible', async () => {
      render(<AutoExportScheduler onExportChange={mockOnExportChange} />);
      
      const button = screen.getByRole('button');
      button.focus();
      
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      
      expect(button).toHaveClass('active');
    });

    it('maintains focus after state change', async () => {
      render(<AutoExportScheduler onExportChange={mockOnExportChange} />);
      
      const button = screen.getByRole('button');
      button.focus();
      
      fireEvent.click(button);
      
      expect(button).toHaveFocus();
    });

    it('has appropriate aria attributes', () => {
      render(<AutoExportScheduler onExportChange={mockOnExportChange} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', expect.stringContaining('auto-export'));
    });

    it('supports aria-pressed for toggle state', async () => {
      render(<AutoExportScheduler onExportChange={mockOnExportChange} />);
      
      const button = screen.getByRole('button');
      
      // Initially disabled
      expect(button).toHaveAttribute('aria-pressed', 'false');
      
      // After enabling
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Props Validation', () => {
    it('handles missing onExportChange callback gracefully', () => {
      expect(() => {
        render(<AutoExportScheduler />);
      }).not.toThrow();
    });

    it('handles invalid initial state gracefully', () => {
      render(<AutoExportScheduler onExportChange={mockOnExportChange} initialEnabled={undefined} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('inactive'); // Should default to disabled
    });

    it('handles rapid successive clicks without errors', async () => {
      render(<AutoExportScheduler onExportChange={mockOnExportChange} />);
      
      const button = screen.getByRole('button');
      
      // Rapid clicks
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(mockOnExportChange).toHaveBeenCalledTimes(3);
    });

    it('handles custom className prop', () => {
      render(<AutoExportScheduler onExportChange={mockOnExportChange} className="custom-class" />);
      
      const container = screen.getByTestId('auto-export-scheduler');
      expect(container).toHaveClass('auto-export-scheduler', 'custom-class');
    });

    it('handles custom export intervals', () => {
      render(<AutoExportScheduler onExportChange={mockOnExportChange} exportInterval={7200} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', expect.stringContaining('120min'));
    });
  });

  describe('Edge Cases', () => {
    it('handles async onExportChange callback', async () => {
      const asyncCallback = jest.fn().mockResolvedValue(true);
      
      render(<AutoExportScheduler onExportChange={asyncCallback} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(asyncCallback).toHaveBeenCalled();
      });
    });

    it('handles error in onExportChange callback gracefully', () => {
      const errorCallback = jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      
      expect(() => {
        render(<AutoExportScheduler onExportChange={errorCallback} />);
        const button = screen.getByRole('button');
        fireEvent.click(button);
      }).not.toThrow();
    });

    it('handles component unmounting during operation', () => {
      const { unmount } = render(<AutoExportScheduler onExportChange={mockOnExportChange} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(() => unmount()).not.toThrow();
    });

    it('cleans up timers on unmount', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      
      const { unmount } = render(<AutoExportScheduler onExportChange={mockOnExportChange} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      unmount();
      
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });

  describe('Integration', () => {
    it('works with different export formats', async () => {
      const formats: Array<'json' | 'csv' | 'xml'> = ['json', 'csv', 'xml'];
      
      for (const format of formats) {
        const { unmount } = render(
          <AutoExportScheduler 
            onExportChange={mockOnExportChange} 
            exportFormat={format}
            key={format}
          />
        );
        
        const button = screen.getByRole('button');
        fireEvent.click(button);
        
        expect(mockOnExportChange).toHaveBeenCalledWith(
          true,
          expect.objectContaining({
            format: format
          })
        );
        
        // Clean up for next iteration
        mockOnExportChange.mockClear();
        unmount();
      }
    });

    it('maintains export state when props change', async () => {
      const { rerender } = render(
        <AutoExportScheduler 
          onExportChange={mockOnExportChange} 
          exportInterval={60}
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(button).toHaveClass('active');
      
      // Change props but keep enabled state
      rerender(
        <AutoExportScheduler 
          onExportChange={mockOnExportChange} 
          exportInterval={120}
        />
      );
      
      expect(button).toHaveClass('active');
    });

    it('provides complete export status in callbacks', async () => {
      render(
        <AutoExportScheduler 
          onExportChange={mockOnExportChange}
          exportInterval={1800}
          exportFormat="csv"
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnExportChange).toHaveBeenCalledWith(
        true,
        expect.objectContaining({
          enabled: true,
          interval: 1800,
          format: 'csv',
          lastExportTime: null,
          exportCount: 0,
          nextExportTime: expect.any(Date)
        })
      );
    });
  });
});
