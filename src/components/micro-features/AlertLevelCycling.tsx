import React, { useState } from 'react';

import { log } from '../../utils/LoggerService';

export interface AlertLevelCyclingProps {
  initialLevel?: 'green' | 'yellow' | 'red';
  onLevelChange?: (level: 'green' | 'yellow' | 'red') => void;
  className?: string;
}

/**
 * Feature 02: Alert Level Cycling
 * 
 * A tactical threat indicator that allows instant cycling through
 * alert readiness levels with visual feedback.
 */
export const AlertLevelCycling: React.FC<AlertLevelCyclingProps> = ({
  initialLevel = 'green',
  onLevelChange,
  className = ''
}) => {
  const [alertLevel, setAlertLevel] = useState<'green' | 'yellow' | 'red'>(initialLevel);

  const getAlertColor = (level: string) => {
    switch(level) {
      case 'green': return '#00ff41';
      case 'yellow': return '#ff9500';
      case 'red': return '#ff0040';
      default: return '#ffffff';
    }
  };

  const getAlertLabel = (level: string) => {
    switch(level) {
      case 'green': return 'NORMAL OPERATIONS';
      case 'yellow': return 'ELEVATED ALERT';
      case 'red': return 'CRITICAL THREAT';
      default: return 'UNKNOWN ALERT LEVEL';
    }
  };

  const getAlertDescription = (level: string) => {
    switch(level) {
      case 'green': return 'All systems nominal, routine monitoring active';
      case 'yellow': return 'Heightened awareness, potential threats detected';
      case 'red': return 'Immediate action required, active threat present';
      default: return 'Alert system status unknown';
    }
  };

  const toggleAlertLevel = () => {
    const levels = ['green', 'yellow', 'red'] as const;
    const currentIndex = levels.indexOf(alertLevel);
    const newLevel = levels[(currentIndex + 1) % levels.length];
    
    setAlertLevel(newLevel);
    
    // Callback for parent component
    onLevelChange?.(newLevel);
    
    // Log alert level change with operational context
    log.debug("Component", `🚨 Alert Level Changed: ${alertLevel.toUpperCase()} → ${newLevel.toUpperCase()}`);
    log.debug("Component", `📋 Operational Status: ${getAlertDescription(newLevel)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleAlertLevel();
    }
  };

  return (
    <div 
      className={`status-micro alert-level ${className}`}
      data-level={alertLevel}
      onClick={toggleAlertLevel}
      onKeyDown={handleKeyDown}
      style={{ color: getAlertColor(alertLevel) }}
      title={`${getAlertLabel(alertLevel)} - ${getAlertDescription(alertLevel)} - Click to cycle`}
      role="button"
      tabIndex={0}
      aria-label={`Alert level: ${getAlertLabel(alertLevel)}`}
      aria-pressed={alertLevel === 'red'}
    >
      ▲
    </div>
  );
};

export default AlertLevelCycling;
