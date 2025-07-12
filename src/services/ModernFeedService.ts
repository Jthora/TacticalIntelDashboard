/**
 * Modern Feed Service
 * Replaces RSS-based architecture with CORS-friendly API integration
 * Provides real-time intelligence data from multiple sources
 */

import { NormalizedDataItem, IntelligenceSource } from '../types/ModernAPITypes';
import { FeedItem, FeedResults } from '../types/FeedTypes';
import { modernAPIService } from './ModernAPIService';
import { 
  PRIMARY_INTELLIGENCE_SOURCES,
  DEFAULT_INTELLIGENCE_CONFIG,
  getEnabledSources,
  getSourceById
} from '../constants/ModernIntelligenceSources';
import { LocalStorageUtil } from '../utils/LocalStorageUtil';
import { log } from '../utils/LoggerService';

class ModernFeedService {
  private lastFetchTime: Map<string, number> = new Map();
  private cachedResults: Map<string, NormalizedDataItem[]> = new Map();
  private readonly cacheStorageKey = 'modernFeedCache';
  private readonly configStorageKey = 'modernFeedConfig';
  private readonly currentVersion = '3.0-modern-api';

  constructor() {
    this.initializeService();
  }

  private initializeService(): void {
    // Load cached data
    this.loadCachedData();
    
    // Check for version upgrade
    const storedVersion = LocalStorageUtil.getItem<string>('modernFeedVersion');
    if (storedVersion !== this.currentVersion) {
      log.info('ModernFeedService', 'Upgrading to modern API architecture');
      this.clearLegacyData();
      LocalStorageUtil.setItem('modernFeedVersion', this.currentVersion);
    }

    log.info('ModernFeedService', 'Modern Feed Service initialized');
  }

  /**
   * Fetch intelligence data from all enabled sources
   */
  async fetchAllIntelligenceData(forceRefresh: boolean = false): Promise<FeedResults> {
    log.info('ModernFeedService', 'Fetching intelligence data from modern APIs');
    
    const enabledSources = getEnabledSources();
    const fetchPromises = enabledSources.map(source => 
      this.fetchSourceData(source, forceRefresh)
    );

    try {
      const results = await Promise.allSettled(fetchPromises);
      const allItems: NormalizedDataItem[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allItems.push(...result.value);
          log.debug('ModernFeedService', `Fetched ${result.value.length} items from ${enabledSources[index].name}`);
        } else {
          log.warn('ModernFeedService', `Failed to fetch from ${enabledSources[index].name}: ${result.reason}`);
        }
      });

      // Sort by priority and recency
      const sortedItems = this.sortIntelligenceData(allItems);
      
      // Convert to legacy FeedItem format for compatibility
      const feedItems = this.convertToLegacyFormat(sortedItems);

      const feedResults: FeedResults = {
        feeds: feedItems,
        fetchedAt: new Date().toISOString()
      };

      // Cache the results
      this.cacheResults(feedResults);
      
      log.info('ModernFeedService', `Fetched total of ${feedItems.length} intelligence items`);
      
