# CSS Architecture Visual Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TACTICAL INTEL DASHBOARD CSS ARCHITECTURE            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ENTRY POINTS  │    │   IMPORT FLOW   │    │   FILE LAYERS   │
│                 │    │                 │    │                 │
│ main.tsx        │───▶│ tactical-ui.css │───▶│ 🏗️  FOUNDATION   │
│ ├─tactical-ui   │    │ layout.css      │    │ ├─variables.css │
│ ├─layout.css    │    │ main.css        │    │ ├─fonts.css     │
│ └─main.css      │    │                 │    │ ├─reset.css     │
│                 │    │ all-components  │    │ ├─typography    │
│ Components      │───▶│ .css            │───▶│ └─animations    │
│ ├─Settings      │    │ ├─28 component  │    │                 │
│ ├─Web3          │    │ │  imports      │    │ 🎛️  MODULES      │
│ ├─Feeds         │    │ ├─layout.css    │    │ ├─layout-frame  │
│ └─Header        │    │ ├─enhanced-     │    │ ├─tactical-     │
│                 │    │ │  feeds.css    │    │ │  framework    │
│                 │    │ └─wing-commander│    │ └─feeds/        │
│                 │    │   -components   │    │                 │
└─────────────────┘    └─────────────────┘    │ 🧩  COMPONENTS   │
                                              │ ├─buttons.css   │
┌─────────────────┐    ┌─────────────────┐    │ ├─forms.css     │
│   LEGACY FILES  │    │  MODULAR SYSTEM │    │ ├─settings-*    │
│                 │    │                 │    │ ├─web3-*        │
│ tactical-ui.css │    │ tactical-ui-    │    │ └─28 more...    │
│ (2311 lines)    │◄──▶│ modular.css     │    │                 │
│                 │    │ (modular only)  │    │ 🎨  THEMES       │
│ enhanced-feeds  │    │                 │    │ ├─module-themes │
│ (1103 lines)    │    │ Import Strategy:│    │ └─wing-commander│
│                 │    │ base/ →         │    │   ├─arch-angel  │
│ wing-commander  │    │ modules/ →      │    │   └─interface-  │
│ (1275 lines)    │    │ components/ →   │    │     layout      │
│                 │    │ themes/         │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘

                        ┌─────────────────┐
                        │   LOAD ORDER    │
                        │                 │
                        │ 1. CSS Variables│
                        │ 2. Font Imports │
                        │ 3. Global Reset │
                        │ 4. Typography   │
                        │ 5. Animations   │
                        │ 6. Layout Frame │
                        │ 7. Components   │
                        │ 8. Themes       │
                        │ 9. Page-specific│
                        └─────────────────┘
```

## Component Relationship Diagram

```
                    ┌─────────────────────────────────────┐
                    │            DESIGN TOKENS            │
                    │         (variables.css)             │
                    │                                     │
                    │ --spacing-xs: 1px                   │
                    │ --font-size-sm: 10px                │
                    │ --accent-cyan: #00ffaa              │
                    │ --status-operational: #00ff41       │
                    └─────────────────┬───────────────────┘
                                      │
                    ┌─────────────────▼───────────────────┐
                    │         FRAMEWORK PATTERNS          │
                    │      (tactical-framework.css)       │
                    │                                     │
                    │ .tactical-module                    │
                    │ .tactical-header                    │
                    │ .control-group                      │
                    │ .micro-grid                         │
                    └─────────────────┬───────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
