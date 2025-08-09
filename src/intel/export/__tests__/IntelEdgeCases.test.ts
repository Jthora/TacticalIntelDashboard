import { robustExportFeed } from '../FeedIntelAdapter';
import { exportFeedsAsIntelZip, exportIntelReport } from '../IntelBatchExport';
import { Feed } from '../../../models/Feed';

function baseFeed(id: string, overrides: Partial<Feed> = {}): Feed {
  return {
    id,
    name: 'Name '+id,
    url: 'https://example.com/rss',
    title: 'Title '+id,
    link: 'https://example.com/a/'+id,
    pubDate: new Date('2025-08-09T12:00:00Z').toISOString(),
    description: 'Description '+id,
    content: 'Body '+id+' content line 1\n',
    feedListId: 'list',
    priority: 'HIGH',
    contentType: 'INTEL',
    source: 'Src',
    timestamp: new Date('2025-08-09T12:00:00Z').toISOString(),
    ...overrides
  };
}

describe('Intel export edge cases', () => {
  beforeEach(()=>{
    (global as any).URL.createObjectURL = jest.fn(()=> 'blob:x');
    (global as any).URL.revokeObjectURL = jest.fn();
    document.body.innerHTML='';
  });

  test('large body boundary warnings', () => {
    const justUnder = baseFeed('u', { content: 'X'.repeat(199*1024) });
    const over = baseFeed('o', { content: 'X'.repeat(200*1024+1) });
    const r1 = robustExportFeed(justUnder, { cache: false });
    const r2 = robustExportFeed(over, { cache: false });
    expect(r1.warnings.some(w=>w.includes('Body size'))).toBe(false);
    expect(r2.warnings.some(w=>w.includes('Body size'))).toBe(true);
  });

  test('invalid timestamp warning propagation', () => {
    const bad = baseFeed('bad', { timestamp: 'not-a-date' as any });
    const r = robustExportFeed(bad, { cache: false });
    expect(r.warnings.some(w => w.toLowerCase().includes('created'))).toBe(true);
  });

  test('tag dedupe and overflow warning', () => {
    const manyTags = Array.from({length: 30}).map((_,i)=> 'Tag'+i); // 30 unique
    const feed = baseFeed('tags', { tags: manyTags as any });
    const r = robustExportFeed(feed, { cache: false });
    expect(r.record.tags?.length).toBe(30);
    expect(r.warnings.some(w=>w.includes('Tag count'))).toBe(true);
  });

  test('zip export duplicate id collision handling', async () => {
    const f1 = baseFeed('dup');
    const f2 = baseFeed('dup');
    const res = await exportFeedsAsIntelZip([f1,f2], { limit: 10 });
    // Expect two files produced with second suffixed
    expect(res.count).toBe(2);
    expect(res.fileNames.some(n=>n==='dup.intel')).toBe(true);
    expect(res.fileNames.some(n=>n.startsWith('dup-'))).toBe(true);
    expect(res.warnings.some(w=>w.type==='collision')).toBe(true);
  });

  test('intel report limit truncation', () => {
    const feeds = Array.from({length:15}, (_,i)=> baseFeed('f'+i));
    const { serialized, warnings } = exportIntelReport(feeds, { limit: 5 });
    expect(serialized.match(/"intelContent"/g)?.length).toBe(5);
    expect(warnings.some(w=>w.toLowerCase().includes('truncated'))).toBe(true);
  });
});
