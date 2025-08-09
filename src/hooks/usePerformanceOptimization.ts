import { useCallback, useEffect, useMemo,useRef } from 'react';

import PerformanceManager from '../services/PerformanceManager';
import { log } from '../utils/LoggerService';

/**
 * Optimized timer hook that uses PerformanceManager for intelligent intervals
 */
export const useOptimizedTimer = (
  callback: () => void,
  intervalType: 'feeds' | 'health' | 'alerts',
  id: string,
  dependencies: any[] = []
) => {
  const callbackRef = useRef(callback);
  const pmInstance = PerformanceManager;
  
  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  });

  const memoizedCallback = useCallback(() => {
    callbackRef.current();
  }, dependencies);

  useEffect(() => {
    const interval = pmInstance.getRefreshInterval(intervalType);
    pmInstance.createTimer(id, memoizedCallback, interval);

    return () => {
      pmInstance.clearTimer(id);
    };
  }, [id, intervalType, memoizedCallback]);

  // Listen for low power mode changes
  useEffect(() => {
    const handleLowPowerMode = (event: CustomEvent) => {
      if (event.detail.enabled) {
        // Timer intervals are automatically adjusted by PerformanceManager
        log.debug("Component", `Timer ${id} adjusted for low power mode`);
      }
    };

    window.addEventListener('performance:lowPowerMode', handleLowPowerMode as EventListener);
    return () => {
      window.removeEventListener('performance:lowPowerMode', handleLowPowerMode as EventListener);
    };
  }, [id]);
};

/**
 * Optimized debounced search hook
 */
export const useOptimizedSearch = (
  searchFunction: (query: string) => void,
  dependencies: any[] = []
) => {
  const pmInstance = PerformanceManager;
  const searchDelay = pmInstance.getThrottleDelay('searchDelay');
  
  const debouncedSearch = useMemo(
    () => pmInstance.debounce(searchFunction, searchDelay),
    [searchFunction, searchDelay, ...dependencies]
  );

  return debouncedSearch;
};

/**
 * Optimized scroll handler hook
 */
export const useOptimizedScroll = (
  scrollHandler: (event: Event) => void,
  dependencies: any[] = []
) => {
  const pmInstance = PerformanceManager;
  const scrollThrottle = pmInstance.getThrottleDelay('scrollThrottle');
  
  const throttledScroll = useMemo(
    () => pmInstance.throttle(scrollHandler, scrollThrottle),
    [scrollHandler, scrollThrottle, ...dependencies]
  );

  useEffect(() => {
    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [throttledScroll]);
};

/**
 * Optimized resize handler hook
 */
export const useOptimizedResize = (
  resizeHandler: (event: Event) => void,
  dependencies: any[] = []
) => {
  const pmInstance = PerformanceManager;
  const resizeThrottle = pmInstance.getThrottleDelay('resizeThrottle');
  
  const throttledResize = useMemo(
    () => pmInstance.throttle(resizeHandler, resizeThrottle),
    [resizeHandler, resizeThrottle, ...dependencies]
  );

  useEffect(() => {
    window.addEventListener('resize', throttledResize);
    return () => window.removeEventListener('resize', throttledResize);
  }, [throttledResize]);
};

/**
 * Optimized data fetching hook with caching
 */
export const useOptimizedFetch = <T>(
  key: string,
  fetchFunction: () => Promise<T>,
  dependencies: any[] = []
) => {
  const pmInstance = PerformanceManager;
  
  const fetchData = useCallback(async (): Promise<T> => {
    // Check cache first
    if (pmInstance.isCachingEnabled()) {
      const cached = pmInstance.getCache(key);
      if (cached) {
        return cached;
      }
    }

    // Fetch new data
    const data = await fetchFunction();
    
    // Cache the result
    if (pmInstance.isCachingEnabled()) {
      pmInstance.setCache(key, data);
    }
    
    return data;
  }, [key, fetchFunction, ...dependencies]);

  return fetchData;
};

/**
 * Performance monitoring hook
 */
export const usePerformanceMonitor = () => {
  const pmInstance = PerformanceManager;
  
  const getMetrics = useCallback(() => {
    return pmInstance.getMetrics();
  }, []);

  const enableLowPowerMode = useCallback(() => {
    pmInstance.enableLowPowerMode();
  }, []);

  const disableLowPowerMode = useCallback(() => {
    pmInstance.disableLowPowerMode();
  }, []);

  const isLowPowerMode = useMemo(() => {
    return pmInstance.isLowPower();
  }, []);

  return {
    getMetrics,
    enableLowPowerMode,
    disableLowPowerMode,
    isLowPowerMode
  };
};
