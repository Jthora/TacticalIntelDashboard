# Hover Transformations

## 🎨 Feature Overview

Hover Transformations provide sophisticated visual feedback through micro-transformations on mouse hover, enhancing interface responsiveness and providing clear interactive affordances while maintaining the tactical aesthetic of the command center interface.

## 🎯 Purpose & Strategic Value

### Mission-Critical Function
- **Interactive Affordances**: Clear visual feedback indicating interactive elements
- **Precision Targeting**: Enhanced cursor precision for small tactical interface elements
- **Professional Polish**: Military-grade interface refinement with purposeful hover states
- **Accessibility Enhancement**: Visual feedback for users with motor or vision limitations

## 🏗 Technical Implementation

### Hover State Management
```typescript
interface HoverTransformation {
  elementType: string;
  transform: {
    scale?: number;
    translateX?: number;
    translateY?: number;
    rotateZ?: number;
  };
  color?: {
    text?: string;
    background?: string;
    border?: string;
  };
  shadow?: string;
  duration: number;
  easing: string;
}

const hoverTransformations: Record<string, HoverTransformation> = {
  'header-button': {
    elementType: 'header-button',
    transform: { scale: 1.1 },
    color: {
      text: 'var(--accent-cyan)',
      border: 'var(--accent-cyan)'
    },
    shadow: '0 0 8px rgba(0, 255, 170, 0.4)',
    duration: 200,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  'sidebar-control': {
    elementType: 'sidebar-control',
    transform: { scale: 1.05, translateY: -1 },
    color: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: 'var(--accent-cyan)'
    },
    duration: 150,
    easing: 'ease-out'
  },
  'priority-badge': {
    elementType: 'priority-badge',
    transform: { scale: 1.15 },
    shadow: '0 0 6px currentColor',
    duration: 100,
    easing: 'ease-in-out'
  },
  'diagnostic-button': {
    elementType: 'diagnostic-button',
    transform: { scale: 1.08, rotateZ: 2 },
    color: {
      text: 'var(--accent-orange)',
      border: 'var(--accent-orange)'
    },
    duration: 180,
    easing: 'ease-out'
  },
  'source-item': {
    elementType: 'source-item',
    transform: { translateX: 2, scale: 1.02 },
    color: {
      background: 'rgba(0, 255, 170, 0.05)'
    },
    duration: 120,
    easing: 'ease-out'
  }
};

const useHoverTransformation = (elementType: string) => {
  const [isHovered, setIsHovered] = useState(false);
  const transformation = hoverTransformations[elementType];

  const hoverProps = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    style: isHovered ? getTransformationStyles(transformation) : {}
  };

  return { hoverProps, isHovered };
};

const getTransformationStyles = (transformation: HoverTransformation) => {
  const { transform, color, shadow, duration, easing } = transformation;
  
  let transformString = '';
  if (transform.scale) transformString += `scale(${transform.scale}) `;
  if (transform.translateX) transformString += `translateX(${transform.translateX}px) `;
  if (transform.translateY) transformString += `translateY(${transform.translateY}px) `;
  if (transform.rotateZ) transformString += `rotateZ(${transform.rotateZ}deg) `;

  return {
    transform: transformString.trim(),
    color: color?.text,
    backgroundColor: color?.background,
    borderColor: color?.border,
    boxShadow: shadow,
    transition: `all ${duration}ms ${easing}`
  };
};
```

### Component Integration
```tsx
const HoverableButton: React.FC<{
  elementType: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ elementType, children, className = '', onClick }) => {
  const { hoverProps, isHovered } = useHoverTransformation(elementType);

  return (
    <button
      className={`hoverable-element ${className} ${isHovered ? 'hovered' : ''}`}
      onClick={onClick}
      {...hoverProps}
    >
      {children}
    </button>
  );
};

// Usage in components
const ConnectionStatus: React.FC = () => (
  <HoverableButton 
    elementType="header-button"
    className="connection-status-btn"
    onClick={toggleConnectionStatus}
  >
    <span className="status-dot">●</span>
  </HoverableButton>
);

const SourceItem: React.FC<{ source: IntelligenceSource }> = ({ source }) => {
  const { hoverProps, isHovered } = useHoverTransformation('source-item');

  return (
    <div 
      className={`source-item ${isHovered ? 'hovered' : ''}`}
      {...hoverProps}
    >
      <ActivityIndicator sourceId={source.id} />
      <PriorityBadge sourceId={source.id} />
      <span className="source-name">{source.name}</span>
    </div>
  );
};
```

