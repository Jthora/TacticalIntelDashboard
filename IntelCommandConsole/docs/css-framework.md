# CSS Framework Documentation

## 🎯 Overview

The Tactical UI CSS Framework is a comprehensive design system built for command center interfaces, emphasizing maximum space efficiency, cyber/hacker aesthetics, and professional military-grade styling.

## 🎨 Design System Foundation

### CSS Variables Architecture
```css
:root {
  /* Color Palette */
  --primary-bg: #000000;           /* Pure black base */
  --secondary-bg: #0a0a0a;         /* Dark gray */
  --tertiary-bg: #151515;          /* Light gray */
  
  /* Accent Colors */
  --accent-cyan: #00ffaa;          /* Primary accent */
  --accent-blue: #0099ff;          /* Information */
  --accent-orange: #ff6600;        /* Warning */
  --accent-red: #ff0040;           /* Critical */
  --accent-purple: #9966ff;        /* Special */
  --accent-yellow: #ffff00;        /* Highlight */
  --accent-green: #00ff00;         /* Success */
  
  /* Cyber Theme Colors */
  --cyber-glow: #00ff41;           /* Matrix green */
  --cyber-warning: #ff9500;        /* Alert orange */
  --cyber-critical: #ff0040;       /* Emergency red */
  --cyber-data: #00d4ff;           /* Data blue */
}
```

### Ultra-Minimal Spacing System
```css
:root {
  /* Micro Spacing - Maximizes Screen Space */
  --spacing-xs: 1px;     /* Hairline separation */
  --spacing-sm: 2px;     /* Minimal gap */
  --spacing-md: 3px;     /* Small gap */
  --spacing-lg: 4px;     /* Medium gap */
  --spacing-xl: 6px;     /* Large gap */
  --spacing-xxl: 8px;    /* Extra large gap */
}
```

### Compact Border Radius
```css
:root {
  /* Ultra-Minimal Radius */
  --radius-sm: 1px;      /* Subtle rounding */
  --radius-md: 2px;      /* Small rounding */
  --radius-lg: 3px;      /* Medium rounding */
  --radius-xl: 4px;      /* Large rounding */
}
```

### Micro Typography Scale
```css
:root {
  /* Compact Font Sizes */
  --font-size-xs: 8px;   /* Micro text */
  --font-size-sm: 10px;  /* Small text */
  --font-size-md: 12px;  /* Body text */
  --font-size-lg: 14px;  /* Subheadings */
  --font-size-xl: 16px;  /* Headings */
  --font-size-xxl: 20px; /* Large display */
}
```

## 🏗 Component Framework

### Tactical Module System
```css
.tactical-module {
  background: linear-gradient(135deg, 
    rgba(0, 0, 0, 0.9) 0%, 
    rgba(21, 21, 21, 0.95) 100%);
  border: 1px solid rgba(0, 255, 170, 0.2);
  border-radius: var(--radius-md);
  backdrop-filter: blur(10px);
  transition: all var(--transition-normal);
}

.tactical-module:hover {
  border-color: rgba(0, 255, 170, 0.4);
  box-shadow: 0 0 20px rgba(0, 255, 170, 0.1);
}
```

### Enhanced Header System
```css
.tactical-header-enhanced {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm);
  background: linear-gradient(90deg, 
    rgba(0, 255, 170, 0.1) 0%, 
    rgba(0, 212, 255, 0.1) 100%);
  border-bottom: 1px solid rgba(0, 255, 170, 0.3);
  margin-bottom: var(--spacing-sm);
}

.header-primary {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-family: var(--font-tactical);
}

.header-controls-micro {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}
```

### Grid Layout System
```css
.tactical-grid {
  display: grid;
  grid-template-areas: 
    "left center right";
  grid-template-columns: 250px 1fr 300px;
  grid-template-rows: 1fr;
  gap: var(--spacing-md);
  height: calc(100vh - 26px);
  margin-top: 26px;
  padding: var(--spacing-sm);
}

@media (max-width: 1200px) {
  .tactical-grid {
    grid-template-columns: 200px 1fr 250px;
  }
}

@media (max-width: 768px) {
  .tactical-grid {
    grid-template-areas: 
      "center"
      "left"
      "right";
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }
}
```

