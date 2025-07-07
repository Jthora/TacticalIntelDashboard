import React, { useState, useCallback, useRef, useEffect } from 'react';

interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
  error?: string | null;
}

interface UseLoadingOptions {
  initialMessage?: string;
  trackProgress?: boolean;
  minLoadingTime?: number; // Minimum time to show loading (prevents flashing)
  onStart?: () => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export const useLoading = (options: UseLoadingOptions = {}) => {
  const {
    initialMessage = 'Loading...',
    trackProgress = false,
    minLoadingTime = 500, // 500ms minimum
    onStart,
    onComplete,
    onError
  } = options;

  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    progress: trackProgress ? 0 : undefined,
    message: initialMessage,
    error: null
  });

  const startTimeRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setLoading = useCallback((loading: boolean, message?: string) => {
    if (loading) {
      startTimeRef.current = Date.now();
      setState(prev => ({
        ...prev,
        isLoading: true,
        message: message || initialMessage,
        error: null,
        progress: trackProgress ? 0 : undefined
      }));
      onStart?.();
    } else {
      const elapsed = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
      const remaining = Math.max(0, minLoadingTime - elapsed);

      if (remaining > 0) {
        timeoutRef.current = setTimeout(() => {
          setState(prev => ({
            ...prev,
            isLoading: false,
            progress: trackProgress ? 100 : undefined
          }));
          onComplete?.();
        }, remaining);
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          progress: trackProgress ? 100 : undefined
        }));
        onComplete?.();
      }
    }
  }, [initialMessage, trackProgress, minLoadingTime, onStart, onComplete]);

  const setProgress = useCallback((progress: number, message?: string) => {
    setState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
      message: message || prev.message
    }));
  }, []);

  const setMessage = useCallback((message: string) => {
    setState(prev => ({
      ...prev,
      message
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({
      ...prev,
      error,
      isLoading: false
    }));
    if (error) {
      onError?.(error);
    }
  }, [onError]);

  const withLoading = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    loadingMessage?: string
  ): Promise<T> => {
    try {
      setLoading(true, loadingMessage);
      const result = await asyncFn();
      setLoading(false);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      throw error;
    }
  }, [setLoading, setError]);

  const withProgressLoading = useCallback(async <T>(
    asyncFn: (updateProgress: (progress: number, message?: string) => void) => Promise<T>,
    loadingMessage?: string
  ): Promise<T> => {
    try {
      setLoading(true, loadingMessage);
      const result = await asyncFn(setProgress);
      setLoading(false);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      throw error;
    }
  }, [setLoading, setError, setProgress]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    setLoading,
    setProgress,
    setMessage,
    setError,
    withLoading,
    withProgressLoading
  };
};

// Multiple loading states manager
export const useMultipleLoading = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, LoadingState>>({});

  const setLoading = useCallback((key: string, loading: boolean, message?: string) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: {
        isLoading: loading,
        message: message || 'Loading...',
        error: null
      }
    }));
  }, []);

  const setError = useCallback((key: string, error: string | null) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        error,
        isLoading: false
      }
    }));
  }, []);

  const getLoadingState = useCallback((key: string): LoadingState => {
    return loadingStates[key] || { isLoading: false, error: null };
  }, [loadingStates]);

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(state => state.isLoading);
  }, [loadingStates]);

  const clearLoading = useCallback((key: string) => {
    setLoadingStates(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  }, []);

  return {
    loadingStates,
    setLoading,
    setError,
    getLoadingState,
    isAnyLoading,
    clearLoading
  };
};

// Smart loading component wrapper
export const withLoadingState = <P extends object>(
  Component: React.ComponentType<P>,
  loadingComponent?: React.ComponentType<any>
) => {
  return React.forwardRef<any, P & { isLoading?: boolean }>((props, ref) => {
    const { isLoading, ...componentProps } = props;
    
    if (isLoading) {
      return loadingComponent ? React.createElement(loadingComponent) : null;
    }
    
    return React.createElement(Component, { ...componentProps as P, ref });
  });
};

export default useLoading;
