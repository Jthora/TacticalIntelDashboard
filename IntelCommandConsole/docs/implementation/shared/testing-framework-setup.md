# Testing Framework Setup and Strategy

## Overview

This document establishes the testing framework, tools, and methodologies for implementing and verifying all functionality identified in the Component Functionality Audit.

## Testing Stack

### Core Testing Libraries
```json
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/user-event": "^14.4.3",
    "jest": "^27.5.1",
    "jest-environment-jsdom": "^27.5.1",
    "msw": "^0.49.3",
    "cypress": "^12.0.0",
    "@testing-library/cypress": "^9.0.0"
  }
}
```

### Test Categories

1. **Unit Tests**: Individual components and services
2. **Integration Tests**: Component interactions and data flow
3. **End-to-End Tests**: Complete user workflows
4. **Performance Tests**: Response times and memory usage
5. **Accessibility Tests**: WCAG compliance and screen reader support

## Test Organization

### Directory Structure
```
src/
├── components/
│   ├── __tests__/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── snapshots/
├── services/
│   ├── __tests__/
│   │   ├── unit/
│   │   └── mocks/
├── contexts/
│   └── __tests__/
├── utils/
│   └── __tests__/
└── __tests__/
    ├── e2e/
    ├── performance/
    └── accessibility/
```

## Unit Testing Standards

### Component Testing Template
```typescript
// Template: ComponentName.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from '../ComponentName';
import { TestProviders } from '../../__tests__/utils/TestProviders';

// Mock external dependencies
jest.mock('../services/ServiceName');

describe('ComponentName', () => {
  const defaultProps = {
    // Define default props
  };
  
  const renderComponent = (props = {}) => {
    return render(
      <TestProviders>
        <ComponentName {...defaultProps} {...props} />
      </TestProviders>
    );
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Rendering', () => {
    it('should render without crashing', () => {
      renderComponent();
      expect(screen.getByRole('...', { name: /.../ })).toBeInTheDocument();
    });
    
    it('should render with custom props', () => {
      renderComponent({ customProp: 'value' });
      // Assertions
    });
  });
  
  describe('User Interactions', () => {
    it('should handle button click', async () => {
      const onClickMock = jest.fn();
      renderComponent({ onClick: onClickMock });
      
      const button = screen.getByRole('button', { name: /click me/i });
      await userEvent.click(button);
      
      expect(onClickMock).toHaveBeenCalledWith(expect.objectContaining({
        // Expected parameters
      }));
    });
  });
  
  describe('State Management', () => {
    it('should update state correctly', async () => {
      renderComponent();
      
      // Trigger state change
      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'new value');
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('new value')).toBeInTheDocument();
      });
    });
  });
  
  describe('Error Handling', () => {
    it('should display error message when service fails', async () => {
      // Mock service to throw error
      const ServiceMock = require('../services/ServiceName');
      ServiceMock.method.mockRejectedValue(new Error('Service error'));
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText(/error occurred/i)).toBeInTheDocument();
      });
    });
  });
});
```

### Service Testing Template
```typescript
// Template: ServiceName.test.ts
import { ServiceName } from '../ServiceName';
import { MockLocalStorage } from '../../__tests__/mocks/MockLocalStorage';

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: new MockLocalStorage()
});

describe('ServiceName', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });
  
  describe('Method Name', () => {
    it('should return expected result for valid input', () => {
      const input = { /* test data */ };
      const expectedOutput = { /* expected result */ };
      
      const result = ServiceName.methodName(input);
      
      expect(result).toEqual(expectedOutput);
    });
    
    it('should handle edge cases', () => {
      // Test edge cases
    });
    
    it('should throw error for invalid input', () => {
      expect(() => {
        ServiceName.methodName(null);
      }).toThrow('Expected error message');
    });
  });
  
  describe('Async Operations', () => {
    it('should resolve with correct data', async () => {
      const result = await ServiceName.asyncMethod();
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('expectedProperty');
    });
    
    it('should handle network errors', async () => {
      // Mock fetch to fail
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      
      await expect(ServiceName.asyncMethod()).rejects.toThrow('Network error');
    });
  });
});
```

## Integration Testing Standards

### Component Integration Template
```typescript
// Template: FeatureIntegration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterProvider } from '../../contexts/FilterContext';
import { HealthProvider } from '../../contexts/HealthContext';
import { TacticalFilters } from '../TacticalFilters';
import { FeedVisualizer } from '../FeedVisualizer';

describe('Filter Integration', () => {
  const renderIntegratedComponents = () => {
    return render(
      <FilterProvider>
        <HealthProvider>
          <div>
            <TacticalFilters />
            <FeedVisualizer />
          </div>
        </HealthProvider>
      </FilterProvider>
    );
  };
  
  it('should filter content when filters are applied', async () => {
    renderIntegratedComponents();
    
    // Apply filter
    const criticalFilter = screen.getByText('CRITICAL');
    await userEvent.click(criticalFilter);
    
    const applyButton = screen.getByText('APPLY FILTERS');
    await userEvent.click(applyButton);
    
    // Verify filtering effect
    await waitFor(() => {
      const visibleFeeds = screen.getAllByTestId('feed-item');
      expect(visibleFeeds).toHaveLength(expectedFilteredCount);
    });
  });
  
  it('should sync state between components', async () => {
    renderIntegratedComponents();
    
    // Change state in one component
    // Verify state change in other component
  });
});
```

