import { AlertService, AlertLevel, AlertSchedule, Alert } from '../AlertService';

describe('AlertService', () => {
  let alertService: AlertService;

  beforeEach(() => {
    alertService = AlertService.getInstance();
    // Clear any existing alerts and subscribers
    alertService.clearAlerts();
    alertService.clearSubscribers();
    // Reset singleton for clean tests
    (AlertService as any)._instance = null;
    alertService = AlertService.getInstance();
  });

  afterEach(() => {
    alertService.clearAlerts();
    alertService.clearSubscribers();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = AlertService.getInstance();
      const instance2 = AlertService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Alert Management', () => {
    const mockAlert: Omit<Alert, 'id' | 'createdAt' | 'triggeredAt'> = {
      name: 'Test Alert',
      keywords: ['test', 'keyword'],
      level: AlertLevel.HIGH,
      enabled: true,
      schedule: AlertSchedule.ALWAYS,
      feedSources: [],
      notificationEnabled: true
    };

    it('should add an alert successfully', () => {
      const alert = alertService.addAlert(mockAlert);
      
      expect(alert).toBeDefined();
      expect(alert.id).toBeDefined();
      expect(alert.name).toBe(mockAlert.name);
      expect(alert.keywords).toEqual(mockAlert.keywords);
      expect(alert.level).toBe(mockAlert.level);
      expect(alert.createdAt).toBeInstanceOf(Date);
    });

    it('should update an existing alert', () => {
      const alert = alertService.addAlert(mockAlert);
      const updatedAlert = alertService.updateAlertLegacy(alert.id, {
        name: 'Updated Alert',
        priority: 'critical' as any
      });

      expect(updatedAlert?.name).toBe('Updated Alert');
      expect(updatedAlert?.level).toBe(AlertLevel.CRITICAL);
      expect(updatedAlert?.keywords).toEqual(mockAlert.keywords); // Should preserve unchanged fields
    });

    it('should return null when updating non-existent alert', () => {
      const result = alertService.updateAlertLegacy('non-existent-id', { name: 'Test' });
      expect(result).toBeNull();
    });

    it('should delete an alert', () => {
      const alert = alertService.addAlert(mockAlert);
      const deleted = alertService.deleteAlert(alert.id);
      
      expect(deleted).toBe(true);
      expect(alertService.getAlert(alert.id)).toBeUndefined();
    });

    it('should return false when deleting non-existent alert', () => {
      const result = alertService.deleteAlert('non-existent-id');
      expect(result).toBe(false);
    });

    it('should get all alerts', () => {
      alertService.addAlert(mockAlert);
      alertService.addAlert({ 
        name: 'Second Alert',
        keywords: ['test2'],
        level: AlertLevel.LOW,
        enabled: true,
        schedule: AlertSchedule.ALWAYS,
        feedSources: [],
        notificationEnabled: true 
      });
      
      const alerts = alertService.getAlerts();
      expect(alerts).toHaveLength(2);
    });

    it('should clear all alerts', () => {
      alertService.addAlert(mockAlert);
      alertService.addAlert({ 
        name: 'Second Alert',
        keywords: ['test2'],
        level: AlertLevel.LOW,
        enabled: true,
        schedule: AlertSchedule.ALWAYS,
        feedSources: [],
        notificationEnabled: true 
      });
      
      alertService.clearAlerts();
      expect(alertService.getAlerts()).toHaveLength(0);
    });
  });

  describe('Keyword Matching', () => {
    beforeEach(() => {
      alertService.addAlert({
        name: 'Security Alert',
        keywords: ['security', 'breach'],
        level: AlertLevel.CRITICAL,
        enabled: true,
        schedule: AlertSchedule.ALWAYS,
        feedSources: [],
        notificationEnabled: true
      });
    });

    it('should match keywords in title', () => {
      const feedItem = {
        title: 'Major Security Incident Reported',
        description: 'A security incident has occurred',
        link: 'https://example.com',
        pubDate: '2024-01-01',
        guid: 'test-guid'
      };

      const matches = alertService.checkForMatches([feedItem]);
      expect(matches).toHaveLength(1);
      expect(matches[0].feedItem.title).toBe(feedItem.title);
    });

    it('should match keywords in description', () => {
      const feedItem = {
        title: 'Latest News',
        description: 'There was a data breach at the company',
        link: 'https://example.com',
        pubDate: '2024-01-01',
        guid: 'test-guid'
      };

      const matches = alertService.checkForMatches([feedItem]);
      expect(matches).toHaveLength(1);
    });

    it('should be case insensitive', () => {
      const feedItem = {
        title: 'SECURITY UPDATE',
        description: 'System update',
        link: 'https://example.com',
        pubDate: '2024-01-01',
        guid: 'test-guid'
      };

      const matches = alertService.checkForMatches([feedItem]);
      expect(matches).toHaveLength(1);
    });

    it('should not match disabled alerts', () => {
      alertService.addAlert({
        name: 'Disabled Alert',
        keywords: ['test'],
        level: AlertLevel.LOW,
        enabled: false,
        schedule: AlertSchedule.ALWAYS,
        feedSources: [],
        notificationEnabled: true
      });

      const feedItem = {
        title: 'Test Article',
        description: 'This is a test',
        link: 'https://example.com',
        pubDate: '2024-01-01',
        guid: 'test-guid'
      };

      const matches = alertService.checkForMatches([feedItem]);
      expect(matches).toHaveLength(0);
    });

    it('should handle empty keywords gracefully', () => {
      alertService.addAlert({
        name: 'Empty Keywords Alert',
        keywords: [],
        level: AlertLevel.LOW,
        enabled: true,
        schedule: AlertSchedule.ALWAYS,
        feedSources: [],
        notificationEnabled: true
      });

      const feedItem = {
        title: 'Any Article',
        description: 'Any description',
        link: 'https://example.com',
        pubDate: '2024-01-01',
        guid: 'test-guid'
      };

      const matches = alertService.checkForMatches([feedItem]);
      expect(matches).toHaveLength(0);
    });
  });

  describe('Notification System', () => {
    it('should subscribe and notify listeners', () => {
      const mockCallback = jest.fn();
      alertService.subscribe(mockCallback);

      alertService.addAlert({
        name: 'Test Alert',
        keywords: ['test'],
        level: AlertLevel.HIGH,
        enabled: true,
        schedule: AlertSchedule.ALWAYS,
        feedSources: [],
        notificationEnabled: true
      });

      const feedItem = {
        title: 'Test Article',
        description: 'This is a test',
        link: 'https://example.com',
        pubDate: '2024-01-01',
        guid: 'test-guid'
      };

      alertService.checkForMatches([feedItem]);
      expect(mockCallback).toHaveBeenCalled();
    });

    it('should unsubscribe listeners', () => {
      const mockCallback = jest.fn();
      const unsubscribe = alertService.subscribe(mockCallback);
      
      unsubscribe();
      
      alertService.addAlert({
        name: 'Test Alert',
        keywords: ['test'],
        level: AlertLevel.HIGH,
        enabled: true,
        schedule: AlertSchedule.ALWAYS,
        feedSources: [],
        notificationEnabled: true
      });

      const feedItem = {
        title: 'Test Article',
        description: 'This is a test',
        link: 'https://example.com',
        pubDate: '2024-01-01',
        guid: 'test-guid'
      };

      alertService.checkForMatches([feedItem]);
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid alert data gracefully', () => {
      const invalidAlert = {
        name: '',
        keywords: null as any,
        level: 'invalid' as any,
        enabled: true,
        schedule: AlertSchedule.ALWAYS,
        feedSources: [],
        notificationEnabled: true
      };

      expect(() => alertService.addAlert(invalidAlert)).not.toThrow();
    });

    it('should handle malformed feed items', () => {
      alertService.addAlert({
        name: 'Test Alert',
        keywords: ['test'],
        level: AlertLevel.HIGH,
        enabled: true,
        schedule: AlertSchedule.ALWAYS,
        feedSources: [],
        notificationEnabled: true
      });

      const malformedFeedItem = {
        title: null,
        description: undefined,
        link: '',
        pubDate: 'invalid-date',
        guid: null
      } as any;

      expect(() => alertService.checkForMatches([malformedFeedItem])).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of alerts efficiently', () => {
      // Add alerts with very distinct keywords
      for (let i = 0; i < 100; i++) {
        alertService.addAlert({
          name: `Alert ${i}`,
          keywords: [`alert_${String(i).padStart(3, '0')}_end`],
          level: AlertLevel.LOW,
          enabled: true,
          schedule: AlertSchedule.ALWAYS,
          feedSources: [],
          notificationEnabled: true
        });
      }

      const feedItem = {
        title: 'This contains alert_050_end keyword',
        description: 'Test description',
        link: 'https://example.com',
        pubDate: '2024-01-01',
        guid: 'test-guid'
      };

      const start = performance.now();
      const matches = alertService.checkForMatches([feedItem]);
      const end = performance.now();

      expect(matches).toHaveLength(1);
      expect(matches[0].alert.name).toBe('Alert 50');
      expect(end - start).toBeLessThan(100); // Should complete in under 100ms
    });
  });
});
