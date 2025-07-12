import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import FeedItem from './FeedItem';
import FeedService from '../services/FeedService';
import { modernFeedService } from '../services/ModernFeedService';
import { Feed } from '../models/Feed';
import useAlerts from '../hooks/alerts/useAlerts';
import { FeedVisualizerSkeleton, ErrorOverlay } from '../shared/components/LoadingStates';
import { useLoading } from '../hooks/useLoading';
import { useFilters } from '../contexts/FilterContext';
import PerformanceManager from '../services/PerformanceManager';
import { SettingsIntegrationService } from '../services/SettingsIntegrationService';
import { log } from '../utils/LoggerService';

interface FeedVisualizerProps {
  selectedFeedList: string | null;
}

const FeedVisualizer: React.FC<FeedVisualizerProps> = memo(({ selectedFeedList }) => {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Initialize autoRefresh from user settings
  const [autoRefresh, setAutoRefresh] = useState<boolean>(() => {
    const generalSettings = SettingsIntegrationService.getGeneralSettings();
    return generalSettings.autoRefresh;
  });
  
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
    console.log('🔍 FeedVisualizer: loadFeeds called with selectedFeedList:', selectedFeedList);
    console.log('🔍 FeedVisualizer: showLoading:', showLoading);
    
    if (!selectedFeedList) {
      console.log('⚠️ FeedVisualizer: No selectedFeedList, clearing feeds');
      setFeeds([]);
      setLoading(false);
      return;
    }

    if (showLoading) {
      setLoading(true, 'Loading intelligence feeds...');
      setError(null);
    }

    try {
      log.debug("Component", `Loading feeds for list: ${selectedFeedList}`);
      console.log('🎯 FeedVisualizer: About to check feed list type for:', selectedFeedList);
      
      // Use modern feed service to get rich intelligence data
      if (selectedFeedList === 'modern-api' || selectedFeedList === '1' || selectedFeedList === 'primary-intel' || selectedFeedList === 'security-feeds') {
        console.log('📡 Using Modern Feed Service for intelligence data');
        console.log('🚀 FeedVisualizer: Calling modernFeedService.fetchAllIntelligenceData()...');
        
        const modernResults = await modernFeedService.fetchAllIntelligenceData();
        console.log('📊 Modern Feed Service Raw Results:', modernResults);
        
        const modernFeeds = modernResults.feeds;
        console.log('📊 Modern Feeds Array:', modernFeeds);
        
        // Convert FeedItem to Feed format for compatibility
        const modernFeedsAsFeeds: Feed[] = modernFeeds.map(feedItem => ({
          ...feedItem,
          name: feedItem.author || 'Modern API',
          url: feedItem.link,
          description: feedItem.description || feedItem.content || '',
          // Map enhanced metadata from modern service
          priority: feedItem.priority,
          contentType: feedItem.contentType,
          tags: feedItem.tags || feedItem.categories,
          source: feedItem.source || feedItem.author,
        }));
        
        console.log('📊 FeedVisualizer: Loaded modern feeds count:', modernFeedsAsFeeds.length);
        console.log('📊 FeedVisualizer: Modern feed sample:', modernFeedsAsFeeds.slice(0, 2));
        
        // Process feeds for alert monitoring
        if (isMonitoring && modernFeedsAsFeeds.length > 0) {
          log.debug("Component", `🚨 Checking ${modernFeedsAsFeeds.length} feed items for alerts...`);
          
          const feedItemsForAlerts = modernFeedsAsFeeds.map(feed => ({
            title: feed.title,
            description: feed.description || '',
            content: feed.content || '',
            link: feed.link,
            url: feed.link,
            source: feed.author || 'Unknown',
            feedTitle: feed.author || 'Unknown',
            pubDate: feed.pubDate,
            author: feed.author,
            categories: feed.categories
          }));
          
          const triggers = checkFeedItems(feedItemsForAlerts);
          
          if (triggers.length > 0) {
            log.debug("Component", `🚨 ${triggers.length} alert(s) triggered!`);
            setRecentAlertTriggers(triggers.length);
            setTimeout(() => setRecentAlertTriggers(0), 30000);
          }
        }
        
        setFeeds(modernFeedsAsFeeds);
        setLastUpdated(new Date());
        
      } else {
        // Fallback to legacy RSS service for other feed lists
        console.log('📰 Using Legacy Feed Service for RSS feeds');
        const feedsByList = await FeedService.getFeedsByList(selectedFeedList);
        console.log('📊 FeedVisualizer: Loaded legacy feeds count:', feedsByList.length);
        
        // Process feeds for alert monitoring (legacy format)
        if (isMonitoring && feedsByList.length > 0) {
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
            setTimeout(() => setRecentAlertTriggers(0), 30000);
          }
        }
        
        setFeeds(feedsByList);
        setLastUpdated(new Date());
      }
      
      log.debug("Component", `Successfully loaded feeds`);
      
    } catch (err) {
      console.error('Failed to load feeds:', err);
      setError(`Failed to load feeds: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [selectedFeedList, isMonitoring, checkFeedItems, setLoading, setError]);

  // Auto-refresh mechanism with user settings integration
  useEffect(() => {
    if (!autoRefresh || !selectedFeedList) return;

    // Get user's refresh interval setting (in seconds, convert to milliseconds)
    const generalSettings = SettingsIntegrationService.getGeneralSettings();
    const refreshIntervalMs = generalSettings.refreshInterval * 1000;
    
    const intervalId = setInterval(() => {
      log.debug("Component", `Auto-refreshing feeds every ${generalSettings.refreshInterval} seconds...`);
      loadFeeds(false); // Don't show loading spinner for auto-refresh
    }, refreshIntervalMs);

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
            className="filter-action-btn refresh"
            title="Refresh feeds"
          >
            <span className="btn-icon">🔄</span>
            <span className="btn-text">REFRESH</span>
          </button>
          <button 
            onClick={toggleAutoRefresh}
            className={`filter-action-btn ${autoRefresh ? 'active' : ''}`}
            title={`Auto-refresh: ${autoRefresh ? 'ON' : 'OFF'}`}
          >
            <span className="btn-icon">{autoRefresh ? '🔴' : '⚪'}</span>
            <span className="btn-text">AUTO-REFRESH</span>
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
