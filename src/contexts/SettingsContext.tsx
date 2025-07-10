import React, { createContext, useContext, useState, useEffect } from 'react';

export enum CORSStrategy {
  RSS2JSON = 'RSS2JSON',
  JSONP = 'JSONP',
  SERVICE_WORKER = 'SERVICE_WORKER',
  DIRECT = 'DIRECT',
  EXTENSION = 'EXTENSION'
}

export enum SettingsTab {
  GENERAL = 'general',
  CORS = 'cors',
  PROTOCOLS = 'protocols',
  VERIFICATION = 'verification',
  DISPLAY = 'display',
  ADVANCED = 'advanced'
}

export interface Settings {
  version: string;
  lastTab: SettingsTab;
  cors: {
    defaultStrategy: CORSStrategy;
    protocolStrategies: Record<string, CORSStrategy>;
    services: {
      rss2json: string[];
      corsProxies: string[];
    };
    fallbackChain: CORSStrategy[];
  };
  protocols: {
    priority: string[];
    settings: Record<string, any>;
    autoDetect: boolean;
    fallbackEnabled: boolean;
  };
  verification: {
    minimumTrustRating: number;
    preferredMethods: string[];
    warningThreshold: number;
    advancedSettings?: {
      crossReference: boolean;
      machineLearning: boolean;
      highlightUnverified: boolean;
      crossReferenceCount: number;
    };
  };
  display: {
    theme: 'light' | 'dark' | 'system' | 'alliance';
    density: 'comfortable' | 'compact' | 'spacious';
    fontSize: number;
  };
  general?: {
    refreshInterval: number;
    cacheSettings: {
      enabled: boolean;
      duration: number;
    };
    notifications: {
      enabled: boolean;
      sound: boolean;
    };
  };
}

const defaultSettings: Settings = {
  version: '1.0.0',
  lastTab: SettingsTab.GENERAL,
  cors: {
    defaultStrategy: CORSStrategy.RSS2JSON,
    protocolStrategies: {},
    services: {
      rss2json: [
        'https://rss2json.vercel.app/api',
        'https://api.rss2json.com/v1/api.json',
        'https://feed2json.org/convert',
        'https://rss-to-json-serverless-api.vercel.app'
      ],
      corsProxies: [
        'https://corsproxy.io/?',
        'https://api.allorigins.win/raw?url=',
        'https://api.codetabs.com/v1/proxy?quest='
      ]
    },
    fallbackChain: [
      CORSStrategy.RSS2JSON,
      CORSStrategy.DIRECT,
      CORSStrategy.SERVICE_WORKER,
      CORSStrategy.JSONP,
      CORSStrategy.EXTENSION
    ]
  },
  protocols: {
    priority: ['RSS', 'JSON', 'API', 'IPFS', 'MASTODON', 'SSB'],
    settings: {},
    autoDetect: true,
    fallbackEnabled: true
  },
  verification: {
    minimumTrustRating: 60,
    preferredMethods: ['official', 'community', 'automated'],
    warningThreshold: 40,
    advancedSettings: {
      crossReference: true,
      machineLearning: true,
      highlightUnverified: true,
      crossReferenceCount: 2
    }
  },
  display: {
    theme: 'alliance',
    density: 'comfortable',
    fontSize: 14
  },
  general: {
    refreshInterval: 300000, // 5 minutes
    cacheSettings: {
      enabled: true,
      duration: 300000 // 5 minutes
    },
    notifications: {
      enabled: true,
      sound: false
    }
  }
};

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: (tab?: SettingsTab) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
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
        ...(newSettings.cors || {}),
        services: {
          ...prevSettings.cors.services,
          ...(newSettings.cors?.services || {})
        }
      },
      protocols: {
        ...prevSettings.protocols,
        ...(newSettings.protocols || {})
      },
      verification: {
        ...prevSettings.verification,
        ...(newSettings.verification || {})
      },
      display: {
        ...prevSettings.display,
        ...(newSettings.display || {})
      }
    }));
  };
  
  const resetSettings = (tab?: SettingsTab) => {
    if (tab) {
      // Reset only the specified tab
      setSettings(prevSettings => {
        const newSettings = { ...prevSettings };
        
        switch (tab) {
          case SettingsTab.CORS:
            newSettings.cors = { ...defaultSettings.cors };
            break;
          case SettingsTab.PROTOCOLS:
            newSettings.protocols = { ...defaultSettings.protocols };
            break;
          case SettingsTab.VERIFICATION:
            newSettings.verification = { ...defaultSettings.verification };
            break;
          case SettingsTab.DISPLAY:
            newSettings.display = { ...defaultSettings.display };
            break;
          case SettingsTab.ADVANCED:
            // Handle advanced settings when implemented
            break;
          default:
            // General or other tabs
            break;
        }
        
        return newSettings;
      });
    } else {
      // Reset all settings
      setSettings(defaultSettings);
    }
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
