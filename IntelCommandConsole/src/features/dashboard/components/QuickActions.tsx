import React, { useState, useEffect } from 'react';

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
  const [isExpanded, setIsExpanded] = useState(true);
  const [systemLoad, setSystemLoad] = useState(45);
  const [activeConnections, setActiveConnections] = useState(12);

  useEffect(() => {
    // Simulate system metrics updates
    const metricsTimer = setInterval(() => {
      setSystemLoad(prev => Math.max(20, Math.min(95, prev + (Math.random() - 0.5) * 10)));
      setActiveConnections(prev => Math.max(8, Math.min(24, prev + Math.floor((Math.random() - 0.5) * 4))));
    }, 3000);

    return () => clearInterval(metricsTimer);
  }, []);

  const handleAddFeed = () => {
    const url = prompt('⚡ ENTER FEED URL FOR INTELLIGENCE STREAM:');
    if (url) {
      console.log('ADDING INTEL SOURCE:', url);
      alert('🚀 INTEL SOURCE INTEGRATION INITIATED');
    }
  };

  const handleExportIntel = () => {
    onExportData();
  };

  const handleTacticalSettings = () => {
    console.log('ACCESSING TACTICAL CONFIGURATION...');
    alert('🎯 TACTICAL CONFIGURATION MODULE LOADING...');
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('FULLSCREEN ENGAGEMENT ERROR:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleEmergencyProtocol = () => {
    const confirmed = confirm('⚠️ INITIATE EMERGENCY PROTOCOL?\n\nThis will refresh all systems and reset connections.');
    if (confirmed) {
      alert('🚨 EMERGENCY PROTOCOL ACTIVATED');
      onRefreshAll();
    }
  };

  const commandActions = [
    {
      icon: '🔄',
      label: 'REFRESH INTEL',
      action: onRefreshAll,
      className: 'refresh-command',
      priority: 'high'
    },
    {
      icon: '📡',
      label: 'ADD SOURCE',
      action: handleAddFeed,
      className: 'add-command',
      priority: 'medium'
    },
    {
      icon: '💾',
      label: 'EXPORT DATA',
      action: handleExportIntel,
      className: 'export-command',
      priority: 'medium'
    },
    {
      icon: '⚙️',
      label: 'TACTICAL CFG',
      action: handleTacticalSettings,
      className: 'settings-command',
      priority: 'low'
    },
    {
      icon: '⛶',
      label: 'FULLSCREEN',
      action: handleFullscreen,
      className: 'fullscreen-command',
      priority: 'low'
    },
    {
      icon: '🚨',
      label: 'EMERGENCY',
      action: handleEmergencyProtocol,
      className: 'emergency-command',
      priority: 'critical'
    }
  ];

  return (
    <div className="command-console-panel">
      {/* Console Header */}
      <div className="console-header">
        <div className="console-title">
          <span className="title-text">COMMAND CONSOLE</span>
          <div className="console-status operational">READY</div>
        </div>
        <button 
          className="console-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? "Minimize Console" : "Expand Console"}
        >
          <span className="toggle-symbol">{isExpanded ? '▼' : '▲'}</span>
        </button>
      </div>

      {/* System Metrics */}
      <div className="system-metrics">
        <div className="metric-item">
          <span className="metric-label">SYSTEM LOAD:</span>
          <div className="metric-bar">
            <div 
              className={`metric-fill ${systemLoad > 80 ? 'critical' : systemLoad > 60 ? 'warning' : 'normal'}`}
              style={{ width: `${systemLoad}%` }}
            ></div>
          </div>
          <span className="metric-value">{systemLoad.toFixed(0)}%</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">CONNECTIONS:</span>
          <span className="metric-value-large">{activeConnections}</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">TARGET:</span>
          <span className="metric-value-feed">
            {selectedFeedList || 'ALL SOURCES'}
          </span>
        </div>
      </div>

      {/* Command Actions Grid */}
      {isExpanded && (
        <div className="command-grid-actions">
          {commandActions.map((command, index) => (
            <button
              key={index}
              className={`command-btn ${command.className} priority-${command.priority}`}
              onClick={command.action}
              title={`Execute: ${command.label}`}
            >
              <span className="command-icon">{command.icon}</span>
              <span className="command-label">{command.label}</span>
              <div className="command-glow"></div>
            </button>
          ))}
        </div>
      )}

      {/* Console Footer */}
      <div className="console-footer">
        <div className="operational-status">
          <div className="status-indicator active"></div>
          <span className="status-text">OPERATIONAL</span>
        </div>
        <div className="sync-time">
          SYNC: {new Date().toLocaleTimeString('en-US', { hour12: false })} UTC
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
