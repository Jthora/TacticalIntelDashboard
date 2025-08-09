import { exportIntelReport, exportFeedsAsIntelZip, exportIntelReportJson } from '../IntelBatchExport';
import { Feed } from '../../../models/Feed';

function makeFeed(id: string, overrides: Partial<Feed> = {}): Feed {
  return {
    id,
    name: 'Name '+id,
    url: 'https://example.com/rss',
    title: 'Title '+id,
    link: 'https://example.com/article/'+id,
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

describe('IntelBatchExport', () => {
  beforeEach(() => {
    (global as any).URL.createObjectURL = jest.fn(()=> 'blob:x');
    (global as any).URL.revokeObjectURL = jest.fn();
    document.body.innerHTML='';
  });

  test('exportIntelReport produces .intelreport with articleCount and payload block', () => {
    const feeds = ['a','b','c'].map(id => makeFeed(id));
    const { serialized, fileName } = exportIntelReport(feeds, { limit: 10 });
    expect(fileName).toMatch(/intel-report-.*\.intelreport$/);
    expect(serialized).toContain('articleCount');
    expect(serialized).toContain('```json');
    expect(serialized.match(/"intelContent"/g)?.length).toBe(3);
  });

  test('exportIntelReport respects limit', () => {
    const feeds = Array.from({length:20}, (_,i)=> makeFeed('f'+i));
    const { serialized } = exportIntelReport(feeds, { limit: 5 });
    expect(serialized.match(/"intelContent"/g)?.length).toBe(5);
  });

  test('exportFeedsAsIntelZip returns count consistent with feeds provided', async () => {
    const feeds = ['x','y'].map(id => makeFeed(id));
    const res = await exportFeedsAsIntelZip(feeds, { limit: 10 });
    expect(res.count).toBe(2);
    expect(res.fileName).toMatch(/intel-articles-.*\.zip$/);
  });

  test('exportIntelReport handles empty list', () => {
    const { serialized } = exportIntelReport([], { limit: 10 });
    expect(serialized).toContain('Contains 0 articles');
  });

  test('exportFeedsAsIntelZip returns warnings on empty feeds', async () => {
    const res = await exportFeedsAsIntelZip([], { limit: 5 });
    expect(res.warnings.some(w=>w.type==='empty')).toBe(true);
  });

  test('exportIntelReportJson mirrors report payload count', () => {
    const feeds = ['a','b'].map(id => makeFeed(id));
    const { json } = exportIntelReportJson(feeds, { limit: 10 });
    const parsed = JSON.parse(json);
    expect(parsed.articleCount).toBe(2);
    expect(parsed.articles.length).toBe(2);
  });
});
