# Quick Filter Presets

## ⚡ Feature Overview

Quick Filter Presets provide instant access to commonly used filter combinations through saved configurations, enabling rapid context switching between different intelligence gathering scenarios with single-click activation.

## 🎯 Purpose & Strategic Value

### Mission-Critical Function
- **Rapid Context Switching**: Instant filter configuration for different operational scenarios
- **Workflow Optimization**: Eliminate repetitive filter setup for routine operations
- **Standardization**: Consistent filter setups across team members and operations
- **Efficiency Enhancement**: Reduce filter configuration time from minutes to seconds

## 🏗 Technical Implementation

### React State Management
```typescript
interface FilterPreset {
  id: string;
  name: string;
  label: string;
  filters: FilterConfiguration;
  description: string;
  color: string;
}

const defaultPresets: FilterPreset[] = [
  {
    id: 'breaking-news',
    name: 'Breaking',
    label: 'BRK',
    filters: { priority: ['high'], type: ['news'], timeRange: 'last-hour' },
    description: 'High-priority breaking news sources',
    color: 'var(--accent-red)'
  },
  {
    id: 'social-intel',
    name: 'Social',
    label: 'SOC',
    filters: { type: ['social'], region: ['domestic', 'international'] },
    description: 'Social media intelligence sources',
    color: 'var(--accent-cyan)'
  },
  {
    id: 'official-sources',
    name: 'Official',
    label: 'OFF',
    filters: { type: ['official'], priority: ['high', 'medium'] },
    description: 'Government and official sources',
    color: 'var(--accent-green)'
  }
];

const [filterPresets, setFilterPresets] = useState<FilterPreset[]>(defaultPresets);
const [activePreset, setActivePreset] = useState<string | null>(null);

const applyPreset = (presetId: string) => {
  const preset = filterPresets.find(p => p.id === presetId);
  if (preset) {
    applyFilters(preset.filters);
    setActivePreset(presetId);
  }
};
```

### Visual Component
```tsx
<div className="filter-presets">
  <div className="preset-buttons">
    {filterPresets.map(preset => (
      <button
        key={preset.id}
        className={`preset-btn ${activePreset === preset.id ? 'active' : ''}`}
        onClick={() => applyPreset(preset.id)}
        title={preset.description}
        style={{ borderColor: preset.color }}
      >
        {preset.label}
      </button>
    ))}
  </div>
  <button className="clear-presets" onClick={clearAllFilters} title="Clear All Filters">
    CLR
  </button>
</div>
```

### CSS Styling System
```css
.filter-presets {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 1px;
}

.preset-btn {
  width: 20px;
  height: 12px;
  font-size: 5px;
  font-family: var(--font-mono);
  background: var(--secondary-bg);
  border: 1px solid var(--text-muted);
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.preset-btn.active {
  background: currentColor;
  color: var(--primary-bg);
  font-weight: bold;
}

.preset-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

.clear-presets {
  width: 20px;
  height: 10px;
  font-size: 4px;
  background: var(--accent-orange);
  border: 1px solid var(--accent-orange);
  color: var(--primary-bg);
  margin-top: 2px;
}
```

## 📐 Architectural Integration

### Right Sidebar Position
- **Location**: Tactical Filters section, below filter matrix
- **Layout**: Horizontal button array with clear option
- **Dimensions**: 20px x 12px per preset button
- **Context**: Part of advanced filtering control cluster

### Preset Management System
```typescript
interface PresetManager {
  presets: FilterPreset[];
  activePreset: string | null;
  customPresets: UserDefinedPreset[];
  presetHistory: PresetUsageLog[];
}

const saveCustomPreset = (name: string, filters: FilterConfiguration) => {
  const newPreset: FilterPreset = {
    id: generatePresetId(),
    name,
    label: name.substring(0, 3).toUpperCase(),
    filters,
    description: `Custom preset: ${name}`,
    color: generatePresetColor(),
  };
  
  setFilterPresets(prev => [...prev, newPreset]);
  savePresetToStorage(newPreset);
};
```

