# Testing Strategy & Quality Assurance

## Overview
This document outlines the comprehensive testing strategy for the Tactical Intelligence Dashboard transformation, ensuring that the enhanced tactical features work correctly while preserving the excellent UI/UX and system reliability.

## Testing Philosophy

### 1. Multi-Level Testing Approach

```
┌─────────────────────────────────────────────────────────────┐
│                    End-to-End Testing                       │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              User Workflow Testing                      │ │
│  │  • Complete intelligence workflows                     │ │
│  │  • Cross-component integration                         │ │
│  │  • Security and access control validation             │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                  Integration Testing                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Component Integration                      │ │
│  │  • Context provider interactions                       │ │
│  │  • Service layer integration                           │ │
│  │  • Data flow validation                                │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                     Unit Testing                           │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Component & Service Units                  │ │
│  │  • Individual component logic                          │ │
│  │  • Service function testing                            │ │
│  │  • Utility function validation                         │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                   Security Testing                         │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Security Validation                        │ │
│  │  • Access control verification                         │ │
│  │  • Encryption/decryption testing                       │ │
│  │  • Classification handling                             │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                  Performance Testing                       │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Performance Validation                     │ │
│  │  • Real-time processing speed                          │ │
│  │  • Memory usage optimization                           │ │
│  │  • Network efficiency                                  │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2. Quality Gates

Each phase must pass quality gates before proceeding:

- **Code Quality**: ESLint, TypeScript, code review
- **Test Coverage**: >90% for critical components, >80% overall
- **Security Validation**: All security tests pass
- **Performance Metrics**: Meets tactical requirements
- **UI/UX Preservation**: Maintains current user experience standards

## Unit Testing Framework

### 1. Testing Setup

```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**/*',
    '!src/**/*.stories.tsx'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/components/tactical/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/services/security/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    }
  }
};
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Mock Web Crypto API for Node.js environment
Object.assign(global, { TextDecoder, TextEncoder });

global.crypto = {
  getRandomValues: jest.fn(() => new Uint8Array(32)),
  subtle: {
    encrypt: jest.fn(),
    decrypt: jest.fn(),
    importKey: jest.fn(),
    generateKey: jest.fn()
  }
} as any;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock as any;
```

### 2. Component Testing Examples

```typescript
// TacticalIntelCard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TacticalIntelCard } from '../TacticalIntelCard';
import { createMockIntelligenceItem, createMockUserRole } from '../../test/factories';

describe('TacticalIntelCard', () => {
  const mockOnAnalyze = jest.fn();
  const mockOnAlert = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('displays classification level correctly', () => {
    const item = createMockIntelligenceItem({
      classification: { level: 'SECRET', caveats: ['NOFORN'] }
    });
    
    render(
      <TacticalIntelCard
        item={item}
        displayMode="operational"
        onAnalyze={mockOnAnalyze}
        onAlert={mockOnAlert}
      />
    );
    
    expect(screen.getByText('SECRET')).toBeInTheDocument();
    expect(screen.getByText('NOFORN')).toBeInTheDocument();
  });
  
  it('shows critical priority indicator and alert button', () => {
    const item = createMockIntelligenceItem({
      priority: 'CRITICAL',
      classification: { level: 'SECRET' }
    });
    
    render(
      <TacticalIntelCard
        item={item}
        displayMode="operational"
        onAnalyze={mockOnAnalyze}
        onAlert={mockOnAlert}
      />
    );
    
    expect(screen.getByTestId('priority-critical')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /alert/i })).toBeInTheDocument();
  });
  
  it('calls onAnalyze when analyze button is clicked', async () => {
    const item = createMockIntelligenceItem();
    
    render(
      <TacticalIntelCard
        item={item}
        displayMode="operational"
        onAnalyze={mockOnAnalyze}
        onAlert={mockOnAlert}
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /analyze/i }));
    
    await waitFor(() => {
      expect(mockOnAnalyze).toHaveBeenCalledWith(item);
    });
  });
  
  it('applies correct CSS classes for classification and priority', () => {
    const item = createMockIntelligenceItem({
      classification: { level: 'TOP_SECRET' },
      priority: 'CRITICAL'
    });
    
    const { container } = render(
      <TacticalIntelCard
        item={item}
        displayMode="operational"
        onAnalyze={mockOnAnalyze}
        onAlert={mockOnAlert}
      />
    );
    
    const card = container.querySelector('.intel-card');
    expect(card).toHaveClass('classification-top-secret');
    expect(card).toHaveClass('priority-critical');
  });
});
```

### 3. Service Testing Examples

```typescript
// AccessControlService.test.ts
import { AccessControlService } from '../AccessControlService';
import { createMockUserRole, createMockAccessContext } from '../../test/factories';

