# 🧪 Testing Strategy

## Overview

The Tactical Intel Dashboard employs a comprehensive testing strategy designed for **mission-critical reliability**. Our approach follows military-grade standards: **Test everything. Trust nothing. Verify constantly.**

## 🎯 Testing Philosophy

### **Zero-Defect Deployment**
- **Every feature must be tested** before reaching production
- **Real-world scenarios** drive our testing approach
- **Performance under pressure** - simulate high-load conditions
- **Graceful degradation** - test failure scenarios and recovery

### **Testing Pyramid**
```
                    E2E Tests (10%)
                   ┌─────────────┐
                  │  User Flows  │
                 └─────────────────┘
                Integration Tests (30%)
               ┌───────────────────────┐
              │  Component Integration │
             └─────────────────────────┘
            Unit Tests (60%)
           ┌─────────────────────────────┐
          │  Functions, Hooks, Services  │
         └───────────────────────────────┘
```

## 🔧 Testing Stack

### **Core Testing Tools**
- **Jest**: Unit and integration testing framework
- **React Testing Library**: Component testing utilities
- **Vitest**: Fast unit test runner (Vite integration)
- **Playwright**: End-to-end testing
- **MSW (Mock Service Worker)**: API mocking

### **Additional Testing Tools**
- **Testing Library**: User-centric testing utilities
- **Jest DOM**: Custom DOM matchers
- **User Event**: User interaction simulation
- **Axe-core**: Accessibility testing

## 📋 Unit Testing Standards

### **Service Layer Testing**
```typescript
// ✅ GOOD: Comprehensive service testing
describe('AlertService', () => {
  let alertService: AlertService;

  beforeEach(() => {
    alertService = AlertService.getInstance();
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    alertService.stopMonitoring();
  });

  describe('keyword matching', () => {
    it('should match exact keywords', () => {
      const feedItem = createMockFeedItem({
        title: 'Breaking news about cybersecurity'
      });
      
      const alert = createMockAlert({
        keywords: ['cybersecurity']
      });

      const result = alertService.checkFeedItems([feedItem]);
      expect(result).toHaveLength(1);
      expect(result[0].alert.id).toBe(alert.id);
    });

    it('should handle boolean logic (AND)', () => {
      const feedItem = createMockFeedItem({
        title: 'Cyber attack on financial system'
      });
      
      const alert = createMockAlert({
        keywords: ['cyber AND financial']
      });

      const result = alertService.checkFeedItems([feedItem]);
      expect(result).toHaveLength(1);
    });

    it('should handle boolean logic (NOT)', () => {
      const feedItem = createMockFeedItem({
        title: 'Sports news update'
      });
      
      const alert = createMockAlert({
        keywords: ['news NOT sports']
      });

      const result = alertService.checkFeedItems([feedItem]);
      expect(result).toHaveLength(0);
    });
  });

  describe('notification system', () => {
    it('should request notification permission', async () => {
      const permissionSpy = jest.spyOn(Notification, 'requestPermission')
        .mockResolvedValue('granted');

      await alertService.requestNotificationPermission();
      
      expect(permissionSpy).toHaveBeenCalled();
    });

    it('should create browser notifications for alerts', () => {
      const notificationSpy = jest.spyOn(window, 'Notification')
        .mockImplementation(() => ({} as Notification));

      const trigger = createMockAlertTrigger();
      alertService.showNotification(trigger);

      expect(notificationSpy).toHaveBeenCalledWith(
        expect.stringContaining(trigger.alert.name),
        expect.any(Object)
      );
    });
  });
});
```

### **React Hook Testing**
```typescript
// ✅ GOOD: Hook testing with proper setup
describe('useAlerts', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  );

  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with empty alerts', () => {
    const { result } = renderHook(() => useAlerts(), { wrapper });
    
    expect(result.current.alerts).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should add new alert', async () => {
    const { result } = renderHook(() => useAlerts(), { wrapper });
    
    const newAlert = {
      name: 'Test Alert',
      keywords: ['test'],
      priority: 'medium' as const,
      active: true,
      notifications: {
        browser: true,
        sound: false
      }
    };

    await act(async () => {
      result.current.addAlert(newAlert);
    });

    expect(result.current.alerts).toHaveLength(1);
    expect(result.current.alerts[0].name).toBe('Test Alert');
  });

  it('should handle error states', async () => {
    const { result } = renderHook(() => useAlerts(), { wrapper });
    
    // Mock localStorage failure
    jest.spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

    await act(async () => {
      result.current.addAlert(createMockAlert());
    });

    expect(result.current.error).toBeTruthy();
  });
});
```

