# 🔧 SETTINGS SYSTEM DEVELOPMENT PHASE

## 📋 Phase Overview: User-Configurable Settings & CORS Management

This development phase introduces a comprehensive settings system to the Tactical Intelligence Dashboard, enabling users to configure various aspects of the application including CORS handling strategies, protocol preferences, and source verification thresholds.

## 🎯 Primary Objectives

1. **Create a unified settings management system**
2. **Implement CORS strategy configuration**
3. **Develop protocol preference settings**
4. **Add source verification threshold controls**
5. **Design an intuitive settings UI**

## 🛠️ Technical Architecture

### Core Components

```
┌─────────────────────┐      ┌─────────────────────┐      ┌─────────────────────┐
│  Settings Context   │      │    Settings UI      │      │  Settings Storage   │
│                     │      │                     │      │                     │
│  - State Management │◄────►│  - Settings Pages   │◄────►│  - Local Storage    │
│  - Default Values   │      │  - Form Components  │      │  - Sync Mechanism   │
│  - Change Handlers  │      │  - Modal Dialogs    │      │  - Migration Logic  │
└─────────────────────┘      └─────────────────────┘      └─────────────────────┘
          ▲                            ▲                            ▲
          │                            │                            │
          │                            │                            │
          ▼                            ▼                            ▼
┌─────────────────────┐      ┌─────────────────────┐      ┌─────────────────────┐
│  Service Adapters   │      │  Settings Presets   │      │  Export/Import      │
│                     │      │                     │      │                     │
│  - CORS Strategies  │◄────►│  - Configurations   │◄────►│  - Backup Settings  │
│  - Protocol Handlers│      │  - Mode Profiles    │      │  - Restore Settings │
│  - Feed Fetchers    │      │  - Quick Setup      │      │  - Share Config     │
└─────────────────────┘      └─────────────────────┘      └─────────────────────┘
```

## 🧩 Feature Details

### 1️⃣ CORS Management System

The CORS Management System will allow users to configure how the application handles cross-origin requests for various feed types:

#### CORS Strategy Configuration Options

| Strategy | Description | Use Case |
|----------|-------------|----------|
| **RSS2JSON Services** | Use third-party services that convert RSS to JSON with CORS headers | Default for most RSS feeds |
| **JSONP Approach** | Use JSONP for APIs that support it | APIs with JSONP endpoints |
| **Local Browser Proxy** | Client-side service worker proxy for CORS | Advanced users, needs setup |
| **CORS-Friendly Feeds** | Direct fetch for sources with proper CORS headers | JSON feeds, APIs with CORS |
| **Browser Extensions** | Leverage installed CORS bypass extensions | For users with extensions |

#### Implementation Details

- **Strategy Selection Interface**: Allow users to select preferred CORS strategies on a per-protocol basis
- **Service Endpoints Management**: Add/remove RSS2JSON service endpoints
- **Custom Headers Configuration**: Add custom headers for specific domains
- **Fallback Chain Definition**: Configure the order of fallback strategies
- **Testing Tool**: Built-in tool to test if a feed works with selected strategy

### 2️⃣ Protocol Preference Settings

Configure how different protocol types are handled:

- **Protocol Priority**: Order protocols for sources with multiple options
- **Protocol-Specific Settings**:
  - RSS: Parser settings, caching duration
  - JSON: Structure mapping, validation rules
  - API: Authentication, rate limiting
  - IPFS: Gateway selection, timeout settings
  - Mastodon: Instance preferences
  - SSB: Client configuration

### 3️⃣ Verification Settings

Control how sources are verified and displayed:

- **Trust Rating Thresholds**: Set minimum trust ratings for inclusion
- **Verification Method Preferences**: Prioritize specific verification methods
- **Warning Levels**: Configure when warnings appear for less verified content
- **Source Highlighting**: Visual indicators based on verification status

### 4️⃣ User Interface

#### Settings Button & Navigation

- **Location**: Header section, left side (existing UI element)
- **Icon**: Gear/cog icon with subtle glow effect
- **Animation**: Slight rotation on hover
- **Interaction**: Click opens Settings modal or navigates to Settings page

