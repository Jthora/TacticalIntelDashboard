# 🛠️ SETTINGS BUTTON & PAGE IMPLEMENTATION PLAN

## 📋 Overview

This document outlines the technical implementation plan for adding a Settings button and comprehensive Settings page to the Tactical Intelligence Dashboard. The Settings system will provide users with fine-grained control over CORS strategies, protocol preferences, and other "deep settings" that impact system functionality.

## 🎯 Implementation Goals

1. Add a settings button to the dashboard header (left side)
2. Create a modal-based settings interface with tab navigation
3. Implement CORS management UI with strategy selection and testing
4. Develop protocol preferences and other advanced settings
5. Ensure all settings persist between sessions

## 🧰 Technical Requirements

### Button Requirements

- **Location**: Left side of header
- **Icon**: Gear/cog SVG icon
- **States**: Default, hover (rotation), active (pressed), notification (dot)
- **Interaction**: Opens settings modal on click
- **Accessibility**: Proper ARIA labels and keyboard support

### Modal Requirements

- **Structure**: Tabbed interface with left navigation
- **Responsive**: Adapts to desktop and mobile layouts
- **Persistence**: Maintains tab selection between openings
- **Actions**: Save, reset, close

### Settings Context Requirements

- **State Management**: React Context API
- **Storage**: localStorage with versioning
- **Type Safety**: TypeScript interfaces for all settings
- **Default Values**: Sensible defaults for all settings

## 📝 Implementation Steps

### Phase 1: Button & Modal Foundation

1. **Create Settings Icon Component**
   ```jsx
   // src/components/icons/SettingsIcon.tsx
   import React from 'react';
   
   export const SettingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
     <svg 
       xmlns="http://www.w3.org/2000/svg" 
       viewBox="0 0 24 24" 
       fill="none" 
       stroke="currentColor" 
       strokeWidth="2" 
       strokeLinecap="round" 
       strokeLinejoin="round" 
       {...props}
     >
       <circle cx="12" cy="12" r="3"></circle>
       <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
     </svg>
   );
   ```

2. **Create Settings Button Component**
   ```jsx
   // src/components/settings/SettingsButton.tsx
   import React from 'react';
   import { SettingsIcon } from '../icons/SettingsIcon';
   import { useSettings } from '../../contexts/SettingsContext';
   
   interface SettingsButtonProps {
     onClick: () => void;
     hasNotification?: boolean;
   }
   
   export const SettingsButton: React.FC<SettingsButtonProps> = ({ 
     onClick, 
     hasNotification = false 
   }) => {
     return (
       <button
         className={`settings-button ${hasNotification ? 'has-notification' : ''}`}
         onClick={onClick}
         aria-label="Open Settings"
       >
         <SettingsIcon className="settings-icon" />
       </button>
     );
   };
   ```

