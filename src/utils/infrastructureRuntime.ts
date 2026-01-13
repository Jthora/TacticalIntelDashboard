import { Settings } from '../contexts/SettingsContext';
import { loadConfigMatrix, ConfigMatrix } from '../config/configMatrix';
import { getAnchorClient, AnchorClientResolution } from './anchor/getAnchorClient';
import { mockAnchorClient } from './anchor/mockAnchorClient';
import { inMemoryRelayClient } from './relay/inMemoryRelayClient';
import { RelayClient, RelayEvent, RelayFilter, RelayHealth, RelayHandler, RelaySubscription } from '../types/RelayClient';
import { logger, LogLevel } from './LoggerService';

const DEFAULT_INFRA = {
  relayEnabled: true,
  anchoringEnabled: true,
  pqcEnabled: false,
  ipfsPinningEnabled: false,
  diagnosticsEnabled: false
} satisfies Settings['infrastructure'];

class NoopRelayClient implements RelayClient {
  async publish<T = any>(event: RelayEvent<T>) {
    return { id: event.id, status: 'failed', error: 'relay-disabled' } as const;
  }

  subscribe<T = any>(_filter: RelayFilter, _handler: RelayHandler<T>): RelaySubscription {
    return { unsubscribe: () => undefined };
  }

  async health(): Promise<RelayHealth> {
    return { status: 'down', lastError: 'relay-disabled' };
  }
}

const noopRelayClient = new NoopRelayClient();

let currentInfra: Settings['infrastructure'] = { ...DEFAULT_INFRA };
let currentConfig: ConfigMatrix = loadConfigMatrix();
let currentRelay: RelayClient = inMemoryRelayClient;
let currentAnchor: AnchorClientResolution = { client: mockAnchorClient, mode: 'mock', reason: 'not-initialized' };

const applyLoggerPreferences = (diagnosticsEnabled: boolean) => {
  logger.setLogLevel(diagnosticsEnabled ? LogLevel.DEBUG : LogLevel.INFO);
  logger.setConsoleOutput(diagnosticsEnabled);
};

export const applyInfrastructureSettings = (settings: Settings) => {
  currentInfra = { ...DEFAULT_INFRA, ...(settings.infrastructure || {}) };

  currentConfig = loadConfigMatrix(process.env, {
    relay: { ...currentConfig.relay, enabled: currentInfra.relayEnabled },
    anchoring: { ...currentConfig.anchoring, enabled: currentInfra.anchoringEnabled },
    pqc: { ...currentConfig.pqc, enabled: currentInfra.pqcEnabled },
    ipfs: { ...currentConfig.ipfs, pinningEnabled: currentInfra.ipfsPinningEnabled },
    logging: { ...currentConfig.logging, verboseEvents: currentInfra.diagnosticsEnabled, level: currentInfra.diagnosticsEnabled ? 'debug' : currentConfig.logging.level }
  });

  if (currentInfra.relayEnabled) {
    inMemoryRelayClient.configureSimulation({ logEvents: currentInfra.diagnosticsEnabled });
    currentRelay = inMemoryRelayClient;
  } else {
    currentRelay = noopRelayClient;
  }

  currentAnchor = currentInfra.anchoringEnabled
    ? getAnchorClient(currentConfig.anchoring)
    : { client: mockAnchorClient, mode: 'mock', reason: 'anchoring-disabled-by-settings' };

  applyLoggerPreferences(currentInfra.diagnosticsEnabled);

  return {
    config: currentConfig,
    relayClient: currentRelay,
    anchorResolution: currentAnchor,
    infrastructure: currentInfra
  };
};

export const getRelayClient = (): RelayClient => currentRelay;
export const getAnchorClientResolution = (): AnchorClientResolution => currentAnchor;
export const getInfrastructureSnapshot = (): Settings['infrastructure'] => currentInfra;
export const getConfigMatrixSnapshot = (): ConfigMatrix => currentConfig;
