export type AnchoringMode = 'mock' | 'real';

export interface AnchoringConfig {
  enabled: boolean;
  requestedMode: AnchoringMode;
  effectiveMode: AnchoringMode;
  allowReal: boolean;
  chain: string;
  reason?: string | undefined;
}

const truthy = new Set(['1', 'true', 'yes', 'on']);

const parseBool = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined || value === null) return fallback;
  return truthy.has(value.toLowerCase());
};

const parseMode = (value: string | undefined): AnchoringMode => {
  return value === 'real' ? 'real' : 'mock';
};

export const loadAnchoringConfig = (env: NodeJS.ProcessEnv = process.env): AnchoringConfig => {
  const enabled = parseBool(env.ANCHORING_ENABLED, true);
  const requestedMode = parseMode(env.ANCHORING_MODE);
  const allowReal = parseBool(env.ALLOW_REAL_ANCHORING, false);
  const chain = env.ANCHORING_CHAIN || 'QAN-mock';

  let effectiveMode: AnchoringMode = requestedMode;
  let reason: string | undefined;

  if (!enabled) {
    effectiveMode = 'mock';
    reason = 'anchoring-disabled';
  } else if (requestedMode === 'real' && !allowReal) {
    effectiveMode = 'mock';
    reason = 'real-mode-blocked';
  }

  return {
    enabled,
    requestedMode,
    effectiveMode,
    allowReal,
    chain,
    reason
  };
};
