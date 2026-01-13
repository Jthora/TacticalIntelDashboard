import { CORSStrategy, Settings, SettingsTab } from '../../contexts/SettingsContext';
import { DEFAULT_MISSION_MODE } from '../../constants/MissionMode';
import { getAnchorClientResolution, getInfrastructureSnapshot, getRelayClient, applyInfrastructureSettings } from '../infrastructureRuntime';
import { inMemoryRelayClient } from '../relay/inMemoryRelayClient';

const baseSettings = (overrides: Partial<Settings['infrastructure']> = {}): Settings => ({
  version: '1.0.0',
  lastTab: SettingsTab.ADVANCED,
  cors: { defaultStrategy: CORSStrategy.DIRECT, protocolStrategies: {}, services: { rss2json: [], corsProxies: [] }, fallbackChain: [] },
  protocols: { priority: [], settings: {}, autoDetect: true, fallbackEnabled: true },
  verification: { minimumTrustRating: 0, preferredMethods: [], warningThreshold: 0 },
  display: { theme: 'light', density: 'comfortable', fontSize: 14 },
  infrastructure: {
    relayEnabled: true,
    anchoringEnabled: true,
    pqcEnabled: false,
    ipfsPinningEnabled: false,
    diagnosticsEnabled: false,
    ...overrides
  },
  general: {
    mode: DEFAULT_MISSION_MODE,
    refreshInterval: 1000,
    cacheSettings: { enabled: true, duration: 1000 },
    notifications: { enabled: true, sound: false }
  }
});

describe('infrastructureRuntime', () => {
  it('returns noop relay client when relay disabled', async () => {
    applyInfrastructureSettings(baseSettings({ relayEnabled: false }));

    const client = getRelayClient();
    const ack = await client.publish({ id: 'evt-noop', type: 'intel', payload: {}, ts: new Date().toISOString() });

    expect(ack.status).toBe('failed');
    expect(getInfrastructureSnapshot().relayEnabled).toBe(false);
  });

  it('falls back to mock anchor when anchoring disabled', () => {
    applyInfrastructureSettings(baseSettings({ anchoringEnabled: false }));

    const resolution = getAnchorClientResolution();
    expect(resolution.mode).toBe('mock');
    expect(resolution.reason).toBe('anchoring-disabled-by-settings');
  });

  it('enables relay event logging when diagnostics enabled', async () => {
    applyInfrastructureSettings(baseSettings({ diagnosticsEnabled: false, relayEnabled: true }));
    const before = inMemoryRelayClient.getEventLog().length;

    const relay = getRelayClient();
    await relay.publish({ id: `evt-${Date.now()}`, type: 'intel', payload: { a: 1 }, ts: new Date().toISOString() });
    const afterNoDiag = inMemoryRelayClient.getEventLog().length;
    expect(afterNoDiag - before).toBe(0);

    applyInfrastructureSettings(baseSettings({ diagnosticsEnabled: true, relayEnabled: true }));
    const beforeDiag = inMemoryRelayClient.getEventLog().length;
    await getRelayClient().publish({ id: `evt-${Date.now()}-diag`, type: 'intel', payload: { b: 2 }, ts: new Date().toISOString() });
    const afterDiag = inMemoryRelayClient.getEventLog().length;
    expect(afterDiag - beforeDiag).toBeGreaterThan(0);
  });
});
