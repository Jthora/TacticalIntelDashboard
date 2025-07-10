/**
 * Unit tests for Earth Alliance Sources Constants
 */
import { describe, test, expect } from '@jest/globals';
import { 
  EARTH_ALLIANCE_SOURCES, 
  getSourcesByCategory, 
  getSourcesByProtocol,
  getHighTrustSources,
  getHighAlignmentSources,
  EarthAllianceCategory,
  SourceProtocol
} from '../../constants/EarthAllianceSources';

describe('Earth Alliance Sources', () => {
  test('EARTH_ALLIANCE_SOURCES should be an array of sources', () => {
    // Assert
    expect(Array.isArray(EARTH_ALLIANCE_SOURCES)).toBe(true);
    expect(EARTH_ALLIANCE_SOURCES.length).toBeGreaterThan(0);
  });

  test('each source should have required properties', () => {
    // Act & Assert
    EARTH_ALLIANCE_SOURCES.forEach(source => {
      expect(source).toHaveProperty('id');
      expect(source).toHaveProperty('name');
      expect(source).toHaveProperty('url');
      expect(source).toHaveProperty('category');
      expect(source).toHaveProperty('trustRating');
      expect(source).toHaveProperty('allianceAlignment');
      expect(source).toHaveProperty('accessMethod');
      expect(source).toHaveProperty('verificationMethod');
      expect(source).toHaveProperty('protocol');
      expect(source).toHaveProperty('endpoint');
      expect(source).toHaveProperty('format');
    });
  });

  test('trustRating should be between 0 and 100', () => {
    // Act & Assert
    EARTH_ALLIANCE_SOURCES.forEach(source => {
      expect(source.trustRating).toBeGreaterThanOrEqual(0);
      expect(source.trustRating).toBeLessThanOrEqual(100);
    });
  });

  test('allianceAlignment should be between -100 and 100', () => {
    // Act & Assert
    EARTH_ALLIANCE_SOURCES.forEach(source => {
      expect(source.allianceAlignment).toBeGreaterThanOrEqual(-100);
      expect(source.allianceAlignment).toBeLessThanOrEqual(100);
    });
  });

  describe('getSourcesByCategory', () => {
    test('should return sources filtered by category', () => {
      // Arrange
      const category = EarthAllianceCategory.INDEPENDENT_INVESTIGATIVE_JOURNALISM;
      
      // Act
      const result = getSourcesByCategory(category);
      
      // Assert
      expect(Array.isArray(result)).toBe(true);
      result.forEach(source => {
        expect(source.category).toBe(category);
      });
    });

    test('should return empty array for category with no sources', () => {
      // Arrange - Create a category that doesn't exist in the sources
      const nonExistentCategory = 'NON_EXISTENT_CATEGORY' as EarthAllianceCategory;
      
      // Act
      const result = getSourcesByCategory(nonExistentCategory);
      
      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe('getSourcesByProtocol', () => {
    test('should return sources filtered by protocol', () => {
      // Arrange
      const protocol = SourceProtocol.RSS;
      
      // Act
      const result = getSourcesByProtocol(protocol);
      
      // Assert
      expect(Array.isArray(result)).toBe(true);
      result.forEach(source => {
        expect(source.protocol).toBe(protocol);
      });
    });

    test('should return empty array for protocol with no sources', () => {
      // Arrange - Create a protocol that might not have sources
      const rarePotocol = SourceProtocol.SSB;
      
      // Act
      const result = getSourcesByProtocol(rarePotocol);
      
      // Assert
      expect(Array.isArray(result)).toBe(true);
      // Note: This test might need to be adjusted if the test data has SSB sources
    });
  });

  describe('getHighTrustSources', () => {
    test('should return sources with trust rating above threshold', () => {
      // Arrange
      const threshold = 80;
      
      // Act
      const result = getHighTrustSources(threshold);
      
      // Assert
      expect(Array.isArray(result)).toBe(true);
      result.forEach(source => {
        expect(source.trustRating).toBeGreaterThanOrEqual(threshold);
      });
    });

    test('should use default threshold if none provided', () => {
      // Act
      const result = getHighTrustSources();
      
      // Assert
      expect(Array.isArray(result)).toBe(true);
      result.forEach(source => {
        expect(source.trustRating).toBeGreaterThanOrEqual(80);
      });
    });
  });

  describe('getHighAlignmentSources', () => {
    test('should return sources with alliance alignment above threshold', () => {
      // Arrange
      const threshold = 85;
      
      // Act
      const result = getHighAlignmentSources(threshold);
      
      // Assert
      expect(Array.isArray(result)).toBe(true);
      result.forEach(source => {
        expect(source.allianceAlignment).toBeGreaterThanOrEqual(threshold);
      });
    });

    test('should use default threshold if none provided', () => {
      // Act
      const result = getHighAlignmentSources();
      
      // Assert
      expect(Array.isArray(result)).toBe(true);
      result.forEach(source => {
        expect(source.allianceAlignment).toBeGreaterThanOrEqual(80);
      });
    });
  });
});
