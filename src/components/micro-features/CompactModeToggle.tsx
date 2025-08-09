import React, { useCallback,useEffect, useState } from 'react';

// CSS Variables for different modes
const NORMAL_MODE_VARIABLES = {
  '--header-height': '24px',
  '--sidebar-width': '200px',
  '--font-size-base': '8px',
  '--spacing-unit': '2px'
};

const COMPACT_MODE_VARIABLES = {
  '--header-height': '16px',
  '--sidebar-width': '120px',
  '--font-size-base': '6px',
  '--spacing-unit': '1px'
};

interface CompactModeConfig {
  cssVariables: Record<string, string>;
  documentClass: string;
}

interface CompactModeToggleProps {
  onCompactModeChange?: (isCompact: boolean, config: CompactModeConfig) => void;
  initialCompactMode?: boolean;
  disabled?: boolean;
  showLabel?: boolean;
  className?: string;
  persistPreference?: boolean;
}

const CompactModeToggle: React.FC<CompactModeToggleProps> = ({
  onCompactModeChange,
  initialCompactMode = false,
  disabled = false,
  showLabel = false,
  className = '',
  persistPreference = false
}) => {
  // Load from localStorage if persistence is enabled
  const getInitialMode = useCallback(() => {
    if (persistPreference) {
      try {
        const saved = localStorage.getItem('tactical-compact-mode');
        if (saved !== null) {
          return saved === 'true';
        }
      } catch (error) {
        // Handle localStorage errors gracefully
        console.warn('Failed to load compact mode preference:', error);
      }
    }
    return typeof initialCompactMode === 'boolean' ? initialCompactMode : false;
  }, [initialCompactMode, persistPreference]);

  const [isCompact, setIsCompact] = useState<boolean>(getInitialMode);

  // Save to localStorage when mode changes
  useEffect(() => {
    if (persistPreference) {
      try {
        localStorage.setItem('tactical-compact-mode', isCompact.toString());
      } catch (error) {
        console.warn('Failed to save compact mode preference:', error);
      }
    }
  }, [isCompact, persistPreference]);

  // Handle mode change
  const handleModeChange = useCallback(() => {
    if (disabled) return;

    const newMode = !isCompact;
    setIsCompact(newMode);

    // Prepare configuration
    const config: CompactModeConfig = {
      cssVariables: newMode ? COMPACT_MODE_VARIABLES : NORMAL_MODE_VARIABLES,
      documentClass: newMode ? 'compact-mode' : ''
    };

    // Call callback with error handling
    if (onCompactModeChange) {
      try {
        onCompactModeChange(newMode, config);
      } catch (error) {
        console.warn('Error in compact mode change callback:', error);
      }
    }
  }, [isCompact, disabled, onCompactModeChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleModeChange();
    }
  }, [handleModeChange]);

  return (
    <div className={`compact-toggle ${className}`.trim()}>
      <button
        type="button"
        className={`compact-btn ${isCompact ? 'active' : 'inactive'}`}
        onClick={handleModeChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        title={`Compact Mode: ${isCompact ? 'ON' : 'OFF'}`}
        aria-pressed={isCompact}
      >
        <span className="compact-icon">
          {isCompact ? '⬛' : '⬜'}
        </span>
        {showLabel && <span className="compact-label">COMPACT</span>}
      </button>
    </div>
  );
};

export default CompactModeToggle;
