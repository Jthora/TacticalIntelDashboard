# CSS Troubleshooting & Developer Reference

## 🚨 Common Issues & Solutions

### **Issue 1: Styles Not Loading**

**Symptoms:**
- Component appears unstyled
- Missing tactical theme colors
- Layout breaks

**Troubleshooting Steps:**
```bash
# 1. Check if CSS file exists
ls -la src/assets/styles/components/[component-name].css

# 2. Verify import in all-components.css
grep "[component-name]" src/assets/styles/all-components.css

# 3. Check browser dev tools for 404 errors
# Network tab should show CSS files loading successfully
```

**Solution:**
```css
/* Add missing import to all-components.css */
@import url('./components/your-component.css');
```

### **Issue 2: CSS Variables Not Working**

**Symptoms:**
- Colors appear as fallback values
- Spacing inconsistent
- `var()` not resolving

**Root Causes:**
```css
/* ❌ Variable not defined */
.component { color: var(--undefined-color); }

/* ❌ Typo in variable name */
.component { color: var(--accent-cian); } /* should be --accent-cyan */

/* ❌ Variable defined in wrong scope */
.component { --local-var: #fff; }
.other { color: var(--local-var); } /* not accessible */
```

**Solution:**
```css
/* ✅ Check variables.css is loaded first */
/* ✅ Verify variable names exactly */
/* ✅ Use browser dev tools to inspect computed values */

.component {
  color: var(--accent-cyan, #00ffaa); /* fallback for safety */
}
```

### **Issue 3: Import Order Conflicts**

**Symptoms:**
- Styles being overridden unexpectedly
- CSS specificity issues
- Inconsistent appearance across components

**Debugging:**
```bash
# Check import order in main files
grep -n "@import" src/assets/styles/tactical-ui.css
grep -n "@import" src/assets/styles/all-components.css
```

**Correct Import Order:**
```css
/* 1. Base foundation (lowest specificity) */
@import url('./base/variables.css');
@import url('./base/fonts.css');
@import url('./base/reset.css');

/* 2. Framework patterns */
@import url('./modules/layout-framework.css');
@import url('./modules/tactical-framework.css');

/* 3. Components (medium specificity) */
@import url('./components/buttons.css');
@import url('./components/forms.css');

/* 4. Themes (highest specificity) */
@import url('./themes/module-themes.css');
```

### **Issue 4: Responsive Layout Breaking**

**Symptoms:**
- Layout collapses on mobile
- Grid items overlapping
- Horizontal scroll appearing

**Debug Commands:**
```css
/* Add temporary debugging styles */
.tactical-dashboard {
  border: 2px solid red !important;
}

.tactical-dashboard > * {
  border: 1px solid yellow !important;
}
```

**Solution:**
```css
/* Check grid template areas match grid structure */
.tactical-dashboard {
  grid-template-areas: 
    "header header header"      /* 3 columns */
    "sidebar-left main sidebar-right"  /* must match */
    "quickactions quickactions quickactions"; /* 3 columns */
  grid-template-columns: 280px 1fr 320px; /* 3 columns total */
}

/* Add mobile-first breakpoints */
@media (max-width: 768px) {
  .tactical-dashboard {
    grid-template-areas: 
      "header"
      "main"
      "quickactions";
    grid-template-columns: 1fr;
  }
}
```

---

## 🔍 Performance Debugging

### **Check CSS File Sizes**
```bash
# Get file sizes for optimization
find src/assets/styles -name "*.css" -exec wc -l {} + | sort -n

# Identify largest files that might need splitting
du -h src/assets/styles/*.css | sort -hr

# Check total CSS bundle size
du -sh src/assets/styles/
```

### **Unused CSS Detection**
```bash
# Install PurgeCSS for unused style detection (if not already installed)
npm install --save-dev @fullhuman/postcss-purgecss

# Create postcss.config.js for CSS purging
echo "module.exports = {
  plugins: [
    require('@fullhuman/postcss-purgecss')({
      content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
    })
  ]
}" > postcss.config.js
```

### **CSS Specificity Conflicts**
```css
/* Use browser dev tools to check computed styles */
/* Look for crossed-out styles indicating conflicts */

/* Specificity calculator:
   IDs: 100 points
   Classes: 10 points
   Elements: 1 point */

/* ❌ Too specific - hard to override */
.tactical-dashboard .sidebar .control-group .btn.active {
  color: red;
}

/* ✅ Appropriate specificity */
.btn.active {
  color: var(--accent-cyan);
}
```

---

## 🛠️ Development Workflows

### **Adding New Component CSS**

**Step 1: Create Component File**
```bash
# Create new component CSS file
touch src/assets/styles/components/my-new-component.css
```

**Step 2: Follow Template Structure**
```css
/* ===========================================
   MY NEW COMPONENT
   =========================================== */

.my-component {
  /* Use design tokens */
  background: var(--primary-bg);
  border: 1px solid var(--accent-cyan);
  padding: var(--spacing-sm) var(--spacing-md);
  
  /* Follow tactical patterns */
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.my-component-header {
  background: rgba(0, 255, 170, 0.1);
  border-bottom: 1px solid rgba(0, 255, 170, 0.3);
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  color: var(--text-muted);
}

.my-component-content {
  padding: var(--spacing-sm);
}

/* State variations */
.my-component.active {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 8px rgba(0, 255, 170, 0.3);
}

.my-component.disabled {
  opacity: 0.5;
  pointer-events: none;
}

/* Responsive behavior */
@media (max-width: 768px) {
  .my-component {
    padding: var(--spacing-xs);
  }
}
```

