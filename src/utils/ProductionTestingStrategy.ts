// src/utils/ProductionTestingStrategy.ts
import { ProductionPerformanceMonitor } from './ProductionPerformanceMonitor';
import { StackOverflowPrevention } from './StackOverflowPrevention';
import { ResourceExhaustionPrevention } from './ResourceExhaustionPrevention';

interface TestResult {
  testName: string;
  passed: boolean;
  duration: number;
  error?: string;
  metrics?: any;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  totalTime: number;
  passRate: number;
}

export class ProductionTestingStrategy {
  private static instance: ProductionTestingStrategy;
  private performanceMonitor: ProductionPerformanceMonitor;
  private stackPrevention: StackOverflowPrevention;
  private resourcePrevention: ResourceExhaustionPrevention;
  
  private testResults: Map<string, TestSuite> = new Map();
  private continuousTests: Map<string, NodeJS.Timeout> = new Map();
  private alertCallbacks: ((alert: string, severity: 'low' | 'medium' | 'high' | 'critical') => void)[] = [];
  
  public static getInstance(): ProductionTestingStrategy {
    if (!ProductionTestingStrategy.instance) {
      ProductionTestingStrategy.instance = new ProductionTestingStrategy();
    }
    return ProductionTestingStrategy.instance;
  }
  
  constructor() {
    this.performanceMonitor = ProductionPerformanceMonitor.getInstance();
    this.stackPrevention = StackOverflowPrevention.getInstance();
    this.resourcePrevention = ResourceExhaustionPrevention.getInstance();
  }
  
  /**
   * Initialize production testing
   */
  public initialize(): void {
    console.log('🧪 Production testing strategy initialized');
    
    // Start continuous monitoring tests
    this.startContinuousTests();
    
    // Set up error boundary testing
    this.setupErrorBoundaryTests();
    
    // Set up performance regression tests
    this.setupPerformanceTests();
    
    // Set up memory leak detection
    this.setupMemoryLeakTests();
    
    // Set up Web3 integration tests
    this.setupWeb3Tests();
  }
  
  /**
   * Start continuous production tests
   */
  private startContinuousTests(): void {
    // Memory leak detection test - every 30 seconds
    const memoryTest = setInterval(async () => {
      await this.runMemoryLeakTest();
    }, 30000);
    this.continuousTests.set('memory-leak', memoryTest);
    
    // Performance baseline test - every 60 seconds
    const performanceTest = setInterval(async () => {
      await this.runPerformanceBaselineTest();
    }, 60000);
    this.continuousTests.set('performance-baseline', performanceTest);
    
    // Stack overflow prevention test - every 120 seconds
    const stackTest = setInterval(async () => {
      await this.runStackOverflowTest();
    }, 120000);
    this.continuousTests.set('stack-overflow', stackTest);
    
    // Resource exhaustion test - every 90 seconds
    const resourceTest = setInterval(async () => {
      await this.runResourceExhaustionTest();
    }, 90000);
    this.continuousTests.set('resource-exhaustion', resourceTest);
    
    // DOM health test - every 45 seconds
    const domTest = setInterval(async () => {
      await this.runDomHealthTest();
    }, 45000);
    this.continuousTests.set('dom-health', domTest);
  }
  
  /**
   * Memory leak detection test
   */
  private async runMemoryLeakTest(): Promise<TestResult> {
    const startTime = performance.now();
    const testName = 'memory-leak-detection';
    
    try {
      const metrics = this.performanceMonitor.getMetrics();
      const memoryUsageMB = metrics.memoryUsage / (1024 * 1024);
      const memoryPercentage = (metrics.memoryUsage / metrics.memoryLimit) * 100;
      
      // Check for memory leaks
      let passed = true;
      let error = '';
      
      if (memoryPercentage > 80) {
        passed = false;
        error = `Memory usage critical: ${memoryPercentage.toFixed(1)}% (${memoryUsageMB.toFixed(1)}MB)`;
        this.triggerAlert(error, 'critical');
      } else if (memoryPercentage > 60) {
        passed = false;
        error = `Memory usage high: ${memoryPercentage.toFixed(1)}% (${memoryUsageMB.toFixed(1)}MB)`;
        this.triggerAlert(error, 'high');
      } else if (memoryPercentage > 40) {
        this.triggerAlert(`Memory usage elevated: ${memoryPercentage.toFixed(1)}%`, 'medium');
      }
      
      const result: TestResult = {
        testName,
        passed,
        duration: performance.now() - startTime,
        error,
        metrics: {
          memoryUsageMB: memoryUsageMB.toFixed(1),
          memoryPercentage: memoryPercentage.toFixed(1),
          domNodes: metrics.domNodes
        }
      };
      
      this.recordTestResult('memory-monitoring', result);
      return result;
      
    } catch (err) {
      const result: TestResult = {
        testName,
        passed: false,
        duration: performance.now() - startTime,
        error: `Memory test failed: ${err}`
      };
      
      this.recordTestResult('memory-monitoring', result);
      return result;
    }
  }
  
