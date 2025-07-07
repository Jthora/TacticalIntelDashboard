# Export Format Buttons

## 📊 Feature Overview

Export Format Buttons provide instant data export capability through quick-access format selection, enabling rapid intelligence data extraction in multiple standardized formats for external analysis and reporting.

## 🎯 Purpose & Strategic Value

### Mission-Critical Function
- **Rapid Data Export**: Instant export without complex dialog interfaces
- **Multi-Format Support**: Support for various external system requirements
- **Workflow Integration**: Seamless data flow to analysis and reporting tools
- **Operational Efficiency**: Eliminate multi-step export processes

## 🏗 Technical Implementation

### React State Management
```typescript
type ExportFormat = 'json' | 'csv' | 'xml' | 'pdf';

const [isExporting, setIsExporting] = useState<boolean>(false);
const [lastExport, setLastExport] = useState<{format: ExportFormat, timestamp: Date} | null>(null);

const exportFormats = {
  json: { label: 'JSON', icon: '{}', mime: 'application/json' },
  csv: { label: 'CSV', icon: '📊', mime: 'text/csv' },
  xml: { label: 'XML', icon: '<>', mime: 'application/xml' },
  pdf: { label: 'PDF', icon: '📄', mime: 'application/pdf' }
};

const handleExport = async (format: ExportFormat) => {
  if (isExporting) return;
  
  setIsExporting(true);
  
  try {
    const data = await gatherExportData();
    const filename = generateExportFilename(format);
    
    switch (format) {
      case 'json':
        await exportAsJSON(data, filename);
        break;
      case 'csv':
        await exportAsCSV(data, filename);
        break;
      case 'xml':
        await exportAsXML(data, filename);
        break;
      case 'pdf':
        await exportAsPDF(data, filename);
        break;
    }
    
    setLastExport({ format, timestamp: new Date() });
  } catch (error) {
    console.error(`Export failed for ${format}:`, error);
  } finally {
    setIsExporting(false);
  }
};
```

### Visual Component
```tsx
<div className="export-format-buttons">
  <div className="format-grid">
    {Object.entries(exportFormats).map(([format, config]) => (
      <button
        key={format}
        className={`export-btn export-${format} ${isExporting ? 'disabled' : ''}`}
        onClick={() => handleExport(format as ExportFormat)}
        disabled={isExporting}
        title={`Export as ${config.label}`}
      >
        <span className="export-icon">{config.icon}</span>
      </button>
    ))}
  </div>
  {isExporting && (
    <div className="export-progress">
      <span className="progress-indicator">⏳</span>
    </div>
  )}
</div>
```

## 📊 Metrics & Analytics

### Export Usage
- **Format Distribution**: Most commonly used export formats
- **Export Frequency**: Rate of exports per operational session
- **File Size Analysis**: Average export file sizes by format
- **Success Rate**: Percentage of successful exports by format