describe('AccessControlService', () => {
  let accessControlService: AccessControlService;
  
  beforeEach(() => {
    accessControlService = new AccessControlService();
  });
  
  describe('validateAccess', () => {
    it('grants access for sufficient clearance', async () => {
      const userRole = createMockUserRole({
        clearanceLevel: 'SECRET',
        permissions: [
          {
            id: 'read-intelligence',
            resource: 'intelligence',
            actions: ['read'],
            conditions: []
          }
        ]
      });
      
      jest.spyOn(accessControlService, 'getUserRole').mockResolvedValue(userRole);
      
      const result = await accessControlService.validateAccess(
        'user123',
        'intelligence',
        'read',
        { classification: 'CONFIDENTIAL' }
      );
      
      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('ACCESS_GRANTED');
    });
    
    it('denies access for insufficient clearance', async () => {
      const userRole = createMockUserRole({
        clearanceLevel: 'CONFIDENTIAL'
      });
      
      jest.spyOn(accessControlService, 'getUserRole').mockResolvedValue(userRole);
      
      const result = await accessControlService.validateAccess(
        'user123',
        'intelligence',
        'read',
        { classification: 'SECRET' }
      );
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('INSUFFICIENT_CLEARANCE');
    });
    
    it('validates need-to-know requirements', async () => {
      const userRole = createMockUserRole({
        clearanceLevel: 'SECRET',
        needToKnow: ['tactical-operations'],
        permissions: [
          {
            id: 'read-intelligence',
            resource: 'intelligence',
            actions: ['read'],
            conditions: []
          }
        ]
      });
      
      jest.spyOn(accessControlService, 'getUserRole').mockResolvedValue(userRole);
      
      const result = await accessControlService.validateAccess(
        'user123',
        'intelligence',
        'read',
        {
          classification: 'SECRET',
          needToKnow: ['tactical-operations', 'special-access']
        }
      );
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('NO_NEED_TO_KNOW');
    });
  });
});
```

## Integration Testing

### 1. Context Integration Tests

```typescript
// IntelligenceContext.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IntelligenceProvider, useIntelligence } from '../IntelligenceContext';
import { AlertProvider } from '../AlertContext';
import { createMockIntelligenceItem } from '../../test/factories';

const TestComponent = () => {
  const { state, actions } = useIntelligence();
  
  return (
    <div>
      <div data-testid="item-count">{state.items.length}</div>
      <div data-testid="alert-count">{state.alerts?.length || 0}</div>
      <button
        onClick={() => actions.addIntelligence(createMockIntelligenceItem({
          priority: 'CRITICAL'
        }))}
      >
        Add Critical Intelligence
      </button>
    </div>
  );
};

describe('Intelligence Context Integration', () => {
  it('creates alert when critical intelligence is added', async () => {
    render(
      <AlertProvider>
        <IntelligenceProvider>
          <TestComponent />
        </IntelligenceProvider>
      </AlertProvider>
    );
    
    expect(screen.getByTestId('item-count')).toHaveTextContent('0');
    expect(screen.getByTestId('alert-count')).toHaveTextContent('0');
    
    fireEvent.click(screen.getByText('Add Critical Intelligence'));
    
    await waitFor(() => {
      expect(screen.getByTestId('item-count')).toHaveTextContent('1');
      expect(screen.getByTestId('alert-count')).toHaveTextContent('1');
    });
  });
});
```

### 2. Data Flow Integration Tests

```typescript
// IntelligenceFlow.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { App } from '../App';
import { mockFeedService } from '../../test/mocks';

