// src/utils/ProductionPerformanceMonitor.ts
interface PerformanceMetrics {
  memoryUsage: number;
  memoryLimit: number;
  domNodes: number;
  eventListeners: number;
  networkRequests: number;
  web3Connections: number;
  errorCount: number;
  lastError?: string;
}

export class ProductionPerformanceMonitor {
  private static instance: ProductionPerformanceMonitor;
  private metrics: PerformanceMetrics = {
    memoryUsage: 0,
    memoryLimit: 0,
    domNodes: 0,
    eventListeners: 0,
    networkRequests: 0,
    web3Connections: 0,
    errorCount: 0
  };
  
  private callbacks: ((metrics: PerformanceMetrics) => void)[] = [];
  private monitoringInterval?: NodeJS.Timeout;
  private isMonitoring = false;
  
  // Performance budgets
  private readonly BUDGETS = {
    MAX_HEAP_SIZE: 100 * 1024 * 1024, // 100MB
    MAX_DOM_NODES: 1500,
    MAX_EVENT_LISTENERS: 100,
    MAX_WEB3_CONNECTIONS: 5,
    MAX_NETWORK_REQUESTS: 50
  };
  
  public static getInstance(): ProductionPerformanceMonitor {
    if (!ProductionPerformanceMonitor.instance) {
      ProductionPerformanceMonitor.instance = new ProductionPerformanceMonitor();
    }
    return ProductionPerformanceMonitor.instance;
  }
  
  public startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.updateMetrics();
      this.checkBudgets();
      this.notifyCallbacks();
    }, 5000); // Check every 5 seconds
    
    // Set up error monitoring
    this.setupErrorMonitoring();
    
    console.log('🛡️ Production monitoring started');
  }
  
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isMonitoring = false;
    console.log('🛡️ Production monitoring stopped');
  }
  
  public subscribe(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }
  
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
  
  public trackWeb3Connection(): void {
    this.metrics.web3Connections++;
  }
  
  public trackWeb3Disconnection(): void {
    this.metrics.web3Connections = Math.max(0, this.metrics.web3Connections - 1);
  }
  
  public trackNetworkRequest(): void {
    this.metrics.networkRequests++;
    
    // Auto-decay network request count
    setTimeout(() => {
      this.metrics.networkRequests = Math.max(0, this.metrics.networkRequests - 1);
    }, 60000); // Remove after 1 minute
  }
  
  private updateMetrics(): void {
    // Memory metrics
    if ('performance' in window && 'memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize;
      this.metrics.memoryLimit = memory.jsHeapSizeLimit;
    }
    
    // DOM metrics
    this.metrics.domNodes = document.querySelectorAll('*').length;
    
    // Event listener estimation (approximate)
    this.metrics.eventListeners = this.estimateEventListeners();
  }
  
  private estimateEventListeners(): number {
    // Rough estimation based on DOM nodes and common patterns
    const interactiveElements = document.querySelectorAll(
      'button, a, input, select, textarea, [onclick], [onchange]'
    ).length;
    
    return interactiveElements * 2; // Rough multiplier
  }
  
  private checkBudgets(): void {
    const warnings: string[] = [];
    
    if (this.metrics.memoryUsage > this.BUDGETS.MAX_HEAP_SIZE) {
      warnings.push(`Memory usage: ${(this.metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB (limit: ${this.BUDGETS.MAX_HEAP_SIZE / 1024 / 1024}MB)`);
    }
    
    if (this.metrics.domNodes > this.BUDGETS.MAX_DOM_NODES) {
      warnings.push(`DOM nodes: ${this.metrics.domNodes} (limit: ${this.BUDGETS.MAX_DOM_NODES})`);
    }
    
    if (this.metrics.eventListeners > this.BUDGETS.MAX_EVENT_LISTENERS) {
      warnings.push(`Event listeners: ${this.metrics.eventListeners} (limit: ${this.BUDGETS.MAX_EVENT_LISTENERS})`);
    }
    
    if (this.metrics.web3Connections > this.BUDGETS.MAX_WEB3_CONNECTIONS) {
      warnings.push(`Web3 connections: ${this.metrics.web3Connections} (limit: ${this.BUDGETS.MAX_WEB3_CONNECTIONS})`);
    }
    
    if (this.metrics.networkRequests > this.BUDGETS.MAX_NETWORK_REQUESTS) {
      warnings.push(`Network requests: ${this.metrics.networkRequests} (limit: ${this.BUDGETS.MAX_NETWORK_REQUESTS})`);
    }
    
    if (warnings.length > 0) {
      console.warn('🚨 Performance budget exceeded:', warnings);
      
      // Trigger garbage collection hint
      if (this.metrics.memoryUsage > this.BUDGETS.MAX_HEAP_SIZE) {
        this.suggestGarbageCollection();
      }
    }
  }
  
  private suggestGarbageCollection(): void {
    // Dispatch event that components can listen to for cleanup
    window.dispatchEvent(new CustomEvent('tactical-performance-warning', {
      detail: { type: 'memory', metrics: this.metrics }
    }));
  }
  
  private setupErrorMonitoring(): void {
    window.addEventListener('error', (event) => {
      this.metrics.errorCount++;
      this.metrics.lastError = event.message;
      console.error('🚨 Global error captured:', event.error);
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      this.metrics.errorCount++;
      this.metrics.lastError = event.reason?.toString() || 'Unhandled promise rejection';
      console.error('🚨 Unhandled promise rejection:', event.reason);
    });
  }
  
  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => {
      try {
        callback(this.metrics);
      } catch (error) {
        console.error('Error in performance monitor callback:', error);
      }
    });
  }
  
  // Debug utilities for production
  public exportReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      budgets: this.BUDGETS,
      userAgent: navigator.userAgent,
      url: window.location.href,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
    
    return JSON.stringify(report, null, 2);
  }
  
  public triggerManualCleanup(): void {
    console.log('🧹 Manual cleanup triggered');
    
    // Force garbage collection hints
    if ('gc' in window) {
      (window as any).gc();
    }
    
    // Clear caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
          console.log(`Cleared cache: ${name}`);
        });
      });
    }
    
    // Dispatch cleanup event
    window.dispatchEvent(new CustomEvent('tactical-manual-cleanup'));
  }
}

// Initialize monitoring in production
if (typeof window !== 'undefined') {
  const monitor = ProductionPerformanceMonitor.getInstance();
  
  // Auto-start monitoring in production or when debug flag is set
  if (process.env.NODE_ENV === 'production' || localStorage.getItem('tactical-debug') === 'true') {
    monitor.startMonitoring();
  }
  
  // Expose debug utilities
  if (localStorage.getItem('tactical-debug') === 'true') {
    (window as any).tacticalMonitor = monitor;
  }
}
