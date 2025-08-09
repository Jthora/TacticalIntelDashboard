import './Export.css';

import React, { useEffect,useState } from 'react';

import { useSettings } from '../contexts/SettingsContext';

export type ExportFormat = 'json' | 'csv' | 'xml' | 'pdf' | 'intel' | 'intelreport';

export interface ExportOptions {
  includeMetadata: boolean;
  compress: boolean;
  encrypt: boolean;
}

interface ExportProps {
  // Optional props for parent components to control or observe export state
  onAutoExportChange?: (enabled: boolean) => void;
  onExportSettingsOpen?: () => void;
  onFormatSelect?: (format: ExportFormat) => void;
  onOptionsChange?: (options: ExportOptions) => void;
  onExecuteExport?: (format: ExportFormat | null, options: ExportOptions) => void;
  initialAutoExport?: boolean;
  initialOptions?: Partial<ExportOptions>;
}

const Export: React.FC<ExportProps> = ({
  onAutoExportChange,
  onExportSettingsOpen,
  onFormatSelect,
  onOptionsChange,
  onExecuteExport,
  initialAutoExport = false,
  initialOptions = {},
}) => {
  const { settings, updateSettings } = useSettings();
  
  // Initialize from settings instead of props
  const [autoExport, setAutoExport] = useState<boolean>(() => 
    settings?.general?.export?.autoExport ?? initialAutoExport
  );
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(() =>
    settings?.general?.export?.format as ExportFormat ?? null
  );
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeMetadata: settings?.general?.export?.includeMetadata ?? true,
    compress: settings?.general?.export?.compress ?? false,
    encrypt: settings?.general?.export?.encrypt ?? true,
    ...initialOptions,
  });

  // Sync with settings when they change
  useEffect(() => {
    if (settings?.general?.export) {
      const exportSettings = settings.general.export;
      setAutoExport(exportSettings.autoExport ?? false);
      setSelectedFormat(exportSettings.format as ExportFormat ?? null);
      setExportOptions(prev => ({
        ...prev,
        includeMetadata: exportSettings.includeMetadata ?? prev.includeMetadata,
        compress: exportSettings.compress ?? prev.compress,
        encrypt: exportSettings.encrypt ?? prev.encrypt,
      }));
    }
  }, [settings?.general?.export]);

  const handleAutoExportToggle = () => {
    const newAutoExport = !autoExport;
    setAutoExport(newAutoExport);
    
    // Update settings
    updateSettings({
      general: {
        refreshInterval: settings.general?.refreshInterval ?? 300000,
        cacheSettings: settings.general?.cacheSettings ?? { enabled: true, duration: 300000 },
        notifications: settings.general?.notifications ?? { enabled: true, sound: false },
        export: {
          format: settings.general?.export?.format as any ?? 'json',
          autoExport: newAutoExport,
          includeMetadata: settings.general?.export?.includeMetadata ?? true,
          compress: settings.general?.export?.compress ?? false,
          encrypt: settings.general?.export?.encrypt ?? true,
        }
      }
    });
    
    onAutoExportChange?.(newAutoExport);
  };

  const handleExportSettingsClick = () => {
    onExportSettingsOpen?.();
  };

  const handleFormatClick = (format: ExportFormat) => {
    setSelectedFormat(format);
    
    // Update settings
    updateSettings({
      general: {
        refreshInterval: settings.general?.refreshInterval ?? 300000,
        cacheSettings: settings.general?.cacheSettings ?? { enabled: true, duration: 300000 },
        notifications: settings.general?.notifications ?? { enabled: true, sound: false },
        export: {
          format: format as any,
          autoExport: settings.general?.export?.autoExport ?? false,
          includeMetadata: settings.general?.export?.includeMetadata ?? true,
          compress: settings.general?.export?.compress ?? false,
          encrypt: settings.general?.export?.encrypt ?? true,
        }
      }
    });
    
    onFormatSelect?.(format);
  };

  const handleOptionToggle = (option: keyof ExportOptions) => {
    const newOptions = {
      ...exportOptions,
      [option]: !exportOptions[option],
    };
    setExportOptions(newOptions);
    
    // Update settings
    updateSettings({
      general: {
        refreshInterval: settings.general?.refreshInterval ?? 300000,
        cacheSettings: settings.general?.cacheSettings ?? { enabled: true, duration: 300000 },
        notifications: settings.general?.notifications ?? { enabled: true, sound: false },
        export: {
          format: settings.general?.export?.format as any ?? 'json',
          autoExport: settings.general?.export?.autoExport ?? false,
          includeMetadata: option === 'includeMetadata' ? newOptions.includeMetadata : settings.general?.export?.includeMetadata ?? true,
          compress: option === 'compress' ? newOptions.compress : settings.general?.export?.compress ?? false,
          encrypt: option === 'encrypt' ? newOptions.encrypt : settings.general?.export?.encrypt ?? true,
        }
      }
    });
    
    onOptionsChange?.(newOptions);
  };

  const handleExecuteExport = () => {
    onExecuteExport?.(selectedFormat, exportOptions);
  };

  return (
    <div className="tactical-module module-export">
      <div className="tactical-header-enhanced">
        <div className="header-primary">
          <span className="module-icon">📦</span>
          <h3>EXPORT</h3>
        </div>
        <div className="header-controls-micro">
          <button 
            className={`micro-btn ${autoExport ? 'active' : ''}`}
            onClick={handleAutoExportToggle}
            title="Auto Export"
          >
            ⏰
          </button>
          <button 
            className="micro-btn" 
            onClick={handleExportSettingsClick}
            title="Export Settings"
          >
            ⚙
          </button>
        </div>
      </div>
      <div className="tactical-content">
        <div className="export-quick-grid">
          <button 
            className={`export-btn-micro json ${selectedFormat === 'json' ? 'selected' : ''}`}
            onClick={() => handleFormatClick('json')}
          >
            JSON
          </button>
          <button 
            className={`export-btn-micro csv ${selectedFormat === 'csv' ? 'selected' : ''}`}
            onClick={() => handleFormatClick('csv')}
          >
            CSV
          </button>
          <button 
            className={`export-btn-micro xml ${selectedFormat === 'xml' ? 'selected' : ''}`}
            onClick={() => handleFormatClick('xml')}
          >
            XML
          </button>
          <button 
            className={`export-btn-micro pdf ${selectedFormat === 'pdf' ? 'selected' : ''}`}
            onClick={() => handleFormatClick('pdf')}
          >
            PDF
          </button>
          <button 
            className={`export-btn-micro intel ${selectedFormat === 'intel' ? 'selected' : ''}`}
            onClick={() => handleFormatClick('intel')}
          >
            INTEL
          </button>
          <button 
            className={`export-btn-micro intel ${selectedFormat === 'intelreport' ? 'selected' : ''}`}
            onClick={() => handleFormatClick('intelreport')}
          >
            INTELREPORT
          </button>
        </div>
        
        <div className="export-options-micro">
          <div className="option-row">
            <span className="option-label">INCLUDE METADATA</span>
            <button 
              className={`option-toggle ${exportOptions.includeMetadata ? 'active' : ''}`}
              onClick={() => handleOptionToggle('includeMetadata')}
            >
              {exportOptions.includeMetadata ? '◉' : '○'}
            </button>
          </div>
          <div className="option-row">
            <span className="option-label">COMPRESS</span>
            <button 
              className={`option-toggle ${exportOptions.compress ? 'active' : ''}`}
              onClick={() => handleOptionToggle('compress')}
            >
              {exportOptions.compress ? '◉' : '○'}
            </button>
          </div>
          <div className="option-row">
            <span className="option-label">ENCRYPT</span>
            <button 
              className={`option-toggle ${exportOptions.encrypt ? 'active' : ''}`}
              onClick={() => handleOptionToggle('encrypt')}
            >
              {exportOptions.encrypt ? '◉' : '○'}
            </button>
          </div>
        </div>
        
        <button 
          className="export-execute-btn"
          onClick={handleExecuteExport}
          disabled={!selectedFormat}
        >
          ↓ EXECUTE EXPORT
        </button>
      </div>
    </div>
  );
};

export default Export;
