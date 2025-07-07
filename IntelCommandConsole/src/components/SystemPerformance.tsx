import React, { useState, useEffect } from 'react';
import { usePerformanceMonitor } from '../hooks/usePerformanceOptimization';

interface SystemInfo {
  // Real browser-accessible data
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  hardware: {
    cores: number;
    deviceMemory?: number;
  };
  network: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  };
  battery?: {
    level: number;
    charging: boolean;
  };
  performance: {
    cacheSize: number;
    activeTimers: number;
    isLowPowerMode: boolean;
  };
  // Application-level metrics (these are real)
  application: {
    refreshIntervals: {
      feeds: number;
      health: number;
      alerts: number;
    };
    uptime: number;
  };
}

const SystemPerformance: React.FC = () => {
  const { getMetrics, enableLowPowerMode, disableLowPowerMode, isLowPowerMode } = usePerformanceMonitor();
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [startTime] = useState(Date.now());

  const getSystemInfo = async (): Promise<SystemInfo> => {
    const metrics = getMetrics();
    
    // Real memory data from browser
    const memoryUsage = metrics.memory ? {
      used: metrics.memory.usedJSHeapSize,
      total: metrics.memory.jsHeapSizeLimit,
      percentage: Math.round((metrics.memory.usedJSHeapSize / metrics.memory.jsHeapSizeLimit) * 100)
    } : { used: 0, total: 0, percentage: 0 };

    // Real hardware data
    const hardware = {
      cores: navigator.hardwareConcurrency || 1,
      deviceMemory: (navigator as any).deviceMemory
    };

    // Real network data (when available)
    const connection = (navigator as any).connection;
    const network = connection ? {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt
    } : {};

    // Real battery data (when available)
    let battery = undefined;
    try {
      if ('getBattery' in navigator) {
        const batteryInfo = await (navigator as any).getBattery();
        battery = {
          level: Math.round(batteryInfo.level * 100),
          charging: batteryInfo.charging
        };
      }
    } catch (e) {
      // Battery API not supported
    }

    // Real application performance data
    const performance = {
      cacheSize: metrics.cacheSize,
      activeTimers: metrics.activeTimers,
      isLowPowerMode: metrics.isLowPowerMode
    };

    const application = {
      refreshIntervals: metrics.config.refreshIntervals,
      uptime: Date.now() - startTime
    };

    return {
      memoryUsage,
      hardware,
      network,
      battery,
      performance,
      application
    };
  };

  useEffect(() => {
    const updateSystemInfo = async () => {
      const info = await getSystemInfo();
      setSystemInfo(info);
    };

    updateSystemInfo();
    const interval = setInterval(updateSystemInfo, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [getMetrics, startTime]);

  const formatBytes = (bytes: number) => {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getPerformanceStatus = () => {
    if (!systemInfo) return 'unknown';
    const { memoryUsage } = systemInfo;
    
    if (memoryUsage.percentage > 85) return 'critical';
    if (memoryUsage.percentage > 70) return 'warning';
    return 'good';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return '🔴';
      case 'warning': return '🟡';
      case 'good': return '🟢';
      default: return '⚪';
    }
  };

  if (!systemInfo) {
    return (
      <div className="system-performance loading">
        <div className="perf-header">
          <span className="perf-icon">⚪</span>
          <span className="perf-title">System Performance</span>
        </div>
        <div className="loading-text">Loading system info...</div>
      </div>
    );
  }

  const status = getPerformanceStatus();

  return (
    <div className="system-performance">
      <div className="perf-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="perf-header-top">
          <span className="perf-icon">
            {isLowPowerMode ? '🔋' : getStatusIcon(status)}
          </span>
          <span className="perf-title">System Performance</span>
          <span className="perf-toggle">{isExpanded ? '▼' : '▶'}</span>
        </div>
        
        {/* Compact Stats in Header Banner */}
        <div className="perf-header-stats">
          <div className="header-stat">
            <span className="header-stat-icon">💾</span>
            <span className="header-stat-value">{systemInfo.memoryUsage.percentage}%</span>
          </div>
          <div className="header-stat">
            <span className="header-stat-icon">🖥️</span>
            <span className="header-stat-value">{systemInfo.hardware.cores}c</span>
          </div>
          {systemInfo.network.effectiveType && (
            <div className="header-stat">
              <span className="header-stat-icon">📡</span>
              <span className="header-stat-value">{systemInfo.network.effectiveType?.toUpperCase()}</span>
            </div>
          )}
          {systemInfo.battery && (
            <div className="header-stat">
              <span className="header-stat-icon">🔋</span>
              <span className="header-stat-value">{systemInfo.battery.level}%</span>
            </div>
          )}
          <div className="header-stat">
            <span className="header-stat-icon">⏱️</span>
            <span className="header-stat-value">{formatTime(systemInfo.application.uptime)}</span>
          </div>
          
          {/* Mini memory bar in header */}
          <div className="header-memory-bar">
            <div 
              className={`header-memory-fill ${status}`}
              style={{ width: `${systemInfo.memoryUsage.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="perf-details">
          {/* Memory Usage (Real) */}
          <div className="perf-section">
            <div className="section-title">💾 Browser Memory</div>
            <div className="metric-row">
              <span className="metric-label">JS Heap Used:</span>
              <span className="metric-value">{formatBytes(systemInfo.memoryUsage.used)}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">JS Heap Limit:</span>
              <span className="metric-value">{formatBytes(systemInfo.memoryUsage.total)}</span>
            </div>
            <div className="memory-bar">
              <div 
                className={`memory-fill ${status}`}
                style={{ width: `${systemInfo.memoryUsage.percentage}%` }}
              />
              <span className="memory-percentage">{systemInfo.memoryUsage.percentage}%</span>
            </div>
          </div>

          {/* Hardware Info (Real) */}
          <div className="perf-section">
            <div className="section-title">🖥️ Hardware</div>
            <div className="metric-row">
              <span className="metric-label">CPU Cores:</span>
              <span className="metric-value">{systemInfo.hardware.cores}</span>
            </div>
            {systemInfo.hardware.deviceMemory && (
              <div className="metric-row">
                <span className="metric-label">Device RAM:</span>
                <span className="metric-value">{systemInfo.hardware.deviceMemory} GB</span>
              </div>
            )}
          </div>

          {/* Network Info (Real when available) */}
          {systemInfo.network.effectiveType && (
            <div className="perf-section">
              <div className="section-title">🌐 Network</div>
              <div className="metric-row">
                <span className="metric-label">Connection:</span>
                <span className="metric-value">{systemInfo.network.effectiveType?.toUpperCase()}</span>
              </div>
              {systemInfo.network.downlink && (
                <div className="metric-row">
                  <span className="metric-label">Speed:</span>
                  <span className="metric-value">{systemInfo.network.downlink} Mbps</span>
                </div>
              )}
              {systemInfo.network.rtt && (
                <div className="metric-row">
                  <span className="metric-label">Latency:</span>
                  <span className="metric-value">{systemInfo.network.rtt} ms</span>
                </div>
              )}
            </div>
          )}

          {/* Battery Info (Real when available) */}
          {systemInfo.battery && (
            <div className="perf-section">
              <div className="section-title">🔋 Battery</div>
              <div className="metric-row">
                <span className="metric-label">Level:</span>
                <span className="metric-value">{systemInfo.battery.level}%</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Status:</span>
                <span className="metric-value">
                  {systemInfo.battery.charging ? '⚡ Charging' : '🔋 Discharging'}
                </span>
              </div>
            </div>
          )}

          {/* Application Performance (Real) */}
          <div className="perf-section">
            <div className="section-title">📱 Application</div>
            <div className="metric-row">
              <span className="metric-label">Cache Size:</span>
              <span className="metric-value">{systemInfo.performance.cacheSize} items</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Active Timers:</span>
              <span className="metric-value">{systemInfo.performance.activeTimers}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Uptime:</span>
              <span className="metric-value">{formatTime(systemInfo.application.uptime)}</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Feed Refresh:</span>
              <span className="metric-value">
                {Math.round(systemInfo.application.refreshIntervals.feeds / 1000 / 60)}min
              </span>
            </div>
          </div>

          {/* Performance Controls */}
          <div className="perf-controls">
            {isLowPowerMode ? (
              <button 
                className="perf-button normal-mode"
                onClick={disableLowPowerMode}
              >
                ⚡ Enable Normal Mode
              </button>
            ) : (
              <button 
                className="perf-button low-power"
                onClick={enableLowPowerMode}
              >
                🔋 Enable Low Power Mode
              </button>
            )}
          </div>

          {/* Status Explanation */}
          <div className="perf-note">
            <div className="note-title">ℹ️ Note:</div>
            <p>This shows real system data available to the browser. CPU/disk usage cannot be accessed due to security restrictions.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemPerformance;
