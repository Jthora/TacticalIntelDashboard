# Priority Badges

## 🏷️ Feature Overview

Priority Badges provide instant visual priority classification for intelligence sources through color-coded micro-badges, enabling rapid identification of mission-critical sources and appropriate resource allocation based on operational importance.

## 🎯 Purpose & Strategic Value

### Mission-Critical Function
- **Priority Visualization**: Instant identification of high-priority intelligence sources
- **Resource Allocation**: Efficient attention management based on source importance
- **Operational Focus**: Clear visual hierarchy for mission-critical intelligence
- **Risk Management**: Prioritized monitoring of most important intelligence streams

## 🏗 Technical Implementation

### React State Management
```typescript
type PriorityLevel = 'critical' | 'high' | 'medium' | 'low' | 'routine';

interface PriorityBadge {
  level: PriorityLevel;
  label: string;
  color: string;
  description: string;
  sortOrder: number;
}

const priorityBadges: Record<PriorityLevel, PriorityBadge> = {
  critical: {
    level: 'critical',
    label: 'CRIT',
    color: 'var(--accent-red)',
    description: 'Mission-critical intelligence',
    sortOrder: 5
  },
  high: {
    level: 'high',
    label: 'HIGH',
    color: 'var(--accent-orange)',
    description: 'High-priority intelligence',
    sortOrder: 4
  },
  medium: {
    level: 'medium',
    label: 'MED',
    color: 'var(--accent-yellow)',
    description: 'Medium-priority intelligence',
    sortOrder: 3
  },
  low: {
    level: 'low',
    label: 'LOW',
    color: 'var(--accent-cyan)',
    description: 'Low-priority intelligence',
    sortOrder: 2
  },
  routine: {
    level: 'routine',
    label: 'RTN',
    color: 'var(--text-muted)',
    description: 'Routine monitoring',
    sortOrder: 1
  }
};

const [sourcePriorities, setSourcePriorities] = useState<Map<string, PriorityLevel>>(new Map());

const updateSourcePriority = (sourceId: string, newPriority: PriorityLevel) => {
  setSourcePriorities(prev => new Map(prev.set(sourceId, newPriority)));
  
  // Log priority change for audit trail
  logPriorityChange(sourceId, newPriority);
  
  // Trigger any priority-based actions
  handlePriorityChange(sourceId, newPriority);
};

const getPriorityBadge = (sourceId: string): PriorityBadge => {
  const level = sourcePriorities.get(sourceId) || 'routine';
  return priorityBadges[level];
};
```

### Visual Component
```tsx
const PriorityBadge: React.FC<{ 
  sourceId: string; 
  editable?: boolean;
  size?: 'micro' | 'small' | 'medium';
}> = ({ sourceId, editable = false, size = 'micro' }) => {
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const badge = getPriorityBadge(sourceId);

  const handlePriorityChange = (newPriority: PriorityLevel) => {
    updateSourcePriority(sourceId, newPriority);
    setShowPriorityMenu(false);
  };

  return (
    <div className="priority-badge-container">
      <span 
        className={`priority-badge ${badge.level} ${size} ${editable ? 'editable' : ''}`}
        style={{ 
          backgroundColor: badge.color,
          color: badge.level === 'routine' ? 'var(--text-primary)' : 'var(--primary-bg)'
        }}
        onClick={editable ? () => setShowPriorityMenu(true) : undefined}
        title={`${badge.description} - ${badge.level.toUpperCase()}`}
      >
        {badge.label}
      </span>
      
      {editable && showPriorityMenu && (
        <div className="priority-menu">
          {Object.values(priorityBadges).map(priorityOption => (
            <button
              key={priorityOption.level}
              className={`priority-option ${priorityOption.level}`}
              style={{ backgroundColor: priorityOption.color }}
              onClick={() => handlePriorityChange(priorityOption.level)}
            >
              {priorityOption.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Usage in source list
<div className="source-item">
  <ActivityIndicator sourceId={source.id} />
  <PriorityBadge sourceId={source.id} editable={true} />
  <span className="source-name">{source.name}</span>
</div>
```

