# Header Component Documentation

## 🎯 Overview

The Header component is the command center's primary navigation and status bar. Redesigned to be ultra-narrow (24px height) with a monochrome black & white aesthetic, it maximizes screen space while providing essential system controls and real-time status monitoring.

## 🏗 Architecture

### Component Structure
```typescript
interface HeaderState {
  searchQuery: string;
  connectionStatus: 'secure' | 'encrypted' | 'scanning';
  alertLevel: 'green' | 'yellow' | 'red';
  isCompactMode: boolean;
  showSystemMenu: boolean;
  showSuggestions: boolean;
}
```

### Layout Hierarchy
```
tactical-header-ultra
├── header-primary-bar
│   ├── brand-micro
│   ├── status-micro-grid
│   ├── search-micro
│   └── controls-micro
├── system-menu-micro (conditional)
└── search-suggestions-micro (conditional)
```

## 🎨 Visual Design

### Dimensions
- **Height**: 24px fixed
- **Width**: 100% viewport
- **Position**: Fixed top, z-index 1000
- **Background**: Linear gradient black to dark gray

### Color Scheme
```css
background: linear-gradient(90deg, #000000 0%, #0a0a0a 50%, #000000 100%);
border-bottom: 1px solid #333333;
```

## 🔧 Micro-Features

### 1. Brand Section (brand-micro)
```typescript
<div className="brand-micro">
  <img className="brand-icon-micro" />  // 16x16px logo
  <span className="brand-code">TC-01</span>  // Tactical designation
</div>
```

**Features:**
- Ultra-compact logo (16x16px)
- Tactical designation code
- Grayscale filter on logo for monochrome aesthetic

### 2. Status Grid (status-micro-grid)
```typescript
<div className="status-micro-grid">
  <div className="connection-status" onClick={toggleConnectionStatus}>●</div>
  <div className="alert-level" onClick={toggleAlertLevel}>▲</div>
  <div className="time-display">{getCurrentTime()}</div>
</div>
```

**Interactive Elements:**
- **Connection Status**: Click to cycle between secure/encrypted/scanning
- **Alert Level**: Click to cycle between green/yellow/red
- **Real-Time Clock**: Updates every second, 24-hour format

**Visual Indicators:**
```css
/* Connection Status Colors */
.connection-status[data-status="secure"] { color: #00ff41; }
.connection-status[data-status="encrypted"] { color: #00d4ff; }
.connection-status[data-status="scanning"] { color: #ff9500; }

/* Alert Level Colors */
.alert-level[data-level="green"] { color: #00ff41; }
.alert-level[data-level="yellow"] { color: #ff9500; }
.alert-level[data-level="red"] { color: #ff0040; }
```

### 3. Micro Search (search-micro)
```typescript
<div className="search-micro">
  <form className="search-form-micro">
    <input className="search-input-micro" placeholder="SEARCH..." />
    <button className="search-btn-micro">{isSearching ? '⟳' : '→'}</button>
  </form>
</div>
```

**Features:**
- **Compact input field**: 200px max width
- **Single-character submit button**: Arrow (→) or loading (⟳)
- **Auto-suggestions**: Appears below on input focus
- **Keyboard shortcuts**: ESC to close, Enter to search

### 4. Control Buttons (controls-micro)
```typescript
<div className="controls-micro">
  <button title="Feed Manager">█</button>
  <button title="Toggle Compact Mode">▣</button>
  <button title="System Menu">⋮</button>
</div>
```

**Button Functions:**
- **Feed Manager (█)**: Opens fullscreen feed management modal
- **Compact Mode (▣)**: Toggles UI density settings
- **System Menu (⋮)**: Reveals dropdown with system actions

## 🔍 System Menu Dropdown

