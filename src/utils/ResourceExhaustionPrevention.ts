// src/utils/ResourceExhaustionPrevention.ts
interface ResourceMetrics {
  domNodeCount: number;
  eventListenerCount: number;
  timerCount: number;
  intervalCount: number;
  observerCount: number;
  webSocketCount: number;
  imageLoadCount: number;
  cssRuleCount: number;
}

interface ResourceLimits {
  maxDomNodes: number;
  maxEventListeners: number;
  maxTimers: number;
  maxIntervals: number;
  maxObservers: number;
  maxWebSockets: number;
  maxImageLoads: number;
  maxCssRules: number;
}

export class ResourceExhaustionPrevention {
  private static instance: ResourceExhaustionPrevention;
  private metrics: ResourceMetrics = {
    domNodeCount: 0,
    eventListenerCount: 0,
    timerCount: 0,
    intervalCount: 0,
    observerCount: 0,
    webSocketCount: 0,
    imageLoadCount: 0,
    cssRuleCount: 0
  };
  
  private limits: ResourceLimits = {
    maxDomNodes: 2000,
    maxEventListeners: 500,
    maxTimers: 100,
    maxIntervals: 50,
    maxObservers: 20,
    maxWebSockets: 10,
    maxImageLoads: 200,
    maxCssRules: 10000
  };
  
  private trackedTimers: Set<number> = new Set();
  private trackedIntervals: Set<number> = new Set();
  private trackedObservers: Set<any> = new Set();
  private trackedWebSockets: Set<WebSocket> = new Set();
  private trackedEventListeners: Map<string, number> = new Map();
  
  private cleanupCallbacks: (() => void)[] = [];
  private warningCallbacks: ((resource: string, current: number, limit: number) => void)[] = [];
  
  public static getInstance(): ResourceExhaustionPrevention {
    if (!ResourceExhaustionPrevention.instance) {
      ResourceExhaustionPrevention.instance = new ResourceExhaustionPrevention();
    }
    return ResourceExhaustionPrevention.instance;
  }
  
  /**
   * Initialize resource monitoring
   */
  public initialize(): void {
    this.patchTimerFunctions();
    this.patchObserverFunctions();
    this.patchWebSocketFunctions();
    this.setupDomMonitoring();
    this.setupEventListenerMonitoring();
    this.setupCssMonitoring();
    
    // Start periodic monitoring
    setInterval(() => this.checkResourceLimits(), 10000);
    
    console.log('🛡️ Resource exhaustion prevention initialized');
  }
  
  /**
   * Patch setTimeout and setInterval to track them
   */
  private patchTimerFunctions(): void {
    const originalSetTimeout = window.setTimeout.bind(window);
    const originalSetInterval = window.setInterval.bind(window);
    const originalClearTimeout = window.clearTimeout.bind(window);
    const originalClearInterval = window.clearInterval.bind(window);
    
    // Override setTimeout with tracking
    (window as any).setTimeout = (handler: TimerHandler, timeout?: number, ...args: any[]): number => {
      if (this.metrics.timerCount >= this.limits.maxTimers) {
        console.warn(`🚨 Timer limit reached (${this.limits.maxTimers}), cleaning old timers`);
        this.cleanupOldTimers();
      }
      
      const id = originalSetTimeout(handler, timeout, ...args);
      this.trackedTimers.add(id);
      this.metrics.timerCount++;
      
      return id;
    };
    
    // Override setInterval with tracking
    (window as any).setInterval = (handler: TimerHandler, timeout?: number, ...args: any[]): number => {
      if (this.metrics.intervalCount >= this.limits.maxIntervals) {
        console.warn(`🚨 Interval limit reached (${this.limits.maxIntervals}), cleaning old intervals`);
        this.cleanupOldIntervals();
      }
      
      const id = originalSetInterval(handler, timeout, ...args);
      this.trackedIntervals.add(id);
      this.metrics.intervalCount++;
      
      return id;
    };
    
    // Override clearTimeout with tracking
    (window as any).clearTimeout = (id?: number | string | NodeJS.Timeout): void => {
      if (id !== undefined) {
        originalClearTimeout(id as any);
        if (typeof id === 'number' && this.trackedTimers.has(id)) {
          this.trackedTimers.delete(id);
          this.metrics.timerCount = Math.max(0, this.metrics.timerCount - 1);
        }
      }
    };
    
    // Override clearInterval with tracking
    (window as any).clearInterval = (id?: number | string | NodeJS.Timeout): void => {
      if (id !== undefined) {
        originalClearInterval(id as any);
        if (typeof id === 'number' && this.trackedIntervals.has(id)) {
          this.trackedIntervals.delete(id);
          this.metrics.intervalCount = Math.max(0, this.metrics.intervalCount - 1);
        }
      }
    };
  }
  
