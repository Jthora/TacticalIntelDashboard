# Tactical UI Style Guide

## 🎯 Design Philosophy

The Tactical Intel Dashboard follows a **micro-interface** design philosophy with extreme compactness, high information density, and immediate visual clarity. Every pixel serves a purpose, every element is optimized for rapid decision-making.

## 🏗 Core Architecture Patterns

### 1. Module-Based Structure
```css
.module-container {
  /* Tactical modules follow this base pattern */
  background: rgba(0, 15, 15, 0.95);
  border: 1px solid rgba(0, 255, 170, 0.2);
  border-radius: var(--radius-sm);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}
```

### 2. Control Group Pattern
```typescript
<div className="control-group">
  <label className="control-label">LABEL</label>
  <element className="control-element">VALUE</element>
</div>
```

### 3. Grid-Based Layouts
```css
.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: var(--spacing-sm);
}
```

## 🎨 Visual Language

### Typography Hierarchy
- **Labels**: `var(--font-size-xs)` (8px) - ALL CAPS, muted color
- **Values**: `var(--font-size-sm)` (10px) - Bright accent color
- **Headers**: `var(--font-size-md)` (12px) - High contrast
- **Primary**: `var(--font-size-lg)` (14px) - Main content

### Color System
```css
/* Control States */
--control-inactive: rgba(176, 176, 176, 0.3);
--control-active: var(--accent-cyan);
--control-hover: rgba(0, 255, 170, 0.6);
--control-disabled: rgba(102, 102, 102, 0.5);

/* Semantic Colors */
--status-operational: #00ff41;
--status-warning: #ff9500;
--status-critical: #ff0040;
--status-offline: #666666;
```

### Spacing Philosophy
- **Ultra-minimal**: 1-4px for most elements
- **Compact grids**: 2-3px gaps
- **Module separation**: 3-4px margins
- **Dense information**: Maximum data per viewport

## 🔬 Ultra-Compact Specifications

### Reliability Rating System
Intelligence reliability uses the standard A-F letter grade system:
- **A**: Completely reliable (9-10 rating)
- **B**: Usually reliable (8 rating)  
- **C**: Fairly reliable (7 rating)
- **D**: Not usually reliable (6 rating)
- **E**: Unreliable (5 rating)
- **F**: Cannot be judged (1-4 rating)

### Ultra-Compact Dimensions
- **List Item Height**: 18px minimum (50% reduction from standard)
- **Badge Size**: 6px font, 8px line-height, 0-2px padding
- **Status Dot**: 4px diameter (vs 6px standard)
- **Margins**: 1px between items (vs 3-4px standard)
- **Padding**: 2-4px internal spacing (vs 6-8px standard)

### Tactical Scrollbar
```css
/* Custom tactical scrollbar */
.intel-sources-list::-webkit-scrollbar {
  width: 4px;
}
.intel-sources-list::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 170, 0.5);
  border-radius: var(--radius-sm);
}
```

### Micro-Typography
- **Source Names**: 8px (--font-size-xs), monospace, cyan accent
- **Status Text**: 6px, color-coordinated with status dot
- **Badges**: 6px, ultra-compact, no borders
- **Icons**: 6px maximum, optimized opacity

## 🎛 Control Patterns

### 1. Label-Value Pairs
```tsx
<div className="control-group">
  <span className="control-label">VIEW:</span>
  <select className="control-select">
    <option>GRID</option>
  </select>
</div>
```

**Styling Rules:**
- Labels: 8px, all caps, muted gray
- Values: 10px, bright accent color
- Minimal spacing (2-3px between elements)

### 2. Toggle Buttons
```tsx
<button className={`control-toggle ${isActive ? 'active' : ''}`}>
  <span className="toggle-icon">⚡</span>
  <span className="toggle-label">ACTIVE</span>
</button>
```

**Visual States:**
- Inactive: Gray border, muted text
- Active: Cyan border + glow, bright text
- Hover: Increased glow intensity

### 3. Icon-Label Buttons
```tsx
<button className="action-btn-micro">
  <span className="btn-icon">📊</span>
  <span className="btn-label">METRICS</span>
</button>
```

### 4. Grid Selectors
```tsx
<div className="selector-grid">
  <button className="grid-btn active">JSON</button>
  <button className="grid-btn">CSV</button>
  <button className="grid-btn">XML</button>
  <button className="grid-btn">PDF</button>
</div>
```

## 📊 Micro-Interface Components

### Control Groups
```css
.control-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-height: 16px;
}

.control-label {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  font-weight: 600;
  letter-spacing: 0.5px;
  min-width: fit-content;
}

.control-select {
  font-size: var(--font-size-sm);
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(0, 255, 170, 0.3);
  color: var(--accent-cyan);
  padding: 1px 4px;
  border-radius: var(--radius-sm);
}
```

### Toggle Systems
```css
.control-toggle {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: transparent;
  border: 1px solid rgba(176, 176, 176, 0.3);
  padding: 2px 4px;
  font-size: var(--font-size-xs);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.control-toggle.active {
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
  box-shadow: var(--glow-cyan);
}

.toggle-icon {
  font-size: var(--font-size-sm);
}

.toggle-label {
  font-weight: 600;
  letter-spacing: 0.3px;
}
```

