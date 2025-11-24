import { Feed } from '../models/Feed';

const PRIORITY_FILTERS = new Set(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']);
const CONTENT_TYPE_FILTERS = new Set(['INTEL', 'NEWS', 'ALERT', 'THREAT']);
const REGION_FILTERS = new Set(['GLOBAL', 'AMERICAS', 'EUROPE', 'ASIA_PACIFIC']);
const BANNED_FILTER_KEYS = new Set([
  'OFFICIAL',
  'VERIFIED',
  'UNVERIFIED',
  'TOP_SECRET',
  'SECRET',
  'UNCLASSIFIED',
  'QUALITY_GOLD',
  'QUALITY_SILVER',
  'QUALITY_BRONZE',
  'TRUST_HIGH',
  'TRUST_MEDIUM',
  'TRUST_LOW',
  'MODE_MILTECH',
  'MODE_SPACEFORCE'
]);

export interface FilterState {
  activeFilters: Set<string>;
  timeRange: TimeRange | null;
  sortBy: SortOption;
  searchQuery: string;
}

export interface TimeRange {
  start: Date;
  end: Date;
  label: string;
}

export interface SortOption {
  field: 'timestamp' | 'title' | 'priority' | 'source';
  direction: 'asc' | 'desc';
}

export class FilterService {
  /**
   * Apply all filters to a feed array
   */
  static applyFilters(feeds: Feed[], filterState: FilterState): Feed[] {
    let filteredFeeds = [...feeds];

    // Apply category filters (priority, content type, region)
    if (filterState.activeFilters.size > 0) {
      filteredFeeds = filteredFeeds.filter(feed => 
        this.matchesFilters(feed, filterState.activeFilters)
      );
    }

    // Apply time range filter
    if (filterState.timeRange) {
      filteredFeeds = filteredFeeds.filter(feed =>
        this.isWithinTimeRange(feed, filterState.timeRange!)
      );
    }

    // Apply search query filter
    if (filterState.searchQuery.trim()) {
      filteredFeeds = filteredFeeds.filter(feed =>
        this.matchesSearchQuery(feed, filterState.searchQuery)
      );
    }

    // Apply sort
    filteredFeeds = this.sortFeeds(filteredFeeds, filterState.sortBy);

    return filteredFeeds;
  }

  /**
   * Check if a feed matches the active filters
   */
  private static matchesFilters(feed: Feed, filters: Set<string>): boolean {
    for (const filter of filters) {
      if (this.feedMatchesFilter(feed, filter)) {
        return true; // OR logic - feed matches if it matches any filter
      }
    }
    return false;
  }

  /**
   * Check if a feed matches a specific filter
   */
  private static feedMatchesFilter(feed: Feed, filter: string): boolean {
    // Priority filters
    if (PRIORITY_FILTERS.has(filter)) {
      return feed.priority === filter;
    }

    // Content type filters
    if (CONTENT_TYPE_FILTERS.has(filter)) {
      return feed.contentType === filter;
    }

    // Region filters
    if (REGION_FILTERS.has(filter)) {
      return feed.region === filter;
    }

    // Tag filters
    if (feed.tags && feed.tags.includes(filter)) {
      return true;
    }

    return false;
  }

  /**
   * Check if a feed is within the specified time range
   */
  private static isWithinTimeRange(feed: Feed, timeRange: TimeRange): boolean {
    if (!feed.timestamp) return false;

    const feedTime = new Date(feed.timestamp);
    return feedTime >= timeRange.start && feedTime <= timeRange.end;
  }

  /**
   * Check if a feed matches the search query
   */
  private static matchesSearchQuery(feed: Feed, query: string): boolean {
    const searchableText = [
      feed.title,
      feed.description,
      feed.source,
      feed.tags?.join(' '),
      feed.classification
    ].filter(Boolean).join(' ').toLowerCase();

    return searchableText.includes(query.toLowerCase());
  }

  /**
   * Sort feeds by the specified criteria
   */
  private static sortFeeds(feeds: Feed[], sortBy: SortOption): Feed[] {
    return feeds.sort((a, b) => {
      let comparison = 0;

      switch (sortBy.field) {
        case 'timestamp':
          const aTime = new Date(a.timestamp || 0).getTime();
          const bTime = new Date(b.timestamp || 0).getTime();
          comparison = aTime - bTime;
          break;

        case 'title':
          comparison = (a.title || '').localeCompare(b.title || '');
          break;

        case 'priority':
          const priorityOrder = { 'CRITICAL': 3, 'HIGH': 2, 'MEDIUM': 1, 'LOW': 0 };
          const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          comparison = aPriority - bPriority;
          break;

        case 'source':
          comparison = (a.source || '').localeCompare(b.source || '');
          break;

        default:
          comparison = 0;
      }

      return sortBy.direction === 'desc' ? -comparison : comparison;
    });
  }

  /**
   * Get default filter state
   */
  static getDefaultFilterState(): FilterState {
    return {
      activeFilters: new Set<string>(),
      timeRange: null,
      sortBy: { field: 'timestamp', direction: 'desc' },
      searchQuery: ''
    };
  }

  /**
   * Count feeds that match each filter category
   */
  static getFilterCounts(feeds: Feed[]): Record<string, number> {
    const counts: Record<string, number> = {};

    feeds.forEach(feed => {
      // Count priority filters
      if (feed.priority) {
        counts[feed.priority] = (counts[feed.priority] || 0) + 1;
      }

      // Count content type filters
      if (feed.contentType) {
        counts[feed.contentType] = (counts[feed.contentType] || 0) + 1;
      }

      // Count region filters
      if (feed.region) {
        counts[feed.region] = (counts[feed.region] || 0) + 1;
      }

      // Count tag filters
      if (feed.tags) {
        feed.tags.forEach(tag => {
          counts[tag] = (counts[tag] || 0) + 1;
        });
      }
    });

    return counts;
  }

  static getTagCounts(feeds: Feed[]): Record<string, number> {
    const counts = this.getFilterCounts(feeds);
    const tagCounts: Record<string, number> = {};

    Object.entries(counts).forEach(([key, value]) => {
      if (
        !PRIORITY_FILTERS.has(key) &&
        !CONTENT_TYPE_FILTERS.has(key) &&
        !REGION_FILTERS.has(key)
      ) {
        tagCounts[key] = value;
      }
    });

    return tagCounts;
  }

  /**
   * Create a time range from preset
   */
  static createTimeRangeFromPreset(preset: string): TimeRange {
    const now = new Date();
    const ranges: Record<string, number> = {
      '1H': 1,
      '6H': 6,
      '24H': 24,
      '7D': 168,
      '30D': 720
    };

    const hours = ranges[preset];
    if (!hours) {
      throw new Error(`Invalid time range preset: ${preset}`);
    }

    const start = new Date(now.getTime() - hours * 60 * 60 * 1000);
    return {
      start,
      end: now,
      label: preset
    };
  }

  /**
   * Validate filter state
   */
  static validateFilterState(filterState: any): FilterState {
    const sanitizedFilters = Array.isArray(filterState.activeFilters)
      ? filterState.activeFilters.filter((filter: string) => !BANNED_FILTER_KEYS.has(filter))
      : [];

    return {
      activeFilters: new Set(sanitizedFilters),
      timeRange: filterState.timeRange || null,
      sortBy: {
        field: ['timestamp', 'title', 'priority', 'source'].includes(filterState.sortBy?.field) 
          ? filterState.sortBy.field 
          : 'timestamp',
        direction: ['asc', 'desc'].includes(filterState.sortBy?.direction) 
          ? filterState.sortBy.direction 
          : 'desc'
      },
      searchQuery: typeof filterState.searchQuery === 'string' ? filterState.searchQuery : ''
    };
  }
}