describe('Intelligence Data Flow', () => {
  beforeEach(() => {
    mockFeedService.mockClear();
  });
  
  it('processes incoming intelligence through complete pipeline', async () => {
    // Mock incoming intelligence data
    const mockIntelData = {
      source: 'test-source',
      content: 'Test intelligence content',
      classification: 'SECRET',
      priority: 'HIGH'
    };
    
    render(<App />);
    
    // Simulate incoming intelligence
    mockFeedService.simulateIncomingIntelligence(mockIntelData);
    
    // Verify processing pipeline
    await waitFor(() => {
      // Check that intelligence appears in dashboard
      expect(screen.getByText('Test intelligence content')).toBeInTheDocument();
      
      // Check classification indicator
      expect(screen.getByText('SECRET')).toBeInTheDocument();
      
      // Check priority indicator
      expect(screen.getByTestId('priority-high')).toBeInTheDocument();
    });
    
    // Verify alert was created for high priority
    await waitFor(() => {
      expect(screen.getByText('High Priority Intelligence Alert')).toBeInTheDocument();
    });
  });
});
```

## Security Testing

### 1. Access Control Tests

```typescript
// SecurityValidation.test.tsx
import { render, screen } from '@testing-library/react';
import { SecureIntelCard } from '../SecureIntelCard';
import { AccessControlService } from '../../services/AccessControlService';
import { createMockSecureIntelligenceItem, createMockUserRole } from '../../test/factories';

jest.mock('../../services/AccessControlService');

describe('Security Validation', () => {
  let mockAccessControlService: jest.Mocked<AccessControlService>;
  
  beforeEach(() => {
    mockAccessControlService = AccessControlService as jest.Mocked<typeof AccessControlService>;
  });
  
  it('denies access to classified intelligence for insufficient clearance', async () => {
    const item = createMockSecureIntelligenceItem({
      classification: { level: 'TOP_SECRET' }
    });
    
    const userRole = createMockUserRole({
      clearanceLevel: 'SECRET'
    });
    
    mockAccessControlService.prototype.validateAccess.mockResolvedValue({
      allowed: false,
      reason: 'INSUFFICIENT_CLEARANCE'
    });
    
    render(
      <SecureIntelCard
        item={item}
        userClearance="SECRET"
        userRole={userRole}
      />
    );
    
    expect(screen.getByText('Access Denied - Insufficient Clearance')).toBeInTheDocument();
    expect(screen.queryByText(item.content)).not.toBeInTheDocument();
  });
  
  it('grants access to classified intelligence for sufficient clearance', async () => {
    const item = createMockSecureIntelligenceItem({
      classification: { level: 'SECRET' }
    });
    
    const userRole = createMockUserRole({
      clearanceLevel: 'TOP_SECRET'
    });
    
    mockAccessControlService.prototype.validateAccess.mockResolvedValue({
      allowed: true,
      reason: 'ACCESS_GRANTED'
    });
    
    render(
      <SecureIntelCard
        item={item}
        userClearance="TOP_SECRET"
        userRole={userRole}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText(item.content)).toBeInTheDocument();
    });
  });
});
```

### 2. Encryption Tests

```typescript
// EncryptionService.test.ts
import { EncryptionService } from '../EncryptionService';
import { createMockIntelligenceItem } from '../../test/factories';

describe('EncryptionService', () => {
  let encryptionService: EncryptionService;
  
  beforeEach(() => {
    encryptionService = new EncryptionService();
  });
  
  it('encrypts and decrypts intelligence correctly', async () => {
    const originalItem = createMockIntelligenceItem({
      content: 'Sensitive intelligence content',
      classification: 'SECRET'
    });
    
    // Encrypt the intelligence
    const encrypted = await encryptionService.encryptIntelligence(
      originalItem,
      'SECRET'
    );
    
    expect(encrypted.encryptedContent).toBeDefined();
    expect(encrypted.encryptedContent).not.toBe(originalItem.content);
    
    // Decrypt the intelligence
    const decrypted = await encryptionService.decryptIntelligence(
      encrypted,
      'SECRET'
    );
    
    expect(decrypted).not.toBeNull();
    expect(decrypted!.content).toBe(originalItem.content);
  });
  
  it('prevents decryption with insufficient clearance', async () => {
    const originalItem = createMockIntelligenceItem({
      classification: 'TOP_SECRET'
    });
    
    const encrypted = await encryptionService.encryptIntelligence(
      originalItem,
      'TOP_SECRET'
    );
    
    const decrypted = await encryptionService.decryptIntelligence(
      encrypted,
      'SECRET' // Insufficient clearance
    );
    
    expect(decrypted).toBeNull();
  });
});
```

## Performance Testing

### 1. Real-time Processing Performance

```typescript
// PerformanceTests.test.ts
import { performance } from 'perf_hooks';
import { RealTimeProcessor } from '../RealTimeProcessor';
import { createMockIntelligenceItems } from '../../test/factories';

