import { fetchFeed } from '../fetchFeed';

jest.mock('../../services/SettingsIntegrationService', () => ({
  SettingsIntegrationService: {
    getCORSStrategy: jest.fn(() => 'DIRECT'),
    getProxyUrl: jest.fn((_target: string) => _target),
    getCORSProxyChain: jest.fn(() => [])
  },
  __esModule: true
}));

const originalEnv = { ...process.env };

describe('fetchFeed ingestion safety', () => {
  afterEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalEnv };
    // @ts-expect-error allow cleanup
    global.fetch = undefined;
  });

  it('rejects URLs not in the allowlist', async () => {
    process.env.FEED_ALLOWED_HOSTS = 'trusted.example';

    const fetchMock = jest.fn();
    (global as any).fetch = fetchMock;

    const result = await fetchFeed('https://blocked.example/rss.xml');

    expect(result).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects oversized responses based on content length and body size', async () => {
    process.env.FEED_ALLOWED_HOSTS = 'trusted.example';
    process.env.FEED_MAX_CONTENT_LENGTH_BYTES = '10';

    const body = '0123456789012345';
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      statusText: 'OK',
      headers: {
        get: (key: string) => (key.toLowerCase() === 'content-length' ? String(body.length) : null)
      },
      text: async () => body
    });
    (global as any).fetch = fetchMock;
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const result = await fetchFeed('https://trusted.example/rss.xml');

    expect(result).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const warnRecord = warnSpy.mock.calls.find(call => call[0] === '[ingest]')?.[1] as { code?: string } | undefined;
    const errorOutput = errorSpy.mock.calls.flat().join(' ');
    expect(warnRecord?.code).toBe('INGEST_SIZE_HEADER_BLOCK');
    expect(errorOutput).toContain('Error fetching URL');

    logSpy.mockRestore();
    infoSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
