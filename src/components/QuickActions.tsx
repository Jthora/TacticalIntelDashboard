import React, { useState } from 'react';
import { log } from '../utils/LoggerService';

interface QuickActionsProps {
  selectedFeedList: string | null;
  onRefreshAll: () => void;
  onExportData: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ 
  selectedFeedList, 
  onRefreshAll, 
  onExportData 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAddFeed = () => {
    const url = prompt('🔗 Enter RSS Feed URL:');
    if (url) {
      // TODO: Implement add feed functionality
      log.debug("Component", 'Adding feed:', url);
      alert('Feed addition functionality coming soon!');
    }
  };

  const handleExportFeeds = () => {
    onExportData();
  };

  const handleSettings = () => {
    // TODO: Navigate to settings page
    log.debug("Component", 'Opening settings...');
    alert('Settings page coming soon!');
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Error entering fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const quickActions = [
    {
      icon: '🔄',
      label: 'Refresh All',
      action: onRefreshAll,
      className: 'refresh-action'
    },
    {
      icon: '➕',
      label: 'Add Feed',
      action: handleAddFeed,
      className: 'add-action'
    },
    {
      icon: '💾',
      label: 'Export',
      action: handleExportFeeds,
      className: 'export-action'
    },
    {
      icon: '⚙️',
      label: 'Settings',
      action: handleSettings,
      className: 'settings-action'
    },
    {
      icon: '⛶',
      label: 'Fullscreen',
      action: handleFullscreen,
      className: 'fullscreen-action'
    }
  ];

  return (
    <div className={`quick-actions ${isExpanded ? 'expanded' : ''}`}>
      <button 
        className="quick-actions-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        title="Quick Actions"
      >
        <span className="toggle-icon">⚡</span>
        {isExpanded ? 'HIDE' : 'ACTIONS'}
      </button>

      {isExpanded && (
        <div className="quick-actions-panel">
          <div className="panel-header">
            <h4>🎯 Mission Control</h4>
            {selectedFeedList && (
              <span className="active-feed-info">
                📡 {selectedFeedList}
              </span>
            )}
          </div>

          <div className="actions-grid">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className={`action-btn ${action.className}`}
                onClick={action.action}
                title={action.label}
              >
                <span className="action-icon">{action.icon}</span>
                <span className="action-label">{action.label}</span>
              </button>
            ))}
          </div>

          <div className="panel-footer">
            <div className="system-status">
              <span className="status-indicator online">🟢</span>
              <span className="status-text">System Online</span>
            </div>
            <div className="last-sync">
              Last Sync: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActions;
