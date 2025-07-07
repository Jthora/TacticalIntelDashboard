import React, { useState, useEffect } from 'react';
import { log } from '../../utils/LoggerService';

export interface RealTimeClockDisplayProps {
  format?: '12h' | '24h' | 'iso' | 'military';
  showSeconds?: boolean;
  showDate?: boolean;
  timezone?: string;
  updateInterval?: number;
  className?: string;
}

/**
 * Feature 03: Real-Time Clock Display
 * 
 * A mission-critical timing component that provides accurate real-time
 * display with multiple format options for tactical operations.
 */
export const RealTimeClockDisplay: React.FC<RealTimeClockDisplayProps> = ({
  format = '24h',
  showSeconds = true,
  showDate = false,
  timezone,
  updateInterval = 1000,
  className = ''
}) => {
  const [currentTime, setCurrentTime] = useState('');
  const [isActive, setIsActive] = useState(true);

  const formatTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
    };

    switch (format) {
      case '12h':
        return date.toLocaleTimeString('en-US', {
          ...options,
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
          ...(showSeconds && { second: '2-digit' })
        });
      
      case '24h':
        return date.toLocaleTimeString('en-US', {
          ...options,
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          ...(showSeconds && { second: '2-digit' })
        });
      
      case 'iso':
        return date.toISOString().substring(11, showSeconds ? 19 : 16);
      
      case 'military':
        const militaryTime = date.toLocaleTimeString('en-US', {
          ...options,
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          ...(showSeconds && { second: '2-digit' })
        }).replace(/:/g, '');
        return `${militaryTime}Z`;
      
      default:
        return date.toLocaleTimeString();
    }
  };

  const formatDisplay = () => {
    const now = new Date();
    let timeString = formatTime(now);
    
    if (showDate) {
      const dateString = now.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit'
      });
      timeString = `${dateString} ${timeString}`;
    }
    
    return timeString;
  };

  useEffect(() => {
    const updateTime = () => {
      if (isActive) {
        setCurrentTime(formatDisplay());
      }
    };

    updateTime(); // Initial time set
    const interval = setInterval(updateTime, updateInterval);
    
    return () => clearInterval(interval);
  }, [format, showSeconds, showDate, timezone, updateInterval, isActive]);

  // Pause/resume on click for operational flexibility
  const toggleActive = () => {
    setIsActive(!isActive);
    log.debug("Component", `⏰ Clock ${isActive ? 'paused' : 'resumed'} - Time: ${currentTime}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleActive();
    }
  };

  const getTooltipText = () => {
    const baseText = `System Time (${format.toUpperCase()})`;
    const statusText = isActive ? 'Real-time' : 'Paused';
    const actionText = 'Click to pause/resume';
    return `${baseText} - ${statusText} - ${actionText}`;
  };

  return (
    <div 
      className={`status-micro time-display ${!isActive ? 'paused' : ''} ${className}`}
      onClick={toggleActive}
      onKeyDown={handleKeyDown}
      title={getTooltipText()}
      role="button"
      tabIndex={0}
      aria-label={`Current time: ${currentTime}. Format: ${format}. Status: ${isActive ? 'running' : 'paused'}`}
      data-format={format}
      data-active={isActive}
    >
      {currentTime}
    </div>
  );
};

export default RealTimeClockDisplay;
