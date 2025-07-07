import React, { useState } from 'react';

export type ThemeMode = 'dark' | 'night' | 'combat';

export interface ThemeConfiguration {
  name: string;
  colors: Record<string, string>;
  opacity: Record<string, number>;
  effects: Record<string, string>;
}

export interface ThemeSwitcherProps {
  initialTheme?: ThemeMode;
  onThemeChange?: (theme: ThemeMode, config: ThemeConfiguration) => void;
  className?: string;
  disabled?: boolean;
}

const getThemeConfiguration = (theme: ThemeMode): ThemeConfiguration => {
  const themes: Record<ThemeMode, ThemeConfiguration> = {
    dark: {
      name: 'Dark Command',
      colors: {
        'primary-bg': '#000000',
        'secondary-bg': '#0a0a0a',
        'tertiary-bg': '#151515',
        'text-primary': '#ffffff',
        'text-secondary': '#b0b0b0',
        'accent-cyan': '#00ffaa',
        'accent-green': '#00ff41',
        'accent-orange': '#ff9500'
      },
      opacity: {
        'overlay': 0.8,
        'hover': 0.1
      },
      effects: {
        'glow': '0 0 10px rgba(0, 255, 170, 0.4)',
        'shadow': '0 2px 8px rgba(0, 255, 170, 0.2)'
      }
    },
    
    night: {
      name: 'Night Ops',
      colors: {
        'primary-bg': '#000000',
        'secondary-bg': '#050505',
        'tertiary-bg': '#0a0a0a',
        'text-primary': '#888888',
        'text-secondary': '#444444',
        'accent-cyan': '#004455',
        'accent-green': '#002200',
        'accent-orange': '#442200'
      },
      opacity: {
        'overlay': 0.9,
        'hover': 0.05
      },
      effects: {
        'glow': '0 0 5px rgba(0, 68, 85, 0.2)',
        'shadow': '0 1px 4px rgba(0, 0, 0, 0.8)'
      }
    },
    
    combat: {
      name: 'Combat Ready',
      colors: {
        'primary-bg': '#1a0000',
        'secondary-bg': '#330000',
        'tertiary-bg': '#4d0000',
        'text-primary': '#ffffff',
        'text-secondary': '#ffcccc',
        'accent-cyan': '#ff0040',
        'accent-green': '#ff4444',
        'accent-orange': '#ffaa00'
      },
      opacity: {
        'overlay': 0.7,
        'hover': 0.15
      },
      effects: {
        'glow': '0 0 12px rgba(255, 0, 64, 0.6)',
        'shadow': '0 3px 12px rgba(255, 0, 64, 0.3)'
      }
    }
  };
  
  return themes[theme];
};

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  initialTheme = 'dark',
  onThemeChange,
  className = '',
  disabled = false
}) => {
  // Validate initial theme or default to 'dark'
  const validTheme = ['dark', 'night', 'combat'].includes(initialTheme) ? initialTheme : 'dark';
  const [themeMode, setThemeMode] = useState<ThemeMode>(validTheme);

  // Theme cycle order
  const themes: ThemeMode[] = ['dark', 'night', 'combat'];

  const cycleTheme = () => {
    if (disabled) return;
    
    try {
      const currentIndex = themes.indexOf(themeMode);
      const nextTheme = themes[(currentIndex + 1) % themes.length];
      
      setThemeMode(nextTheme);
      
      // Apply theme configuration
      const themeConfig = getThemeConfiguration(nextTheme);
      
      // Call callback with theme and configuration
      if (onThemeChange) {
        onThemeChange(nextTheme, themeConfig);
      }
      
      console.log(`Theme changed: ${themeMode} -> ${nextTheme}`);
    } catch (error) {
      console.error('Error during theme change:', error);
      // Gracefully handle errors without throwing
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      cycleTheme();
    }
  };

  // Get current theme configuration
  const currentConfig = getThemeConfiguration(themeMode);

  // Theme icons
  const getThemeIcon = (theme: ThemeMode): string => {
    const icons = {
      dark: '🌙',
      night: '🔒',
      combat: '⚔️'
    };
    return icons[theme];
  };

  return (
    <div className={`theme-switcher ${className}`.trim()}>
      <button 
        className={`theme-btn ${themeMode}`}
        onClick={cycleTheme}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        title={`Theme: ${currentConfig.name}`}
        type="button"
      >
        <span className="theme-icon">
          {getThemeIcon(themeMode)}
        </span>
      </button>
      <span className="theme-label">{themeMode.toUpperCase()}</span>
    </div>
  );
};

export default ThemeSwitcher;
