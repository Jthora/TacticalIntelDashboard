import React from 'react';
import { AlertConfig } from '../../types/AlertTypes';
import './AlertList.css';

interface AlertListProps {
  alerts: AlertConfig[];
  onEdit: (alert: AlertConfig) => void;
  onDelete: (alertId: string) => void;
  onToggle: (alertId: string) => void;
  onSnooze: (alertId: string, minutes: number) => void;
}

const AlertList: React.FC<AlertListProps> = ({
  alerts,
  onEdit,
  onDelete,
  onToggle,
  onSnooze
}) => {
  const getPriorityIcon = (priority: string) => {
    const icons = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      critical: '🔴'
    };
    return icons[priority as keyof typeof icons] || '⚪';
  };

  const getPriorityLabel = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

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

  const isAlertSnoozed = (alert: AlertConfig) => {
    return alert.scheduling.snoozeUntil && new Date() < alert.scheduling.snoozeUntil;
  };

  const handleSnooze = (alertId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const minutes = parseInt(prompt('Snooze for how many minutes?') || '0');
    if (minutes > 0) {
      onSnooze(alertId, minutes);
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="alert-list-empty">
        <div className="empty-state">
          <span className="empty-icon">🚨</span>
          <h3>No Alerts Configured</h3>
          <p>Create your first alert to start monitoring feeds for specific keywords.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="alert-list">
      <div className="alert-list-header">
        <h3>Configured Alerts</h3>
        <div className="alert-count">
          {alerts.filter(a => a.active).length} of {alerts.length} active
        </div>
      </div>

      <div className="alert-grid">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className={`alert-card ${!alert.active ? 'inactive' : ''} ${isAlertSnoozed(alert) ? 'snoozed' : ''}`}
          >
            <div className="alert-header">
              <div className="alert-title">
                <span className="priority-icon">
                  {getPriorityIcon(alert.priority)}
                </span>
                <h4>{alert.name}</h4>
                {isAlertSnoozed(alert) && (
                  <span className="snooze-indicator">💤</span>
                )}
              </div>
              <div className="alert-actions">
                <button
                  className={`toggle-btn ${alert.active ? 'active' : 'inactive'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle(alert.id);
                  }}
                  title={alert.active ? 'Disable alert' : 'Enable alert'}
                >
                  {alert.active ? '👁️' : '👁️‍🗨️'}
                </button>
                <button
                  className="snooze-btn"
                  onClick={(e) => handleSnooze(alert.id, e)}
                  title="Snooze alert"
                  disabled={!alert.active}
                >
                  💤
                </button>
                <button
                  className="edit-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(alert);
                  }}
                  title="Edit alert"
                >
                  ✏️
                </button>
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(alert.id);
                  }}
                  title="Delete alert"
                >
                  🗑️
                </button>
              </div>
            </div>

            {alert.description && (
              <p className="alert-description">{alert.description}</p>
            )}

            <div className="alert-keywords">
              <strong>Keywords:</strong>
              <div className="keyword-tags">
                {alert.keywords.map((keyword, index) => (
                  <span key={index} className="keyword-tag">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {alert.sources && alert.sources.length > 0 && (
              <div className="alert-sources">
                <strong>Sources:</strong>
                <div className="source-tags">
                  {alert.sources.map((source, index) => (
                    <span key={index} className="source-tag">
                      {source}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="alert-meta">
              <div className="meta-item">
                <span className="meta-label">Priority:</span>
                <span className={`priority-badge priority-${alert.priority}`}>
                  {getPriorityLabel(alert.priority)}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Triggers:</span>
                <span className="trigger-count">{alert.triggerCount}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Last Triggered:</span>
                <span className="last-triggered">
                  {formatLastTriggered(alert.lastTriggered)}
                </span>
              </div>
            </div>

            <div className="alert-notifications">
              <div className="notification-types">
                {alert.notifications.browser && (
                  <span className="notification-type" title="Browser notifications">
                    🖥️
                  </span>
                )}
                {alert.notifications.sound && (
                  <span className="notification-type" title="Sound alerts">
                    🔊
                  </span>
                )}
                {alert.notifications.email && (
                  <span className="notification-type" title="Email notifications">
                    📧
                  </span>
                )}
                {alert.notifications.webhook && (
                  <span className="notification-type" title="Webhook notifications">
                    🔗
                  </span>
                )}
              </div>
            </div>

            {alert.scheduling.activeHours && (
              <div className="alert-schedule">
                <span className="schedule-icon">⏰</span>
                <span className="schedule-text">
                  Active: {alert.scheduling.activeHours.start} - {alert.scheduling.activeHours.end}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertList;
