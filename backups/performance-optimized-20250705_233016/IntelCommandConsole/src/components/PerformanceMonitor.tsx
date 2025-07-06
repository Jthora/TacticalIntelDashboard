import React, { useState, useEffect } from 'react';
import { usePerformanceMonitor } from '../hooks/usePerformanceOptimization';

const PerformanceMonitor: React.FC = () => {
  const { getMetrics, enableLowPowerMode, disableLowPowerMode, isLowPowerMode } = usePerformanceMonitor();
  const [metrics, setMetrics] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(getMetrics());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [getMetrics]);

  const formatMemory = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const getPerformanceStatus = () => {
    if (!metrics?.memory) return 'unknown';
    
    const usagePercent = (metrics.memory.usedJSHeapSize / metrics.memory.jsHeapSizeLimit) * 100;
    if (usagePercent > 85) return 'critical';
    if (usagePercent > 70) return 'warning';
    return 'good';
  };

  const performanceStatus = getPerformanceStatus();

  return (
    <div className="performance-monitor">
      <div className="performance-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="performance-icon">
          {isLowPowerMode ? '🔋' : performanceStatus === 'critical' ? '⚠️' : performanceStatus === 'warning' ? '⚡' : '💚'}
        </span>
        <span className="performance-title">Performance</span>
        <span className="performance-toggle">{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <div className="performance-details">
          <div className="performance-status">
            <div className={`status-indicator ${performanceStatus}`}>
              Status: {performanceStatus.toUpperCase()}
            </div>
            
            {isLowPowerMode && (
              <div className="low-power-indicator">
                🔋 Low Power Mode Active
              </div>
            )}
          </div>

          {metrics && (
            <div className="performance-metrics">
              <div className="metric-row">
                <span className="metric-label">Cache Size:</span>
                <span className="metric-value">{metrics.cacheSize} items</span>
              </div>
              
              <div className="metric-row">
                <span className="metric-label">Active Timers:</span>
                <span className="metric-value">{metrics.activeTimers}</span>
              </div>

              {metrics.memory && (
                <>
                  <div className="metric-row">
                    <span className="metric-label">Memory Used:</span>
                    <span className="metric-value">
                      {formatMemory(metrics.memory.usedJSHeapSize)}
                    </span>
                  </div>
                  
                  <div className="metric-row">
                    <span className="metric-label">Memory Limit:</span>
                    <span className="metric-value">
                      {formatMemory(metrics.memory.jsHeapSizeLimit)}
                    </span>
                  </div>

                  <div className="memory-bar">
                    <div 
                      className={`memory-fill ${performanceStatus}`}
                      style={{ 
                        width: `${(metrics.memory.usedJSHeapSize / metrics.memory.jsHeapSizeLimit) * 100}%` 
                      }}
                    />
                  </div>
                </>
              )}

              <div className="refresh-intervals">
                <div className="interval-info">
                  <span className="interval-label">Feed Refresh:</span>
                  <span className="interval-value">
                    {Math.round(metrics.config.refreshIntervals.feeds / 1000 / 60)}min
                  </span>
                </div>
                
                <div className="interval-info">
                  <span className="interval-label">Health Check:</span>
                  <span className="interval-value">
                    {Math.round(metrics.config.refreshIntervals.health / 1000)}s
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="performance-controls">
            {isLowPowerMode ? (
              <button 
                className="performance-button normal-mode"
                onClick={disableLowPowerMode}
              >
                ⚡ Enable Normal Mode
              </button>
            ) : (
              <button 
                className="performance-button low-power"
                onClick={enableLowPowerMode}
              >
                🔋 Enable Low Power Mode
              </button>
            )}
          </div>

          <div className="performance-tips">
            <div className="tip-title">💡 Performance Tips:</div>
            <ul className="tip-list">
              <li>Close unused browser tabs</li>
              <li>Use low power mode on battery</li>
              <li>Reduce visual effects if needed</li>
              {performanceStatus === 'critical' && (
                <li className="critical-tip">⚠️ Consider refreshing the page</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;
