# Component Architecture Guide - Tactical Intelligence Dashboard

## Overview
This guide details the component architecture for the tactical intelligence dashboard, showing how to integrate new tactical features while preserving the existing UI/UX excellence and component patterns.

## Core Architecture Principles

### 1. Preserve Existing Patterns
- Maintain current component structure and styling
- Use existing context providers (Settings, Theme, Health)
- Follow established naming conventions
- Preserve responsive design patterns

### 2. Tactical Enhancement Strategy
- Extend existing components with tactical features
- Add new tactical-specific components
- Integrate with current data flow patterns
- Maintain performance characteristics

### 3. Component Hierarchy
```
src/
├── components/
│   ├── tactical/           # New tactical components
│   │   ├── IntelligenceAnalysis/
│   │   ├── ThreatAssessment/
│   │   ├── CommandControl/
│   │   └── TeamCoordination/
│   ├── intel/             # Enhanced intelligence components
│   │   ├── IntelSources.tsx (enhanced)
│   │   ├── AlertManager.tsx (new)
│   │   ├── IntelPipeline.tsx (new)
│   │   └── SourceManager.tsx (enhanced)
│   └── [existing components...]
```

## Enhanced Component Specifications

### 1. Enhanced IntelSources Component

#### Current State
The existing `IntelSources.tsx` displays consumer news feeds with basic filtering and source management.

#### Tactical Enhancement
```typescript
// Enhanced IntelSources.tsx
export interface TacticalIntelSourcesProps {
  showClassificationLevels?: boolean;
  enableRealTimeAlerts?: boolean;
  displayMode?: 'operational' | 'analysis' | 'overview';
  filterByCategory?: IntelligenceCategory[];
  priorityThreshold?: PriorityLevel;
}

export const TacticalIntelSources: React.FC<TacticalIntelSourcesProps> = ({
  showClassificationLevels = true,
  enableRealTimeAlerts = true,
  displayMode = 'operational',
  filterByCategory,
  priorityThreshold = 'MEDIUM'
}) => {
  // Enhanced state management
  const [intelItems, setIntelItems] = useState<IntelligenceItem[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<IntelligenceAlert[]>([]);
  const [sourceHealth, setSourceHealth] = useState<SourceHealthMap>();
  const [classificationFilter, setClassificationFilter] = useState<ClassificationLevel[]>([]);
  
  // Preserve existing UI structure
  return (
    <div className="intel-sources tactical-enhanced">
      {/* Existing header structure */}
      <div className="sources-header">
        <h2>Intelligence Sources</h2>
        <div className="source-controls">
          {/* Enhanced controls */}
          <ClassificationFilter 
            selected={classificationFilter}
            onChange={setClassificationFilter}
          />
          <PriorityFilter 
            threshold={priorityThreshold}
            onChange={setPriorityThreshold}
          />
          <RealTimeToggle enabled={enableRealTimeAlerts} />
        </div>
      </div>
      
      {/* Enhanced source grid */}
      <div className="sources-grid">
        {intelItems.map(item => (
          <TacticalIntelCard
            key={item.id}
            item={item}
            displayMode={displayMode}
            onAnalyze={handleAnalyze}
            onAlert={handleAlert}
          />
        ))}
      </div>
      
      {/* New tactical panels */}
      {enableRealTimeAlerts && (
        <AlertPanel alerts={activeAlerts} />
      )}
      
      <SourceHealthMonitor sources={sourceHealth} />
    </div>
  );
};
```

### 2. Tactical Intelligence Card Component

```typescript
// New TacticalIntelCard.tsx
export interface TacticalIntelCardProps {
  item: IntelligenceItem;
  displayMode: 'operational' | 'analysis' | 'overview';
  onAnalyze: (item: IntelligenceItem) => void;
  onAlert: (item: IntelligenceItem) => void;
  onShare?: (item: IntelligenceItem) => void;
}

export const TacticalIntelCard: React.FC<TacticalIntelCardProps> = ({
  item,
  displayMode,
  onAnalyze,
  onAlert,
  onShare
}) => {
  return (
    <div className={`intel-card ${getClassificationClass(item.classification)} ${getPriorityClass(item.priority)}`}>
      {/* Classification header */}
      <div className="intel-header">
        <ClassificationBadge level={item.classification} />
        <ReliabilityIndicator score={item.reliability} />
        <PriorityIndicator level={item.priority} />
      </div>
      
      {/* Content area - preserve existing card structure */}
      <div className="intel-content">
        <h3>{item.title}</h3>
        <div className="intel-metadata">
          <span className="source">{item.sourceId}</span>
          <span className="timestamp">{formatTimestamp(item.timestamp)}</span>
          <span className="location">{formatLocation(item.location)}</span>
        </div>
        <p className="intel-summary">{item.content}</p>
      </div>
      
      {/* Enhanced action buttons */}
      <div className="intel-actions">
        <button 
          className="btn btn-primary"
          onClick={() => onAnalyze(item)}
        >
          Analyze
        </button>
        {item.priority === 'CRITICAL' && (
          <button 
            className="btn btn-danger"
            onClick={() => onAlert(item)}
          >
            Alert
          </button>
        )}
        {onShare && (
          <button 
            className="btn btn-secondary"
            onClick={() => onShare(item)}
          >
            Share
          </button>
        )}
      </div>
    </div>
  );
};
```

