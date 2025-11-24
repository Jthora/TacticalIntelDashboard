import './Export.css';

import React, { useEffect,useState } from 'react';

import { DEFAULT_MISSION_MODE } from '../constants/MissionMode';
import { useSettings } from '../contexts/SettingsContext';
import Modal from '../shared/components/Modal';

export type ExportFormat = 'json' | 'csv' | 'xml' | 'pdf' | 'intel' | 'intelreport';

export interface ExportOptions {
  includeMetadata: boolean;
  compress: boolean;
  encrypt: boolean;
  metadataTitle?: string | undefined;
  metadataDescription?: string | undefined;
  encryptionPassword?: string | undefined;
}

interface ExportProps {
  onFormatSelect?: (format: ExportFormat) => void;
  onOptionsChange?: (options: ExportOptions) => void;
  onExecuteExport?: (format: ExportFormat | null, options: ExportOptions) => void;
  initialOptions?: Partial<ExportOptions>;
  isExporting?: boolean;
}

const Export: React.FC<ExportProps> = ({
  onFormatSelect,
  onOptionsChange,
  onExecuteExport,
  initialOptions = {},
  isExporting = false,
}) => {
  const { settings, updateSettings } = useSettings();
  
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(() =>
    settings?.general?.export?.format as ExportFormat ?? null
  );
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeMetadata: settings?.general?.export?.includeMetadata ?? true,
    compress: settings?.general?.export?.compress ?? false,
    encrypt: settings?.general?.export?.encrypt ?? true,
    metadataTitle: initialOptions.metadataTitle ?? 'Tactical Intel Dashboard Export',
    metadataDescription: initialOptions.metadataDescription ?? '',
    encryptionPassword: initialOptions.encryptionPassword ?? '',
    ...initialOptions,
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [pendingOptions, setPendingOptions] = useState<ExportOptions | null>(null);
  const [pendingFormat, setPendingFormat] = useState<ExportFormat | null>(null);

  // Sync with settings when they change
  useEffect(() => {
    if (settings?.general?.export) {
      const exportSettings = settings.general.export;
      setSelectedFormat(exportSettings.format as ExportFormat ?? null);
      setExportOptions(prev => ({
        ...prev,
        includeMetadata: exportSettings.includeMetadata ?? prev.includeMetadata,
        compress: exportSettings.compress ?? prev.compress,
        encrypt: exportSettings.encrypt ?? prev.encrypt,
      }));
    }
  }, [settings?.general?.export]);

  const handleFormatClick = (format: ExportFormat) => {
    setSelectedFormat(format);
    
    // Update settings
    updateSettings({
      general: {
        mode: settings.general?.mode ?? DEFAULT_MISSION_MODE,
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

  const openOptionsModal = () => {
    setPendingOptions({
      ...exportOptions,
      metadataTitle: exportOptions.metadataTitle ?? 'Tactical Intel Dashboard Export',
      metadataDescription: exportOptions.metadataDescription ?? '',
      encryptionPassword: exportOptions.encryptionPassword ?? '',
    });
    setPendingFormat(selectedFormat);
    setIsOptionsModalOpen(true);
  };

  const closeOptionsModal = () => {
    setIsOptionsModalOpen(false);
    setPendingOptions(null);
    setPendingFormat(null);
  };

  const handlePendingOptionToggle = (option: keyof ExportOptions) => {
    if (!pendingOptions) return;
    const toggledValue = !pendingOptions[option];
    setPendingOptions(prev => {
      if (!prev) return prev;
      const nextOptions: ExportOptions = {
        ...prev,
        [option]: toggledValue,
      };
      if (option === 'encrypt' && !toggledValue) {
        setValidationError(null);
        nextOptions.encryptionPassword = '';
      }
      return nextOptions;
    });
  };

  const handlePendingMetadataChange = (
    field: 'metadataTitle' | 'metadataDescription',
    value: string
  ) => {
    setPendingOptions(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const handlePendingEncryptionPasswordChange = (value: string) => {
    setPendingOptions(prev => prev ? { ...prev, encryptionPassword: value } : prev);
    setValidationError(null);
  };

  const confirmOptionsAndExecute = () => {
    if (!pendingOptions) {
      closeOptionsModal();
      return;
    }

    if (pendingOptions.encrypt && !pendingOptions.encryptionPassword?.trim()) {
      setValidationError('Encryption password is required when ENCRYPT is enabled.');
      return;
    }

    const sanitizedOptions: ExportOptions = {
      ...pendingOptions,
      metadataTitle: pendingOptions.metadataTitle?.trim(),
      metadataDescription: pendingOptions.metadataDescription?.trim(),
      encryptionPassword: pendingOptions.encryptionPassword?.trim(),
    };

    setExportOptions(sanitizedOptions);
    onOptionsChange?.(sanitizedOptions);

    updateSettings({
      general: {
        mode: settings.general?.mode ?? DEFAULT_MISSION_MODE,
        refreshInterval: settings.general?.refreshInterval ?? 300000,
        cacheSettings: settings.general?.cacheSettings ?? { enabled: true, duration: 300000 },
        notifications: settings.general?.notifications ?? { enabled: true, sound: false },
        export: {
          format: (pendingFormat ?? selectedFormat ?? settings.general?.export?.format ?? 'json') as any,
          autoExport: settings.general?.export?.autoExport ?? false,
          includeMetadata: sanitizedOptions.includeMetadata,
          compress: sanitizedOptions.compress,
          encrypt: sanitizedOptions.encrypt,
        }
      }
    });

    setIsOptionsModalOpen(false);
    setValidationError(null);
    onExecuteExport?.(pendingFormat ?? selectedFormat, sanitizedOptions);
  };

  const handleExecuteExport = () => {
    if (!selectedFormat) {
      setValidationError('Select a format before exporting.');
      return;
    }
    openOptionsModal();
  };

  return (
    <div className="tactical-module module-export">
      <div className="tactical-header-enhanced">
        <div className="header-primary">
          <span className="module-icon">📦</span>
          <h3>EXPORT</h3>
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
        <button 
          className="export-execute-btn"
          onClick={handleExecuteExport}
          disabled={!selectedFormat || isExporting}
        >
          {isExporting ? '⏳ EXPORTING…' : '↓ EXECUTE EXPORT'}
        </button>

        <Modal
          isOpen={isOptionsModalOpen}
          onClose={closeOptionsModal}
          title="Finalize Export Package"
          size="medium"
        >
          {pendingOptions && (
            <div className="export-modal-content">
              <div className="export-options-micro">
                <div className="option-row">
                  <span className="option-label">INCLUDE METADATA</span>
                  <button
                    className={`option-toggle ${pendingOptions.includeMetadata ? 'active' : ''}`}
                    onClick={() => handlePendingOptionToggle('includeMetadata')}
                  >
                    {pendingOptions.includeMetadata ? '◉' : '○'}
                  </button>
                </div>
                <div className="option-row">
                  <span className="option-label">COMPRESS</span>
                  <button
                    className={`option-toggle ${pendingOptions.compress ? 'active' : ''}`}
                    onClick={() => handlePendingOptionToggle('compress')}
                  >
                    {pendingOptions.compress ? '◉' : '○'}
                  </button>
                </div>
                <div className="option-row">
                  <span className="option-label">ENCRYPT</span>
                  <button
                    className={`option-toggle ${pendingOptions.encrypt ? 'active' : ''}`}
                    onClick={() => handlePendingOptionToggle('encrypt')}
                  >
                    {pendingOptions.encrypt ? '◉' : '○'}
                  </button>
                </div>
              </div>

              {pendingOptions.includeMetadata && (
                <div className="export-detail-group">
                  <label className="detail-label" htmlFor="modal-export-metadata-title">METADATA TITLE</label>
                  <input
                    id="modal-export-metadata-title"
                    className="export-input"
                    type="text"
                    maxLength={120}
                    value={pendingOptions.metadataTitle ?? ''}
                    onChange={event => handlePendingMetadataChange('metadataTitle', event.target.value)}
                    placeholder="Tactical Intel Dashboard Export"
                  />
                  <label className="detail-label" htmlFor="modal-export-metadata-notes">METADATA NOTES</label>
                  <textarea
                    id="modal-export-metadata-notes"
                    className="export-textarea"
                    rows={3}
                    maxLength={280}
                    value={pendingOptions.metadataDescription ?? ''}
                    onChange={event => handlePendingMetadataChange('metadataDescription', event.target.value)}
                    placeholder="Optional context for the exported intelligence package"
                  />
                </div>
              )}

              {pendingOptions.encrypt && (
                <div className="export-detail-group">
                  <div className="detail-label-row">
                    <label className="detail-label" htmlFor="modal-export-encryption-password">ENCRYPTION PASSWORD</label>
                    <span className="export-hint">Required to decrypt the exported file.</span>
                  </div>
                  <input
                    id="modal-export-encryption-password"
                    className="export-input"
                    type="password"
                    value={pendingOptions.encryptionPassword ?? ''}
                    onChange={event => handlePendingEncryptionPasswordChange(event.target.value)}
                    placeholder="Enter strong passphrase"
                  />
                </div>
              )}

              {validationError && (
                <div className="export-error" role="alert">{validationError}</div>
              )}

              <div className="export-modal-actions">
                <button type="button" onClick={closeOptionsModal}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="confirm-btn"
                  onClick={confirmOptionsAndExecute}
                  disabled={isExporting}
                >
                  {isExporting ? '⏳ EXECUTING…' : 'Confirm & Export'}
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default Export;
