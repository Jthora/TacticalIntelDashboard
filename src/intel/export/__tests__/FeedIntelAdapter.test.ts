import { mapFeedToIntel, mapFeedsToIntel, serializeIntel, validateIntel, cacheIntel, getCachedIntel, listCachedIntel, removeCachedIntel, clearIntelCache, exportFeedAsIntel } from '../FeedIntelAdapter';
import { IntelExportRecord } from '../IntelExportTypes';
import { Feed } from '../../../models/Feed';

// Utility to create a baseline feed fixture
function makeFeed(overrides: Partial<Feed> = {}): Feed {
  return {
    id: 'feed-123',
    name: 'Sample Feed',
    url: 'https://sample.example/feed',
    title: 'Sample Intelligence Title',
    link: 'https://sample.example/article?id=123',
    pubDate: new Date('2025-08-09T12:00:00Z').toISOString(),
    description: 'This is a <b>rich</b> description with <i>HTML</i> content for summary extraction.',
    content: '## Heading\nFull markdown body content here.\n',
    feedListId: 'list-1',
    categories: ['Security', 'Threats'],
    tags: ['APT', 'ZeroDay', 'Threats'],
    priority: 'HIGH',
    contentType: 'INTEL',
    source: 'ExternalSource',
    timestamp: new Date('2025-08-09T11:59:30Z').toISOString(),
    ...overrides
  };
}

beforeEach(() => {
  // Clean localStorage between tests
  clearIntelCache();
  localStorage.clear();
  // jsdom polyfills for download
  (global as any).URL.createObjectURL = jest.fn(() => 'blob:mock');
  (global as any).URL.revokeObjectURL = jest.fn();
});

describe('FeedIntelAdapter mapping', () => {
  test('maps core fields correctly', () => {
    const feed = makeFeed();
    const intel = mapFeedToIntel(feed);

    expect(intel.id).toBe(feed.id);
    expect(intel.title).toBe(feed.title);
    expect(intel.classification).toBe('UNCLASS');
    expect(intel.priority).toBe('high');
    expect(intel.sources).toEqual(['EXTERNALSOURCE']);
    expect(intel.tags).toBeDefined();
    expect(intel.tags).toEqual(['apt', 'security', 'threats', 'zeroday']); // merged + normalized alphabetical
    expect(intel.summary).toBeDefined();
    expect(intel.body.endsWith('\n')).toBe(true);
    expect(Date.parse(intel.created)).not.toBeNaN();
  });

  test('derives source from URL when feed.source missing', () => {
    const feed = makeFeed({ link: 'https://coindesk.com/article/xyz' });
    delete (feed as any).source; // simulate absence
    const intel = mapFeedToIntel(feed);
    expect(intel.sources).toEqual(['COINDESK']);
  });

  test('priority defaults to medium when absent', () => {
    const feed = makeFeed();
    delete (feed as any).priority; // simulate absence
    const intel = mapFeedToIntel(feed);
    expect(intel.priority).toBe('medium');
  });

  test('long title gets truncated', () => {
    const longTitle = 'A'.repeat(500);
    const feed = makeFeed({ title: longTitle });
    const intel = mapFeedToIntel(feed);
    expect(intel.title.length).toBeLessThanOrEqual(300);
  });

  test('summary truncates over 280 chars and adds ellipsis', () => {
    const longDesc = 'word '.repeat(100); // > 280 chars
    const feed = makeFeed({ description: longDesc });
    const intel = mapFeedToIntel(feed);
    expect(intel.summary).toBeDefined();
    expect(intel.summary!.length).toBeLessThanOrEqual(281); // 280 + ellipsis
    expect(intel.summary!.endsWith('…')).toBe(true);
  });

  test('batch mapping preserves order', () => {
    const feeds = [makeFeed({ id: 'a' }), makeFeed({ id: 'b' })];
    const records = mapFeedsToIntel(feeds);
    expect(records.map(r => r.id)).toEqual(['a', 'b']);
  });
});

describe('serializeIntel', () => {
  test('produces frontmatter with correct ordering and body separation', () => {
    const feed = makeFeed();
    const record = mapFeedToIntel(feed);
    const content = serializeIntel(record);
    const lines = content.split('\n');
    expect(lines[0]).toBe('---');
    const idxBodyFence = lines.indexOf('---', 1);
    expect(idxBodyFence).toBeGreaterThan(0);
    const frontmatterLines = lines.slice(1, idxBodyFence);
    const frontmatterKeys = frontmatterLines.map(l => l.split(':')[0]);
    // Ensure required first keys present in expected order subset (id, title, created)
    expect(frontmatterKeys[0]).toBe('id');
    expect(frontmatterKeys[1]).toBe('title');
    expect(frontmatterKeys[2]).toBe('created');
    // classification must appear somewhere after created (order enforced by serializer list)
    expect(frontmatterKeys).toContain('classification');
    // Body exists after blank line
    expect(lines[idxBodyFence + 1]).toBe('');
    expect(content).toContain(record.body.trim());
  });
});

describe('validateIntel', () => {
  test('valid record passes', () => {
    const record = mapFeedToIntel(makeFeed());
    const result = validateIntel(record);
    expect(result.valid).toBe(true);
    expect(result.issues.filter(i => i.severity==='error')).toHaveLength(0);
  });

  test('detects missing id and invalid created', () => {
    const record: IntelExportRecord = { ...mapFeedToIntel(makeFeed()), id: '', created: 'invalid', body: 'X' };
    const result = validateIntel(record);
    const fields = result.issues.map(i => i.field);
    expect(fields).toContain('id');
    expect(fields).toContain('created');
    expect(result.valid).toBe(false);
  });
});

describe('caching', () => {
  test('cache -> list -> get -> remove -> clear sequence', () => {
    const rec1 = mapFeedToIntel(makeFeed({ id: 'one' }));
    const rec2 = mapFeedToIntel(makeFeed({ id: 'two' }));
    cacheIntel(rec1);
    cacheIntel(rec2);
    expect(listCachedIntel().map(r => r.id).sort()).toEqual(['one','two']);
    expect(getCachedIntel('one')?.id).toBe('one');
    removeCachedIntel('one');
    expect(listCachedIntel().map(r => r.id)).toEqual(['two']);
    clearIntelCache();
    expect(listCachedIntel()).toHaveLength(0);
  });
});

describe('exportFeedAsIntel', () => {
  test('triggers anchor download with .intel extension', () => {
    const clickSpy = jest.fn();
    document.body.innerHTML = '';
    // Mock createElement to intercept anchor
    const realCreate = document.createElement.bind(document);
    jest.spyOn(document, 'createElement').mockImplementation((tagName: any) => {
      const el = realCreate(tagName) as HTMLAnchorElement;
      if (tagName === 'a') {
        el.click = clickSpy as any;
      }
      return el;
    });

    const rec = exportFeedAsIntel(makeFeed({ id: 'download-test' }), { cache: false });
    expect(clickSpy).toHaveBeenCalledTimes(1);
    const anchor = document.querySelector('a') as HTMLAnchorElement;
    expect(anchor.download).toBe('download-test.intel');
    expect(rec.id).toBe('download-test');
  });
});
