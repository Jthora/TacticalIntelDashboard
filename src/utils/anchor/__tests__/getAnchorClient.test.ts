import { AnchoringConfig } from '../../../config/anchoringConfig';
import { AnchorClient } from '../../../types/AnchorClient';
import { getAnchorClient } from '../getAnchorClient';
import { mockAnchorClient } from '../mockAnchorClient';

describe('getAnchorClient', () => {
  const realClient: AnchorClient = {
    anchor: jest.fn(),
    get: jest.fn()
  };

  const baseConfig: AnchoringConfig = {
    enabled: true,
    requestedMode: 'mock',
    effectiveMode: 'mock',
    allowReal: false,
    chain: 'QAN-mock'
  };

  it('returns mock client when effective mode is mock', () => {
    const { client, mode, reason } = getAnchorClient(baseConfig);
    expect(client).toBe(mockAnchorClient);
    expect(mode).toBe('mock');
    expect(reason).toBeUndefined();
  });

  it('returns real client when allowed and factory provided', () => {
    const cfg: AnchoringConfig = { ...baseConfig, effectiveMode: 'real', requestedMode: 'real', allowReal: true };
    const { client, mode } = getAnchorClient(cfg, () => realClient);
    expect(client).toBe(realClient);
    expect(mode).toBe('real');
  });

  it('falls back to mock when real requested but factory missing', () => {
    const cfg: AnchoringConfig = { ...baseConfig, effectiveMode: 'real', requestedMode: 'real', allowReal: true };
    const { client, mode, reason } = getAnchorClient(cfg);
    expect(client).toBe(mockAnchorClient);
    expect(mode).toBe('mock');
    expect(reason).toBe('real-client-unavailable');
  });
});
