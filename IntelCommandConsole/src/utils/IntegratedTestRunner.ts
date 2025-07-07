/**
 * Integrated Testing Utilities
 * Provides utilities for testing interconnected components
 */

import { eventBus, EventTypes } from '../services/EventBusService';
import { configService } from '../services/ConfigurationService';
import { log } from '../utils/LoggerService';

export interface TestContext {
  eventBus: typeof eventBus;
  config: typeof configService;
  cleanup: () => void;
}

export interface ComponentTestResult {
  component: string;
  status: 'pass' | 'fail' | 'warning';
  details: string;
  duration: number;
  timestamp: Date;
}

export class IntegratedTestRunner {
  private static instance: IntegratedTestRunner;
  private testResults: ComponentTestResult[] = [];
  private cleanupFunctions: (() => void)[] = [];

  private constructor() {}

  static getInstance(): IntegratedTestRunner {
    if (!this.instance) {
      this.instance = new IntegratedTestRunner();
    }
    return this.instance;
  }

  /**
   * Create a test context with isolated services
   */
  createTestContext(): TestContext {
    const cleanup = () => {
      this.cleanupFunctions.forEach(fn => fn());
      this.cleanupFunctions = [];
    };

    return {
      eventBus,
      config: configService,
      cleanup
    };
  }

  /**
   * Test component interconnections
   */
  async testComponentInterconnections(): Promise<ComponentTestResult[]> {
    const results: ComponentTestResult[] = [];

    // Test Filter-Feed Integration
    results.push(await this.testFilterFeedIntegration());

    // Test Health-System Integration
    results.push(await this.testHealthSystemIntegration());

    // Test Export-Data Integration
    results.push(await this.testExportDataIntegration());

    // Test Event Bus Integration
    results.push(await this.testEventBusIntegration());

    // Test Configuration Integration
    results.push(await this.testConfigurationIntegration());

    this.testResults = results;
    return results;
  }

