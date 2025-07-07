import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import FeedItem from './FeedItem';
import FeedService from '../services/FeedService';
import { Feed } from '../models/Feed';
import useAlerts from '../hooks/alerts/useAlerts';
import { FeedVisualizerSkeleton, ErrorOverlay } from './LoadingStates';
import { useLoading } from '../hooks/useLoading';
import { useFilters } from '../contexts/FilterContext';
import PerformanceManager from '../services/PerformanceManager';

interface FeedVisualizerProps {
  selectedFeedList: string | null;
}

const FeedVisualizer: React.FC<FeedVisualizerProps> = memo(({ selectedFeedList }) => {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [recentAlertTriggers, setRecentAlertTriggers] = useState<number>(0);

  // Filter context integration
  const { getFilteredFeeds } = useFilters();

  // Performance-optimized filtered feeds with caching
  const filteredFeeds = useMemo(() => {
    const cacheKey = `filtered-feeds-${selectedFeedList}-${feeds.length}`;
    const cached = PerformanceManager.getCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    const enrichedFeeds = feeds.map(feed => FeedService.enrichFeedWithMetadata(feed));
    const filtered = getFilteredFeeds(enrichedFeeds);
    
    // Cache for 30 seconds
    PerformanceManager.setCache(cacheKey, filtered, 30000);
    
    return filtered;
  }, [feeds, getFilteredFeeds, selectedFeedList]);

  // Enhanced loading state management
  const { 
    isLoading, 
    error, 
    setLoading,
    setError
  } = useLoading({
    minLoadingTime: 800,
    initialMessage: 'Loading intelligence feeds...'
  });

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

    if (showLoading) {
      setLoading(true, 'Loading intelligence feeds...');
      setError(null);
    }

    try {
      console.log(`Loading feeds for list: ${selectedFeedList}`);
      const feedsByList = await FeedService.getFeedsByList(selectedFeedList);
      console.log(`Loaded ${feedsByList.length} feeds`);
      
      // Process feeds for alert monitoring
      if (isMonitoring && feedsByList.length > 0) {
        console.log(`🚨 Checking ${feedsByList.length} feed items for alerts...`);
        
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
          console.log(`🚨 ${triggers.length} alert(s) triggered!`);
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
  }, [selectedFeedList, isMonitoring, checkFeedItems, setLoading, setError]);

  // Auto-refresh mechanism with performance optimization
  useEffect(() => {
    if (!autoRefresh || !selectedFeedList) return;

    const refreshInterval = PerformanceManager.getRefreshInterval('feeds');
    const intervalId = setInterval(() => {
      console.log('Auto-refreshing feeds...');
      loadFeeds(false); // Don't show loading spinner for auto-refresh
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, selectedFeedList, loadFeeds]);

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

  if (isLoading) {
    return <FeedVisualizerSkeleton />;
  }

  if (error) {
    return (
      <div className="feed-visualizer">
        <ErrorOverlay
          title="⚠️ Feed Load Error"
          message={error}
          onRetry={() => loadFeeds(true)}
          suggestions={[
            "Check your internet connection",
            "Verify the feed source is available",
            "Try selecting a different feed list"
          ]}
        />
      </div>
    );
  }

  return (
    <div className="feed-visualizer-container">
      <div className="feed-controls tactical-header" style={{ borderBottom: '1px solid rgba(0, 255, 170, 0.2)' }}>
        <div className="status-bar">
          <span className="feed-count text-accent font-semibold">
            📡 {filteredFeeds.length > 0 ? filteredFeeds.length : feeds.length} FEEDS LOADED
          </span>
          {lastUpdated && (
            <span className="last-updated text-secondary text-sm">
              🕐 UPDATED: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          {/* Alert system status indicator */}
          <span className={`alert-status text-sm ${isMonitoring ? 'text-accent' : 'text-muted'}`}>
            {isMonitoring ? '🚨 ALERT MONITOR: ON' : '⚪ ALERT MONITOR: OFF'}
          </span>
          {recentAlertTriggers > 0 && (
            <span className="recent-alerts animate-pulse text-accent font-bold">
              🔥 {recentAlertTriggers} ALERT{recentAlertTriggers > 1 ? 'S' : ''} TRIGGERED!
            </span>
          )}
          {alertStats.activeAlerts > 0 && (
            <span className="active-alerts-count text-secondary text-sm">
              📋 {alertStats.activeAlerts} ACTIVE ALERT{alertStats.activeAlerts > 1 ? 'S' : ''}
            </span>
          )}
        </div>
        <div className="control-buttons">
          <button 
            onClick={handleRefresh} 
            className="btn btn-primary btn-sm"
            title="Refresh feeds"
          >
            🔄 REFRESH
          </button>
          <button 
            onClick={toggleAutoRefresh}
            className={`btn btn-sm ${autoRefresh ? 'btn-warning' : 'btn-secondary'}`}
            title={`Auto-refresh: ${autoRefresh ? 'ON' : 'OFF'}`}
          >
            {autoRefresh ? '🔴 AUTO-REFRESH' : '⚪ AUTO-REFRESH'}
          </button>
        </div>
      </div>

      <div className="feed-content">
        {feeds.length === 0 ? (
          <div className="no-feeds empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-title text-lg font-semibold text-muted">NO INTELLIGENCE AVAILABLE</div>
            <div className="empty-description text-secondary">
              Select a feed list from the sidebar to begin monitoring intelligence sources.
            </div>
          </div>
        ) : (
          <div className="feed-scroll-container">
            {filteredFeeds.map((feed: Feed) => (
              <FeedItem key={feed.id} feed={feed} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default FeedVisualizer;