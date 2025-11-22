import React, { memo, useEffect, useMemo, useState } from 'react';

import { useFilters } from '../contexts/FilterContext';
import useAlerts from '../hooks/alerts/useAlerts';
import { useLoading } from '../hooks/useLoading';
import type { Feed } from '../models/Feed';
import FeedService from '../services/FeedService';
import PerformanceManager from '../services/PerformanceManager';
import { SettingsIntegrationService } from '../services/SettingsIntegrationService';
import { ErrorOverlay, FeedVisualizerSkeleton } from '../shared/components/LoadingStates';
import FeedDiagnosticsPanel from './FeedDiagnosticsPanel';
import FeedItem from './FeedItem';
import { useFeedLoader } from '../hooks/useFeedLoader';
import { useAutoRefresh } from '../hooks/useAutoRefresh';

// TDD Error Tracking for FeedVisualizer
const TDD_UI_ERRORS = {
  logError: (id: string, location: string, issue: string, data?: any) => {
    console.error(`TDD_ERROR_${id}`, {
      location: `FeedVisualizer.${location}`,
      issue,
      data,
      timestamp: new Date().toISOString()
    });
  },
  logSuccess: (id: string, location: string, message: string, data?: any) => {
    console.log(`TDD_SUCCESS_${id}`, {
      location: `FeedVisualizer.${location}`,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  },
  logWarning: (id: string, location: string, message: string, data?: any) => {
    console.warn(`TDD_WARNING_${id}`, {
      location: `FeedVisualizer.${location}`,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }
};

interface FeedVisualizerProps {
  selectedFeedList: string | null;
}

const FeedVisualizer: React.FC<FeedVisualizerProps> = memo(({ selectedFeedList }) => {
  // TDD_ERROR_044: Track component mount and props
  React.useEffect(() => {
    TDD_UI_ERRORS.logSuccess('044', 'FeedVisualizer_Mount', 'FeedVisualizer component mounted', { selectedFeedList });
  }, []);
  
  React.useEffect(() => {
    TDD_UI_ERRORS.logSuccess('045', 'FeedVisualizer_PropsChange', 'selectedFeedList prop changed', { 
      selectedFeedList,
      type: typeof selectedFeedList,
      isNull: selectedFeedList === null,
      isEmpty: selectedFeedList === ''
    });
  }, [selectedFeedList]);

  // Initialize autoRefresh from user settings
  const [autoRefresh, setAutoRefresh] = useState<boolean>(() => {
    const generalSettings = SettingsIntegrationService.getGeneralSettings();
    return generalSettings.autoRefresh;
  });

  // Filter context integration
  const { getFilteredFeeds } = useFilters();

  // Enhanced loading state management
  const { 
    isLoading, 
    error, 
    setLoading,
    setError
  } = useLoading({
    minLoadingTime: 800,
    initialMessage: 'Loading intelligence feeds...',
    initiallyLoading: Boolean(selectedFeedList)
  });

  // Alert system integration
  const { 
    checkFeedItems, 
    isMonitoring, 
    alertStats 
  } = useAlerts();

  const {
    feeds,
    lastUpdated,
    recentAlertTriggers,
    diagnostics,
    loadFeeds
  } = useFeedLoader(
    {
      selectedFeedList,
      isMonitoring,
      checkFeedItems,
      setLoading,
      setError,
      logSuccess: TDD_UI_ERRORS.logSuccess,
      logWarning: TDD_UI_ERRORS.logWarning
    }
  );

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

  useAutoRefresh({ autoRefresh, selectedFeedList, loadFeeds });

  const sourceStatus = useMemo(() => {
    if (!diagnostics || diagnostics.length === 0) {
      return null;
    }

    return diagnostics.reduce(
      (acc, diagnostic) => {
        acc.total += 1;
        acc[diagnostic.status] += 1;
        return acc;
      },
      { total: 0, success: 0, empty: 0, failed: 0 }
    );
  }, [diagnostics]);

  // Initial load and when selectedFeedList changes
  useEffect(() => {
    loadFeeds(true, 'selected-feed-change');
  }, [loadFeeds]);

  const handleRefresh = () => {
    loadFeeds(true, 'manual-refresh');
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
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
          onRetry={() => loadFeeds(true, 'manual-refresh')}
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
          {sourceStatus && (
            <span className="source-status text-secondary text-sm">
              🛰️ SOURCES — OK: {sourceStatus.success} | EMPTY: {sourceStatus.empty} | FAIL: {sourceStatus.failed}
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
        <FeedDiagnosticsPanel diagnostics={diagnostics} lastUpdated={lastUpdated} />
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