## 🧩 Component Testing

### **Component Testing Standards**
```typescript
// ✅ GOOD: Component testing with user interactions
describe('AlertForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render form fields', () => {
    render(
      <AlertForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );

    expect(screen.getByLabelText(/alert name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/keywords/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    
    render(
      <AlertForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );

    await user.click(screen.getByRole('button', { name: /create alert/i }));

    expect(screen.getByText(/alert name is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should submit valid form data', async () => {
    const user = userEvent.setup();
    
    render(
      <AlertForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );

    await user.type(
      screen.getByLabelText(/alert name/i), 
      'Test Alert'
    );
    await user.type(
      screen.getByLabelText(/keywords/i), 
      'breaking news'
    );
    await user.selectOptions(
      screen.getByLabelText(/priority/i), 
      'high'
    );

    await user.click(screen.getByRole('button', { name: /create alert/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'Test Alert',
      keywords: ['breaking news'],
      priority: 'high',
      active: true,
      notifications: expect.any(Object)
    });
  });
});
```

### **Integration Testing**
```typescript
// ✅ GOOD: Integration testing with real data flow
describe('FeedVisualizer Integration', () => {
  beforeEach(() => {
    // Setup MSW to mock feed API calls
    server.use(
      rest.get('/api/proxy-feed', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.set('Content-Type', 'application/xml'),
          ctx.text(mockRSSResponse)
        );
      })
    );
  });

  it('should load feeds and trigger alerts', async () => {
    const mockAlert = createMockAlert({
      keywords: ['breaking'],
      active: true
    });

    // Setup alerts in localStorage
    localStorage.setItem('tactical_intel_alerts', JSON.stringify([mockAlert]));

    render(<FeedVisualizer selectedFeedList="news" />);

    // Wait for feeds to load
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Verify feeds are displayed
    expect(screen.getByText(/breaking news/i)).toBeInTheDocument();

    // Verify alert was triggered
    await waitFor(() => {
      expect(screen.getByText(/1 alert triggered/i)).toBeInTheDocument();
    });
  });
});
```

## 🌐 End-to-End Testing

### **User Journey Testing**
```typescript
// ✅ GOOD: Complete user workflow testing
describe('Alert Management Workflow', () => {
  let page: Page;

  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
  });

  afterEach(async () => {
    await page.close();
  });

  test('user can create and manage alerts', async () => {
    // Navigate to settings
    await page.click('[data-testid="settings-button"]');
    await page.click('[data-testid="alerts-tab"]');

    // Create new alert
    await page.click('[data-testid="create-alert-button"]');
    await page.fill('[data-testid="alert-name"]', 'E2E Test Alert');
    await page.fill('[data-testid="alert-keywords"]', 'test keyword');
    await page.selectOption('[data-testid="alert-priority"]', 'high');
    await page.click('[data-testid="submit-alert"]');

    // Verify alert was created
    await expect(page.locator('[data-testid="alert-list"]'))
      .toContainText('E2E Test Alert');

    // Test alert editing
    await page.click('[data-testid="edit-alert-button"]');
    await page.fill('[data-testid="alert-name"]', 'Updated Alert Name');
    await page.click('[data-testid="submit-alert"]');

    // Verify alert was updated
    await expect(page.locator('[data-testid="alert-list"]'))
      .toContainText('Updated Alert Name');

    // Test alert deletion
    await page.click('[data-testid="delete-alert-button"]');
    await page.click('[data-testid="confirm-delete"]');

    // Verify alert was deleted
    await expect(page.locator('[data-testid="alert-list"]'))
      .not.toContainText('Updated Alert Name');
  });

  test('alerts trigger on feed updates', async () => {
    // Setup alert for specific keyword
    await setupTestAlert(page, 'breaking');

    // Navigate to main dashboard
    await page.click('[data-testid="home-button"]');

    // Trigger feed refresh
    await page.click('[data-testid="refresh-button"]');

    // Wait for feeds to load and alerts to trigger
    await page.waitForSelector('[data-testid="alert-notification"]', {
      timeout: 10000
    });

    // Verify notification appears
    await expect(page.locator('[data-testid="alert-notification"]'))
      .toBeVisible();
  });
});
```

## 🚀 Performance Testing