## 🚀 Usage Guidelines

### Preset Selection Strategies

#### Breaking News Preset (BRK)
- **Use Case**: Crisis response, developing situations
- **Filters**: High priority, news sources, recent timeframe
- **Best For**: Emergency response, breaking story monitoring
- **Timing**: Activate during crisis events or developing stories

#### Social Intelligence Preset (SOC)
- **Use Case**: Public sentiment analysis, social monitoring
- **Filters**: Social media sources, domestic and international
- **Best For**: Public opinion tracking, social trend analysis
- **Timing**: Regular monitoring periods, event aftermath analysis

#### Official Sources Preset (OFF)
- **Use Case**: Government monitoring, official announcements
- **Filters**: Official sources, high/medium priority
- **Best For**: Policy tracking, official statement monitoring
- **Timing**: Government briefings, policy announcement periods

### Custom Preset Guidelines
1. **Naming Convention**: Use clear, descriptive 3-letter abbreviations
2. **Color Coding**: Assign distinct colors for quick visual identification
3. **Filter Scope**: Balance specificity with usefulness
4. **Team Coordination**: Share useful presets across team members

## 🔧 Performance Considerations

### Preset Application Optimization
```typescript
// Optimized preset application with batched updates
const applyPresetOptimized = (preset: FilterPreset) => {
  // Batch all filter updates to prevent multiple re-renders
  requestAnimationFrame(() => {
    const filterUpdates = Object.entries(preset.filters);
    
    filterUpdates.forEach(([filterType, values]) => {
      updateFilter(filterType, values);
    });
    
    // Single state update for active preset
    setActivePreset(preset.id);
    
    // Log preset usage for analytics
    logPresetUsage(preset.id);
  });
};
```

### Storage and Caching
- **Local Storage**: Persist custom presets across sessions
- **Cache Management**: Efficient preset lookup and application
- **Memory Usage**: Minimal overhead for preset storage
- **Sync Performance**: Fast preset switching without delays

## 🔮 Future Enhancement Opportunities

### Intelligent Presets
- **Smart Presets**: AI-suggested presets based on current operation context
- **Adaptive Presets**: Presets that evolve based on usage patterns
- **Contextual Presets**: Different preset sets for different operation types
- **Collaborative Presets**: Shared presets across team members

### Advanced Features
```typescript
interface AdvancedPresetSystem {
  smartPresets: AIGeneratedPreset[];
  adaptivePresets: EvolvingPreset[];
  contextualPresets: OperationTypePresets;
  collaborativePresets: TeamSharedPresets;
  presetAnalytics: PresetUsageAnalytics;
}
```

### Integration Enhancements
- **Operation Integration**: Preset activation based on operation type
- **Time-Based Presets**: Automatic preset switching based on schedule
- **Alert Integration**: Preset activation triggered by specific alerts
- **Export/Import**: Share preset configurations between systems

## 📊 Metrics & Analytics

### Preset Usage Analytics
- **Activation Frequency**: How often each preset is used
- **Usage Patterns**: Common preset sequences and combinations
- **Custom Preset Adoption**: Rate of custom preset creation and usage
- **Team Sharing**: Frequency of preset sharing between team members

### Effectiveness Metrics
- **Filter Efficiency**: Reduction in manual filter setup time
- **Accuracy**: Relevance of filtered results using presets
- **User Satisfaction**: Preference ratings for preset vs manual filtering
- **Workflow Impact**: Overall improvement in operational efficiency

## 🛡 Data Management & Standards

### Preset Data Integrity
- **Validation**: Ensure preset filters are valid and functional
- **Backup**: Automatic backup of custom presets
- **Conflict Resolution**: Handle preset conflicts during team sharing
- **Version Control**: Track preset modifications and updates

### Team Coordination Standards
- **Naming Conventions**: Standardized preset naming across team
- **Color Standards**: Consistent color coding for preset categories
- **Sharing Protocols**: Procedures for preset distribution
- **Update Procedures**: Guidelines for preset modification and maintenance