**Step 3: Add Import**
```css
/* Add to all-components.css */
@import url('./components/my-new-component.css');
```

**Step 4: Test Component**
```tsx
// Test in React component
<div className="my-component active">
  <div className="my-component-header">
    Component Title
  </div>
  <div className="my-component-content">
    Component content here
  </div>
</div>
```

### **Creating Theme Variations**

**Theme File Structure:**
```css
/* themes/my-theme/component-overrides.css */

/* Override specific components for theme */
.my-component {
  /* Theme-specific colors */
  border-color: var(--theme-accent, var(--accent-cyan));
  background: var(--theme-bg, var(--primary-bg));
}

/* Theme-specific patterns */
.theme-my-theme .tactical-module {
  border-radius: var(--radius-xl);
  backdrop-filter: blur(20px);
}
```

### **Debugging CSS Cascade Issues**

**Browser Dev Tools Workflow:**
1. **Inspect Element**: Right-click → Inspect
2. **Check Computed Styles**: See final applied values
3. **Look for Overrides**: Crossed-out styles show conflicts
4. **Test Changes**: Edit styles in browser to test fixes

**CSS Debugging Utilities:**
```css
/* Temporary debugging classes */
.debug-border * { border: 1px solid red !important; }
.debug-grid { 
  background: repeating-linear-gradient(
    0deg,
    transparent 0px 9px,
    rgba(255,0,0,0.1) 9px 10px
  );
}

/* Layout debugging */
.debug-layout {
  position: relative;
}

.debug-layout::after {
  content: attr(class);
  position: absolute;
  top: 0;
  left: 0;
  background: rgba(255,255,0,0.8);
  color: black;
  font-size: 10px;
  padding: 2px;
  z-index: 1000;
}
```

---

## 📋 CSS Code Quality Checklist

### **Before Committing CSS:**

**✅ Design Token Usage**
```css
/* ✅ Good - uses design tokens */
.component {
  color: var(--text-primary);
  padding: var(--spacing-sm);
  font-size: var(--font-size-md);
}

/* ❌ Bad - hardcoded values */
.component {
  color: #ffffff;
  padding: 2px;
  font-size: 12px;
}
```

**✅ Naming Convention**
```css
/* ✅ Good - follows BEM-like pattern */
.tactical-module { }
.tactical-module__header { }
.tactical-module__content { }
.tactical-module--active { }

/* ❌ Bad - unclear naming */
.module { }
.header { }
.content { }
.active { }
```

**✅ Responsive Design**
```css
/* ✅ Good - mobile-first approach */
.component {
  padding: var(--spacing-xs);
}

@media (min-width: 768px) {
  .component {
    padding: var(--spacing-md);
  }
}

/* ❌ Bad - desktop-first, no mobile consideration */
.component {
  padding: var(--spacing-lg);
}
```

**✅ Browser Compatibility**
```css
/* ✅ Good - includes fallbacks */
.component {
  background: #000;
  background: var(--primary-bg);
  backdrop-filter: blur(10px);
  /* Fallback for older browsers */
  background: rgba(0,0,0,0.9);
}

/* ❌ Bad - no fallbacks */
.component {
  background: var(--primary-bg);
  backdrop-filter: blur(10px);
}
```

### **Performance Checks:**

**✅ Selector Performance**
```css
/* ✅ Good - low specificity, good performance */
.btn-primary { }

/* ❌ Bad - high specificity, poor performance */
div.container ul.nav li.item a.btn.primary { }
```

**✅ Animation Performance**
```css
/* ✅ Good - animates transform/opacity (GPU-accelerated) */
.component {
  transform: translateX(0);
  transition: transform 0.3s ease;
}

.component.active {
  transform: translateX(10px);
}

/* ❌ Bad - animates layout properties */
.component {
  left: 0;
  transition: left 0.3s ease;
}

.component.active {
  left: 10px;
}
```

---

## 🚀 Quick Reference Commands

### **File Operations**
```bash
# Find all CSS files
find . -name "*.css" -type f

# Search for CSS class usage
grep -r "class-name" src/

# Find large CSS files (>500 lines)
find src/assets/styles -name "*.css" -exec wc -l {} + | awk '$1 > 500'

# Count total lines of CSS
find src/assets/styles -name "*.css" -exec cat {} + | wc -l
```

### **CSS Validation**
```bash
# Install CSS validator (if not already installed)
npm install -g css-validator

# Validate CSS file
css-validator src/assets/styles/tactical-ui.css

# Check for CSS syntax errors
npx stylelint "src/assets/styles/**/*.css"
```

### **Development Server**
```bash
# Start development server with CSS hot reload
npm run dev

# Build production CSS bundle
npm run build

# Analyze CSS bundle size
npm run build -- --analyze
```

This troubleshooting guide should help developers quickly identify and resolve common CSS issues in the Tactical Intel Dashboard project.