### Menu Items
```typescript
const systemMenuItems = [
  { icon: '↻', label: 'REFRESH', action: () => window.location.reload() },
  { icon: '⛶', label: 'FULLSCREEN', action: () => document.documentElement.requestFullscreen() },
  { icon: '↓', label: 'EXPORT', action: () => console.log('Export logs') },
  { icon: '⚠', label: 'DIAGNOSTICS', action: () => setConnectionStatus('scanning') }
];
```

### Styling
```css
.system-menu-micro {
  position: absolute;
  top: 100%;
  right: var(--spacing-sm);
  background: #000000;
  border: 1px solid #333333;
  min-width: 120px;
  z-index: 1001;
}
```

## 🔍 Search Suggestions

### Auto-Complete System
```typescript
const filteredSuggestions = searchHistory
  .filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
  .slice(0, 3); // Maximum 3 suggestions for space efficiency
```

### Styling
```css
.search-suggestions-micro {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #000000;
  border: 1px solid #333333;
  max-width: 300px;
  z-index: 1001;
}
```

## ⚡ Performance Optimizations

### State Management
- **Minimal re-renders** through React.memo optimization
- **Debounced search** to prevent excessive API calls
- **Efficient event listeners** with proper cleanup

### CSS Optimizations
- **Hardware acceleration** for animations
- **Minimal repaints** through transform-based movements
- **Efficient selectors** avoiding deep nesting

### Memory Management
- **Cleanup intervals** for time display updates
- **Event listener removal** on component unmount
- **Efficient state updates** preventing memory leaks

## 📱 Responsive Behavior

### Mobile Adaptations (≤768px)
```css
@media (max-width: 768px) {
  .search-micro { max-width: 120px; }
  .status-micro-grid { gap: var(--spacing-sm); }
  .time-display { display: none; }
}
```

### Ultra-Mobile (≤480px)
```css
@media (max-width: 480px) {
  .brand-text-micro { display: none; }
  .search-micro { max-width: 80px; }
  .controls-micro { gap: 1px; }
}
```

## 🎮 User Interactions

### Click Behaviors
- **Status indicators**: Cycle through states with visual feedback
- **Search input**: Focus shows suggestions, blur hides them
- **Control buttons**: Immediate visual response with scale transforms
- **Menu items**: Hover effects with color transitions

### Keyboard Shortcuts
- **Tab navigation**: Logical flow through interactive elements
- **Enter**: Submit search from anywhere in search container
- **Escape**: Close suggestions and system menu
- **Space**: Toggle control buttons

### Visual Feedback
```css
.micro-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
  transition: all var(--transition-fast);
}
```

## 🔧 Customization Options

### Theme Variants
The header adapts to theme changes while maintaining monochrome design:
```typescript
const themes = {
  dark: { primary: '#000000', secondary: '#0a0a0a' },
  night: { primary: '#0a0a0a', secondary: '#151515' },
  combat: { primary: '#000000', secondary: '#001100' }
};
```

### Layout Adjustments
```css
/* Compact mode adjustments */
.tactical-header-ultra.compact {
  height: 20px;
  font-size: calc(var(--font-size-xs) - 1px);
}
```

## 📊 Analytics & Monitoring

### Performance Metrics
- **Render time**: <16ms target for 60fps
- **Memory usage**: <2MB baseline
- **Event response**: <100ms for all interactions

### User Behavior Tracking
- Search query patterns
- Status toggle frequency
- Menu usage statistics
- Time spent in different modes

## 🔜 Future Enhancements

### Planned Features
- **Voice command integration** for hands-free operation
- **Gesture controls** for touch devices
- **Custom status indicators** for specialized operations
- **AI-powered search suggestions** based on usage patterns

### Technical Improvements
- **WebGL status animations** for enhanced visual effects
- **Service worker integration** for offline functionality
- **Progressive enhancement** for low-bandwidth scenarios
- **Advanced accessibility** features for screen readers

---

*The Header component sets the tone for the entire tactical interface, providing essential functionality in minimal space while maintaining the professional command center aesthetic.*
