import React, { memo, useEffect, useMemo, useState } from 'react';

import { useFilters } from '../contexts/FilterContext';
import { useSettings } from '../contexts/SettingsContext';
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
import IntelFeedInfoBar from './IntelFeedInfoBar';
import {
  FEED_AUTO_REFRESH_CHANGE_EVENT,
  FEED_MANUAL_REFRESH_EVENT,
  type FeedAutoRefreshChangeDetail,
  type FeedRefreshEventDetail
} from '../utils/feedControlEvents';

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
  const { settings } = useSettings();
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
  const [diagnosticsExpandSignal, setDiagnosticsExpandSignal] = useState(0);

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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleExternalRefresh = (event: Event) => {
      const detail = (event as CustomEvent<FeedRefreshEventDetail>).detail || {};
      const { showLoading = true, reason = 'external-control' } = detail;
      loadFeeds(showLoading, reason);
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

  const hasDiagnosticsFailures = useMemo(
    () => Boolean(diagnostics && diagnostics.some(diagnostic => diagnostic.status === 'failed')),
    [diagnostics]
  );

  const diagnosticsEnabled = settings.general?.sourceDiagnosticsEnabled ?? false;

  // Initial load and when selectedFeedList changes
  useEffect(() => {
    loadFeeds(true, 'selected-feed-change');
  }, [loadFeeds]);

  if (isLoading) {
    return <FeedVisualizerSkeleton />;
  }

  const displayedFeedCount = filteredFeeds.length > 0 ? filteredFeeds.length : feeds.length;

  return (
    <div className="feed-visualizer-container">
      <div className="feed-controls tactical-header" style={{ borderBottom: '1px solid rgba(0, 255, 170, 0.2)' }}>
        <IntelFeedInfoBar
          feedCount={displayedFeedCount}
          totalFeeds={feeds.length}
          lastUpdated={lastUpdated}
          isMonitoring={isMonitoring}
          recentAlertTriggers={recentAlertTriggers}
          activeAlerts={alertStats.activeAlerts}
          sourceStatus={sourceStatus ? {
            success: sourceStatus.success,
            empty: sourceStatus.empty,
            failed: sourceStatus.failed
          } : null}
        />
      </div>

      {diagnosticsEnabled && hasDiagnosticsFailures && (
        <div className="diagnostics-alert-banner" role="status">
          <div className="diagnostics-alert-content">
            <span className="diagnostics-alert-icon" aria-hidden="true">🛑</span>
            <div>
              <div className="diagnostics-alert-title">Source failures detected</div>
              <div className="diagnostics-alert-description">
                {sourceStatus?.failed ?? 0} feed{(sourceStatus?.failed ?? 0) === 1 ? '' : 's'} are failing validation. Review diagnostics for actionable errors.
              </div>
            </div>
          </div>
          <button
            type="button"
            className="diagnostics-alert-button"
            onClick={() => setDiagnosticsExpandSignal(prev => prev + 1)}
          >
            View diagnostics
          </button>
        </div>
      )}

      <div className="feed-content">
        {diagnosticsEnabled && (
          <FeedDiagnosticsPanel
            diagnostics={diagnostics}
            lastUpdated={lastUpdated}
            initiallyExpanded={hasDiagnosticsFailures}
            autoExpandOnFailure
            expandSignal={diagnosticsExpandSignal}
          />
        )}
        {error ? (
          <div className="feed-error-block">
            <ErrorOverlay
              title="⚠️ Feed Load Error"
              message={error}
              onRetry={() => loadFeeds(true, 'manual-refresh')}
              suggestions={[
                'Check your internet connection',
                'Verify the feed source is available',
                'Try selecting a different feed list'
              ]}
            />
            {diagnosticsEnabled && hasDiagnosticsFailures && (
              <div className="failure-hint text-secondary">
                Diagnostics captured failing sources. Use the panel above to inspect error payloads.
              </div>
            )}
          </div>
        ) : feeds.length === 0 ? (
          <div className="no-feeds empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-title text-lg font-semibold text-muted">NO INTELLIGENCE AVAILABLE</div>
            <div className="empty-description text-secondary">
              Select a feed list from the sidebar to begin monitoring intelligence sources.
            </div>
            {diagnosticsEnabled && hasDiagnosticsFailures && (
              <div className="failure-hint text-secondary">
                ⚠️ Some sources are currently failing. Expand diagnostics above for details.
              </div>
            )}
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
