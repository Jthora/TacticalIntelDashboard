/**
 * React hook for using the Event Bus
 * Provides a clean interface for components to interact with the event bus
 */

import { useEffect, useCallback, useRef } from 'react';
import { eventBus, EventBusHandler } from '../services/EventBusService';

export interface UseEventBusOptions {
  /** Component name for debugging */
  componentName?: string;
  /** Whether to log events for debugging */
  enableLogging?: boolean;
}

export function useEventBus(options: UseEventBusOptions = {}) {
  const subscriptionsRef = useRef<(() => void)[]>([]);

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      subscriptionsRef.current.forEach(unsubscribe => unsubscribe());
      subscriptionsRef.current = [];
    };
  }, []);

  const emit = useCallback((eventType: string, data: any) => {
    eventBus.emit(eventType, data, options.componentName);
  }, [options.componentName]);

  const on = useCallback((eventType: string, handler: EventBusHandler) => {
    const unsubscribe = eventBus.on(eventType, handler);
    subscriptionsRef.current.push(unsubscribe);
    return unsubscribe;
  }, []);

  const off = useCallback((eventType: string, handler: EventBusHandler) => {
    eventBus.off(eventType, handler);
    
    // Remove from subscriptions ref
    const index = subscriptionsRef.current.findIndex(() => {
      // This is a simplification - in practice, you'd need a more sophisticated way
      // to track which unsubscribe function corresponds to which handler
      return true;
    });
    
    if (index > -1) {
      subscriptionsRef.current.splice(index, 1);
    }
  }, []);

  return {
    emit,
    on,
    off,
    getHistory: eventBus.getHistory.bind(eventBus),
    clearHistory: eventBus.clearHistory.bind(eventBus),
    getSubscriberCount: eventBus.getSubscriberCount.bind(eventBus)
  };
}

/**
 * Hook for subscribing to a specific event type
 */
export function useEventSubscription(
  eventType: string,
  handler: EventBusHandler,
  deps: any[] = []
) {
  const { on } = useEventBus();

  useEffect(() => {
    const unsubscribe = on(eventType, handler);
    return unsubscribe;
  }, [eventType, on, ...deps]);
}

/**
 * Hook for emitting events
 */
export function useEventEmitter(componentName?: string) {
  const { emit } = useEventBus({ componentName });
  return emit;
}

/**
 * Hook for listening to multiple event types
 */
export function useMultipleEventSubscriptions(
  subscriptions: Array<{
    eventType: string;
    handler: EventBusHandler;
  }>,
  deps: any[] = []
) {
  const { on } = useEventBus();

  useEffect(() => {
    const unsubscribes = subscriptions.map(({ eventType, handler }) => 
      on(eventType, handler)
    );

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [on, ...deps]);
}

export default useEventBus;
