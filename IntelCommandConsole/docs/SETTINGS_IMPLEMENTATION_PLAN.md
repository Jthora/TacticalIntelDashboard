# 🚀 SETTINGS & CORS MANAGEMENT IMPLEMENTATION PLAN

## Phase 1: Foundation (Sprint 1)

### Week 1: Core Settings Framework
| Task | Description | Priority | Estimated Time |
|------|-------------|----------|----------------|
| Create Settings Context | Implement React Context for global settings state | High | 1 day |
| Design Settings UI Components | Create reusable UI components for settings | High | 2 days |
| Implement Settings Storage | Create localStorage persistence layer | High | 1 day |
| Add Settings Button | Add settings button to the header | Medium | 0.5 day |

### Week 2: CORS Management UI
| Task | Description | Priority | Estimated Time |
|------|-------------|----------|----------------|
| CORS Strategy UI | Create strategy selection interface | High | 2 days |
| Service Configuration UI | Implement service endpoints management | Medium | 1.5 days |
| Testing Utility | Build CORS testing tool | Medium | 1.5 days |
| Settings Navigation | Implement settings tab navigation | Medium | 1 day |

## Phase 2: Strategy Implementation (Sprint 2)

### Week 3: CORS Strategy Implementation
| Task | Description | Priority | Estimated Time |
|------|-------------|----------|----------------|
| RSS2JSON Integration | Enhance existing RSS2JSON integration | High | 1 day |
| Static Proxies Implementation | Implement static CORS proxies | High | 1 day |
| Service Worker Proxy | Create service worker CORS proxy | Medium | 2 days |
| Browser Extension Detection | Add support for CORS extension detection | Low | 1 day |

### Week 4: Multi-Protocol Support
| Task | Description | Priority | Estimated Time |
|------|-------------|----------|----------------|
| Protocol Detection | Implement URL-based protocol detection | High | 1 day |
| Protocol-Specific Settings | Add protocol-specific strategy settings | Medium | 2 days |
| Protocol Handlers | Update protocol handlers to use settings | High | 2 days |
| Strategy Manager | Create centralized strategy management | High | 1 day |

## Phase 3: Advanced Features (Sprint 3)

### Week 5: Caching & Performance
| Task | Description | Priority | Estimated Time |
|------|-------------|----------|----------------|
| IndexedDB Cache | Implement advanced feed caching | High | 2 days |
| Preemptive Fetching | Add background fetching for common feeds | Medium | 1.5 days |
| Performance Metrics | Add performance tracking for strategies | Low | 1 day |
| Batch Requests | Implement request batching | Medium | 1.5 days |

### Week 6: Adaptive Strategy Selection
| Task | Description | Priority | Estimated Time |
|------|-------------|----------|----------------|
| Success Tracking | Track success rates for strategies | Medium | 1 day |
| Strategy Learning | Implement adaptive strategy selection | Medium | 2 days |
| User History | Create user-based feed success history | Low | 1.5 days |
| Strategy Recommendation | Add strategy recommendations | Low | 1.5 days |

## Phase 4: Integration & Testing (Sprint 4)

### Week 7: Integration
| Task | Description | Priority | Estimated Time |
|------|-------------|----------|----------------|
| FeedService Integration | Connect settings to FeedService | High | 1.5 days |
| ProtocolAdapter Integration | Update protocol adapters | High | 1.5 days |
| UI Integration | Connect UI components to settings | Medium | 1 day |
| Migration Logic | Add settings version migration | Medium | 1 day |

### Week 8: Testing & Documentation
| Task | Description | Priority | Estimated Time |
|------|-------------|----------|----------------|
| Unit Testing | Create tests for settings functionality | High | 2 days |
| E2E Testing | Test full integration scenarios | High | 1.5 days |
| Documentation | Update technical documentation | Medium | 1 day |
| User Guide | Create user guide for settings | Medium | 1.5 days |

## Technical Tasks Breakdown

