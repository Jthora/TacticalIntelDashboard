/**
 * Performance Manager - Centralized performance optimization for Tactical Intel Dashboard
 * Handles refresh intervals, caching, resource management, and system monitoring
 */

import { logger } from '../utils/LoggerService';

interface PerformanceConfig {
  refreshIntervals: {
    feeds: number;
    health: number;
    alerts: number;
    search: number;
  };
  caching: {
    feedCache: boolean;
    healthCache: boolean;
    searchCache: boolean;
    maxCacheSize: number;
    cacheExpiry: number;
  };
  throttling: {
    searchDelay: number;
    scrollThrottle: number;
    resizeThrottle: number;
  };
  batching: {
    feedRequests: boolean;
    healthChecks: boolean;
    maxBatchSize: number;
  };
  monitoring: {
    trackMemory: boolean;
    trackPerformance: boolean;
    alertThreshold: number;
  };
}

export class PerformanceManager {
  private static instance: PerformanceManager;
  private config: PerformanceConfig;
  private refreshTimers: Map<string, NodeJS.Timeout> = new Map();
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private isLowPowerMode: boolean = false;
  private performanceObserver?: PerformanceObserver;
  private memoryMonitor?: NodeJS.Timeout;

  private constructor() {
    this.config = this.getOptimalConfig();
    this.detectSystemCapabilities();
    this.initializeMonitoring();
  }

  static getInstance(): PerformanceManager {
    if (!PerformanceManager.instance) {
      PerformanceManager.instance = new PerformanceManager();
    }
    return PerformanceManager.instance;
  }

  private getOptimalConfig(): PerformanceConfig {
    // Detect system capabilities and adjust accordingly
    const isLowEndDevice = this.isLowEndDevice();
    
    return {
      refreshIntervals: {
        feeds: isLowEndDevice ? 10 * 60 * 1000 : 5 * 60 * 1000,      // 10min/5min
        health: isLowEndDevice ? 60 * 1000 : 30 * 1000,              // 60s/30s
        alerts: isLowEndDevice ? 5 * 60 * 1000 : 2 * 60 * 1000,     // 5min/2min
        search: isLowEndDevice ? 1000 : 500                          // 1s/500ms debounce
      },
      caching: {
        feedCache: true,
        healthCache: true,
        searchCache: true,
        maxCacheSize: isLowEndDevice ? 50 : 100,
        cacheExpiry: isLowEndDevice ? 5 * 60 * 1000 : 2 * 60 * 1000 // 5min/2min
      },
      throttling: {
        searchDelay: isLowEndDevice ? 800 : 300,
        scrollThrottle: isLowEndDevice ? 100 : 50,
        resizeThrottle: isLowEndDevice ? 250 : 100
      },
      batching: {
        feedRequests: true,
        healthChecks: true,
        maxBatchSize: isLowEndDevice ? 3 : 5
      },
      monitoring: {
        trackMemory: true,
        trackPerformance: true,
        alertThreshold: isLowEndDevice ? 70 : 85 // CPU/Memory %
      }
    };
  }

  private isLowEndDevice(): boolean {
    // Detect low-end devices based on available metrics
    const hardwareConcurrency = navigator.hardwareConcurrency || 1;
    const deviceMemory = (navigator as any).deviceMemory || 1;
    const connection = (navigator as any).connection;
    
    return (
      hardwareConcurrency <= 2 ||
      deviceMemory <= 2 ||
      (connection && connection.effectiveType === 'slow-2g') ||
      (connection && connection.effectiveType === '2g')
    );
  }