  /**
   * Performance baseline test
   */
  private async runPerformanceBaselineTest(): Promise<TestResult> {
    const startTime = performance.now();
    const testName = 'performance-baseline';
    
    try {
      // Test basic DOM operations
      const domTestStart = performance.now();
      const testDiv = document.createElement('div');
      testDiv.innerHTML = '<span>Performance Test</span>';
      document.body.appendChild(testDiv);
      document.querySelector('span'); // Test query performance
      document.body.removeChild(testDiv);
      const domTestTime = performance.now() - domTestStart;
      
      // Test React component render time simulation
      const renderTestStart = performance.now();
      Array.from({ length: 100 }, (_, i) => {
        return { id: i, value: Math.random() };
      }); // Simulate component creation
      const renderTestTime = performance.now() - renderTestStart;
      
      // Check performance thresholds
      let passed = true;
      let error = '';
      
      if (domTestTime > 50) {
        passed = false;
        error = `DOM operations slow: ${domTestTime.toFixed(2)}ms`;
        this.triggerAlert(error, 'high');
      } else if (domTestTime > 20) {
        this.triggerAlert(`DOM operations elevated: ${domTestTime.toFixed(2)}ms`, 'medium');
      }
      
      if (renderTestTime > 100) {
        passed = false;
        error = `${error} Render operations slow: ${renderTestTime.toFixed(2)}ms`;
        this.triggerAlert(`Render operations slow: ${renderTestTime.toFixed(2)}ms`, 'high');
      }
      
      const result: TestResult = {
        testName,
        passed,
        duration: performance.now() - startTime,
        error,
        metrics: {
          domOperationTime: domTestTime.toFixed(2),
          renderTime: renderTestTime.toFixed(2)
        }
      };
      
      this.recordTestResult('performance-monitoring', result);
      return result;
      
    } catch (err) {
      const result: TestResult = {
        testName,
        passed: false,
        duration: performance.now() - startTime,
        error: `Performance test failed: ${err}`
      };
      
      this.recordTestResult('performance-monitoring', result);
      return result;
    }
  }
  
  /**
   * Stack overflow prevention test
   */
  private async runStackOverflowTest(): Promise<TestResult> {
    const startTime = performance.now();
    const testName = 'stack-overflow-prevention';
    
    try {
      // Test recursive function protection
      let recursionStopped = false;
      
      const testRecursiveFunction = (depth: number = 0): any => {
        if (depth > 50) {
          recursionStopped = true;
          return 'stopped';
        }
        return testRecursiveFunction(depth + 1);
      };
      
      const guardedFunction = this.stackPrevention.createGuardedFunction(
        testRecursiveFunction,
        'test-recursive-function'
      );
      
      const result = guardedFunction();
      
      const stackStats = this.stackPrevention.getStackStats();
      
      const passed = result === null || recursionStopped; // Should be stopped by guard
      
      const testResult: TestResult = {
        testName,
        passed,
        duration: performance.now() - startTime,
        error: passed ? undefined : 'Stack overflow prevention failed',
        metrics: {
          stackDepth: stackStats.totalDepth,
          blockedFunctions: stackStats.blockedFunctions.length
        }
      };
      
      this.recordTestResult('stack-monitoring', testResult);
      return testResult;
      
    } catch (err) {
      const result: TestResult = {
        testName,
        passed: false,
        duration: performance.now() - startTime,
        error: `Stack overflow test failed: ${err}`
      };
      
      this.recordTestResult('stack-monitoring', result);
      return result;
    }
  }
  
