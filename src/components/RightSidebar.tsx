import React, { useEffect,useState } from 'react';

import FeedService from '../features/feeds/services/FeedService';
import { Feed } from '../models/Feed';
import { log } from '../utils/LoggerService';
import Export, { ExportFormat, ExportOptions } from './Export';
import Health from './Health';
import TacticalFilters from './TacticalFilters';
import { exportFeedsAsIntelZip, exportIntelReport } from '../utils/intelExport';

const RightSidebar: React.FC = () => {
  const [feeds, setFeeds] = useState<Feed[]>([]);

  useEffect(() => {
    const loadFeeds = async () => {
      try {
        const feedData = await FeedService.getFeeds();
        setFeeds(feedData);
      } catch (error) {
        console.error('Failed to load feeds for export:', error);
      }
    };
    loadFeeds();
  }, []);

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

  const handleAutoExportChange = (enabled: boolean) => {
    log.debug("Component", 'Auto export changed:', enabled);
  };

  const handleExportSettingsOpen = () => {
    log.debug("Component", 'Export settings opened');
  };

  const handleFormatSelect = (format: ExportFormat) => {
    log.debug("Component", 'Export format selected:', format);
  };

  const handleOptionsChange = (options: ExportOptions) => {
    log.debug("Component", 'Export options changed:', options);
  };

  const handleExecuteExport = (format: ExportFormat | null, options: ExportOptions) => {
    log.debug("Component", 'Executing export:', { format, options, feedCount: feeds.length });
    if (!format) return;
    if (format === 'intel') {
      exportFeedsAsIntelZip(feeds, { limit: 200 });
      return;
    }
    if (format === 'intelreport') {
      exportIntelReport(feeds, { limit: 200 });
      return;
    }
    // TODO: existing formats implementation (json/csv/xml/pdf) remains unchanged (not shown)
  };

  const handleHealthScan = () => {
    log.debug("Component", 'Health scan initiated');
  };

  const handleHealthClean = () => {
    log.debug("Component", 'System clean initiated');
  };

  const handleHealthRepair = () => {
    log.debug("Component", 'System repair initiated');
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
        onAutoExportChange={handleAutoExportChange}
        onExportSettingsOpen={handleExportSettingsOpen}
        onFormatSelect={handleFormatSelect}
        onOptionsChange={handleOptionsChange}
        onExecuteExport={handleExecuteExport}
      />

      {/* System Health Module */}
      <Health 
        feedCount={feeds.length}
        onScan={handleHealthScan}
        onClean={handleHealthClean}
        onRepair={handleHealthRepair}
        connectionStatus="ONLINE"
        securityStatus="SECURE"
        overallStatus="OPTIMAL"
      />
    </div>
  );
};

export default RightSidebar;
