import { hashString, logIngestEvent, redactValue, sanitizeContext } from '../structuredLogger';

describe('structuredLogger', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('redacts payload content when logging ingest events', () => {
    const spy = jest.spyOn(console, 'info').mockImplementation(() => {});
    const payload = 'super-secret-payload';

    logIngestEvent({
      level: 'info',
      code: 'INGEST_TEST',
      message: 'test message',
      url: 'https://example.com',
      payload,
    });

    expect(spy).toHaveBeenCalled();
    const call = spy.mock.calls[0];
    const record = call[1] as { payloadDigest?: { hash: string; length: number } };
    expect(JSON.stringify(call)).not.toContain(payload);
    expect(record.payloadDigest?.length).toBe(payload.length);
    expect(record.payloadDigest?.hash).toBe(hashString(payload));
  });

  it('sanitizes context keys considered sensitive or long strings', () => {
    const context = sanitizeContext({
      payload: 'raw-body',
      text: 'a'.repeat(130),
      safe: 'ok',
      short: 'short',
    });

    expect(context?.payload).toEqual(redactValue('raw-body'));
    expect(context?.text).toEqual(redactValue('a'.repeat(130)));
    expect(context?.safe).toBe('ok');
    expect(context?.short).toBe('short');
  });
});
