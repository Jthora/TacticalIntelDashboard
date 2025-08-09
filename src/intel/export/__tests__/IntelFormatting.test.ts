import { robustExportFeed } from '../FeedIntelAdapter';
import { exportIntelReport } from '../IntelBatchExport';
import { Feed } from '../../../models/Feed';

function makeFeed(id: string, overrides: Partial<Feed> = {}): Feed {
  return {
    id,
    name: 'Name '+id,
    url: 'https://example.com/rss',
    title: 'Title Colon: Hash# Line\\nBreak '+id,
    link: 'https://example.com/article/'+id,
    pubDate: new Date('2025-08-09T12:00:00Z').toISOString(),
    description: 'Desc '+id+' with <b>html</b>',
    content: 'Body '+id+' main content line 1\nLine 2\n',
    feedListId: 'list',
    categories: ['Cat','TagExtra'],
    tags: ['TagExtra','TagBase'],
    priority: 'HIGH',
    contentType: 'INTEL',
    source: 'Src',
    timestamp: new Date('2025-08-09T12:00:00Z').toISOString(),
    ...overrides
  };
}

describe('Intel .intel formatting', () => {
  test('frontmatter ordering and formatting deterministic', () => {
    const feed = makeFeed('fmt1');
    const res = robustExportFeed(feed, { cache: false, deterministic: true });
    expect(res.serialized).toBeTruthy();
    const text = res.serialized!;
    // Expect two '---' markers (start + end)
    expect(text.startsWith('---\n')).toBe(true);
    // Extract frontmatter lines (between first and second ---)
    const frontmatterBlock = text.substring(4, text.indexOf('\n---', 4)).trimEnd();
    const frontLines = frontmatterBlock.split('\n').filter(l=>l.trim().length>0);
    // Ensure each line contains ':' and no trailing spaces
    frontLines.forEach(l => {
      expect(l).toMatch(/^[a-zA-Z]+:/);
      expect(/\s+$/.test(l)).toBe(false);
    });
    // Key order relative correctness
    const actualKeys = frontLines.map(l => l.split(':')[0]);
    const expectedOrder = ['id','title','created','updated','classification','priority','sources','tags','location','summary','confidence'];
    const filteredExpected = expectedOrder.filter(k => actualKeys.includes(k));
    expect(actualKeys).toEqual(filteredExpected); // exact relative ordering
    // Array formatting brackets for sources & tags if present
    if (actualKeys.includes('sources')) {
      const line = frontLines.find(l=>l.startsWith('sources:'))!;
      expect(line).toMatch(/sources: \[/);
    }
    if (actualKeys.includes('tags')) {
      const line = frontLines.find(l=>l.startsWith('tags:'))!;
      expect(line).toMatch(/tags: \[/);
    }
    // Scalars are JSON quoted (deterministic serializer rule)
    const titleLine = frontLines.find(l=>l.startsWith('title:'))!;
    expect(titleLine).toMatch(/title: "/);
    // Body separation blank line
    const afterFrontmatter = text.slice(text.indexOf('\n---\n')+5);
    expect(afterFrontmatter.startsWith('\n') || afterFrontmatter.startsWith('\n')).toBe(true); // blank line already inserted
    // Body ends with newline
    expect(text.endsWith('\n')).toBe(true);
  });
});

describe('IntelReport formatting', () => {
  test('intelreport frontmatter and embedded JSON payload parse', () => {
    const feeds = ['r1','r2','r3'].map(id => makeFeed(id));
    const { serialized } = exportIntelReport(feeds, { limit: 10 });
    expect(serialized.startsWith('---\n')).toBe(true);
    const secondMarkerIndex = serialized.indexOf('\n---\n', 4);
    expect(secondMarkerIndex).toBeGreaterThan(0);
    // Find code fence
    const fenceStart = serialized.indexOf('```json');
    expect(fenceStart).toBeGreaterThan(0);
    const fenceEnd = serialized.indexOf('```', fenceStart + 7);
    expect(fenceEnd).toBeGreaterThan(fenceStart);
    const jsonPayload = serialized.substring(fenceStart + 7, fenceEnd).trim();
    const parsed = JSON.parse(jsonPayload);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(3);
    // Each embedded article has mandatory fields
    parsed.forEach((p: any) => {
      expect(p.id).toBeTruthy();
      expect(p.intelContent).toContain('---');
    });
  });
});
