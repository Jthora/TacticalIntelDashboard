// src/utils/ProductionMonitoringSystem.ts
import { ProductionPerformanceMonitor } from './ProductionPerformanceMonitor';
import { ProductionTestingStrategy } from './ProductionTestingStrategy';
import { ResourceExhaustionPrevention } from './ResourceExhaustionPrevention';
import { StackOverflowPrevention } from './StackOverflowPrevention';

export interface MonitoringConfig {
  enablePerformanceMonitoring?: boolean;
  enableStackPrevention?: boolean;
  enableResourcePrevention?: boolean;
  enableTesting?: boolean;
  enableDebugDashboard?: boolean;
  alertThresholds?: {
    memoryUsagePercent?: number;
    domNodeCount?: number;
    errorCount?: number;
    stackDepth?: number;
  };
}

export interface SystemAlert {
  id: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'performance' | 'memory' | 'stack' | 'resources' | 'errors' | 'tests';
  message: string;
  details?: any;
  resolved?: boolean;
}

export class ProductionMonitoringSystem {
  private static instance: ProductionMonitoringSystem;
  private config: MonitoringConfig;
  private alerts: Map<string, SystemAlert> = new Map();
  private alertCallbacks: ((alert: SystemAlert) => void)[] = [];
  private statusCallbacks: ((status: any) => void)[] = [];
  
  private performanceMonitor: ProductionPerformanceMonitor;
  private stackPrevention: StackOverflowPrevention;
  private resourcePrevention: ResourceExhaustionPrevention;
  private testingStrategy: ProductionTestingStrategy;
  
  private monitoringInterval?: NodeJS.Timeout;
  private healthCheckInterval?: NodeJS.Timeout;
  private isMonitoring = false;
  
  public static getInstance(): ProductionMonitoringSystem {
    if (!ProductionMonitoringSystem.instance) {
      ProductionMonitoringSystem.instance = new ProductionMonitoringSystem();
    }
    return ProductionMonitoringSystem.instance;
  }
  
  constructor() {
    this.config = this.getDefaultConfig();
    this.performanceMonitor = ProductionPerformanceMonitor.getInstance();
    this.stackPrevention = StackOverflowPrevention.getInstance();
    this.resourcePrevention = ResourceExhaustionPrevention.getInstance();
    this.testingStrategy = ProductionTestingStrategy.getInstance();
  }
  
  /**
   * Initialize the complete monitoring system
   */
  public initialize(config?: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...config };
    
    console.log('🛡️ Initializing Tactical Production Monitoring System...');
    
    // Initialize individual monitoring components
    if (this.config.enablePerformanceMonitoring) {
      this.performanceMonitor.startMonitoring();
    }
    
    if (this.config.enableStackPrevention) {
      this.stackPrevention.configure({
        maxDepth: 150,
        maxCallsPerSecond: 2000
      });
    }
    
    if (this.config.enableResourcePrevention) {
      this.resourcePrevention.initialize();
    }
    
    if (this.config.enableTesting) {
      this.testingStrategy.initialize();
    }
    
    // Set up integrated monitoring
    this.setupIntegratedMonitoring();
    
    // Set up emergency handlers
    this.setupEmergencyHandlers();
    
    // Start health checks
    this.startHealthChecks();
    
    this.isMonitoring = true;
    console.log('✅ Production Monitoring System initialized successfully');
    
