# Theme System Documentation

## 🎯 Overview

The Tactical Intel Dashboard theme system provides three distinct visual modes designed for different operational environments while maintaining the core cyber/hacker aesthetic and maximum space efficiency.

## 🎨 Theme Architecture

### CSS Variable System
```css
:root {
  /* Base Theme Variables */
  --primary-bg: var(--theme-primary-bg);
  --secondary-bg: var(--theme-secondary-bg);
  --tertiary-bg: var(--theme-tertiary-bg);
  --text-primary: var(--theme-text-primary);
  --text-secondary: var(--theme-text-secondary);
  --text-muted: var(--theme-text-muted);
  
  /* Accent colors remain consistent across themes */
  --accent-cyan: #00ffaa;
  --accent-blue: #0099ff;
  --accent-orange: #ff6600;
  --accent-red: #ff0040;
  --accent-green: #00ff00;
}
```

### Dynamic Theme Switching
```typescript
const applyTheme = (themeName: string) => {
  const themes = {
    dark: darkTheme,
    night: nightTheme,
    combat: combatTheme
  };
  
  const theme = themes[themeName];
  Object.entries(theme).forEach(([property, value]) => {
    document.documentElement.style.setProperty(`--theme-${property}`, value);
  });
};
```

## 🌑 Dark Theme (Default)

### Visual Characteristics
- **Pure black backgrounds** for maximum contrast
- **Bright white text** for optimal readability
- **Cyan accents** for technological feel
- **Professional appearance** suitable for any environment

### Color Palette
```css
.theme-dark {
  --theme-primary-bg: #000000;     /* Pure black */
  --theme-secondary-bg: #0a0a0a;   /* Very dark gray */
  --theme-tertiary-bg: #151515;    /* Dark gray */
  --theme-text-primary: #ffffff;   /* Pure white */
  --theme-text-secondary: #b0b0b0; /* Light gray */
  --theme-text-muted: #666666;     /* Medium gray */
}
```

### Use Cases
- **General operations** in normal lighting
- **Professional presentations** and demonstrations
- **24/7 operations** with standard monitor setups
- **Default choice** for new users

### Visual Examples
```css
/* Header styling in dark theme */
.tactical-header-ultra {
  background: linear-gradient(90deg, #000000 0%, #0a0a0a 50%, #000000 100%);
  border-bottom: 1px solid #333333;
}

/* Module styling in dark theme */
.tactical-module {
  background: linear-gradient(135deg, 
    rgba(0, 0, 0, 0.9) 0%, 
    rgba(21, 21, 21, 0.95) 100%);
  border: 1px solid rgba(0, 255, 170, 0.2);
}
```

## 🌃 Night Theme

### Visual Characteristics
- **Elevated dark grays** to reduce pure black eye strain
- **Softened text contrast** for extended viewing
- **Enhanced readability** in low-light environments
- **Reduced visual fatigue** during long operations

### Color Palette
```css
.theme-night {
  --theme-primary-bg: #0a0a0a;     /* Very dark gray */
  --theme-secondary-bg: #151515;   /* Dark gray */
  --theme-tertiary-bg: #202020;    /* Medium dark gray */
  --theme-text-primary: #e0e0e0;   /* Off-white */
  --theme-text-secondary: #a0a0a0; /* Medium light gray */
  --theme-text-muted: #606060;     /* Light gray */
}
```

### Use Cases
- **Extended monitoring sessions** (8+ hours)
- **Low-light environments** or dimmed control rooms
- **Night shift operations** with reduced ambient lighting
- **Eye strain reduction** for sensitive users

### Contrast Ratios
```css
/* Optimized for WCAG AA compliance in low light */
--night-contrast-primary: 12.8:1;   /* White on dark gray */
--night-contrast-secondary: 8.5:1;  /* Light gray on dark */
--night-contrast-accent: 15.2:1;    /* Cyan on dark gray */
```

### Visual Adjustments
```css
/* Softer shadows in night theme */
.theme-night .tactical-module {
  box-shadow: 0 0 20px rgba(0, 255, 170, 0.05);
}

/* Reduced glow effects */
.theme-night .status-dot {
  box-shadow: 0 0 2px currentColor;
}
```

## ⚔️ Combat Theme

### Visual Characteristics
- **Matrix-inspired green monochrome** aesthetic
- **High-contrast green-on-black** for maximum visibility
- **Military-grade appearance** for tactical operations
- **Terminal-style** classic hacker interface