### Settings Context Creation
```typescript
// src/contexts/SettingsContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

export enum CORSStrategy {
  RSS2JSON = 'RSS2JSON',
  STATIC_PROXY = 'STATIC_PROXY',
  SERVICE_WORKER = 'SERVICE_WORKER',
  DIRECT = 'DIRECT',
  JSONP = 'JSONP',
  EXTENSION = 'EXTENSION'
}

export interface Settings {
  version: string;
  cors: {
    defaultStrategy: CORSStrategy;
    protocolStrategies: Record<string, CORSStrategy>;
    services: {
      rss2json: string[];
      corsProxies: string[];
    };
    fallbackChain: CORSStrategy[];
  };
  // Other settings
}

const defaultSettings: Settings = {
  version: '1.0.0',
  cors: {
    defaultStrategy: CORSStrategy.RSS2JSON,
    protocolStrategies: {},
    services: {
      rss2json: [
        'https://rss2json.vercel.app/api',
        'https://api.rss2json.com/v1/api.json',
        'https://feed2json.org/convert'
      ],
      corsProxies: [
        'https://corsproxy.io/?',
        'https://api.allorigins.win/get?url=',
        'https://api.codetabs.com/v1/proxy?quest='
      ]
    },
    fallbackChain: [
      CORSStrategy.RSS2JSON,
      CORSStrategy.STATIC_PROXY,
      CORSStrategy.DIRECT,
      CORSStrategy.SERVICE_WORKER,
      CORSStrategy.EXTENSION
    ]
  }
  // Other default settings
};

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('dashboardSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('dashboardSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
      // Deep merge for nested objects
      cors: {
        ...prevSettings.cors,
        ...(newSettings.cors || {})
      }
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
```

