import React, { useState, useEffect, useCallback, useRef } from 'react';

// Type definitions for export configuration
interface ExportData {
  timestamp: Date;
  data: any[];
}

interface ExportConfig {
  enabled: boolean;
  interval: number;
  format: 'json' | 'csv' | 'xml';
  lastExportTime: Date | null;
  exportCount: number;
  nextExportTime?: Date;
}

interface ExportOptions {
  format: 'json' | 'csv' | 'xml';
  filename: string;
}

interface AutoExportSchedulerProps {
  onExportChange?: (enabled: boolean, config: ExportConfig) => void;
  onExportExecute?: (data: ExportData, options: ExportOptions) => Promise<boolean>;
  onExportError?: (error: Error) => void;
  initialEnabled?: boolean;
  disabled?: boolean;
  className?: string;
  exportInterval?: number; // in seconds
  exportFormat?: 'json' | 'csv' | 'xml';
  exportData?: ExportData;
}

const AutoExportScheduler: React.FC<AutoExportSchedulerProps> = ({
  onExportChange,
  onExportExecute,
  onExportError,
  initialEnabled = false,
  disabled = false,
  className = '',
  exportInterval = 3600, // 1 hour default
  exportFormat = 'json',
  exportData
}) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(initialEnabled);
  const [lastExportTime, setLastExportTime] = useState<Date | null>(null);
  const [exportCount, setExportCount] = useState<number>(0);
  const [timeUntilNextExport, setTimeUntilNextExport] = useState<number>(0);
  
  // Use refs to store timeout IDs and intervals
  const exportTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate export filename with timestamp
  const generateExportFilename = useCallback((): string => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `export_${timestamp}.${exportFormat}`;
  }, [exportFormat]);

  // Perform the actual export operation
  const performAutomatedExport = useCallback(async (): Promise<void> => {
    try {
      if (!exportData || !onExportExecute) {
        console.warn('No export data or execute handler provided');
        return;
      }

      const filename = generateExportFilename();
      const options: ExportOptions = {
        format: exportFormat,
        filename
      };

      await onExportExecute(exportData, options);
      
      const now = new Date();
      setLastExportTime(now);
      setExportCount(prev => prev + 1);

      // Notify about successful export
      if (onExportChange) {
        const config: ExportConfig = {
          enabled: isEnabled,
          interval: exportInterval,
          format: exportFormat,
          lastExportTime: now,
          exportCount: exportCount + 1,
          nextExportTime: new Date(now.getTime() + exportInterval * 1000)
        };
        onExportChange(isEnabled, config);
      }
    } catch (error) {
      console.error('Auto-export failed:', error);
      if (onExportError) {
        onExportError(error as Error);
      }
    }
  }, [exportData, onExportExecute, exportFormat, generateExportFilename, isEnabled, exportInterval, exportCount, onExportChange, onExportError]);

  // Schedule the next export
  const scheduleNextExport = useCallback((): void => {
    if (exportTimeoutRef.current) {
      try {
        clearTimeout(exportTimeoutRef.current);
      } catch (error) {
        // Handle cases where clearTimeout is not available (e.g., fake timers)
        console.debug('clearTimeout not available:', error);
      }
    }

    exportTimeoutRef.current = setTimeout(() => {
      performAutomatedExport();
      // Only reschedule if still enabled
      if (isEnabled) {
        scheduleNextExport();
      }
    }, exportInterval * 1000);

    // Start countdown timer
    setTimeUntilNextExport(exportInterval);
  }, [exportInterval, performAutomatedExport, isEnabled]);

  // Cancel scheduled export
  const cancelScheduledExport = useCallback((): void => {
    if (exportTimeoutRef.current) {
      try {
        clearTimeout(exportTimeoutRef.current);
      } catch (error) {
        // Handle cases where clearTimeout is not available (e.g., fake timers)
        console.debug('clearTimeout not available:', error);
      }
      exportTimeoutRef.current = null;
    }
    if (timerIntervalRef.current) {
      try {
        clearInterval(timerIntervalRef.current);
      } catch (error) {
        // Handle cases where clearInterval is not available (e.g., fake timers)
        console.debug('clearInterval not available:', error);
      }
      timerIntervalRef.current = null;
    }
    setTimeUntilNextExport(0);
  }, []);

  // Handle toggle of auto-export - SIMPLIFIED
  const handleToggle = useCallback((): void => {
    if (disabled) return;

    setIsEnabled(prev => {
      const newState = !prev;

      // Call callback with error handling
      if (onExportChange) {
        try {
          const config: ExportConfig = {
            enabled: newState,
            interval: exportInterval,
            format: exportFormat,
            lastExportTime,
            exportCount,
            nextExportTime: newState ? new Date(Date.now() + exportInterval * 1000) : undefined
          };
          onExportChange(newState, config);
        } catch (error) {
          console.warn('Error in export change callback:', error);
        }
      }

      return newState;
    });
  }, [disabled, exportInterval, exportFormat, lastExportTime, exportCount, onExportChange]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLButtonElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  }, [handleToggle]);

  // Update countdown timer
  useEffect(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (isEnabled && timeUntilNextExport > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeUntilNextExport(prev => {
          if (prev <= 1) {
            return exportInterval; // Reset timer for next cycle
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [isEnabled, exportInterval]);

  // Handle enable/disable state changes
  useEffect(() => {
    if (isEnabled) {
      setTimeUntilNextExport(exportInterval);
      scheduleNextExport();
    } else {
      setTimeUntilNextExport(0);
      cancelScheduledExport();
    }
  }, [isEnabled, exportInterval, scheduleNextExport, cancelScheduledExport]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelScheduledExport();
    };
  }, [cancelScheduledExport]);

  // Format time for display (MM:SS)
  const formatTimeUntilNextExport = (): string => {
    const minutes = Math.floor(timeUntilNextExport / 60);
    const seconds = timeUntilNextExport % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Generate title text
  const titleText = `Auto-Export: ${isEnabled ? 'ON' : 'OFF'} (${Math.floor(exportInterval / 60)}min)`;

  return (
    <div 
      className={`auto-export-scheduler ${className}`.trim()}
      data-testid="auto-export-scheduler"
    >
      <button
        className={`export-btn ${isEnabled ? 'active' : 'inactive'}`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        title={titleText}
        aria-label={`Toggle auto-export scheduler - currently ${isEnabled ? 'enabled' : 'disabled'}`}
        aria-pressed={isEnabled}
        type="button"
      >
        <span className="export-icon">
          {isEnabled ? '📤' : '📁'}
        </span>
      </button>
      {isEnabled && timeUntilNextExport > 0 && (
        <span 
          className="export-timer"
          data-testid="export-timer"
        >
          {formatTimeUntilNextExport()}
        </span>
      )}
    </div>
  );
};

export default AutoExportScheduler;
