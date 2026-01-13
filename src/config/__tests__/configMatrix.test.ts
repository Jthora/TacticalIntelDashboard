import { loadConfigMatrix, DEFAULT_CONFIG } from '../configMatrix';

describe('configMatrix', () => {
  it('returns defaults when env is empty', () => {
    const cfg = loadConfigMatrix({});

    expect(cfg.relay.enabled).toBe(true);
    expect(cfg.relay.primary).toBe(DEFAULT_CONFIG.relay.primary);
    expect(cfg.relay.fallbacks).toEqual([]);

    expect(cfg.pqc.enabled).toBe(false);
    expect(cfg.pqc.preferredScheme).toBe('falcon');

    expect(cfg.ipfs.gatewayPrimary).toBe(DEFAULT_CONFIG.ipfs.gatewayPrimary);
    expect(cfg.ipfs.gatewayFallback).toBe(DEFAULT_CONFIG.ipfs.gatewayFallback);
    expect(cfg.ipfs.pinningEnabled).toBe(false);

    expect(cfg.logging.level).toBe('info');
    expect(cfg.logging.verboseEvents).toBe(false);

    expect(cfg.ingestion.allowedHosts).toEqual([]);
    expect(cfg.ingestion.maxContentLengthBytes).toBe(1_000_000);
    expect(cfg.ingestion.blockPrivateNetworks).toBe(true);

    // Anchoring defaults from loadAnchoringConfig
    expect(cfg.anchoring.enabled).toBe(true);
    expect(cfg.anchoring.effectiveMode).toBe('mock');
  });

  it('overrides with env values', () => {
    const cfg = loadConfigMatrix({
      RELAY_ENABLED: 'false',
      RELAY_PRIMARY: 'https://relay.example',
      RELAY_FALLBACKS: 'https://a, https://b',
      PQC_ENABLED: 'true',
      PQC_SCHEME: 'dilithium',
      IPFS_GATEWAY_PRIMARY: 'https://ipfs.gateway',
      IPFS_GATEWAY_FALLBACK: 'https://ipfs.backup',
      IPFS_PINNING_ENABLED: 'true',
      LOG_LEVEL: 'debug',
      LOG_VERBOSE_EVENTS: 'yes',
      ANCHORING_ENABLED: 'false',
      FEED_ALLOWED_HOSTS: 'intel.example,feeds.example',
      FEED_MAX_CONTENT_LENGTH_BYTES: '2048',
      FEED_BLOCK_PRIVATE_NETWORKS: 'false'
    });

    expect(cfg.relay.enabled).toBe(false);
    expect(cfg.relay.primary).toBe('https://relay.example');
    expect(cfg.relay.fallbacks).toEqual(['https://a', 'https://b']);
    expect(cfg.pqc.enabled).toBe(true);
    expect(cfg.pqc.preferredScheme).toBe('dilithium');
    expect(cfg.ipfs.gatewayPrimary).toBe('https://ipfs.gateway');
    expect(cfg.ipfs.gatewayFallback).toBe('https://ipfs.backup');
    expect(cfg.ipfs.pinningEnabled).toBe(true);
    expect(cfg.logging.level).toBe('debug');
    expect(cfg.logging.verboseEvents).toBe(true);
    expect(cfg.anchoring.enabled).toBe(false);
    expect(cfg.anchoring.effectiveMode).toBe('mock');
    expect(cfg.ingestion.allowedHosts).toEqual(['intel.example', 'feeds.example']);
    expect(cfg.ingestion.maxContentLengthBytes).toBe(2048);
    expect(cfg.ingestion.blockPrivateNetworks).toBe(false);
  });

  it('sanitizes invalid values back to defaults', () => {
    const cfg = loadConfigMatrix({
      RELAY_PRIMARY: '',
      LOG_LEVEL: 'nope'
    });

    expect(cfg.relay.primary).toBe(DEFAULT_CONFIG.relay.primary);
    expect(cfg.logging.level).toBe('info');
    expect(cfg.ingestion.maxContentLengthBytes).toBe(1_000_000);
  });

  it('applies user preferences after env while protecting sensitive anchoring fields', () => {
    const cfg = loadConfigMatrix(
      { RELAY_PRIMARY: 'https://relay.env', ANCHORING_ENABLED: 'true', ANCHORING_MODE: 'real', ALLOW_REAL_ANCHORING: 'false' },
      {
        relay: { enabled: true, primary: 'https://relay.user', fallbacks: [] },
        anchoring: { enabled: true, requestedMode: 'mock', effectiveMode: 'mock', allowReal: true, chain: 'user-chain' }
      }
    );

    expect(cfg.relay.primary).toBe('https://relay.user');
    // Sensitive fields should not be overridden by userPrefs
    expect(cfg.anchoring.requestedMode).toBe('real');
    expect(cfg.anchoring.allowReal).toBe(false);
  });
});
