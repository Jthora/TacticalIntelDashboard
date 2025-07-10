import React, { useState, useEffect } from 'react';
import { AlertTrigger } from '../../../types/AlertTypes';
import useAlerts from '../../../hooks/alerts/useAlerts';
import './AlertNotificationPanel.css';

interface AlertNotificationPanelProps {
  className?: string;
}

const AlertNotificationPanel: React.FC<AlertNotificationPanelProps> = ({ className = '' }) => {
  const [visibleAlerts, setVisibleAlerts] = useState<AlertTrigger[]>([]);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  
  const { 
    alertHistory, 
    acknowledgeAlert, 
    alertStats 
  } = useAlerts();

  // Show only recent unacknowledged alerts
  useEffect(() => {
    const recentAlerts = alertHistory
      .filter(trigger => !trigger.acknowledged)
      .sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime())
      .slice(0, 5); // Show only the 5 most recent

    setVisibleAlerts(recentAlerts);
  }, [alertHistory]);

  const handleAcknowledge = (triggerId: string) => {
    acknowledgeAlert(triggerId);
  };

  const handleAcknowledgeAll = () => {
    visibleAlerts.forEach(alert => acknowledgeAlert(alert.id));
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

  const getPriorityClass = (priority: string) => {
    return `priority-${priority}`;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (visibleAlerts.length === 0) {
    return null; // Don't render if no alerts
  }

  return (
    <div className={`alert-notification-panel ${className} ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="panel-header">
        <div className="header-content">
          <span className="panel-title">
            🚨 Active Alerts ({visibleAlerts.length})
          </span>
          <div className="header-stats">
            <span className="stat">
              Today: {alertStats.triggersToday}
            </span>
            <span className="stat">
              Total: {alertStats.totalTriggers}
            </span>
          </div>
        </div>
        <div className="panel-controls">
          {visibleAlerts.length > 1 && (
            <button 
              className="acknowledge-all-btn"
              onClick={handleAcknowledgeAll}
              title="Acknowledge all alerts"
            >
              ✅ All
            </button>
          )}
          <button 
            className="collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand alerts' : 'Collapse alerts'}
          >
            {isCollapsed ? '⬆️' : '⬇️'}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="panel-content">
          <div className="alert-list">
            {visibleAlerts.map(alert => (
              <div 
                key={alert.id} 
                className={`alert-notification ${getPriorityClass(alert.priority)}`}
              >
                <div className="alert-header">
                  <span className="priority-icon">
                    {getPriorityIcon(alert.priority)}
                  </span>
                  <span className="alert-time">
                    {formatTimeAgo(alert.triggeredAt)}
                  </span>
                  <button 
                    className="acknowledge-btn"
                    onClick={() => handleAcknowledge(alert.id)}
                    title="Acknowledge this alert"
                  >
                    ✓
                  </button>
                </div>
                
                <div className="alert-content">
                  <h4 className="alert-title">
                    {alert.feedItem.title}
                  </h4>
                  <p className="alert-source">
                    📡 {alert.feedItem.source}
                  </p>
                  <div className="matched-keywords">
                    <span className="keywords-label">Keywords:</span>
                    {alert.matchedKeywords.map((keyword, index) => (
                      <span key={index} className="keyword-tag">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="alert-actions">
                  <button 
                    className="view-source-btn"
                    onClick={() => window.open(alert.feedItem.link, '_blank')}
                    title="View source article"
                  >
                    🔗 View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertNotificationPanel;
