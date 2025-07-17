# Dropdown Background Fix - Dark Gunmetal Theme

## Problem
The dropdown controls (VIEW, SORT, FILTER) had bright white backgrounds that were too bright and jarring for the tactical dark theme interface.

## Solution Implemented
Changed all dropdown backgrounds from bright white/transparent to a dark gunmetal color scheme that matches the tactical theme:

### Main Dropdown Styling
```css
.intel-select {
  background: #2a2d3a; /* Dark gunmetal background */
  /* ...other styles remain the same... */
}
```

### Dropdown Options Styling
Added specific styling for dropdown options to ensure they also use the dark theme:
```css
.intel-select option {
  background: #2a2d3a; /* Dark gunmetal background */
  color: var(--accent-cyan);
  font-family: var(--font-mono);
  font-weight: 500;
  padding: 2px 4px;
}
```

### Interactive States
Updated hover and focus states to use slightly lighter gunmetal instead of bright overlays:
```css
.intel-select:hover,
.intel-select:focus {
  background: #3a3f4f; /* Slightly lighter gunmetal */
  /* ...maintains cyan glow and border... */
}
```

## Color Palette Used
- **Base**: `#2a2d3a` (Dark gunmetal)
- **Hover/Focus**: `#3a3f4f` (Lighter gunmetal)
- **Text**: `var(--accent-cyan)` (Cyan for readability)
- **Border**: `rgba(0, 255, 170, 0.3)` (Subtle cyan border)

## Result
✅ **Perfect Theme Integration**: Dropdowns now seamlessly blend with the tactical dark interface
✅ **Consistent Appearance**: All three dropdowns (VIEW, SORT, FILTER) have matching dark backgrounds
✅ **Maintained Readability**: Cyan text on dark gunmetal provides excellent contrast
✅ **Subtle Interactivity**: Hover states provide visual feedback without being jarring
✅ **Professional Look**: Gives the interface a cohesive, military-grade appearance

## File Modified
- `/src/assets/styles/tactical-ui.css` - Updated `.intel-select` and added `.intel-select option` styling

The Intel Sources control panel now has a perfectly integrated dark theme that maintains the tactical aesthetic throughout all interface elements.
