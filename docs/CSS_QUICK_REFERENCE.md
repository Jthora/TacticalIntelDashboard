# CSS Quick Reference Guide

## 🚀 Getting Started

### Import Strategy
```typescript
// For new components, use the modular system:
import './assets/styles/tactical-ui-modular.css';

// For comprehensive imports:
import './assets/styles/all-components.css';
```

### File Location Rules
```
📁 Where to put your CSS:

🆕 New component? → /components/[component-name].css
🎨 Theme variant? → /themes/[theme-name]/
🏗️ Layout system? → /modules/
⚙️ Global utility? → /base/
📄 Page-specific? → /pages/
```

## 🎨 Essential Design Tokens

### Spacing (Micro-Scale)
```css
var(--spacing-xs)   /* 1px - ultra-tight */
var(--spacing-sm)   /* 2px - compact */
var(--spacing-md)   /* 3px - standard */
var(--spacing-lg)   /* 4px - loose */
```

### Typography Scale
```css
var(--font-size-xs)  /* 8px  - labels */
var(--font-size-sm)  /* 10px - values */
var(--font-size-md)  /* 12px - content */
var(--font-size-lg)  /* 14px - headers */
```

### Colors (Tactical Palette)
```css
var(--accent-cyan)      /* #00ffaa - primary accent */
var(--text-primary)     /* #ffffff - main text */
var(--text-muted)       /* #666666 - labels */
var(--status-operational) /* #00ff41 - success */
var(--status-warning)   /* #ff9500 - attention */
var(--status-critical)  /* #ff0040 - danger */
```

## 🏗️ Component Patterns

### Standard Control Group
```tsx
<div className="control-group">
  <span className="control-label">LABEL:</span>
  <select className="control-select">
    <option>VALUE</option>
  </select>
</div>
```

### Toggle Button
```tsx
<button className={`control-toggle ${active ? 'active' : ''}`}>
  <span className="toggle-icon">⚡</span>
  <span className="toggle-label">STATUS</span>
</button>
```

### Status Badge
```tsx
<span 
  className="tactical-badge"
  style={{'--badge-color': 'var(--accent-cyan)'}}
  title="Detailed tooltip description"
>
  A
</span>
```

### Micro Grid
```tsx
<div className="micro-grid grid-2x2">
  <button className="grid-btn">JSON</button>
  <button className="grid-btn">CSV</button>
  <button className="grid-btn">XML</button>
  <button className="grid-btn">PDF</button>
</div>
```

## 🎯 CSS Classes Cheat Sheet

### Layout Classes
```css
.tactical-dashboard     /* Main grid layout */
.tactical-module       /* Module container */
.tactical-header       /* Module header */
.tactical-content      /* Module content */
```

### Control Classes
```css
.control-group         /* Label + control wrapper */
.control-label         /* Muted, uppercase labels */
.control-select        /* Dropdown styling */
.control-toggle        /* Toggle button base */
.control-toggle.active /* Active toggle state */
```

### Grid Classes
```css
.micro-grid           /* Base grid container */
.grid-2x2            /* 2 columns, 2 rows */
.grid-auto           /* Auto-fit columns */
.controls-grid       /* Control-specific grid */
```

### Typography Classes
```css
.text-xs .text-sm .text-md .text-lg  /* Size utilities */
.text-primary .text-secondary .text-muted  /* Color utilities */
.font-bold .font-semibold .font-normal     /* Weight utilities */
```

### Button Classes
```css
.btn                 /* Base button */
.btn-primary         /* Primary action */
.btn-secondary       /* Secondary action */
.btn-sm .btn-lg      /* Size variants */
.action-btn-micro    /* Ultra-compact button */
```

### Status Classes
```css
.status-operational  /* Green - all good */
.status-warning      /* Orange - attention */
.status-critical     /* Red - urgent */
.status-offline      /* Gray - inactive */
```

## 📏 Dimensions Guide

### Micro-Interface Standards
```css
/* Ultra-compact list items */
min-height: var(--list-item-height); /* 18px */

/* Micro badges */
font-size: var(--badge-font-size); /* 6px */
line-height: 8px;
padding: 0 2px;

/* Status indicators */
width: var(--status-dot-size); /* 4px */
height: var(--status-dot-size);

/* Minimal spacing */
margin: var(--micro-margin); /* 1px */
padding: var(--micro-padding); /* 2px */
```

## 🎨 Animation Utilities

### Available Animations
```css
.animate-pulse        /* Subtle pulsing glow */
.animate-slide-in-right /* Slide from right */
.animate-slide-in-left  /* Slide from left */
.animate-fade-in-up    /* Fade up entrance */
```

### Custom Glow Effects
```css
box-shadow: var(--glow-cyan);   /* Cyan glow */
box-shadow: var(--glow-green);  /* Green glow */
box-shadow: var(--glow-orange); /* Orange glow */
```

## ⚠️ Do's and Don'ts

### ✅ DO
```css
/* Use design tokens */
padding: var(--spacing-sm);
color: var(--text-primary);
font-size: var(--font-size-xs);

/* Follow naming conventions */
.control-group { }
.module-intelligence { }
.btn-primary { }

/* Use semantic classes */
.status-operational { }
.control-active { }
```

### ❌ DON'T
```css
/* Avoid magic numbers */
padding: 3px; /* Use var(--spacing-md) */

/* Avoid verbose naming */
.please-select-your-view-mode { }

/* Avoid inline styles for tokens */
style={{fontSize: '8px'}} /* Use className="text-xs" */

/* Avoid large spacing */
padding: 20px; /* Breaks micro-interface principle */
```

## 🔧 Quick Fixes

### Common Issues
```css
/* Text too small? */
font-size: var(--font-size-sm); /* Use next size up */

/* Element too spaced? */
gap: var(--spacing-xs); /* Use tighter spacing */

/* Need hover effect? */
.element:hover {
  border-color: var(--control-hover);
  box-shadow: var(--glow-cyan);
}

/* Missing active state? */
.element.active {
  color: var(--control-active);
  border-color: var(--control-active);
}
```

### Performance Tips
```css
/* Use CSS custom properties for dynamic values */
.dynamic-element {
  --element-color: var(--accent-cyan);
  color: var(--element-color);
}

/* Leverage existing utility classes */
<div className="text-xs text-muted"> /* Instead of custom CSS */

/* Import only what you need */
@import url('./components/buttons.css'); /* Specific imports */
```

## 📋 Component Checklist

When creating a new component:

- [ ] Created file in appropriate directory (`/components/`, `/modules/`, `/themes/`)
- [ ] Used design tokens instead of hardcoded values
- [ ] Followed tactical naming conventions (`.control-`, `.module-`, etc.)
- [ ] Implemented hover and active states
- [ ] Added to appropriate import file
- [ ] Tested in micro-interface context
- [ ] Documented any new patterns

## 🎯 File Import Priority

```css
/* Load order for optimal cascading */
1. base/fonts.css          /* Font assets first */
2. base/variables.css      /* Design tokens */
3. base/reset.css          /* Global baseline */
4. base/typography.css     /* Text utilities */
5. modules/*.css           /* Framework layer */
6. components/*.css        /* Component layer */
7. themes/*.css            /* Theme overrides */
8. pages/*.css             /* Page-specific last */
```

This quick reference provides immediate access to the most commonly used patterns, classes, and guidelines for working with the tactical UI system.
