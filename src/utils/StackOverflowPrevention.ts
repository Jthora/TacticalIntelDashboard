// src/utils/StackOverflowPrevention.ts
interface CallStackEntry {
  functionName: string;
  timestamp: number;
  depth: number;
}

export class StackOverflowPrevention {
  private static instance: StackOverflowPrevention;
  private callStack: CallStackEntry[] = [];
  private maxDepth = 100;
  private maxRecursiveCallsPerSecond = 1000;
  private functionCallCounts: Map<string, number> = new Map();
  private lastResetTime = Date.now();
  private blockedFunctions: Set<string> = new Set();
  
  public static getInstance(): StackOverflowPrevention {
    if (!StackOverflowPrevention.instance) {
      StackOverflowPrevention.instance = new StackOverflowPrevention();
    }
    return StackOverflowPrevention.instance;
  }
  
  /**
   * Guards a function against stack overflow by monitoring recursion depth
   */
  public guardRecursion<T>(fn: () => T, functionName: string): T | null {
    // Check if function is temporarily blocked due to previous overflow
    if (this.blockedFunctions.has(functionName)) {
      console.warn(`🚨 Function ${functionName} is temporarily blocked due to previous stack overflow`);
      return null;
    }
    
    // Reset counters every second
    const now = Date.now();
    if (now - this.lastResetTime > 1000) {
      this.functionCallCounts.clear();
      this.lastResetTime = now;
    }
    
    // Track function call frequency
    const currentCount = this.functionCallCounts.get(functionName) || 0;
    if (currentCount >= this.maxRecursiveCallsPerSecond) {
      console.error(`🚨 Function ${functionName} exceeded call limit: ${currentCount}/s`);
      this.blockFunction(functionName);
      return null;
    }
    
    this.functionCallCounts.set(functionName, currentCount + 1);
    
    // Check current recursion depth
    const currentDepth = this.getCurrentDepth(functionName);
    if (currentDepth >= this.maxDepth) {
      console.error(`🚨 Stack overflow prevented in ${functionName}`, {
        depth: currentDepth,
        limit: this.maxDepth,
        callStack: this.getCallStackSummary()
      });
      
      this.blockFunction(functionName);
      this.triggerStackCleanup();
      return null;
    }
    
    // Enter function
    const entry: CallStackEntry = {
      functionName,
      timestamp: now,
      depth: currentDepth + 1
    };
    
    this.callStack.push(entry);
    
    try {
      const result = fn();
      return result;
    } catch (error) {
      console.error(`Error in guarded function ${functionName}:`, error);
      throw error;
    } finally {
      // Exit function
      this.callStack.pop();
    }
  }
  
  /**
   * Wraps async functions with stack overflow protection
   */
  public async guardAsyncRecursion<T>(
    fn: () => Promise<T>, 
    functionName: string
  ): Promise<T | null> {
    if (this.blockedFunctions.has(functionName)) {
      console.warn(`🚨 Async function ${functionName} is temporarily blocked`);
      return null;
    }
    
    const currentDepth = this.getCurrentDepth(functionName);
    if (currentDepth >= this.maxDepth) {
      console.error(`🚨 Async stack overflow prevented in ${functionName}`);
      this.blockFunction(functionName);
      return null;
    }
    
    const entry: CallStackEntry = {
      functionName,
      timestamp: Date.now(),
      depth: currentDepth + 1
    };
    
    this.callStack.push(entry);
    
    try {
      const result = await fn();
      return result;
    } catch (error) {
      console.error(`Error in guarded async function ${functionName}:`, error);
      throw error;
    } finally {
      this.callStack.pop();
    }
  }
  
  /**
   * Creates a higher-order function that automatically guards against stack overflow
   */
  public createGuardedFunction<T extends (...args: any[]) => any>(
    fn: T,
    functionName?: string
  ): T {
    const name = functionName || fn.name || 'anonymous';
    
    return ((...args: any[]) => {
      return this.guardRecursion(() => fn(...args), name);
    }) as T;
  }
  
  /**
   * Creates a guarded async function
   */
  public createGuardedAsyncFunction<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    functionName?: string
  ): T {
    const name = functionName || fn.name || 'anonymous';
    
    return ((...args: any[]) => {
      return this.guardAsyncRecursion(() => fn(...args), name);
    }) as T;
  }
  
  private getCurrentDepth(functionName: string): number {
    return this.callStack.filter(entry => entry.functionName === functionName).length;
  }
  
  private getCallStackSummary(): string[] {
    const summary = this.callStack.slice(-10).map(entry => 
      `${entry.functionName} (depth: ${entry.depth})`
    );
    
    if (this.callStack.length > 10) {
      summary.unshift(`... ${this.callStack.length - 10} more calls`);
    }
    
    return summary;
  }
  
  private blockFunction(functionName: string): void {
    this.blockedFunctions.add(functionName);
    
    // Auto-unblock after 5 seconds
    setTimeout(() => {
      this.blockedFunctions.delete(functionName);
      console.log(`✅ Function ${functionName} unblocked`);
    }, 5000);
  }
  
  private triggerStackCleanup(): void {
    // Clear call stack
    this.callStack = [];
    
    // Notify components to clean up
    window.dispatchEvent(new CustomEvent('tactical-stack-overflow', {
      detail: { 
        type: 'stack-cleanup',
        timestamp: Date.now()
      }
    }));
    
    // Force garbage collection hint
    if ('gc' in window) {
      (window as any).gc();
    }
  }
  
  /**
   * Get current stack statistics
   */
  public getStackStats() {
    const functionCounts = new Map<string, number>();
    
    this.callStack.forEach(entry => {
      const count = functionCounts.get(entry.functionName) || 0;
      functionCounts.set(entry.functionName, count + 1);
    });
    
    return {
      totalDepth: this.callStack.length,
      maxDepth: this.maxDepth,
      functionCounts: Object.fromEntries(functionCounts),
      blockedFunctions: Array.from(this.blockedFunctions),
      recentCalls: this.getCallStackSummary()
    };
  }
  
  /**
   * Configure stack overflow prevention settings
   */
  public configure(options: {
    maxDepth?: number;
    maxCallsPerSecond?: number;
  }): void {
    if (options.maxDepth !== undefined) {
      this.maxDepth = Math.max(10, Math.min(1000, options.maxDepth));
    }
    
    if (options.maxCallsPerSecond !== undefined) {
      this.maxRecursiveCallsPerSecond = Math.max(10, Math.min(10000, options.maxCallsPerSecond));
    }
    
    console.log('🛡️ Stack overflow prevention configured:', {
      maxDepth: this.maxDepth,
      maxCallsPerSecond: this.maxRecursiveCallsPerSecond
    });
  }
}

// Export decorator for easy use
export function guardStackOverflow(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;
  const guard = StackOverflowPrevention.getInstance();
  
  descriptor.value = function(...args: any[]) {
    const functionName = `${target.constructor.name}.${propertyName}`;
    return guard.guardRecursion(() => method.apply(this, args), functionName);
  };
  
  return descriptor;
}

// Export async decorator
export function guardAsyncStackOverflow(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;
  const guard = StackOverflowPrevention.getInstance();
  
  descriptor.value = async function(...args: any[]) {
    const functionName = `${target.constructor.name}.${propertyName}`;
    return await guard.guardAsyncRecursion(() => method.apply(this, args), functionName);
  };
  
  return descriptor;
}
