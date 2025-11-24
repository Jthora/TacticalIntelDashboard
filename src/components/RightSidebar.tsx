import React, { useState } from 'react';

import { log } from '../utils/LoggerService';
import Export, { ExportFormat, ExportOptions } from './Export';
import TacticalFilters from './TacticalFilters';
import { exportFeedsAsIntelZip, exportIntelReport } from '../utils/intelExport';
import { useFeedData } from '../contexts/FeedDataContext';
import { useStatusMessages } from '../contexts/StatusMessageContext';
import { ExportService, ExportOptions as ServiceExportOptions } from '../services/ExportService';

const RightSidebar: React.FC = () => {
  const { filteredFeeds, feeds } = useFeedData();
  const exportableFeeds = filteredFeeds.length > 0 ? filteredFeeds : feeds;
  const { pushMessage } = useStatusMessages();
  const [isExporting, setIsExporting] = useState(false);

  const isStandardFormat = (format: ExportFormat | null): format is 'json' | 'csv' | 'xml' | 'pdf' => {
    return format === 'json' || format === 'csv' || format === 'xml' || format === 'pdf';
  };

  const handleFiltersChange = (activeFilters: Set<string>) => {
    // Handle filter changes if needed
    log.debug("Component", 'Filters changed:', activeFilters);
  };

  const handleApplyFilters = (activeFilters: Set<string>) => {
    // Handle filter application
    log.debug("Component", 'Applying filters:', activeFilters);
  };

  const handleSavePreset = (activeFilters: Set<string>) => {
    // Handle preset saving
    log.debug("Component", 'Saving preset:', activeFilters);
  };

  const handleFormatSelect = (format: ExportFormat) => {
    log.debug("Component", 'Export format selected:', format);
  };

  const handleOptionsChange = (options: ExportOptions) => {
    log.debug("Component", 'Export options changed:', options);
  };

  const handleExecuteExport = async (format: ExportFormat | null, options: ExportOptions) => {
    log.debug("Component", 'Executing export:', { format, options, feedCount: exportableFeeds.length });

    if (!format) {
      pushMessage('Select a format before exporting.', 'warning', { source: 'Export' });
      return;
    }

    if (exportableFeeds.length === 0) {
      pushMessage('No feeds available to export.', 'warning', { source: 'Export' });
      return;
    }

    if (options.encrypt && !options.encryptionPassword?.trim()) {
      pushMessage('Provide an encryption password or disable encryption.', 'warning', { source: 'Export' });
      return;
    }

    try {
      setIsExporting(true);

      if (format === 'intel') {
        exportFeedsAsIntelZip(exportableFeeds, { limit: 200 });
        pushMessage('Intel package export request logged (stub implementation).', 'info', { source: 'Export' });
        return;
      }

      if (format === 'intelreport') {
        exportIntelReport(exportableFeeds, { limit: 200 });
        pushMessage('Intel report export request logged (stub implementation).', 'info', { source: 'Export' });
        return;
      }

      if (!isStandardFormat(format)) {
        pushMessage('Unsupported export format selected.', 'error', { source: 'Export' });
        return;
      }

      const metadataTitle = options.metadataTitle && options.metadataTitle.length > 0
        ? options.metadataTitle
        : 'Tactical Intel Dashboard Export';

      const metadata = options.includeMetadata ? {
        title: metadataTitle,
        ...(options.metadataDescription && options.metadataDescription.length > 0
          ? { description: options.metadataDescription }
          : {}),
      } : undefined;

      const serviceOptions: ServiceExportOptions = {
        format,
        ...(metadata ? { metadata } : {}),
        ...(options.compress ? { compression: true } : {}),
        ...(options.encrypt ? {
          encryption: {
            enabled: true,
            password: options.encryptionPassword!,
          }
        } : {}),
      };

      const result = await ExportService.exportFeeds(exportableFeeds, serviceOptions);
      await ExportService.downloadFile(result);

      pushMessage(`Exported ${exportableFeeds.length} feeds as ${format.toUpperCase()}.`, 'success', { source: 'Export' });
    } catch (error) {
      console.error('Export failed:', error);
      pushMessage('Export failed. Check console for details.', 'error', { source: 'Export' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="tactical-sidebar-container animate-slide-in-right">
      {/* Tactical Filters Module */}
      <TacticalFilters 
        onFiltersChange={handleFiltersChange}
        onApplyFilters={handleApplyFilters}
        onSavePreset={handleSavePreset}
        filterPresets={['CRITICAL', 'INTEL', 'THREAT']}
      />

      {/* Data Export Module */}
      <Export 
        onFormatSelect={handleFormatSelect}
        onOptionsChange={handleOptionsChange}
        onExecuteExport={handleExecuteExport}
        isExporting={isExporting}
      />

    </div>
  );
};

export default RightSidebar;