### Color Palette
```css
.theme-combat {
  --theme-primary-bg: #000000;     /* Pure black */
  --theme-secondary-bg: #001100;   /* Dark green tint */
  --theme-tertiary-bg: #002200;    /* Medium green tint */
  --theme-text-primary: #00ff41;   /* Matrix green */
  --theme-text-secondary: #00aa33; /* Medium green */
  --theme-text-muted: #006622;     /* Dark green */
}
```

### Accent Overrides
```css
.theme-combat {
  --accent-cyan: #00ff41;          /* Matrix green replaces cyan */
  --accent-success: #00ff41;       /* Consistent green */
  --accent-info: #00aa33;          /* Darker green for info */
}
```

### Use Cases
- **High-stress tactical operations** requiring maximum focus
- **Military or security environments** with appropriate aesthetics
- **Demonstration scenarios** showcasing hacker/cyber capabilities
- **Retro terminal enthusiasts** preferring classic green-screen look

### Special Effects
```css
/* Enhanced glow effects in combat theme */
.theme-combat .status-dot.active {
  box-shadow: 0 0 8px #00ff41, 0 0 16px #00ff41;
}

/* Terminal-style text shadows */
.theme-combat .brand-text-micro,
.theme-combat .metric-value {
  text-shadow: 0 0 4px currentColor;
}

/* Animated scanlines effect */
.theme-combat .tactical-module::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    transparent 98%,
    rgba(0, 255, 65, 0.03) 100%
  );
  background-size: 100% 4px;
  animation: scanlines 2s linear infinite;
  pointer-events: none;
}

@keyframes scanlines {
  0% { transform: translateY(0); }
  100% { transform: translateY(4px); }
}
```

## 🔄 Theme Switching Mechanism