┌───────────────┐            ┌───────────────┐            ┌───────────────┐
│   BUTTONS     │            │    FORMS      │            │   HEADERS     │
│ (buttons.css) │            │ (forms.css)   │            │(header-*.css) │
│               │            │               │            │               │
│ .btn          │            │ .form-input   │            │ .header-brand │
│ .btn-primary  │            │ .form-group   │            │ .search-bar   │
│ .btn-micro    │            │ .form-label   │            │ .nav-controls │
└───────────────┘            └───────────────┘            └───────────────┘
        │                             │                             │
        └─────────────────────────────┼─────────────────────────────┘
                                      │
                    ┌─────────────────▼───────────────────┐
                    │           SPECIALIZED               │
                    │                                     │
        ┌───────────┴───────────┐         ┌───────────────┴───────────┐
        │      WEB3 SYSTEM      │         │      FEED SYSTEM          │
        │                       │         │                           │
        │ web3-wallet.css       │         │ feeds/feed-visualizer.css │
        │ web3-button.css       │         │ feeds/enhanced-feeds.css  │
        │ web3-verification.css │         │ enhanced-feeds.css        │
        │                       │         │                           │
        │ .web3-wallet-panel    │         │ .feed-visualizer          │
        │ .wallet-address       │         │ .feed-item                │
        │ .web3-connect-btn     │         │ .feed-grid                │
        └───────────────────────┘         └───────────────────────────┘
                        │                             │
                        └─────────────────┬───────────┘
                                          │
                        ┌─────────────────▼───────────────────┐
                        │              THEMES                 │
                        │                                     │
                        │ module-themes.css                   │
                        │ ├─ .module-intelligence             │
                        │ ├─ .module-health                   │
                        │ └─ .module-tactical                 │
                        │                                     │
                        │ wing-commander/                     │
                        │ ├─ arch-angel-header.css            │
                        │ └─ interface-layout.css             │
                        └─────────────────────────────────────┘
```

## Color System Flow

```
                        CSS VARIABLES (ROOT)
                              │
                    ┌─────────┼─────────┐
                    │         │         │
                    ▼         ▼         ▼
              ┌──────────┐ ┌──────────┐ ┌──────────┐
              │ PRIMARY  │ │ SEMANTIC │ │  STATUS  │
              │ PALETTE  │ │  ROLES   │ │ COLORS   │
              │          │ │          │ │          │
              │ --accent-│ │ --text-  │ │ --status-│
              │  cyan    │ │  primary │ │  operational│
              │ --primary│ │ --text-  │ │ --status-│
              │  -bg     │ │  muted   │ │  warning │
              └──────────┘ └──────────┘ └──────────┘
                    │         │         │
                    └─────────┼─────────┘
                              │
                    ┌─────────▼─────────┐
                    │   COMPONENT       │
                    │   APPLICATION     │
                    │                   │
                    │ .btn-primary {    │
                    │   border-color:   │
                    │   var(--accent-   │
                    │   cyan);          │
                    │ }                 │
                    │                   │
                    │ .status-ok {      │
                    │   color: var(     │
                    │   --status-       │
                    │   operational);   │
                    │ }                 │
                    └───────────────────┘
```

## Import Dependency Tree

```
main.tsx
├── tactical-ui.css
│   ├── fonts (Google Fonts)
│   ├── CSS variables
│   ├── header-components.css
│   └── [core framework styles]
├── layout.css
│   ├── grid systems
│   ├── responsive breakpoints
│   └── layout utilities
└── main.css
    ├── global overrides
    └── entry point styles

all-components.css
├── components/
│   ├── header-controls.css
│   ├── settings-page.css
│   ├── web3-wallet.css
│   ├── governance-panel.css
│   └── [24 more component files]
├── layout.css (imported again)
├── enhanced-feeds.css
│   ├── feed-specific styles
│   └── feed grid layouts
└── wing-commander-components.css
    ├── wing commander theme
    └── specialized layouts

tactical-ui-modular.css (NEW SYSTEM)
├── base/
│   ├── fonts.css
│   ├── variables.css
│   ├── reset.css
│   ├── typography.css
│   └── animations.css
├── modules/
│   ├── layout-framework.css
│   └── tactical-framework.css
├── components/
│   ├── buttons.css
│   └── forms.css
└── themes/
    └── module-themes.css
```
