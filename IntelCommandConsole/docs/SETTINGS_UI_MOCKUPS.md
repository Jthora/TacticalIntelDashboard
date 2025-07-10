# 🎨 SETTINGS UI MOCKUPS

## Header Settings Button

The settings button will be positioned in the header on the left side, providing quick access to the settings panel.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   ⚙️   │   Tactical Intelligence Dashboard                   🔔  👤  │
│        │                                                               │
└────────┴─────────────────────────────────────────────────────────────────┘
```

### Button States

| State | Description | Visual |
|-------|-------------|--------|
| Default | Standard appearance | ⚙️ |
| Hover | Slight rotation effect | ⚙️ (rotated) |
| Active | Pressed state | ⚙️ (smaller) |
| Has Updates | Notification indicator | ⚙️ (with red dot) |

## Settings Modal Layout

### Main Settings Panel

```
┌─────────────────────────────────────────────────────────────────┐
│ SETTINGS                                                    ✕   │
├─────────┬───────────────────────────────────────────────────────┤
│         │                                                       │
│         │                                                       │
│ General │  [Active settings section content]                    │
│ CORS    │                                                       │
│ Sources │                                                       │
│ Display │                                                       │
│ Privacy │                                                       │
│ Advanced│                                                       │
│         │                                                       │
│         │                                                       │
│         │                                                       │
│         │                                                       │
│         │                                                       │
│         │                                                       │
└─────────┴───────────────────────────────────────────────────────┘
```

### CORS Management Panel

```
┌─────────────────────────────────────────────────────────────────┐
│ SETTINGS > CORS MANAGEMENT                                  ✕   │
├─────────┬───────────────────────────────────────────────────────┤
│         │                                                       │
│         │  CORS Strategy Selection                              │
│ General │  ┌─────────────────────────────────────────────────┐  │
│ CORS    │  │ Default Strategy: [RSS2JSON Services     ▼]     │  │
│ Sources │  │                                                 │  │
│ Display │  │ Protocol-Specific Strategies:                   │  │
│ Privacy │  │ RSS:    [Use Default Strategy     ▼]            │  │
│ Advanced│  │ JSON:   [Direct Fetch             ▼]            │  │
│         │  │ API:    [Use Default Strategy     ▼]            │  │
│         │  │ IPFS:   [Use Default Strategy     ▼]            │  │
│         │  │ MASTODON:[Use Default Strategy    ▼]            │  │
│         │  │ SSB:    [Use Default Strategy     ▼]            │  │
│         │  └─────────────────────────────────────────────────┘  │
│         │                                                       │
│         │  RSS2JSON Service Configuration                       │
│         │  ┌─────────────────────────────────────────────────┐  │
│         │  │ Available Services:                             │  │
│         │  │ ☑ https://rss2json.vercel.app/api               │  │
│         │  │ ☑ https://api.rss2json.com/v1/api.json          │  │
│         │  │ ☑ https://feed2json.org/convert                 │  │
│         │  │ ☑ https://rss-to-json-serverless-api.vercel.app │  │
│         │  │                                                 │  │
│         │  │ [+] Add Custom Service                          │  │
│         │  │                                                 │  │
│         │  │ Service Priority (Drag to Reorder):             │  │
│         │  │ 1. https://rss2json.vercel.app/api     ⬆ ⬇     │  │
│         │  │ 2. https://api.rss2json.com/v1/api.json⬆ ⬇     │  │
│         │  │ 3. https://feed2json.org/convert       ⬆ ⬇     │  │
│         │  │ 4. https://rss-to-json-serverless-api  ⬆ ⬇     │  │
│         │  └─────────────────────────────────────────────────┘  │
│         │                                                       │
│         │  CORS Test Utility                                    │
│         │  ┌─────────────────────────────────────────────────┐  │
│         │  │ Test URL:                                       │  │
│         │  │ [https://example.com/feed.xml            ]      │  │
│         │  │                                                 │  │
│         │  │ Strategy: [Default Strategy     ▼]              │  │
│         │  │                                                 │  │
│         │  │ [Test Connection]                               │  │
│         │  │                                                 │  │
│         │  │ Results:                                        │  │
│         │  │ ✅ Success using RSS2JSON Services              │  │
│         │  │ Found 15 items in feed                          │  │
│         │  │                                                 │  │
│         │  │ Recommendations:                                │  │
│         │  │ • Continue using RSS2JSON for this feed         │  │
│         │  │ • Consider caching this feed (low update freq)  │  │
│         │  └─────────────────────────────────────────────────┘  │
│         │                                                       │
│         │  [Save Changes] [Reset to Defaults]                   │
│         │                                                       │
└─────────┴───────────────────────────────────────────────────────┘
```

### Advanced CORS Options

```
┌─────────────────────────────────────────────────────────────────┐
│ SETTINGS > CORS MANAGEMENT > ADVANCED                       ✕   │
├─────────┬───────────────────────────────────────────────────────┤
│         │                                                       │
│         │  Fallback Chain Configuration                         │
│ General │  ┌─────────────────────────────────────────────────┐  │
│ CORS    │  │ Fallback Order (Drag to Reorder):               │  │
│ Sources │  │ 1. RSS2JSON Services                   ⬆ ⬇     │  │
│ Display │  │ 2. Direct Fetch                        ⬆ ⬇     │  │
│ Privacy │  │ 3. JSONP Approach                      ⬆ ⬇     │  │
│ Advanced│  │ 4. Browser Service Worker Proxy        ⬆ ⬇     │  │
│         │  │ 5. Browser Extension                   ⬆ ⬇     │  │
│         │  └─────────────────────────────────────────────────┘  │
│         │                                                       │
│         │  CORS Proxy Configuration                             │
│         │  ┌─────────────────────────────────────────────────┐  │
│         │  │ Available CORS Proxies:                         │  │
│         │  │ ☑ https://corsproxy.io/?                        │  │
│         │  │ ☑ https://api.codetabs.com/v1/proxy?quest=      │  │
│         │  │ ☑ https://cors-anywhere.herokuapp.com/          │  │
│         │  │ ☑ https://api.allorigins.win/get?url=           │  │
│         │  │                                                 │  │
│         │  │ [+] Add Custom Proxy                            │  │
│         │  └─────────────────────────────────────────────────┘  │
│         │                                                       │
│         │  Service Worker Proxy                                 │
│         │  ┌─────────────────────────────────────────────────┐  │
│         │  │ Status: ⚠️ Not Installed                         │  │
│         │  │                                                 │  │
│         │  │ [Install Service Worker Proxy]                  │  │
│         │  │                                                 │  │
│         │  │ Note: This feature requires HTTPS and will      │  │
│         │  │ install a service worker in your browser.       │  │
│         │  └─────────────────────────────────────────────────┘  │
│         │                                                       │
│         │  Browser Extension Integration                        │
│         │  ┌─────────────────────────────────────────────────┐  │
│         │  │ Detected Extensions:                            │  │
│         │  │ ❌ No CORS extensions detected                   │  │
│         │  │                                                 │  │
│         │  │ Recommended Extensions:                         │  │
│         │  │ • CORS Unblock                                  │  │
│         │  │ • Allow CORS                                    │  │
│         │  │ • Moesif Origin & CORS Changer                  │  │
│         │  └─────────────────────────────────────────────────┘  │
│         │                                                       │
│         │  [Save Changes] [Reset to Defaults]                   │
│         │                                                       │
└─────────┴───────────────────────────────────────────────────────┘
```

## Mobile View

The settings interface will be responsive and adapt to mobile screens:

```
┌─────────────────────────────┐
│                          ✕  │
│  SETTINGS                   │
│                             │
│  [General]                  │
│  [CORS]                     │
│  [Sources]                  │
│  [Display]                  │
│  [Privacy]                  │
│  [Advanced]                 │
│                             │
└─────────────────────────────┘
```

When a section is selected:

```
┌─────────────────────────────┐
│  < CORS MANAGEMENT       ✕  │
│                             │
│  Default Strategy:          │
│  [RSS2JSON Services     ▼]  │
│                             │
│  Protocol-Specific:         │
│  RSS:                       │
│  [Use Default Strategy  ▼]  │
│                             │
│  JSON:                      │
│  [Direct Fetch          ▼]  │
│                             │
│  API:                       │
│  [Use Default Strategy  ▼]  │
│                             │
│  Available Services:        │
│  ☑ rss2json.vercel.app      │
│  ☑ api.rss2json.com         │
│  ☑ feed2json.org            │
│  [+] Add Custom             │
│                             │
│  Test Utility:              │
│  [URL Input            ]    │
│  [Test Connection]          │
│                             │
│  [Save Changes]             │
└─────────────────────────────┘
```

## Color Scheme

The settings UI will use the same color scheme as the main dashboard, with slight variations to distinguish it as a separate section.

### Light Mode

- Background: #f8f9fa
- Panel Background: #ffffff
- Text: #212529
- Borders: #dee2e6
- Primary Accent: #007bff
- Secondary Accent: #6c757d
- Success: #28a745
- Warning: #ffc107
- Danger: #dc3545

### Dark Mode

- Background: #1a1d21
- Panel Background: #2c3237
- Text: #e9ecef
- Borders: #495057
- Primary Accent: #0d6efd
- Secondary Accent: #6c757d
- Success: #20c997
- Warning: #ffc107
- Danger: #dc3545

### Earth Alliance Theme

- Background: #001a33
- Panel Background: #002b4d
- Text: #e6f2ff
- Borders: #004080
- Primary Accent: #0066cc
- Secondary Accent: #0099ff
- Success: #00cc66
- Warning: #ffcc00
- Danger: #ff3333

## Animation Effects

The settings UI will include subtle animations to enhance the user experience:

1. **Modal Entrance**: Fade in and slight scale up (200ms)
2. **Tab Switching**: Slide transition between settings panels (150ms)
3. **Button Hover**: Slight scale and glow effect (100ms)
4. **Settings Toggle**: Smooth slide animation (120ms)
5. **List Reordering**: Drag and drop with visual feedback (instant)

## Accessibility Considerations

The settings UI will be designed with accessibility in mind:

1. **Keyboard Navigation**: Full keyboard support for all controls
2. **Screen Reader Support**: ARIA labels and roles for all elements
3. **Color Contrast**: All text meets WCAG AA standards
4. **Focus Indicators**: Clear visual indicators for focused elements
5. **Responsive Text Size**: Text scales with user preferences

---

**CLASSIFICATION: EARTH ALLIANCE CONFIDENTIAL**

*These mockups represent the planned UI for the Settings system in the Tactical Intelligence Dashboard, with special focus on CORS management functionality.*
