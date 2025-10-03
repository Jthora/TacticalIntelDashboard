import { useCallback, useState } from 'react';

import { Feed } from '../models/Feed';
import FeedService from '../services/FeedService';
import { modernFeedService } from '../services/ModernFeedService';
import { SearchService } from '../services/SearchService';
import { log } from '../utils/LoggerService';
import { getSourceById } from '../constants/ModernIntelligenceSources';
import { NormalizedDataItem } from '../types/ModernAPITypes';

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
  checkFeedItems: (feeds: AlertFeedItem[]) => any[];
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
  getSourceById?: typeof getSourceById;
}

const noop = () => undefined;

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
    getSourceById: getSourceByIdFn = getSourceById
  }: UseFeedLoaderDependencies = {}
) => {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [recentAlertTriggers, setRecentAlertTriggers] = useState<number>(0);

  const loadFeeds = useCallback(
    async (showLoading = true) => {
      logSuccess('046', 'loadFeeds', 'loadFeeds called', {
        selectedFeedList,
        showLoading,
        callStack: new Error().stack?.split('\n').slice(1, 4).join('\n')
      });

      if (!selectedFeedList) {
        logWarning('047', 'loadFeeds', 'No selectedFeedList provided, clearing feeds', { selectedFeedList });
        setFeeds([]);
        setLoading(false);
        searchService.clearData();
        return;
      }

      if (showLoading) {
        logSuccess('048', 'loadFeeds', 'Setting loading state', { selectedFeedList });
        setLoading(true, 'Loading intelligence feeds...');
        setError(null);
      }

      try {
        logger.debug('Component', `Loading feeds for list: ${selectedFeedList}`);
        logSuccess('049', 'loadFeeds', 'About to determine feed list type', { selectedFeedList });

        const modernSource = getSourceByIdFn(selectedFeedList);
        if (modernSource) {
          logSuccess('049A', 'loadFeeds', 'Detected modern source selection', {
            sourceId: selectedFeedList,
            sourceName: modernSource.name
          });

          const normalizedItems: NormalizedDataItem[] = await modernService.fetchSourceData(modernSource);
          const feedsForSource: Feed[] = normalizedItems.map((item, index) => ({
            id: item.id || `${modernSource.id}-${index}-${Date.now()}`,
            name: modernSource.name,
            url: item.url,
            title: item.title,
            link: item.url,
            pubDate:
              item.publishedAt instanceof Date
                ? item.publishedAt.toISOString()
                : new Date(item.publishedAt).toISOString(),
            feedListId: 'modern-api',
            description: item.summary || '',
            content: item.summary || '',
            author: item.source || modernSource.name,
            categories: item.tags || [],
            tags: item.tags || [],
            priority: ((item.priority ? item.priority.toUpperCase() : 'MEDIUM') as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'),
            contentType: 'INTEL',
            source: item.source || modernSource.name,
            ...(item.metadata ? { metadata: item.metadata } : {})
          }));

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
          setLoading(false);
          return;
        }

        if (
          selectedFeedList === 'modern-api' ||
          selectedFeedList === '1' ||
          selectedFeedList === 'primary-intel' ||
          selectedFeedList === 'security-feeds'
        ) {
          logSuccess('050', 'loadFeeds', 'Using Modern Feed Service path', {
            selectedFeedList,
            modernFeedServiceExists: !!modernService,
            modernFeedServiceType: typeof modernService
          });

          const modernResults = await modernService.fetchAllIntelligenceData();
          logSuccess('051', 'loadFeeds', 'Modern Feed Service returned results', {
            selectedFeedList,
            resultType: typeof modernResults,
            hasFeeds: !!modernResults.feeds,
            feedsLength: modernResults.feeds?.length,
            fetchedAt: modernResults.fetchedAt
          });

          const modernFeeds = modernResults.feeds;
          const modernFeedsAsFeeds: Feed[] = modernFeeds.map(feedItem => ({
            id: feedItem.id,
            name: feedItem.author || 'Modern API',
            url: feedItem.link,
            title: feedItem.title,
            link: feedItem.link,
            pubDate: feedItem.pubDate,
            feedListId: 'modern-api',
            ...(feedItem.description ? { description: feedItem.description } : {}),
            ...(feedItem.content ? { content: feedItem.content } : {}),
            ...(feedItem.author ? { author: feedItem.author } : {}),
            ...(feedItem.categories ? { categories: feedItem.categories } : {}),
            ...(feedItem.media ? { media: feedItem.media } : {}),
            ...(feedItem.priority ? { priority: feedItem.priority } : {}),
            ...(feedItem.contentType ? { contentType: feedItem.contentType } : {}),
            ...(feedItem.tags ? { tags: feedItem.tags } : {}),
            ...(feedItem.source ? { source: feedItem.source } : {}),
            ...(feedItem.metadata ? { metadata: feedItem.metadata } : {})
          }));

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
        } else {
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
        }

        logger.debug('Component', 'Successfully loaded feeds');
      } catch (error) {
        console.error('Failed to load feeds:', error);
        setError(`Failed to load feeds: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
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
      getSourceByIdFn
    ]
  );

  return {
    feeds,
    lastUpdated,
    recentAlertTriggers,
    loadFeeds
  };
};
