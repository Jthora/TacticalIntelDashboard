import React, { useState, useCallback } from 'react';
import './SettingsTooltip.css';

interface SettingsTooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

/**
 * Tooltip component for providing helpful information about settings
 */
const SettingsTooltip: React.FC<SettingsTooltipProps> = React.memo(({
  content,
  children,
  position = 'top',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  const handleMouseEnter = useCallback(() => {
    setIsVisible(true);
  }, []);
  
  const handleMouseLeave = useCallback(() => {
    setIsVisible(false);
  }, []);

  return (
    <div 
      className={`settings-tooltip-container ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div className={`settings-tooltip ${position}`}>
          <div className="tooltip-content">
            {content}
          </div>
        </div>
      )}
    </div>
  );
});

export default SettingsTooltip;