### **Load Testing**
```typescript
// ✅ GOOD: Performance testing for critical paths
describe('Performance Tests', () => {
  describe('AlertService Performance', () => {
    it('should handle large numbers of feed items efficiently', () => {
      const alertService = AlertService.getInstance();
      const feedItems = Array.from({ length: 1000 }, (_, i) => 
        createMockFeedItem({ title: `Article ${i}` })
      );
      const alerts = [createMockAlert({ keywords: ['article'] })];

      const startTime = performance.now();
      const results = alertService.checkFeedItems(feedItems);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // < 1 second
      expect(results).toHaveLength(1000); // All should match
    });

    it('should efficiently process complex boolean queries', () => {
      const alertService = AlertService.getInstance();
      const feedItems = Array.from({ length: 100 }, (_, i) => 
        createMockFeedItem({ 
          title: `News ${i}`,
          description: i % 2 === 0 ? 'urgent update' : 'regular news'
        })
      );
      
      const alert = createMockAlert({ 
        keywords: ['news AND urgent NOT regular'] 
      });

      const startTime = performance.now();
      const results = alertService.checkFeedItems(feedItems);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // < 100ms
    });
  });
});
```

## 🔍 Test Coverage Standards

### **Coverage Requirements**
- **Statements**: 90%+
- **Branches**: 85%+
- **Functions**: 95%+
- **Lines**: 90%+

### **Critical Components** (100% Coverage Required)
- **AlertService**: Mission-critical alert functionality
- **FeedService**: Core data processing
- **useAlerts Hook**: Primary state management
- **Security utilities**: Input validation and sanitization

### **Coverage Reporting**
```bash
# Generate coverage report
npm run test:coverage

# View detailed coverage
open coverage/lcov-report/index.html
```

## 🛠️ Testing Utilities

### **Mock Factories**
```typescript
// ✅ Test utilities for consistent mocking
export const createMockFeedItem = (overrides: Partial<FeedItem> = {}): FeedItem => ({
  id: `feed-${Math.random().toString(36).substr(2, 9)}`,
  title: 'Mock Article Title',
  description: 'Mock article description',
  link: 'https://example.com/article',
  pubDate: new Date().toISOString(),
  author: 'Mock Author',
  categories: ['test'],
  content: 'Mock content',
  source: 'mock-source',
  ...overrides
});

export const createMockAlert = (overrides: Partial<AlertConfig> = {}): AlertConfig => ({
  id: `alert-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Mock Alert',
  keywords: ['test'],
  priority: 'medium',
  active: true,
  notifications: {
    browser: true,
    sound: false
  },
  ...overrides
});
```

### **Setup Helpers**
```typescript
// ✅ Common test setup
export const setupTestEnvironment = () => {
  // Mock browser APIs
  Object.defineProperty(window, 'Notification', {
    writable: true,
    value: jest.fn().mockImplementation(() => ({}))
  });

  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });

  return { localStorageMock };
};
```

## 🎯 Test Execution Strategy

### **Development Testing**
```bash
# Watch mode for active development
npm run test:watch

# Run specific test suites
npm run test AlertService
npm run test components/alerts

# Debug mode
npm run test:debug
```

### **CI/CD Pipeline Testing**
```bash
# Complete test suite
npm run test:ci

# Performance testing
npm run test:performance

# E2E testing
npm run test:e2e

# Security testing
npm run test:security
```

### **Pre-deployment Testing**
1. **Unit Tests**: All service and utility functions
2. **Component Tests**: All React components
3. **Integration Tests**: End-to-end user workflows
4. **Performance Tests**: Load and stress testing
5. **Security Tests**: Input validation and XSS prevention
6. **Accessibility Tests**: Screen reader and keyboard navigation

## 🔒 Security Testing

### **Security Test Categories**
- **Input Validation**: XSS, injection prevention
- **Authentication**: Session management
- **Data Protection**: Local storage security
- **Network Security**: HTTPS, CORS validation

### **Security Testing Tools**
- **OWASP ZAP**: Automated security scanning
- **Axe-core**: Accessibility and security auditing
- **Snyk**: Dependency vulnerability scanning

---

## 📊 Testing Metrics

### **Quality Gates**
- **Build**: All tests must pass
- **Coverage**: Must meet minimum thresholds
- **Performance**: Must meet response time requirements
- **Security**: Zero high-severity vulnerabilities

### **Continuous Monitoring**
- **Daily**: Automated test runs
- **Weekly**: Performance regression testing
- **Monthly**: Security audit and dependency updates

Remember: **In testing we trust. In verification we advance. Mission-critical means zero tolerance for failure.**

---

*Our testing strategy evolves with our tactical requirements. Suggest improvements through our enhancement process.*

**Last Updated**: July 6, 2025  
**Next Review**: Quarterly testing strategy assessment