### CORS Strategy Manager Implementation
```typescript
// src/services/CORSStrategyManager.ts
import { CORSStrategy } from '../contexts/SettingsContext';
import { SourceProtocol } from '../constants/EarthAllianceSources';
import { RSS2JSONService } from './RSS2JSONService';
import { FeedCache } from '../utils/FeedCache';

export class CORSStrategyManager {
  private settings: any;
  
  constructor(settings: any) {
    this.settings = settings;
  }
  
  async fetchWithStrategy(url: string, strategy: CORSStrategy): Promise<any> {
    switch (strategy) {
      case CORSStrategy.RSS2JSON:
        return this.fetchWithRSS2JSON(url);
      case CORSStrategy.STATIC_PROXY:
        return this.fetchWithStaticProxy(url);
      case CORSStrategy.SERVICE_WORKER:
        return this.fetchWithServiceWorker(url);
      case CORSStrategy.DIRECT:
        return this.fetchDirect(url);
      case CORSStrategy.JSONP:
        return this.fetchWithJSONP(url);
      case CORSStrategy.EXTENSION:
        return this.fetchWithExtension(url);
      default:
        throw new Error(`Unknown strategy: ${strategy}`);
    }
  }
  
  async fetchWithStrategies(url: string): Promise<any> {
    // Detect protocol
    const protocol = this.detectProtocol(url);
    
    // Try protocol-specific strategy first
    if (protocol && this.settings.cors.protocolStrategies[protocol]) {
      try {
        const strategy = this.settings.cors.protocolStrategies[protocol];
        return await this.fetchWithStrategy(url, strategy);
      } catch (error) {
        console.warn(`Protocol-specific strategy failed for ${url}:`, error);
        // Fall back to chain
      }
    }
    
    // Try strategies in the fallback chain
    for (const strategy of this.settings.cors.fallbackChain) {
      try {
        return await this.fetchWithStrategy(url, strategy);
      } catch (error) {
        console.warn(`Strategy ${strategy} failed for ${url}:`, error);
        // Continue to next strategy
      }
    }
    
    throw new Error(`All strategies failed for ${url}`);
  }
  
  private async fetchWithRSS2JSON(url: string): Promise<any> {
    return RSS2JSONService.fetchFeed(url);
  }
  
  private async fetchWithStaticProxy(url: string): Promise<any> {
    // Implement static proxy fetching
    for (const proxy of this.settings.cors.services.corsProxies) {
      try {
        const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
          throw new Error(`Proxy returned ${response.status}`);
        }
        
        return await response.text();
      } catch (error) {
        console.warn(`Proxy failed:`, error);
        // Continue to next proxy
      }
    }
    
    throw new Error('All proxies failed');
  }
  
  private async fetchWithServiceWorker(url: string): Promise<any> {
    // Implement service worker proxy fetching
    const proxyUrl = `/corsProxy/${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`Service worker proxy returned ${response.status}`);
    }
    
    return await response.text();
  }
  
  private async fetchDirect(url: string): Promise<any> {
    // Try direct fetch (will likely fail due to CORS)
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Direct fetch returned ${response.status}`);
    }
    
    return await response.text();
  }
  
  private async fetchWithJSONP(url: string): Promise<any> {
    // Implement JSONP fetching
    return new Promise((resolve, reject) => {
      const callbackName = `jsonp_callback_${Date.now()}`;
      
      window[callbackName] = (data: any) => {
        delete window[callbackName];
        document.head.removeChild(script);
        resolve(data);
      };
      
      const script = document.createElement('script');
      script.src = `${url}${url.includes('?') ? '&' : '?'}callback=${callbackName}`;
      script.onerror = () => {
        delete window[callbackName];
        document.head.removeChild(script);
        reject(new Error('JSONP request failed'));
      };
      
      document.head.appendChild(script);
    });
  }
  
  private async fetchWithExtension(url: string): Promise<any> {
    // Try direct fetch, which might work if a CORS extension is active
    try {
      const response = await fetch(url, { mode: 'cors' });
      
      if (response.ok) {
        return await response.text();
      }
    } catch (error) {
      console.warn('Direct fetch with extension failed:', error);
    }
    
    throw new Error('CORS extension not detected or not working');
  }
  
  private detectProtocol(url: string): SourceProtocol | null {
    if (url.includes('/feed') || url.includes('/rss') || url.endsWith('.xml')) {
      return SourceProtocol.RSS;
    } else if (url.endsWith('.json') || url.includes('feed.json')) {
      return SourceProtocol.JSON;
    } else if (url.includes('/api/')) {
      return SourceProtocol.API;
    } else if (url.startsWith('ipfs://') || url.includes('ipfs.io')) {
      return SourceProtocol.IPFS;
    } else if (url.includes('mastodon') || url.includes('.social/')) {
      return SourceProtocol.MASTODON;
    } else if (url.startsWith('ssb://')) {
      return SourceProtocol.SSB;
    }
    
    return null;
  }
}
```

### Settings Button Component
```tsx
// src/components/SettingsButton.tsx
import React, { useState } from 'react';
import { SettingsModal } from './SettingsModal';
import { ReactComponent as SettingsIcon } from '../assets/icons/settings.svg';

interface SettingsButtonProps {
  hasUpdates?: boolean;
}

export const SettingsButton: React.FC<SettingsButtonProps> = ({ hasUpdates = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button 
        className={`settings-button ${hasUpdates ? 'has-updates' : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open Settings"
      >
        <SettingsIcon className="settings-icon" />
      </button>
      
      {isOpen && <SettingsModal onClose={() => setIsOpen(false)} />}
    </>
  );
};
```

### CORS Testing Utility
```tsx
// src/components/settings/CORSTestUtility.tsx
import React, { useState } from 'react';
import { useSettings, CORSStrategy } from '../../contexts/SettingsContext';
import { CORSStrategyManager } from '../../services/CORSStrategyManager';

interface TestResult {
  success: boolean;
  message: string;
  items?: number;
  error?: string;
  recommendations?: string[];
}

