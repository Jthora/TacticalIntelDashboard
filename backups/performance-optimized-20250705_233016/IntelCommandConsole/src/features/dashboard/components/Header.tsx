import React, { useState, useEffect } from 'react';

const Header: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [threatLevel, setThreatLevel] = useState('NORMAL');
  const [systemStatus, setSystemStatus] = useState('OPERATIONAL');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Simulate dynamic threat level changes (for demonstration)
    const threatTimer = setInterval(() => {
      const levels = ['NORMAL', 'ELEVATED', 'HIGH', 'CRITICAL'];
      const randomLevel = levels[Math.floor(Math.random() * levels.length)];
      setThreatLevel(randomLevel);
    }, 30000);

    // Simulate system status updates
    const statusTimer = setInterval(() => {
      const statuses = ['OPERATIONAL', 'DEGRADED', 'MAINTENANCE'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      setSystemStatus(randomStatus);
    }, 45000);

    return () => {
      clearInterval(timer);
      clearInterval(threatTimer);
      clearInterval(statusTimer);
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      timeZone: 'UTC'
    }) + ' UTC';
  };

  return (
    <header className="arch-angel-header">
      <div className="header-content">
        <div className="agency-identity">
          <div className="agency-logo">AA</div>
          <div className="agency-info">
            <h1 className="agency-title">ARCH ANGEL AGENCY</h1>
            <div className="agency-subtitle">TACTICAL INTELLIGENCE</div>
          </div>
        </div>
        
        <div className="status-bar">
          <div className="status-group">
            <span className="status-label">THREAT</span>
            <div className={`status-indicator threat-${threatLevel.toLowerCase()}`}>
              {threatLevel}
            </div>
          </div>
          <div className="status-group">
            <span className="status-label">SYSTEM</span>
            <div className={`status-indicator system-${systemStatus.toLowerCase()}`}>
              {systemStatus}
            </div>
          </div>
          <div className="status-group">
            <span className="status-label">TIME</span>
            <div className="status-indicator time-display">
              {formatTime(currentTime)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;