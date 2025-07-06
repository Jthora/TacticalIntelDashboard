import React, { useState, useEffect } from 'react';
import WingCommanderLogo from '../assets/images/WingCommanderLogo-288x162.gif';

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
    }, 30000); // Change every 30 seconds

    // Simulate system status updates
    const statusTimer = setInterval(() => {
      const statuses = ['OPERATIONAL', 'DEGRADED', 'MAINTENANCE'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      setSystemStatus(randomStatus);
    }, 45000); // Change every 45 seconds

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
    <header className="cyber-command-header">
      <div className="header-primary">
        <div className="logo-section">
          <img src={WingCommanderLogo} alt="Wing Commander Logo" className="command-logo" />
          <div className="agency-identity">
            <h1 className="command-title">TACTICAL INTEL DASHBOARD</h1>
            <div className="agency-subtitle">CYBER INVESTIGATION AGENCY</div>
          </div>
        </div>
        
        <div className="status-indicators">
          <div className="status-item">
            <span className="status-label">THREAT LEVEL</span>
            <div className={`threat-indicator threat-${threatLevel.toLowerCase()}`}>
              {threatLevel}
            </div>
          </div>
          <div className="status-item">
            <span className="status-label">SYSTEM STATUS</span>
            <div className={`system-indicator status-${systemStatus.toLowerCase()}`}>
              {systemStatus}
            </div>
          </div>
          <div className="status-item">
            <span className="status-label">MISSION TIME</span>
            <div className="time-display">
              {formatTime(currentTime)}
            </div>
          </div>
        </div>
      </div>
      
      <div className="header-scanline"></div>
      <div className="header-glow-effect"></div>
    </header>
  );
};

export default Header;