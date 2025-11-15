/**
 * Modern Feed Service
 * Replaces RSS-based architecture with CORS-friendly API integration
 * Provides real-time intelligence data from multiple sources
 */

import type { IntelligenceModeConfig } from '../constants/ModernIntelligenceSources';
import { MissionMode, DEFAULT_MISSION_MODE } from '../constants/MissionMode';
import {
  getDefaultIntelligenceConfig,
  getEnabledSources as getEnabledSourcesForMode,
  getSourceById as getSourceByIdForMode,
  getSourceCatalog,
  getSourcesWithRuntimeState as getSourcesWithRuntimeStateForMode
} from '../constants/MissionSourceRegistry';
import { FeedItem, FeedResults } from '../types/FeedTypes';
import { IntelligenceSource,NormalizedDataItem } from '../types/ModernAPITypes';
import { LocalStorageUtil } from '../utils/LocalStorageUtil';
import { log } from '../utils/LoggerService';
import { SourceToggleStore } from '../utils/SourceToggleStore';
import { modernAPIService } from './ModernAPIService';
import { marqueeProjectionService } from './MarqueeProjectionService';
import { FEED_SYSTEM_VERSION } from '../constants/FeedVersions';

// TDD Error Tracking for ModernFeedService
const TDD_FEED_ERRORS = {
  logError: (id: string, location: string, issue: string, data?: any) => {
    console.error(`TDD_ERROR_${id}`, {
      location: `ModernFeedService.${location}`,
      issue,
      data,
      timestamp: new Date().toISOString()
    });
  },
  logSuccess: (id: string, location: string, message: string, data?: any) => {
    console.log(`TDD_SUCCESS_${id}`, {
      location: `ModernFeedService.${location}`,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  },
  logWarning: (id: string, location: string, message: string, data?: any) => {
    console.warn(`TDD_WARNING_${id}`, {
      location: `ModernFeedService.${location}`,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }
};

class ModernFeedService {
  private lastFetchTime: Map<string, number> = new Map();
  private cachedResults: Map<string, NormalizedDataItem[]> = new Map();
  private readonly cacheStorageKeyBase = 'modernFeedCache';
  private readonly configStorageKeyBase = 'modernFeedConfig';
  private readonly currentVersion = FEED_SYSTEM_VERSION;
  private missionMode: MissionMode = DEFAULT_MISSION_MODE;

  constructor() {
    this.initializeService();
  }

  private initializeService(): void {
    // Load cached data
    this.loadCachedData();
    SourceToggleStore.setActiveMode(this.missionMode);
    
    // Check for version upgrade
    const storedVersion = LocalStorageUtil.getItem<string>('modernFeedVersion');
    if (storedVersion !== this.currentVersion) {
      log.info('ModernFeedService', 'Upgrading to modern API architecture');
      this.clearLegacyData();
      LocalStorageUtil.setItem('modernFeedVersion', this.currentVersion);
    }

    log.info('ModernFeedService', 'Modern Feed Service initialized');
  }

  setMissionMode(mode: MissionMode): void {
    if (mode === this.missionMode) {
      return;
    }

    this.missionMode = mode;
    SourceToggleStore.setActiveMode(mode);
    this.clearInMemoryCaches();
    modernAPIService.clearCache();
    LocalStorageUtil.removeItem(this.getCacheStorageKey(mode));
  }

  private getCacheStorageKey(mode: MissionMode = this.missionMode): string {
    return `${this.cacheStorageKeyBase}:${mode}`;
  }

  private getConfigStorageKey(mode: MissionMode = this.missionMode): string {
    return `${this.configStorageKeyBase}:${mode}`;
  }

  private getCacheKeyForSource(sourceId: string, mode: MissionMode = this.missionMode): string {
    return `${mode}:${sourceId}`;
  }

  private getModeConfig(mode: MissionMode = this.missionMode): IntelligenceModeConfig {
    return getDefaultIntelligenceConfig(mode);
  }

  private clearInMemoryCaches(): void {
    this.cachedResults.clear();
    this.lastFetchTime.clear();
  }

  /**
   * Fetch intelligence data from all enabled sources
   */
  async fetchAllIntelligenceData(forceRefresh: boolean = false): Promise<FeedResults> {
    TDD_FEED_ERRORS.logSuccess('023', 'fetchAllIntelligenceData', 'Starting intelligence data fetch', { forceRefresh });
    log.info('ModernFeedService', 'Fetching intelligence data from modern APIs');
    const mode = this.missionMode;
    
    // TDD_ERROR_024: Validate getEnabledSources function
    let enabledSources: IntelligenceSource[];
    try {
      enabledSources = getEnabledSourcesForMode(mode);
      TDD_FEED_ERRORS.logSuccess('024', 'fetchAllIntelligenceData', 'Enabled sources retrieved', { 
        count: enabledSources.length,
        sources: enabledSources.map(s => ({ id: s.id, name: s.name, enabled: s.enabled }))
      });
    } catch (error) {
      TDD_FEED_ERRORS.logError('025', 'fetchAllIntelligenceData', 'Failed to get enabled sources', error);
      throw error;
    }
    
    // TDD_ERROR_026: Check if we have any sources
    if (enabledSources.length === 0) {
      TDD_FEED_ERRORS.logError('026', 'fetchAllIntelligenceData', 'No enabled sources found', { mode });
      return { feeds: [], fetchedAt: new Date().toISOString() };
    }
    
    const fetchPromises = enabledSources.map(source => {
      TDD_FEED_ERRORS.logSuccess('027', 'fetchAllIntelligenceData', 'Creating fetch promise for source', { 
        sourceId: source.id, 
        sourceName: source.name,
        enabled: source.enabled,
        hasEndpoint: !!source.endpoint
      });
      return this.fetchSourceData(source, forceRefresh);
    });

    try {
      TDD_FEED_ERRORS.logSuccess('028', 'fetchAllIntelligenceData', 'Starting Promise.allSettled', { promiseCount: fetchPromises.length });
      const results = await Promise.allSettled(fetchPromises);
      TDD_FEED_ERRORS.logSuccess('029', 'fetchAllIntelligenceData', 'Promise.allSettled completed', { 
        totalResults: results.length,
        fulfilled: results.filter(r => r.status === 'fulfilled').length,
        rejected: results.filter(r => r.status === 'rejected').length
      });
      
      const allItems: NormalizedDataItem[] = [];

      results.forEach((result, index) => {
        const source = enabledSources[index];
        if (result.status === 'fulfilled') {
          const itemCount = result.value.length;
          allItems.push(...result.value);
          if ((source as any).marqueeEnabled !== false) {
            try { marqueeProjectionService.ingest(source.id, result.value); } catch (e) { /* swallow */ }
          }
          TDD_FEED_ERRORS.logSuccess('030', 'fetchAllIntelligenceData', 'Source fetch succeeded', { 
            sourceId: source.id,
            sourceName: source.name,
            itemCount,
            sampleItems: result.value.slice(0, 2).map(item => ({ id: item.id, title: item.title.substring(0, 50) }))
          });
          log.debug('ModernFeedService', `Fetched ${result.value.length} items from ${enabledSources[index].name}`);
        } else {
          TDD_FEED_ERRORS.logError('031', 'fetchAllIntelligenceData', 'Source fetch failed', {
            sourceId: source.id,
            sourceName: source.name,
            error: result.reason,
            endpoint: source.endpoint?.baseUrl
          });
          log.warn('ModernFeedService', `Failed to fetch from ${enabledSources[index].name}: ${result.reason}`);
        }
      });

      // TDD_ERROR_032: Check total items collected
      TDD_FEED_ERRORS.logSuccess('032', 'fetchAllIntelligenceData', 'All items collected', { 
        totalItems: allItems.length,
        sources: enabledSources.length,
        sampleItems: allItems.slice(0, 3).map(item => ({ 
          id: item.id, 
          title: item.title.substring(0, 50),
          source: item.source
        }))
      });
      
      if (allItems.length === 0) {
        TDD_FEED_ERRORS.logWarning('033', 'fetchAllIntelligenceData', 'No items collected from any source', {
          enabledSourcesCount: enabledSources.length,
          enabledSources: enabledSources.map(s => ({ id: s.id, name: s.name, enabled: s.enabled }))
        });
      }

      // Sort by priority and recency
      TDD_FEED_ERRORS.logSuccess('034', 'fetchAllIntelligenceData', 'Starting data sorting', { itemCount: allItems.length });
      const sortedItems = this.sortIntelligenceData(allItems);
      TDD_FEED_ERRORS.logSuccess('035', 'fetchAllIntelligenceData', 'Data sorting completed', { itemCount: sortedItems.length });
      
      // Convert to legacy FeedItem format for compatibility
      TDD_FEED_ERRORS.logSuccess('036', 'fetchAllIntelligenceData', 'Starting legacy format conversion', { itemCount: sortedItems.length });
      const feedItems = this.convertToLegacyFormat(sortedItems);
      TDD_FEED_ERRORS.logSuccess('037', 'fetchAllIntelligenceData', 'Legacy format conversion completed', { 
        itemCount: feedItems.length,
        sampleFeedItems: feedItems.slice(0, 2).map(item => ({
          id: item.id,
          title: item.title.substring(0, 50),
          description: item.description?.substring(0, 50),
          author: item.author,
          priority: item.priority,
          tags: item.tags
        }))
      });

      const feedResults: FeedResults = {
        feeds: feedItems,
        fetchedAt: new Date().toISOString()
      };

      // Cache the results
      TDD_FEED_ERRORS.logSuccess('038', 'fetchAllIntelligenceData', 'Caching results', { itemCount: feedItems.length });
      this.cacheResults(feedResults);
      
      TDD_FEED_ERRORS.logSuccess('039', 'fetchAllIntelligenceData', 'Intelligence data fetch completed successfully', { 
        totalItems: feedItems.length,
        fetchedAt: feedResults.fetchedAt,
        finalResult: feedResults.feeds.length > 0 ? 'SUCCESS' : 'EMPTY_RESULT'
      });
      
      log.info('ModernFeedService', `Fetched total of ${feedItems.length} intelligence items`);
      
      return feedResults;

    } catch (error) {
      TDD_FEED_ERRORS.logError('040', 'fetchAllIntelligenceData', 'Critical error in fetch process', {
        error: error instanceof Error ? error.message : error,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      
      log.error('ModernFeedService', `Error fetching intelligence data: ${error}`);
      
      // Return cached data as fallback
      TDD_FEED_ERRORS.logWarning('041', 'fetchAllIntelligenceData', 'Attempting to return cached data as fallback', {});
      const cachedResults = this.getCachedResults();
      if (cachedResults) {
        TDD_FEED_ERRORS.logSuccess('042', 'fetchAllIntelligenceData', 'Cached data returned as fallback', { itemCount: cachedResults.feeds.length });
      } else {
        TDD_FEED_ERRORS.logError('043', 'fetchAllIntelligenceData', 'No cached data available, returning empty result', {});
      }
      return cachedResults || { feeds: [], fetchedAt: new Date().toISOString() };
    }
  }

  /**
   * Fetch data from a specific intelligence source
   */
  async fetchSourceData(source: IntelligenceSource, forceRefresh: boolean = false): Promise<NormalizedDataItem[]> {
    const cacheKey = this.getCacheKeyForSource(source.id);
    const now = Date.now();
    const lastFetch = this.lastFetchTime.get(cacheKey) || 0;
    const timeSinceLastFetch = now - lastFetch;

    // Check if refresh is needed
    if (!forceRefresh && timeSinceLastFetch < source.refreshInterval) {
      const cached = this.cachedResults.get(cacheKey);
      if (cached) {
        log.debug('ModernFeedService', `Using cached data for ${source.name}`);
        return cached;
      }
    }

    const attemptedPaths: string[] = [];

    try {
      log.info('ModernFeedService', `Fetching fresh data from ${source.name}`);
      
      // Determine API paths (including fallbacks when available)
      const apiPaths = this.getApiPathsForSource(source);
      if (apiPaths.length === 0) {
        throw new Error(`No API paths configured for source ${source.id}`);
      }

      let normalizedData: NormalizedDataItem[] = [];

      for (let i = 0; i < apiPaths.length; i++) {
        const apiPath = apiPaths[i];
        attemptedPaths.push(apiPath);

        const modeConfig = this.getModeConfig();
        const result = await modernAPIService.fetchIntelligenceData(
          source.endpoint,
          apiPath,
          source.normalizer,
          {
            cache: true,
            maxAge: source.refreshInterval,
            timeout: modeConfig.timeout
          }
        );

        const hasItems = result.length > 0;
        const hasMeaningfulItems = hasItems ? this.hasMeaningfulIntelligence(result) : false;

        if (hasItems && hasMeaningfulItems) {
          normalizedData = result;
          if (i > 0) {
            TDD_FEED_ERRORS.logSuccess('075', 'fetchSourceData', 'Fallback proxy succeeded with data', {
              sourceId: source.id,
              fallbackIndex: i,
              apiPath
            });
          }
          break;
        }

        const hasMorePaths = i < apiPaths.length - 1;

        if (hasItems && !hasMeaningfulItems) {
          TDD_FEED_ERRORS.logWarning('074A', 'fetchSourceData', 'Normalized data appears to be generic fallback, attempting next proxy', {
            sourceId: source.id,
            attemptedProxy: apiPath,
            itemCount: result.length
          });

          if (hasMorePaths) {
            continue;
          }

          normalizedData = [];
          break;
        }

        if (hasMorePaths) {
          TDD_FEED_ERRORS.logWarning('074', 'fetchSourceData', 'Primary proxy yielded no items, attempting fallback', {
            sourceId: source.id,
            attemptedProxy: apiPath
          });
          continue;
        }

        normalizedData = result;
        break;
      }

      if (normalizedData.length === 0 && source.id === 'icij-investigations') {
        throw new Error('ICIJ investigative feed returned no data from available proxies');
      }

      // Update last fetch time
  this.lastFetchTime.set(cacheKey, now);
      
      // Cache the results
  this.cachedResults.set(cacheKey, normalizedData);

      // Ingest the freshly fetched normalized data into marquee projection (if enabled)
      if ((source as any).marqueeEnabled !== false) {
        try { marqueeProjectionService.ingest(source.id, normalizedData); } catch {}
      }
      
      // Update source health
      this.updateSourceHealth(source.id, true);

      return normalizedData;

    } catch (error) {
      TDD_FEED_ERRORS.logError('076', 'fetchSourceData', 'Failed to fetch source data after fallbacks', {
        sourceId: source.id,
        attemptedPaths,
        error: error instanceof Error ? error.message : error
      });
      log.error('ModernFeedService', `Error fetching from ${source.name}: ${error}`);
      
      // Update source health
      this.updateSourceHealth(source.id, false);
      
      // Return cached data if available
      return this.cachedResults.get(cacheKey) || [];
    }
  }

  /**
   * Get specific category of intelligence data
   */
  async fetchByCategory(category: string, forceRefresh: boolean = false): Promise<NormalizedDataItem[]> {
    const enabledSources = getEnabledSourcesForMode(this.missionMode).filter(source =>
      source.tags.includes(category.toLowerCase()) ||
      source.endpoint.category === category
    );

    const fetchPromises = enabledSources.map(source =>
      this.fetchSourceData(source, forceRefresh)
    );

    try {
      const results = await Promise.allSettled(fetchPromises);
      const categoryItems: NormalizedDataItem[] = [];

      results.forEach(result => {
        if (result.status === 'fulfilled') {
          categoryItems.push(...result.value);
        }
      });

      return this.sortIntelligenceData(categoryItems);

    } catch (error) {
      log.error('ModernFeedService', `Error fetching category ${category}: ${error}`);
      return [];
    }
  }

  /**
   * Get high-priority intelligence items
   */
  async getHighPriorityIntelligence(): Promise<NormalizedDataItem[]> {
    const allData = await this.fetchAllIntelligenceData();
    const normalizedItems = this.convertFromLegacyFormat(allData.feeds);
    
    return normalizedItems.filter(item => 
      item.priority === 'critical' || item.priority === 'high'
    );
  }

  /**
   * Get intelligence summary for dashboard
   */
  async getIntelligenceSummary(): Promise<{
    totalItems: number;
    criticalAlerts: number;
    lastUpdate: string;
    sourceHealth: Record<string, number>;
    categories: Record<string, number>;
  }> {
    const allData = await this.fetchAllIntelligenceData();
    const normalizedItems = this.convertFromLegacyFormat(allData.feeds);
    
    const summary = {
      totalItems: normalizedItems.length,
      criticalAlerts: normalizedItems.filter(item => item.priority === 'critical').length,
      lastUpdate: allData.fetchedAt,
      sourceHealth: this.getSourceHealthSummary(),
      categories: this.getCategorySummary(normalizedItems)
    };

    return summary;
  }

  /**
   * Clear all cached data and force refresh
   */
  async clearCacheAndRefresh(): Promise<FeedResults> {
    log.info('ModernFeedService', 'Clearing cache and forcing refresh');
    
    this.clearInMemoryCaches();
    modernAPIService.clearCache();
    LocalStorageUtil.removeItem(this.getCacheStorageKey());
    
    return await this.fetchAllIntelligenceData(true);
  }

  /**
   * Get available intelligence sources
   */
  getAvailableSources(): IntelligenceSource[] {
    return getSourcesWithRuntimeStateForMode(this.missionMode);
  }

  /**
   * Enable/disable a specific source
   */
  toggleSource(sourceId: string, enabled: boolean): void {
    const source = getSourceByIdForMode(this.missionMode, sourceId);
    if (source) {
      SourceToggleStore.setOverride(sourceId, enabled, this.missionMode);
      this.saveConfiguration();
      if (!enabled) {
        const cacheKey = this.getCacheKeyForSource(sourceId);
        this.cachedResults.delete(cacheKey);
        this.lastFetchTime.delete(cacheKey);
      }
      log.info('ModernFeedService', `${enabled ? 'Enabled' : 'Disabled'} source: ${source.name} (${this.missionMode})`);
    }
  }

  // Private helper methods

  private buildAPIPath(source: IntelligenceSource): string {
    // Build specific API paths based on source type
    switch (source.id) {
      case 'noaa-weather-alerts':
        return '/alerts/active?status=actual&message_type=alert';
      
      case 'usgs-earthquakes':
        return '/summary/all_day.geojson';
      
      case 'github-security':
        return '/advisories';
      
      case 'hackernews-tech':
        return '/topstories.json';
      
      case 'coingecko-crypto':
        return '/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false';
      
      case 'reddit-worldnews':
        return '/r/worldnews/hot.json?limit=25';
      
      case 'reddit-security':
        return '/r/cybersecurity/hot.json?limit=15';

      case 'spaceforce-launch-watch':
        return '/planetary/apod';

      case 'spaceforce-space-weather':
        return '/alerts/active?status=actual&message_type=alert';

      case 'spaceforce-orbital-debris':
        return `/api?url=${encodeURIComponent('https://www.space.com/feeds/all')}`;

      case 'spaceforce-sda-ops':
        return `/api?url=${encodeURIComponent('https://www.spaceforce.mil/DesktopModules/ArticleCS/RSS.ashx?ContentType=1&Site=106&Category=all')}`;

      case 'spaceforce-deep-space-network':
        return '/planetary/apod';

      case 'spaceforce-reddit-space':
        return '/r/space/hot.json?limit=25';

      case 'earth-alliance-news':
        return `/api?url=${encodeURIComponent('https://earthalliance.news/feed/')}`;

      case 'intercept-investigations':
        return `/api?url=${encodeURIComponent('https://theintercept.com/feed/')}`;

      case 'propublica-investigations':
        return `/api?url=${encodeURIComponent('https://www.propublica.org/feeds/propublica-main')}`;

      case 'icij-investigations':
        return 'https://feed2json.org/convert?url=' + encodeURIComponent('https://www.icij.org/feed/');

      case 'bellingcat-investigations':
        return `/api?url=${encodeURIComponent('https://www.bellingcat.com/feed/')}`;

      case 'ddosecrets-investigations':
        return `/api?url=${encodeURIComponent('https://torrents.ddosecrets.com/releases.xml')}`;

      case 'occrp-investigations':
        return `/api?url=${encodeURIComponent('https://www.occrp.org/en/investigations/feed')}`;

      case 'krebs-security':
        return `/api?url=${encodeURIComponent('https://krebsonsecurity.com/feed/')}`;

      case 'threatpost-security':
        return `/api?url=${encodeURIComponent('https://threatpost.com/feed/')}`;

      case 'wired-security':
        return `/api?url=${encodeURIComponent('https://www.wired.com/feed/category/security/latest/rss')}`;

      case 'grayzone-geopolitics':
        return `/api?url=${encodeURIComponent('https://thegrayzone.com/feed/')}`;

      case 'mintpress-geopolitics':
        return `/api?url=${encodeURIComponent('https://www.mintpressnews.com/feed/')}`;

      case 'geopolitical-economy-report':
        return `/api?url=${encodeURIComponent('https://geopoliticaleconomy.com/feed/')}`;

      case 'eff-updates':
        return `/api?url=${encodeURIComponent('https://www.eff.org/rss/updates')}`;

      case 'privacy-international':
        return `/api?url=${encodeURIComponent('https://privacyinternational.org/rss.xml')}`;

      case 'opensecrets-transparency':
        return `https://api.allorigins.win/get?url=${encodeURIComponent('https://www.opensecrets.org/news')}`;

      case 'transparency-international':
        return `/api?url=${encodeURIComponent('https://www.transparency.org/en/rss')}`;

      case 'inside-climate-news':
        return `/api?url=${encodeURIComponent('https://insideclimatenews.org/feed/')}`;

      case 'guardian-environment':
        return `/api?url=${encodeURIComponent('https://www.theguardian.com/environment/rss')}`;

      case 'future-of-life-institute':
        return `/api?url=${encodeURIComponent('https://futureoflife.org/feed/')}`;

      case 'nasa-space-data':
        return '/planetary/apod';
      
      default:
        return Object.values(source.endpoint.endpoints)[0] || '';
    }
  }

  private getApiPathsForSource(source: IntelligenceSource): string[] {
    const buildRSSFallbacks = (feedUrl: string, includeFeed2Json: boolean = true): string[] => {
      const paths: string[] = [
        `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`,
        this.buildAPIPath(source)
      ];

      if (includeFeed2Json) {
        paths.push(`https://feed2json.org/convert?url=${encodeURIComponent(feedUrl)}`);
      }

      return Array.from(new Set(paths.filter(Boolean)));
    };

    if (source.id === 'icij-investigations') {
      const feedUrl = 'https://www.icij.org/feed/';
      const feed2JsonUrl = `https://feed2json.org/convert?url=${encodeURIComponent(feedUrl)}`;
      const allOriginsProxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(feed2JsonUrl)}`;
      const rss2JsonPath = `/api?url=${encodeURIComponent(feedUrl)}`;

      return [
        allOriginsProxy,
        this.buildAPIPath(source),
        rss2JsonPath
      ];
    }

    if (source.id === 'occrp-investigations') {
      const feedUrl = 'https://www.occrp.org/en/investigations/feed';
      const allOriginsJson = `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`;
      const rss2JsonPath = this.buildAPIPath(source);
      return [allOriginsJson, rss2JsonPath];
    }

    if (source.id === 'krebs-security') {
      return buildRSSFallbacks('https://krebsonsecurity.com/feed/');
    }

    if (source.id === 'threatpost-security') {
      return buildRSSFallbacks('https://threatpost.com/feed/');
    }

    if (source.id === 'wired-security') {
      return buildRSSFallbacks('https://www.wired.com/feed/category/security/latest/rss');
    }

    if (source.id === 'grayzone-geopolitics') {
      return buildRSSFallbacks('https://thegrayzone.com/feed/');
    }

    if (source.id === 'mintpress-geopolitics') {
      return buildRSSFallbacks('https://www.mintpressnews.com/feed/');
    }

    if (source.id === 'geopolitical-economy-report') {
      return buildRSSFallbacks('https://geopoliticaleconomy.com/feed/');
    }

    if (source.id === 'eff-updates') {
      return buildRSSFallbacks('https://www.eff.org/rss/updates');
    }

    if (source.id === 'privacy-international') {
      return buildRSSFallbacks('https://privacyinternational.org/rss.xml');
    }

    if (source.id === 'transparency-international') {
      return buildRSSFallbacks('https://www.transparency.org/en/rss');
    }

    if (source.id === 'inside-climate-news') {
      return buildRSSFallbacks('https://insideclimatenews.org/feed/');
    }

    if (source.id === 'guardian-environment') {
      const feedUrl = 'https://www.theguardian.com/environment/rss';
      const paths = buildRSSFallbacks(feedUrl);
      paths.push(`https://r.jina.ai/https://www.theguardian.com/environment/rss`);
      return Array.from(new Set(paths));
    }

    if (source.id === 'future-of-life-institute') {
      return buildRSSFallbacks('https://futureoflife.org/feed/');
    }

    if (source.id === 'opensecrets-transparency') {
      const baseUrl = 'https://www.opensecrets.org/news';
      const paths = [
        this.buildAPIPath(source),
        `https://api.allorigins.win/get?url=${encodeURIComponent(`${baseUrl}?view=all`)}`,
        `https://r.jina.ai/https://www.opensecrets.org/news`
      ];
      return Array.from(new Set(paths.filter(Boolean)));
    }

    return [this.buildAPIPath(source)];
  }

  private sortIntelligenceData(items: NormalizedDataItem[]): NormalizedDataItem[] {
    return items.sort((a, b) => {
      // First sort by priority
      const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by trust rating
      const trustDiff = b.trustRating - a.trustRating;
      if (trustDiff !== 0) return trustDiff;
      
      // Finally by publication date
      return b.publishedAt.getTime() - a.publishedAt.getTime();
    });
  }

  private convertToLegacyFormat(items: NormalizedDataItem[]): FeedItem[] {
    console.log(`TDD_DEBUG: Converting ${items.length} items to legacy format`);
    
    const validItems: FeedItem[] = [];
    let skippedCount = 0;
    
    items.forEach((item, index) => {
      try {
        // Validate required fields - skip item if critical fields are missing
        if (!item.id && !item.title) {
          console.warn(`TDD_WARNING: Item ${index} missing both id and title, skipping`);
          skippedCount++;
          return;
        }
        
        if (!item.url) {
          console.warn(`TDD_WARNING: Item ${index} missing url, skipping`);
          skippedCount++;
          return;
        }

        // Ensure publishedAt is a valid Date
        let pubDateStr: string;
        if (item.publishedAt instanceof Date) {
          // Check if the Date object is valid
          if (isNaN(item.publishedAt.getTime())) {
            console.warn(`TDD_WARNING: Invalid Date object for item ${index}, using current time`);
            pubDateStr = new Date().toISOString();
          } else {
            pubDateStr = item.publishedAt.toISOString();
          }
        } else if (typeof item.publishedAt === 'string') {
          try {
            const dateObj = new Date(item.publishedAt);
            if (isNaN(dateObj.getTime())) {
              console.warn(`TDD_WARNING: Invalid date string "${item.publishedAt}" for item ${index}, using current time`);
              pubDateStr = new Date().toISOString();
            } else {
              pubDateStr = dateObj.toISOString();
            }
          } catch (dateError) {
            console.warn(`TDD_WARNING: Error parsing date string "${item.publishedAt}" for item ${index}:`, dateError);
            pubDateStr = new Date().toISOString();
          }
        } else {
          console.warn(`TDD_WARNING: Invalid publishedAt type for item ${index}:`, typeof item.publishedAt, item.publishedAt);
          pubDateStr = new Date().toISOString(); // Fallback to current time
        }

        const legacyItem: FeedItem = {
          id: item.id || `item-${index}-${Date.now()}`,
          title: item.title || 'Untitled',
          link: item.url,
          pubDate: pubDateStr,
          description: item.summary || '',
          content: item.summary || '',
          feedListId: 'modern-api',
          author: item.source || 'Unknown',
          categories: item.tags || [],
          tags: item.tags || [], // Add tags field for new UI
          priority: this.mapPriorityToUppercase(item.priority || 'medium'), // Convert to uppercase
          contentType: this.mapCategoryToContentType(item.category || 'general'),
          source: item.source || 'Unknown',
          trustRating: item.trustRating || 50,
          verificationStatus: item.verificationStatus || 'UNVERIFIED',
          lastValidated: new Date().toISOString(),
          responseTime: item.responseTime || 0,
          // Include metadata for additional features like comment counts
          ...(item.metadata ? { metadata: item.metadata } : {})
        };

        validItems.push(legacyItem);
      } catch (error) {
        console.error(`TDD_ERROR: Failed to convert item ${index} to legacy format:`, error, item);
        skippedCount++;
        // Don't throw - just skip this item and continue with others
      }
    });
    
    console.log(`TDD_DEBUG: Conversion complete - ${validItems.length} valid items, ${skippedCount} skipped`);
    return validItems;
  }

  private hasMeaningfulIntelligence(items: NormalizedDataItem[]): boolean {
    return items.some(item => !this.isGenericFallbackItem(item));
  }

  private isGenericFallbackItem(item: NormalizedDataItem): boolean {
    const metadata = (item.metadata ?? {}) as Record<string, any>;
    if (metadata && metadata.__genericFallback === true) {
      return true;
    }

    const title = (item.title || '').trim().toLowerCase();
    const summary = (item.summary || '').trim().toLowerCase();

    const hasMeaningfulTitle = title.length > 0 && title !== 'untitled';
    const hasMeaningfulSummary = summary.length > 0 && summary !== 'no description available';

    return !hasMeaningfulTitle && !hasMeaningfulSummary;
  }

  /**
   * Convert lowercase priority to uppercase for UI compatibility
   */
  private mapPriorityToUppercase(priority: string): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
    switch (priority.toLowerCase()) {
      case 'critical': return 'CRITICAL';
      case 'high': return 'HIGH';
      case 'medium': return 'MEDIUM';
      case 'low': return 'LOW';
      default: return 'MEDIUM';
    }
  }

  /**
   * Map API category to content type
   */
  private mapCategoryToContentType(category: string): 'INTEL' | 'NEWS' | 'ALERT' | 'THREAT' {
    const categoryMap: Record<string, 'INTEL' | 'NEWS' | 'ALERT' | 'THREAT'> = {
      'security': 'THREAT',
      'weather-alert': 'ALERT',
      'earthquake': 'ALERT',
      'space': 'INTEL',
      'financial': 'NEWS',
      'technology': 'INTEL',
      'social': 'NEWS',
      'government': 'INTEL',
      'military': 'INTEL',
      'cyberdefense': 'THREAT'
    };
    
    return categoryMap[category] || 'NEWS';
  }

  private convertFromLegacyFormat(feedItems: FeedItem[]): NormalizedDataItem[] {
    return feedItems.map(item => ({
      id: item.id,
      title: item.title,
      summary: item.description,
      url: item.link,
      publishedAt: new Date(item.pubDate),
      source: item.author || 'Unknown',
      category: item.categories?.[0] || 'general',
      tags: item.categories || [],
      priority: 'medium' as const,
      trustRating: item.trustRating || 50,
      verificationStatus: item.verificationStatus || 'UNVERIFIED',
      dataQuality: 70
    }));
  }

  private updateSourceHealth(sourceId: string, success: boolean): void {
    const catalog = getSourceCatalog(this.missionMode);
    const allSources = [
      ...catalog.primary,
      ...catalog.secondary,
      ...catalog.social
    ];
    const source = allSources.find(entry => entry.id === sourceId);
    if (!source) return;

    // Simple health score update
    if (success) {
      source.healthScore = Math.min(100, source.healthScore + 1);
    } else {
      source.healthScore = Math.max(0, source.healthScore - 5);
    }

    source.lastFetched = new Date();
  }

  private getSourceHealthSummary(): Record<string, number> {
    const enabledSources = getEnabledSourcesForMode(this.missionMode);
    const healthSummary: Record<string, number> = {};
    
    enabledSources.forEach(source => {
      healthSummary[source.id] = source.healthScore;
    });
    
    return healthSummary;
  }

  private getCategorySummary(items: NormalizedDataItem[]): Record<string, number> {
    const categorySummary: Record<string, number> = {};
    
    items.forEach(item => {
      categorySummary[item.category] = (categorySummary[item.category] || 0) + 1;
    });
    
    return categorySummary;
  }

  private cacheResults(results: FeedResults): void {
    try {
      LocalStorageUtil.setItem(this.getCacheStorageKey(), {
        results,
        timestamp: Date.now()
      });
    } catch (error) {
      log.warn('ModernFeedService', `Failed to cache results: ${error}`);
    }
  }

  private getCachedResults(): FeedResults | null {
    try {
      const cached = LocalStorageUtil.getItem<{
        results: FeedResults;
        timestamp: number;
      }>(this.getCacheStorageKey());

      if (!cached) return null;

      // Check if cache is still valid (30 minutes)
      const maxAge = 30 * 60 * 1000;
      if (Date.now() - cached.timestamp > maxAge) {
        LocalStorageUtil.removeItem(this.getCacheStorageKey());
        return null;
      }

      return cached.results;
    } catch (error) {
      log.warn('ModernFeedService', `Failed to load cached results: ${error}`);
      return null;
    }
  }

  private loadCachedData(): void {
    // Load cached data for quick startup
    const cached = this.getCachedResults();
    if (cached) {
      log.info('ModernFeedService', 'Loaded cached intelligence data');
    }
  }

  private saveConfiguration(): void {
    try {
      LocalStorageUtil.setItem(this.getConfigStorageKey(), {
        sources: getEnabledSourcesForMode(this.missionMode),
        lastUpdate: Date.now()
      });
    } catch (error) {
      log.warn('ModernFeedService', `Failed to save configuration: ${error}`);
    }
  }

  private clearLegacyData(): void {
    // Clear old RSS-based cache keys
    const legacyKeys = ['feeds', 'feedLists', 'feedsVersion', 'feedCache'];
    legacyKeys.forEach(key => {
      LocalStorageUtil.removeItem(key);
    });
    
    log.info('ModernFeedService', 'Cleared legacy RSS data');
  }
}

// Export singleton instance
export const modernFeedService = new ModernFeedService();
