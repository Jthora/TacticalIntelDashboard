/**
 * Real-time service for managing live data updates and WebSocket connections
 * Provides centralized real-time functionality for the Intel Command Console
 */

import { log } from '../utils/LoggerService';

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
  send(message: RealTimeMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      log.warn('RealTimeService', 'Cannot send message - WebSocket not connected');
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
