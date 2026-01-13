import { IntelligenceBridge, TIDIntelligenceFormat } from '../IntelligenceBridge';
import { getAnchorClientResolution, getInfrastructureSnapshot, getRelayClient } from '../../utils/infrastructureRuntime';

jest.mock(
  'ipfs-http-client',
  () => ({
    create: jest.fn(() => ({}))
  }),
  { virtual: true }
);

jest.mock('../../utils/infrastructureRuntime', () => ({
  getInfrastructureSnapshot: jest.fn(),
  getRelayClient: jest.fn(),
  getAnchorClientResolution: jest.fn()
}));

const uploadContent = jest.fn();
const pinContent = jest.fn();
const ipfsMock = {
  uploadContent,
  pinContent,
  getContent: jest.fn()
};

const signMessage = jest.fn().mockResolvedValue('signature');
const web3Mock = {
  isConnected: true,
  walletAddress: '0xabc',
  signer: {},
  signMessage
};

const baseInfrastructure = {
  relayEnabled: true,
  anchoringEnabled: true,
  pqcEnabled: false,
  ipfsPinningEnabled: false,
  diagnosticsEnabled: false
};

const sampleIntel: TIDIntelligenceFormat = {
  id: 'intel-test',
  timestamp: '2026-01-12T00:00:00.000Z',
  title: 'Runtime publish test',
  content: 'Test content',
  source: {
    name: 'Source',
    url: 'https://example.com',
    category: 'general'
  },
  metadata: {
    tags: ['a'],
    priority: 'medium',
    confidence: 0.75
  }
};

const primeUploads = (hashes: string[]) => {
  uploadContent.mockReset();
  hashes.forEach((hash) => uploadContent.mockResolvedValueOnce(hash));
};

const mockRelayClient = (publishImpl = jest.fn()) => ({
  publish: publishImpl,
  subscribe: jest.fn(),
  health: jest.fn()
});

beforeEach(() => {
  jest.clearAllMocks();
  pinContent.mockResolvedValue(undefined);
});

describe('IntelligenceBridge infrastructure runtime wiring', () => {
  it('publishes to relay and anchors when enabled', async () => {
    primeUploads(['tid-hash', 'ime-hash', 'meta-hash']);
    const publish = jest.fn().mockResolvedValue({ id: 'evt-1', status: 'ok' as const });
    const anchor = jest.fn().mockResolvedValue({ txRef: 'tx-123', chain: 'mock', status: 'submitted' as const });

    (getInfrastructureSnapshot as jest.Mock).mockReturnValue(baseInfrastructure);
    (getRelayClient as jest.Mock).mockReturnValue(mockRelayClient(publish));
    (getAnchorClientResolution as jest.Mock).mockReturnValue({
      client: { anchor, get: jest.fn() },
      mode: 'mock',
      reason: 'test-mode'
    });

    const bridge = new IntelligenceBridge(ipfsMock as any, web3Mock as any);
    const result = await bridge.publishIntelligence(sampleIntel);

    expect(result.metadataHash).toBe('meta-hash');
    expect(publish).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ metadataHash: 'meta-hash', title: sampleIntel.title })
      })
    );
    expect(result.relay?.ack?.status).toBe('ok');
    expect(anchor).toHaveBeenCalledWith({ hash: 'meta-hash', context: `intel:${sampleIntel.id}` });
    expect(result.anchor?.record?.txRef).toBe('tx-123');
  });

  it('skips relay and anchoring when toggles disable them', async () => {
    primeUploads(['tid-hash', 'ime-hash', 'meta-hash']);
    const publish = jest.fn();
    const anchor = jest.fn();

    (getInfrastructureSnapshot as jest.Mock).mockReturnValue({
      ...baseInfrastructure,
      relayEnabled: false,
      anchoringEnabled: false
    });
    (getRelayClient as jest.Mock).mockReturnValue(mockRelayClient(publish));
    (getAnchorClientResolution as jest.Mock).mockReturnValue({
      client: { anchor, get: jest.fn() },
      mode: 'mock',
      reason: 'anchoring-disabled-by-settings'
    });

    const bridge = new IntelligenceBridge(ipfsMock as any, web3Mock as any);
    const result = await bridge.publishIntelligence(sampleIntel);

    expect(result.relay?.disabled).toBe(true);
    expect(publish).not.toHaveBeenCalled();
    expect(result.anchor?.disabled).toBe(true);
    expect(anchor).not.toHaveBeenCalled();
  });
});
