/**
 * Real-time service for managing live data updates and WebSocket connections
 * Provides centralized real-time functionality for the Intel Command Console
 */

import { log } from '../utils/LoggerService';
import { getInfrastructureSnapshot, getRelayClient } from '../utils/infrastructureRuntime';
import { RelayClient, RelayEvent, RelayHealth, RelaySubscription } from '../types/RelayClient';

export interface RealTimeConfig {
  autoReconnect: boolean;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

export interface RealTimeMessage {
  type: 'feed_update' | 'health_update' | 'alert' | 'system_update';
  data: any;
  timestamp: Date;
}

export type RealTimeEventHandler = (message: RealTimeMessage) => void;

export class RealTimeService {
  private static instance: RealTimeService;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private eventHandlers: Map<string, RealTimeEventHandler[]> = new Map();
  private relayClient: RelayClient | null = null;
  private relaySubscription: RelaySubscription | null = null;
  
  private readonly config: RealTimeConfig = {
    autoReconnect: true,
    reconnectInterval: 5000,
    maxReconnectAttempts: 5,
    heartbeatInterval: 30000
  };

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): RealTimeService {
    if (!this.instance) {
      this.instance = new RealTimeService();
    }
    return this.instance;
  }

  /**
   * Start the real-time service
   */
  start(wsUrl?: string): void {
    const infra = getInfrastructureSnapshot();

    if (!infra.relayEnabled) {
      this.teardownRelay();
      log.warn('RealTimeService', 'Relay disabled via settings; skipping relay/WebSocket start');
      this.handleMessage({ type: 'health_update', data: { status: 'down', lastError: 'relay-disabled' }, timestamp: new Date() });
      return;
    }

    if (!this.relaySubscription) {
      try {
        this.relayClient = getRelayClient();
        this.relaySubscription = this.relayClient.subscribe({ types: ['feed_update', 'health_update', 'alert', 'system_update'] }, (event: RelayEvent) => {
          this.handleRelayEvent(event);
        });
        this.emitRelayHealth();
      } catch (error) {
        log.warn('RealTimeService', 'Failed to subscribe to relay client', { error });
      }
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      log.warn('RealTimeService', 'Service already started');
      return;
    }

    const url = wsUrl || process.env.VITE_WEBSOCKET_URL || 'ws://localhost:8080/ws';
    
    try {
      this.ws = new WebSocket(url);
      this.setupWebSocketHandlers();
      log.info('RealTimeService', 'Starting real-time service', { url });
    } catch (error) {
      log.error('RealTimeService', 'Failed to start service', { error });
      this.scheduleReconnect();
    }
  }

  /**
   * Stop the real-time service
   */
  stop(): void {
    log.info('RealTimeService', 'Stopping real-time service');
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.teardownRelay();
    this.reconnectAttempts = 0;
  }

  /**
   * Subscribe to real-time events
   */
  on(eventType: string, handler: RealTimeEventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  /**
   * Unsubscribe from real-time events
   */
  off(eventType: string, handler: RealTimeEventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Send a message via WebSocket
   */
  async send(message: RealTimeMessage): Promise<void> {
    if (this.relayClient) {
      try {
        await this.relayClient.publish({
          id: `rt-${Date.now()}`,
          type: message.type,
          payload: message.data,
          ts: message.timestamp.toISOString()
        });
        return;
      } catch (error) {
        log.warn('RealTimeService', 'Relay publish failed, falling back to WebSocket if available', { error });
      }
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      log.warn('RealTimeService', 'Cannot send message - no relay client or WebSocket connected');
    }
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RealTimeConfig>): void {
    Object.assign(this.config, config);
    log.info('RealTimeService', 'Configuration updated', { config: this.config });
  }

  /**
   * Legacy subscribe method for backward compatibility
   */
  subscribe(key: string, callback: (data: any) => void): () => void {
    const handler: RealTimeEventHandler = (message) => {
      if (message.type === 'feed_update' && message.data.key === key) {
        callback(message.data);
      }
    };
    
    this.on('feed_update', handler);
    
    return () => {
      this.off('feed_update', handler);
    };
  }

  private setupWebSocketHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      log.info('RealTimeService', 'WebSocket connected');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      try {
        const message: RealTimeMessage = JSON.parse(event.data);
        message.timestamp = new Date(message.timestamp);
        this.handleMessage(message);
      } catch (error) {
        log.error('RealTimeService', 'Failed to parse message', { error, data: event.data });
      }
    };

    this.ws.onclose = (event) => {
      log.info('RealTimeService', 'WebSocket disconnected', { code: event.code, reason: event.reason });
      this.stopHeartbeat();
      
      if (this.config.autoReconnect && this.reconnectAttempts < this.config.maxReconnectAttempts) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      log.error('RealTimeService', 'WebSocket error', { error });
    };
  }

  private handleMessage(message: RealTimeMessage): void {
    const handlers = this.eventHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          log.error('RealTimeService', 'Error in event handler', { error, messageType: message.type });
        }
      });
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.reconnectAttempts++;
    const delay = this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
    
    log.info('RealTimeService', 'Scheduling reconnect', { 
      attempt: this.reconnectAttempts, 
      delay, 
      maxAttempts: this.config.maxReconnectAttempts 
    });

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.start();
    }, delay);
  }

  private handleRelayEvent(event: RelayEvent): void {
    this.handleMessage({
      type: event.type as RealTimeMessage['type'],
      data: event.payload,
      timestamp: new Date(event.ts)
    });
  }

  private async emitRelayHealth(): Promise<void> {
    if (!this.relayClient) return;

    try {
      const health: RelayHealth = await this.relayClient.health();
      this.handleMessage({ type: 'health_update', data: health, timestamp: new Date(health.checkedAt || Date.now()) });
    } catch (error) {
      log.warn('RealTimeService', 'Failed to read relay health', { error });
    }
  }

  private teardownRelay(): void {
    if (this.relaySubscription) {
      this.relaySubscription.unsubscribe();
      this.relaySubscription = null;
    }
    this.relayClient = null;
  }

  private startHeartbeat(): void {
    if (this.heartbeatTimer) return;

    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({
          type: 'system_update',
          data: { type: 'heartbeat' },
          timestamp: new Date()
        });
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

// Export singleton instance
export const realTimeService = RealTimeService.getInstance();
export default RealTimeService;
