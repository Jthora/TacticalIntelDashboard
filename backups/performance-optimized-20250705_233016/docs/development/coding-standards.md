# 📝 Development Coding Standards

## Overview

This document outlines the coding standards, conventions, and best practices for the Tactical Intel Dashboard project. These standards ensure code consistency, maintainability, and the military-precision aesthetic that defines our platform.

## 🎯 Core Principles

### **1. Military Precision**
- **Zero Tolerance for Bugs**: Code must be thoroughly tested
- **Mission-Critical Reliability**: Every feature must be production-ready
- **Clear Command Structure**: Well-defined component hierarchy
- **Strategic Documentation**: Every decision must be documented

### **2. Tactical Efficiency**
- **Performance First**: Optimize for speed and responsiveness
- **Minimal Dependencies**: Reduce attack surface and complexity
- **Clear Objectives**: Every component has a single responsibility
- **Strategic Planning**: Architecture decisions support long-term goals

## 📋 TypeScript Standards

### **Type Safety Requirements**
```typescript
// ✅ REQUIRED: Strict TypeScript configuration
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "noImplicitReturns": true
}

// ✅ GOOD: Explicit typing
interface AlertConfig {
  id: string;
  name: string;
  keywords: string[];
  priority: AlertPriority;
}

// ❌ BAD: Implicit any
function processData(data: any) { }

// ✅ GOOD: Generic with constraints
function processData<T extends BaseItem>(data: T[]): ProcessedData<T> { }
```

### **Interface and Type Definitions**
```typescript
// ✅ Interfaces for object shapes
interface UserPreferences {
  theme: 'tactical' | 'minimal';
  autoRefresh: boolean;
  notificationSound: boolean;
}

// ✅ Types for unions and primitives
type AlertPriority = 'low' | 'medium' | 'high' | 'critical';
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// ✅ Utility types for transformations
type PartialAlert = Partial<Pick<AlertConfig, 'name' | 'keywords'>>;
```

## ⚛️ React Component Standards

### **Component Architecture**
```typescript
// ✅ GOOD: Functional component with proper typing
interface ComponentProps {
  data: FeedItem[];
  onAction: (item: FeedItem) => void;
  className?: string;
}

const ComponentName: React.FC<ComponentProps> = ({ 
  data, 
  onAction, 
  className = '' 
}) => {
  // Component implementation
  return <div className={`base-class ${className}`}>...</div>;
};

export default ComponentName;
```

### **Hook Usage Patterns**
```typescript
// ✅ GOOD: Custom hook with proper return typing
interface UseAlertsReturn {
  alerts: AlertConfig[];
  addAlert: (alert: Omit<AlertConfig, 'id'>) => void;
  removeAlert: (id: string) => void;
  isLoading: boolean;
  error: string | null;
}

const useAlerts = (): UseAlertsReturn => {
  // Hook implementation
};

// ✅ GOOD: useEffect with dependencies
useEffect(() => {
  const cleanup = setupAlertMonitoring();
  return cleanup;
}, [alertConfigs, isActive]); // Clear dependencies
```

### **Event Handling**
```typescript
// ✅ GOOD: Typed event handlers
const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  // Process form
}, [dependency]);

// ✅ GOOD: Custom event handlers
const handleAlertTrigger = useCallback((alert: AlertConfig, feedItem: FeedItem) => {
  // Handle alert trigger
}, []);
```

## 🎨 CSS and Styling Standards

### **Tactical Theme Guidelines**
```css
/* ✅ GOOD: CSS custom properties for consistency */
:root {
  --tactical-green: #00ff00;
  --tactical-amber: #ffaa00;
  --tactical-red: #ff0000;
  --tactical-bg: #0a0a0a;
  --tactical-surface: #1a1a1a;
  --tactical-border: #333333;
}

/* ✅ GOOD: Component-scoped styles */
.alert-manager {
  background: var(--tactical-surface);
  border: 1px solid var(--tactical-border);
  border-radius: 4px;
}

/* ✅ GOOD: Military-inspired naming */
.command-panel { }
.intel-grid { }
.status-indicator { }
.priority-critical { }
```

