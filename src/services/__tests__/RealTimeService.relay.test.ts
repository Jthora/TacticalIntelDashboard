import { realTimeService } from '../RealTimeService';
import { getInfrastructureSnapshot, getRelayClient } from '../../utils/infrastructureRuntime';
import { RelayEvent, RelayHealth } from '../../types/RelayClient';

jest.mock('../../utils/infrastructureRuntime', () => ({
  getInfrastructureSnapshot: jest.fn(),
  getRelayClient: jest.fn()
}));

const baseInfra = {
  relayEnabled: true,
  anchoringEnabled: true,
  pqcEnabled: false,
  ipfsPinningEnabled: false,
  diagnosticsEnabled: false
};

type RelayHandler = (evt: RelayEvent) => void;

describe('RealTimeService relay wiring', () => {
  let relayHandler: RelayHandler | undefined;
  const unsubscribe = jest.fn();
  const publish = jest.fn().mockResolvedValue({ id: 'ack-1', status: 'ok' });
  const health = jest.fn<Promise<RelayHealth>, []>(() => Promise.resolve({ status: 'ok', checkedAt: new Date().toISOString() }));

  beforeEach(() => {
    jest.clearAllMocks();

    relayHandler = undefined;
    publish.mockClear();
    health.mockClear();
    unsubscribe.mockClear();

    (getInfrastructureSnapshot as jest.Mock).mockReturnValue(baseInfra);
    (getRelayClient as jest.Mock).mockReturnValue({
      subscribe: jest.fn((_filter, handler: RelayHandler) => {
        relayHandler = handler;
        return { unsubscribe };
      }),
      publish,
      health
    });

    (global as any).WebSocket = class {
      readyState = 1;
      send = jest.fn();
      close = jest.fn();
      constructor(public url?: string) {}
    } as any;

    realTimeService.stop();
    // Clear lingering handlers between tests
    (realTimeService as any).eventHandlers?.clear?.();
  });

  afterEach(() => {
    realTimeService.stop();
    (realTimeService as any).eventHandlers?.clear?.();
  });

  it('subscribes to relay client and routes events to handlers', async () => {
    const onFeed = jest.fn();
    realTimeService.on('feed_update', onFeed);

    realTimeService.start();

    expect(getRelayClient).toHaveBeenCalled();
    expect(relayHandler).toBeDefined();

    const ts = new Date().toISOString();
    relayHandler?.({ id: 'evt-1', type: 'feed_update', payload: { foo: 'bar' }, ts });

    expect(onFeed).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'feed_update', data: { foo: 'bar' } })
    );

    await Promise.resolve();
    expect(health).toHaveBeenCalled();
  });

  it('does not subscribe when relay is disabled', () => {
    (getInfrastructureSnapshot as jest.Mock).mockReturnValue({ ...baseInfra, relayEnabled: false });

    realTimeService.start();

    expect(getRelayClient).not.toHaveBeenCalled();
    expect(relayHandler).toBeUndefined();
  });

  it('publishes over relay when sending messages', async () => {
    realTimeService.start();

    await realTimeService.send({ type: 'alert', data: { message: 'test' }, timestamp: new Date() });

    expect(publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'alert', payload: { message: 'test' } })
    );
  });
});
