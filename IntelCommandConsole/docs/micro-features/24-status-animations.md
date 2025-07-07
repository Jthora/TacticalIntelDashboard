# Status Animations

## ✨ Feature Overview

Status Animations provide dynamic visual feedback through micro-animations that communicate system states, user interactions, and data flow status, enhancing the tactical interface with purposeful motion that improves operational awareness.

## 🎯 Purpose & Strategic Value

### Mission-Critical Function
- **Immediate Feedback**: Instant visual confirmation of system actions and states
- **Attention Direction**: Guide user focus to important status changes and alerts
- **System Health Visualization**: Communicate system performance through motion
- **Professional Aesthetics**: Military-grade interface polish with purposeful animations

## 🏗 Technical Implementation

### Animation State Management
```typescript
interface AnimationState {
  isActive: boolean;
  type: 'pulse' | 'spin' | 'fade' | 'slide' | 'glow' | 'bounce';
  duration: number;
  intensity: 'subtle' | 'normal' | 'prominent';
  trigger: 'hover' | 'click' | 'status' | 'continuous';
}

const [animationStates, setAnimationStates] = useState<Map<string, AnimationState>>(new Map());

const triggerAnimation = (elementId: string, animationType: AnimationState['type']) => {
  setAnimationStates(prev => new Map(prev.set(elementId, {
    isActive: true,
    type: animationType,
    duration: getAnimationDuration(animationType),
    intensity: 'normal',
    trigger: 'status'
  })));
  
  // Auto-clear animation after duration
  setTimeout(() => {
    setAnimationStates(prev => {
      const newMap = new Map(prev);
      const state = newMap.get(elementId);
      if (state) {
        newMap.set(elementId, { ...state, isActive: false });
      }
      return newMap;
    });
  }, getAnimationDuration(animationType));
};

const getAnimationDuration = (type: AnimationState['type']): number => {
  const durations = {
    pulse: 2000,
    spin: 1000,
    fade: 500,
    slide: 300,
    glow: 3000,
    bounce: 600
  };
  return durations[type];
};
```

### Animation Component System
```tsx
const AnimatedElement: React.FC<{
  id: string;
  children: React.ReactNode;
  animationType?: AnimationState['type'];
  trigger?: AnimationState['trigger'];
  className?: string;
}> = ({ id, children, animationType = 'pulse', trigger = 'hover', className = '' }) => {
  const animationState = animationStates.get(id);
  
  const getAnimationClass = () => {
    if (!animationState?.isActive) return '';
    
    const baseClass = `animate-${animationState.type}`;
    const intensityClass = `intensity-${animationState.intensity}`;
    const durationClass = `duration-${animationState.duration}`;
    
    return `${baseClass} ${intensityClass} ${durationClass}`;
  };

  const handleInteraction = () => {
    if (trigger === 'click' || trigger === 'hover') {
      triggerAnimation(id, animationType);
    }
  };

  return (
    <div
      className={`animated-element ${className} ${getAnimationClass()}`}
      onMouseEnter={trigger === 'hover' ? handleInteraction : undefined}
      onClick={trigger === 'click' ? handleInteraction : undefined}
    >
      {children}
    </div>
  );
};
```

