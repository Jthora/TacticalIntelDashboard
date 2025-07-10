import { renderHook, act } from '@testing-library/react';
import { SettingsProvider, useSettings, SettingsTab, CORSStrategy } from '../SettingsContext';
import React from 'react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('SettingsContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it('should provide default settings', () => {
    const { result } = renderHook(() => useSettings(), {
      wrapper: ({ children }) => <SettingsProvider>{children}</SettingsProvider>
    });

    expect(result.current.settings).toBeDefined();
    expect(result.current.settings.version).toBe('1.0.0');
    expect(result.current.settings.lastTab).toBe(SettingsTab.GENERAL);
    expect(result.current.settings.cors.defaultStrategy).toBe(CORSStrategy.RSS2JSON);
  });

  it('should update settings', () => {
    const { result } = renderHook(() => useSettings(), {
      wrapper: ({ children }) => <SettingsProvider>{children}</SettingsProvider>
    });

    act(() => {
      result.current.updateSettings({
        lastTab: SettingsTab.CORS,
        cors: {
          ...result.current.settings.cors,
          defaultStrategy: CORSStrategy.DIRECT
        }
      });
    });

    expect(result.current.settings.lastTab).toBe(SettingsTab.CORS);
    expect(result.current.settings.cors.defaultStrategy).toBe(CORSStrategy.DIRECT);
  });

  it('should reset all settings', () => {
    const { result } = renderHook(() => useSettings(), {
      wrapper: ({ children }) => <SettingsProvider>{children}</SettingsProvider>
    });

    // First modify settings
    act(() => {
      result.current.updateSettings({
        lastTab: SettingsTab.CORS,
        cors: {
          ...result.current.settings.cors,
          defaultStrategy: CORSStrategy.DIRECT
        }
      });
    });

    // Then reset
    act(() => {
      result.current.resetSettings();
    });

    expect(result.current.settings.lastTab).toBe(SettingsTab.GENERAL);
    expect(result.current.settings.cors.defaultStrategy).toBe(CORSStrategy.RSS2JSON);
  });

  it('should reset tab-specific settings', () => {
    const { result } = renderHook(() => useSettings(), {
      wrapper: ({ children }) => <SettingsProvider>{children}</SettingsProvider>
    });

    // First modify settings
    act(() => {
      result.current.updateSettings({
        cors: {
          ...result.current.settings.cors,
          defaultStrategy: CORSStrategy.DIRECT
        },
        display: {
          ...result.current.settings.display,
          theme: 'light'
        }
      });
    });

    // Reset only CORS settings
    act(() => {
      result.current.resetSettings(SettingsTab.CORS);
    });

    // CORS settings should be reset
    expect(result.current.settings.cors.defaultStrategy).toBe(CORSStrategy.RSS2JSON);
    
    // Display settings should remain changed
    expect(result.current.settings.display.theme).toBe('light');
  });

  it('should persist settings in localStorage', () => {
    const { result } = renderHook(() => useSettings(), {
      wrapper: ({ children }) => <SettingsProvider>{children}</SettingsProvider>
    });

    act(() => {
      result.current.updateSettings({
        lastTab: SettingsTab.CORS,
        cors: {
          ...result.current.settings.cors,
          defaultStrategy: CORSStrategy.DIRECT
        }
      });
    });

    // Check if localStorage was updated
    const storedSettings = JSON.parse(window.localStorage.getItem('tactical-intel-settings') || '{}');
    expect(storedSettings.lastTab).toBe(SettingsTab.CORS);
    expect(storedSettings.cors.defaultStrategy).toBe(CORSStrategy.DIRECT);
  });

  it('should load settings from localStorage on initialization', () => {
    // Set up localStorage with custom settings
    const customSettings = {
      version: '1.0.0',
      lastTab: SettingsTab.ADVANCED,
      cors: {
        defaultStrategy: CORSStrategy.EXTENSION
      }
    };
    window.localStorage.setItem('tactical-intel-settings', JSON.stringify(customSettings));

    // Initialize context
    const { result } = renderHook(() => useSettings(), {
      wrapper: ({ children }) => <SettingsProvider>{children}</SettingsProvider>
    });

    // Verify settings were loaded from localStorage
    expect(result.current.settings.lastTab).toBe(SettingsTab.ADVANCED);
    expect(result.current.settings.cors.defaultStrategy).toBe(CORSStrategy.EXTENSION);
  });
});