### 3. Real-time Alert Manager

```typescript
// New AlertManager.tsx
export const AlertManager: React.FC = () => {
  const [alerts, setAlerts] = useState<IntelligenceAlert[]>([]);
  const [filterConfig, setFilterConfig] = useState<AlertFilterConfig>();
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  return (
    <div className="alert-manager">
      <div className="alert-controls">
        <h3>Intelligence Alerts</h3>
        <AlertConfigPanel 
          config={filterConfig}
          onChange={setFilterConfig}
        />
      </div>
      
      <div className="alert-stream">
        {alerts.map(alert => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onAcknowledge={handleAcknowledge}
            onEscalate={handleEscalate}
            onDismiss={handleDismiss}
          />
        ))}
      </div>
      
      <AlertAudioManager enabled={soundEnabled} />
    </div>
  );
};
```

### 4. Threat Assessment Dashboard

```typescript
// New ThreatAssessment.tsx
export const ThreatAssessment: React.FC = () => {
  const [threats, setThreats] = useState<ThreatAssessment[]>([]);
  const [riskMatrix, setRiskMatrix] = useState<RiskMatrix>();
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  
  return (
    <div className="threat-assessment">
      <div className="assessment-header">
        <h2>Threat Assessment</h2>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>
      
      <div className="assessment-grid">
        <ThreatOverview threats={threats} />
        <RiskMatrixVisualization matrix={riskMatrix} />
        <ThreatTimeline threats={threats} range={timeRange} />
        <GeographicThreatMap threats={threats} />
      </div>
      
      <ThreatDetailPanel />
    </div>
  );
};
```

### 5. Command & Control Center

```typescript
// New CommandCenter.tsx
export const CommandCenter: React.FC = () => {
  const [operationalStatus, setOperationalStatus] = useState<OperationalStatus>();
  const [activeMissions, setActiveMissions] = useState<Mission[]>([]);
  const [teamStatus, setTeamStatus] = useState<TeamStatus[]>([]);
  
  return (
    <div className="command-center">
      <div className="command-header">
        <h2>Command & Control</h2>
        <OperationalClock />
      </div>
      
      <div className="command-grid">
        <OperationalOverview status={operationalStatus} />
        <MissionDashboard missions={activeMissions} />
        <TeamCoordinationPanel teams={teamStatus} />
        <CommunicationCenter />
      </div>
      
      <CommandActions />
    </div>
  );
};
```

## Context Integration Strategy

### Enhanced Settings Context

```typescript
// Enhanced SettingsContext.tsx
export interface TacticalSettings extends BaseSettings {
  intelligence: {
    classification: {
      defaultLevel: ClassificationLevel;
      autoClassify: boolean;
      declassificationRules: DeclassificationRule[];
    };
    alerts: {
      criticalThreshold: number;
      autoEscalation: boolean;
      soundNotifications: boolean;
      emailNotifications: boolean;
    };
    sources: {
      allowedCategories: IntelligenceCategory[];
      minimumReliability: number;
      autoRefreshInterval: number;
    };
  };
  operational: {
    defaultViewMode: 'operational' | 'analysis' | 'overview';
    timeZone: string;
    coordinateFormat: 'DD' | 'DMS' | 'MGRS';
    mapProvider: 'osm' | 'google' | 'arcgis';
  };
  security: {
    sessionTimeout: number;
    requireTwoFactor: boolean;
    auditLogging: boolean;
    dataRetention: number; // days
  };
}
```

### Intelligence Context

```typescript
// New IntelligenceContext.tsx
export const IntelligenceContext = createContext<IntelligenceContextType | undefined>(undefined);

export const IntelligenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [intelItems, setIntelItems] = useState<IntelligenceItem[]>([]);
  const [alerts, setAlerts] = useState<IntelligenceAlert[]>([]);
  const [threats, setThreats] = useState<ThreatAssessment[]>([]);
  const [sources, setSources] = useState<TacticalIntelSource[]>([]);
  
  const addIntelligence = useCallback((item: IntelligenceItem) => {
    setIntelItems(prev => [item, ...prev]);
    
    // Generate alerts for high-priority items
    if (item.priority === 'CRITICAL') {
      const alert = createAlert(item);
      setAlerts(prev => [alert, ...prev]);
    }
  }, []);
  
  const updateThreatAssessment = useCallback((assessment: ThreatAssessment) => {
    setThreats(prev => prev.map(t => t.id === assessment.id ? assessment : t));
  }, []);
  
  return (
    <IntelligenceContext.Provider value={{
      intelItems,
      alerts,
      threats,
      sources,
      addIntelligence,
      updateThreatAssessment,
      acknowledgeAlert,
      escalateAlert
    }}>
      {children}
    </IntelligenceContext.Provider>
  );
};
```

