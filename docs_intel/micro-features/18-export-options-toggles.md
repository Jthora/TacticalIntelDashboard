# Export Options Toggles

## ⚙️ Feature Overview

Export Options Toggles provide granular control over data export parameters through quick-access toggle switches, enabling customizable export configurations without complex settings dialogs.

## 🎯 Purpose & Strategic Value

### Mission-Critical Function
- **Export Customization**: Fine-tune export content and format options
- **Security Control**: Include/exclude sensitive data based on clearance levels
- **File Optimization**: Control export file size and processing requirements
- **Workflow Efficiency**: Quick option adjustment without menu navigation

## 🏗 Technical Implementation

### React State Management
```typescript
interface ExportOptions {
  includeMetadata: boolean;
  compressOutput: boolean;
  encryptData: boolean;
  includeTimestamps: boolean;
  anonymizeData: boolean;
}

const [exportOptions, setExportOptions] = useState<ExportOptions>({
  includeMetadata: true,
  compressOutput: false,
  encryptData: false,
  includeTimestamps: true,
  anonymizeData: false
});

const toggleOption = (option: keyof ExportOptions) => {
  setExportOptions(prev => ({
    ...prev,
    [option]: !prev[option]
  }));
};
```

### Visual Component
```tsx
<div className="export-options-toggles">
  <div className="option-row">
    <button 
      className={`option-toggle ${exportOptions.includeMetadata ? 'active' : ''}`}
      onClick={() => toggleOption('includeMetadata')}
      title="Include source metadata"
    >
      META
    </button>
    <button 
      className={`option-toggle ${exportOptions.compressOutput ? 'active' : ''}`}
      onClick={() => toggleOption('compressOutput')}
      title="Compress export file"
    >
      ZIP
    </button>
  </div>
  <div className="option-row">
    <button 
      className={`option-toggle ${exportOptions.encryptData ? 'active' : ''}`}
      onClick={() => toggleOption('encryptData')}
      title="Encrypt exported data"
    >
      🔒
    </button>
    <button 
      className={`option-toggle ${exportOptions.anonymizeData ? 'active' : ''}`}
      onClick={() => toggleOption('anonymizeData')}
      title="Anonymize sensitive data"
    >
      🎭
    </button>
  </div>
</div>
```

## 📊 Metrics & Analytics

### Option Usage Patterns
- **Toggle Frequency**: Most commonly adjusted export options
- **Security Usage**: Frequency of encryption and anonymization usage
- **File Impact**: Effect of options on export file size and processing time
- **User Preferences**: Default option combinations by user role