### React Implementation
```typescript
interface ThemeContextType {
  currentTheme: 'dark' | 'night' | 'combat';
  setTheme: (theme: 'dark' | 'night' | 'combat') => void;
  themes: ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'night' | 'combat'>('dark');
  
  const setTheme = useCallback((theme: 'dark' | 'night' | 'combat') => {
    setCurrentTheme(theme);
    applyTheme(theme);
    localStorage.setItem('tactical-theme', theme);
  }, []);
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('tactical-theme') as 'dark' | 'night' | 'combat';
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, [setTheme]);
  
  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### Theme Selector Component
```typescript
const ThemeSelector: React.FC = () => {
  const { currentTheme, setTheme } = useTheme();
  
  return (
    <select 
      value={currentTheme} 
      onChange={(e) => setTheme(e.target.value as any)}
      className="micro-select"
      title="Theme Selection"
    >
      <option value="dark">DARK</option>
      <option value="night">NIGHT</option>
      <option value="combat">COMBAT</option>
    </select>
  );
};
```

### Smooth Transitions
```css
/* Global theme transition */
* {
  transition: 
    background-color 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

/* Prevent transition on initial load */
.no-transition * {
  transition: none !important;
}
```

## 🎨 Component Adaptations

### Header Adaptations
```css
/* Dark Theme Header */
.theme-dark .tactical-header-ultra {
  background: linear-gradient(90deg, #000000 0%, #0a0a0a 50%, #000000 100%);
}

/* Night Theme Header */
.theme-night .tactical-header-ultra {
  background: linear-gradient(90deg, #0a0a0a 0%, #151515 50%, #0a0a0a 100%);
}

/* Combat Theme Header */
.theme-combat .tactical-header-ultra {
  background: linear-gradient(90deg, #000000 0%, #001100 50%, #000000 100%);
  border-bottom: 1px solid #006622;
}
```

### Module Styling
```css
/* Theme-specific module backgrounds */
.theme-dark .tactical-module {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(21, 21, 21, 0.95) 100%);
  border: 1px solid rgba(0, 255, 170, 0.2);
}

.theme-night .tactical-module {
  background: linear-gradient(135deg, rgba(10, 10, 10, 0.9) 0%, rgba(32, 32, 32, 0.95) 100%);
  border: 1px solid rgba(0, 255, 170, 0.15);
}

.theme-combat .tactical-module {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 34, 0, 0.95) 100%);
  border: 1px solid rgba(0, 255, 65, 0.3);
}
```

### Status Indicators
```css
/* Theme-aware status colors */
.theme-dark .activity-indicator[data-status="active"] { color: #00ff41; }
.theme-night .activity-indicator[data-status="active"] { color: #00ff55; }
.theme-combat .activity-indicator[data-status="active"] { color: #00ff41; }

.theme-dark .activity-indicator[data-status="idle"] { color: #ff9500; }
.theme-night .activity-indicator[data-status="idle"] { color: #ffaa00; }
.theme-combat .activity-indicator[data-status="idle"] { color: #00aa33; }

.theme-dark .activity-indicator[data-status="stale"] { color: #ff0040; }
.theme-night .activity-indicator[data-status="stale"] { color: #ff1155; }
.theme-combat .activity-indicator[data-status="stale"] { color: #006622; }
```

## 📱 Responsive Theme Behavior

### Mobile Adaptations
```css
@media (max-width: 768px) {
  /* Increase contrast on mobile for better visibility */
  .theme-night {
    --theme-text-primary: #ffffff;
    --theme-text-secondary: #cccccc;
  }
  
  /* Simplify combat theme effects on mobile */
  .theme-combat .tactical-module::before {
    display: none;
  }
}
```

### High Contrast Mode
```css
@media (prefers-contrast: high) {
  .theme-dark,
  .theme-night,
  .theme-combat {
    --theme-text-primary: #ffffff;
    --theme-primary-bg: #000000;
    --accent-cyan: #00ffff;
    --accent-green: #00ff00;
    --accent-red: #ff0000;
  }
}
```

## 🔧 Theme Customization

### User Preference Storage
```typescript
interface ThemePreferences {
  selectedTheme: 'dark' | 'night' | 'combat';
  customColors?: {
    primaryAccent?: string;
    secondaryAccent?: string;
    backgroundColor?: string;
  };
  accessibility?: {
    highContrast: boolean;
    reducedMotion: boolean;
    largerText: boolean;
  };
}

const saveThemePreferences = (prefs: ThemePreferences) => {
  localStorage.setItem('tactical-theme-preferences', JSON.stringify(prefs));
};
```

### Advanced Theme Options
```typescript
const advancedThemeOptions = {
  animations: {
    enabled: true,
    speed: 'normal' | 'fast' | 'slow',
    effects: ['glow', 'pulse', 'slide', 'fade']
  },
  colors: {
    customAccent: '#00ffaa',
    customBackground: '#000000',
    customText: '#ffffff'
  },
  layout: {
    compactMode: false,
    showEffects: true,
    glowIntensity: 'medium'
  }
};
```

## 🎭 Theme Performance

### Optimization Strategies
```css
/* Use CSS custom properties for efficient theme switching */
.tactical-module {
  background: var(--theme-module-bg);
  color: var(--theme-text-primary);
  /* Avoid using theme-specific selectors when possible */
}

/* Minimize DOM queries during theme changes */
:root {
  --theme-transition-duration: 0.3s;
}

* {
  transition: 
    background-color var(--theme-transition-duration) ease,
    color var(--theme-transition-duration) ease;
}
```

### Memory Management
```typescript
// Cleanup theme-related intervals and observers
useEffect(() => {
  const cleanup = () => {
    // Clear any theme-specific timers
    // Remove theme-specific event listeners
  };
  
  return cleanup;
}, [currentTheme]);
```

## 🔜 Future Theme Enhancements

### Planned Features
1. **Custom theme builder** for user-defined color schemes
2. **Automatic theme switching** based on time of day
3. **Environmental themes** that adapt to ambient light sensors
4. **Accessibility themes** for specific visual needs
5. **Team themes** for collaborative environments
6. **Mission-specific themes** for different operational contexts

### Advanced Concepts
- **AI-powered theme suggestions** based on usage patterns
- **Dynamic color temperature** adjustment
- **Biometric-responsive theming** based on stress levels
- **Context-aware themes** that change based on alert levels
- **Collaborative theme synchronization** across team members

## 📊 Theme Analytics

### Usage Tracking
```typescript
const trackThemeUsage = (themeName: string, duration: number) => {
  analytics.track('theme_usage', {
    theme: themeName,
    duration_minutes: duration,
    timestamp: Date.now(),
    user_agent: navigator.userAgent
  });
};
```

### Performance Metrics
- **Theme switch time**: Target <300ms
- **Memory impact**: <5MB additional per theme
- **Render performance**: Maintain 60fps during transitions
- **Battery impact**: Minimal on mobile devices

---

*The theme system provides operational flexibility while maintaining the core tactical interface principles, ensuring optimal performance in diverse operational environments.*
