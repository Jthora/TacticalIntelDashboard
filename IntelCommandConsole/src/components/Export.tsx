import React, { useState } from 'react';
import './Export.css';

export type ExportFormat = 'json' | 'csv' | 'xml' | 'pdf';

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
  const [autoExport, setAutoExport] = useState<boolean>(initialAutoExport);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeMetadata: true,
    compress: false,
    encrypt: true,
    ...initialOptions,
  });

  const handleAutoExportToggle = () => {
    const newAutoExport = !autoExport;
    setAutoExport(newAutoExport);
    onAutoExportChange?.(newAutoExport);
  };

  const handleExportSettingsClick = () => {
    onExportSettingsOpen?.();
  };

  const handleFormatClick = (format: ExportFormat) => {
    setSelectedFormat(format);
    onFormatSelect?.(format);
  };

  const handleOptionToggle = (option: keyof ExportOptions) => {
    const newOptions = {
      ...exportOptions,
      [option]: !exportOptions[option],
    };
    setExportOptions(newOptions);
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
