import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { log } from '../../../utils/LoggerService';
import FeedService from '../services/FeedService';
import { SearchService } from '../../../services/SearchService';
import { Feed } from '../../../models/Feed';
import FeedItem from './FeedItem';
import { useOptimizedFetch, useOptimizedTimer } from '../../../hooks/usePerformanceOptimization';

const FeedList: React.FC = () => {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLowPowerMode, setIsLowPowerMode] = useState(false);

  // Optimized feed fetching with caching
  const fetchFeeds = useOptimizedFetch(
    'feeds_main',
    async () => {
      const rssFeeds = await FeedService.getFeeds();
      return rssFeeds;
    },
    []
  );

  const loadFeeds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rssFeeds = await fetchFeeds();
      setFeeds(rssFeeds);
      // Initialize search service with loaded feeds (only if not in low power mode)
      if (!isLowPowerMode) {
        SearchService.initializeFeeds(rssFeeds);
      }
    } catch (err) {
      console.error('Failed to load feeds:', err);
      setError('Failed to load feeds');
    } finally {
      setLoading(false);
    }
  }, [fetchFeeds, isLowPowerMode]);

  // Initial load
  useEffect(() => {
    loadFeeds();
  }, [loadFeeds]);

  // Optimized auto-refresh timer
  useOptimizedTimer(
    () => {
      if (!isLowPowerMode) {
        loadFeeds();
      }
    },
    'feeds',
    'feedList_autoRefresh',
    [loadFeeds, isLowPowerMode]
  );

  // Listen for performance mode changes
  useEffect(() => {
    const handleLowPowerMode = (event: CustomEvent) => {
      setIsLowPowerMode(event.detail.enabled);
      if (event.detail.enabled) {
        log.debug("Component", '📡 FeedList: Reduced refresh frequency for better performance');
      } else {
        log.debug("Component", '📡 FeedList: Restored normal refresh frequency');
      }
    };

    window.addEventListener('performance:lowPowerMode', handleLowPowerMode as EventListener);
    return () => {
      window.removeEventListener('performance:lowPowerMode', handleLowPowerMode as EventListener);
    };
  }, []);

  // Memoized feed items to prevent unnecessary re-renders
  const feedItems = useMemo(() => {
    return feeds.map((feed) => (
      <FeedItem key={feed.id} feed={feed} />
    ));
  }, [feeds]);

  if (loading) {
    return (
      <div className={`feed-list-loading ${isLowPowerMode ? 'low-power' : ''}`}>
        {isLowPowerMode ? '🔋 Loading...' : 'Loading...'}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`feed-list-error ${isLowPowerMode ? 'low-power' : ''}`}>
        {error}
        {isLowPowerMode && ' (Performance mode enabled)'}
      </div>
    );
  }

  return (
    <div className={`feed-list ${isLowPowerMode ? 'low-power-mode' : ''}`}>
      {isLowPowerMode && (
        <div className="performance-notice">
          🔋 Performance mode active - reduced refresh rate
        </div>
      )}
      {feeds.length === 0 ? (
        <div className="no-feeds">No feeds available</div>
      ) : (
        feedItems
      )}
    </div>
  );
};

export default FeedList;
