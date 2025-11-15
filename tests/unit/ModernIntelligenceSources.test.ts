/**
 * TDD Unit Tests for ModernIntelligenceSources
 * Critical Test Scenario 1: Source Loading Verification
 */

import { PRIMARY_INTELLIGENCE_SOURCES } from '../../src/constants/ModernIntelligenceSources';

describe('ModernIntelligenceSources', () => {
  describe('PRIMARY_INTELLIGENCE_SOURCES', () => {
    test('TDD_TEST_001: Should not be empty array', () => {
      expect(PRIMARY_INTELLIGENCE_SOURCES).toBeDefined();
      expect(Array.isArray(PRIMARY_INTELLIGENCE_SOURCES)).toBe(true);
      expect(PRIMARY_INTELLIGENCE_SOURCES.length).toBeGreaterThan(0);
    });

    test('TDD_TEST_002: Each source should have required properties', () => {
  PRIMARY_INTELLIGENCE_SOURCES.forEach(source => {
        expect(source).toHaveProperty('id');
        expect(source).toHaveProperty('name');
        expect(source).toHaveProperty('description');
        expect(source).toHaveProperty('endpoint');
        expect(source).toHaveProperty('normalizer');
        expect(source).toHaveProperty('refreshInterval');
        expect(source).toHaveProperty('enabled');
        expect(source).toHaveProperty('tags');
        expect(source).toHaveProperty('healthScore');
        
        // Validate data types
        expect(typeof source.id).toBe('string');
        expect(typeof source.name).toBe('string');
        expect(typeof source.description).toBe('string');
        expect(typeof source.normalizer).toBe('string');
        expect(typeof source.refreshInterval).toBe('number');
        expect(typeof source.enabled).toBe('boolean');
        expect(typeof source.healthScore).toBe('number');
        expect(Array.isArray(source.tags)).toBe(true);
        
        // Validate ranges
        expect(source.healthScore).toBeGreaterThanOrEqual(1);
        expect(source.healthScore).toBeLessThanOrEqual(100);
        expect(source.refreshInterval).toBeGreaterThan(0);
      });
    });

    test('TDD_TEST_003: Should have valid endpoint configuration', () => {
      PRIMARY_INTELLIGENCE_SOURCES.forEach(source => {
        expect(source.endpoint).toBeDefined();
        expect(source.endpoint).toHaveProperty('id');
        expect(source.endpoint).toHaveProperty('name');
        expect(source.endpoint).toHaveProperty('category');
        expect(source.endpoint).toHaveProperty('baseUrl');
        expect(source.endpoint).toHaveProperty('corsEnabled');
        expect(source.endpoint).toHaveProperty('requiresAuth');
        
        expect(typeof source.endpoint.baseUrl).toBe('string');
        expect(source.endpoint.baseUrl).toMatch(/^https?:\/\//);
        expect(typeof source.endpoint.corsEnabled).toBe('boolean');
        expect(typeof source.endpoint.requiresAuth).toBe('boolean');
      });
    });

    test('TDD_TEST_004: Should have CORS-enabled endpoints', () => {
      const corsEnabledSources = PRIMARY_INTELLIGENCE_SOURCES.filter(
        source => source.endpoint.corsEnabled === true
      );
      
      expect(corsEnabledSources.length).toBeGreaterThan(0);
    });

    test('TDD_TEST_005: Should include no-auth required sources for immediate deployment', () => {
      const noAuthSources = PRIMARY_INTELLIGENCE_SOURCES.filter(
        source => source.endpoint.requiresAuth === false
      );
      
      expect(noAuthSources.length).toBeGreaterThan(0);
    });

    test('TDD_TEST_006: Should have reasonable refresh intervals', () => {
      PRIMARY_INTELLIGENCE_SOURCES.forEach(source => {
        // Refresh interval should be at least 1 minute and at most 24 hours
        expect(source.refreshInterval).toBeGreaterThanOrEqual(60000); // 1 minute
        expect(source.refreshInterval).toBeLessThanOrEqual(86400000); // 24 hours
      });
    });

    test('TDD_TEST_007: Should have valid normalizer function names', () => {
      PRIMARY_INTELLIGENCE_SOURCES.forEach(source => {
        expect(source.normalizer).toMatch(/^normalize[A-Z]/);
        expect(source.normalizer.length).toBeGreaterThan(10);
      });
    });
  });
});
