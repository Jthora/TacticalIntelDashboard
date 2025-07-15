import React, { useState, useEffect } from 'react';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import CentralView from '../components/CentralView';
import QuickActions from '../components/QuickActions';
import AlertNotificationPanel from '../components/alerts/AlertNotificationPanel';

/**
 * HomePage displays the main dashboard with a 3-column layout.
 */
const HomePage: React.FC = () => {
  const [selectedFeedList, setSelectedFeedList] = useState<string | null>(null);

  // Auto-select the default feed list on component mount
  useEffect(() => {
    console.log('🔍 TDD_ERROR_066: HomePage useEffect triggered, current selectedFeedList:', selectedFeedList);
    if (!selectedFeedList) {
      console.log('🔍 TDD_WARNING_067: No feed list selected, setting default to "1"');
      setSelectedFeedList('1'); // Default feed list ID
    } else {
      console.log('🔍 TDD_SUCCESS_068: Feed list already selected:', selectedFeedList);
    }
  }, [selectedFeedList]);

  // Add effect to track selectedFeedList changes
  useEffect(() => {
    console.log('🔍 TDD_SUCCESS_069: HomePage selectedFeedList state changed to:', selectedFeedList);
  }, [selectedFeedList]);

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
    <div className="home-page-container">
      <div className="tactical-sidebar-left">
        <LeftSidebar setSelectedFeedList={setSelectedFeedList} />
      </div>
      
      <div className="tactical-main">
        <CentralView selectedFeedList={selectedFeedList} />
      </div>
      
      <div className="tactical-sidebar-right">
        <RightSidebar />
      </div>
      
      <div className="tactical-footer">
        <QuickActions 
          selectedFeedList={selectedFeedList}
          onRefreshAll={handleRefreshAll}
          onExportData={handleExportData}
        />
        <AlertNotificationPanel />
      </div>
    </div>
  );
};

export default HomePage;
