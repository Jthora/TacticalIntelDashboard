import React, { useState } from 'react';
import Header from '../components/Header';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import CentralView from '../components/CentralView';
import QuickActions from '../components/QuickActions';
import AlertNotificationPanel from '../components/alerts/AlertNotificationPanel';
import '../assets/styles/tactical-ui.css';

const HomePage: React.FC = () => {
  const [selectedFeedList, setSelectedFeedList] = useState<string | null>(null);

  const handleRefreshAll = () => {
    window.location.reload();
  };

  const handleExportData = () => {
    // TODO: Implement proper export functionality
    const data = {
      timestamp: new Date().toISOString(),
      selectedFeedList,
      exportedAt: new Date().toLocaleString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tactical-intel-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="tactical-dashboard">
      <div className="tactical-header-main">
        <Header />
      </div>
      
      <div className="tactical-sidebar-left">
        <LeftSidebar setSelectedFeedList={setSelectedFeedList} />
      </div>
      
      <div className="tactical-main">
        <CentralView selectedFeedList={selectedFeedList} />
      </div>
      
      <div className="tactical-sidebar-right">
        <RightSidebar />
      </div>
      
      <div className="tactical-quickactions">
        <QuickActions 
          selectedFeedList={selectedFeedList}
          onRefreshAll={handleRefreshAll}
          onExportData={handleExportData}
        />
      </div>
      
      <AlertNotificationPanel />
    </div>
  );
};

export default HomePage;