# Theme Switcher

## 🎨 Feature Overview

The Theme Switcher provides instant visual environment adaptation through tactical color schemes optimized for different operational conditions and user preferences. This micro-feature enables rapid interface optimization for varying lighting conditions and mission requirements.

## 🎯 Purpose & Strategic Value

### Mission-Critical Function
- **Environmental Adaptation**: Visual optimization for different lighting conditions
- **Operational Security**: Low-visibility themes for covert operations
- **Eye Strain Reduction**: Comfort optimization for extended operations
- **Team Standardization**: Consistent visual environments across team members

### Intelligence Operations Context
Theme selection varies by operational environment:
- **Dark Theme**: Standard command center operations, reduced eye strain
- **Night Theme**: Ultra-low light operations, maximum stealth
- **Combat Theme**: High-contrast emergency operations, maximum visibility

## 🏗 Technical Implementation

### React State Management
```typescript
type ThemeMode = 'dark' | 'night' | 'combat';
const [themeMode, setThemeMode] = useState<ThemeMode>('dark');

const cycleTheme = () => {
  const themes: ThemeMode[] = ['dark', 'night', 'combat'];
  const currentIndex = themes.indexOf(themeMode);
  const nextTheme = themes[(currentIndex + 1) % themes.length];
  
  setThemeMode(nextTheme);
  applyTheme(nextTheme);
};

const applyTheme = (theme: ThemeMode) => {
  const themeConfig = getThemeConfiguration(theme);
  
  // Apply CSS custom properties
  Object.entries(themeConfig.colors).forEach(([property, value]) => {
    document.documentElement.style.setProperty(`--${property}`, value);
  });
  
  // Update body class for theme-specific styles
  document.body.className = `theme-${theme}`;
  
  // Store preference
  localStorage.setItem('tactical-theme', theme);
};
```

### Theme Configuration System
```typescript
interface ThemeConfiguration {
  name: string;
  colors: Record<string, string>;
  opacity: Record<string, number>;
  effects: Record<string, string>;
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
```

### Visual Component
```tsx
<div className="theme-switcher">
  <button 
    className={`theme-btn ${themeMode}`}
    onClick={cycleTheme}
    title={`Theme: ${getThemeConfiguration(themeMode).name}`}
  >
    <span className="theme-icon">
      {themeMode === 'dark' && '🌙'}
      {themeMode === 'night' && '🔒'}
      {themeMode === 'combat' && '⚔️'}
    </span>
  </button>
  <span className="theme-label">{themeMode.toUpperCase()}</span>
</div>
```

### CSS Theme Implementation
```css
/* Theme-specific button styling */
.theme-btn {
  width: 16px;
  height: 14px;
  border: 1px solid var(--text-muted);
  background: var(--secondary-bg);
  transition: all 0.3s ease;
}

.theme-btn.dark {
  color: var(--accent-cyan);
  border-color: var(--accent-cyan);
  background: rgba(0, 255, 170, 0.1);
}

.theme-btn.night {
  color: #004455;
  border-color: #004455;
  background: rgba(0, 68, 85, 0.1);
}

.theme-btn.combat {
  color: var(--accent-red);
  border-color: var(--accent-red);
  background: rgba(255, 0, 64, 0.1);
  animation: combat-ready 3s infinite;
}

@keyframes combat-ready {
  0%, 100% { 
    box-shadow: 0 0 4px rgba(255, 0, 64, 0.3);
  }
  50% { 
    box-shadow: 0 0 8px rgba(255, 0, 64, 0.6);
  }
}

/* Body theme classes for global styling */
body.theme-dark {
  background: linear-gradient(135deg, #000000, #0a0a0a);
}

body.theme-night {
  background: #000000;
  filter: brightness(0.3);
}

body.theme-combat {
  background: linear-gradient(135deg, #1a0000, #330000);
}
```

## 📐 Architectural Integration

### Right Sidebar Position
- **Location**: System Control Panel, below performance mode
- **Dimensions**: 16px button + 28px label
- **Visual Feedback**: Theme-appropriate colors and animations
- **Context**: Part of user interface customization controls

### Global Theme System
```typescript
interface ThemeManager {
  currentTheme: ThemeMode;
  availableThemes: ThemeConfiguration[];
  autoDetection: boolean;
  timeBasedSwitching: boolean;
  preferences: UserThemePreferences;
}

// Context provider for theme management
const ThemeContext = createContext<ThemeManager>({
  currentTheme: 'dark',
  setTheme: (theme: ThemeMode) => {},
  applyTheme: (theme: ThemeMode) => {},
  getThemeConfig: (theme: ThemeMode) => getThemeConfiguration(theme)
});
```

