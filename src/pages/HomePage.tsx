import React, { useEffect,useState } from 'react';

import AlertNotificationPanel from '../components/alerts/AlertNotificationPanel';
import CentralView from '../components/CentralView';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';

/**
 * HomePage displays the main dashboard with a 3-column layout.
 */
const HomePage: React.FC = () => {
  const [selectedFeedList, setSelectedFeedList] = useState<string | null>(null);

  // Auto-select the default feed list on component mount
  useEffect(() => {
    console.log('🔍 TDD_ERROR_066: HomePage useEffect triggered, current selectedFeedList:', selectedFeedList);
    if (!selectedFeedList) {
      console.log('🔍 TDD_WARNING_067: No feed list selected, setting default to "modern-api"');
      setSelectedFeedList('modern-api'); // Default to modern API aggregate
    } else {
      console.log('🔍 TDD_SUCCESS_068: Feed list already selected:', selectedFeedList);
    }
  }, [selectedFeedList]);

  // Add effect to track selectedFeedList changes
  useEffect(() => {
    console.log('🔍 TDD_SUCCESS_069: HomePage selectedFeedList state changed to:', selectedFeedList);
  }, [selectedFeedList]);

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
        <AlertNotificationPanel />
      </div>
    </div>
  );
};

export default HomePage;