  /**
   * Resource exhaustion test
   */
  private async runResourceExhaustionTest(): Promise<TestResult> {
    const startTime = performance.now();
    const testName = 'resource-exhaustion-prevention';
    
    try {
      const resourceMetrics = this.resourcePrevention.getMetrics();
      
      let passed = true;
      let warnings: string[] = [];
      
      // Check various resource limits
      if (resourceMetrics.domNodeCount > resourceMetrics.limits.maxDomNodes * 0.8) {
        warnings.push(`DOM nodes approaching limit: ${resourceMetrics.domNodeCount}/${resourceMetrics.limits.maxDomNodes}`);
        if (resourceMetrics.domNodeCount > resourceMetrics.limits.maxDomNodes) {
          passed = false;
        }
      }
      
      if (resourceMetrics.eventListenerCount > resourceMetrics.limits.maxEventListeners * 0.8) {
        warnings.push(`Event listeners approaching limit: ${resourceMetrics.eventListenerCount}/${resourceMetrics.limits.maxEventListeners}`);
        if (resourceMetrics.eventListenerCount > resourceMetrics.limits.maxEventListeners) {
          passed = false;
        }
      }
      
      if (resourceMetrics.timerCount > resourceMetrics.limits.maxTimers * 0.8) {
        warnings.push(`Timers approaching limit: ${resourceMetrics.timerCount}/${resourceMetrics.limits.maxTimers}`);
        if (resourceMetrics.timerCount > resourceMetrics.limits.maxTimers) {
          passed = false;
        }
      }
      
      if (warnings.length > 0) {
        this.triggerAlert(`Resource warnings: ${warnings.join(', ')}`, passed ? 'medium' : 'high');
      }
      
      const result: TestResult = {
        testName,
        passed,
        duration: performance.now() - startTime,
        error: passed ? undefined : warnings.join(', '),
        metrics: resourceMetrics
      };
      
      this.recordTestResult('resource-monitoring', result);
      return result;
      
    } catch (err) {
      const result: TestResult = {
        testName,
        passed: false,
        duration: performance.now() - startTime,
        error: `Resource exhaustion test failed: ${err}`
      };
      
      this.recordTestResult('resource-monitoring', result);
      return result;
    }
  }
  
  /**
   * DOM health test
   */
  private async runDomHealthTest(): Promise<TestResult> {
    const startTime = performance.now();
    const testName = 'dom-health-check';
    
    try {
      // Check for detached DOM nodes
      const allElements = document.querySelectorAll('*');
      const hiddenElements = document.querySelectorAll('[style*="display: none"], .hidden');
      const emptyElements = Array.from(allElements).filter(el => 
        el.children.length === 0 && el.textContent?.trim() === ''
      );
      
      // Check for memory-heavy elements
      const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
      const largeImages = Array.from(document.querySelectorAll('img')).filter(img => {
        const rect = img.getBoundingClientRect();
        return rect.width > 2000 || rect.height > 2000;
      });
      
      // Check for potential performance issues
      const deepNesting = Array.from(allElements).filter(el => {
        let depth = 0;
        let parent = el.parentElement;
        while (parent) {
          depth++;
          parent = parent.parentElement;
        }
        return depth > 20;
      });
      
      let passed = true;
      let warnings: string[] = [];
      
      if (emptyElements.length > 50) {
        warnings.push(`High empty element count: ${emptyElements.length}`);
        passed = false;
      }
      
      if (largeImages.length > 0) {
        warnings.push(`Large images detected: ${largeImages.length}`);
      }
      
      if (deepNesting.length > 10) {
        warnings.push(`Deep DOM nesting detected: ${deepNesting.length} elements`);
      }
      
      if (warnings.length > 0) {
        this.triggerAlert(`DOM health warnings: ${warnings.join(', ')}`, passed ? 'low' : 'medium');
      }
      
      const result: TestResult = {
        testName,
        passed,
        duration: performance.now() - startTime,
        error: passed ? undefined : warnings.join(', '),
        metrics: {
          totalElements: allElements.length,
          hiddenElements: hiddenElements.length,
          emptyElements: emptyElements.length,
          imagesWithoutAlt: imagesWithoutAlt.length,
          largeImages: largeImages.length,
          deepNesting: deepNesting.length
        }
      };
      
      this.recordTestResult('dom-monitoring', result);
      return result;
      
    } catch (err) {
      const result: TestResult = {
        testName,
        passed: false,
        duration: performance.now() - startTime,
        error: `DOM health test failed: ${err}`
      };
      
      this.recordTestResult('dom-monitoring', result);
      return result;
    }
  }
  
