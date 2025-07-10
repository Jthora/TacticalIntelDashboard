# Tactical Intel Dashboard UI Superstructure

This document serves as the canonical reference for the Tactical Intel Dashboard UI architecture, defining the organization of routes, pages, screens, and components to ensure consistency across the application.

## Core Architecture Principles

1. **Persistent Header with Routed Navigation**: The application maintains a consistent header throughout user navigation, with key features accessible via proper routes rather than modals.

2. **Clear Separation of Concerns**:
   - **Layouts**: Define the overall structure containing shared UI elements
   - **Pages**: Top-level routed views that represent major application sections
   - **Screens**: Sub-sections within pages, often accessed via tabs or sub-navigation
   - **Components**: Reusable UI elements that compose pages and screens

3. **Preservation of Visual Style**: The UI superstructure provides architectural organization without modifying the established visual language of the application.

## Directory Structure

```
src/
├── layouts/        # Layout components that define page structure
├── pages/          # Top-level routed views
├── components/     # Reusable UI components
│   ├── common/     # Shared components used across multiple pages
│   ├── header/     # Header-related components
│   ├── settings/   # Settings-related components
│   │   └── tabs/   # Individual setting screen components
│   └── web3/       # Web3 authentication components
├── routes/         # Route definitions
└── assets/
    └── styles/     # CSS styles
        ├── main.css          # Main stylesheet imports
        └── layout.css        # Layout-specific styles
```

## Routing Structure

The application uses React Router with a nested routing approach:

```jsx
<Routes>
  <Route path="/" element={<MainLayout />}>
    <Route index element={<HomePage />} />
    <Route path="feed" element={<FeedPage />} />
    <Route path="settings" element={<SettingsPage />}>
      <Route index element={<Navigate to="/settings/general" replace />} />
      <Route path=":tab" element={<SettingsTabRouter />} />
    </Route>
    <Route path="web3login" element={<Web3LoginPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Route>
</Routes>
```

## Layout System

The `MainLayout` component serves as the primary layout container, providing:

1. A persistent header with navigation elements
2. An outlet for rendering routed content
3. Consistent spacing and structure across all pages

```jsx
// MainLayout.tsx (simplified)
const MainLayout = () => (
  <div className="app-container">
    <Header />
    <main className="main-content">
      <Outlet />
    </main>
  </div>
);
```

## Page and Screen Organization

### Pages
Pages are top-level routed components that represent major sections of the application:

- `HomePage`: The dashboard landing page
- `FeedPage`: Intelligence feed display
- `SettingsPage`: Contains settings tabs and sub-navigation
- `Web3LoginPage`: Authentication page for Web3 login

### Screens
Screens are sub-sections within pages, often accessed via tabs:

- Settings screens: `GeneralSettings`, `CORSSettings`, `AccountSettings`, etc.

## Navigation Patterns

1. **Primary Navigation**: Through the header links, directing to main pages
2. **Secondary Navigation**: Through tabs within pages (e.g., settings tabs)
3. **Tertiary Navigation**: Through contextual links and buttons within screens

## Key Changes from Previous Architecture

1. **Modal to Routed Pages**: Settings and Web3 login are now accessible via proper routes instead of modals
2. **Persistent Header**: Header is maintained across all pages through the layout system
3. **Clear Component Hierarchy**: Established clear distinctions between layouts, pages, screens, and components

## Development Guidelines

1. **Adding New Pages**:
   - Create a new component in the `pages` directory
   - Add a new route in `AppRoutes.tsx`
   - Use the established page structure with proper semantic elements

2. **Adding New Settings Screens**:
   - Create a new component in `components/settings/tabs`
   - Add the tab to the tabs array in `SettingsPage.tsx`
   - Create a route for the tab in the settings route configuration

3. **Styling Guidelines**:
   - **DO NOT modify the existing visual style** - the superstructure is about organization, not visual redesign
   - Use the existing CSS variables for colors, fonts, and spacing
   - Layout-specific styles should go in `layout.css`
   - Component-specific styles should use the established pattern for that component type

4. **Header Integration**:
   - New header items should use the navigation pattern, not modal triggers
   - Maintain consistency with existing header design and functionality

## Preserving Visual Integrity

This architectural refactoring is specifically designed to improve code organization and navigation flow without altering the established visual language of the Tactical Intel Dashboard. When implementing new features:

1. Do not override existing color schemes, typography, or spacing
2. Use the existing CSS variables and design tokens
3. Maintain the current visual hierarchy and information density
4. Adhere to the established UI patterns for consistency

## Future Enhancements

Future development should maintain this architectural approach while considering:

1. Adding more sophisticated route guards for authenticated routes
2. Implementing route-based code splitting for performance optimization
3. Enhancing sub-navigation patterns for deeply nested content

---

This document serves as the authoritative reference for the UI superstructure. All UI development should conform to these guidelines to maintain consistency and preserve the established visual language of the Tactical Intel Dashboard.
