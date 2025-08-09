/**
 * Performance Optimization Utilities
 * Collection of React performance optimization helpers
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Debounced callback hook for performance optimization
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    [delay]
  );
}

/**
 * Throttled callback hook for performance optimization
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const callbackRef = useRef(callback);
  const lastCallRef = useRef<number>(0);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: any[]) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callbackRef.current(...args);
      }
    }) as T,
    [delay]
  );
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isIntersecting;
}

/**
 * Performance-aware component wrapper
 */
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  const MemoizedComponent = React.memo((props: P) => {
    useEffect(() => {
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        if (renderTime > 16.67) { // More than one frame at 60fps
          console.warn(`${componentName} took ${renderTime.toFixed(2)}ms to render`);
        }
      };
    });

    return React.createElement(WrappedComponent, props);
  });

  MemoizedComponent.displayName = `withPerformanceMonitoring(${componentName})`;
  return MemoizedComponent;
}

/**
 * Memory leak detection hook
 */
export function useMemoryLeakDetection(componentName: string) {
  useEffect(() => {
    const listeners: (() => void)[] = [];
    
    // Track event listeners for cleanup detection
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    const originalRemoveEventListener = EventTarget.prototype.removeEventListener;
    
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      listeners.push(() => this.removeEventListener(type, listener, options));
      return originalAddEventListener.call(this, type, listener, options);
    };
    
    return () => {
      // Restore original methods
      EventTarget.prototype.addEventListener = originalAddEventListener;
      EventTarget.prototype.removeEventListener = originalRemoveEventListener;
      
      // Check for uncleaned listeners
      if (listeners.length > 0) {
        console.warn(`${componentName} may have ${listeners.length} uncleaned event listeners`);
      }
    };
  }, [componentName]);
}
