import React, { useCallback,useEffect, useMemo, useState } from 'react';

import { useOptimizedTimer, usePerformanceMonitor } from '../hooks/usePerformanceOptimization';
import { FeedHealthMetrics,FeedHealthService } from '../services/FeedHealthService';

const HealthDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<FeedHealthMetrics | null>(null);
  const { isLowPowerMode } = usePerformanceMonitor();

  const updateMetrics = useCallback(() => {
    const healthMetrics = FeedHealthService.getFeedHealthMetrics();
    setMetrics(healthMetrics);
  }, []);

  // Initial load
  useEffect(() => {
    updateMetrics();
  }, [updateMetrics]);

  // Optimized refresh timer
  useOptimizedTimer(
    updateMetrics,
    'health',
    'healthDashboard_refresh',
    [updateMetrics]
  );

  const healthStatus = useMemo(() => {
    if (!metrics) return { status: 'unknown', color: '#6b7280' };
    
    const healthyPercentage = (metrics.healthyFeeds / metrics.totalFeeds) * 100;
    if (healthyPercentage >= 90) return { status: 'healthy', color: '#22c55e' };
    if (healthyPercentage >= 70) return { status: 'warning', color: '#f59e0b' };
    return { status: 'critical', color: '#ef4444' };
  }, [metrics]);

  const formatResponseTime = useCallback((ms: number) => {
    return ms < 1000 ? `${ms.toFixed(0)}ms` : `${(ms / 1000).toFixed(1)}s`;
  }, []);

  if (!metrics) {
    return (
      <div className={`health-dashboard loading ${isLowPowerMode ? 'low-power' : ''}`}>
        <div className="health-title">System Health</div>
        <div className="loading-indicator">
          {isLowPowerMode ? '🔋 Loading...' : 'Loading...'}
        </div>
      </div>
    );
  }

  return (
    <div className="health-dashboard">
      <div className="health-header">
        <h3 className="health-title">System Health</h3>
        <div 
          className={`health-status ${healthStatus.status}`}
          style={{ color: healthStatus.color }}
        >
          ● {healthStatus.status.toUpperCase()}
        </div>
      </div>

      <div className="health-metrics">
        <div className="metric-group">
          <div className="metric-item">
            <span className="metric-label">Total Feeds</span>
            <span className="metric-value">{metrics.totalFeeds}</span>
          </div>
          
          <div className="metric-item healthy">
            <span className="metric-label">Healthy</span>
            <span className="metric-value">{metrics.healthyFeeds}</span>
          </div>

          <div className="metric-item warning">
            <span className="metric-label">Warning</span>
            <span className="metric-value">{metrics.warningFeeds}</span>
          </div>

          <div className="metric-item error">
            <span className="metric-label">Error</span>
            <span className="metric-value">{metrics.errorFeeds}</span>
          </div>
        </div>

        <div className="metric-group">
          <div className="metric-item">
            <span className="metric-label">Avg Response</span>
            <span className="metric-value">{formatResponseTime(metrics.averageResponseTime)}</span>
          </div>

          <div className="metric-item">
            <span className="metric-label">Overall Uptime</span>
            <span className="metric-value">{metrics.overallUptime.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="health-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill healthy"
            style={{ width: `${(metrics.healthyFeeds / metrics.totalFeeds) * 100}%` }}
          />
          <div 
            className="progress-fill warning"
            style={{ 
              width: `${(metrics.warningFeeds / metrics.totalFeeds) * 100}%`,
              left: `${(metrics.healthyFeeds / metrics.totalFeeds) * 100}%`
            }}
          />
          <div 
            className="progress-fill error"
            style={{ 
              width: `${(metrics.errorFeeds / metrics.totalFeeds) * 100}%`,
              left: `${((metrics.healthyFeeds + metrics.warningFeeds) / metrics.totalFeeds) * 100}%`
            }}
          />
        </div>
      </div>

      <div className="health-footer">
        <small>Last updated: {new Date().toLocaleTimeString()}</small>
      </div>
    </div>
  );
};

export default HealthDashboard;