  private async testFilterFeedIntegration(): Promise<ComponentTestResult> {
    const startTime = Date.now();
    
    try {
      // Test filter event emission and handling
      let eventReceived = false;
      
      const unsubscribe = eventBus.on(EventTypes.FILTER_APPLIED, () => {
        eventReceived = true;
      });

      eventBus.emit(EventTypes.FILTER_APPLIED, { filter: 'test' });
      
      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      unsubscribe();
      
      if (!eventReceived) {
        throw new Error('Filter event not received');
      }

      return {
        component: 'Filter-Feed Integration',
        status: 'pass',
        details: 'Filter events properly integrated with feed system',
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        component: 'Filter-Feed Integration',
        status: 'fail',
        details: `Integration test failed: ${error}`,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    }
  }

  private async testHealthSystemIntegration(): Promise<ComponentTestResult> {
    const startTime = Date.now();
    
    try {
      // Test health status change propagation
      let statusChangeReceived = false;
      
      const unsubscribe = eventBus.on(EventTypes.HEALTH_STATUS_CHANGED, () => {
        statusChangeReceived = true;
      });

      eventBus.emit(EventTypes.HEALTH_STATUS_CHANGED, { 
        status: 'healthy', 
        metrics: { cpu: 50, memory: 60 }
      });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      unsubscribe();
      
      if (!statusChangeReceived) {
        throw new Error('Health status change not received');
      }

      return {
        component: 'Health-System Integration',
        status: 'pass',
        details: 'Health status changes properly propagated',
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        component: 'Health-System Integration',
        status: 'fail',
        details: `Integration test failed: ${error}`,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    }
  }

  private async testExportDataIntegration(): Promise<ComponentTestResult> {
    const startTime = Date.now();
    
    try {
      // Test export event flow
      let exportStarted = false;
      let exportCompleted = false;
      
      const unsubscribeStart = eventBus.on(EventTypes.EXPORT_STARTED, () => {
        exportStarted = true;
      });

      const unsubscribeComplete = eventBus.on(EventTypes.EXPORT_COMPLETED, () => {
        exportCompleted = true;
      });

      eventBus.emit(EventTypes.EXPORT_STARTED, { format: 'json' });
      await new Promise(resolve => setTimeout(resolve, 50));
      
      eventBus.emit(EventTypes.EXPORT_COMPLETED, { 
        format: 'json', 
        filename: 'test.json',
        size: 1024 
      });
      await new Promise(resolve => setTimeout(resolve, 50));
      
      unsubscribeStart();
      unsubscribeComplete();
      
      if (!exportStarted || !exportCompleted) {
        throw new Error('Export event flow incomplete');
      }

      return {
        component: 'Export-Data Integration',
        status: 'pass',
        details: 'Export events properly integrated with data flow',
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        component: 'Export-Data Integration',
        status: 'fail',
        details: `Integration test failed: ${error}`,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    }
  }

  private async testEventBusIntegration(): Promise<ComponentTestResult> {
    const startTime = Date.now();
    
    try {
      // Test event bus functionality
      const testEvents = [
        EventTypes.FEED_UPDATED,
        EventTypes.SYSTEM_SETTINGS_CHANGED,
        EventTypes.THEME_CHANGED
      ];
      
      const receivedEvents: string[] = [];
      const unsubscribes: (() => void)[] = [];
      
      testEvents.forEach(eventType => {
        const unsubscribe = eventBus.on(eventType, (message) => {
          receivedEvents.push(message.type);
        });
        unsubscribes.push(unsubscribe);
      });
      
      // Emit test events
      testEvents.forEach(eventType => {
        eventBus.emit(eventType, { test: true });
      });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Cleanup
      unsubscribes.forEach(unsubscribe => unsubscribe());
      
      if (receivedEvents.length !== testEvents.length) {
        throw new Error(`Expected ${testEvents.length} events, received ${receivedEvents.length}`);
      }

      return {
        component: 'Event Bus Integration',
        status: 'pass',
        details: `Successfully processed ${receivedEvents.length} events`,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        component: 'Event Bus Integration',
        status: 'fail',
        details: `Integration test failed: ${error}`,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    }
  }

  private async testConfigurationIntegration(): Promise<ComponentTestResult> {
    const startTime = Date.now();
    
    try {
      // Test configuration change propagation
      let configChangeReceived = false;
      
      const unsubscribe = configService.onConfigChange(() => {
        configChangeReceived = true;
      });
      
      // Make a test configuration change
      const originalTheme = configService.getSection('ui').theme;
      const newTheme = originalTheme === 'tactical' ? 'console' : 'tactical';
      
      configService.updateSection('ui', { theme: newTheme });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Restore original theme
      configService.updateSection('ui', { theme: originalTheme });
      
      unsubscribe();
      
      if (!configChangeReceived) {
        throw new Error('Configuration change not received');
      }

      return {
        component: 'Configuration Integration',
        status: 'pass',
        details: 'Configuration changes properly propagated',
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        component: 'Configuration Integration',
        status: 'fail',
        details: `Integration test failed: ${error}`,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    }
  }

  /**
   * Get test results
   */
  getTestResults(): ComponentTestResult[] {
    return [...this.testResults];
  }

  /**
   * Generate test report
   */
  generateTestReport(): string {
    const results = this.getTestResults();
    const passed = results.filter(r => r.status === 'pass').length;
    const failed = results.filter(r => r.status === 'fail').length;
    const warnings = results.filter(r => r.status === 'warning').length;
    
    let report = `\n=== Integrated Component Test Report ===\n`;
    report += `Total Tests: ${results.length}\n`;
    report += `Passed: ${passed}\n`;
    report += `Failed: ${failed}\n`;
    report += `Warnings: ${warnings}\n`;
    report += `Success Rate: ${((passed / results.length) * 100).toFixed(1)}%\n\n`;
    
    results.forEach(result => {
      const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
      report += `${icon} ${result.component} (${result.duration}ms)\n`;
      report += `   ${result.details}\n\n`;
    });
    
    return report;
  }

  /**
   * Clean up all test resources
   */
  cleanup(): void {
    this.cleanupFunctions.forEach(fn => fn());
    this.cleanupFunctions = [];
    this.testResults = [];
    eventBus.clearHistory();
    log.info('IntegratedTestRunner', 'Test cleanup completed');
  }
}

// Export singleton instance
export const integratedTestRunner = IntegratedTestRunner.getInstance();
export default IntegratedTestRunner;