## 🔧 Micro-Control System

### Button Framework
```css
.micro-btn {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid #333333;
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
  padding: 1px var(--spacing-xs);
  border-radius: var(--radius-sm);
  width: 16px;
  height: 16px;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.micro-btn:hover {
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
  background: rgba(0, 255, 170, 0.1);
}

.micro-btn.active {
  background: rgba(0, 255, 170, 0.2);
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
  box-shadow: 0 0 4px rgba(0, 255, 170, 0.3);
}
```

### Select Controls
```css
.micro-select {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid #333333;
  color: var(--text-primary);
  font-size: var(--font-size-xs);
  font-family: var(--font-mono);
  padding: 1px var(--spacing-xs);
  border-radius: var(--radius-sm);
  min-width: 20px;
  height: 16px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.micro-select:hover {
  border-color: var(--accent-cyan);
  background: rgba(0, 255, 170, 0.1);
}
```

### Toggle Controls
```css
.control-toggle {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-toggle.active {
  color: var(--accent-cyan);
  text-shadow: 0 0 4px var(--accent-cyan);
}

.control-toggle:hover {
  transform: scale(1.1);
}
```

## 🎭 Animation System

### Core Animations
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}
```

### Animation Classes
```css
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease forwards;
}

.animate-slide-in-left {
  animation: slideInLeft 0.4s ease forwards;
}

.animate-slide-in-right {
  animation: slideInRight 0.4s ease forwards;
}

.animate-pulse {
  animation: pulse 2s infinite;
}

.animate-blink {
  animation: blink 1s infinite;
}
```

## 📊 Status Indicator System

### Status Dots
```css
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-dot.scanning {
  background: var(--accent-cyan);
  box-shadow: 0 0 4px var(--accent-cyan);
}

.status-dot.error {
  background: var(--accent-red);
  box-shadow: 0 0 4px var(--accent-red);
}

.status-dot.success {
  background: var(--accent-green);
  box-shadow: 0 0 4px var(--accent-green);
}
```

### Activity Indicators
```css
.activity-indicator {
  font-size: 8px;
  animation: pulse 2s infinite;
}