#### Settings Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ TACTICAL INTELLIGENCE DASHBOARD - SETTINGS                      │
├─────────┬───────────────────────────────────────────────────────┤
│         │                                                       │
│         │  [Page Title: CORS Management]                        │
│         │                                                       │
│         │  ┌─────────────────────────────────────────────────┐  │
│  NAV    │  │ CORS Strategy Selection                         │  │
│  MENU   │  │ [Dropdown Menus, Toggle Switches]               │  │
│         │  └─────────────────────────────────────────────────┘  │
│ General │                                                       │
│ CORS    │  ┌─────────────────────────────────────────────────┐  │
│ Sources │  │ RSS2JSON Service Configuration                   │  │
│ Display │  │ [Add/Remove Services, Priority Ordering]         │  │
│ Privacy │  └─────────────────────────────────────────────────┘  │
│ Advanced│                                                       │
│         │  ┌─────────────────────────────────────────────────┐  │
│         │  │ CORS Test Utility                               │  │
│         │  │ [URL Input, Test Button, Results Display]        │  │
│         │  └─────────────────────────────────────────────────┘  │
│         │                                                       │
│         │  [Save] [Reset to Defaults] [Export Settings]         │
│         │                                                       │
└─────────┴───────────────────────────────────────────────────────┘
```

## 💾 Settings Storage

Settings will be stored in browser localStorage with the following structure:

```typescript
interface DashboardSettings {
  version: string;
  cors: {
    defaultStrategy: CORSStrategy;
    protocolStrategies: Record<SourceProtocol, CORSStrategy>;
    services: {
      rss2json: string[];
      corsProxies: string[];
      customEndpoints: Record<string, string>;
    };
    fallbackChain: CORSStrategy[];
    testResults: Record<string, TestResult>;
  };
  protocols: {
    priority: SourceProtocol[];
    settings: Record<SourceProtocol, any>;
  };
  verification: {
    minimumTrustRating: number;
    preferredMethods: string[];
    warningThreshold: number;
  };
  display: {
    theme: 'light' | 'dark' | 'system' | 'alliance';
    density: 'comfortable' | 'compact' | 'spacious';
    fontSize: number;
  };
  privacy: {
    localStorageOnly: boolean;
    anonymizeRequests: boolean;
    clearOnExit: boolean;
  };
}
```

## 🚀 Implementation Plan

### Phase 1: Foundation (Week 1)

1. Create Settings context and provider
2. Implement basic settings storage mechanism
3. Design settings UI components
4. Add settings button to main navigation

### Phase 2: CORS Management (Week 2)

1. Implement CORS strategy selection interface
2. Create service endpoints management
3. Build fallback chain configuration
4. Develop CORS testing utility

### Phase 3: Additional Settings (Week 3)

1. Add protocol preferences section
2. Implement verification settings
3. Create display and privacy options
4. Develop settings import/export

### Phase 4: Integration & Testing (Week 4)

1. Connect settings to existing services
2. Perform comprehensive testing
3. Optimize performance
4. Write user documentation

## 🖼️ Settings Button UI

The settings button will be implemented in the header section:

```jsx
<header className="dashboard-header">
  <div className="header-left">
    <button
      className="settings-button"
      onClick={() => setSettingsOpen(true)}
      aria-label="Open Settings"
    >
      <SettingsIcon className="settings-icon" />
    </button>
    {/* Other left header elements */}
  </div>
  
  <h1>Tactical Intelligence Dashboard</h1>
  
  <div className="header-right">
    {/* Right header elements */}
  </div>
</header>
```

### Button Styling

```css
.settings-button {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--panel-bg);
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  cursor: pointer;
}

.settings-button:hover {
  background: var(--panel-hover);
  transform: rotate(15deg);
}

.settings-button:active {
  transform: scale(0.95) rotate(15deg);
}

.settings-icon {
  width: 20px;
  height: 20px;
  color: var(--text-color);
}

