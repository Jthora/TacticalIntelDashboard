import { loadAnchoringConfig } from '../anchoringConfig';

describe('loadAnchoringConfig', () => {
  it('defaults to enabled mock mode when env is empty', () => {
    const cfg = loadAnchoringConfig({});
    expect(cfg.enabled).toBe(true);
    expect(cfg.requestedMode).toBe('mock');
    expect(cfg.effectiveMode).toBe('mock');
    expect(cfg.allowReal).toBe(false);
    expect(cfg.chain).toBe('QAN-mock');
  });

  it('disables anchoring when ANCHORING_ENABLED is falsey', () => {
    const cfg = loadAnchoringConfig({ ANCHORING_ENABLED: 'false' });
    expect(cfg.enabled).toBe(false);
    expect(cfg.effectiveMode).toBe('mock');
    expect(cfg.reason).toBe('anchoring-disabled');
  });

  it('blocks real mode unless explicitly allowed', () => {
    const cfg = loadAnchoringConfig({ ANCHORING_MODE: 'real' });
    expect(cfg.requestedMode).toBe('real');
    expect(cfg.effectiveMode).toBe('mock');
    expect(cfg.reason).toBe('real-mode-blocked');
  });

  it('honors real mode when allow flag is set', () => {
    const cfg = loadAnchoringConfig({ ANCHORING_MODE: 'real', ALLOW_REAL_ANCHORING: 'true' });
    expect(cfg.requestedMode).toBe('real');
    expect(cfg.effectiveMode).toBe('real');
    expect(cfg.allowReal).toBe(true);
    expect(cfg.reason).toBeUndefined();
  });

  it('overrides chain name from env', () => {
    const cfg = loadAnchoringConfig({ ANCHORING_CHAIN: 'qan-dev' });
    expect(cfg.chain).toBe('qan-dev');
  });
});
