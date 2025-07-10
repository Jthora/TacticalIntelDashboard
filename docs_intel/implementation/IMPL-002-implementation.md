# IMPL-002: SystemControl Settings Implementation

## Overview

**Priority**: High (Critical)  
**Component**: SystemControl, ThemeProvider, LayoutManager  
**Estimated Effort**: 4-6 days  
**Dependencies**: None

## Problem Statement

SystemControl component has toggles for theme switching, compact mode, real-time updates, health alerts, and auto-export, but none of these settings actually affect the application. All toggles are UI-only with no backend functionality.

## Implementation Goals

1. **Primary**: Implement functional theme switching system
2. **Secondary**: Create compact mode layout system  
3. **Tertiary**: Implement real-time updates infrastructure
4. **Bonus**: Add settings persistence and system integration

## Technical Architecture

### Theme System Architecture
```typescript
// Theme definitions
interface ThemeDefinition {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
    danger: string;
    warning: string;
    success: string;
  };
  fonts: {
    primary: string;
    monospace: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// Theme context
interface ThemeContextType {
  currentTheme: string;
  themes: Record<string, ThemeDefinition>;
  setTheme: (themeName: string) => void;
  isCompactMode: boolean;
  setCompactMode: (compact: boolean) => void;
}
```

### Settings Manager Architecture
```typescript
interface SystemSettings {
  theme: 'dark' | 'night' | 'combat';
  compactMode: boolean;
  realTimeUpdates: boolean;
  healthAlerts: boolean;
  autoExport: boolean;
}

interface SettingsService {
  getSettings(): SystemSettings;
  updateSettings(updates: Partial<SystemSettings>): void;
  resetSettings(): void;
  exportSettings(): string;
  importSettings(settingsJson: string): void;
}
```

## Implementation Steps

### Step 1: Create Theme Definitions
**File**: `src/styles/themes/index.ts`

```typescript
export const themes: Record<string, ThemeDefinition> = {
  dark: {
    name: 'Dark Mode',
    colors: {
      primary: '#00ffaa',
      secondary: '#0099ff',
      background: '#0a0a0a',
      surface: '#1a1a1a',
      text: '#ffffff',
      accent: '#ff6600',
      danger: '#ff0040',
      warning: '#ff9500',
      success: '#00ff41'
    },
    fonts: {
      primary: '"Orbitron", "Arial", sans-serif',
      monospace: '"Fira Code", "Courier New", monospace'
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem', 
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem'
    }
  },
  
  night: {
    name: 'Night Vision',
    colors: {
      primary: '#00ff00',
      secondary: '#008800',
      background: '#000000',
      surface: '#111111',
      text: '#00ff00',
      accent: '#ffff00',
      danger: '#ff0000',
      warning: '#ff8800',
      success: '#00ff00'
    },
    fonts: {
      primary: '"Share Tech Mono", monospace',
      monospace: '"Share Tech Mono", monospace'
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem', 
      lg: '1.5rem',
      xl: '2rem'
    }
  },
  
  combat: {
    name: 'Combat Mode',
    colors: {
      primary: '#ff4400',
      secondary: '#cc3300',
      background: '#1a0000',
      surface: '#330000',
      text: '#ffcccc',
      accent: '#ffaa00',
      danger: '#ff0000',
      warning: '#ff6600',
      success: '#00aa00'
    },
    fonts: {
      primary: '"Rajdhani", sans-serif',
      monospace: '"Source Code Pro", monospace'
    },
    spacing: {
      xs: '0.2rem',
      sm: '0.4rem',
      md: '0.8rem',
      lg: '1.2rem', 
      xl: '1.6rem'
    }
  }
};
```

### Step 2: Create Theme Provider
**File**: `src/contexts/ThemeContext.tsx`