### CSS Hover System
```css
/* Base hoverable element styling */
.hoverable-element {
  position: relative;
  transition: all 0.2s ease;
  cursor: pointer;
  will-change: transform;
}

/* Header button hover transformations */
.header-button {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.header-button:hover {
  transform: scale(1.1);
  color: var(--accent-cyan);
  border-color: var(--accent-cyan);
  box-shadow: 0 0 8px rgba(0, 255, 170, 0.4);
}

/* Sidebar control hover transformations */
.sidebar-control {
  transition: all 150ms ease-out;
}

.sidebar-control:hover {
  transform: scale(1.05) translateY(-1px);
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--accent-cyan);
}

/* Priority badge hover transformations */
.priority-badge {
  transition: all 100ms ease-in-out;
}

.priority-badge:hover {
  transform: scale(1.15);
  box-shadow: 0 0 6px currentColor;
  z-index: 10;
}

/* Source item hover transformations */
.source-item {
  transition: all 120ms ease-out;
  border-left: 2px solid transparent;
}

.source-item:hover {
  transform: translateX(2px) scale(1.02);
  background: rgba(0, 255, 170, 0.05);
  border-left-color: var(--accent-cyan);
}

/* Diagnostic button hover transformations */
.diagnostic-button {
  transition: all 180ms ease-out;
}

.diagnostic-button:hover {
  transform: scale(1.08) rotateZ(2deg);
  color: var(--accent-orange);
  border-color: var(--accent-orange);
}

/* Filter button hover transformations */
.filter-btn {
  transition: all 160ms ease-out;
}

.filter-btn:hover {
  transform: scale(1.06);
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--accent-cyan);
}

/* Export button hover transformations */
.export-btn {
  transition: all 140ms ease-out;
}

.export-btn:hover {
  transform: scale(1.1) translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 255, 170, 0.3);
}

/* Menu item hover transformations */
.menu-item {
  transition: all 100ms ease-out;
}

.menu-item:hover {
  transform: translateX(3px);
  background: rgba(0, 255, 170, 0.1);
  color: var(--accent-cyan);
}

/* Search input hover transformations */
.search-input {
  transition: all 200ms ease-out;
}

.search-input:hover,
.search-input:focus {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 4px rgba(0, 255, 170, 0.3);
}

/* Activity indicator hover transformations */
.activity-indicator {
  transition: all 150ms ease-out;
}

.activity-indicator:hover {
  transform: scale(1.3);
  filter: brightness(1.2);
}

/* Complex hover with pseudo-elements */
.hoverable-element::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent, rgba(0, 255, 170, 0.1), transparent);
  opacity: 0;
  transition: opacity 200ms ease;
  pointer-events: none;
}

.hoverable-element:hover::before {
  opacity: 1;
}

/* Performance optimizations */
.hoverable-element {
  backface-visibility: hidden;
  perspective: 1000px;
  transform: translateZ(0); /* Force hardware acceleration */
}

/* Accessibility and reduced motion */
@media (prefers-reduced-motion: reduce) {
  .hoverable-element,
  .header-button,
  .sidebar-control,
  .priority-badge,
  .source-item,
  .diagnostic-button {
    transition-duration: 0.1s;
  }
  
  .hoverable-element:hover,
  .header-button:hover,
  .sidebar-control:hover,
  .priority-badge:hover,
  .source-item:hover,
  .diagnostic-button:hover {
    transform: none;
  }
}

/* Focus states for keyboard navigation */
.hoverable-element:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 2px;
}
```

## 📐 Architectural Integration

### Global Hover Management
```typescript
interface HoverManager {
  globalEnabled: boolean;
  performanceMode: 'high' | 'medium' | 'low';
  customTransformations: Map<string, HoverTransformation>;
  activeHovers: Set<string>;
}

const useGlobalHoverManager = () => {
  const [manager, setManager] = useState<HoverManager>({
    globalEnabled: true,
    performanceMode: 'medium',
    customTransformations: new Map(),
    activeHovers: new Set()
  });

  const registerHover = (elementId: string) => {
    setManager(prev => ({
      ...prev,
      activeHovers: new Set(prev.activeHovers.add(elementId))
    }));
  };

  const unregisterHover = (elementId: string) => {
    setManager(prev => {
      const newHovers = new Set(prev.activeHovers);
      newHovers.delete(elementId);
      return { ...prev, activeHovers: newHovers };
    });
  };

  return { manager, registerHover, unregisterHover };
};
```

