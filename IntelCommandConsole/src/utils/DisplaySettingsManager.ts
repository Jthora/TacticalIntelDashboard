/**
 * This file integrates the DisplaySettings with the application's CSS variables and themes.
 * It provides utilities to apply settings to the actual UI.
 */
import { SettingsIntegrationService } from '../services/SettingsIntegrationService';

// CSS Variable constants
const CSS_VARS = {
  THEME: '--theme',
  FONT_SIZE: '--base-font-size',
  DENSITY: '--ui-density',
  PRIMARY_COLOR: '--primary-color',
  SECONDARY_COLOR: '--secondary-color',
  BACKGROUND_COLOR: '--background-color',
  TEXT_COLOR: '--text-color',
  ACCENT_COLOR: '--accent-color',
  // Add more CSS variables here as needed
};

// Theme color maps
const THEME_COLORS = {
  dark: {
    primary: '#1a1a1a',
    secondary: '#292929',
    background: '#141414',
    text: '#e0e0e0',
    accent: '#007acc'
  },
  night: {
    primary: '#101823',
    secondary: '#1c2636',
    background: '#0a121f',
    text: '#d0d7e2',
    accent: '#5277b4'
  },
  combat: {
    primary: '#2a2118',
    secondary: '#352a1e',
    background: '#1e1813',
    text: '#e5d6c5',
    accent: '#bf5b30'
  },
  alliance: {
    primary: '#1a2a42',
    secondary: '#27395e',
    background: '#131f30',
    text: '#d0dff0',
    accent: '#50b4e0'
  },
  light: {
    primary: '#f5f5f5',
    secondary: '#e0e0e0',
    background: '#ffffff',
    text: '#333333',
    accent: '#0066cc'
  },
  system: {
    // System will use OS preference via CSS media query
    primary: 'var(--dynamic-primary)',
    secondary: 'var(--dynamic-secondary)',
    background: 'var(--dynamic-background)',
    text: 'var(--dynamic-text)',
    accent: 'var(--dynamic-accent)'
  }
};

// Density maps
const DENSITY_VALUES = {
  comfortable: {
    spacing: '1',
    padding: '16px',
    borderRadius: '8px'
  },
  compact: {
    spacing: '0.85',
    padding: '8px',
    borderRadius: '4px'
  },
  spacious: {
    spacing: '1.2',
    padding: '24px',
    borderRadius: '12px'
  }
};

/**
 * DisplaySettingsManager handles the application of display settings to the UI
 */
export class DisplaySettingsManager {
  /**
   * Apply all display settings from the user's configuration
   */
  static applyAllDisplaySettings(): void {
    this.applyTheme();
    this.applyFontSize();
    this.applyDensity();
  }

  /**
   * Apply the theme setting to the document
   */
  static applyTheme(): void {
    const { theme } = SettingsIntegrationService.getThemeSettings();
    const root = document.documentElement;
    
    // Set the theme data attribute
    root.setAttribute('data-theme', theme);
    
    // Apply theme colors to CSS variables
    const colors = THEME_COLORS[theme as keyof typeof THEME_COLORS] || THEME_COLORS.alliance;
    
    root.style.setProperty(CSS_VARS.PRIMARY_COLOR, colors.primary);
    root.style.setProperty(CSS_VARS.SECONDARY_COLOR, colors.secondary);
    root.style.setProperty(CSS_VARS.BACKGROUND_COLOR, colors.background);
    root.style.setProperty(CSS_VARS.TEXT_COLOR, colors.text);
    root.style.setProperty(CSS_VARS.ACCENT_COLOR, colors.accent);
    
    // Set additional utility variables
    root.style.setProperty('--secondary-bg', colors.secondary);
    root.style.setProperty('--tertiary-bg', colors.primary);
    root.style.setProperty('--border-color', colors.secondary);
    root.style.setProperty('--input-bg', colors.secondary);
    root.style.setProperty('--hover-bg', colors.accent + '20');
    
    // For system theme, set up media query listeners
    if (theme === 'system') {
      this.setupSystemThemeListener();
    }
    
    console.log(`Applied theme: ${theme}`);
  }

  /**
   * Apply the font size setting to the document
   */
  static applyFontSize(): void {
    const { fontSize } = SettingsIntegrationService.getThemeSettings();
    const root = document.documentElement;
    
    root.style.setProperty(CSS_VARS.FONT_SIZE, `${fontSize}px`);
    
    console.log(`Applied font size: ${fontSize}px`);
  }

  /**
   * Apply the density setting to the document
   */
  static applyDensity(): void {
    const { density } = SettingsIntegrationService.getThemeSettings();
    const root = document.documentElement;
    
    // Set the density data attribute
    root.setAttribute('data-density', density);
    
    // Apply density values to CSS variables
    const densityValues = DENSITY_VALUES[density as keyof typeof DENSITY_VALUES] || DENSITY_VALUES.comfortable;
    
    root.style.setProperty(CSS_VARS.DENSITY, densityValues.spacing);
    root.style.setProperty('--padding-base', densityValues.padding);
    root.style.setProperty('--border-radius', densityValues.borderRadius);
    
    // Set compact mode for backward compatibility
    root.setAttribute('data-compact', density === 'compact' ? 'true' : 'false');
    
    console.log(`Applied density: ${density}`);
  }

  /**
   * Set up listeners for system theme changes (light/dark mode)
   */
  private static setupSystemThemeListener(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (event: MediaQueryListEvent | MediaQueryList): void => {
      const root = document.documentElement;
      const isDark = event.matches;
      
      // Apply dynamic system theme colors
      if (isDark) {
        root.style.setProperty('--dynamic-primary', THEME_COLORS.dark.primary);
        root.style.setProperty('--dynamic-secondary', THEME_COLORS.dark.secondary);
        root.style.setProperty('--dynamic-background', THEME_COLORS.dark.background);
        root.style.setProperty('--dynamic-text', THEME_COLORS.dark.text);
        root.style.setProperty('--dynamic-accent', THEME_COLORS.dark.accent);
      } else {
        root.style.setProperty('--dynamic-primary', THEME_COLORS.light.primary);
        root.style.setProperty('--dynamic-secondary', THEME_COLORS.light.secondary);
        root.style.setProperty('--dynamic-background', THEME_COLORS.light.background);
        root.style.setProperty('--dynamic-text', THEME_COLORS.light.text);
        root.style.setProperty('--dynamic-accent', THEME_COLORS.light.accent);
      }
      
      console.log(`Applied system theme: ${isDark ? 'dark' : 'light'}`);
    };
    
    // Apply immediately
    handleChange(mediaQuery);
    
    // Set up listener for changes
    mediaQuery.addEventListener('change', handleChange);
  }
}

// Export a singleton instance that can be easily imported
export const displaySettings = {
  apply: (): void => DisplaySettingsManager.applyAllDisplaySettings(),
  applyTheme: (): void => DisplaySettingsManager.applyTheme(),
  applyFontSize: (): void => DisplaySettingsManager.applyFontSize(),
  applyDensity: (): void => DisplaySettingsManager.applyDensity()
};
