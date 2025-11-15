import { act, renderHook, waitFor } from '@testing-library/react';

import { MissionMode } from '../../constants/MissionMode';
import { ThemeProvider, useTheme } from '../ThemeContext';

const buildSettings = (displayTheme: 'light' | 'dark' | 'system' | 'alliance' | 'combat' | 'spaceforce') => ({
  version: '1.0.0-test',
  lastTab: 'general',
  cors: {
    defaultStrategy: 'DIRECT',
    protocolStrategies: {},
    services: {
      rss2json: [],
      corsProxies: []
    },
    fallbackChain: []
  },
  protocols: {
    priority: [],
    settings: {},
    autoDetect: true,
    fallbackEnabled: true
  },
  verification: {
    minimumTrustRating: 50,
    preferredMethods: [],
    warningThreshold: 10
  },
  display: {
    theme: displayTheme,
    density: 'comfortable',
    fontSize: 14
  },
  general: {
    mode: MissionMode.MILTECH,
    refreshInterval: 300000,
    cacheSettings: {
      enabled: true,
      duration: 300000
    },
    notifications: {
      enabled: true,
      sound: false
    }
  }
});

const mockSettingsState = {
  settings: buildSettings('combat'),
  updateSettings: jest.fn()
};

jest.mock('../SettingsContext', () => ({
  useSettings: () => mockSettingsState
}));

describe('ThemeProvider integration with settings + mission mode', () => {
  beforeEach(() => {
    mockSettingsState.settings = buildSettings('combat');
    mockSettingsState.updateSettings.mockClear();
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-compact');
  });

  const renderUseTheme = () => renderHook(() => useTheme(), { wrapper: ThemeProvider });

  it('syncs theme from settings and applies it to the document', async () => {
    const { result } = renderUseTheme();

    await waitFor(() => expect(result.current.theme).toBe('combat'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('combat');
  });

  it('does not override a user-selected theme when mission mode applies a theme', async () => {
    const { result } = renderUseTheme();

    await waitFor(() => expect(result.current.theme).toBe('combat'));

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');

    act(() => {
      result.current.applyModeTheme('spaceforce');
    });

    expect(result.current.theme).toBe('dark');
  });

  it('persists user theme overrides back to settings', async () => {
    const { result } = renderUseTheme();

    await waitFor(() => expect(result.current.theme).toBe('combat'));

    act(() => {
      result.current.setTheme('spaceforce');
    });

    expect(mockSettingsState.updateSettings).toHaveBeenCalledWith({
      display: expect.objectContaining({ theme: 'spaceforce' })
    });
  });
});
