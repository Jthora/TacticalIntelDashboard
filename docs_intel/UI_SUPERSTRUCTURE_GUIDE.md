# UI Superstructure Implementation Guide

This document outlines the architecture of the Tactical Intel Dashboard UI superstructure, which provides a consistent framework for navigation and user interface organization.

## Core Architecture

The UI superstructure is built around the following principles:

1. **Consistent Layout**: All pages share a common layout structure through the MainLayout component.
2. **Route-Based Navigation**: Features are accessed through proper routes rather than modals.
3. **Clear Component Hierarchy**: Distinct separation between layouts, pages, screens, and components.

## Component Hierarchy

### Layouts
- `MainLayout`: The primary layout that includes the header and main content area.
  - Located in: `src/layouts/MainLayout.tsx`
  - Contains: Header and Outlet for rendering page content

### Pages
Pages are top-level route components that represent major sections of the application:
- `HomePage`: The dashboard landing page
- `SettingsPage`: Contains settings tabs and configuration screens
- `FeedPage`: Displays feed content for a specific feed
- `Web3LoginPage`: Authentication page for Web3 login
- `NotFoundPage`: 404 page for non-existent routes

### Screens
Screens are sub-sections within pages, typically accessed via tabs or other sub-navigation:
- Settings screens: Each tab in the Settings page is a screen
  - `CORSSettings`: CORS configuration screen
  - Other settings tab screens

### Components
Reusable UI elements that compose pages and screens:
- `Header`: The persistent header for all pages
- `LeftSidebar`: The left sidebar component
- `RightSidebar`: The right sidebar component
- `CentralView`: The main content area for the homepage
- And many others...

## Routing Structure

The routing structure is defined in `AppRoutes.tsx` and follows this pattern:

```tsx
<Routes>
  <Route element={<MainLayout />}>
    <Route path="/" element={<HomePage />} />
    
    {/* Settings routes with nested tab routes */}
    <Route path="/settings" element={<SettingsPage />}>
      <Route index element={<Navigate to="/settings/general" replace />} />
      <Route path="general" element={<GeneralSettings />} />
      <Route path="cors" element={<CORSSettings />} />
      {/* Other settings tab routes */}
    </Route>
    
    {/* Other main routes */}
    <Route path="/feed/:id" element={<FeedPage />} />
    <Route path="/web3login" element={<Web3LoginPage />} />
    
    {/* Fallback route */}
    <Route path="*" element={<NotFoundPage />} />
  </Route>
</Routes>
```

## Visual Style Guidelines

**IMPORTANT**: The UI superstructure defines only the organization and navigation of the application. Do not modify the existing visual styles.

When working with the superstructure:
1. Use existing CSS classes and variables
2. Maintain the current visual design language
3. Follow established UI patterns
4. Do not override existing styles unless fixing a visual bug

## Adding New Features

### Adding a New Page
1. Create a new component in the `pages` directory
2. Add a route in `AppRoutes.tsx`
3. Use the existing design patterns

### Adding a New Settings Screen
1. Create a new component in `components/settings/tabs`
2. Add a route in `AppRoutes.tsx` under the `/settings` route
3. Ensure it's accessible through the settings tabs

## Navigation Patterns

1. **Primary Navigation**: Through links in the header
2. **Secondary Navigation**: Through tabs within pages (e.g., settings tabs)
3. **Contextual Navigation**: Through buttons and links within content areas

---

By following these guidelines, we ensure a consistent and maintainable UI structure while preserving the existing visual design that users are familiar with.
