import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import CentralView from '../components/CentralView';
import QuickActions from '../components/QuickActions';
import AlertNotificationPanel from '../components/alerts/AlertNotificationPanel';

const HomePage: React.FC = () => {
  const [selectedFeedList, setSelectedFeedList] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState('INITIALIZING');
  const [connectionStatus, setConnectionStatus] = useState('ESTABLISHING');

  useEffect(() => {
    // Simulate system initialization sequence
    const initSequence = async () => {
      setSystemStatus('LOADING PROTOCOLS');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSystemStatus('CONNECTING TO NETWORKS');
      setConnectionStatus('CONNECTING');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSystemStatus('SYNCING INTEL FEEDS');
      setConnectionStatus('AUTHENTICATED');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSystemStatus('OPERATIONAL');
      setConnectionStatus('SECURE');
    };

    initSequence();
  }, []);

  const handleRefreshAll = () => {
    setSystemStatus('REFRESHING DATA');
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleExportData = () => {
    setSystemStatus('EXPORTING INTEL');
    
    const data = {
      timestamp: new Date().toISOString(),
      selectedFeedList,
      exportedAt: new Date().toLocaleString(),
      systemStatus,
      connectionStatus,
      classification: 'TACTICAL-INTEL-EXPORT'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wing-commander-intel-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    setTimeout(() => setSystemStatus('OPERATIONAL'), 2000);
  };

  return (
    <div className="wing-command-center">
      <Header />
      
      {/* System Status Bar */}
      <div className="system-status-bar">
        <div className="status-section">
          <span className="status-label">SYSTEM:</span>
          <span className={`status-value ${systemStatus.toLowerCase().replace(' ', '-')}`}>
            {systemStatus}
          </span>
        </div>
        <div className="status-section">
          <span className="status-label">CONNECTION:</span>
          <span className={`status-value ${connectionStatus.toLowerCase()}`}>
            {connectionStatus}
          </span>
        </div>
        <div className="status-section">
          <span className="status-label">GRID:</span>
          <span className="status-value operational">ACTIVE</span>
        </div>
      </div>

      {/* Main Command Grid */}
      <div className="command-grid">
        {/* Threat Analysis Panel */}
        <div className="grid-panel threat-panel">
          <div className="panel-header">
            <h3 className="panel-title">THREAT ANALYSIS</h3>
            <div className="panel-status active"></div>
          </div>
          <div className="panel-content">
            <LeftSidebar setSelectedFeedList={setSelectedFeedList} />
          </div>
        </div>

        {/* Main Intelligence Display */}
        <div className="grid-panel main-display">
          <div className="panel-header">
            <h3 className="panel-title">INTELLIGENCE FEED</h3>
            <div className="panel-controls">
              <span className="feed-counter">
                {selectedFeedList ? `FEED: ${selectedFeedList}` : 'ALL SOURCES'}
              </span>
            </div>
          </div>
          <div className="panel-content">
            <CentralView selectedFeedList={selectedFeedList} />
          </div>
        </div>

        {/* Tactical Information Panel */}
        <div className="grid-panel tactical-panel">
          <div className="panel-header">
            <h3 className="panel-title">TACTICAL INFO</h3>
            <div className="panel-status monitoring"></div>
          </div>
          <div className="panel-content">
            <RightSidebar />
          </div>
        </div>

        {/* Command Console */}
        <div className="grid-panel command-console">
          <div className="panel-header">
            <h3 className="panel-title">COMMAND CONSOLE</h3>
            <div className="panel-status ready"></div>
          </div>
          <div className="panel-content">
            <QuickActions 
              selectedFeedList={selectedFeedList}
              onRefreshAll={handleRefreshAll}
              onExportData={handleExportData}
            />
          </div>
        </div>
      </div>

      {/* Alert System Overlay */}
      <AlertNotificationPanel />
      
      {/* Grid Scan Lines */}
      <div className="grid-scanlines">
        <div className="scanline horizontal"></div>
        <div className="scanline vertical"></div>
      </div>
    </div>
  );
};

export default HomePage;