### **Responsive Design Standards**
```css
/* ✅ GOOD: Mobile-first approach */
.feed-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .feed-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .feed-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### **Animation and Transitions**
```css
/* ✅ GOOD: Subtle, purposeful animations */
.status-indicator {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.alert-notification {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

## 🚀 Performance Standards

### **Component Optimization**
```typescript
// ✅ GOOD: Memoization for expensive operations
const ProcessedData = React.memo(({ data }: { data: FeedItem[] }) => {
  const processedItems = useMemo(() => 
    data.map(item => processItem(item)), 
    [data]
  );
  
  return <div>{/* Render processed items */}</div>;
});

// ✅ GOOD: useCallback for stable references
const handleItemClick = useCallback((item: FeedItem) => {
  onItemSelect(item);
}, [onItemSelect]);
```

### **Bundle Size Management**
```typescript
// ✅ GOOD: Tree-shakable imports
import { debounce } from 'lodash-es';

// ❌ BAD: Full library import
import _ from 'lodash';

// ✅ GOOD: Dynamic imports for large features
const ChartComponent = React.lazy(() => import('./ChartComponent'));
```

## 🧪 Testing Standards

### **Test Structure**
```typescript
// ✅ GOOD: Comprehensive test structure
describe('AlertService', () => {
  beforeEach(() => {
    // Setup
  });

  describe('keyword matching', () => {
    it('should match simple keywords', () => {
      // Test implementation
    });

    it('should handle boolean logic', () => {
      // Test implementation
    });
  });

  describe('notification system', () => {
    it('should trigger browser notifications', () => {
      // Test implementation
    });
  });
});
```

### **Testing Utilities**
```typescript
// ✅ GOOD: Test utilities for consistency
const createMockFeedItem = (overrides: Partial<FeedItem> = {}): FeedItem => ({
  id: 'test-id',
  title: 'Test Article',
  description: 'Test description',
  link: 'https://example.com',
  pubDate: new Date().toISOString(),
  ...overrides
});
```

## 📚 Documentation Standards

### **Code Documentation**
```typescript
/**
 * Processes feed items and triggers alerts based on configured keywords.
 * 
 * @param feedItems - Array of feed items to process
 * @param alertConfigs - Alert configurations to check against
 * @returns Array of triggered alerts with metadata
 * 
 * @example
 * ```typescript
 * const triggers = processAlerts(feedItems, alertConfigs);
 * triggers.forEach(trigger => handleAlert(trigger));
 * ```
 */
function processAlerts(
  feedItems: FeedItem[], 
  alertConfigs: AlertConfig[]
): AlertTrigger[] {
  // Implementation
}
```

### **README Standards**
- **Mission Statement**: Clear purpose and objectives
- **Quick Start**: Immediate deployment instructions
- **Architecture**: High-level system overview
- **Contributing**: Standards and guidelines

## 🔒 Security Standards

### **Input Validation**
```typescript
// ✅ GOOD: Input sanitization
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .slice(0, 1000); // Limit length
}

// ✅ GOOD: URL validation
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}
```

### **Data Handling**
```typescript
// ✅ GOOD: Safe localStorage usage
function safeLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}
```

## 🎖️ Code Review Standards

### **Review Checklist**
- [ ] **Functionality**: Does the code work as intended?
- [ ] **Performance**: Are there any performance bottlenecks?
- [ ] **Security**: Are there any security vulnerabilities?
- [ ] **Style**: Does the code follow our style guidelines?
- [ ] **Tests**: Are there adequate tests for the changes?
- [ ] **Documentation**: Is the code properly documented?

### **Tactical Principles Review**
- [ ] **Mission Focus**: Does this serve the tactical intelligence mission?
- [ ] **User Experience**: Does this enhance the command center feeling?
- [ ] **Reliability**: Is this production-ready for mission-critical use?
- [ ] **Maintainability**: Can future developers understand and extend this?

## 🚀 Deployment Standards

### **Build Requirements**
```bash
# ✅ Required checks before deployment
npm run type-check    # TypeScript compilation
npm run lint         # ESLint and Prettier
npm run test         # Jest test suite
npm run build        # Production build
npm run preview      # Build verification
```

### **Environment Configuration**
```typescript
// ✅ GOOD: Environment-aware configuration
const config = {
  apiUrl: process.env.NODE_ENV === 'production' 
    ? 'https://api.tactical-intel.app'
    : 'http://localhost:3000',
  
  enableAnalytics: process.env.NODE_ENV === 'production',
  debugMode: process.env.NODE_ENV === 'development'
};
```

---

## 🎯 Enforcement

These standards are enforced through:
- **ESLint + Prettier**: Automated code formatting
- **TypeScript**: Compile-time type checking
- **Husky**: Pre-commit hooks
- **GitHub Actions**: CI/CD pipeline validation
- **Code Reviews**: Human oversight and quality assurance

Remember: **Code is our weapon. Standards are our discipline. Excellence is our mission.**

---

*These standards evolve with the platform. Suggest improvements through our enhancement process.*

**Last Updated**: July 6, 2025  
**Next Review**: Monthly standards review
