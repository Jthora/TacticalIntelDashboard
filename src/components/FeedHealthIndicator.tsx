import React from 'react';

import { FeedHealthService, FeedHealthStatus } from '../services/FeedHealthService';

interface FeedHealthIndicatorProps {
  feedId: string;
  showDetails?: boolean;
}

const FeedHealthIndicator: React.FC<FeedHealthIndicatorProps> = ({ 
  feedId, 
  showDetails = false 
}) => {
  const healthStatus = FeedHealthService.getFeedHealth(feedId);

  if (!healthStatus) {
    return (
      <div className="feed-health-indicator unknown" title="Health status unknown">
        <span className="health-dot">●</span>
        {showDetails && <span className="health-text">Unknown</span>}
      </div>
    );
  }

  const getStatusColor = (status: FeedHealthStatus['status']) => {
    switch (status) {
      case 'healthy': return '#22c55e'; // green
      case 'warning': return '#f59e0b'; // yellow
      case 'error': return '#ef4444';   // red
      default: return '#6b7280';        // gray
    }
  };

  const getStatusText = (status: FeedHealthStatus['status']) => {
    switch (status) {
      case 'healthy': return 'Healthy';
      case 'warning': return 'Warning';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(1)}%`;
  };

  const formatResponseTime = (responseTime: number | null) => {
    if (!responseTime) return 'N/A';
    return responseTime < 1000 ? `${responseTime}ms` : `${(responseTime / 1000).toFixed(1)}s`;
  };

  const formatLastChecked = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div 
      className={`feed-health-indicator ${healthStatus.status}`}
      title={`Health: ${getStatusText(healthStatus.status)} | Uptime: ${formatUptime(healthStatus.uptime)} | Response: ${formatResponseTime(healthStatus.responseTime)} | Last checked: ${formatLastChecked(healthStatus.lastChecked)}`}
    >
      <span 
        className="health-dot" 
        style={{ color: getStatusColor(healthStatus.status) }}
      >
        ●
      </span>
      
      {showDetails && (
        <div className="health-details">
          <span className="health-text">{getStatusText(healthStatus.status)}</span>
          <span className="health-uptime">{formatUptime(healthStatus.uptime)}</span>
          {healthStatus.responseTime && (
            <span className="health-response-time">
              {formatResponseTime(healthStatus.responseTime)}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedHealthIndicator;
