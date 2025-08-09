import { robustExportFeed, robustExportFeeds } from '../FeedIntelAdapter';
import { Feed } from '../../../models/Feed';

function makeFeed(id: string, overrides: Partial<Feed> = {}): Feed {
  return {
    id,
    name: 'Name',
    url: 'https://x.test',
    title: 'Title '+id,
    link: 'https://x.test/a?id='+id,
    pubDate: new Date('2025-08-09T12:00:00Z').toISOString(),
    description: 'Desc '+id,
    content: 'Body '+id+'\n',
    feedListId: 'list',
    categories: ['Cat'],
    tags: ['Tag'],
    priority: 'HIGH',
    contentType: 'INTEL',
    source: 'Src',
    timestamp: new Date('2025-08-09T12:00:00Z').toISOString(),
    ...overrides
  };
}

describe('robustExportFeed', () => {
  beforeEach(() => {
    (global as any).URL.createObjectURL = jest.fn(()=> 'blob:x');
    (global as any).URL.revokeObjectURL = jest.fn();
  });

  test('returns result with deterministic serialization', () => {
    const feed = makeFeed('det-1');
    const r1 = robustExportFeed(feed, { cache: false });
    const r2 = robustExportFeed(feed, { cache: false });
    expect(r1.serialized).toBe(r2.serialized);
    expect(r1.errors).toHaveLength(0);
  });

  test('large body triggers warning', () => {
    const bigBody = 'X'.repeat(205*1024); // >200KB
    const feed = makeFeed('big', { content: bigBody });
    const res = robustExportFeed(feed, { cache: false });
    expect(res.warnings.some(w => w.includes('Body size'))).toBe(true);
  });

  test('excess tags warning', () => {
    const tags = Array.from({length: 30}).map((_,i)=>'t'+i);
    const feed = makeFeed('tags', { tags });
    const res = robustExportFeed(feed, { cache: false });
    expect(res.warnings.some(w => w.includes('Tag count'))).toBe(true);
  });

  test('malformed timestamps produce warning via validation errors list', () => {
    const feed = makeFeed('badts', { timestamp: 'not-a-date' as any });
    const res = robustExportFeed(feed, { cache: false });
    expect(res.warnings.some(w => w.toLowerCase().includes('created'))).toBe(true);
  });

  test('deterministic serializer escapes special chars', () => {
    const feed = makeFeed('esc', { title: 'Colon: Hash# New\nLine' });
    const res = robustExportFeed(feed, { cache: false });
    expect(res.serialized).toContain('"Colon: Hash# New');
  });
});

describe('robustExportFeeds', () => {
  test('batch returns array of results same length', () => {
    const feeds = ['a','b','c'].map(id => makeFeed(id));
    const results = robustExportFeeds(feeds, { cache: false });
    expect(results).toHaveLength(3);
    expect(results.map(r => r.record.id)).toEqual(['a','b','c']);
  });
});

describe('serializeIntelDeterministic', () => {
  test('produces stable output ordering', () => {
    const feed = makeFeed('ord');
    const res = robustExportFeed(feed, { cache: false });
    const again = robustExportFeed(feed, { cache: false });
    expect(res.serialized).toBe(again.serialized);
    expect(res.serialized).toContain('\n---\n');
  });
});
