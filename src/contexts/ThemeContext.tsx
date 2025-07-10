import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useSettings } from './SettingsContext';

export type Theme = 'dark' | 'night' | 'combat' | 'alliance' | 'light' | 'system';

interface ThemeState {
  theme: Theme;
  compactMode: boolean;
}

interface ThemeContextType {
  theme: Theme;
  compactMode: boolean;
  setTheme: (theme: Theme) => void;
  setCompactMode: (enabled: boolean) => void;
  toggleCompactMode: () => void;
}

type ThemeAction = 
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_COMPACT_MODE'; payload: boolean }
  | { type: 'TOGGLE_COMPACT_MODE' }
  | { type: 'SYNC_WITH_SETTINGS'; payload: { theme: Theme, compactMode: boolean } };

const initialState: ThemeState = {
  theme: 'dark',
  compactMode: false,
};

const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_COMPACT_MODE':
      return { ...state, compactMode: action.payload };
    case 'TOGGLE_COMPACT_MODE':
      return { ...state, compactMode: !state.compactMode };
    case 'SYNC_WITH_SETTINGS':
      return { 
        theme: action.payload.theme as Theme,
        compactMode: action.payload.compactMode
      };
    default:
      return state;
  }
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);
  const { settings, updateSettings } = useSettings();

  // Initial load from localStorage (legacy approach - will sync with settings later)
  useEffect(() => {
    const savedTheme = localStorage.getItem('tactical-theme') as Theme;
    const savedCompactMode = localStorage.getItem('tactical-compact-mode') === 'true';
    
    if (savedTheme) {
      dispatch({ type: 'SET_THEME', payload: savedTheme });
    }
    if (savedCompactMode !== null) {
      dispatch({ type: 'SET_COMPACT_MODE', payload: savedCompactMode });
    }
  }, []);

  // Sync with SettingsContext when it loads
  useEffect(() => {
    if (settings?.display) {
      // Map 'comfortable'/'compact'/'spacious' to compactMode boolean
      const compactMode = settings.display.density === 'compact';
      
      dispatch({ 
        type: 'SYNC_WITH_SETTINGS', 
        payload: { 
          theme: settings.display.theme as Theme,
          compactMode
        }
      });
    }
  }, [settings]);

  // Apply changes to document and sync back to settings
  useEffect(() => {
    // Save theme to localStorage (legacy)
    localStorage.setItem('tactical-theme', state.theme);
    
    // Set data attribute for theme
    document.documentElement.setAttribute('data-theme', state.theme);
    
    // Update SettingsContext
    if (settings?.display?.theme !== state.theme) {
      updateSettings({
        display: {
          ...settings.display,
          theme: state.theme as any,
        }
      });
    }
  }, [state.theme, settings, updateSettings]);

  // Save compact mode to localStorage when it changes
  useEffect(() => {
    // Save to localStorage (legacy)
    localStorage.setItem('tactical-compact-mode', state.compactMode.toString());
    
    // Set data attributes for density
    document.documentElement.setAttribute('data-compact', state.compactMode.toString());
    
    // Update SettingsContext
    if (settings?.display) {
      const currentDensity = settings.display.density;
      const newDensity = state.compactMode ? 'compact' : 'comfortable';
      
      if (currentDensity !== newDensity) {
        updateSettings({
          display: {
            ...settings.display,
            density: newDensity,
          }
        });
      }
    }
  }, [state.compactMode, settings, updateSettings]);

  const setTheme = (theme: Theme) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  const setCompactMode = (enabled: boolean) => {
    dispatch({ type: 'SET_COMPACT_MODE', payload: enabled });
  };

  const toggleCompactMode = () => {
    dispatch({ type: 'TOGGLE_COMPACT_MODE' });
  };

  const value: ThemeContextType = {
    theme: state.theme,
    compactMode: state.compactMode,
    setTheme,
    setCompactMode,
    toggleCompactMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