.activity-indicator[data-status="active"] { color: #00ff41; }
.activity-indicator[data-status="idle"] { color: #ff9500; }
.activity-indicator[data-status="stale"] { color: #ff0040; }
```

### Progress Bars
```css
.metric-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: var(--spacing-xs);
}

.metric-fill {
  height: 100%;
  background: var(--accent-cyan);
  border-radius: 2px;
  transition: width 0.3s ease;
}
```

## 🎨 Theme Variations

### Dark Theme (Default)
```css
.theme-dark {
  --primary-bg: #000000;
  --secondary-bg: #0a0a0a;
  --tertiary-bg: #151515;
  --text-primary: #ffffff;
  --text-secondary: #b0b0b0;
  --text-muted: #666666;
}
```

### Night Theme
```css
.theme-night {
  --primary-bg: #0a0a0a;
  --secondary-bg: #151515;
  --tertiary-bg: #202020;
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0a0;
  --text-muted: #606060;
}
```

### Combat Theme
```css
.theme-combat {
  --primary-bg: #000000;
  --secondary-bg: #001100;
  --tertiary-bg: #002200;
  --accent-cyan: #00ff41;
  --text-primary: #00ff41;
  --text-secondary: #00aa33;
  --text-muted: #006622;
}
```

## 🔍 Ultra-Narrow Header Framework

### Header Container
```css
.tactical-header-ultra {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: linear-gradient(90deg, #000000 0%, #0a0a0a 50%, #000000 100%);
  border-bottom: 1px solid #333333;
  height: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}

.header-primary-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 var(--spacing-sm);
  font-family: var(--font-mono);
  font-size: var(--font-size-xs);
}
```

### Brand Micro
```css
.brand-micro {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.brand-icon-micro {
  width: 16px;
  height: 16px;
  filter: grayscale(100%) contrast(200%) brightness(1.5);
}

.brand-text-micro {
  color: #ffffff;
  font-weight: bold;
  letter-spacing: 1px;
}
```

### Search Micro
```css
.search-micro {
  flex: 1;
  max-width: 200px;
  margin: 0 var(--spacing-md);
}

.search-form-micro {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #333333;
  border-radius: var(--radius-sm);
  height: 18px;
  overflow: hidden;
}

.search-input-micro {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #ffffff;
  font-size: var(--font-size-xs);
  font-family: var(--font-mono);
  padding: 0 var(--spacing-sm);
  height: 100%;
}
```

## 📱 Responsive Framework

### Breakpoint System
```css
/* Desktop First Approach */
:root {
  --breakpoint-xl: 1200px;
  --breakpoint-lg: 992px;
  --breakpoint-md: 768px;
  --breakpoint-sm: 576px;
  --breakpoint-xs: 480px;
}

/* Responsive Utilities */
@media (max-width: 768px) {
  .hide-mobile { display: none; }
  .show-mobile { display: block; }
}

@media (max-width: 480px) {
  .hide-ultra-mobile { display: none; }
  .show-ultra-mobile { display: block; }
}
```

### Grid Responsiveness
```css
@media (max-width: 768px) {
  .tactical-grid {
    grid-template-areas: 
      "center"
      "left"
      "right";
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }
  
  .tactical-sidebar-container {
    order: 3;
  }
}
```

## 🎯 Utility Classes

### Spacing Utilities
```css
.p-xs { padding: var(--spacing-xs); }
.p-sm { padding: var(--spacing-sm); }
.p-md { padding: var(--spacing-md); }
.m-xs { margin: var(--spacing-xs); }
.m-sm { margin: var(--spacing-sm); }
.m-md { margin: var(--spacing-md); }
```

### Typography Utilities
```css
.text-xs { font-size: var(--font-size-xs); }
.text-sm { font-size: var(--font-size-sm); }
.text-md { font-size: var(--font-size-md); }
.font-mono { font-family: var(--font-mono); }
.font-tactical { font-family: var(--font-tactical); }
.font-bold { font-weight: bold; }
.letter-spacing-1 { letter-spacing: 1px; }
.uppercase { text-transform: uppercase; }
```

### Color Utilities
```css
.text-primary { color: var(--text-primary); }
.text-secondary { color: var(--text-secondary); }
.text-muted { color: var(--text-muted); }
.text-accent { color: var(--accent-cyan); }
.text-success { color: var(--accent-green); }
.text-warning { color: var(--accent-orange); }
.text-error { color: var(--accent-red); }
```

## 🔧 Performance Optimizations

### CSS Architecture
```css
/* Use CSS containment for performance */
.tactical-module {
  contain: layout style paint;
}

/* GPU acceleration for animations */
.animate-slide-in-left,
.animate-slide-in-right,
.animate-fade-in-up {
  will-change: transform, opacity;
  transform: translateZ(0);
}

/* Efficient transitions */
.transition-fast {
  transition: all 0.1s ease;
}

.transition-normal {
  transition: all 0.2s ease;
}

.transition-slow {
  transition: all 0.3s ease;
}
```

### Critical CSS Loading
```css
/* Above-the-fold critical styles */
.tactical-header-ultra,
.tactical-grid,
.tactical-module {
  /* Critical layout styles loaded first */
}

/* Non-critical styles loaded asynchronously */
@media print {
  /* Print styles loaded only when needed */
}
```

## 📊 Accessibility Features

### Focus Management
```css
.micro-btn:focus,
.micro-select:focus,
.control-toggle:focus {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 1px;
}
```

### High Contrast Support
```css
@media (prefers-contrast: high) {
  :root {
    --accent-cyan: #00ffff;
    --accent-green: #00ff00;
    --accent-red: #ff0000;
    --text-primary: #ffffff;
    --primary-bg: #000000;
  }
}
```

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

*The Tactical UI CSS Framework provides a comprehensive, performance-optimized foundation for building command center interfaces with maximum space efficiency and professional cyber aesthetics.*
