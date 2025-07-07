import React from 'react';

interface HealthProps {
  feedCount?: number;
  onScan?: () => void;
  onClean?: () => void;
  onRepair?: () => void;
  connectionStatus?: 'ONLINE' | 'OFFLINE' | 'CONNECTING';
  securityStatus?: 'SECURE' | 'COMPROMISED' | 'UNKNOWN';
  overallStatus?: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
}

const Health: React.FC<HealthProps> = ({
  feedCount = 0,
  onScan,
  onClean,
  onRepair,
  connectionStatus = 'ONLINE',
  securityStatus = 'SECURE',
  overallStatus = 'OPTIMAL'
}) => {
  const handleScan = () => {
    console.log('Health scan initiated');
    onScan?.();
  };

  const handleClean = () => {
    console.log('System clean initiated');
    onClean?.();
  };

  const handleRepair = () => {
    console.log('System repair initiated');
    onRepair?.();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPTIMAL':
      case 'ONLINE':
      case 'SECURE':
        return '#00ff41';
      case 'WARNING':
      case 'CONNECTING':
        return '#ffa500';
      case 'CRITICAL':
      case 'OFFLINE':
      case 'COMPROMISED':
        return '#ff0000';
      default:
        return '#ffffff';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return 'online';
      case 'SECURE':
        return 'secure';
      case 'ACTIVE':
        return 'active';
      default:
        return '';
    }
  };

  return (
    <div className="tactical-module module-health">
      <div className="tactical-header-enhanced">
        <div className="header-primary">
          <span className="module-icon">💚</span>
          <h3>HEALTH</h3>
        </div>
        <div className="header-status">
          <span className="status-dot" style={{ background: getStatusColor(overallStatus) }}></span>
          <span className="status-text">{overallStatus}</span>
        </div>
      </div>
      <div className="tactical-content">
        <div className="health-indicators-micro">
          <div className="health-item">
            <span className="health-icon">🔗</span>
            <span className="health-label">CONNECTIONS</span>
            <span className={`health-status ${getStatusClass(connectionStatus)}`}>{connectionStatus}</span>
          </div>
          <div className="health-item">
            <span className="health-icon">🛡</span>
            <span className="health-label">SECURITY</span>
            <span className={`health-status ${getStatusClass(securityStatus)}`}>{securityStatus}</span>
          </div>
          <div className="health-item">
            <span className="health-icon">📊</span>
            <span className="health-label">FEEDS</span>
            <span className={`health-status ${getStatusClass('ACTIVE')}`}>{feedCount} ACTIVE</span>
          </div>
        </div>
        
        <div className="diagnostic-actions">
          <button className="diagnostic-btn" onClick={handleScan}>🔍 SCAN</button>
          <button className="diagnostic-btn" onClick={handleClean}>🧹 CLEAN</button>
          <button className="diagnostic-btn" onClick={handleRepair}>🔧 REPAIR</button>
        </div>
      </div>
    </div>
  );
};

export default Health;