    this.triggerAlert({
      id: 'system-start',
      timestamp: Date.now(),
      severity: 'low',
      category: 'performance',
      message: 'Production monitoring system started',
      details: { config: this.config }
    });
  }
  
  /**
   * Get default configuration
   */
  private getDefaultConfig(): MonitoringConfig {
    const isProduction = process.env.NODE_ENV === 'production';
    const isDebugMode = typeof window !== 'undefined' && localStorage.getItem('tactical-debug') === 'true';
    
    return {
      enablePerformanceMonitoring: isProduction || isDebugMode,
      enableStackPrevention: true,
      enableResourcePrevention: isProduction || isDebugMode,
      enableTesting: isProduction || isDebugMode,
      enableDebugDashboard: isDebugMode,
      alertThresholds: {
        memoryUsagePercent: 70,
        domNodeCount: 1500,
        errorCount: 10,
        stackDepth: 100
      }
    };
  }
  
  /**
   * Set up integrated monitoring between all systems
   */
  private setupIntegratedMonitoring(): void {
    // Monitor performance metrics
    this.performanceMonitor.subscribe((metrics) => {
      this.checkPerformanceAlerts(metrics);
    });
    
    // Monitor resource warnings
    this.resourcePrevention.onWarning((resource, current, limit) => {
      this.triggerAlert({
        id: `resource-${resource}-${Date.now()}`,
        timestamp: Date.now(),
        severity: current > limit ? 'high' : 'medium',
        category: 'resources',
        message: `Resource warning: ${resource} at ${current}/${limit}`,
        details: { resource, current, limit }
      });
    });
    
    // Monitor test failures
    this.testingStrategy.onAlert((message, severity) => {
      this.triggerAlert({
        id: `test-${Date.now()}`,
        timestamp: Date.now(),
        severity,
        category: 'tests',
        message: `Test alert: ${message}`,
        details: { originalMessage: message }
      });
    });
    
    // Set up cross-system correlation
    this.monitoringInterval = setInterval(() => {
      this.performanceCorrelationCheck();
    }, 30000); // Every 30 seconds
  }
  
  /**
   * Check for performance-related alerts
   */
  private checkPerformanceAlerts(metrics: any): void {
    const memoryPercent = (metrics.memoryUsage / metrics.memoryLimit) * 100;
    const thresholds = this.config.alertThresholds!;
    
    // Memory usage alerts
    if (memoryPercent > thresholds.memoryUsagePercent!) {
      const severity = memoryPercent > 90 ? 'critical' : memoryPercent > 80 ? 'high' : 'medium';
      this.triggerAlert({
        id: `memory-usage-${Date.now()}`,
        timestamp: Date.now(),
        severity,
        category: 'memory',
        message: `Memory usage at ${memoryPercent.toFixed(1)}%`,
        details: { memoryPercent, usage: metrics.memoryUsage, limit: metrics.memoryLimit }
      });
    }
    
    // DOM node count alerts
    if (metrics.domNodes > thresholds.domNodeCount!) {
      this.triggerAlert({
        id: `dom-nodes-${Date.now()}`,
        timestamp: Date.now(),
        severity: metrics.domNodes > thresholds.domNodeCount! * 1.5 ? 'high' : 'medium',
        category: 'performance',
        message: `High DOM node count: ${metrics.domNodes}`,
        details: { domNodes: metrics.domNodes, threshold: thresholds.domNodeCount }
      });
    }
    
    // Error count alerts
    if (metrics.errorCount > thresholds.errorCount!) {
      this.triggerAlert({
        id: `error-count-${Date.now()}`,
        timestamp: Date.now(),
        severity: 'high',
        category: 'errors',
        message: `High error count: ${metrics.errorCount}`,
        details: { errorCount: metrics.errorCount, lastError: metrics.lastError }
      });
    }
  }
  
  /**
   * Perform cross-system performance correlation
   */
  private performanceCorrelationCheck(): void {
    const performanceMetrics = this.performanceMonitor.getMetrics();
    const resourceMetrics = this.resourcePrevention.getMetrics();
    const stackStats = this.stackPrevention.getStackStats();
    
    // Detect potential correlations
    const correlations = [];
    
    // High memory + high DOM nodes = possible memory leak
    const memoryPercent = (performanceMetrics.memoryUsage / performanceMetrics.memoryLimit) * 100;
    if (memoryPercent > 60 && performanceMetrics.domNodes > 1000) {
      correlations.push('Memory leak potential: High memory usage with high DOM node count');
    }
    
    // High stack depth + high timer count = possible infinite recursion with timers
    if (stackStats.totalDepth > 50 && resourceMetrics.timerCount > 30) {
      correlations.push('Recursion risk: High stack depth with many active timers');
    }
    
    // High error count + high Web3 connections = Web3 connection issues
    if (performanceMetrics.errorCount > 5 && performanceMetrics.web3Connections > 3) {
      correlations.push('Web3 instability: High errors with multiple Web3 connections');
    }
    
    // Report significant correlations
    correlations.forEach(correlation => {
      this.triggerAlert({
        id: `correlation-${Date.now()}`,
        timestamp: Date.now(),
        severity: 'medium',
        category: 'performance',
        message: `System correlation detected: ${correlation}`,
        details: { 
          correlation,
          metrics: {
            memory: memoryPercent,
            domNodes: performanceMetrics.domNodes,
            stackDepth: stackStats.totalDepth,
            timers: resourceMetrics.timerCount,
            errors: performanceMetrics.errorCount,
            web3Connections: performanceMetrics.web3Connections
          }
        }
      });
    });
  }
  
  /**
   * Set up emergency response handlers
   */
  private setupEmergencyHandlers(): void {
    // Critical memory usage emergency
    window.addEventListener('tactical-performance-warning', (event: any) => {
      if (event.detail.type === 'memory') {
        this.executeEmergencyCleanup('critical-memory');
      }
    });
    
    // Stack overflow emergency
    window.addEventListener('tactical-stack-overflow', () => {
      this.executeEmergencyCleanup('stack-overflow');
    });
    
    // Resource exhaustion emergency
    window.addEventListener('tactical-dom-cleanup', () => {
      this.executeEmergencyCleanup('dom-exhaustion');
    });
    
    // Global error emergency
    window.addEventListener('error', (event) => {
      if (event.error?.stack?.includes('Maximum call stack')) {
        this.executeEmergencyCleanup('critical-stack');
      }
    });
  }
  
  /**
   * Execute emergency cleanup procedures
   */
  private executeEmergencyCleanup(reason: string): void {
    console.warn(`🚨 Emergency cleanup triggered: ${reason}`);
    
    this.triggerAlert({
      id: `emergency-${reason}-${Date.now()}`,
      timestamp: Date.now(),
      severity: 'critical',
      category: 'performance',
      message: `Emergency cleanup executed: ${reason}`,
      details: { reason, timestamp: Date.now() }
    });
    
    // Execute cleanup in order of severity
    try {
      // 1. Force resource cleanup
      this.resourcePrevention.forceCleanup();
      
      // 2. Trigger performance monitor cleanup
      this.performanceMonitor.triggerManualCleanup();
      
      // 3. Clear browser caches if available
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
      
      // 4. Force garbage collection if available
      if ('gc' in window) {
        (window as any).gc();
      }
      
      // 5. Dispatch cleanup event for components
      window.dispatchEvent(new CustomEvent('tactical-emergency-cleanup', {
        detail: { reason, timestamp: Date.now() }
      }));
      
      console.log(`✅ Emergency cleanup completed for: ${reason}`);
      
    } catch (error) {
      console.error(`❌ Emergency cleanup failed for ${reason}:`, error);
      
      this.triggerAlert({
        id: `emergency-failed-${Date.now()}`,
        timestamp: Date.now(),
        severity: 'critical',
        category: 'errors',
        message: `Emergency cleanup failed: ${error}`,
        details: { reason, error: error?.toString() }
      });
    }
  }
  
  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 60000); // Every minute
  }
  
  /**
   * Perform comprehensive health check
   */
  private performHealthCheck(): void {
    const healthReport = {
      timestamp: Date.now(),
      status: 'healthy' as 'healthy' | 'warning' | 'critical',
      checks: {
        memory: this.checkMemoryHealth(),
        performance: this.checkPerformanceHealth(),
        resources: this.checkResourceHealth(),
        stack: this.checkStackHealth(),
        errors: this.checkErrorHealth()
      }
    };
    
    // Determine overall status
    const checkStatuses = Object.values(healthReport.checks);
    if (checkStatuses.some(status => status === 'critical')) {
      healthReport.status = 'critical';
    } else if (checkStatuses.some(status => status === 'warning')) {
      healthReport.status = 'warning';
    }
    
    // Notify status callbacks
    this.statusCallbacks.forEach(callback => {
      try {
        callback(healthReport);
      } catch (error) {
        console.error('Error in status callback:', error);
      }
    });
    
    // Log health status
    if (healthReport.status !== 'healthy') {
      console.warn(`🏥 Health check: ${healthReport.status}`, healthReport.checks);
    }
  }
  
  private checkMemoryHealth(): 'healthy' | 'warning' | 'critical' {
    const metrics = this.performanceMonitor.getMetrics();
    const memoryPercent = (metrics.memoryUsage / metrics.memoryLimit) * 100;
    
    if (memoryPercent > 90) return 'critical';
    if (memoryPercent > 70) return 'warning';
    return 'healthy';
  }
  
  private checkPerformanceHealth(): 'healthy' | 'warning' | 'critical' {
    const metrics = this.performanceMonitor.getMetrics();
    
    if (metrics.domNodes > 2000 || metrics.networkRequests > 50) return 'critical';
    if (metrics.domNodes > 1500 || metrics.networkRequests > 30) return 'warning';
    return 'healthy';
  }
  
  private checkResourceHealth(): 'healthy' | 'warning' | 'critical' {
    const metrics = this.resourcePrevention.getMetrics();
    
    const criticalResources = Object.entries(metrics.limits).filter(([key, limit]) => {
      const metricKey = key.replace('max', '').toLowerCase() + 'Count' as keyof typeof metrics;
      const current = metrics[metricKey] as number;
      return current > limit;
    });
    
    if (criticalResources.length > 2) return 'critical';
    if (criticalResources.length > 0) return 'warning';
    return 'healthy';
  }
  
  private checkStackHealth(): 'healthy' | 'warning' | 'critical' {
    const stats = this.stackPrevention.getStackStats();
    
    if (stats.totalDepth > 100 || stats.blockedFunctions.length > 3) return 'critical';
    if (stats.totalDepth > 50 || stats.blockedFunctions.length > 0) return 'warning';
    return 'healthy';
  }
  
  private checkErrorHealth(): 'healthy' | 'warning' | 'critical' {
    const metrics = this.performanceMonitor.getMetrics();
    
    if (metrics.errorCount > 20) return 'critical';
    if (metrics.errorCount > 10) return 'warning';
    return 'healthy';
  }
  
  /**
   * Trigger a system alert
   */
  private triggerAlert(alert: SystemAlert): void {
    this.alerts.set(alert.id, alert);
    
    // Keep only last 100 alerts
    if (this.alerts.size > 100) {
      const oldestKey = this.alerts.keys().next().value;
      if (oldestKey) {
        this.alerts.delete(oldestKey);
      }
    }
    
    // Notify alert callbacks
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error in alert callback:', error);
      }
    });
    
    // Log critical alerts
    if (alert.severity === 'critical') {
      console.error(`🚨 CRITICAL ALERT: ${alert.message}`, alert.details);
    }
  }
  
  /**
   * Subscribe to alerts
   */
  public onAlert(callback: (alert: SystemAlert) => void): () => void {
    this.alertCallbacks.push(callback);
    return () => {
      const index = this.alertCallbacks.indexOf(callback);
      if (index > -1) {
        this.alertCallbacks.splice(index, 1);
      }
    };
  }
  
  /**
   * Subscribe to status updates
   */
  public onStatus(callback: (status: any) => void): () => void {
    this.statusCallbacks.push(callback);
    return () => {
      const index = this.statusCallbacks.indexOf(callback);
      if (index > -1) {
        this.statusCallbacks.splice(index, 1);
      }
    };
  }
  
  /**
   * Get system status summary
   */
  public getSystemStatus(): any {
    return {
      isMonitoring: this.isMonitoring,
      config: this.config,
      alerts: Array.from(this.alerts.values()).slice(-20),
      performance: this.performanceMonitor.getMetrics(),
      resources: this.resourcePrevention.getMetrics(),
      stack: this.stackPrevention.getStackStats(),
      tests: Array.from(this.testingStrategy.getTestResults().entries())
    };
  }
  
  /**
   * Shutdown monitoring system
   */
  public shutdown(): void {
    console.log('🛡️ Shutting down production monitoring system...');
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    this.performanceMonitor.stopMonitoring();
    this.testingStrategy.stopContinuousTests();
    
    this.isMonitoring = false;
    
    this.triggerAlert({
      id: 'system-shutdown',
      timestamp: Date.now(),
      severity: 'low',
      category: 'performance',
      message: 'Production monitoring system shutdown'
    });
    
    console.log('✅ Production monitoring system shutdown complete');
  }
  
  /**
   * Export comprehensive system report
   */
  public exportSystemReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      system: {
        status: this.getSystemStatus(),
        config: this.config,
        uptime: this.isMonitoring ? 'Active' : 'Inactive'
      },
      performance: this.performanceMonitor.exportReport(),
      resources: this.resourcePrevention.exportReport(),
      tests: this.testingStrategy.exportTestReport(),
      alerts: Array.from(this.alerts.values()),
      health: {
        memory: this.checkMemoryHealth(),
        performance: this.checkPerformanceHealth(),
        resources: this.checkResourceHealth(),
        stack: this.checkStackHealth(),
        errors: this.checkErrorHealth()
      }
    };
    
    return JSON.stringify(report, null, 2);
  }
}

// Auto-initialize in appropriate environments
if (typeof window !== 'undefined') {
  const monitoring = ProductionMonitoringSystem.getInstance();
  
  // Initialize automatically in production or debug mode
  if (process.env.NODE_ENV === 'production' || localStorage.getItem('tactical-debug') === 'true') {
    // Delay initialization to allow other systems to load
    setTimeout(() => {
      monitoring.initialize();
    }, 1000);
  }
  
  // Expose for debugging
  if (localStorage.getItem('tactical-debug') === 'true') {
    (window as any).tacticalMonitoring = monitoring;
  }
  
  // Set up cleanup on page unload
  window.addEventListener('beforeunload', () => {
    monitoring.shutdown();
  });
}