export const CORSTestUtility: React.FC = () => {
  const { settings } = useSettings();
  const [testUrl, setTestUrl] = useState('');
  const [testStrategy, setTestStrategy] = useState<CORSStrategy | 'DEFAULT'>('DEFAULT');
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const runCorsTest = async () => {
    if (!testUrl) return;
    
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const strategyManager = new CORSStrategyManager(settings);
      let result;
      
      if (testStrategy === 'DEFAULT') {
        result = await strategyManager.fetchWithStrategies(testUrl);
      } else {
        result = await strategyManager.fetchWithStrategy(testUrl, testStrategy as CORSStrategy);
      }
      
      // Try to determine the number of items
      let itemCount = 0;
      try {
        if (typeof result === 'string') {
          // Try to parse as XML
          const parser = new DOMParser();
          const xml = parser.parseFromString(result, 'text/xml');
          itemCount = xml.querySelectorAll('item').length;
        } else if (Array.isArray(result)) {
          itemCount = result.length;
        } else if (result.items && Array.isArray(result.items)) {
          itemCount = result.items.length;
        }
      } catch (e) {
        console.warn('Failed to determine item count:', e);
      }
      
      // Generate recommendations
      const recommendations = [];
      if (itemCount > 0) {
        recommendations.push(`Continue using ${testStrategy === 'DEFAULT' ? settings.cors.defaultStrategy : testStrategy} for this feed`);
      }
      
      if (itemCount > 10) {
        recommendations.push('Consider caching this feed (contains many items)');
      }
      
      setTestResult({
        success: true,
        message: `Successfully fetched feed using ${testStrategy === 'DEFAULT' ? settings.cors.defaultStrategy : testStrategy}`,
        items: itemCount,
        recommendations
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to fetch feed',
        error: error.message,
        recommendations: [
          'Try a different CORS strategy',
          'Check if the URL is correct and the feed exists',
          'Consider using a feed that supports CORS headers directly'
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
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
            onChange={(e) => setTestStrategy(e.target.value as CORSStrategy | 'DEFAULT')}
          >
            <option value="DEFAULT">Default Strategy</option>
            {Object.values(CORSStrategy).map(strategy => (
              <option key={strategy} value={strategy}>{strategy}</option>
            ))}
          </select>
          <button 
            onClick={runCorsTest} 
            disabled={isLoading || !testUrl}
          >
            {isLoading ? 'Testing...' : 'Test'}
          </button>
        </div>
        
        {testResult && (
          <div className={`test-result ${testResult.success ? 'success' : 'failure'}`}>
            <h4>{testResult.success ? '✅ Success' : '❌ Failed'}</h4>
            <p>{testResult.message}</p>
            {testResult.items !== undefined && (
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
  );
};
```

## Integration Plan

### Phase 1: Core Components
1. Create `SettingsContext` and provider
2. Add settings button to header
3. Implement basic settings modal
4. Add CORS strategy selection UI

### Phase 2: Strategy Implementation
1. Create `CORSStrategyManager`
2. Update `RSS2JSONService` to use settings
3. Implement other strategy handlers
4. Create testing utility

### Phase 3: FeedService Integration
1. Update `FeedService` to use `CORSStrategyManager`
2. Modify `ProtocolAdapter` to use settings-based strategies
3. Add caching with `IndexedDB`

### Phase 4: Final Integration
1. Connect UI to settings
2. Add performance tracking
3. Implement adaptive strategy selection
4. Complete documentation

## Success Criteria

The implementation will be considered successful when:

1. Users can configure CORS strategies through the settings UI
2. The system successfully fetches feeds using the selected strategies
3. The testing utility accurately reports success/failure
4. Performance metrics show improved feed fetch success rates
5. Settings persist between sessions

---

**CLASSIFICATION: EARTH ALLIANCE CONFIDENTIAL**

*This document outlines the implementation plan for the Settings system and CORS management in the Tactical Intelligence Dashboard.*