## Test Utilities and Mocks

### Test Providers
**File**: `src/__tests__/utils/TestProviders.tsx`

```typescript
import React, { ReactNode } from 'react';
import { FilterProvider } from '../../contexts/FilterContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { HealthProvider } from '../../contexts/HealthContext';

interface TestProvidersProps {
  children: ReactNode;
  initialFilterState?: Partial<FilterState>;
  initialTheme?: string;
  initialHealthState?: Partial<SystemHealthState>;
}

export const TestProviders: React.FC<TestProvidersProps> = ({
  children,
  initialFilterState,
  initialTheme,
  initialHealthState
}) => {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <FilterProvider initialState={initialFilterState}>
        <HealthProvider initialState={initialHealthState}>
          {children}
        </HealthProvider>
      </FilterProvider>
    </ThemeProvider>
  );
};
```

### Mock Services
**File**: `src/__tests__/mocks/MockFeedService.ts`

```typescript
import { Feed, FeedList } from '../../types/FeedTypes';

export const mockFeeds: Feed[] = [
  {
    id: '1',
    title: 'Critical Security Alert',
    description: 'Urgent security update required',
    url: 'https://example.com/feed1',
    link: 'https://example.com/article1',
    pubDate: new Date().toISOString(),
    priority: 'CRITICAL',
    contentType: 'ALERT',
    region: 'GLOBAL'
  },
  {
    id: '2',
    title: 'Regular News Update',
    description: 'Daily news briefing',
    url: 'https://example.com/feed2',
    link: 'https://example.com/article2',
    pubDate: new Date(Date.now() - 86400000).toISOString(),
    priority: 'LOW',
    contentType: 'NEWS',
    region: 'AMERICAS'
  }
];

export const mockFeedLists: FeedList[] = [
  {
    id: 'list1',
    name: 'Security Feeds',
    description: 'Critical security updates'
  },
  {
    id: 'list2',
    name: 'News Feeds',
    description: 'General news sources'
  }
];

export const MockFeedService = {
  getFeeds: jest.fn().mockReturnValue(mockFeeds),
  getFeedLists: jest.fn().mockReturnValue(mockFeedLists),
  getFeedsByList: jest.fn((listId: string) => 
    mockFeeds.filter(feed => feed.feedListId === listId)
  ),
  addFeed: jest.fn(),
  removeFeed: jest.fn(),
  updateFeedsFromServer: jest.fn().mockResolvedValue(undefined)
};
```

### Mock LocalStorage
**File**: `src/__tests__/mocks/MockLocalStorage.ts`

```typescript
export class MockLocalStorage {
  private store: Record<string, string> = {};
  
  getItem(key: string): string | null {
    return this.store[key] || null;
  }
  
  setItem(key: string, value: string): void {
    this.store[key] = value;
  }
  
  removeItem(key: string): void {
    delete this.store[key];
  }
  
  clear(): void {
    this.store = {};
  }
  
  get length(): number {
    return Object.keys(this.store).length;
  }
  
  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}
```

## End-to-End Testing with Cypress

### E2E Test Structure
**File**: `cypress/e2e/filter-integration.cy.ts`

```typescript
describe('Filter Integration E2E', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.intercept('GET', '/api/feeds', { fixture: 'feeds.json' }).as('getFeeds');
    cy.wait('@getFeeds');
  });
  
  it('should filter feeds end-to-end', () => {
    // Navigate to filters
    cy.get('[data-testid="tactical-filters"]').should('be.visible');
    
    // Apply CRITICAL filter
    cy.get('[data-testid="filter-critical"]').click();
    cy.get('[data-testid="apply-filters"]').click();
    
    // Verify filtering
    cy.get('[data-testid="feed-item"]').should('have.length.lessThan', 10);
    cy.get('[data-testid="feed-item"]').each($item => {
      cy.wrap($item).should('contain', 'CRITICAL');
    });
    
    // Test export with filters
    cy.get('[data-testid="export-json"]').click();
    cy.get('[data-testid="execute-export"]').click();
    
    // Verify download (would need download handling)
  });
  
  it('should maintain filter state across navigation', () => {
    // Apply filters
    cy.get('[data-testid="filter-critical"]').click();
    cy.get('[data-testid="apply-filters"]').click();
    
    // Navigate away and back
    cy.reload();
    
    // Verify filters are still applied
    cy.get('[data-testid="filter-critical"]').should('have.class', 'active');
  });
});
```

### Theme Switching E2E
**File**: `cypress/e2e/theme-switching.cy.ts`

