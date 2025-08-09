import React, { useCallback,useState } from 'react';

import { log } from '../../utils/LoggerService';

export type PerformanceMode = 'eco' | 'normal' | 'turbo';

export interface PerformanceSettings {
  refreshInterval: number;
  enableAnimations: boolean;
  fetchStrategy: 'lazy' | 'eager' | 'aggressive';
  cacheSize: number;
  concurrentRequests: number;
  cpuThrottling: boolean;
}

export interface PerformanceModeContext {
  previousMode: PerformanceMode;
  newMode: PerformanceMode;
  timestamp: number;
}

export interface PerformanceModeSelectorProps {
  initialMode?: PerformanceMode;
  onModeChange?: (mode: PerformanceMode, context?: PerformanceModeContext) => void;
  onSettingsApply?: (mode: PerformanceMode, settings: PerformanceSettings) => void;
}

const PerformanceModeSelector: React.FC<PerformanceModeSelectorProps> = ({
  initialMode = 'normal',
  onModeChange,
  onSettingsApply
}) => {
  // Validate initial mode
  const validModes: PerformanceMode[] = ['eco', 'normal', 'turbo'];
  const validInitialMode = validModes.includes(initialMode) ? initialMode : 'normal';
  
  const [performanceMode, setPerformanceMode] = useState<PerformanceMode>(validInitialMode);

  // Performance settings configuration
  const getPerformanceSettings = useCallback((mode: PerformanceMode): PerformanceSettings => {
    switch (mode) {
      case 'eco':
        return {
          refreshInterval: 120, // 2 minutes
          enableAnimations: false,
          fetchStrategy: 'lazy',
          cacheSize: 50,
          concurrentRequests: 2,
          cpuThrottling: true
        };
      
      case 'normal':
        return {
          refreshInterval: 60, // 1 minute
          enableAnimations: true,
          fetchStrategy: 'eager',
          cacheSize: 100,
          concurrentRequests: 5,
          cpuThrottling: false
        };
      
      case 'turbo':
        return {
          refreshInterval: 15, // 15 seconds
          enableAnimations: true,
          fetchStrategy: 'aggressive',
          cacheSize: 200,
          concurrentRequests: 10,
          cpuThrottling: false
        };
    }
  }, []);

  // Cycle through performance modes
  const cyclePerformanceMode = useCallback(() => {
    try {
      const modes: PerformanceMode[] = ['eco', 'normal', 'turbo'];
      const currentIndex = modes.indexOf(performanceMode);
      const nextMode = modes[(currentIndex + 1) % modes.length];
      
      const context: PerformanceModeContext = {
        previousMode: performanceMode,
        newMode: nextMode,
        timestamp: Date.now()
      };
      
      setPerformanceMode(nextMode);
      
      // Apply performance settings
      const settings = getPerformanceSettings(nextMode);
      if (onSettingsApply) {
        onSettingsApply(nextMode, settings);
      }
      
      // Notify parent component
      if (onModeChange) {
        onModeChange(nextMode, context);
      }
      
      log.debug("Component", `Performance mode changed: ${performanceMode} -> ${nextMode}`);
    } catch (error) {
      console.error('Performance mode change error:', error);
    }
  }, [performanceMode, onModeChange, onSettingsApply, getPerformanceSettings]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      cyclePerformanceMode();
    }
  }, [cyclePerformanceMode]);

  // Get mode-specific display properties
  const getModeProperties = useCallback((mode: PerformanceMode) => {
    switch (mode) {
      case 'eco':
        return {
          icon: '🌱',
          label: 'ECO',
          title: 'Performance: ECO'
        };
      case 'normal':
        return {
          icon: '⚡',
          label: 'NORMAL',
          title: 'Performance: NORMAL'
        };
      case 'turbo':
        return {
          icon: '🚀',
          label: 'TURBO',
          title: 'Performance: TURBO'
        };
    }
  }, []);

  const modeProps = getModeProperties(performanceMode);

  return (
    <div className="performance-selector" data-testid="performance-selector">
      <button
        className={`perf-btn ${performanceMode}`}
        onClick={cyclePerformanceMode}
        onKeyDown={handleKeyDown}
        title={modeProps.title}
        aria-label={`Performance mode selector. Current mode: ${modeProps.label}. Click to cycle through modes.`}
        type="button"
      >
        <span className="perf-icon">
          {modeProps.icon}
        </span>
      </button>
      <span className="perf-label">{modeProps.label}</span>
    </div>
  );
};

export default PerformanceModeSelector;
