import { loadAnchoringConfig, AnchoringConfig } from './anchoringConfig';

export interface RelayConfig {
  enabled: boolean;
  primary: string;
  fallbacks: string[];
}

export interface PqcConfig {
  enabled: boolean;
  preferredScheme: string;
}

export interface IpfsConfig {
  gatewayPrimary: string;
  gatewayFallback: string;
  pinningEnabled: boolean;
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  verboseEvents: boolean;
}

export interface IngestionSecurityConfig {
  allowedHosts: string[];
  maxContentLengthBytes: number;
  blockPrivateNetworks: boolean;
}

export interface ConfigMatrix {
  relay: RelayConfig;
  anchoring: AnchoringConfig;
  pqc: PqcConfig;
  ipfs: IpfsConfig;
  logging: LoggingConfig;
  ingestion: IngestionSecurityConfig;
}

const truthy = new Set(['1', 'true', 'yes', 'on']);

const parseBool = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined || value === null) return fallback;
  return truthy.has(value.toLowerCase());
};

const parseString = (value: string | undefined, fallback: string): string => {
  if (!value || value.trim().length === 0) return fallback;
  return value.trim();
};

const parseLogLevel = (value: string | undefined): LoggingConfig['level'] => {
  const v = value?.toLowerCase();
  if (v === 'debug' || v === 'info' || v === 'warn' || v === 'error') return v;
  return 'info';
};

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseList = (value: string | undefined): string[] => {
  if (!value) return [];
  return value
    .split(',')
    .map(entry => entry.trim().toLowerCase())
    .filter(Boolean);
};

export const DEFAULT_CONFIG: ConfigMatrix = {
  relay: {
    enabled: true,
    primary: 'https://relay.local',
    fallbacks: []
  },
  anchoring: loadAnchoringConfig({}),
  pqc: {
    enabled: false,
    preferredScheme: 'falcon'
  },
  ipfs: {
    gatewayPrimary: 'https://ipfs.io/ipfs/',
    gatewayFallback: 'https://cloudflare-ipfs.com/ipfs/',
    pinningEnabled: false
  },
  logging: {
    level: 'info',
    verboseEvents: false
  },
  ingestion: {
    allowedHosts: [],
    maxContentLengthBytes: 1_000_000, // 1 MB default cap to block oversized payloads
    blockPrivateNetworks: true
  }
};

// Precedence: defaults -> env -> user preferences (excluding sensitive fields)
const SENSITIVE_ANCHOR_FIELDS = new Set<keyof AnchoringConfig>(['allowReal', 'effectiveMode', 'requestedMode']);

export const loadConfigMatrix = (
  env: NodeJS.ProcessEnv = process.env,
  userPrefs?: Partial<ConfigMatrix>
): ConfigMatrix => {
  const relay: RelayConfig = {
    enabled: parseBool(env.RELAY_ENABLED, DEFAULT_CONFIG.relay.enabled),
    primary: parseString(env.RELAY_PRIMARY, DEFAULT_CONFIG.relay.primary),
    fallbacks: env.RELAY_FALLBACKS ? env.RELAY_FALLBACKS.split(',').map(s => s.trim()).filter(Boolean) : DEFAULT_CONFIG.relay.fallbacks
  };

  const anchoring = loadAnchoringConfig(env);

  const pqc: PqcConfig = {
    enabled: parseBool(env.PQC_ENABLED, DEFAULT_CONFIG.pqc.enabled),
    preferredScheme: parseString(env.PQC_SCHEME, DEFAULT_CONFIG.pqc.preferredScheme)
  };

  const ipfs: IpfsConfig = {
    gatewayPrimary: parseString(env.IPFS_GATEWAY_PRIMARY, DEFAULT_CONFIG.ipfs.gatewayPrimary),
    gatewayFallback: parseString(env.IPFS_GATEWAY_FALLBACK, DEFAULT_CONFIG.ipfs.gatewayFallback),
    pinningEnabled: parseBool(env.IPFS_PINNING_ENABLED, DEFAULT_CONFIG.ipfs.pinningEnabled)
  };

  const logging: LoggingConfig = {
    level: parseLogLevel(env.LOG_LEVEL),
    verboseEvents: parseBool(env.LOG_VERBOSE_EVENTS, DEFAULT_CONFIG.logging.verboseEvents)
  };

  const ingestion: IngestionSecurityConfig = {
    allowedHosts: parseList(env.FEED_ALLOWED_HOSTS),
    maxContentLengthBytes: parseNumber(env.FEED_MAX_CONTENT_LENGTH_BYTES, DEFAULT_CONFIG.ingestion.maxContentLengthBytes),
    blockPrivateNetworks: parseBool(env.FEED_BLOCK_PRIVATE_NETWORKS, DEFAULT_CONFIG.ingestion.blockPrivateNetworks)
  };

  let merged: ConfigMatrix = { relay, anchoring, pqc, ipfs, logging, ingestion };

  if (userPrefs) {
    merged = {
      relay: { ...merged.relay, ...userPrefs.relay },
      anchoring: {
        ...merged.anchoring,
        ...Object.fromEntries(
          Object.entries(userPrefs.anchoring || {}).filter(([key]) => !SENSITIVE_ANCHOR_FIELDS.has(key as keyof AnchoringConfig))
        )
      },
      pqc: { ...merged.pqc, ...userPrefs.pqc },
      ipfs: { ...merged.ipfs, ...userPrefs.ipfs },
      logging: { ...merged.logging, ...userPrefs.logging },
      ingestion: { ...merged.ingestion, ...userPrefs.ingestion }
    };
  }

  return merged;
};
