import React, { useState, useEffect, memo } from 'react';
import { useSettings, SettingsTab } from '../../../contexts/SettingsContext';
import { SettingsIntegrationService } from '../../../services/SettingsIntegrationService';
import '../../../assets/styles/components/general-settings.css';

// Helper component for drag-and-drop reordering
const DraggableProtocolItem: React.FC<{
  protocol: string;
  index: number;
  moveProtocol: (dragIndex: number, hoverIndex: number) => void;
}> = ({ protocol, index, moveProtocol }) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', index.toString());
    setIsDragging(true);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    moveProtocol(dragIndex, index);
    setIsDragging(false);
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  return (
    <div 
      className={`protocol-item ${isDragging ? 'dragging' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
    >
      <span className="protocol-drag-handle">≡</span>
      <span className="protocol-name">{protocol.toUpperCase()}</span>
      <span className="protocol-priority-badge">Priority {index + 1}</span>
    </div>
  );
};

const ProtocolSettings: React.FC = memo(() => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [activeProtocol, setActiveProtocol] = useState<string>(settings.protocols.priority[0]);
  const [hasChanges, setHasChanges] = useState(false);
  const [protocolPriority, setProtocolPriority] = useState<string[]>(settings.protocols.priority);
  const [protocolSettings, setProtocolSettings] = useState<Record<string, any>>(settings.protocols.settings || {});
  
  // Initialize protocol settings if they don't exist
  useEffect(() => {
    const initializedSettings = { ...protocolSettings };
    
    // Ensure each protocol has default settings
    settings.protocols.priority.forEach(protocol => {
      if (!initializedSettings[protocol]) {
        initializedSettings[protocol] = {
          enabled: true,
          fetchLimit: 50,
          contentParsing: 'full',
          extractMedia: true
        };
      }
    });
    
    setProtocolSettings(initializedSettings);
  }, []);
  
  // Reset changes when component mounts or settings reset
  useEffect(() => {
    setProtocolPriority(settings.protocols.priority);
    setProtocolSettings(settings.protocols.settings || {});
    setHasChanges(false);
  }, [settings]);
  
  const moveProtocol = (dragIndex: number, hoverIndex: number) => {
    const draggedProtocol = protocolPriority[dragIndex];
    const newPriority = [...protocolPriority];
    
    // Remove dragged item
    newPriority.splice(dragIndex, 1);
    // Insert at new position
    newPriority.splice(hoverIndex, 0, draggedProtocol);
    
    setProtocolPriority(newPriority);
    setHasChanges(true);
  };
  
  const handleProtocolStatusChange = (protocol: string, enabled: boolean) => {
    setProtocolSettings({
      ...protocolSettings,
      [protocol]: {
        ...protocolSettings[protocol],
        enabled
      }
    });
    setHasChanges(true);
  };
  
  const handleFetchLimitChange = (protocol: string, limit: number) => {
    setProtocolSettings({
      ...protocolSettings,
      [protocol]: {
        ...protocolSettings[protocol],
        fetchLimit: limit
      }
    });
    setHasChanges(true);
  };
  
  const handleContentParsingChange = (protocol: string, parsing: string) => {
    setProtocolSettings({
      ...protocolSettings,
      [protocol]: {
        ...protocolSettings[protocol],
        contentParsing: parsing
      }
    });
    setHasChanges(true);
  };
  
  const handleMediaExtractionChange = (protocol: string, extract: boolean) => {
    setProtocolSettings({
      ...protocolSettings,
      [protocol]: {
        ...protocolSettings[protocol],
        extractMedia: extract
      }
    });
    setHasChanges(true);
  };
  
  const saveSettings = () => {
    updateSettings({
      protocols: {
        priority: protocolPriority,
        settings: protocolSettings,
        autoDetect: settings.protocols.autoDetect !== false,
        fallbackEnabled: settings.protocols.fallbackEnabled !== false
      }
    });
    setHasChanges(false);
    
    // Reset cache to ensure new settings are used
    SettingsIntegrationService.resetCache();
    
    // Show feedback
    const settingsPanel = document.querySelector('.settings-content');
    if (settingsPanel) {
      const feedback = document.createElement('div');
      feedback.className = 'settings-feedback success';
      feedback.textContent = 'Protocol settings applied successfully!';
      settingsPanel.appendChild(feedback);
      
      // Remove feedback after 3 seconds
      setTimeout(() => {
        feedback.remove();
      }, 3000);
    }
  };
  
  return (
    <div className="settings-form">
      <h2>Protocol Configuration</h2>
      
      <div className="settings-grid">
        <div className="settings-section">
          <h3>Intelligence Protocol Priority</h3>
          
          <div className="form-group">
            <p className="settings-description">
              Drag to reorder protocols by priority. Higher priority protocols will be used first.
            </p>
            
            <div className="protocol-list">
              {protocolPriority.map((protocol, index) => (
                <DraggableProtocolItem 
                  key={protocol}
                  protocol={protocol}
                  index={index}
                  moveProtocol={moveProtocol}
                />
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label>
              <input 
                type="checkbox" 
                checked={settings.protocols.autoDetect !== false}
                onChange={(e) => {
                  updateSettings({
                    protocols: {
                      ...settings.protocols,
                      autoDetect: e.target.checked
                    }
                  });
                  setHasChanges(true);
                }}
              />
              Automatically detect and use optimal protocol for feeds
            </label>
            <p className="settings-description">
              When enabled, the system will attempt to determine the best protocol for each feed
            </p>
          </div>
        </div>
        
        <div className="settings-section">
          <h3>Protocol-Specific Settings</h3>
          
          <div className="protocol-settings-tabs">
            {protocolPriority.map(protocol => (
              <button 
                key={protocol} 
                className={`protocol-tab ${protocol === activeProtocol ? 'active' : ''}`}
                onClick={() => setActiveProtocol(protocol)}
              >
                {protocol.toUpperCase()}
              </button>
            ))}
          </div>
          
          <div className="protocol-settings-content">
            {protocolPriority.map(protocol => (
              <div 
                key={protocol}
                className={`protocol-settings-panel ${protocol === activeProtocol ? 'active' : 'hidden'}`}
              >
                <div className="form-group">
                  <label>Protocol Status</label>
                  <select 
                    className="form-control"
                    value={protocolSettings[protocol]?.enabled ? 'enabled' : 'disabled'}
                    onChange={(e) => handleProtocolStatusChange(
                      protocol, 
                      e.target.value === 'enabled'
                    )}
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Fetch Limit</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={protocolSettings[protocol]?.fetchLimit || 50}
                    min="1" 
                    max="100"
                    onChange={(e) => handleFetchLimitChange(
                      protocol,
                      parseInt(e.target.value, 10)
                    )}
                  />
                  <p className="settings-description">
                    Maximum number of items to fetch per feed
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="settings-section">
          <h3>Advanced Protocol Options</h3>
          
          <div className="protocol-settings-content">
            {protocolPriority.map(protocol => (
              <div 
                key={protocol}
                className={`protocol-settings-panel ${protocol === activeProtocol ? 'active' : 'hidden'}`}
              >
                <div className="form-group">
                  <label>Content Parsing</label>
                  <select 
                    className="form-control"
                    value={protocolSettings[protocol]?.contentParsing || 'full'}
                    onChange={(e) => handleContentParsingChange(
                      protocol,
                      e.target.value
                    )}
                  >
                    <option value="full">Full Content</option>
                    <option value="summary">Summary Only</option>
                    <option value="metadata">Metadata Only</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={protocolSettings[protocol]?.extractMedia || false}
                      onChange={(e) => handleMediaExtractionChange(
                        protocol,
                        e.target.checked
                      )}
                    />
                    Enable content media extraction
                  </label>
                </div>
              </div>
            ))}
          </div>
          
          <div className="form-group">
            <label>
              <input 
                type="checkbox" 
                checked={settings.protocols.fallbackEnabled !== false}
                onChange={(e) => {
                  updateSettings({
                    protocols: {
                      ...settings.protocols,
                      fallbackEnabled: e.target.checked
                    }
                  });
                  setHasChanges(true);
                }}
              />
              Fallback to alternative protocols on failure
            </label>
            <p className="settings-description">
              Enable automatic fallback to other protocols when the primary protocol fails
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
          Apply Protocol Settings
        </button>
        <button 
          className="btn-secondary" 
          onClick={() => resetSettings(SettingsTab.PROTOCOLS)}
        >
          Reset to Defaults
        </button>
      </div>
      
      {hasChanges && (
        <div className="settings-feedback">
          <p>You have unsaved changes to your protocol settings.</p>
        </div>
      )}
    </div>
  );
});

export default ProtocolSettings;