```typescript
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<string>('dark');
  const [isCompactMode, setIsCompactMode] = useState<boolean>(false);
  
  // Apply theme to CSS custom properties
  useEffect(() => {
    const theme = themes[currentTheme];
    const root = document.documentElement;
    
    // Apply theme colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Apply theme fonts
    Object.entries(theme.fonts).forEach(([key, value]) => {
      root.style.setProperty(`--font-${key}`, value);
    });
    
    // Apply theme spacing
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });
    
    // Apply theme class to body
    document.body.className = `theme-${currentTheme} ${isCompactMode ? 'compact-mode' : ''}`;
    
  }, [currentTheme, isCompactMode]);
  
  const setTheme = useCallback((themeName: string) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
      // Persist to localStorage
      localStorage.setItem('tactical-theme', themeName);
    }
  }, []);
  
  const setCompactMode = useCallback((compact: boolean) => {
    setIsCompactMode(compact);
    localStorage.setItem('tactical-compact-mode', compact.toString());
  }, []);
  
  // Load saved settings on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('tactical-theme');
    const savedCompactMode = localStorage.getItem('tactical-compact-mode');
    
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
    
    if (savedCompactMode) {
      setIsCompactMode(savedCompactMode === 'true');
    }
  }, []);
  
  const value = {
    currentTheme,
    themes,
    setTheme,
    isCompactMode,
    setCompactMode
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

### Step 3: Create Settings Service
**File**: `src/services/SettingsService.ts`

```typescript
export class SettingsService {
  private static readonly STORAGE_KEY = 'tactical-settings';
  
  private static defaultSettings: SystemSettings = {
    theme: 'dark',
    compactMode: false,
    realTimeUpdates: true,
    healthAlerts: true,
    autoExport: false
  };
  
  static getSettings(): SystemSettings {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return { ...this.defaultSettings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    return { ...this.defaultSettings };
  }
  
  static updateSettings(updates: Partial<SystemSettings>): void {
    try {
      const current = this.getSettings();
      const updated = { ...current, ...updates };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
      
      // Emit settings change event
      window.dispatchEvent(new CustomEvent('settings-changed', { 
        detail: updated 
      }));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }
  
  static resetSettings(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('settings-changed', { 
      detail: this.defaultSettings 
    }));
  }
  
  static exportSettings(): string {
    return JSON.stringify(this.getSettings(), null, 2);
  }
  
  static importSettings(settingsJson: string): boolean {
    try {
      const settings = JSON.parse(settingsJson);
      // Validate settings structure
      if (this.validateSettings(settings)) {
        localStorage.setItem(this.STORAGE_KEY, settingsJson);
        window.dispatchEvent(new CustomEvent('settings-changed', { 
          detail: settings 
        }));
        return true;
      }
    } catch (error) {
      console.error('Failed to import settings:', error);
    }
    return false;
  }
  
  private static validateSettings(settings: any): settings is SystemSettings {
    return (
      typeof settings === 'object' &&
      typeof settings.theme === 'string' &&
      typeof settings.compactMode === 'boolean' &&
      typeof settings.realTimeUpdates === 'boolean' &&
      typeof settings.healthAlerts === 'boolean' &&
      typeof settings.autoExport === 'boolean'
    );
  }
}
```

### Step 4: Create Real-time Updates Service
**File**: `src/services/RealTimeService.ts`

```typescript
export class RealTimeService {
  private static instance: RealTimeService;
  private subscribers: Map<string, (data: any) => void> = new Map();
  private isActive: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  
  static getInstance(): RealTimeService {
    if (!this.instance) {
      this.instance = new RealTimeService();
    }
    return this.instance;
  }
  
  start(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    console.log('Real-time updates started');
    
    // Start polling for updates every 30 seconds
    this.intervalId = setInterval(() => {
      this.checkForUpdates();
    }, 30000);
    
    // Initial check
    this.checkForUpdates();
  }
  