  private detectSystemCapabilities(): void {
    // Monitor system performance and adjust settings
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      const usedMemoryMB = memInfo.usedJSHeapSize / 1024 / 1024;
      const totalMemoryMB = memInfo.totalJSHeapSize / 1024 / 1024;
      
      if (usedMemoryMB / totalMemoryMB > 0.8) {
        this.enableLowPowerMode();
      }
    }
  }

  private initializeMonitoring(): void {
    if (!this.config.monitoring.trackPerformance) return;

    // Performance monitoring
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint' && entry.startTime > 3000) {
            console.warn('Slow FCP detected, enabling performance mode');
            this.enableLowPowerMode();
          }
        }
      });
      
      this.performanceObserver.observe({ entryTypes: ['paint', 'navigation'] });
    }

    // Memory monitoring
    if (this.config.monitoring.trackMemory) {
      this.memoryMonitor = setInterval(() => {
        this.checkMemoryUsage();
      }, 30000);
    }
  }

  private checkMemoryUsage(): void {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      const usedMemoryMB = memInfo.usedJSHeapSize / 1024 / 1024;
      const limitMemoryMB = memInfo.jsHeapSizeLimit / 1024 / 1024;
      
      const usagePercent = (usedMemoryMB / limitMemoryMB) * 100;
      
      if (usagePercent > this.config.monitoring.alertThreshold) {
        console.warn(`High memory usage: ${usagePercent.toFixed(1)}%`);
        this.enableLowPowerMode();
        this.cleanupCache();
      }
    }
  }

  enableLowPowerMode(): void {
    if (this.isLowPowerMode) return;
    
    logger.debug("Component", '🔋 Enabling low power mode for better performance');
    this.isLowPowerMode = true;
    
    // Reduce refresh intervals
    this.config.refreshIntervals.feeds *= 2;
    this.config.refreshIntervals.health *= 2;
    this.config.refreshIntervals.alerts *= 2;
    
    // Reduce cache size
    this.config.caching.maxCacheSize = Math.floor(this.config.caching.maxCacheSize / 2);
    
    // Clear half the cache
    this.cleanupCache(0.5);
    
    // Notify components
    window.dispatchEvent(new CustomEvent('performance:lowPowerMode', { 
      detail: { enabled: true } 
    }));
  }

  disableLowPowerMode(): void {
    if (!this.isLowPowerMode) return;
    
    logger.debug("Component", '⚡ Disabling low power mode');
    this.isLowPowerMode = false;
    this.config = this.getOptimalConfig();
    
    window.dispatchEvent(new CustomEvent('performance:lowPowerMode', { 
      detail: { enabled: false } 
    }));
  }

  // Cache Management
  setCache(key: string, data: any, ttl?: number): void {
    if (!this.config.caching.feedCache) return;
    
    const now = Date.now();
    const expiry = ttl || this.config.caching.cacheExpiry;
    
    // Cleanup if cache is full
    if (this.cache.size >= this.config.caching.maxCacheSize) {
      this.cleanupCache(0.2); // Remove 20% of oldest entries
    }
    
    this.cache.set(key, {
      data,
      timestamp: now,
      ttl: expiry
    });
  }

  getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  cleanupCache(fraction: number = 1): void {
    if (fraction >= 1) {
      this.cache.clear();
      return;
    }
    
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toRemove = Math.floor(entries.length * fraction);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  // Timer Management
  createTimer(id: string, callback: () => void, interval: number): void {
    this.clearTimer(id);
    const timer = setInterval(callback, interval);
    this.refreshTimers.set(id, timer);
  }

  clearTimer(id: string): void {
    const timer = this.refreshTimers.get(id);
    if (timer) {
      clearInterval(timer);
      this.refreshTimers.delete(id);
    }
  }

  clearAllTimers(): void {
    this.refreshTimers.forEach(timer => clearInterval(timer));
    this.refreshTimers.clear();
  }

  // Throttling utilities
  throttle<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;
    let previous = 0;
    
    return (...args: Parameters<T>) => {
      const now = Date.now();
      const remaining = wait - (now - previous);
      
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        func.apply(null, args);
      } else if (!timeout) {
        timeout = setTimeout(() => {
          previous = Date.now();
          timeout = null;
          func.apply(null, args);
        }, remaining);
      }
    };
  }

  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(null, args), wait);
    };
  }

  // Getters for configuration
  getRefreshInterval(type: keyof PerformanceConfig['refreshIntervals']): number {
    return this.config.refreshIntervals[type];
  }

  getThrottleDelay(type: keyof PerformanceConfig['throttling']): number {
    return this.config.throttling[type];
  }

  isCachingEnabled(): boolean {
    return this.config.caching.feedCache;
  }

  isLowPower(): boolean {
    return this.isLowPowerMode;
  }

  // Resource cleanup
  cleanup(): void {
    this.clearAllTimers();
    this.cleanupCache();
    
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    
    if (this.memoryMonitor) {
      clearInterval(this.memoryMonitor);
    }
  }

  // Performance metrics
  getMetrics(): any {
    return {
      cacheSize: this.cache.size,
      activeTimers: this.refreshTimers.size,
      isLowPowerMode: this.isLowPowerMode,
      config: this.config,
      memory: 'memory' in performance ? (performance as any).memory : null
    };
  }
}

export default PerformanceManager.getInstance();
