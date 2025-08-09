import React, { useCallback,useEffect, useRef, useState } from 'react';

interface AutoRefreshControlProps {
  onRefresh?: () => void | Promise<void>;
  refreshInterval?: number;
}

const AutoRefreshControl: React.FC<AutoRefreshControlProps> = ({
  onRefresh,
  refreshInterval = 30
}) => {
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Validate and use safe refresh interval
  const safeInterval = refreshInterval > 0 ? refreshInterval : 30;
  
  // Clear interval helper
  const clearCurrentInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  
  // Start interval helper
  const startInterval = useCallback(() => {
    clearCurrentInterval();
    
    if (onRefresh && isActive) {
      intervalRef.current = setInterval(() => {
        try {
          onRefresh();
        } catch (error) {
          console.error('Auto-refresh callback error:', error);
        }
      }, safeInterval * 1000);
    }
  }, [onRefresh, isActive, safeInterval, clearCurrentInterval]);
  
  // Handle toggle
  const handleToggle = useCallback(() => {
    setIsActive(prev => !prev);
  }, []);
  
  // Effect to manage interval when state or props change
  useEffect(() => {
    if (isActive) {
      startInterval();
    } else {
      clearCurrentInterval();
    }
    
    // Cleanup on unmount or when dependencies change
    return clearCurrentInterval;
  }, [isActive, startInterval, clearCurrentInterval]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearCurrentInterval();
    };
  }, [clearCurrentInterval]);
  
  // Handle onRefresh callback validation
  useEffect(() => {
    if (!onRefresh && isActive) {
      console.error('AutoRefreshControl: onRefresh callback is required when active');
    }
  }, [onRefresh, isActive]);
  
  const buttonClass = `refresh-btn ${isActive ? 'active' : 'inactive'}`;
  const iconClass = `refresh-icon${isActive ? ' spinning' : ''}`;
  const title = `Auto-refresh: ${isActive ? 'ON' : 'OFF'} (${safeInterval}s)`;
  
  return (
    <button
      className={buttonClass}
      onClick={handleToggle}
      title={title}
      type="button"
    >
      <span className={iconClass}>⟲</span>
      {isActive && <span className="refresh-interval">{safeInterval}s</span>}
    </button>
  );
};

export default AutoRefreshControl;