describe('Performance Tests', () => {
  let processor: RealTimeProcessor;
  
  beforeEach(() => {
    processor = new RealTimeProcessor();
  });
  
  it('processes intelligence within performance thresholds', async () => {
    const items = createMockIntelligenceItems(100);
    
    const startTime = performance.now();
    
    await Promise.all(
      items.map(item => processor.processIncomingIntel(item))
    );
    
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    // Should process 100 items in less than 2 seconds
    expect(processingTime).toBeLessThan(2000);
    
    // Average processing time per item should be less than 20ms
    const avgProcessingTime = processingTime / items.length;
    expect(avgProcessingTime).toBeLessThan(20);
  });
  
  it('maintains memory usage within limits during batch processing', async () => {
    const largeDataSet = createMockIntelligenceItems(1000);
    
    const initialMemory = process.memoryUsage().heapUsed;
    
    await processor.processBatch(largeDataSet);
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be reasonable (less than 50MB for 1000 items)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });
});
```

### 2. UI Performance Tests

```typescript
// UIPerformance.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react';
import { VirtualizedIntelligenceList } from '../VirtualizedIntelligenceList';
import { createMockIntelligenceItems } from '../../test/factories';

describe('UI Performance', () => {
  it('renders large lists efficiently with virtualization', async () => {
    const largeItemList = createMockIntelligenceItems(10000);
    const mockOnItemClick = jest.fn();
    
    const startTime = performance.now();
    
    const { container } = render(
      <VirtualizedIntelligenceList
        items={largeItemList}
        onItemClick={mockOnItemClick}
      />
    );
    
    const renderTime = performance.now() - startTime;
    
    // Initial render should be fast (less than 100ms)
    expect(renderTime).toBeLessThan(100);
    
    // Should only render visible items (not all 10,000)
    const renderedItems = container.querySelectorAll('.intel-card');
    expect(renderedItems.length).toBeLessThan(50); // Visible items only
  });
  
  it('maintains smooth scrolling performance', async () => {
    const items = createMockIntelligenceItems(1000);
    const mockOnItemClick = jest.fn();
    
    const { container } = render(
      <VirtualizedIntelligenceList
        items={items}
        onItemClick={mockOnItemClick}
      />
    );
    
    const scrollContainer = container.querySelector('.virtualized-list');
    
    // Simulate rapid scrolling
    const scrollEvents = Array.from({ length: 20 }, (_, i) => i * 100);
    
    const startTime = performance.now();
    
    for (const scrollTop of scrollEvents) {
      fireEvent.scroll(scrollContainer!, { target: { scrollTop } });
      await waitFor(() => {}, { timeout: 10 }); // Small delay
    }
    
    const scrollTime = performance.now() - startTime;
    
    // Scrolling should be smooth (less than 5ms per scroll event)
    const avgScrollTime = scrollTime / scrollEvents.length;
    expect(avgScrollTime).toBeLessThan(5);
  });
});
```

## End-to-End Testing

### 1. Complete Workflow Tests

```typescript
// e2e/IntelligenceWorkflow.e2e.test.ts
import { test, expect } from '@playwright/test';

