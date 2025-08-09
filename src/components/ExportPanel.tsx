import React, { useState } from 'react';

import { Feed } from '../models/Feed';
import { ExportOptions,ExportService } from '../services/ExportService';

interface ExportPanelProps {
  feeds: Feed[];
  onExportComplete?: (format: string, filename: string) => void;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ feeds, onExportComplete }) => {
  const [format, setFormat] = useState<'json' | 'csv' | 'pdf'>('json');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [includeFields, setIncludeFields] = useState<string[]>(['title', 'description', 'link', 'pubDate']);
  const [isExporting, setIsExporting] = useState(false);

  const availableFields = [
    { key: 'title', label: 'Title' },
    { key: 'description', label: 'Description' },
    { key: 'link', label: 'Link' },
    { key: 'pubDate', label: 'Publication Date' },
    { key: 'author', label: 'Author' },
    { key: 'source', label: 'Source' }
  ];

  const handleFieldToggle = (field: string) => {
    setIncludeFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const handleExport = async () => {
    if (feeds.length === 0) {
      alert('No feeds available to export');
      return;
    }

    setIsExporting(true);
    try {
      const options: ExportOptions = {
        format,
        includeFields
      };

      // Add date range if specified
      if (dateRange.start && dateRange.end) {
        options.dateRange = {
          start: new Date(dateRange.start),
          end: new Date(dateRange.end)
        };
      }

      const result = await ExportService.exportFeeds(feeds, options);
      
      // Download the file using the new API
      await ExportService.downloadFile(result);

      onExportComplete?.(format, result.filename);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getFilteredFeedCount = () => {
    if (!dateRange.start || !dateRange.end) {
      return feeds.length;
    }
    
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    
    return feeds.filter(feed => {
      const feedDate = new Date(feed.pubDate);
      return feedDate >= start && feedDate <= end;
    }).length;
  };

  return (
    <div className="export-panel">
      <div className="export-header">
        <h3 className="export-title">📊 Export Feeds</h3>
        <div className="export-count">
          {getFilteredFeedCount()} of {feeds.length} feeds
        </div>
      </div>

      <div className="export-options">
        {/* Format Selection */}
        <div className="export-section">
          <label className="export-label">Format</label>
          <div className="format-options">
            {(['json', 'csv', 'pdf'] as const).map(fmt => (
              <button
                key={fmt}
                className={`format-button ${format === fmt ? 'active' : ''}`}
                onClick={() => setFormat(fmt)}
              >
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="export-section">
          <label className="export-label">Date Range (Optional)</label>
          <div className="date-range">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="date-input"
              placeholder="Start date"
            />
            <span className="date-separator">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="date-input"
              placeholder="End date"
            />
          </div>
        </div>

        {/* Field Selection */}
        <div className="export-section">
          <label className="export-label">Include Fields</label>
          <div className="field-options">
            {availableFields.map(field => (
              <label key={field.key} className="field-checkbox">
                <input
                  type="checkbox"
                  checked={includeFields.includes(field.key)}
                  onChange={() => handleFieldToggle(field.key)}
                />
                <span className="field-label">{field.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="export-actions">
        <button
          className="export-button"
          onClick={handleExport}
          disabled={isExporting || includeFields.length === 0}
        >
          {isExporting ? (
            <>
              <span className="loading-spinner"></span>
              Exporting...
            </>
          ) : (
            <>
              📥 Export {format.toUpperCase()}
            </>
          )}
        </button>
        
        {dateRange.start && dateRange.end && (
          <button
            className="clear-filters-button"
            onClick={() => setDateRange({ start: '', end: '' })}
          >
            Clear Date Filter
          </button>
        )}
      </div>
    </div>
  );
};

export default ExportPanel;