      return feedResults;

    } catch (error) {
      log.error('ModernFeedService', `Error fetching intelligence data: ${error}`);
      
      // Return cached data as fallback
      const cachedResults = this.getCachedResults();
      return cachedResults || { feeds: [], fetchedAt: new Date().toISOString() };
    }
  }

  /**
   * Fetch data from a specific intelligence source
   */
  async fetchSourceData(source: IntelligenceSource, forceRefresh: boolean = false): Promise<NormalizedDataItem[]> {
    const now = Date.now();
    const lastFetch = this.lastFetchTime.get(source.id) || 0;
    const timeSinceLastFetch = now - lastFetch;

    // Check if refresh is needed
    if (!forceRefresh && timeSinceLastFetch < source.refreshInterval) {
      const cached = this.cachedResults.get(source.id);
      if (cached) {
        log.debug('ModernFeedService', `Using cached data for ${source.name}`);
        return cached;
      }
    }

    try {
      log.info('ModernFeedService', `Fetching fresh data from ${source.name}`);
      
      // Build API path based on source configuration
      const apiPath = this.buildAPIPath(source);
      
      // Fetch data using the modern API service
      const normalizedData = await modernAPIService.fetchIntelligenceData(
        source.endpoint,
        apiPath,
        source.normalizer,
        {
          cache: true,
          maxAge: source.refreshInterval,
          timeout: DEFAULT_INTELLIGENCE_CONFIG.timeout
        }
      );

      // Update last fetch time
      this.lastFetchTime.set(source.id, now);
      
      // Cache the results
      this.cachedResults.set(source.id, normalizedData);
      
      // Update source health
      this.updateSourceHealth(source.id, true);

      return normalizedData;

    } catch (error) {
      log.error('ModernFeedService', `Error fetching from ${source.name}: ${error}`);
      
      // Update source health
      this.updateSourceHealth(source.id, false);
      
      // Return cached data if available
      return this.cachedResults.get(source.id) || [];
    }
  }

  /**
   * Get specific category of intelligence data
   */
  async fetchByCategory(category: string, forceRefresh: boolean = false): Promise<NormalizedDataItem[]> {
    const enabledSources = getEnabledSources().filter(source =>
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
    
    this.cachedResults.clear();
    this.lastFetchTime.clear();
    modernAPIService.clearCache();
    LocalStorageUtil.removeItem(this.cacheStorageKey);
    
    return await this.fetchAllIntelligenceData(true);
  }

  /**
   * Get available intelligence sources
   */
  getAvailableSources(): IntelligenceSource[] {
    return PRIMARY_INTELLIGENCE_SOURCES;
  }

  /**
   * Enable/disable a specific source
   */
  toggleSource(sourceId: string, enabled: boolean): void {
    const source = getSourceById(sourceId);
    if (source) {
      source.enabled = enabled;
      this.saveConfiguration();
      log.info('ModernFeedService', `${enabled ? 'Enabled' : 'Disabled'} source: ${source.name}`);
    }
  }

  // Private helper methods

  private buildAPIPath(source: IntelligenceSource): string {
    // Build specific API paths based on source type
    switch (source.id) {
      case 'noaa-weather-alerts':
        return '/alerts/active';
      
      case 'usgs-earthquakes':
        return '/summary/significant_week.geojson';
      
      case 'github-security':
        return '/advisories';
      
      case 'hackernews-tech':
        return '/topstories.json';
      
      case 'coingecko-crypto':
        return '/search/trending';
      
      case 'reddit-worldnews':
        return '/r/worldnews/hot.json?limit=25';
      
      case 'reddit-security':
        return '/r/cybersecurity/hot.json?limit=15';
      
      case 'nasa-space-data':
        return '/planetary/apod';
      
      default:
        return Object.values(source.endpoint.endpoints)[0] || '';
    }
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
    return items.map(item => ({
      id: item.id,
      title: item.title,
      link: item.url,
      pubDate: item.publishedAt.toISOString(),
      description: item.summary,
      content: item.summary,
      feedListId: 'modern-api',
      author: item.source,
      categories: item.tags,
      trustRating: item.trustRating,
      verificationStatus: item.verificationStatus,
      lastValidated: new Date().toISOString(),
      responseTime: item.responseTime
    }));
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
    const source = getSourceById(sourceId);
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
    const enabledSources = getEnabledSources();
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
      LocalStorageUtil.setItem(this.cacheStorageKey, {
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
      }>(this.cacheStorageKey);

      if (!cached) return null;

      // Check if cache is still valid (30 minutes)
      const maxAge = 30 * 60 * 1000;
      if (Date.now() - cached.timestamp > maxAge) {
        LocalStorageUtil.removeItem(this.cacheStorageKey);
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
      LocalStorageUtil.setItem(this.configStorageKey, {
        sources: getEnabledSources(),
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
