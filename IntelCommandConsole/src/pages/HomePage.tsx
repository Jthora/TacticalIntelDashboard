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
    // Streamlined system initialization
    const initSequence = async () => {
      setSystemStatus('LOADING');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSystemStatus('CONNECTING');
      setConnectionStatus('CONNECTING');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setSystemStatus('OPERATIONAL');
      setConnectionStatus('SECURE');
    };

    initSequence();
  }, []);

  const handleRefreshAll = () => {
    setSystemStatus('REFRESHING');
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  const handleExportData = () => {
    setSystemStatus('EXPORTING');
    
    const data = {
      timestamp: new Date().toISOString(),
      selectedFeedList,
      exportedAt: new Date().toLocaleString(),
      systemStatus,
      connectionStatus,
      classification: 'ARCH-ANGEL-INTEL-EXPORT'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arch-angel-intel-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    setTimeout(() => setSystemStatus('OPERATIONAL'), 1500);
  };

  return (
    <div className="arch-angel-interface">
      <Header />
      
      {/* Streamlined Status Bar */}
      <div className="interface-status-bar">
        <div className="status-item">
          <span className="status-label">SYSTEM:</span>
          <span className={`status-value ${systemStatus.toLowerCase()}`}>
            {systemStatus}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">CONNECTION:</span>
          <span className={`status-value ${connectionStatus.toLowerCase()}`}>
            {connectionStatus}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">INTEL GRID:</span>
          <span className="status-value operational">ACTIVE</span>
        </div>
      </div>

      {/* Main Interface Grid */}
      <div className="intel-grid">
        {/* Intelligence Sources */}
        <div className="grid-section sources">
          <div className="section-header">
            <h3>INTELLIGENCE SOURCES</h3>
          </div>
          <div className="section-content">
            <LeftSidebar setSelectedFeedList={setSelectedFeedList} />
          </div>
        </div>

        {/* Main Intel Feed */}
        <div className="grid-section main-feed">
          <div className="section-header">
            <h3>INTELLIGENCE FEED</h3>
            <div className="feed-info">
              {selectedFeedList ? `SOURCE: ${selectedFeedList}` : 'ALL SOURCES'}
            </div>
          </div>
          <div className="section-content">
            <CentralView selectedFeedList={selectedFeedList} />
          </div>
        </div>

        {/* Analysis Panel */}
        <div className="grid-section analysis">
          <div className="section-header">
            <h3>ANALYSIS</h3>
          </div>
          <div className="section-content">
            <RightSidebar />
          </div>
        </div>

        {/* Operations Console */}
        <div className="grid-section operations">
          <div className="section-header">
            <h3>OPERATIONS</h3>
          </div>
          <div className="section-content">
            <QuickActions 
              selectedFeedList={selectedFeedList}
              onRefreshAll={handleRefreshAll}
              onExportData={handleExportData}
            />
          </div>
        </div>
      </div>

      {/* Alert System */}
      <AlertNotificationPanel />
    </div>
  );
};

export default HomePage;