### Context-Aware Hover Effects
```typescript
const getContextualHoverEffect = (elementType: string, context: OperationalContext) => {
  const baseTransformation = hoverTransformations[elementType];
  
  // Modify transformations based on operational context
  switch (context.alertLevel) {
    case 'critical':
      return {
        ...baseTransformation,
        color: { ...baseTransformation.color, text: 'var(--accent-red)' },
        shadow: '0 0 12px rgba(255, 0, 64, 0.6)'
      };
    case 'normal':
      return baseTransformation;
    default:
      return {
        ...baseTransformation,
        transform: { scale: 1.02 }, // Reduced effect for low-priority contexts
        duration: 100
      };
  }
};
```

## 🚀 Usage Guidelines

### Hover Effect Categories

#### Micro-Interactions (Scale 1.05-1.1)
- **Use For**: Small buttons, controls, status indicators
- **Context**: Header buttons, filter controls, micro-badges
- **Purpose**: Subtle feedback for precision interactions
- **Duration**: 100-150ms for responsive feel

#### Standard Interactions (Scale 1.1-1.15)
- **Use For**: Primary buttons, menu items, action controls
- **Context**: Export buttons, diagnostic actions, menu selections
- **Purpose**: Clear interactive feedback
- **Duration**: 150-200ms for smooth feel

#### Emphasis Interactions (Scale 1.15+)
- **Use For**: Critical actions, priority elements, alerts
- **Context**: Priority badges, critical alerts, emergency controls
- **Purpose**: High-visibility interaction feedback
- **Duration**: 100-180ms for immediate response

#### Spatial Interactions (Translate movements)
- **Use For**: List items, panels, cards
- **Context**: Source items, expandable sections, navigational elements
- **Purpose**: Sense of depth and spatial organization
- **Duration**: 120-180ms for smooth motion

### Design Principles
1. **Purposeful Motion**: Every hover effect serves a functional purpose
2. **Consistent Timing**: Similar elements use similar durations
3. **Accessibility First**: Respect reduced motion preferences
4. **Performance Aware**: Optimize for smooth 60fps interactions

## 🔧 Performance Considerations

### Optimization Strategies
```typescript
// Efficient hover state management
const useOptimizedHover = (elementType: string) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Debounce hover state changes to prevent rapid toggles
  const debouncedSetHover = useMemo(
    () => debounce(setIsHovered, 10),
    []
  );

  // Use RAF for smooth state updates
  const handleMouseEnter = useCallback(() => {
    requestAnimationFrame(() => debouncedSetHover(true));
  }, [debouncedSetHover]);

  const handleMouseLeave = useCallback(() => {
    requestAnimationFrame(() => debouncedSetHover(false));
  }, [debouncedSetHover]);

  return {
    isHovered,
    hoverProps: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave
    }
  };
};
```

### Hardware Acceleration
```css
/* Ensure smooth transforms with hardware acceleration */
.hoverable-element {
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* Use composite layers for complex hover effects */
.complex-hover {
  position: relative;
  isolation: isolate;
}

.complex-hover::before,
.complex-hover::after {
  content: '';
  position: absolute;
  will-change: opacity, transform;
}
```

## 🔮 Future Enhancement Opportunities

### Advanced Hover Systems
- **Gesture Recognition**: Multi-touch and gesture-based hover states
- **Proximity Effects**: Hover effects that respond to cursor proximity
- **Context Adaptation**: Hover effects that change based on system state
- **Physics-Based Motion**: Spring physics for natural hover animations

### Intelligent Interactions
```typescript
interface IntelligentHoverSystem {
  adaptiveIntensity: boolean;
  contextualEffects: boolean;
  learningPreferences: boolean;
  gestureSupport: boolean;
  proximityDetection: boolean;
}
```

## 📊 Metrics & Analytics

### Hover Interaction Analytics
- **Hover Frequency**: Most frequently hovered elements
- **Interaction Patterns**: User hover behavior and preferences
- **Performance Impact**: Effect of hover states on system performance
- **Accessibility Usage**: Reduced motion preference adoption

### User Experience Metrics
- **Task Completion**: Impact of hover feedback on task success rates
- **Error Reduction**: Fewer clicks on non-interactive elements
- **User Satisfaction**: Perceived responsiveness and polish
- **Accessibility Compliance**: Effectiveness for users with disabilities

## 🛡 Accessibility & Standards

### Accessibility Compliance
- **Keyboard Navigation**: Equivalent focus states for keyboard users
- **Screen Readers**: Hover states don't interfere with assistive technology
- **Motor Disabilities**: Hover effects accommodate tremor and precision issues
- **Visual Impairments**: High contrast hover states for visibility

### Professional Standards
- **Military Interface Guidelines**: Appropriate hover feedback for tactical interfaces
- **Performance Standards**: Maintain system responsiveness during hover interactions
- **Cross-Platform Consistency**: Consistent hover behavior across devices
- **Touch Device Adaptation**: Appropriate touch equivalents for hover states
