import { ExportService, ExportOptions } from '../../services/ExportService';
import { Feed } from '../../models/Feed';

// Mock jsPDF to avoid heavy PDF generation in tests
jest.mock('jspdf', () => {
  class jsPDF {
    internal = { pageSize: { getWidth: () => 200, getHeight: () => 300 }, pages: [null] };
    setFontSize(){}
    setFont(){}
    text(){}
    addPage(){ this.internal.pages.push(null); }
    splitTextToSize(txt: string){ return [txt]; }
    output(){ return new Blob(['PDF']); }
    setPage(){}
  }
  return { jsPDF };
});

function makeFeed(id: string, overrides: Partial<Feed> = {}): Feed {
  return {
    id,
    name: 'Source '+id,
    url: 'https://example.com/feed/'+id,
    title: 'Title '+id,
    link: 'https://example.com/article/'+id,
    pubDate: new Date('2025-08-09T12:00:00Z').toISOString(),
    description: 'Desc, with comma and "quotes" and <xml> chars & test',
    content: 'Body '+id,
    feedListId: 'list',
    author: 'Author '+id,
    categories: ['Cat'],
    priority: 'HIGH',
    contentType: 'INTEL',
    region: 'GLOBAL',
    tags: ['Tag'+id,'Tag'],
    classification: 'UNCLASS',
    timestamp: new Date('2025-08-09T12:00:00Z').toISOString(),
    source: 'SRC',
    ...overrides
  };
}

describe('ExportService advanced & edge case coverage', () => {
  const feeds: Feed[] = [
    makeFeed('1', { pubDate: '2025-08-01T00:00:00Z' }),
    makeFeed('2', { pubDate: '2025-08-05T00:00:00Z' }),
    makeFeed('3', { pubDate: '2025-08-10T00:00:00Z' }),
  ];

  test('JSON export with dateRange filters feeds outside range', async () => {
    const options: ExportOptions = {
      format: 'json',
      dateRange: { start: new Date('2025-08-02T00:00:00Z'), end: new Date('2025-08-09T23:59:59Z') },
      metadata: { title: 'Filtered' }
    };
    const res = await ExportService.exportFeeds(feeds, options);
    const parsed = JSON.parse(res.content as string);
    expect(parsed.feeds.length).toBe(1); // only id 2
    expect(parsed.feeds[0].id).toBe('2');
  });

  test('JSON export includeFields restricts payload', async () => {
    const options: ExportOptions = { format: 'json', includeFields: ['id','title'] };
    const res = await ExportService.exportFeeds(feeds.slice(0,1), options);
    const parsed = JSON.parse(res.content as string);
    const feed = parsed.feeds[0];
    expect(feed.id).toBeTruthy();
    expect(feed.title).toBeTruthy();
    expect(feed.link).toBeUndefined(); // filtered out
  });

  test('CSV export escapes commas and quotes', async () => {
    const options: ExportOptions = { format: 'csv' };
    const res = await ExportService.exportFeeds(feeds.slice(0,1), options);
    const csv = res.content as string;
    expect(csv.split('\n').length).toBe(2); // header + one row
    // Quoted field containing comma and quotes should have doubled quotes
    expect(csv).toMatch(/"Desc, with comma and ""quotes"" and <xml> chars & test"/);
  });

  test('XML export escapes special characters & includes tags', async () => {
    const options: ExportOptions = { format: 'xml' };
    const res = await ExportService.exportFeeds(feeds.slice(0,1), options);
    const xml = res.content as string;
    expect(xml).toContain('<TacticalIntelExport>');
    expect(xml).toContain('&lt;xml&gt;');
    expect(xml).toContain('<Tags>');
    expect(xml).toMatch(/<Feed>\s*<ID>1<\/ID>/);
  });

  test('PDF export returns Blob', async () => {
    const options: ExportOptions = { format: 'pdf' };
    const res = await ExportService.exportFeeds(feeds.slice(0,2), options);
    expect(res.content).toBeInstanceOf(Blob);
    expect(res.filename.endsWith('.pdf')).toBe(true);
  });

  test('Encryption changes filename extension and sets encrypted flag', async () => {
    const options: ExportOptions = { format: 'json', encryption: { enabled: true, password: 'pw' } };
    const res = await ExportService.exportFeeds(feeds.slice(0,1), options);
    expect(res.encrypted).toBe(true);
    expect(res.filename.endsWith('.encrypted')).toBe(true);
    expect(typeof res.content).toBe('string');
  });

  test('Compression changes filename extension and sets compressed flag (no encryption)', async () => {
    const options: ExportOptions = { format: 'json', compression: true };
    const res = await ExportService.exportFeeds(feeds.slice(0,1), options);
    expect(res.compressed).toBe(true);
    expect(res.filename.endsWith('.gz')).toBe(true);
    expect(res.content).toBeInstanceOf(Blob);
  });

  test('Encryption then compression results in .gz and both flags true', async () => {
    const options: ExportOptions = { format: 'json', encryption: { enabled: true, password: 'pw' }, compression: true };
    const res = await ExportService.exportFeeds(feeds.slice(0,1), options);
    expect(res.encrypted).toBe(true);
    expect(res.compressed).toBe(true);
    expect(res.filename.endsWith('.gz')).toBe(true);
  });

  test('validateExportOptions catches errors', () => {
    const invalid = ExportService.validateExportOptions({ format: 'json', encryption: { enabled: true } } as any);
    expect(invalid.valid).toBe(false);
    expect(invalid.errors.some(e=>e.toLowerCase().includes('password'))).toBe(true);

    const badFormat = ExportService.validateExportOptions({ format: 'yaml' } as any);
    expect(badFormat.valid).toBe(false);
    expect(badFormat.errors.some(e=>e.toLowerCase().includes('invalid export format'))).toBe(true);

    const badRange = ExportService.validateExportOptions({ format: 'json', dateRange: { start: new Date('2025-08-10'), end: new Date('2025-08-01') } } as any);
    expect(badRange.valid).toBe(false);
    expect(badRange.errors.some(e=>e.toLowerCase().includes('start date'))).toBe(true);
  });
});
