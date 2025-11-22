import React, { useCallback,useEffect, useState } from 'react';

import useAlerts from '../../../hooks/alerts/useAlerts';
import { useOptimizedTimer } from '../../../hooks/usePerformanceOptimization';
import { Feed } from '../../../models/Feed';
import { log } from '../../../utils/LoggerService';
import { SettingsIntegrationService } from '../../../services/SettingsIntegrationService';
import {
  FEED_AUTO_REFRESH_CHANGE_EVENT,
  FEED_MANUAL_REFRESH_EVENT,
  type FeedAutoRefreshChangeDetail,
  type FeedRefreshEventDetail
} from '../../../utils/feedControlEvents';
import FeedService from '../services/FeedService';
import FeedItem from './FeedItem';
import SearchAndFilter from './SearchAndFilter';
import IntelFeedInfoBar from '../../../components/IntelFeedInfoBar';

interface FeedVisualizerProps {
  selectedFeedList: string | null;
}

const FeedVisualizer: React.FC<FeedVisualizerProps> = ({ selectedFeedList }) => {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [filteredFeeds, setFilteredFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(() => {
    try {
      return SettingsIntegrationService.getGeneralSettings().autoRefresh;
    } catch (error) {
      log.debug('Component', 'Falling back to default auto-refresh state', error);
      return true;
    }
  });
  const [recentAlertTriggers, setRecentAlertTriggers] = useState<number>(0);

  // Alert system integration
  const { 
    checkFeedItems, 
    isMonitoring, 
    alertStats 
  } = useAlerts();


  const loadFeeds = useCallback(async (showLoading = true) => {
    if (!selectedFeedList) {
      setFeeds([]);
      setLoading(false);
      return;
    }

    if (showLoading) setLoading(true);
    setError(null);

    try {
      log.debug("Component", `Loading feeds for list: ${selectedFeedList}`);
      const feedsByList = await FeedService.getFeedsByList(selectedFeedList);
      log.debug("Component", `Loaded ${feedsByList.length} feeds`);
      
      // Process feeds for alert monitoring
      if (isMonitoring && feedsByList.length > 0) {
        log.debug("Component", `🚨 Checking ${feedsByList.length} feed items for alerts...`);
        
        // Convert Feed objects to format expected by alert system
        const feedItemsForAlerts = feedsByList.map(feed => ({
          title: feed.title,
          description: feed.description || '',
          content: feed.content || '',
          link: feed.link,
          url: feed.url,
          source: feed.name,
          feedTitle: feed.name,
          pubDate: feed.pubDate,
          author: feed.author,
          categories: feed.categories
        }));
        
        const triggers = checkFeedItems(feedItemsForAlerts);
        
        if (triggers.length > 0) {
          log.debug("Component", `🚨 ${triggers.length} alert(s) triggered!`);
          setRecentAlertTriggers(triggers.length);
          
          // Reset the trigger count after 30 seconds
          setTimeout(() => setRecentAlertTriggers(0), 30000);
        }
      }
      
      setFeeds(feedsByList);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load feeds:', err);
      setError(`Failed to load feeds: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [selectedFeedList, isMonitoring, checkFeedItems]);

  // Auto-refresh mechanism using optimized timer
  useOptimizedTimer(
    () => {
      if (autoRefresh && selectedFeedList) {
        log.debug("Component", 'Auto-refreshing feeds...');
        loadFeeds(false); // Don't show loading spinner for auto-refresh
      }
    },
    'feeds',
    'feedVisualizer_autoRefresh',
    [autoRefresh, selectedFeedList, loadFeeds]
  );

  // Initial load and when selectedFeedList changes
  useEffect(() => {
    loadFeeds();
  }, [loadFeeds]);

  const handleRefresh = () => {
    loadFeeds(true);
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleExternalRefresh = (event: Event) => {
      const detail = (event as CustomEvent<FeedRefreshEventDetail>).detail || {};
      const showLoading = detail.showLoading ?? true;
      loadFeeds(showLoading);
    };

    const handleAutoRefreshChange = (event: Event) => {
      const detail = (event as CustomEvent<FeedAutoRefreshChangeDetail>).detail;
      if (detail && typeof detail.autoRefresh === 'boolean') {
        setAutoRefresh(detail.autoRefresh);
      }
    };

    window.addEventListener(
      FEED_MANUAL_REFRESH_EVENT,
      handleExternalRefresh as EventListener
    );
    window.addEventListener(
      FEED_AUTO_REFRESH_CHANGE_EVENT,
      handleAutoRefreshChange as EventListener
    );

    return () => {
      window.removeEventListener(
        FEED_MANUAL_REFRESH_EVENT,
        handleExternalRefresh as EventListener
      );
      window.removeEventListener(
        FEED_AUTO_REFRESH_CHANGE_EVENT,
        handleAutoRefreshChange as EventListener
      );
    };
  }, [loadFeeds, setAutoRefresh]);

  if (loading) {
    return (
      <div className="feed-visualizer">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading intelligence feeds...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="feed-visualizer">
        <div className="error-container">
          <h3>⚠️ Feed Load Error</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="retry-button">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  const displayedFeedCount = filteredFeeds.length > 0 ? filteredFeeds.length : feeds.length;

  return (
    <div className="feed-visualizer">
      <div className="feed-controls">
        <IntelFeedInfoBar
          feedCount={displayedFeedCount}
          totalFeeds={feeds.length}
          lastUpdated={lastUpdated}
          isMonitoring={isMonitoring}
          recentAlertTriggers={recentAlertTriggers}
          activeAlerts={alertStats.activeAlerts}
        />
      </div>

      <div className="feed-list">
        {feeds.length === 0 ? (
          <div className="no-feeds">
            <h3>📋 No Intelligence Available</h3>
            <p>Select a feed list from the sidebar to begin monitoring.</p>
          </div>
        ) : (
          <>
            <SearchAndFilter 
              feeds={feeds} 
              onFilteredFeedsChange={setFilteredFeeds}
            />
            <div className="feed-scroll-container">
              {(filteredFeeds.length > 0 ? filteredFeeds : feeds).map((feed) => (
                <FeedItem key={feed.id} feed={feed} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FeedVisualizer;
