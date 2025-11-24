import { useCallback, useEffect, useRef, useState } from 'react';

import { isAggregateFeedId, MissionMode } from '../constants/MissionMode';
import { getSourceById as getSourceByIdForMode } from '../constants/MissionSourceRegistry';
import { useMissionMode } from '../contexts/MissionModeContext';
import { useStatusMessages } from '../contexts/StatusMessageContext';
import { Feed } from '../models/Feed';
import FeedService from '../services/FeedService';
import { modernFeedService } from '../services/ModernFeedService';
import { SearchService } from '../services/SearchService';
import { AlertTrigger } from '../types/AlertTypes';
import { FeedFetchDiagnostic } from '../types/FeedTypes';
import { IntelligenceSource } from '../types/ModernAPITypes';
import { log } from '../utils/LoggerService';
import { deriveClassification, deriveContentType, deriveRegion, normalizeTimestamp } from '../utils/feedMetadataMapper';

interface AlertFeedItem {
  title: string;
  description: string;
  content: string;
  link: string;
  url: string;
  source: string;
  feedTitle: string;
  pubDate?: string | Date;
  author?: string | undefined;
  categories?: string[] | undefined;
}

interface UseFeedLoaderParams {
  selectedFeedList: string | null;
  isMonitoring: boolean;
  checkFeedItems: (feeds: AlertFeedItem[]) => AlertTrigger[];
  setLoading: (loading: boolean, message?: string) => void;
  setError: (message: string | null) => void;
  logSuccess?: (id: string, location: string, message: string, data?: unknown) => void;
  logWarning?: (id: string, location: string, message: string, data?: unknown) => void;
}

interface UseFeedLoaderDependencies {
  feedService?: typeof FeedService;
  modernFeedService?: typeof modernFeedService;
  searchService?: typeof SearchService;
  logger?: typeof log;
  setTimeoutFn?: typeof setTimeout;
  getSourceById?: (mode: MissionMode, sourceId: string) => IntelligenceSource | undefined;
}

const noop = () => undefined;

// Describes why loadFeeds was invoked. Canonical values:
// 'initial-load' | 'selected-feed-change' | 'manual-refresh' | 'auto-refresh' | 'mission-mode-change' | 'unspecified'
type LoadReason = string;