## Styling Integration

### Enhanced Tactical CSS

```css
/* tactical-intelligence.css - Extends existing tactical-ui.css */

/* Intelligence Classification Styles */
.classification-indicator {
  position: relative;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.classification-unclassified {
  background-color: rgba(40, 167, 69, 0.2);
  color: #28a745;
  border: 1px solid #28a745;
}

.classification-confidential {
  background-color: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid #ffc107;
}

.classification-secret {
  background-color: rgba(253, 126, 20, 0.2);
  color: #fd7e14;
  border: 1px solid #fd7e14;
}

.classification-top-secret {
  background-color: rgba(220, 53, 69, 0.2);
  color: #dc3545;
  border: 1px solid #dc3545;
}

/* Priority Indicators */
.priority-critical {
  animation: pulse-critical 2s infinite;
  border-left: 4px solid #dc3545;
}

.priority-high {
  border-left: 4px solid #fd7e14;
}

.priority-medium {
  border-left: 4px solid #ffc107;
}

.priority-low {
  border-left: 4px solid #6c757d;
}

/* Reliability Indicators */
.reliability-indicator {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.reliability-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--reliability-color);
}

.reliability-9-10 { --reliability-color: #28a745; }
.reliability-7-8 { --reliability-color: #ffc107; }
.reliability-5-6 { --reliability-color: #fd7e14; }
.reliability-1-4 { --reliability-color: #dc3545; }

/* Alert Styles */
.alert-critical {
  background: linear-gradient(135deg, rgba(220, 53, 69, 0.1), rgba(220, 53, 69, 0.05));
  border: 2px solid #dc3545;
  animation: pulse-alert 3s infinite;
}

.alert-stream {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
}

/* Command Center Styles */
.command-center {
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 16px;
  height: 100%;
}

.command-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 16px;
}

.operational-clock {
  font-family: 'Courier New', monospace;
  font-size: 1.2rem;
  color: var(--primary-color);
}

/* Threat Assessment Styles */
.threat-assessment {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 16px;
}

.assessment-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 300px 300px;
  gap: 16px;
}

.risk-matrix {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(5, 1fr);
  gap: 2px;
  background-color: var(--background-secondary);
  padding: 8px;
  border-radius: 8px;
}

/* Animations */
@keyframes pulse-critical {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(220, 53, 69, 0);
  }
}

@keyframes pulse-alert {
  0%, 100% {
    border-color: #dc3545;
  }
  50% {
    border-color: #ff6b7d;
  }
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .command-grid,
  .assessment-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
  
  .intel-card {
    grid-column: 1 / -1;
  }
}
```

## Component Integration Checklist

### Phase 1 Components
- [ ] Enhanced IntelSources with tactical features
- [ ] TacticalIntelCard for intelligence display
- [ ] AlertManager for real-time notifications
- [ ] SourceHealthMonitor for feed status
- [ ] ClassificationIndicators for security levels

### Phase 2 Components
- [ ] ThreatAssessment dashboard
- [ ] IntelligenceAnalysis tools
- [ ] GeospatialIntel mapping
- [ ] TeamCoordination panels
- [ ] SourceCorrelation analysis

### Phase 3 Components
- [ ] CommandCenter interface
- [ ] OperationalDashboard
- [ ] WorkflowEngine for automation
- [ ] AdvancedAnalytics tools
- [ ] IntelReporting system

## Testing Strategy for Components

### Unit Testing
```typescript
// Example test for TacticalIntelCard
describe('TacticalIntelCard', () => {
  it('displays classification level correctly', () => {
    const mockItem: IntelligenceItem = {
      classification: 'SECRET',
      // ... other properties
    };
    
    render(<TacticalIntelCard item={mockItem} />);
    expect(screen.getByText('SECRET')).toBeInTheDocument();
  });
  
  it('shows critical priority indicator', () => {
    const mockItem: IntelligenceItem = {
      priority: 'CRITICAL',
      // ... other properties
    };
    
    render(<TacticalIntelCard item={mockItem} />);
    expect(screen.getByTestId('priority-critical')).toBeInTheDocument();
  });
});
```

### Integration Testing
```typescript
// Example integration test
describe('Intelligence Flow', () => {
  it('creates alert when critical intelligence is added', async () => {
    render(
      <IntelligenceProvider>
        <AlertManager />
        <TacticalIntelSources />
      </IntelligenceProvider>
    );
    
    // Simulate critical intelligence
    fireEvent.click(screen.getByText('Add Critical Intel'));
    
    await waitFor(() => {
      expect(screen.getByText('CRITICAL ALERT')).toBeInTheDocument();
    });
  });
});
```

This component architecture preserves the existing UI/UX excellence while adding tactical intelligence capabilities in a structured, maintainable way.