### CSS Animation Library
```css
/* Base animation classes */
.animated-element {
  transition: all 0.2s ease;
}

/* Pulse Animation - For active status indicators */
.animate-pulse {
  animation: status-pulse var(--animation-duration, 2s) infinite;
}

@keyframes status-pulse {
  0%, 100% { 
    opacity: 1; 
    transform: scale(1);
  }
  50% { 
    opacity: 0.6; 
    transform: scale(1.05);
  }
}

/* Spin Animation - For loading states */
.animate-spin {
  animation: tactical-spin var(--animation-duration, 1s) linear infinite;
}

@keyframes tactical-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Fade Animation - For state transitions */
.animate-fade {
  animation: tactical-fade var(--animation-duration, 500ms) ease-in-out;
}

@keyframes tactical-fade {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

/* Slide Animation - For menu appearances */
.animate-slide {
  animation: tactical-slide var(--animation-duration, 300ms) ease-out;
}

@keyframes tactical-slide {
  0% { 
    transform: translateY(-10px); 
    opacity: 0; 
  }
  100% { 
    transform: translateY(0); 
    opacity: 1; 
  }
}

/* Glow Animation - For critical alerts */
.animate-glow {
  animation: tactical-glow var(--animation-duration, 3s) ease-in-out infinite;
}

@keyframes tactical-glow {
  0%, 100% { 
    box-shadow: 0 0 4px currentColor;
  }
  50% { 
    box-shadow: 0 0 12px currentColor, 0 0 20px currentColor;
  }
}

/* Bounce Animation - For success feedback */
.animate-bounce {
  animation: tactical-bounce var(--animation-duration, 600ms) ease-in-out;
}

@keyframes tactical-bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-4px);
  }
  60% {
    transform: translateY(-2px);
  }
}

/* Intensity modifiers */
.intensity-subtle {
  --animation-intensity: 0.5;
  opacity: calc(1 * var(--animation-intensity, 1));
}

.intensity-normal {
  --animation-intensity: 1;
}

.intensity-prominent {
  --animation-intensity: 1.5;
  transform: scale(calc(1 + 0.1 * var(--animation-intensity, 1)));
}

/* Context-specific animations */
.connection-status.animate-pulse {
  animation-duration: 2s;
}

.alert-level.critical .animate-glow {
  animation-duration: 1s;
  color: var(--accent-red);
}

.export-btn.animate-spin {
  animation-duration: 1.5s;
}

.search-input.animate-glow {
  box-shadow: 0 0 4px var(--accent-cyan);
}

/* Performance optimizations */
.animated-element {
  will-change: transform, opacity;
  backface-visibility: hidden;
  perspective: 1000px;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-pulse,
  .animate-spin,
  .animate-glow,
  .animate-bounce {
    animation: none;
  }
  
  .animate-fade,
  .animate-slide {
    animation-duration: 0.1s;
  }
}
```

## 📐 Architectural Integration

### Component Animation Mapping
```typescript
interface ComponentAnimations {
  'connection-status': 'pulse';
  'alert-level': 'glow';
  'auto-refresh': 'spin';
  'export-button': 'bounce';
  'search-input': 'glow';
  'menu-dropdown': 'slide';
  'diagnostic-scan': 'spin';
  'filter-apply': 'fade';
}

// Automatic animation triggers based on component state
const useComponentAnimations = (componentId: string, state: any) => {
  useEffect(() => {
    const animationType = getAnimationForComponent(componentId, state);
    if (animationType && shouldTriggerAnimation(state)) {
      triggerAnimation(componentId, animationType);
    }
  }, [componentId, state]);
};

// Usage in components
const ConnectionStatus: React.FC = () => {
  const [status, setStatus] = useState('secure');
  
  useComponentAnimations('connection-status', status);
  
  return (
    <AnimatedElement 
      id="connection-status" 
      animationType="pulse"
      trigger="status"
    >
      <span className={`status-dot ${status}`}>●</span>
    </AnimatedElement>
  );
};
```

### Global Animation Controller
```typescript
interface AnimationController {
  globalEnabled: boolean;
  performanceMode: 'high' | 'medium' | 'low';
  reducedMotion: boolean;
  animationQueue: AnimationTask[];
}

const useAnimationController = () => {
  const [controller, setController] = useState<AnimationController>({
    globalEnabled: true,
    performanceMode: 'medium',
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    animationQueue: []
  });

  const shouldAnimate = (animationType: string) => {
    if (!controller.globalEnabled || controller.reducedMotion) return false;
    
    const performanceMap = {
      high: ['pulse', 'spin', 'fade', 'slide', 'glow', 'bounce'],
      medium: ['pulse', 'fade', 'slide', 'bounce'],
      low: ['fade', 'slide']
    };
    
    return performanceMap[controller.performanceMode].includes(animationType);
  };

  return { controller, shouldAnimate };
};
```

## 🚀 Usage Guidelines

### Animation Context Guidelines

#### Pulse Animations
- **Use For**: Active status indicators, real-time data updates
- **Context**: Connection status, activity indicators, live data streams
- **Duration**: 2-3 seconds for subtle awareness
- **Intensity**: Subtle for continuous states, normal for status changes

#### Spin Animations
- **Use For**: Loading states, processing indicators, refresh actions
- **Context**: Auto-refresh active, diagnostic scans, data export
- **Duration**: 1-2 seconds, continuous while process active
- **Intensity**: Normal speed, avoid rapid spinning

#### Glow Animations
- **Use For**: Critical alerts, attention-required states, search focus
- **Context**: Alert level changes, critical notifications, active search
- **Duration**: 3-4 seconds for alerts, continuous for critical states
- **Intensity**: Prominent for critical, normal for warnings