### CSS Styling System
```css
.priority-badge {
  display: inline-block;
  font-family: var(--font-mono);
  font-weight: bold;
  text-align: center;
  border-radius: 1px;
  margin-right: 2px;
  transition: all 0.2s ease;
}

.priority-badge.micro {
  width: 16px;
  height: 8px;
  font-size: 4px;
  padding: 0;
}

.priority-badge.small {
  width: 20px;
  height: 10px;
  font-size: 5px;
  padding: 1px;
}

.priority-badge.medium {
  width: 28px;
  height: 12px;
  font-size: 6px;
  padding: 1px 2px;
}

.priority-badge.editable {
  cursor: pointer;
  border: 1px solid transparent;
}

.priority-badge.editable:hover {
  border-color: var(--text-primary);
  transform: scale(1.05);
}

/* Priority level specific styles */
.priority-badge.critical {
  animation: critical-pulse 1.5s infinite;
  box-shadow: 0 0 4px var(--accent-red);
}

@keyframes critical-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.priority-badge.high {
  box-shadow: 0 0 2px var(--accent-orange);
}

.priority-badge.medium {
  opacity: 0.9;
}

.priority-badge.low {
  opacity: 0.8;
}

.priority-badge.routine {
  opacity: 0.6;
  border: 1px solid var(--text-muted);
}

/* Priority selection menu */
.priority-menu {
  position: absolute;
  top: 100%;
  left: 0;
  display: flex;
  flex-direction: column;
  background: var(--secondary-bg);
  border: 1px solid var(--text-muted);
  border-radius: 2px;
  z-index: 1000;
  gap: 1px;
}

.priority-option {
  width: 20px;
  height: 10px;
  font-size: 4px;
  font-family: var(--font-mono);
  border: none;
  cursor: pointer;
  transition: all 0.1s ease;
}

.priority-option:hover {
  transform: scale(1.1);
}
```

## 📐 Architectural Integration

### Left Sidebar Integration
- **Position**: Between activity indicator and source name
- **Size**: Micro (16px x 8px) for compact display
- **Interaction**: Click to change priority (if editable)
- **Visual Hierarchy**: Clear priority indication without overwhelming interface

### Priority Management System
```typescript
interface PriorityManager {
  priorities: Map<string, PriorityLevel>;
  rules: PriorityRule[];
  automation: AutoPriorityConfig;
  history: PriorityChangeLog[];
}

interface PriorityRule {
  id: string;
  condition: (source: IntelligenceSource) => boolean;
  priority: PriorityLevel;
  description: string;
}

// Automatic priority assignment based on rules
const evaluateAutomaticPriority = (source: IntelligenceSource): PriorityLevel => {
  // Check for critical keywords
  if (source.keywords.some(k => criticalKeywords.includes(k))) {
    return 'critical';
  }
  
  // Check source reliability and activity
  if (source.reliability > 0.9 && source.activityScore > 0.8) {
    return 'high';
  }
  
  // Default based on source type
  return source.type === 'official' ? 'medium' : 'low';
};
```

## 🚀 Usage Guidelines

### Priority Assignment Guidelines

#### Critical (CRIT - Red, Pulsing)
- **Use Cases**: National security threats, emergency situations, mission-critical intelligence
- **Characteristics**: Immediate action required, highest resource allocation
- **Examples**: Terror threats, military actions, emergency responses
- **Monitoring**: Continuous real-time monitoring, immediate alerts

#### High (HIGH - Orange)
- **Use Cases**: Important developments, high-value targets, priority operations
- **Characteristics**: Urgent attention needed, significant resource allocation
- **Examples**: Political developments, economic indicators, strategic intelligence
- **Monitoring**: Frequent checking, priority alerts

#### Medium (MED - Yellow)
- **Use Cases**: Standard operational intelligence, routine monitoring targets
- **Characteristics**: Regular attention, balanced resource allocation
- **Examples**: Regional news, industry updates, general monitoring
- **Monitoring**: Regular scheduled checks