  /**
   * Patch observer functions
   */
  private patchObserverFunctions(): void {
    // Patch MutationObserver
    const originalMutationObserver = window.MutationObserver;
    const self = this;
    
    window.MutationObserver = class extends originalMutationObserver {
      constructor(callback: MutationCallback) {
        super(callback);
        
        if (self.metrics.observerCount >= self.limits.maxObservers) {
          console.warn(`🚨 Observer limit reached (${self.limits.maxObservers})`);
          self.triggerWarning('observers', self.metrics.observerCount, self.limits.maxObservers);
        }
        
        self.trackedObservers.add(this);
        self.metrics.observerCount++;
      }
      
      disconnect(): void {
        super.disconnect();
        if (self.trackedObservers.has(this)) {
          self.trackedObservers.delete(this);
          self.metrics.observerCount = Math.max(0, self.metrics.observerCount - 1);
        }
      }
    };
    
    // Patch IntersectionObserver
    if (window.IntersectionObserver) {
      const originalIntersectionObserver = window.IntersectionObserver;
      
      window.IntersectionObserver = class extends originalIntersectionObserver {
        constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
          super(callback, options);
          
          if (self.metrics.observerCount >= self.limits.maxObservers) {
            console.warn(`🚨 Observer limit reached (${self.limits.maxObservers})`);
            self.triggerWarning('observers', self.metrics.observerCount, self.limits.maxObservers);
          }
          
          self.trackedObservers.add(this);
          self.metrics.observerCount++;
        }
        
        disconnect(): void {
          super.disconnect();
          if (self.trackedObservers.has(this)) {
            self.trackedObservers.delete(this);
            self.metrics.observerCount = Math.max(0, self.metrics.observerCount - 1);
          }
        }
      };
    }
  }
  
  /**
   * Patch WebSocket functions
   */
  private patchWebSocketFunctions(): void {
    const originalWebSocket = window.WebSocket;
    const self = this;
    
    window.WebSocket = class extends originalWebSocket {
      constructor(url: string | URL, protocols?: string | string[]) {
        super(url, protocols);
        
        if (self.metrics.webSocketCount >= self.limits.maxWebSockets) {
          console.warn(`🚨 WebSocket limit reached (${self.limits.maxWebSockets})`);
          self.triggerWarning('websockets', self.metrics.webSocketCount, self.limits.maxWebSockets);
        }
        
        self.trackedWebSockets.add(this);
        self.metrics.webSocketCount++;
        
        // Auto-remove when closed
        this.addEventListener('close', () => {
          if (self.trackedWebSockets.has(this)) {
            self.trackedWebSockets.delete(this);
            self.metrics.webSocketCount = Math.max(0, self.metrics.webSocketCount - 1);
          }
        });
      }
      
      close(code?: number, reason?: string): void {
        super.close(code, reason);
        if (self.trackedWebSockets.has(this)) {
          self.trackedWebSockets.delete(this);
          self.metrics.webSocketCount = Math.max(0, self.metrics.webSocketCount - 1);
        }
      }
    };
  }
  
  /**
   * Monitor DOM node creation
   */
  private setupDomMonitoring(): void {
    const observer = new MutationObserver((mutations) => {
      let nodesAdded = 0;
      
      mutations.forEach((mutation) => {
        nodesAdded += mutation.addedNodes.length;
      });
      
      this.metrics.domNodeCount = document.querySelectorAll('*').length;
      
      if (this.metrics.domNodeCount > this.limits.maxDomNodes) {
        console.warn(`🚨 DOM node limit exceeded: ${this.metrics.domNodeCount}/${this.limits.maxDomNodes}`);
        this.triggerWarning('dom-nodes', this.metrics.domNodeCount, this.limits.maxDomNodes);
        this.suggestDomCleanup();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  /**
   * Monitor event listener creation
   */
  private setupEventListenerMonitoring(): void {
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    const originalRemoveEventListener = EventTarget.prototype.removeEventListener;
    const self = this;
    
    EventTarget.prototype.addEventListener = function(
      type: string,
      listener: any,
      options?: boolean | AddEventListenerOptions
    ) {
      const key = `${this.constructor.name}-${type}`;
      const current = self.trackedEventListeners.get(key) || 0;
      self.trackedEventListeners.set(key, current + 1);
      self.metrics.eventListenerCount = Array.from(self.trackedEventListeners.values())
        .reduce((sum, count) => sum + count, 0);
      
      if (self.metrics.eventListenerCount > self.limits.maxEventListeners) {
        console.warn(`🚨 Event listener limit exceeded: ${self.metrics.eventListenerCount}/${self.limits.maxEventListeners}`);
        self.triggerWarning('event-listeners', self.metrics.eventListenerCount, self.limits.maxEventListeners);
      }
      
      return originalAddEventListener.call(this, type, listener, options);
    };
    
    EventTarget.prototype.removeEventListener = function(
      type: string,
      listener: any,
      options?: boolean | EventListenerOptions
    ) {
      const key = `${this.constructor.name}-${type}`;
      const current = self.trackedEventListeners.get(key) || 0;
      if (current > 0) {
        self.trackedEventListeners.set(key, current - 1);
        self.metrics.eventListenerCount = Math.max(0, self.metrics.eventListenerCount - 1);
      }
      
      return originalRemoveEventListener.call(this, type, listener, options);
    };
  }
  
  /**
   * Monitor CSS rule creation
   */
  private setupCssMonitoring(): void {
    // Monitor style sheets
    const countCssRules = () => {
      let totalRules = 0;
      
      try {
        for (let i = 0; i < document.styleSheets.length; i++) {
          const sheet = document.styleSheets[i];
          try {
            totalRules += sheet.cssRules?.length || 0;
          } catch (e) {
            // Cross-origin stylesheets may throw errors
          }
        }
      } catch (e) {
        // Fallback counting method
        totalRules = document.querySelectorAll('style, link[rel="stylesheet"]').length * 100;
      }
      
      this.metrics.cssRuleCount = totalRules;
      
      if (totalRules > this.limits.maxCssRules) {
        console.warn(`🚨 CSS rule limit exceeded: ${totalRules}/${this.limits.maxCssRules}`);
        this.triggerWarning('css-rules', totalRules, this.limits.maxCssRules);
      }
    };
    
    // Check CSS rules periodically
    setInterval(countCssRules, 30000);
    countCssRules(); // Initial count
  }
  
  /**
   * Clean up old timers
   */
  private cleanupOldTimers(): void {
    let cleaned = 0;
    const timersToRemove = Array.from(this.trackedTimers).slice(0, 20);
    
    timersToRemove.forEach(id => {
      clearTimeout(id);
      this.trackedTimers.delete(id);
      cleaned++;
    });
    
    this.metrics.timerCount = Math.max(0, this.metrics.timerCount - cleaned);
    console.log(`🧹 Cleaned ${cleaned} old timers`);
  }
  
  /**
   * Clean up old intervals
   */
  private cleanupOldIntervals(): void {
    let cleaned = 0;
    const intervalsToRemove = Array.from(this.trackedIntervals).slice(0, 10);
    
    intervalsToRemove.forEach(id => {
      clearInterval(id);
      this.trackedIntervals.delete(id);
      cleaned++;
    });
    
    this.metrics.intervalCount = Math.max(0, this.metrics.intervalCount - cleaned);
    console.log(`🧹 Cleaned ${cleaned} old intervals`);
  }
  
  /**
   * Suggest DOM cleanup
   */
  private suggestDomCleanup(): void {
    window.dispatchEvent(new CustomEvent('tactical-dom-cleanup', {
      detail: {
        nodeCount: this.metrics.domNodeCount,
        limit: this.limits.maxDomNodes
      }
    }));
  }
  
  /**
   * Check all resource limits
   */
  private checkResourceLimits(): void {
    // Update current metrics
    this.metrics.domNodeCount = document.querySelectorAll('*').length;
    
    // Check each limit
    Object.entries(this.limits).forEach(([key, limit]) => {
      const metricKey = key.replace('max', '').toLowerCase() + 'Count' as keyof ResourceMetrics;
      const current = this.metrics[metricKey] as number;
      
      if (current > limit) {
        this.triggerWarning(key, current, limit);
      }
    });
  }
  
  /**
   * Trigger warning callbacks
   */
  private triggerWarning(resource: string, current: number, limit: number): void {
    this.warningCallbacks.forEach(callback => {
      try {
        callback(resource, current, limit);
      } catch (error) {
        console.error('Error in resource warning callback:', error);
      }
    });
  }
  
  /**
   * Force cleanup of all tracked resources
   */
  public forceCleanup(): void {
    console.log('🧹 Force cleanup initiated');
    
    // Clear timers
    this.trackedTimers.forEach(id => clearTimeout(id));
    this.trackedTimers.clear();
    this.metrics.timerCount = 0;
    
    // Clear intervals
    this.trackedIntervals.forEach(id => clearInterval(id));
    this.trackedIntervals.clear();
    this.metrics.intervalCount = 0;
    
    // Disconnect observers
    this.trackedObservers.forEach(observer => {
      if (observer.disconnect) {
        observer.disconnect();
      }
    });
    this.trackedObservers.clear();
    this.metrics.observerCount = 0;
    
    // Close WebSockets
    this.trackedWebSockets.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });
    this.trackedWebSockets.clear();
    this.metrics.webSocketCount = 0;
    
    // Trigger cleanup callbacks
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in cleanup callback:', error);
      }
    });
    
    // Dispatch cleanup event
    window.dispatchEvent(new CustomEvent('tactical-force-cleanup'));
    
    console.log('🧹 Force cleanup completed');
  }
  
  /**
   * Subscribe to cleanup events
   */
  public onCleanup(callback: () => void): () => void {
    this.cleanupCallbacks.push(callback);
    return () => {
      const index = this.cleanupCallbacks.indexOf(callback);
      if (index > -1) {
        this.cleanupCallbacks.splice(index, 1);
      }
    };
  }
  
  /**
   * Subscribe to warning events
   */
  public onWarning(callback: (resource: string, current: number, limit: number) => void): () => void {
    this.warningCallbacks.push(callback);
    return () => {
      const index = this.warningCallbacks.indexOf(callback);
      if (index > -1) {
        this.warningCallbacks.splice(index, 1);
      }
    };
  }
  
  /**
   * Get current resource metrics
   */
  public getMetrics(): ResourceMetrics & { limits: ResourceLimits } {
    return {
      ...this.metrics,
      limits: { ...this.limits }
    };
  }
  
  /**
   * Configure resource limits
   */
  public configure(newLimits: Partial<ResourceLimits>): void {
    this.limits = { ...this.limits, ...newLimits };
    console.log('🛡️ Resource limits configured:', this.limits);
  }
  
  /**
   * Export detailed report
   */
  public exportReport(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      limits: this.limits,
      trackedCounts: {
        timers: this.trackedTimers.size,
        intervals: this.trackedIntervals.size,
        observers: this.trackedObservers.size,
        webSockets: this.trackedWebSockets.size,
        eventListeners: this.trackedEventListeners.size
      }
    }, null, 2);
  }
}

// Initialize automatically
if (typeof window !== 'undefined') {
  const prevention = ResourceExhaustionPrevention.getInstance();
  
  // Auto-initialize in production or debug mode
  if (process.env.NODE_ENV === 'production' || localStorage.getItem('tactical-debug') === 'true') {
    prevention.initialize();
  }
  
  // Expose for debugging
  if (localStorage.getItem('tactical-debug') === 'true') {
    (window as any).tacticalResourcePrevention = prevention;
  }
}
