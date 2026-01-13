import fs from 'fs';
import path from 'path';
import { fetchFeed } from '../fetchFeed';

jest.mock('../../services/SettingsIntegrationService', () => ({
  SettingsIntegrationService: {
    getCORSStrategy: jest.fn(() => 'DIRECT'),
    getProxyUrl: jest.fn((target: string) => target),
    getCORSProxyChain: jest.fn(() => [])
  },
  __esModule: true
}));

describe('fetchFeed smoke fixtures', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalEnv };
    // @ts-expect-error cleanup
    global.fetch = undefined;
  });

  const fixture = (relative: string) =>
    fs.readFileSync(path.join(__dirname, '../../../tests/fixtures/feeds', relative), 'utf-8');

  it('parses XML fixture and produces normalized items with fallbacks', async () => {
    process.env.FEED_ALLOWED_HOSTS = 'example.com';
    const xmlBody = fixture('xml/basic-feed.xml');
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      statusText: 'OK',
      headers: { get: (key: string) => (key.toLowerCase() === 'content-type' ? 'application/xml' : null) },
      text: async () => xmlBody
    });

    const result = await fetchFeed('https://example.com/feed.xml');

    expect(result).not.toBeNull();
    expect(result?.feeds.length).toBe(2);
    const second = result?.feeds[1];
    expect(second?.link).toBe('https://example.com/feed.xml'); // missing link falls back
    expect(new Date(second?.pubDate || '').toString()).not.toBe('Invalid Date');
  });

  it('parses JSON fixture and produces normalized items with defaults', async () => {
    process.env.FEED_ALLOWED_HOSTS = 'example.com';
    const jsonBody = fixture('json/basic-feed.json');
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      statusText: 'OK',
      headers: { get: (key: string) => (key.toLowerCase() === 'content-type' ? 'application/json' : null) },
      text: async () => jsonBody
    });

    const result = await fetchFeed('https://example.com/json');

    expect(result).not.toBeNull();
    expect(result?.feeds.length).toBe(2);
    const missingLink = result?.feeds[1];
    expect(missingLink?.link).toBe('https://example.com/json');
    expect(missingLink?.title).toBeTruthy();
  });

  it('parses TXT fixture and preserves defaults for missing link', async () => {
    process.env.FEED_ALLOWED_HOSTS = 'example.com';
    const txtBody = fixture('txt/basic-feed.txt');
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      statusText: 'OK',
      headers: { get: (key: string) => (key.toLowerCase() === 'content-type' ? 'text/plain' : null) },
      text: async () => txtBody
    });

    const result = await fetchFeed('https://example.com/txt');

    expect(result).not.toBeNull();
    expect(result?.feeds.length).toBe(2);
    const missingLink = result?.feeds[1];
    expect(missingLink?.link).toBe('https://example.com/txt');
    expect(missingLink?.categories).toContain('ops');
  });
});