#### Low (LOW - Cyan)
- **Use Cases**: Background monitoring, supplementary intelligence, context sources
- **Characteristics**: Periodic attention, minimal resource allocation
- **Examples**: Historical context, background information, reference sources
- **Monitoring**: Infrequent checks, low-priority alerts

#### Routine (RTN - Gray)
- **Use Cases**: Baseline monitoring, archival sources, inactive feeds
- **Characteristics**: Minimal attention, maintenance-level monitoring
- **Examples**: Archived feeds, inactive sources, reference materials
- **Monitoring**: Scheduled maintenance checks only

### Operational Protocols
1. **Regular Review**: Assess and update priorities weekly or as operations evolve
2. **Emergency Escalation**: Quickly escalate priorities during crisis situations
3. **Resource Allocation**: Assign monitoring resources based on priority levels
4. **Team Communication**: Use priority badges for team coordination and handoffs

## 🔧 Performance Considerations

### Efficient Priority Management
```typescript
// Optimized priority lookup with caching
const priorityCache = new Map<string, { badge: PriorityBadge, timestamp: number }>();

const getPriorityBadgeOptimized = (sourceId: string): PriorityBadge => {
  const cached = priorityCache.get(sourceId);
  const now = Date.now();
  
  // Cache priorities for 5 minutes to reduce lookups
  if (cached && (now - cached.timestamp) < 300000) {
    return cached.badge;
  }
  
  const badge = getPriorityBadge(sourceId);
  priorityCache.set(sourceId, { badge, timestamp: now });
  
  return badge;
};
```

### Rendering Optimization
- **Minimal DOM Updates**: Priority changes only update specific badge elements
- **CSS Transitions**: Smooth visual transitions for priority changes
- **Efficient Sorting**: Pre-sorted priority arrays for quick rendering
- **Memory Management**: Regular cleanup of priority caches

## 🔮 Future Enhancement Opportunities

### Intelligent Priority Management
- **Auto-Assignment**: AI-driven automatic priority assignment based on content analysis
- **Dynamic Priorities**: Priorities that change based on real-time events and context
- **Collaborative Priorities**: Team-based priority assignment and consensus
- **Historical Learning**: Priority suggestions based on historical patterns

### Advanced Features
```typescript
interface AdvancedPrioritySystem {
  autoAssignment: boolean;
  dynamicPriorities: boolean;
  collaborativePriorities: boolean;
  historicalLearning: boolean;
  customPriorityLevels: UserDefinedPriority[];
}
```

### Integration Enhancements
- **Alert Integration**: Priority-based alert thresholds and notifications
- **Workflow Integration**: Priority-triggered workflow actions
- **Reporting**: Priority distribution and trend analysis
- **External Systems**: Priority synchronization with external tools

## 📊 Metrics & Analytics

### Priority Distribution Analysis
- **Level Distribution**: Percentage of sources at each priority level
- **Change Frequency**: How often priorities are modified
- **Accuracy Assessment**: Correlation between assigned priorities and actual importance
- **Resource Efficiency**: Relationship between priority and resource allocation

### Operational Effectiveness
- **Response Time**: Speed of response to different priority levels
- **Resource Utilization**: Efficiency of priority-based resource allocation
- **Miss Rate**: Important intelligence missed due to incorrect priority assignment
- **User Satisfaction**: Effectiveness of priority system for operational needs

## 🛡 Quality Assurance & Standards

### Priority Assignment Standards
- **Consistency**: Standardized criteria for priority assignment across team
- **Documentation**: Clear guidelines for each priority level
- **Review Process**: Regular review and validation of priority assignments
- **Audit Trail**: Complete logging of priority changes and justifications

### Error Prevention
- **Validation Rules**: Prevent invalid priority assignments
- **Conflict Resolution**: Handle conflicting priority assignments
- **Default Fallbacks**: Appropriate defaults when priority cannot be determined
- **User Training**: Ensure users understand priority system and guidelines