```typescript
describe('Theme Switching E2E', () => {
  it('should change theme across entire application', () => {
    cy.visit('/');
    
    // Check default theme
    cy.get('body').should('have.class', 'theme-dark');
    
    // Change to night theme
    cy.get('[data-testid="theme-selector"]').select('night');
    
    // Verify theme change
    cy.get('body').should('have.class', 'theme-night');
    
    // Check CSS variables
    cy.get(':root').should('have.css', '--color-primary', '#00ff00');
    
    // Verify persistence
    cy.reload();
    cy.get('body').should('have.class', 'theme-night');
  });
});
```

## Performance Testing

### Performance Test Setup
**File**: `src/__tests__/performance/FilterPerformance.test.ts`

```typescript
import { performance } from 'perf_hooks';
import { FilterService } from '../../services/FilterService';
import { generateMockFeeds } from '../utils/mockData';

describe('Filter Performance', () => {
  const PERFORMANCE_THRESHOLD = 500; // 500ms max
  
  it('should filter 1000 feeds within performance threshold', () => {
    const feeds = generateMockFeeds(1000);
    const filterState = {
      activeFilters: new Set(['CRITICAL', 'HIGH']),
      timeRange: null,
      sortBy: 'name' as const
    };
    
    const startTime = performance.now();
    const result = FilterService.applyFilters(feeds, filterState);
    const endTime = performance.now();
    
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD);
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThan(feeds.length);
  });
  
  it('should handle memory efficiently with large datasets', () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Process large dataset
    const feeds = generateMockFeeds(10000);
    FilterService.applyFilters(feeds, { activeFilters: new Set() });
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be reasonable (less than 50MB)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });
});
```

## Accessibility Testing

### A11y Test Setup
**File**: `src/__tests__/accessibility/ComponentAccessibility.test.tsx`

```typescript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TacticalFilters } from '../../components/TacticalFilters';
import { TestProviders } from '../utils/TestProviders';

expect.extend(toHaveNoViolations);

describe('TacticalFilters Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(
      <TestProviders>
        <TacticalFilters />
      </TestProviders>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('should support keyboard navigation', () => {
    render(
      <TestProviders>
        <TacticalFilters />
      </TestProviders>
    );
    
    // Test keyboard navigation
    const firstButton = screen.getByRole('button', { name: /critical/i });
    firstButton.focus();
    expect(firstButton).toHaveFocus();
    
    // Test Tab navigation
    userEvent.tab();
    const nextButton = screen.getByRole('button', { name: /high/i });
    expect(nextButton).toHaveFocus();
  });
  
  it('should have proper ARIA labels', () => {
    render(
      <TestProviders>
        <TacticalFilters />
      </TestProviders>
    );
    
    expect(screen.getByRole('region', { name: /tactical filters/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /priority levels/i })).toBeInTheDocument();
  });
});
```

## Test Configuration

### Jest Configuration
**File**: `jest.config.js`

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__tests__/**/*',
    '!src/index.tsx'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.test.{ts,tsx}'
  ]
};
```

### Test Setup
**File**: `src/__tests__/setup.ts`

```typescript
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { MockLocalStorage } from './mocks/MockLocalStorage';

// Configure testing library
configure({ testIdAttribute: 'data-testid' });

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: new MockLocalStorage()
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  disconnect() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  disconnect() {}
  unobserve() {}
};

// Suppress console errors in tests
const originalError = console.error;
console.error = (...args: any[]) => {
  if (args[0]?.includes?.('Warning: ReactDOM.render is no longer supported')) {
    return;
  }
  originalError.call(console, ...args);
};
```

## Test Execution Scripts

### Package.json Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open",
    "test:performance": "jest --testPathPattern=performance",
    "test:a11y": "jest --testPathPattern=accessibility",
    "test:all": "npm run test:coverage && npm run test:e2e && npm run test:performance && npm run test:a11y"
  }
}
```

## Test Documentation Standards

### Test Case Documentation
Each test file should include:

1. **Purpose**: What functionality is being tested
2. **Setup**: Required mocks and test data
3. **Test Cases**: Detailed description of each test
4. **Edge Cases**: Boundary conditions and error scenarios
5. **Performance**: Expected performance characteristics

### Test Naming Conventions
- Test files: `ComponentName.test.tsx`
- Test suites: `describe('ComponentName', () => {})`
- Test cases: `it('should do something when condition', () => {})`
- Test IDs: `data-testid="component-element"`

## Continuous Integration

### GitHub Actions Workflow
**File**: `.github/workflows/test.yml`

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - run: npm ci
    - run: npm run test:coverage
    - run: npm run test:e2e
    - run: npm run test:performance
    - run: npm run test:a11y
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
```

This testing framework provides comprehensive coverage for all implementation phases and ensures high quality, reliable code throughout the development process.

## Related Documents

- [Implementation Master Plan](./IMPLEMENTATION_MASTER_PLAN.md)
- [Component Functionality Audit](../COMPONENT_FUNCTIONALITY_AUDIT.md)
- [Quality Assurance Guidelines](./shared/qa-guidelines.md)
