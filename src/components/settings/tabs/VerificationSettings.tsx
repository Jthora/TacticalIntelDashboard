import React, { useState, useEffect, useCallback } from 'react';
import { useSettings, SettingsTab } from '../../../contexts/SettingsContext';
import { SettingsIntegrationService } from '../../../services/SettingsIntegrationService';
import VerificationIndicator from '../../verification/VerificationIndicator';
import '../../../assets/styles/components/verification-settings.css';
import '../../../assets/styles/components/general-settings.css';

const VerificationSettings: React.FC = React.memo(() => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [hasChanges, setHasChanges] = useState(false);
  const [previewTrustRating, setPreviewTrustRating] = useState(75);
  const [verificationMethods, setVerificationMethods] = useState<string[]>(
    settings.verification.preferredMethods
  );
  const [crossReferenceCount, setCrossReferenceCount] = useState(2);
  const [advancedSettings, setAdvancedSettings] = useState({
    crossReference: true,
    machineLearning: true,
    highlightUnverified: true
  });
  
  useEffect(() => {
    // Reset state when settings are reset
    setVerificationMethods(settings.verification.preferredMethods);
    setHasChanges(false);
  }, [settings]);
  
  const handleTrustRatingChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      verification: {
        ...settings.verification,
        minimumTrustRating: parseInt(e.target.value, 10)
      }
    });
    setHasChanges(true);
    SettingsIntegrationService.resetCache();
  }, [settings.verification, updateSettings]);
  
  const handleWarningThresholdChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      verification: {
        ...settings.verification,
        warningThreshold: parseInt(e.target.value, 10)
      }
    });
    setHasChanges(true);
    SettingsIntegrationService.resetCache();
  }, [settings.verification, updateSettings]);
  
  const handleMethodToggle = useCallback((method: string) => {
    const currentMethods = [...verificationMethods];
    const index = currentMethods.indexOf(method);
    
    if (index >= 0) {
      // Remove method if it's already in the list
      currentMethods.splice(index, 1);
    } else {
      // Add method if it's not in the list
      currentMethods.push(method);
    }
    
    setVerificationMethods(currentMethods);
    
    // Update settings
    updateSettings({
      verification: {
        ...settings.verification,
        preferredMethods: currentMethods
      }
    });
    
    setHasChanges(true);
    SettingsIntegrationService.resetCache();
  }, [verificationMethods, settings.verification, updateSettings]);
  
  const moveMethod = (method: string, direction: 'up' | 'down') => {
    const currentMethods = [...verificationMethods];
    const index = currentMethods.indexOf(method);
    
    if (index < 0) return; // Method not found
    
    if (direction === 'up' && index > 0) {
      // Move method up
      [currentMethods[index - 1], currentMethods[index]] = 
        [currentMethods[index], currentMethods[index - 1]];
    } else if (direction === 'down' && index < currentMethods.length - 1) {
      // Move method down
      [currentMethods[index], currentMethods[index + 1]] = 
        [currentMethods[index + 1], currentMethods[index]];
    }
    
    setVerificationMethods(currentMethods);
    
    // Update settings
    updateSettings({
      verification: {
        ...settings.verification,
        preferredMethods: currentMethods
      }
    });
    
    setHasChanges(true);
    SettingsIntegrationService.resetCache();
  };
  
  const saveSettings = () => {
    // Update advanced settings
    updateSettings({
      verification: {
        ...settings.verification,
        advancedSettings: {
          crossReference: advancedSettings.crossReference,
          machineLearning: advancedSettings.machineLearning,
          highlightUnverified: advancedSettings.highlightUnverified,
          crossReferenceCount: crossReferenceCount
        }
      }
    });
    
    setHasChanges(false);
    SettingsIntegrationService.resetCache();
    
    // Show feedback
    const settingsPanel = document.querySelector('.settings-content');
    if (settingsPanel) {
      const feedback = document.createElement('div');
      feedback.className = 'settings-feedback success';
      feedback.textContent = 'Verification settings applied successfully!';
      settingsPanel.appendChild(feedback);
      
      // Remove feedback after 3 seconds
      setTimeout(() => {
        feedback.remove();
      }, 3000);
    }
  };
  
  return (
    <div className="settings-form">
      <h2>Intelligence Verification Parameters</h2>
      
      <div className="settings-grid">
        <div className="settings-section">
          <h3>Trust Rating Configuration</h3>
          
          <div className="form-group">
            <label htmlFor="min-trust-rating">
              Minimum Trust Rating: {settings.verification.minimumTrustRating}%
            </label>
            <input
              id="min-trust-rating"
              type="range"
              min="0"
              max="100"
              step="5"
              value={settings.verification.minimumTrustRating}
              onChange={handleTrustRatingChange}
            />
            <p className="settings-description">
              Intelligence sources below this rating will be flagged as potentially unreliable
            </p>
          </div>
          
          <div className="form-group">
            <label htmlFor="warning-threshold">
              Warning Threshold: {settings.verification.warningThreshold}%
            </label>
            <input
              id="warning-threshold"
              type="range"
              min="0"
              max="100"
              step="5"
              value={settings.verification.warningThreshold}
              onChange={handleWarningThresholdChange}
            />
            <p className="settings-description">
              Sources between minimum trust and this value will show warnings
            </p>
          </div>
          
          <div className="verification-preview">
            <h4>Verification Preview</h4>
            <div className="preview-controls">
              <label htmlFor="preview-trust-rating">Preview Trust Rating: {previewTrustRating}%</label>
              <input
                id="preview-trust-rating"
                type="range"
                min="0"
                max="100"
                step="5"
                value={previewTrustRating}
                onChange={(e) => setPreviewTrustRating(parseInt(e.target.value, 10))}
              />
            </div>
            
            <div className="preview-indicators">
              <div className="preview-item">
                <VerificationIndicator trustRating={previewTrustRating} source="Example Source" />
                <span className="preview-label">Standard Indicator</span>
              </div>
              
              <div className="preview-item">
                <VerificationIndicator trustRating={previewTrustRating} source="Example Source" compact={true} />
                <span className="preview-label">Compact Indicator</span>
              </div>
              
              <div className="preview-item">
                <VerificationIndicator trustRating={previewTrustRating} source="Example Source" showLabel={false} />
                <span className="preview-label">Icon Only</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="settings-section">
          <h3>Verification Methods</h3>
          
          <div className="form-group">
            <p className="settings-description">
              Select and prioritize verification methods to validate intelligence sources
            </p>
            
            <div className="verification-methods-list">
              {['official', 'community', 'automated', 'alliance', 'independent'].map((method) => (
                <div key={method} className="verification-method">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={verificationMethods.includes(method)}
                      onChange={() => handleMethodToggle(method)}
                    />
                    {method.charAt(0).toUpperCase() + method.slice(1)}
                  </label>
                  <div className="method-controls">
                    <span className="method-priority">
                      Priority: {verificationMethods.indexOf(method) + 1}
                    </span>
                    <button 
                      className="method-move-up"
                      onClick={() => moveMethod(method, 'up')}
                      disabled={!verificationMethods.includes(method) || verificationMethods.indexOf(method) === 0}
                    >
                      ▲
                    </button>
                    <button 
                      className="method-move-down"
                      onClick={() => moveMethod(method, 'down')}
                      disabled={!verificationMethods.includes(method) || verificationMethods.indexOf(method) === verificationMethods.length - 1}
                    >
                      ▼
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="settings-section">
          <h3>Advanced Verification</h3>
          
          <div className="form-group">
            <label>
              <input 
                type="checkbox" 
                checked={advancedSettings.crossReference}
                onChange={(e) => setAdvancedSettings({
                  ...advancedSettings,
                  crossReference: e.target.checked
                })}
              />
              Cross-reference intelligence against multiple sources
            </label>
          </div>
          
          <div className="form-group">
            <label>
              <input 
                type="checkbox" 
                checked={advancedSettings.machineLearning}
                onChange={(e) => setAdvancedSettings({
                  ...advancedSettings,
                  machineLearning: e.target.checked
                })}
              />
              Apply machine learning verification algorithms
            </label>
          </div>
          
          <div className="form-group">
            <label>
              <input 
                type="checkbox" 
                checked={advancedSettings.highlightUnverified}
                onChange={(e) => setAdvancedSettings({
                  ...advancedSettings,
                  highlightUnverified: e.target.checked
                })}
              />
              Highlight unverified intelligence in dashboard
            </label>
          </div>
          
          <div className="form-group">
            <label>Minimum Cross-References</label>
            <select 
              className="form-control"
              value={crossReferenceCount}
              onChange={(e) => setCrossReferenceCount(parseInt(e.target.value, 10))}
            >
              <option value={1}>1 (Minimal)</option>
              <option value={2}>2 (Standard)</option>
              <option value={3}>3 (Enhanced)</option>
              <option value={5}>5 (Maximum)</option>
            </select>
            <p className="settings-description">
              Number of independent sources required to mark intelligence as verified
            </p>
          </div>
        </div>
      </div>
      
      <div className="settings-actions">
        <button 
          className="btn-primary"
          onClick={saveSettings}
          disabled={!hasChanges}
        >
          Apply Verification Settings
        </button>
        <button 
          className="btn-secondary" 
          onClick={() => resetSettings(SettingsTab.VERIFICATION)}
        >
          Reset to Defaults
        </button>
      </div>
      
      {hasChanges && (
        <div className="settings-feedback">
          <p>You have unsaved changes to your verification settings.</p>
        </div>
      )}
    </div>
  );
});

export default VerificationSettings;