3. **Add Button Styles**
   ```css
   /* src/assets/styles/components/settings-button.css */
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
   
   .settings-button.has-notification::after {
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

4. **Create Settings Context**
   ```typescript
   // src/contexts/SettingsContext.tsx
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
       settings: {}
     },
     verification: {
       minimumTrustRating: 60,
       preferredMethods: ['official', 'community', 'automated'],
       warningThreshold: 40
     },
     display: {
       theme: 'alliance',
       density: 'comfortable',
       fontSize: 14
     }
   };
   
   interface SettingsContextType {
     settings: Settings;
     updateSettings: (newSettings: Partial<Settings>) => void;
     resetSettings: (tab?: SettingsTab) => void;
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
         setSettings(prevSettings => ({
           ...prevSettings,
           [tab]: defaultSettings[tab]
         }));
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
   ```

5. **Create Settings Modal Shell**
   ```jsx
   // src/components/settings/SettingsModal.tsx
   import React, { useState } from 'react';
   import { useSettings, SettingsTab } from '../../contexts/SettingsContext';
   import { GeneralSettings } from './tabs/GeneralSettings';
   import { CORSSettings } from './tabs/CORSSettings';
   import { ProtocolSettings } from './tabs/ProtocolSettings';
   import { VerificationSettings } from './tabs/VerificationSettings';
   import { DisplaySettings } from './tabs/DisplaySettings';
   import { AdvancedSettings } from './tabs/AdvancedSettings';
   
   interface SettingsModalProps {
     onClose: () => void;
   }
   
   export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
     const { settings, updateSettings } = useSettings();
     const [activeTab, setActiveTab] = useState<SettingsTab>(settings.lastTab);
     
     const handleTabChange = (tab: SettingsTab) => {
       setActiveTab(tab);
       updateSettings({ lastTab: tab });
     };
     
     // Render the active tab content
     const renderTabContent = () => {
       switch (activeTab) {
         case SettingsTab.GENERAL:
           return <GeneralSettings />;
         case SettingsTab.CORS:
           return <CORSSettings />;
         case SettingsTab.PROTOCOLS:
           return <ProtocolSettings />;
         case SettingsTab.VERIFICATION:
           return <VerificationSettings />;
         case SettingsTab.DISPLAY:
           return <DisplaySettings />;
         case SettingsTab.ADVANCED:
           return <AdvancedSettings />;
         default:
           return <GeneralSettings />;
       }
     };
     
     return (
       <div className="settings-modal-overlay">
         <div className="settings-modal">
           <div className="settings-modal-header">
             <h2>Settings</h2>
             <button 
               className="settings-modal-close" 
               onClick={onClose}
               aria-label="Close Settings"
             >
               ✕
             </button>
           </div>
           
           <div className="settings-modal-content">
             <div className="settings-tabs">
               <ul>
                 {Object.values(SettingsTab).map(tab => (
                   <li 
                     key={tab}
                     className={tab === activeTab ? 'active' : ''}
                   >
                     <button onClick={() => handleTabChange(tab)}>
                       {tab.charAt(0).toUpperCase() + tab.slice(1)}
                     </button>
                   </li>
                 ))}
               </ul>
             </div>
             
             <div className="settings-tab-content">
               {renderTabContent()}
             </div>
           </div>
         </div>
       </div>
     );
   };
   ```

6. **Add Modal Styles**
   ```css
   /* src/assets/styles/components/settings-modal.css */
   .settings-modal-overlay {
     position: fixed;
     top: 0;
     left: 0;
     right: 0;
     bottom: 0;
     background-color: rgba(0, 0, 0, 0.5);
     display: flex;
     align-items: center;
     justify-content: center;
     z-index: 1000;
     animation: fadeIn 0.2s ease;
   }
   
   .settings-modal {
     background: var(--panel-bg);
     border-radius: 8px;
     box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
     width: 90%;
     max-width: 900px;
     max-height: 90vh;
     display: flex;
     flex-direction: column;
     animation: scaleIn 0.2s ease;
   }
   
   .settings-modal-header {
     display: flex;
     justify-content: space-between;
     align-items: center;
     padding: 16px 24px;
     border-bottom: 1px solid var(--border-color);
   }
   
   .settings-modal-header h2 {
     margin: 0;
     font-size: 1.5rem;
   }
   
   .settings-modal-close {
     background: none;
     border: none;
     font-size: 1.25rem;
     cursor: pointer;
     color: var(--text-secondary);
     transition: color 0.2s ease;
   }
   
   .settings-modal-close:hover {
     color: var(--text-color);
   }
   
   .settings-modal-content {
     display: flex;
     flex: 1;
     overflow: hidden;
   }
   
   .settings-tabs {
     width: 200px;
     border-right: 1px solid var(--border-color);
     overflow-y: auto;
   }
   
   .settings-tabs ul {
     list-style: none;
     padding: 0;
     margin: 0;
   }
   
   .settings-tabs li {
     margin: 0;
   }
   
   .settings-tabs li button {
     display: block;
     width: 100%;
     padding: 12px 16px;
     text-align: left;
     background: none;
     border: none;
     cursor: pointer;
     color: var(--text-secondary);
     transition: background-color 0.2s ease, color 0.2s ease;
   }
   
   .settings-tabs li.active button {
     background-color: var(--selection-bg);
     color: var(--text-color);
     font-weight: 500;
   }
   
   .settings-tabs li button:hover {
     background-color: var(--hover-bg);
     color: var(--text-color);
   }
   
   .settings-tab-content {
     flex: 1;
     padding: 24px;
     overflow-y: auto;
   }
   
   /* Animations */
   @keyframes fadeIn {
     from { opacity: 0; }
     to { opacity: 1; }
   }
   
   @keyframes scaleIn {
     from { transform: scale(0.95); opacity: 0; }
     to { transform: scale(1); opacity: 1; }
   }
   
   /* Responsive adjustments */
   @media (max-width: 768px) {
     .settings-modal-content {
       flex-direction: column;
     }
     
     .settings-tabs {
       width: 100%;
       border-right: none;
       border-bottom: 1px solid var(--border-color);
     }
     
     .settings-tabs ul {
       display: flex;
       overflow-x: auto;
     }
     
     .settings-tabs li {
       flex: 0 0 auto;
     }
   }
   ```

### Phase 2: Add Settings Button to Header

1. **Update Header Component**
   ```jsx
   // src/components/Header.tsx
   import React, { useState } from 'react';
   import { SettingsButton } from './settings/SettingsButton';
   import { SettingsModal } from './settings/SettingsModal';
   
   export const Header: React.FC = () => {
     const [settingsOpen, setSettingsOpen] = useState(false);
     
     return (
       <header className="dashboard-header">
         <div className="header-left">
           <SettingsButton 
             onClick={() => setSettingsOpen(true)} 
             hasNotification={false} 
           />
           {/* Other left header elements */}
         </div>
         
         <h1>Tactical Intelligence Dashboard</h1>
         
         <div className="header-right">
           {/* Right header elements */}
         </div>
         
         {settingsOpen && (
           <SettingsModal onClose={() => setSettingsOpen(false)} />
         )}
       </header>
     );
   };
   ```

### Phase 3: Implement CORS Settings Tab

1. **Create CORS Settings Component**
   ```jsx
   // src/components/settings/tabs/CORSSettings.tsx
   import React from 'react';
   import { useSettings, CORSStrategy } from '../../../contexts/SettingsContext';
   import { CORSTestUtility } from '../CORSTestUtility';
   
   export const CORSSettings: React.FC = () => {
     const { settings, updateSettings, resetSettings } = useSettings();
     
     const handleDefaultStrategyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
       updateSettings({
         cors: {
           ...settings.cors,
           defaultStrategy: e.target.value as CORSStrategy
         }
       });
     };
     
     const handleProtocolStrategyChange = (protocol: string, strategy: CORSStrategy) => {
       updateSettings({
         cors: {
           ...settings.cors,
           protocolStrategies: {
             ...settings.cors.protocolStrategies,
             [protocol]: strategy
           }
         }
       });
     };
     
     const handleServiceToggle = (service: string, type: 'rss2json' | 'corsProxies', checked: boolean) => {
       const services = [...settings.cors.services[type]];
       
       if (checked && !services.includes(service)) {
         services.push(service);
       } else if (!checked && services.includes(service)) {
         const index = services.indexOf(service);
         services.splice(index, 1);
       }
       
       updateSettings({
         cors: {
           ...settings.cors,
           services: {
             ...settings.cors.services,
             [type]: services
           }
         }
       });
     };
     
     return (
       <div className="settings-tab cors-settings">
         <h2>CORS Management</h2>
         
         <div className="settings-section">
           <h3>CORS Strategy Selection</h3>
           
           <div className="settings-option">
             <label htmlFor="default-cors-strategy">Default CORS Strategy</label>
             <select 
               id="default-cors-strategy"
               value={settings.cors.defaultStrategy}
               onChange={handleDefaultStrategyChange}
             >
               <option value={CORSStrategy.RSS2JSON}>RSS2JSON Services (Recommended)</option>
               <option value={CORSStrategy.JSONP}>JSONP Approach</option>
               <option value={CORSStrategy.SERVICE_WORKER}>Browser Service Worker Proxy</option>
               <option value={CORSStrategy.DIRECT}>Direct Fetch (CORS-Friendly Only)</option>
               <option value={CORSStrategy.EXTENSION}>Browser Extension</option>
             </select>
             <p className="settings-description">
               The primary method used to bypass CORS restrictions when fetching feeds.
             </p>
           </div>
           
           <div className="settings-option">
             <h4>Protocol-Specific Strategies</h4>
             
             {['RSS', 'JSON', 'API', 'IPFS', 'MASTODON', 'SSB'].map(protocol => (
               <div className="protocol-strategy" key={protocol}>
                 <label htmlFor={`${protocol}-strategy`}>{protocol}</label>
                 <select
                   id={`${protocol}-strategy`}
                   value={settings.cors.protocolStrategies[protocol] || 'DEFAULT'}
                   onChange={(e) => handleProtocolStrategyChange(
                     protocol, 
                     e.target.value === 'DEFAULT' 
                       ? undefined 
                       : e.target.value as CORSStrategy
                   )}
                 >
                   <option value="DEFAULT">Use Default Strategy</option>
                   <option value={CORSStrategy.RSS2JSON}>RSS2JSON Services</option>
                   <option value={CORSStrategy.JSONP}>JSONP Approach</option>
                   <option value={CORSStrategy.SERVICE_WORKER}>Browser Service Worker Proxy</option>
                   <option value={CORSStrategy.DIRECT}>Direct Fetch</option>
                   <option value={CORSStrategy.EXTENSION}>Browser Extension</option>
                 </select>
               </div>
             ))}
           </div>
         </div>
         
         <div className="settings-section">
           <h3>RSS2JSON Service Configuration</h3>
           
           <div className="service-list">
             <h4>Available Services:</h4>
             {settings.cors.services.rss2json.map(service => (
               <div className="service-item" key={service}>
                 <label>
                   <input
                     type="checkbox"
                     checked={settings.cors.services.rss2json.includes(service)}
                     onChange={(e) => handleServiceToggle(service, 'rss2json', e.target.checked)}
                   />
                   {service}
                 </label>
               </div>
             ))}
             
             <button className="add-service-button">
               + Add Custom Service
             </button>
           </div>
           
           <div className="service-list">
             <h4>CORS Proxies:</h4>
             {settings.cors.services.corsProxies.map(proxy => (
               <div className="service-item" key={proxy}>
                 <label>
                   <input
                     type="checkbox"
                     checked={settings.cors.services.corsProxies.includes(proxy)}
                     onChange={(e) => handleServiceToggle(proxy, 'corsProxies', e.target.checked)}
                   />
                   {proxy}
                 </label>
               </div>
             ))}
             
             <button className="add-service-button">
               + Add Custom Proxy
             </button>
           </div>
         </div>
         
         <CORSTestUtility />
         
         <div className="settings-actions">
           <button 
             className="reset-button" 
             onClick={() => resetSettings(SettingsTab.CORS)}
           >
             Reset CORS Settings
           </button>
         </div>
       </div>
     );
   };
   ```

2. **Create CORS Test Utility Component**
   ```jsx
   // src/components/settings/CORSTestUtility.tsx
   import React, { useState } from 'react';
   import { useSettings, CORSStrategy } from '../../contexts/SettingsContext';
   
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
         // Simulate testing - this would normally use the CORSStrategyManager
         await new Promise(resolve => setTimeout(resolve, 1500));
         
         // For demonstration - this would be the actual result from fetch
         const success = Math.random() > 0.3; // 70% success rate for demo
         
         if (success) {
           setTestResult({
             success: true,
             message: `Successfully fetched feed using ${testStrategy === 'DEFAULT' ? settings.cors.defaultStrategy : testStrategy}`,
             items: Math.floor(Math.random() * 20) + 5,
             recommendations: [
               `Continue using ${testStrategy === 'DEFAULT' ? settings.cors.defaultStrategy : testStrategy} for this feed`,
               'Consider caching this feed (low update frequency)'
             ]
           });
         } else {
           setTestResult({
             success: false,
             message: 'Failed to fetch feed',
             error: 'CORS policy blocked request',
             recommendations: [
               'Try a different CORS strategy',
               'Check if the URL is correct',
               'Consider using a CORS-friendly feed'
             ]
           });
         }
       } catch (error) {
         setTestResult({
           success: false,
           message: 'Test failed',
           error: error.message,
           recommendations: [
             'Check your internet connection',
             'Verify the URL is correct'
           ]
         });
       } finally {
         setIsLoading(false);
       }
     };
     
     return (
       <div className="settings-section">
         <h3>CORS Test Utility</h3>
         
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
               {isLoading ? 'Testing...' : 'Test Connection'}
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

### Phase 4: Integration with App

1. **Add SettingsProvider to App**
   ```jsx
   // src/App.tsx
   import React from 'react';
   import { SettingsProvider } from './contexts/SettingsContext';
   import { Dashboard } from './components/Dashboard';
   
   const App: React.FC = () => {
     return (
       <SettingsProvider>
         <Dashboard />
       </SettingsProvider>
     );
   };
   
   export default App;
   ```

2. **Update Feed Service to Use Settings**
   ```typescript
   // src/services/FeedService.ts
   import { useSettings } from '../contexts/SettingsContext';
   import { CORSStrategyManager } from './CORSStrategyManager';
   
   export const useFeedService = () => {
     const { settings } = useSettings();
     const corsManager = new CORSStrategyManager(settings);
     
     const fetchFeed = async (url: string, protocol?: string) => {
       try {
         return await corsManager.fetchWithStrategies(url, protocol);
       } catch (error) {
         console.error('Feed fetch failed:', error);
         throw error;
       }
     };
     
     return {
       fetchFeed
     };
   };
   ```

## 🧪 Testing Plan

1. **Unit Tests**
   - Test SettingsContext state updates
   - Test settings persistence to localStorage
   - Test CORS test utility

2. **Integration Tests**
   - Test modal opening/closing from button
   - Test tab navigation
   - Test settings application to feed fetching

3. **UI Tests**
   - Test responsive behavior on mobile
   - Test keyboard navigation
   - Test form controls

## 📅 Implementation Timeline

| Week | Tasks |
|------|-------|
| 1 | Create Settings Context, button, and modal shell |
| 2 | Implement CORS Settings tab and test utility |
| 3 | Implement other settings tabs and integrate with services |
| 4 | Testing, refinement, and documentation |

## 🎭 User Experience Considerations

1. **Discoverability**
   - Settings button with recognizable gear icon
   - Tooltip on hover for clarity
   - Slight animation to draw attention

2. **Learnability**
   - Clear labels and descriptions for settings
   - Organized tab structure
   - Default values that work out of the box

3. **Efficiency**
   - Persistent tab selection
   - Quick reset options
   - Immediate feedback on changes

4. **Error Prevention**
   - Confirmation for destructive actions
   - Input validation
   - Clear error messages

## 🔄 Next Steps

After implementing the settings button and modal:

1. Create the CORS Strategy Manager service
2. Update feed fetching logic to use settings
3. Implement adaptive strategy selection
4. Add performance metrics tracking
5. Extend with additional advanced settings

---

**CLASSIFICATION: EARTH ALLIANCE CONFIDENTIAL**

*This document outlines the implementation plan for the Settings button and page in the Tactical Intelligence Dashboard, with particular focus on CORS management functionality to enhance the dashboard's ability to access diverse information sources.*