export const useFeedLoader = (
  {
    selectedFeedList,
    isMonitoring,
    checkFeedItems,
    setLoading,
    setError,
    logSuccess = noop,
    logWarning = noop
  }: UseFeedLoaderParams,
  {
    feedService = FeedService,
    modernFeedService: modernService = modernFeedService,
    searchService = SearchService,
    logger = log,
    setTimeoutFn = setTimeout,
    getSourceById: getSourceByIdFn = getSourceByIdForMode
  }: UseFeedLoaderDependencies = {}
) => {
  const { pushMessage } = useStatusMessages();
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [recentAlertTriggers, setRecentAlertTriggers] = useState<number>(0);
  const [diagnostics, setDiagnostics] = useState<FeedFetchDiagnostic[]>([]);
  const { mode, profile } = useMissionMode();
  const loadInProgressRef = useRef(false);
  const lastInvocationRef = useRef<{ reason: LoadReason; timestamp: number }>({
    reason: 'unspecified',
    timestamp: 0
  });
  const prevSelectedFeedRef = useRef<string | null>(null);
  const prevModeRef = useRef(mode);
  const lastFallbackNoticeRef = useRef(0);
  const lastErrorNoticeRef = useRef(0);
  const MIN_AUTO_REFRESH_GAP_MS = 1500;

  const loadFeeds = useCallback(
    async (showLoading = true, reason: LoadReason = 'unspecified') => {
      logSuccess('046', 'loadFeeds', 'loadFeeds called', {
        selectedFeedList,
        showLoading,
        reason,
        callStack: new Error().stack?.split('\n').slice(1, 4).join('\n')
      });

      if (!selectedFeedList) {
        logWarning('047', 'loadFeeds', 'No selectedFeedList provided, clearing feeds', { selectedFeedList });
        setFeeds([]);
        setLoading(false);
        searchService.clearData();
        setDiagnostics([]);
        return;
      }

      const now = Date.now();
      const isAggregateSelection = isAggregateFeedId(selectedFeedList, mode);
      const shouldForceRefresh = reason === 'mission-mode-change' || reason === 'manual-refresh';
      if (loadInProgressRef.current) {
        logWarning('047A', 'loadFeeds', 'Load skipped because another load is still in progress', {
          selectedFeedList,
          reason,
          inFlightSince: lastInvocationRef.current.timestamp
        });
        return;
      }

      if (
        reason === 'auto-refresh' &&
        now - lastInvocationRef.current.timestamp < MIN_AUTO_REFRESH_GAP_MS
      ) {
        logWarning('047B', 'loadFeeds', 'Auto-refresh throttled due to rapid consecutive requests', {
          selectedFeedList,
          reason,
          msSinceLastLoad: now - lastInvocationRef.current.timestamp,
          minGapMs: MIN_AUTO_REFRESH_GAP_MS
        });
        return;
      }

      loadInProgressRef.current = true;
      lastInvocationRef.current = { reason, timestamp: now };
      const loadStart = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();

      if (showLoading) {
        logSuccess('048', 'loadFeeds', 'Setting loading state', { selectedFeedList });
        setLoading(true, 'Loading intelligence feeds...');
        setError(null);
      }

      try {
        logger.debug('Component', `Loading feeds for list: ${selectedFeedList}`);
        logSuccess('049', 'loadFeeds', 'About to determine feed list type', { selectedFeedList });

        if (isAggregateSelection) {
          logSuccess('050', 'loadFeeds', 'Using Modern Feed Service path', {
            selectedFeedList,
            aggregateSourceId: profile.defaultFeedListId,
            modernFeedServiceExists: !!modernService,
            modernFeedServiceType: typeof modernService,
            shouldForceRefresh
          });

          const modernResults = await modernService.fetchAllIntelligenceData(shouldForceRefresh);
          logSuccess('051', 'loadFeeds', 'Modern Feed Service returned results', {
            selectedFeedList,
            resultType: typeof modernResults,
            hasFeeds: !!modernResults.feeds,
            feedsLength: modernResults.feeds?.length,
            fetchedAt: modernResults.fetchedAt
          });

          const modernFeeds = modernResults.feeds ?? [];
          if (modernFeeds.length === 0) {
            logWarning('051A', 'loadFeeds', 'Modern feed response was empty, using cached fallback', {
              selectedFeedList,
              mode,
              shouldForceRefresh
            });

            const cachedMissionFeeds = feedService.getFeedsByList(selectedFeedList) || [];
            const cachedModernFeeds = cachedMissionFeeds.length > 0
              ? cachedMissionFeeds
              : feedService.getFeedsByList('modern-api');
            const fallbackFeeds = cachedModernFeeds && cachedModernFeeds.length > 0
              ? cachedModernFeeds
              : feedService.getFeeds();

            if (fallbackFeeds.length > 0) {
              setFeeds(fallbackFeeds);
              searchService.initializeFeeds(fallbackFeeds);
              setLastUpdated(new Date());
              setDiagnostics(modernResults.diagnostics ?? []);

              const nowNotice = Date.now();
              if (nowNotice - lastFallbackNoticeRef.current > 60000) {
                pushMessage('Live intel stream degraded. Showing cached mission data.', 'warning', {
                  priority: 'high'
                });
                lastFallbackNoticeRef.current = nowNotice;
              }
              return;
            }
          }

          const modernFeedsAsFeeds: Feed[] = modernFeeds.map(feedItem => {
            const sourceId = (feedItem.metadata?.sourceId as string) ?? feedItem.feedListId ?? 'modern-api';
            const sourceDefinition = getSourceByIdFn(mode, sourceId);
            const region = (deriveRegion(sourceDefinition, feedItem.tags ?? []) ?? 'GLOBAL') as NonNullable<Feed['region']>;
            const classification = deriveClassification(feedItem.verificationStatus) ?? 'UNCLASSIFIED';
            const resolvedContentType = feedItem.contentType ?? deriveContentType(feedItem.category, feedItem.tags ?? [], 'NEWS');
            const timestamp = normalizeTimestamp(feedItem.pubDate);

            const normalizedFeed: Feed = {
              id: feedItem.id,
              name: feedItem.author || 'Modern API',
              url: feedItem.link,
              title: feedItem.title,
              link: feedItem.link,
              pubDate: feedItem.pubDate,
              feedListId: 'modern-api',
              region,
              classification,
              timestamp
            };

            if (feedItem.description) {
              normalizedFeed.description = feedItem.description;
            }

            if (feedItem.content) {
              normalizedFeed.content = feedItem.content;
            }

            if (feedItem.author) {
              normalizedFeed.author = feedItem.author;
            }

            if (feedItem.categories?.length) {
              normalizedFeed.categories = feedItem.categories;
            }

            if (feedItem.media?.length) {
              normalizedFeed.media = feedItem.media;
            }

            if (feedItem.priority) {
              normalizedFeed.priority = feedItem.priority;
            }

            if (resolvedContentType) {
              normalizedFeed.contentType = resolvedContentType;
            }

            if (feedItem.tags?.length) {
              normalizedFeed.tags = feedItem.tags;
            }

            if (feedItem.source) {
              normalizedFeed.source = feedItem.source;
            }

            if (feedItem.metadata) {
              normalizedFeed.metadata = feedItem.metadata;
            }

            if (feedItem.category) {
              normalizedFeed.category = feedItem.category;
            }

            if (typeof feedItem.trustRating === 'number') {
              normalizedFeed.trustRating = feedItem.trustRating;
            }

            if (feedItem.verificationStatus) {
              normalizedFeed.verificationStatus = feedItem.verificationStatus;
            }

            if (typeof feedItem.dataQuality === 'number') {
              normalizedFeed.dataQuality = feedItem.dataQuality;
            }

            if (feedItem.missionMode) {
              normalizedFeed.missionMode = feedItem.missionMode;
            }

            return normalizedFeed;
          });

          if (isMonitoring && modernFeedsAsFeeds.length > 0) {
            const feedItemsForAlerts: AlertFeedItem[] = modernFeedsAsFeeds.map(feed => ({
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
              logger.debug('Component', `🚨 ${triggers.length} alert(s) triggered!`);
              setRecentAlertTriggers(triggers.length);
              setTimeoutFn(() => setRecentAlertTriggers(0), 30000);
            }
          }

          setFeeds(modernFeedsAsFeeds);
          searchService.initializeFeeds(modernFeedsAsFeeds);
          setLastUpdated(new Date());
          setDiagnostics(modernResults.diagnostics ?? []);
          return;
        }

        const modernSource = getSourceByIdFn(mode, selectedFeedList);
        if (modernSource) {
          logSuccess('049A', 'loadFeeds', 'Detected modern source selection', {
            sourceId: selectedFeedList,
            sourceName: modernSource.name
          });

          if (!modernSource.enabled) {
            logWarning('049B', 'loadFeeds', 'Selected source is disabled for this mission mode', {
              sourceId: modernSource.id,
              mode
            });
            setFeeds([]);
            searchService.clearData();
            setLoading(false);
            setError('This source is disabled for the current mission mode. Restore defaults to re-enable.');
            return;
          }

          const { items: normalizedItems, diagnostic } = await modernService.fetchSourceData(
            modernSource,
            shouldForceRefresh
          );
          const feedsForSource: Feed[] = normalizedItems.map((item, index) => {
            const pubDateIso =
              item.publishedAt instanceof Date
                ? item.publishedAt.toISOString()
                : new Date(item.publishedAt).toISOString();
            const region = (deriveRegion(modernSource, item.tags ?? []) ?? 'GLOBAL') as NonNullable<Feed['region']>;
            const classification = deriveClassification(item.verificationStatus) ?? 'UNCLASSIFIED';
            const resolvedContentType = deriveContentType(item.category, item.tags ?? [], 'INTEL');
            const timestamp = normalizeTimestamp(pubDateIso);

            const feedForSource: Feed = {
              id: item.id || `${modernSource.id}-${index}-${Date.now()}`,
              name: modernSource.name,
              url: item.url,
              title: item.title,
              link: item.url,
              pubDate: pubDateIso,
              feedListId: 'modern-api',
              description: item.summary || '',
              content: item.summary || '',
              author: item.source || modernSource.name,
              categories: item.tags || [],
              tags: item.tags || [],
              priority: ((item.priority ? item.priority.toUpperCase() : 'MEDIUM') as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'),
              source: item.source || modernSource.name,
              missionMode: mode,
              region,
              classification,
              timestamp
            };

            if (resolvedContentType) {
              feedForSource.contentType = resolvedContentType;
            }

            if (item.metadata) {
              feedForSource.metadata = item.metadata;
            }

            if (item.category) {
              feedForSource.category = item.category;
            }

            if (typeof item.trustRating === 'number') {
              feedForSource.trustRating = item.trustRating;
            }

            if (item.verificationStatus) {
              feedForSource.verificationStatus = item.verificationStatus;
            }

            if (typeof item.dataQuality === 'number') {
              feedForSource.dataQuality = item.dataQuality;
            }

            return feedForSource;
          });

          if (isMonitoring && feedsForSource.length > 0) {
            const feedItemsForAlerts: AlertFeedItem[] = feedsForSource.map(feed => ({
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
              logger.debug('Component', `🚨 ${triggers.length} alert(s) triggered!`);
              setRecentAlertTriggers(triggers.length);
              setTimeoutFn(() => setRecentAlertTriggers(0), 30000);
            }
          }

          setFeeds(feedsForSource);
          searchService.initializeFeeds(feedsForSource);
          setLastUpdated(new Date());
          setDiagnostics([diagnostic]);
          return;
        }

        const feedsByList = await feedService.getFeedsByList(selectedFeedList);

        if (isMonitoring && feedsByList.length > 0) {
          const feedItemsForAlerts: AlertFeedItem[] = feedsByList.map(feed => ({
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
            logger.debug('Component', `🚨 ${triggers.length} alert(s) triggered!`);
            setRecentAlertTriggers(triggers.length);
            setTimeoutFn(() => setRecentAlertTriggers(0), 30000);
          }
        }

        setFeeds(feedsByList);
        searchService.initializeFeeds(feedsByList);
        setLastUpdated(new Date());
  setDiagnostics([]);

        logger.debug('Component', 'Successfully loaded feeds');
      } catch (error) {
        console.error('Failed to load feeds:', error);
        setError(`Failed to load feeds: ${error instanceof Error ? error.message : 'Unknown error'}`);
        const nowNotice = Date.now();
        if (nowNotice - lastErrorNoticeRef.current > 60000) {
          pushMessage('Feed retrieval failed. Check diagnostics and try again.', 'error', {
            priority: 'high'
          });
          lastErrorNoticeRef.current = nowNotice;
        }
      } finally {
        const loadDuration =
          (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now()) - loadStart;
        setLoading(false);
        loadInProgressRef.current = false;
        logSuccess('052', 'loadFeeds', 'Load cycle completed', {
          selectedFeedList,
          reason,
          loadDurationMs: Number(loadDuration.toFixed(2))
        });
      }
    },
    [
      selectedFeedList,
      isMonitoring,
      checkFeedItems,
      searchService,
      setLoading,
      setError,
      logSuccess,
      logWarning,
      logger,
      modernService,
      feedService,
      setTimeoutFn,
      getSourceByIdFn,
      mode,
      profile.defaultFeedListId
    ]
  );

  useEffect(() => {
    const reason = prevSelectedFeedRef.current === null ? 'initial-load' : 'selected-feed-change';
    prevSelectedFeedRef.current = selectedFeedList;
    loadFeeds(true, reason);
  }, [selectedFeedList, loadFeeds]);

  useEffect(() => {
    if (prevModeRef.current !== mode) {
      prevModeRef.current = mode;
      loadFeeds(true, 'mission-mode-change');
    }
  }, [mode, loadFeeds]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleSourceToggle = () => loadFeeds(true, 'manual-refresh');
    window.addEventListener('intel-source-toggle', handleSourceToggle);
    return () => {
      window.removeEventListener('intel-source-toggle', handleSourceToggle);
    };
  }, [loadFeeds]);

  return {
    feeds,
    lastUpdated,
    recentAlertTriggers,
    diagnostics,
    loadFeeds
  };
};
