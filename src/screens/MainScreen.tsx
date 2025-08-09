import React, { useState } from 'react';

import AlertNotificationPanel from '../components/alerts/AlertNotificationPanel';
import CentralView from '../components/CentralView';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';

/**
 * MainScreen is the primary screen of the application containing the 3-column layout
 * with LeftSidebar, CentralView, and RightSidebar.
 */
const MainScreen: React.FC = () => {
  const [selectedFeedList, setSelectedFeedList] = useState<string | null>(null);

  return (
    <div className="main-screen-content">
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

export default MainScreen;
