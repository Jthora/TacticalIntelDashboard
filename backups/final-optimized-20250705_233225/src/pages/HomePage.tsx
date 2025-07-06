import React, { useState } from 'react';
import Header from '../components/Header';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import CentralView from '../components/CentralView';
import QuickActions from '../components/QuickActions';
import AlertNotificationPanel from '../components/alerts/AlertNotificationPanel';

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
    <div className="home-page">
      <Header />
      <div className="content">
        <LeftSidebar setSelectedFeedList={setSelectedFeedList} />
        <CentralView selectedFeedList={selectedFeedList} />
        <RightSidebar />
      </div>
      <QuickActions 
        selectedFeedList={selectedFeedList}
        onRefreshAll={handleRefreshAll}
        onExportData={handleExportData}
      />
      <AlertNotificationPanel />
    </div>
  );
};

export default HomePage;