import React, { useEffect,useState } from 'react';

const Header: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  // Fixed status indicators - no more random flickering
  const [threatLevel] = useState('NORMAL');
  const [systemStatus] = useState('OPERATIONAL');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
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