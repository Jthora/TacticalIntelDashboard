import React, { useCallback,useEffect, useState } from 'react';

import useAlerts from '../../../hooks/alerts/useAlerts';
import { useOptimizedTimer } from '../../../hooks/usePerformanceOptimization';
import { Feed } from '../../../models/Feed';
import { log } from '../../../utils/LoggerService';
import FeedService from '../services/FeedService';
import FeedItem from './FeedItem';
import SearchAndFilter from './SearchAndFilter';

interface FeedVisualizerProps {
  selectedFeedList: string | null;
}

const FeedVisualizer: React.FC<FeedVisualizerProps> = ({ selectedFeedList }) => {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [filteredFeeds, setFilteredFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
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

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

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

  return (
    <div className="feed-visualizer">
      <div className="feed-controls">
        <div className="status-bar">
          <span className="feed-count">
            📡 {filteredFeeds.length > 0 ? filteredFeeds.length : feeds.length} feeds loaded
          </span>
          {lastUpdated && (
            <span className="last-updated">
              🕐 Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          {/* Alert system status indicator */}
          <span className={`alert-status ${isMonitoring ? 'monitoring' : 'inactive'}`}>
            {isMonitoring ? '🚨 Alert Monitor: ON' : '⚪ Alert Monitor: OFF'}
          </span>
          {recentAlertTriggers > 0 && (
            <span className="recent-alerts pulse">
              🔥 {recentAlertTriggers} Alert{recentAlertTriggers > 1 ? 's' : ''} Triggered!
            </span>
          )}
          {alertStats.activeAlerts > 0 && (
            <span className="active-alerts-count">
              📋 {alertStats.activeAlerts} Active Alert{alertStats.activeAlerts > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="control-buttons">
          <button 
            onClick={handleRefresh} 
            className="refresh-button"
            title="Refresh feeds"
          >
            🔄 Refresh
          </button>
          <button 
            onClick={toggleAutoRefresh}
            className={`auto-refresh-button ${autoRefresh ? 'active' : 'inactive'}`}
            title={`Auto-refresh: ${autoRefresh ? 'ON' : 'OFF'}`}
          >
            {autoRefresh ? '🔴' : '⚪'} Auto-refresh
          </button>
        </div>
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
