import React, { useState, useEffect, useCallback, memo } from 'react';
import { useSettings, CORSStrategy, SettingsTab } from '../../../contexts/SettingsContext';
import DebugInfo from '../../debug/DebugInfo';
import { SettingsIntegrationService } from '../../../services/SettingsIntegrationService';
import { FetchService } from '../../../services/FetchService';
import '../../../assets/styles/components/cors-settings.css';

const CORSSettings: React.FC = memo(() => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [testUrl, setTestUrl] = useState('https://rss.nytimes.com/services/xml/rss/nyt/World.xml');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [testResults, setTestResults] = useState<Record<CORSStrategy, { status: string, time?: number, message?: string }>>(
    Object.values(CORSStrategy).reduce((acc, strategy) => {
      acc[strategy] = { status: 'untested' };
      return acc;
    }, {} as Record<CORSStrategy, { status: string, time?: number, message?: string }>)
  );
  const [newProxyUrl, setNewProxyUrl] = useState('');
  const [newServiceUrl, setNewServiceUrl] = useState('');
  
  // Reset status when settings change
  useEffect(() => {
    setHasChanges(true);
  }, [settings.cors]);
  
  const handleDefaultStrategyChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({
      cors: {
        ...settings.cors,
        defaultStrategy: e.target.value as CORSStrategy
      }
    });
    setHasChanges(true);
    
    // Update the SettingsIntegrationService cache
    SettingsIntegrationService.resetCache();
  }, [settings.cors, updateSettings]);
  
  const handleProtocolStrategyChange = useCallback((protocol: string, value: string) => {
    const newProtocolStrategies = { ...settings.cors.protocolStrategies };
    
    if (value === 'DEFAULT') {
      // Remove protocol-specific strategy to use default
      delete newProtocolStrategies[protocol];
    } else {
      // Set protocol-specific strategy
      newProtocolStrategies[protocol] = value as CORSStrategy;
    }
    
    updateSettings({
      cors: {
        ...settings.cors,
        protocolStrategies: newProtocolStrategies
      }
    });
    setHasChanges(true);
    
    // Update the SettingsIntegrationService cache
    SettingsIntegrationService.resetCache();
  }, [settings.cors, updateSettings]);
  
  
  // Test CORS strategy functionality
  const testCORSStrategy = async (strategy: CORSStrategy) => {
    try {
      setTestResults(prev => ({
        ...prev,
        [strategy]: { status: 'testing' }
      }));
      
      // Force the specific strategy for this test
      const originalStrategy = SettingsIntegrationService.getCORSStrategy();
      updateSettings({
        cors: {
          ...settings.cors,
          defaultStrategy: strategy
        }
      });
      
      // Reset cache to ensure the new strategy is used
      SettingsIntegrationService.resetCache();
      
      // Start timer
      const startTime = performance.now();
      
      // Perform the test - ignore the protocol detection for testing simplicity
      await FetchService.testCORSStrategy(testUrl, strategy);
      
      // Calculate time taken
      const timeTaken = Math.round(performance.now() - startTime);
      
      // Restore original strategy
      updateSettings({
        cors: {
          ...settings.cors,
          defaultStrategy: originalStrategy
        }
      });
      SettingsIntegrationService.resetCache();
      
      // Update test results
      setTestResults(prev => ({
        ...prev,
        [strategy]: { 
          status: 'success', 
          time: timeTaken 
        }
      }));
      
      return true;
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [strategy]: { 
          status: 'error', 
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
      return false;
    }
  };
  
  // Test all strategies
  const testAllStrategies = async () => {
    setTestStatus('testing');
    setTestMessage('Testing all CORS strategies...');
    
    const results = [];
    for (const strategy of Object.values(CORSStrategy)) {
      results.push(await testCORSStrategy(strategy));
    }
    
    if (results.some(result => result)) {
      setTestStatus('success');
      setTestMessage('At least one CORS strategy works for this URL');
    } else {
      setTestStatus('error');
      setTestMessage('All CORS strategies failed. Please check your network or the URL.');
    }
  };
  
  // Add a new RSS2JSON service
  const addRSS2JSONService = () => {
    if (newServiceUrl && !settings.cors.services.rss2json.includes(newServiceUrl)) {
      updateSettings({
        cors: {
          ...settings.cors,
          services: {
            ...settings.cors.services,
            rss2json: [...settings.cors.services.rss2json, newServiceUrl]
          }
        }
      });
      setNewServiceUrl('');
      setHasChanges(true);
      SettingsIntegrationService.resetCache();
    }
  };
  
  // Add a new CORS proxy
  const addCORSProxy = () => {
    if (newProxyUrl && !settings.cors.services.corsProxies.includes(newProxyUrl)) {
      updateSettings({
        cors: {
          ...settings.cors,
          services: {
            ...settings.cors.services,
            corsProxies: [...settings.cors.services.corsProxies, newProxyUrl]
          }
        }
      });
      setNewProxyUrl('');
      setHasChanges(true);
      SettingsIntegrationService.resetCache();
    }
  };
  
  // Remove a service or proxy
  const removeService = (type: 'rss2json' | 'corsProxies', url: string) => {
    updateSettings({
      cors: {
        ...settings.cors,
        services: {
          ...settings.cors.services,
          [type]: settings.cors.services[type].filter(s => s !== url)
        }
      }
    });
    setHasChanges(true);
    SettingsIntegrationService.resetCache();
  };
  
  // Apply changes
  const applyChanges = () => {
    // Reset cache to ensure settings are reloaded
    SettingsIntegrationService.resetCache();
    setHasChanges(false);
    
    // Show feedback
    const settingsPanel = document.querySelector('.settings-content');
    if (settingsPanel) {
      const feedback = document.createElement('div');
      feedback.className = 'settings-feedback success';
      feedback.textContent = 'CORS settings applied successfully!';
      settingsPanel.appendChild(feedback);
      
      // Remove feedback after 3 seconds
      setTimeout(() => {
        feedback.remove();
      }, 3000);
    }
  };
  
  return (
    <div className="settings-form">
      <DebugInfo componentName="CORSSettings" />
      <h2>CORS Management</h2>
      
      <div className="settings-section">
        <h3>CORS Strategy Selection</h3>
        
        <div className="form-group">
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
        
        <div className="form-group">
          <h4>Protocol-Specific Strategies</h4>
          
          {['RSS', 'JSON', 'API', 'IPFS', 'MASTODON', 'SSB'].map(protocol => (
            <div className="protocol-strategy form-group" key={protocol}>
              <label htmlFor={`${protocol}-strategy`}>{protocol}</label>
              <select
                id={`${protocol}-strategy`}
                value={settings.cors.protocolStrategies[protocol] || 'DEFAULT'}
                onChange={(e) => handleProtocolStrategyChange(protocol, e.target.value)}
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
        
        <div className="form-group">
          <h4>Available Services:</h4>
          {settings.cors.services.rss2json.map(service => (
            <div className="service-item" key={service}>
              <div className="service-url">{service}</div>
              <button 
                className="btn-icon remove-service" 
                onClick={() => removeService('rss2json', service)}
                title="Remove service"
              >
                ✕
              </button>
            </div>
          ))}
          
          <div className="add-service-form">
            <input
              type="text"
              placeholder="Enter new RSS2JSON service URL"
              value={newServiceUrl}
              onChange={(e) => setNewServiceUrl(e.target.value)}
            />
            <button 
              className="btn-primary"
              onClick={addRSS2JSONService}
            >
              Add Service
            </button>
          </div>
        </div>
        
        <div className="form-group">
          <h4>CORS Proxies:</h4>
          {settings.cors.services.corsProxies.map(proxy => (
            <div className="service-item" key={proxy}>
              <div className="service-url">{proxy}</div>
              <button 
                className="btn-icon remove-service" 
                onClick={() => removeService('corsProxies', proxy)}
                title="Remove proxy"
              >
                ✕
              </button>
            </div>
          ))}
          
          <div className="add-service-form">
            <input
              type="text"
              placeholder="Enter new CORS proxy URL"
              value={newProxyUrl}
              onChange={(e) => setNewProxyUrl(e.target.value)}
            />
            <button 
              className="btn-primary"
              onClick={addCORSProxy}
            >
              Add Proxy
            </button>
          </div>
        </div>
      </div>
      
      <div className="settings-section">
        <h3>CORS Test Utility</h3>
        <div className="cors-test-form">
          <input
            type="text"
            placeholder="Enter URL to test CORS strategies"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
          />
          <button 
            className={`btn-primary ${testStatus === 'testing' ? 'loading' : ''}`}
            onClick={testAllStrategies}
            disabled={testStatus === 'testing'}
          >
            {testStatus === 'testing' ? 'Testing...' : 'Test CORS Strategies'}
          </button>
        </div>
        
        {testStatus !== 'idle' && (
          <div className={`test-results ${testStatus}`}>
            <p className="test-message">{testMessage}</p>
            
            <div className="strategy-results">
              {Object.entries(testResults).map(([strategy, result]) => (
                <div className={`strategy-result ${result.status}`} key={strategy}>
                  <div className="strategy-name">{strategy}</div>
                  <div className="strategy-status">
                    {result.status === 'success' ? 
                      `✓ Success (${result.time}ms)` : 
                      result.status === 'testing' ? 
                      '⟳ Testing...' : 
                      result.status === 'error' ? 
                      `✕ Failed${result.message ? `: ${result.message}` : ''}` :
                      '◯ Not tested'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="settings-actions">
        <button 
          className="btn-primary" 
          onClick={applyChanges}
          disabled={!hasChanges}
        >
          Apply CORS Settings
        </button>
        <button 
          className="btn-secondary" 
          onClick={() => resetSettings(SettingsTab.CORS)}
        >
          Reset CORS Settings
        </button>
      </div>
      
      {hasChanges && (
        <div className="settings-feedback">
          <p>You have unsaved changes to your CORS settings.</p>
        </div>
      )}
    </div>
  );
});

CORSSettings.displayName = 'CORSSettings';

export default CORSSettings;