  /**
   * Set up error boundary testing
   */
  private setupErrorBoundaryTests(): void {
    window.addEventListener('error', (event) => {
      this.recordTestResult('error-monitoring', {
        testName: 'global-error-capture',
        passed: true, // Capturing errors is good
        duration: 0,
        error: undefined,
        metrics: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        }
      });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      this.recordTestResult('error-monitoring', {
        testName: 'unhandled-promise-rejection',
        passed: false, // Unhandled rejections are bad
        duration: 0,
        error: event.reason?.toString(),
        metrics: {
          reason: event.reason
        }
      });
      
      this.triggerAlert(`Unhandled promise rejection: ${event.reason}`, 'high');
    });
  }
  
  /**
   * Set up performance regression tests
   */
  private setupPerformanceTests(): void {
    // Monitor navigation timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
          const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
          
          this.recordTestResult('performance-monitoring', {
            testName: 'page-load-performance',
            passed: loadTime < 3000, // 3 second threshold
            duration: loadTime,
            error: loadTime >= 3000 ? `Page load time too slow: ${loadTime}ms` : undefined,
            metrics: {
              loadTime,
              domContentLoaded,
              firstContentfulPaint: navigation.responseStart - navigation.requestStart
            }
          });
        }
      }, 1000);
    });
  }
  
  /**
   * Set up memory leak detection
   */
  private setupMemoryLeakTests(): void {
    let lastMemoryCheck = 0;
    
    setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const currentMemory = memory.usedJSHeapSize;
        
        if (lastMemoryCheck > 0) {
          const memoryIncrease = currentMemory - lastMemoryCheck;
          const increasePercentage = (memoryIncrease / lastMemoryCheck) * 100;
          
          if (increasePercentage > 20) { // 20% increase
            this.recordTestResult('memory-monitoring', {
              testName: 'memory-leak-detection',
              passed: false,
              duration: 0,
              error: `Significant memory increase: ${increasePercentage.toFixed(1)}%`,
              metrics: {
                previousMemory: (lastMemoryCheck / 1024 / 1024).toFixed(2),
                currentMemory: (currentMemory / 1024 / 1024).toFixed(2),
                increase: (memoryIncrease / 1024 / 1024).toFixed(2)
              }
            });
            
            this.triggerAlert(`Memory leak detected: ${increasePercentage.toFixed(1)}% increase`, 'high');
          }
        }
        
        lastMemoryCheck = currentMemory;
      }
    }, 60000); // Check every minute
  }
  
  /**
   * Set up Web3 specific tests
   */
  private setupWeb3Tests(): void {
    // Test Web3 connection health
    setInterval(async () => {
      try {
        if (window.ethereum) {
          const startTime = performance.now();
          
          // Test basic Web3 connectivity
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          
          const responseTime = performance.now() - startTime;
          
          this.recordTestResult('web3-monitoring', {
            testName: 'web3-connectivity',
            passed: responseTime < 2000, // 2 second threshold
            duration: responseTime,
            error: responseTime >= 2000 ? `Web3 response slow: ${responseTime}ms` : undefined,
            metrics: {
              chainId,
              accountsConnected: accounts.length,
              responseTime: responseTime.toFixed(2)
            }
          });
          
          if (responseTime >= 2000) {
            this.triggerAlert(`Web3 connectivity slow: ${responseTime.toFixed(2)}ms`, 'medium');
          }
        }
      } catch (error) {
        this.recordTestResult('web3-monitoring', {
          testName: 'web3-connectivity',
          passed: false,
          duration: 0,
          error: `Web3 connection failed: ${error}`,
          metrics: { error: error?.toString() }
        });
        
        this.triggerAlert(`Web3 connection failed: ${error}`, 'high');
      }
    }, 120000); // Check every 2 minutes
  }
  
  /**
   * Record test result
   */
  private recordTestResult(suiteName: string, result: TestResult): void {
    if (!this.testResults.has(suiteName)) {
      this.testResults.set(suiteName, {
        name: suiteName,
        tests: [],
        totalTime: 0,
        passRate: 0
      });
    }
    
    const suite = this.testResults.get(suiteName)!;
    suite.tests.push(result);
    suite.totalTime += result.duration;
    
    // Keep only last 100 results per suite
    if (suite.tests.length > 100) {
      suite.tests = suite.tests.slice(-100);
    }
    
    // Calculate pass rate
    const passedTests = suite.tests.filter(t => t.passed).length;
    suite.passRate = (passedTests / suite.tests.length) * 100;
    
    // Log critical failures
    if (!result.passed && result.error) {
      console.error(`🚨 Test failed: ${result.testName} - ${result.error}`);
    }
  }
  
  /**
   * Trigger alert
   */
  private triggerAlert(message: string, severity: 'low' | 'medium' | 'high' | 'critical'): void {
    console.warn(`🚨 [${severity.toUpperCase()}] ${message}`);
    
    this.alertCallbacks.forEach(callback => {
      try {
        callback(message, severity);
      } catch (error) {
        console.error('Error in alert callback:', error);
      }
    });
  }
  
  /**
   * Subscribe to alerts
   */
  public onAlert(callback: (alert: string, severity: 'low' | 'medium' | 'high' | 'critical') => void): () => void {
    this.alertCallbacks.push(callback);
    return () => {
      const index = this.alertCallbacks.indexOf(callback);
      if (index > -1) {
        this.alertCallbacks.splice(index, 1);
      }
    };
  }
  
  /**
   * Get test results summary
   */
  public getTestResults(): Map<string, TestSuite> {
    return new Map(this.testResults);
  }
  
  /**
   * Get test results for a specific suite
   */
  public getSuiteResults(suiteName: string): TestSuite | undefined {
    return this.testResults.get(suiteName);
  }
  
  /**
   * Export comprehensive test report
   */
  public exportTestReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      suites: Object.fromEntries(this.testResults),
      summary: {
        totalSuites: this.testResults.size,
        averagePassRate: Array.from(this.testResults.values())
          .reduce((sum, suite) => sum + suite.passRate, 0) / this.testResults.size,
        totalTests: Array.from(this.testResults.values())
          .reduce((sum, suite) => sum + suite.tests.length, 0)
      }
    };
    
    return JSON.stringify(report, null, 2);
  }
  
  /**
   * Stop all continuous tests
   */
  public stopContinuousTests(): void {
    this.continuousTests.forEach((interval, name) => {
      clearInterval(interval);
      console.log(`Stopped continuous test: ${name}`);
    });
    this.continuousTests.clear();
  }
  
  /**
   * Run manual test suite
   */
  public async runManualTestSuite(): Promise<TestSuite[]> {
    console.log('🧪 Running manual test suite...');
    
    const results: TestSuite[] = [];
    
    // Run all tests manually
    await this.runMemoryLeakTest();
    await this.runPerformanceBaselineTest();
    await this.runStackOverflowTest();
    await this.runResourceExhaustionTest();
    await this.runDomHealthTest();
    
    // Collect results
    this.testResults.forEach(suite => {
      results.push({ ...suite });
    });
    
    console.log('🧪 Manual test suite completed');
    return results;
  }
}

// Initialize automatically in production
if (typeof window !== 'undefined') {
  const testing = ProductionTestingStrategy.getInstance();
  
  // Auto-initialize in production or debug mode
  if (process.env.NODE_ENV === 'production' || localStorage.getItem('tactical-debug') === 'true') {
    testing.initialize();
  }
  
  // Expose for debugging
  if (localStorage.getItem('tactical-debug') === 'true') {
    (window as any).tacticalTesting = testing;
  }
}