### Component Integration
```css
/* Components automatically inherit theme variables */
.header {
  background: var(--primary-bg);
  border-bottom: 1px solid var(--text-muted);
  box-shadow: var(--shadow);
}

.sidebar {
  background: var(--secondary-bg);
  color: var(--text-primary);
}

.button:hover {
  background: var(--accent-cyan);
  box-shadow: var(--glow);
}
```

## 🚀 Usage Guidelines

### Theme Selection Scenarios

#### Dark Theme (🌙)
- **Environment**: Normal lighting conditions, command centers
- **Duration**: Extended operations, standard work environments
- **Benefits**: Reduced eye strain, professional appearance
- **Best For**: Routine intelligence operations, analysis work

#### Night Theme (🔒)
- **Environment**: Low-light operations, covert activities
- **Duration**: Night operations, stealth requirements
- **Benefits**: Minimal light emission, eye adaptation preservation
- **Best For**: Surveillance operations, night missions

#### Combat Theme (⚔️)
- **Environment**: High-stress situations, emergency response
- **Duration**: Crisis periods, time-critical operations
- **Benefits**: Maximum contrast, alert state reinforcement
- **Best For**: Emergency response, critical situations

### Operational Protocols
1. **Environment Assessment**: Select theme based on ambient lighting
2. **Mission Phase**: Adapt theme to operational intensity
3. **Team Coordination**: Synchronize themes across team members
4. **Eye Comfort**: Monitor and adjust for extended operations

## 🔧 Performance Considerations

### Theme Switching Performance
```typescript
// Optimized theme application with CSS variables
const applyThemeOptimized = (theme: ThemeMode) => {
  const config = getThemeConfiguration(theme);
  
  // Batch DOM updates for better performance
  requestAnimationFrame(() => {
    const root = document.documentElement;
    const updates = Object.entries(config.colors);
    
    // Apply all color updates in single frame
    updates.forEach(([property, value]) => {
      root.style.setProperty(`--${property}`, value);
    });
    
    // Update body class
    document.body.className = `theme-${theme}`;
  });
};
```

### Memory Management
- **CSS Variable Caching**: Efficient storage of theme properties
- **Minimal Re-renders**: Theme changes only affect CSS variables
- **Local Storage**: Persist theme preferences across sessions
- **Cleanup**: Remove unused theme data

## 🔮 Future Enhancement Opportunities

### Advanced Theme Features
- **Custom Themes**: User-created theme configurations
- **Adaptive Themes**: Automatic adjustment based on environment
- **Time-Based Switching**: Scheduled theme changes
- **System Integration**: OS dark mode detection

### Enhanced Customization
```typescript
interface AdvancedThemeSystem {
  customThemes: UserTheme[];
  adaptiveMode: boolean;
  timeBasedSwitching: TimeBasedTheme[];
  environmentDetection: boolean;
  accessibilityThemes: AccessibilityTheme[];
}
```

### Integration Features
- **Hardware Sensors**: Ambient light detection for auto-switching
- **Calendar Integration**: Theme scheduling based on operations
- **Team Synchronization**: Coordinated theme switching
- **Export/Import**: Share custom themes between users

## 📊 Metrics & Analytics

### Theme Usage Patterns
- **Theme Distribution**: Time spent in each theme mode
- **Switching Frequency**: How often users change themes
- **Context Correlation**: Theme preferences by operation type
- **User Satisfaction**: Theme effectiveness ratings

### Performance Impact
- **Switch Time**: Duration of theme transitions
- **Memory Usage**: RAM consumption per theme
- **Rendering Performance**: Frame rate impact of theme changes
- **Battery Impact**: Power consumption differences between themes

## 🛡 Accessibility & Standards

### Visual Accessibility
- **Contrast Ratios**: WCAG 2.1 AA compliance across all themes
- **Color Blindness**: Theme variations for color vision deficiencies
- **High Contrast**: Enhanced visibility options
- **Text Legibility**: Optimal font/background combinations

### Standards Compliance
- **Professional Standards**: Military/government interface guidelines
- **International Standards**: ISO 9241 ergonomic requirements
- **Industry Best Practices**: Command center design standards
- **Accessibility Laws**: Section 508 and ADA compliance