#### Slide Animations
- **Use For**: Menu appearances, panel expansions, content reveals
- **Context**: Dropdown menus, expanding panels, filter results
- **Duration**: 300-500ms for quick, smooth transitions
- **Intensity**: Consistent slide distance and speed

#### Bounce Animations
- **Use For**: Success feedback, positive confirmations, completions
- **Context**: Successful exports, completed actions, positive responses
- **Duration**: 600ms single bounce sequence
- **Intensity**: Subtle bounce for feedback, normal for celebrations

#### Fade Animations
- **Use For**: State transitions, content changes, gentle appearances
- **Context**: Filter applications, content updates, mode switches
- **Duration**: 200-500ms for smooth transitions
- **Intensity**: Quick and subtle for seamless experience

### Performance Guidelines
1. **Animation Budget**: Limit to 3-5 simultaneous animations maximum
2. **Duration Limits**: Keep animations under 3 seconds for continuous, 1 second for interactions
3. **Reduced Motion**: Always provide reduced motion alternatives
4. **Performance Monitoring**: Monitor animation impact on system performance

## 🔧 Performance Considerations

### Animation Performance Optimization
```typescript
// Efficient animation queue management
class AnimationQueue {
  private queue: AnimationTask[] = [];
  private running: Set<string> = new Set();
  private maxConcurrent = 5;

  addAnimation(task: AnimationTask) {
    if (this.running.size >= this.maxConcurrent) {
      this.queue.push(task);
    } else {
      this.executeAnimation(task);
    }
  }

  private executeAnimation(task: AnimationTask) {
    this.running.add(task.id);
    
    // Use RAF for smooth animations
    requestAnimationFrame(() => {
      task.execute();
      
      setTimeout(() => {
        this.running.delete(task.id);
        this.processQueue();
      }, task.duration);
    });
  }

  private processQueue() {
    if (this.queue.length > 0 && this.running.size < this.maxConcurrent) {
      const nextTask = this.queue.shift();
      if (nextTask) {
        this.executeAnimation(nextTask);
      }
    }
  }
}
```

### Hardware Acceleration
```css
/* Ensure hardware acceleration for smooth animations */
.animated-element {
  transform: translateZ(0); /* Force GPU acceleration */
  will-change: transform, opacity; /* Hint browser for optimization */
  backface-visibility: hidden; /* Prevent flickering */
}

/* Use transform and opacity for best performance */
@keyframes optimized-pulse {
  0%, 100% { 
    opacity: 1; 
    transform: translateZ(0) scale(1);
  }
  50% { 
    opacity: 0.6; 
    transform: translateZ(0) scale(1.05);
  }
}
```

## 🔮 Future Enhancement Opportunities

### Advanced Animation Features
- **Micro-Interactions**: Sophisticated hover and click animations
- **Data Visualization**: Animated charts and graphs for intelligence data
- **Transition Orchestration**: Coordinated animations across multiple components
- **Physics-Based Animation**: Natural motion with spring physics

### Intelligent Animation System
```typescript
interface IntelligentAnimationSystem {
  contextAware: boolean;
  adaptivePerformance: boolean;
  userPreferenceLearning: boolean;
  accessibilityOptimization: boolean;
  batteryAwareAnimations: boolean;
}
```

## 📊 Metrics & Analytics

### Animation Performance Metrics
- **Frame Rate**: Maintain 60fps during animations
- **CPU Usage**: Animation impact on system performance
- **Battery Impact**: Power consumption from animations
- **User Preference**: Animation effectiveness and user satisfaction

### Usage Analytics
- **Animation Frequency**: How often different animations are triggered
- **User Interaction**: Response to animated feedback
- **Performance Impact**: Correlation between animations and system responsiveness
- **Accessibility Usage**: Reduced motion preference adoption

## 🛡 Accessibility & Standards

### Accessibility Compliance
- **Reduced Motion**: Respect user motion preferences
- **Screen Reader Support**: Ensure animations don't interfere with assistive technology
- **Contrast Sensitivity**: Animation visibility across different contrast settings
- **Seizure Prevention**: Avoid rapid flashing or strobing effects

### Professional Standards
- **Military Interface Guidelines**: Conform to tactical interface standards
- **Performance Standards**: Maintain system responsiveness during animations
- **User Experience**: Enhance rather than distract from operational tasks
- **Cross-Platform Consistency**: Consistent animation behavior across devices
