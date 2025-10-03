import React, { createContext, useContext, useEffect,useState } from 'react';

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
  INTEGRATION = 'integration',
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
    export?: {
      format: 'json' | 'csv' | 'xml' | 'pdf';
      autoExport: boolean;
      includeMetadata: boolean;
      compress: boolean;
      encrypt: boolean;
    };
    share?: {
      enabled: boolean;
      defaultHashtags: string[];
      attribution: string;
    };
  };
}

const defaultSettings: Settings = {
  version: '1.0.0',
  lastTab: SettingsTab.GENERAL,
  cors: {
    defaultStrategy: CORSStrategy.DIRECT, // Changed to DIRECT to use CORS proxies directly
    protocolStrategies: {},
    services: {
      rss2json: [
        'https://rss2json.vercel.app/api',
        'https://api.rss2json.com/v1/api.json',
        'https://feed2json.org/convert',
        'https://rss-to-json-serverless-api.vercel.app'
      ],
      corsProxies: [
        'https://api.codetabs.com/v1/proxy?quest=',
        'https://corsproxy.io/?',
        'https://api.allorigins.win/raw?url='
      ]
    },
    fallbackChain: [
      CORSStrategy.DIRECT, // Try CORS proxies first
      CORSStrategy.RSS2JSON,
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
    },
    export: {
      format: 'json',
      autoExport: false,
      includeMetadata: true,
      compress: false,
      encrypt: true
    },
    share: {
      enabled: true,
      defaultHashtags: ['intelwatch'],
      attribution: 'via Tactical Intel Dashboard'
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
    setSettings(prevSettings => {
      const prevGeneral = prevSettings.general ?? defaultSettings.general!;
      const incomingGeneral = newSettings.general;

      const mergedGeneral = {
        refreshInterval: incomingGeneral?.refreshInterval ?? prevGeneral.refreshInterval,
        cacheSettings: {
          enabled: incomingGeneral?.cacheSettings?.enabled ?? prevGeneral.cacheSettings.enabled,
          duration: incomingGeneral?.cacheSettings?.duration ?? prevGeneral.cacheSettings.duration
        },
        notifications: {
          enabled: incomingGeneral?.notifications?.enabled ?? prevGeneral.notifications.enabled,
          sound: incomingGeneral?.notifications?.sound ?? prevGeneral.notifications.sound
        }
      } as NonNullable<Settings['general']>;

      if (prevGeneral.export || incomingGeneral?.export) {
        const fallbackExport: NonNullable<Settings['general']>['export'] = prevGeneral.export
          ?? defaultSettings.general?.export
          ?? {
            format: 'json',
            autoExport: false,
            includeMetadata: true,
            compress: false,
            encrypt: true
          };

        mergedGeneral.export = {
          ...fallbackExport,
          ...(incomingGeneral?.export || {})
        };
      }

      if (prevGeneral.share || incomingGeneral?.share) {
        const fallbackShare = prevGeneral.share
          ?? defaultSettings.general?.share
          ?? {
            enabled: true,
            defaultHashtags: ['intelwatch'],
            attribution: 'via Tactical Intel Dashboard'
          };

        mergedGeneral.share = {
          ...fallbackShare,
          ...(incomingGeneral?.share || {})
        };
      }

      return {
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
        },
        general: mergedGeneral
      };
    });
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