  stop(): void {
    if (!this.isActive) return;
    
    this.isActive = false;
    console.log('Real-time updates stopped');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  subscribe(key: string, callback: (data: any) => void): () => void {
    this.subscribers.set(key, callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(key);
    };
  }
  
  private async checkForUpdates(): Promise<void> {
    try {
      // Check for feed updates
      const feedUpdates = await this.checkFeedUpdates();
      if (feedUpdates.length > 0) {
        this.notifySubscribers('feed-updates', feedUpdates);
      }
      
      // Check for health updates
      const healthUpdates = await this.checkHealthUpdates();
      if (healthUpdates) {
        this.notifySubscribers('health-updates', healthUpdates);
      }
      
    } catch (error) {
      console.error('Real-time update check failed:', error);
    }
  }
  
  private async checkFeedUpdates(): Promise<any[]> {
    // Implementation to check for new feed items
    // This would integrate with FeedService
    return [];
  }
  
  private async checkHealthUpdates(): Promise<any> {
    // Implementation to check system health
    // This would integrate with FeedHealthService
    return null;
  }
  
  private notifySubscribers(type: string, data: any): void {
    this.subscribers.forEach((callback, key) => {
      if (key.startsWith(type) || key === 'all') {
        callback({ type, data });
      }
    });
  }
}
```

### Step 5: Update SystemControl Component
**File**: `src/components/SystemControl.tsx`

```typescript
import { useTheme } from '../contexts/ThemeContext';
import { SettingsService } from '../services/SettingsService';
import { RealTimeService } from '../services/RealTimeService';

const SystemControl: React.FC<SystemControlProps> = ({
  onThemeChange,
  onCompactModeChange,
  onRealTimeUpdatesChange,
  onHealthAlertsChange,
  onAutoExportChange,
}) => {
  const { currentTheme, setTheme, isCompactMode, setCompactMode } = useTheme();
  const [settings, setSettings] = useState(() => SettingsService.getSettings());
  
  // Listen for settings changes
  useEffect(() => {
    const handleSettingsChange = (event: CustomEvent) => {
      setSettings(event.detail);
    };
    
    window.addEventListener('settings-changed', handleSettingsChange as EventListener);
    return () => {
      window.removeEventListener('settings-changed', handleSettingsChange as EventListener);
    };
  }, []);
  
  const handleThemeChange = (theme: 'dark' | 'night' | 'combat') => {
    setTheme(theme);
    SettingsService.updateSettings({ theme });
    onThemeChange?.(theme);
  };
  
  const handleCompactModeToggle = () => {
    const newMode = !isCompactMode;
    setCompactMode(newMode);
    SettingsService.updateSettings({ compactMode: newMode });
    onCompactModeChange?.(newMode);
  };
  
  const handleRealTimeUpdatesToggle = () => {
    const newUpdates = !settings.realTimeUpdates;
    SettingsService.updateSettings({ realTimeUpdates: newUpdates });
    
    // Start/stop real-time service
    const rtService = RealTimeService.getInstance();
    if (newUpdates) {
      rtService.start();
    } else {
      rtService.stop();
    }
    
    onRealTimeUpdatesChange?.(newUpdates);
  };
  
  const handleHealthAlertsToggle = () => {
    const newAlerts = !settings.healthAlerts;
    SettingsService.updateSettings({ healthAlerts: newAlerts });
    onHealthAlertsChange?.(newAlerts);
  };
  
  const handleAutoExportToggle = () => {
    const newAutoExport = !settings.autoExport;
    SettingsService.updateSettings({ autoExport: newAutoExport });
    onAutoExportChange?.(newAutoExport);
  };
  
  return (
    <div className="tactical-module module-system-control">
      <div className="tactical-header-enhanced">
        <div className="header-primary">
          <span className="module-icon">⚙</span>
          <h3>SYSTEM CONTROL</h3>
        </div>
        <div className="header-controls-micro">
          <select 
            value={currentTheme} 
            onChange={(e) => handleThemeChange(e.target.value as any)}
            className="micro-select"
            title="Theme"
          >
            <option value="dark">DARK</option>
            <option value="night">NIGHT</option>
            <option value="combat">COMBAT</option>
          </select>
          <button 
            className={`micro-btn ${isCompactMode ? 'active' : ''}`}
            onClick={handleCompactModeToggle}
            title="Compact Mode"
          >
            ▣
          </button>
          <button 
            className={`micro-btn ${settings.realTimeUpdates ? 'active' : ''}`}
            onClick={handleRealTimeUpdatesToggle}
            title="Real-time Updates"
          >
            ⟲
          </button>
        </div>
      </div>
      <div className="tactical-content">
        <div className="system-controls-grid">
          <div className="control-group">
            <label className="control-label">ALERTS</label>
            <button 
              className={`control-toggle ${settings.healthAlerts ? 'active' : ''}`}
              onClick={handleHealthAlertsToggle}
            >
              {settings.healthAlerts ? '◉' : '○'}
            </button>
          </div>
          <div className="control-group">
            <label className="control-label">AUTO-EXPORT</label>
            <button 
              className={`control-toggle ${settings.autoExport ? 'active' : ''}`}
              onClick={handleAutoExportToggle}
            >
              {settings.autoExport ? '◉' : '○'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### Step 6: Update CSS for Theme Variables
**File**: `src/assets/styles/themes.css`

```css
/* Theme-aware CSS using custom properties */
:root {
  /* Default theme (dark) */
  --color-primary: #00ffaa;
  --color-secondary: #0099ff;
  --color-background: #0a0a0a;
  --color-surface: #1a1a1a;
  --color-text: #ffffff;
  --color-accent: #ff6600;
  --color-danger: #ff0040;
  --color-warning: #ff9500;
  --color-success: #00ff41;
  
  --font-primary: "Orbitron", "Arial", sans-serif;
  --font-monospace: "Fira Code", "Courier New", monospace;
  
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
}

/* Compact mode overrides */
body.compact-mode {
  --spacing-xs: 0.2rem;
  --spacing-sm: 0.4rem;
  --spacing-md: 0.8rem;
  --spacing-lg: 1.2rem;
  --spacing-xl: 1.6rem;
}

body.compact-mode .tactical-module {
  padding: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

body.compact-mode .tactical-header-enhanced {
  padding: var(--spacing-xs) var(--spacing-sm);
  min-height: 2rem;
}

body.compact-mode .tactical-content {
  padding: var(--spacing-xs);
}

/* Theme-specific font loading */
body.theme-night {
  font-family: var(--font-monospace);
}

body.theme-combat {
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* Update existing tactical-ui.css to use variables */
.tactical-module {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-primary);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.tactical-header-enhanced {
  color: var(--color-primary);
  font-family: var(--font-primary);
  padding: var(--spacing-sm) var(--spacing-md);
}

/* Continue updating all classes to use CSS custom properties... */
```

### Step 7: Update Main App to Include Providers
**File**: `src/App.tsx`

```typescript
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <FilterProvider>
        <div className="App">
          <Router>
            <Routes>
              <Route path="/" element={<Dashboard />} />
            </Routes>
          </Router>
        </div>
      </FilterProvider>
    </ThemeProvider>
  );
}
```

## Testing Strategy

### Unit Tests
**File**: `src/services/__tests__/SettingsService.test.ts`

```typescript
describe('SettingsService', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  
  it('should return default settings when none are stored', () => {
    const settings = SettingsService.getSettings();
    
    expect(settings).toEqual({
      theme: 'dark',
      compactMode: false,
      realTimeUpdates: true,
      healthAlerts: true,
      autoExport: false
    });
  });
  
  it('should save and retrieve settings', () => {
    const updates = { theme: 'night' as const, compactMode: true };
    
    SettingsService.updateSettings(updates);
    const settings = SettingsService.getSettings();
    
    expect(settings.theme).toBe('night');
    expect(settings.compactMode).toBe(true);
  });
  
  it('should emit settings change event', () => {
    const listener = jest.fn();
    window.addEventListener('settings-changed', listener);
    
    SettingsService.updateSettings({ theme: 'combat' });
    
    expect(listener).toHaveBeenCalled();
  });
});
```

### Integration Tests
**File**: `src/components/__tests__/SystemControlIntegration.test.tsx`

```typescript
describe('SystemControl Integration', () => {
  it('should change theme when theme selector is used', () => {
    render(
      <ThemeProvider>
        <SystemControl />
      </ThemeProvider>
    );
    
    // Change theme
    fireEvent.change(screen.getByDisplayValue('DARK'), { target: { value: 'night' } });
    
    // Check that body class changed
    expect(document.body).toHaveClass('theme-night');
    
    // Check that CSS custom properties are applied
    const rootStyles = getComputedStyle(document.documentElement);
    expect(rootStyles.getPropertyValue('--color-primary')).toBe('#00ff00');
  });
  
  it('should toggle compact mode', () => {
    render(
      <ThemeProvider>
        <SystemControl />
      </ThemeProvider>
    );
    
    const compactButton = screen.getByTitle('Compact Mode');
    fireEvent.click(compactButton);
    
    expect(document.body).toHaveClass('compact-mode');
    expect(compactButton).toHaveClass('active');
  });
});
```

## Acceptance Criteria

### Must Have
- [ ] Theme switching changes UI appearance across all components
- [ ] Compact mode reduces spacing and sizes appropriately
- [ ] Real-time updates can be enabled/disabled functionally
- [ ] Settings persist across browser sessions
- [ ] All toggle states reflect actual system state

### Should Have
- [ ] Theme transitions are smooth (CSS transitions)
- [ ] Settings can be exported/imported
- [ ] Real-time service integrates with other components
- [ ] Health alerts system functions when enabled

### Could Have
- [ ] Custom theme creation interface
- [ ] Advanced compact mode options
- [ ] Settings synchronization across devices
- [ ] Theme preview before application

## Performance Considerations

1. **CSS Variables**: Use native CSS custom properties for theme switching
2. **Debouncing**: Debounce rapid setting changes
3. **Lazy Loading**: Load theme CSS files on demand
4. **Memory Management**: Properly cleanup real-time service intervals

## Related Documents

- [IMPL-001: Filter Integration](./IMPL-001-implementation.md)
- [IMPL-003: Health Diagnostics](./IMPL-003-implementation.md)
- [Theme Architecture](./shared/theme-architecture.md)
