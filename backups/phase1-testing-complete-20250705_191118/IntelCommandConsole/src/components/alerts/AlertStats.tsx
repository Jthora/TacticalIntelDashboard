import React from 'react';
import { AlertConfig } from '../../types/AlertTypes';
import './AlertStats.css';

interface AlertStatsProps {
  stats: {
    totalAlerts: number;
    activeAlerts: number;
    totalTriggers: number;
    triggersToday: number;
  };
  alerts: AlertConfig[];
}

const AlertStats: React.FC<AlertStatsProps> = ({ stats, alerts }) => {
  const getAlertsByPriority = () => {
    const priorityCounts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    alerts.forEach(alert => {
      if (alert.active) {
        priorityCounts[alert.priority]++;
      }
    });

    return priorityCounts;
  };

  const getTopTriggeredAlerts = () => {
    return alerts
      .filter(alert => alert.triggerCount > 0)
      .sort((a, b) => b.triggerCount - a.triggerCount)
      .slice(0, 5);
  };

  const getRecentlyTriggeredAlerts = () => {
    return alerts
      .filter(alert => alert.lastTriggered)
      .sort((a, b) => {
        const dateA = a.lastTriggered?.getTime() || 0;
        const dateB = b.lastTriggered?.getTime() || 0;
        return dateB - dateA;
      })
      .slice(0, 5);
  };

  const priorityCounts = getAlertsByPriority();
  const topTriggeredAlerts = getTopTriggeredAlerts();
  const recentlyTriggeredAlerts = getRecentlyTriggeredAlerts();

  const formatLastTriggered = (date?: Date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getPriorityIcon = (priority: string) => {
    const icons = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      critical: '🔴'
    };
    return icons[priority as keyof typeof icons] || '⚪';
  };

  return (
    <div className="alert-stats">
      <div className="alert-stats-header">
        <h3>📊 Alert Statistics</h3>
        <p>Overview of your alert system performance</p>
      </div>

      <div className="stats-grid">
        {/* Overview Cards */}
        <div className="stat-card overview">
          <div className="stat-header">
            <h4>System Overview</h4>
          </div>
          <div className="stat-content">
            <div className="stat-item">
              <span className="stat-label">Total Alerts:</span>
              <span className="stat-value large">{stats.totalAlerts}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Active Alerts:</span>
              <span className="stat-value large active">{stats.activeAlerts}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Triggers:</span>
              <span className="stat-value large">{stats.totalTriggers}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Triggers Today:</span>
              <span className="stat-value large today">{stats.triggersToday}</span>
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="stat-card priority-distribution">
          <div className="stat-header">
            <h4>Active Alerts by Priority</h4>
          </div>
          <div className="stat-content">
            <div className="priority-stats">
              <div className="priority-item">
                <span className="priority-icon">🔴</span>
                <span className="priority-label">Critical:</span>
                <span className="priority-count">{priorityCounts.critical}</span>
              </div>
              <div className="priority-item">
                <span className="priority-icon">🟠</span>
                <span className="priority-label">High:</span>
                <span className="priority-count">{priorityCounts.high}</span>
              </div>
              <div className="priority-item">
                <span className="priority-icon">🟡</span>
                <span className="priority-label">Medium:</span>
                <span className="priority-count">{priorityCounts.medium}</span>
              </div>
              <div className="priority-item">
                <span className="priority-icon">🟢</span>
                <span className="priority-label">Low:</span>
                <span className="priority-count">{priorityCounts.low}</span>
              </div>
            </div>
            
            {/* Simple visual bar chart */}
            <div className="priority-chart">
              {Object.entries(priorityCounts).map(([priority, count]) => (
                <div key={priority} className="chart-bar">
                  <div className="bar-label">{priority}</div>
                  <div className="bar-container">
                    <div
                      className={`bar bar-${priority}`}
                      style={{
                        width: `${stats.activeAlerts > 0 ? (count / stats.activeAlerts) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                  <div className="bar-value">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Most Triggered Alerts */}
        <div className="stat-card top-triggered">
          <div className="stat-header">
            <h4>Most Triggered Alerts</h4>
          </div>
          <div className="stat-content">
            {topTriggeredAlerts.length > 0 ? (
              <div className="alert-list">
                {topTriggeredAlerts.map(alert => (
                  <div key={alert.id} className="alert-item">
                    <div className="alert-info">
                      <span className="priority-icon">
                        {getPriorityIcon(alert.priority)}
                      </span>
                      <span className="alert-name">{alert.name}</span>
                    </div>
                    <div className="trigger-count">
                      {alert.triggerCount} triggers
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <p>No alerts have been triggered yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recently Triggered */}
        <div className="stat-card recently-triggered">
          <div className="stat-header">
            <h4>Recently Triggered</h4>
          </div>
          <div className="stat-content">
            {recentlyTriggeredAlerts.length > 0 ? (
              <div className="alert-list">
                {recentlyTriggeredAlerts.map(alert => (
                  <div key={alert.id} className="alert-item">
                    <div className="alert-info">
                      <span className="priority-icon">
                        {getPriorityIcon(alert.priority)}
                      </span>
                      <span className="alert-name">{alert.name}</span>
                    </div>
                    <div className="last-triggered">
                      {formatLastTriggered(alert.lastTriggered)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <p>No alerts have been triggered yet</p>
              </div>
            )}
          </div>
        </div>

        {/* System Health */}
        <div className="stat-card system-health">
          <div className="stat-header">
            <h4>System Health</h4>
          </div>
          <div className="stat-content">
            <div className="health-metrics">
              <div className="health-item">
                <span className="health-label">Alert Coverage:</span>
                <span className="health-value">
                  {stats.totalAlerts > 0 ? 
                    `${Math.round((stats.activeAlerts / stats.totalAlerts) * 100)}%` : 
                    '0%'
                  }
                </span>
                <span className="health-status">
                  {stats.activeAlerts > 0 ? '✅' : '⚠️'}
                </span>
              </div>
              
              <div className="health-item">
                <span className="health-label">Today's Activity:</span>
                <span className="health-value">
                  {stats.triggersToday} triggers
                </span>
                <span className="health-status">
                  {stats.triggersToday > 0 ? '📈' : '📊'}
                </span>
              </div>
              
              <div className="health-item">
                <span className="health-label">Average per Alert:</span>
                <span className="health-value">
                  {stats.activeAlerts > 0 ? 
                    Math.round(stats.totalTriggers / stats.activeAlerts) : 
                    0
                  } triggers
                </span>
                <span className="health-status">📋</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="stat-card quick-actions">
          <div className="stat-header">
            <h4>Quick Actions</h4>
          </div>
          <div className="stat-content">
            <div className="action-buttons">
              <button className="action-btn create">
                ➕ Create Alert
              </button>
              <button className="action-btn export">
                📤 Export Data
              </button>
              <button className="action-btn settings">
                ⚙️ Settings
              </button>
            </div>
            
            <div className="system-info">
              <div className="info-item">
                <span className="info-label">Last Updated:</span>
                <span className="info-value">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Browser Notifications:</span>
                <span className="info-value">
                  {Notification.permission === 'granted' ? '✅ Enabled' : '⚠️ Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertStats;