/* Pulsing effect for notifications */
.settings-button.has-updates::after {
  content: '';
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-color);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(var(--accent-rgb), 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 5px rgba(var(--accent-rgb), 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(var(--accent-rgb), 0);
  }
}
```

## 🛡️ CORS Strategy Selection Interface

The CORS strategy selection interface will allow users to choose how to handle cross-origin requests:

```jsx
<div className="settings-section">
  <h2>CORS Strategy Selection</h2>
  
  <div className="settings-option">
    <label htmlFor="default-cors-strategy">Default CORS Strategy</label>
    <select 
      id="default-cors-strategy"
      value={settings.cors.defaultStrategy}
      onChange={(e) => updateSettings({
        cors: {
          ...settings.cors,
          defaultStrategy: e.target.value
        }
      })}
    >
      <option value="RSS2JSON">RSS2JSON Services (Recommended)</option>
      <option value="JSONP">JSONP Approach</option>
      <option value="LOCAL_PROXY">Browser Service Worker Proxy</option>
      <option value="DIRECT">Direct Fetch (CORS-Friendly Only)</option>
      <option value="EXTENSION">Browser Extension</option>
    </select>
    <p className="settings-description">
      The primary method used to bypass CORS restrictions when fetching feeds.
    </p>
  </div>
  
  {/* Protocol-specific strategies */}
  <div className="settings-option">
    <h3>Protocol-Specific Strategies</h3>
    
    {Object.values(SourceProtocol).map(protocol => (
      <div className="protocol-strategy" key={protocol}>
        <label htmlFor={`${protocol}-strategy`}>{protocol.toUpperCase()}</label>
        <select
          id={`${protocol}-strategy`}
          value={settings.cors.protocolStrategies[protocol]}
          onChange={(e) => updateProtocolStrategy(protocol, e.target.value)}
        >
          <option value="DEFAULT">Use Default Strategy</option>
          <option value="RSS2JSON">RSS2JSON Services</option>
          <option value="JSONP">JSONP Approach</option>
          <option value="LOCAL_PROXY">Browser Service Worker Proxy</option>
          <option value="DIRECT">Direct Fetch</option>
          <option value="EXTENSION">Browser Extension</option>
        </select>
      </div>
    ))}
  </div>
</div>
```

## 🧪 CORS Testing Utility

The testing utility will allow users to verify if their selected CORS strategy works for a specific feed:

```jsx
<div className="settings-section">
  <h2>CORS Test Utility</h2>
  
  <div className="cors-test-utility">
    <div className="test-input">
      <input
        type="text"
        placeholder="Enter feed URL to test"
        value={testUrl}
        onChange={(e) => setTestUrl(e.target.value)}
      />
      <select
        value={testStrategy}
        onChange={(e) => setTestStrategy(e.target.value)}
      >
        <option value="DEFAULT">Default Strategy</option>
        <option value="RSS2JSON">RSS2JSON Services</option>
        <option value="JSONP">JSONP Approach</option>
        <option value="LOCAL_PROXY">Browser Service Worker Proxy</option>
        <option value="DIRECT">Direct Fetch</option>
        <option value="EXTENSION">Browser Extension</option>
      </select>
      <button onClick={runCorsTest}>Test</button>
    </div>
    
    {testResult && (
      <div className={`test-result ${testResult.success ? 'success' : 'failure'}`}>
        <h4>{testResult.success ? '✅ Success' : '❌ Failed'}</h4>
        <p>{testResult.message}</p>
        {testResult.items && (
          <p>Found {testResult.items} items in feed</p>
        )}
        {testResult.error && (
          <div className="error-details">
            <p>Error: {testResult.error}</p>
          </div>
        )}
        {testResult.recommendations && (
          <div className="recommendations">
            <h5>Recommendations:</h5>
            <ul>
              {testResult.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )}
  </div>
</div>
```

## 📝 Development Guidelines

1. **Backward Compatibility**: Ensure all settings have sensible defaults
2. **Performance**: Settings changes should apply immediately without page reload
3. **User Experience**: Provide explanations for technical settings
4. **Error Handling**: Gracefully handle invalid settings
5. **Testing**: Create comprehensive tests for settings functionality

## 🔍 Success Criteria

1. Users can select and configure CORS strategies for different protocols
2. Settings persist between sessions
3. CORS testing utility successfully identifies working strategies
4. Settings can be exported and imported
5. UI is intuitive and accessible

---

## 📚 Related Documentation

- [CORS Solution Architecture](../cors-solution/CORS_SOLUTION_COMPLETE.md)
- [Earth Alliance Source Roster](./EARTH_ALLIANCE_SOURCE_ROSTER.md)
- [Multi-Protocol Support](./EARTH_ALLIANCE_MULTI_PROTOCOL.md)

---

**CLASSIFICATION: EARTH ALLIANCE CONFIDENTIAL**

*This document outlines the implementation plan for the Settings system in the Tactical Intelligence Dashboard, with special focus on CORS management functionality to enhance the dashboard's ability to access diverse information sources across protocols.*
