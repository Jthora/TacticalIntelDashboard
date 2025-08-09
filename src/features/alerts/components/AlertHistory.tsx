import './AlertHistory.css';

import React, { useState } from 'react';

import { AlertTrigger } from '../../../types/AlertTypes';

interface AlertHistoryProps {
  history: AlertTrigger[];
  onClearHistory: (alertId?: string) => void;
  onAcknowledge: (triggerId: string) => void;
}

const AlertHistory: React.FC<AlertHistoryProps> = ({
  history,
  onClearHistory,
  onAcknowledge
}) => {
  const [filter, setFilter] = useState<{
    priority?: string;
    acknowledged?: boolean;
    alertId?: string;
    dateRange?: string;
  }>({});
  
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const getPriorityIcon = (priority: string) => {
    const icons = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      critical: '🔴'
    };
    return icons[priority as keyof typeof icons] || '⚪';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  const formatTimeAgo = (date: Date) => {
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

  const filterHistory = () => {
    let filtered = [...history];

    if (filter.priority) {
      filtered = filtered.filter(trigger => trigger.priority === filter.priority);
    }

    if (filter.acknowledged !== undefined) {
      filtered = filtered.filter(trigger => trigger.acknowledged === filter.acknowledged);
    }

    if (filter.alertId) {
      filtered = filtered.filter(trigger => trigger.alertId === filter.alertId);
    }

    if (filter.dateRange) {
      const now = new Date();
      let cutoff: Date;
      
      switch (filter.dateRange) {
        case 'today':
          cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          cutoff = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          cutoff = new Date(0);
      }
      
      filtered = filtered.filter(trigger => trigger.triggeredAt >= cutoff);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = a.triggeredAt.getTime();
        const dateB = b.triggeredAt.getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      } else {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        return sortOrder === 'desc' ? priorityB - priorityA : priorityA - priorityB;
      }
    });

    return filtered;
  };

  const filteredHistory = filterHistory();
  const unacknowledgedCount = history.filter(trigger => !trigger.acknowledged).length;

  const uniqueAlertIds = Array.from(new Set(history.map(trigger => trigger.alertId)));

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all alert history? This cannot be undone.')) {
      onClearHistory();
    }
  };

  if (history.length === 0) {
    return (
      <div className="alert-history-empty">
        <div className="empty-state">
          <span className="empty-icon">📜</span>
          <h3>No Alert History</h3>
          <p>Alert triggers will appear here when your configured alerts are activated.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="alert-history">
      <div className="alert-history-header">
        <h3>Alert History</h3>
        <div className="history-stats">
          <span className="stat">
            Total: {history.length}
          </span>
          <span className="stat unacknowledged">
            Unacknowledged: {unacknowledgedCount}
          </span>
        </div>
      </div>

      <div className="history-controls">
        <div className="filters">
          <select
            value={filter.priority || ''}
            onChange={(e) => setFilter(prev => ({ ...prev, priority: e.target.value || undefined }))}
          >
            <option value="">All Priorities</option>
            <option value="critical">🔴 Critical</option>
            <option value="high">🟠 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>

          <select
            value={filter.acknowledged?.toString() || ''}
            onChange={(e) => setFilter(prev => ({ 
              ...prev, 
              acknowledged: e.target.value ? e.target.value === 'true' : undefined 
            }))}
          >
            <option value="">All Status</option>
            <option value="false">Unacknowledged</option>
            <option value="true">Acknowledged</option>
          </select>

          <select
            value={filter.dateRange || ''}
            onChange={(e) => setFilter(prev => ({ ...prev, dateRange: e.target.value || undefined }))}
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last Week</option>
            <option value="month">This Month</option>
          </select>

          {uniqueAlertIds.length > 1 && (
            <select
              value={filter.alertId || ''}
              onChange={(e) => setFilter(prev => ({ ...prev, alertId: e.target.value || undefined }))}
            >
              <option value="">All Alerts</option>
              {uniqueAlertIds.map(alertId => (
                <option key={alertId} value={alertId}>
                  Alert {alertId.split('_')[1]}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="sort-controls">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'priority')}
          >
            <option value="date">Sort by Date</option>
            <option value="priority">Sort by Priority</option>
          </select>
          
          <button
            className="sort-order-btn"
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            title={`Sort ${sortOrder === 'desc' ? 'ascending' : 'descending'}`}
          >
            {sortOrder === 'desc' ? '↓' : '↑'}
          </button>
        </div>

        <div className="history-actions">
          <button
            className="clear-all-btn"
            onClick={handleClearAll}
            disabled={history.length === 0}
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="history-list">
        {filteredHistory.map(trigger => (
          <div
            key={trigger.id}
            className={`history-item ${!trigger.acknowledged ? 'unacknowledged' : ''}`}
          >
            <div className="history-item-header">
              <div className="trigger-meta">
                <span className="priority-icon">
                  {getPriorityIcon(trigger.priority)}
                </span>
                <span className="trigger-time">
                  {formatTimeAgo(trigger.triggeredAt)}
                </span>
                <span className="trigger-date">
                  {formatDate(trigger.triggeredAt)}
                </span>
              </div>
              
              <div className="trigger-actions">
                {!trigger.acknowledged && (
                  <button
                    className="acknowledge-btn"
                    onClick={() => onAcknowledge(trigger.id)}
                    title="Acknowledge this alert"
                  >
                    ✓
                  </button>
                )}
                <button
                  className="view-source-btn"
                  onClick={() => window.open(trigger.feedItem.link, '_blank')}
                  title="View source article"
                >
                  🔗
                </button>
              </div>
            </div>

            <div className="trigger-content">
              <h4 className="trigger-title">
                {trigger.feedItem.title}
              </h4>
              
              {trigger.feedItem.description && (
                <p className="trigger-description">
                  {trigger.feedItem.description.substring(0, 200)}
                  {trigger.feedItem.description.length > 200 ? '...' : ''}
                </p>
              )}

              <div className="trigger-details">
                <div className="detail-item">
                  <span className="detail-label">Source:</span>
                  <span className="detail-value">{trigger.feedItem.source}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Matched Keywords:</span>
                  <div className="matched-keywords">
                    {trigger.matchedKeywords.map((keyword, index) => (
                      <span key={index} className="matched-keyword">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredHistory.length === 0 && history.length > 0 && (
        <div className="no-results">
          <p>No results match your current filters.</p>
        </div>
      )}
    </div>
  );
};

export default AlertHistory;