test.describe('Intelligence Workflow', () => {
  test('complete intelligence processing workflow', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Login with appropriate clearance
    await page.fill('[data-testid="username"]', 'analyst@tactical.mil');
    await page.fill('[data-testid="password"]', 'secure-password');
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard to load
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    
    // Navigate to Intelligence Sources
    await page.click('[data-testid="intel-sources-tab"]');
    
    // Add a new intelligence source
    await page.click('[data-testid="add-source-button"]');
    await page.fill('[data-testid="source-name"]', 'Test Intelligence Feed');
    await page.fill('[data-testid="source-url"]', 'https://test.intel.feed/api');
    await page.selectOption('[data-testid="source-category"]', 'OSINT');
    await page.click('[data-testid="save-source-button"]');
    
    // Verify source was added
    await expect(page.locator('text=Test Intelligence Feed')).toBeVisible();
    
    // Simulate incoming intelligence
    await page.evaluate(() => {
      window.simulateIntelligence({
        source: 'Test Intelligence Feed',
        content: 'Critical threat detected in operational area',
        classification: 'SECRET',
        priority: 'CRITICAL'
      });
    });
    
    // Verify alert was generated
    await expect(page.locator('[data-testid="critical-alert"]')).toBeVisible();
    
    // Acknowledge alert
    await page.click('[data-testid="acknowledge-alert-button"]');
    
    // Verify alert was acknowledged
    await expect(page.locator('[data-testid="acknowledged-alerts"]')).toContainText('Critical threat detected');
    
    // Navigate to Threat Assessment
    await page.click('[data-testid="threat-assessment-tab"]');
    
    // Verify threat appears in assessment
    await expect(page.locator('[data-testid="threat-matrix"]')).toBeVisible();
    await expect(page.locator('text=Critical threat detected')).toBeVisible();
  });
  
  test('security access control enforcement', async ({ page }) => {
    // Login with limited clearance
    await page.goto('/dashboard');
    await page.fill('[data-testid="username"]', 'watch-officer@tactical.mil');
    await page.fill('[data-testid="password"]', 'secure-password');
    await page.click('[data-testid="login-button"]');
    
    // Attempt to access classified intelligence
    await page.goto('/intelligence/top-secret-item-123');
    
    // Verify access denied
    await expect(page.locator('text=Access Denied')).toBeVisible();
    await expect(page.locator('text=Insufficient Clearance')).toBeVisible();
    
    // Verify no classified content is displayed
    await expect(page.locator('[data-testid="classified-content"]')).not.toBeVisible();
  });
});
```

## Test Data Factories

### 1. Mock Data Creation

```typescript
// test/factories.ts
export const createMockIntelligenceItem = (
  overrides: Partial<IntelligenceItem> = {}
): IntelligenceItem => ({
  id: `intel-${Date.now()}-${Math.random()}`,
  sourceId: 'test-source',
  title: 'Test Intelligence Item',
  content: 'This is test intelligence content',
  category: 'OSINT',
  classification: { level: 'UNCLASSIFIED', originator: 'TEST' },
  reliability: 8,
  confidence: 7,
  timestamp: new Date(),
  priority: 'MEDIUM',
  verification: 'PENDING',
  tags: ['test'],
  actionRequired: false,
  processingStatus: 'RAW',
  ...overrides
});

export const createMockUserRole = (
  overrides: Partial<UserRole> = {}
): UserRole => ({
  id: 'test-role',
  name: 'Test Role',
  clearanceLevel: 'SECRET',
  permissions: [],
  restrictions: [],
  needToKnow: ['test-area'],
  ...overrides
});

export const createMockSecureIntelligenceItem = (
  overrides: Partial<SecureIntelligenceItem> = {}
): SecureIntelligenceItem => ({
  ...createMockIntelligenceItem(),
  classification: {
    level: 'SECRET',
    originator: 'TEST-ORG',
    caveats: []
  },
  accessLog: [],
  ...overrides
});
```

## Continuous Integration Setup

### 1. GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
        
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run linting
      run: npm run lint
      
    - name: Run type checking
      run: npm run type-check
      
    - name: Run unit tests
      run: npm run test:unit -- --coverage
      
    - name: Run integration tests
      run: npm run test:integration
      
    - name: Run security tests
      run: npm run test:security
      
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/lcov.info
        
  e2e:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Install Playwright browsers
      run: npx playwright install --with-deps
      
    - name: Run E2E tests
      run: npm run test:e2e
      
    - name: Upload E2E artifacts
      uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: playwright-report
        path: playwright-report/
```

This comprehensive testing strategy ensures the tactical intelligence dashboard transformation maintains high quality, security, and performance standards while preserving the excellent user experience.
