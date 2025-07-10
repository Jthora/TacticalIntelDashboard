import React, { useState } from 'react';
import { log } from '../../utils/LoggerService';

export type ViewMode = 'list' | 'grid' | 'compact';

export interface ViewModeSwitcherProps {
  initialMode?: ViewMode;
  onModeChange?: (mode: ViewMode) => void;
  className?: string;
}

/**
 * Feature 04: View Mode Switcher
 * 
 * Enables instant layout transformation for intelligence sources in the left sidebar,
 * providing three distinct visualization modes optimized for different operational contexts.
 */
export const ViewModeSwitcher: React.FC<ViewModeSwitcherProps> = ({
  initialMode = 'list',
  onModeChange,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    // Validate initial mode and provide fallback
    const validModes: ViewMode[] = ['list', 'grid', 'compact'];
    return validModes.includes(initialMode) ? initialMode : 'list';
  });

  const modeConfig = {
    list: {
      icon: '☰',
      label: 'LIST',
      description: 'detailed analysis, source management'
    },
    grid: {
      icon: '▦',
      label: 'GRID',
      description: 'visual scanning, quick organization'
    },
    compact: {
      icon: '≡',
      label: 'COMPACT',
      description: 'maximum source count, overview operations'
    }
  };

  const cycleViewMode = () => {
    const modes: ViewMode[] = ['list', 'grid', 'compact'];
    const currentIndex = modes.indexOf(viewMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    
    setViewMode(nextMode);
    
    // Log operational change
    log.debug("Component", `🔄 View mode changed to: ${nextMode} - Optimized for ${modeConfig[nextMode].description}`);
    
    // Callback for parent component
    if (onModeChange) {
      onModeChange(nextMode);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      cycleViewMode();
    }
  };

  const getTooltipText = () => {
    const config = modeConfig[viewMode];
    return `View: ${config.label} - Optimized for ${config.description}`;
  };

  const getAriaLabel = () => {
    return `Switch view mode. Currently: ${viewMode}. Click to cycle through list, grid, and compact modes.`;
  };

  return (
    <div className="view-mode-switcher">
      <button 
        className={`view-btn ${viewMode} ${className}`}
        onClick={cycleViewMode}
        onKeyDown={handleKeyDown}
        title={getTooltipText()}
        role="button"
        tabIndex={0}
        aria-label={getAriaLabel()}
        data-mode={viewMode}
      >
        <span className="view-icon">
          {modeConfig[viewMode].icon}
        </span>
      </button>
    </div>
  );
};

export default ViewModeSwitcher;
