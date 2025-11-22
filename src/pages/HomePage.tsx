import React, { useEffect,useRef,useState } from 'react';

import AlertNotificationPanel from '../components/alerts/AlertNotificationPanel';
import CentralView from '../components/CentralView';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import { isAggregateFeedId } from '../constants/MissionMode';
import { getSourceById } from '../constants/MissionSourceRegistry';
import { useMissionMode } from '../contexts/MissionModeContext';

/**
 * HomePage displays the main dashboard with a 3-column layout.
 */
const HomePage: React.FC = () => {
  const { profile, mode } = useMissionMode();
  const [selectedFeedList, setSelectedFeedList] = useState<string | null>(() => profile?.defaultFeedListId ?? null);
  const previousDefaultFeedRef = useRef(profile.defaultFeedListId);

  // Auto-select the default feed list on component mount
  useEffect(() => {
    console.log('🔍 TDD_ERROR_066: HomePage useEffect triggered, current selectedFeedList:', selectedFeedList);
    if (!selectedFeedList) {
      console.log('🔍 TDD_WARNING_067: No feed list selected, setting default to mission profile');
      setSelectedFeedList(profile.defaultFeedListId);
    } else {
      console.log('🔍 TDD_SUCCESS_068: Feed list already selected:', selectedFeedList);
    }
  }, [selectedFeedList, profile.defaultFeedListId]);

  useEffect(() => {
    if (previousDefaultFeedRef.current !== profile.defaultFeedListId) {
      console.log('🔄 Mission mode default changed, resetting feed selection');
      previousDefaultFeedRef.current = profile.defaultFeedListId;
      setSelectedFeedList(profile.defaultFeedListId);
    }
  }, [profile.defaultFeedListId]);

  useEffect(() => {
    if (!selectedFeedList) {
      return;
    }

    const aggregateMatch = isAggregateFeedId(selectedFeedList, mode);
    const missionSourceExists = Boolean(getSourceById(mode, selectedFeedList));

    if (!aggregateMatch && !missionSourceExists) {
      console.warn('⚠️ Selected feed is invalid for active mission, restoring default', {
        selectedFeedList,
        mode
      });
      setSelectedFeedList(profile.defaultFeedListId);
    }
  }, [mode, profile.defaultFeedListId, selectedFeedList]);

  // Add effect to track selectedFeedList changes
  useEffect(() => {
    console.log('🔍 TDD_SUCCESS_069: HomePage selectedFeedList state changed to:', selectedFeedList);
  }, [selectedFeedList]);

  return (
    <div className="home-page-container">
      <div className="tactical-sidebar-left">
        <LeftSidebar
          selectedFeedList={selectedFeedList}
          setSelectedFeedList={setSelectedFeedList}
        />
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