### Grid Patterns
```css
.micro-grid {
  display: grid;
  gap: var(--spacing-sm);
  margin: var(--spacing-sm) 0;
}

.grid-2x2 { grid-template-columns: 1fr 1fr; }
.grid-3x1 { grid-template-columns: repeat(3, 1fr); }
.grid-4x1 { grid-template-columns: repeat(4, 1fr); }
.grid-auto { grid-template-columns: repeat(auto-fit, minmax(60px, 1fr)); }
```

### Badge System - Bright Border, Dark Center Design
All status badges follow a consistent visual pattern with bright colored borders and dark centers for maximum readability and professional appearance:

```css
/* Badge Pattern */
.tactical-badge {
  background: rgba(0, 0, 0, 0.8) !important;
  border: 2px solid;
  border-color: var(--badge-color, rgba(255, 255, 255, 0.6));
  cursor: help;
  transition: all 0.2s ease;
}

.tactical-badge:hover {
  border-color: var(--badge-color, rgba(255, 255, 255, 0.9));
  box-shadow: 0 0 6px var(--badge-color, rgba(255, 255, 255, 0.3));
}
```

**Badge Types:**
- **Classification**: Security levels with appropriate color coding and detailed tooltips
- **Category**: Intelligence category with descriptive tooltips
- **Reliability**: A-F grade system with reliability percentage in tooltips
- **Status**: Operational state indicators

**Tooltip Implementation:**
All badges include descriptive tooltips accessed via the `title` attribute, providing context without cluttering the interface.

## 🚀 Implementation Examples

### Intel Sources Control Panel
```tsx
// GOOD - Follows established patterns
<div className="intel-controls-section">
  <div className="controls-grid">
    <div className="control-group">
      <span className="control-label">VIEW:</span>
      <select className="control-select">
        <option>GRID</option>
      </select>
    </div>
    <div className="control-group">
      <span className="control-label">SORT:</span>
      <select className="control-select">
        <option>CATEGORY</option>
      </select>
    </div>
  </div>
  <div className="action-buttons-grid">
    <button className="control-toggle active">
      <span className="toggle-icon">⚡</span>
      <span className="toggle-label">ACTIVE</span>
    </button>
  </div>
</div>
```

### Export Module
```tsx
// GOOD - Compact grid with clear hierarchy
<div className="export-module">
  <div className="module-header">EXPORT</div>
  <div className="format-grid">
    <button className="format-btn json">JSON</button>
    <button className="format-btn csv">CSV</button>
    <button className="format-btn xml">XML</button>
    <button className="format-btn pdf">PDF</button>
  </div>
  <div className="options-grid">
    <div className="option-row">
      <span className="option-label">INCLUDE METADATA</span>
      <button className="option-toggle active">◉</button>
    </div>
  </div>
</div>
```

## ⚠️ Anti-Patterns

### ❌ Avoid These Patterns
```tsx
// TOO SPACIOUS - Wastes precious screen real estate
<div style={{padding: '20px', margin: '15px'}}>
  <h3>Big Header</h3>
  <p>Verbose description text</p>
</div>

// TOO VERBOSE - Labels should be concise
<label>Please Select Your Preferred View Mode:</label>

// INCONSISTENT SIZING - Stick to the micro-scale
<button style={{fontSize: '16px', padding: '12px'}}>
  Large Button
</button>
```

### ✅ Correct Patterns
```tsx
// COMPACT - Maximum information density
<div className="control-group">
  <span className="control-label">VIEW:</span>
  <select className="control-select">
    <option>GRID</option>
  </select>
</div>

// CONCISE - Direct, tactical language
<span className="control-label">SORT:</span>

// MICRO-SCALE - Optimized for space efficiency
<button className="control-toggle">
  <span className="toggle-icon">⚡</span>
  <span className="toggle-label">ACTIVE</span>
</button>
```

## 🎯 Key Principles

1. **Micro-Interface First**: Design for maximum information density
2. **Consistent Hierarchy**: Labels, values, actions follow established patterns  
3. **Semantic Color**: Operational=green, Warning=orange, Critical=red
4. **Tactical Language**: ALL CAPS, abbreviated terms, military precision
5. **Grid-Based Layout**: Organized, scannable, predictable structure
6. **Hover Feedback**: Subtle glow effects for interactive elements
7. **Icon + Text**: Visual + textual information for rapid recognition
8. **State Indication**: Clear active/inactive visual differentiation

## 📏 CSS Class Naming Convention

```css
/* Module Containers */
.module-[name] { /* Main module wrapper */ }
.module-header { /* Module title/header */ }
.module-content { /* Module body content */ }

/* Control Groups */
.control-group { /* Label + control wrapper */ }
.control-label { /* All caps, muted labels */ }
.control-select { /* Dropdown selectors */ }
.control-toggle { /* Toggle buttons */ }

/* Grid Systems */
.[name]-grid { /* Grid container */ }
.grid-[cols]x[rows] { /* Specific grid layouts */ }
.grid-auto { /* Auto-fit grids */ }

/* Micro Components */
.[prefix]-btn-micro { /* Tiny action buttons */ }
.[prefix]-indicator-micro { /* Status indicators */ }
.[prefix]-metric-micro { /* Data display elements */ }
```

This style guide ensures consistency across all tactical interface elements and maintains the professional, high-density information design that makes the dashboard effective for rapid decision-making.
