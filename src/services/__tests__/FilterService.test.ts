import { describe, expect, test } from '@jest/globals';

import { Feed } from '../../models/Feed';
import { FilterService, type FilterState } from '../FilterService';

const baseFilterState: FilterState = {
  activeFilters: new Set<string>(),
  timeRange: null,
  sortBy: { field: 'timestamp', direction: 'desc' },
  searchQuery: ''
};

let idCounter = 0;

const buildFeed = (overrides: Partial<Feed>): Feed => ({
  id: overrides.id ?? `feed-${idCounter += 1}`,
  name: overrides.name ?? 'Test Source',
  url: overrides.url ?? 'https://example.com/feed',
  title: overrides.title ?? 'Sample Feed',
  link: overrides.link ?? 'https://example.com/item',
  pubDate: overrides.pubDate ?? new Date().toISOString(),
  feedListId: overrides.feedListId ?? 'modern-api',
  ...overrides
});

describe('FilterService', () => {
  test('filters feeds by priority levels', () => {
    const feeds: Feed[] = [
      buildFeed({ id: 'critical', priority: 'CRITICAL' }),
      buildFeed({ id: 'low', priority: 'LOW' })
    ];

    const filtered = FilterService.applyFilters(feeds, {
      ...baseFilterState,
      activeFilters: new Set(['CRITICAL'])
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('critical');
  });

  test('computes counts for priority and region filters', () => {
    const feeds: Feed[] = [
      buildFeed({ id: 'americas-critical', priority: 'CRITICAL', region: 'AMERICAS' }),
      buildFeed({ id: 'global-medium', priority: 'MEDIUM', region: 'GLOBAL' })
    ];

    const counts = FilterService.getFilterCounts(feeds);

    expect(counts.CRITICAL).toBe(1);
    expect(counts.MEDIUM).toBe(1);
    expect(counts.AMERICAS).toBe(1);
    expect(counts.GLOBAL).toBe(1);
  });

  test('returns only tag counts from getTagCounts', () => {
    const feeds: Feed[] = [
      buildFeed({ id: 'tagged', tags: ['CYBERSECURITY', 'RANSOMWARE'], priority: 'HIGH' }),
      buildFeed({ id: 'mixed', tags: ['CYBERSECURITY'], region: 'EUROPE' })
    ];

    const tagCounts = FilterService.getTagCounts(feeds);

    expect(tagCounts).toEqual({
      CYBERSECURITY: 2,
      RANSOMWARE: 1
    });
  });
});