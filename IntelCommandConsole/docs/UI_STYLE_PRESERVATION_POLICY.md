# UI STYLE PRESERVATION POLICY

## Core Principle

**DO NOT ALTER EXISTING UI STYLES** - The current visual design of the Tactical Intel Dashboard is intentional and should be preserved exactly as-is.

## Why This Matters

The Tactical Intel Dashboard's unique visual style is:
- Carefully crafted for specialized intelligence work
- Optimized for information density and rapid comprehension
- Part of the product's distinct identity and brand
- Preferred by current users who are familiar with the interface

## Implementation Guidelines

When developing new features or refactoring existing code:

1. **Use existing CSS variables** for colors, typography, and spacing
2. **Follow established component patterns** for consistency
3. **Do not override existing styles** unless fixing a clear visual bug
4. **Test all UI changes** against the current visual reference

## For New Components

When creating new UI elements:
- Study similar existing components first
- Reuse existing CSS classes wherever possible
- Match the exact visual language of surrounding elements
- Verify that new elements blend seamlessly with the existing UI

## Architecture vs. Visual Design

- Changes to the **application architecture** (routing, component organization, code structure) are encouraged
- Changes to the **visual presentation** (colors, spacing, typography, animations) are prohibited

## In Case of Doubt

If unsure about a potential UI change:
- Refer to existing similar components
- Take screenshots before and after to verify visual consistency
- Consult with the team before proceeding

---

This policy ensures we maintain a consistent, professional visual experience while allowing the application architecture to evolve and improve.
