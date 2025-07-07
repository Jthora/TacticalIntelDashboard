import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

export type Theme = 'dark' | 'night' | 'combat';

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
  | { type: 'TOGGLE_COMPACT_MODE' };

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

  // Load theme from localStorage on mount
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

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('tactical-theme', state.theme);
    // Only set data attributes, don't override existing CSS
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  // Save compact mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('tactical-compact-mode', state.compactMode.toString());
    // Only set data attributes, don't override existing CSS
    document.documentElement.setAttribute('data-compact', state.compactMode.toString());
  }, [state.compactMode]);

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
