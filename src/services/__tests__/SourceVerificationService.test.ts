/**
 * Unit tests for SourceVerificationService
 */
import { describe, test, expect } from '@jest/globals';
import { SourceVerificationService } from '../SourceVerificationService';
import { EARTH_ALLIANCE_SOURCES } from '../../constants/EarthAllianceSources';

describe('SourceVerificationService', () => {
  describe('verifySource', () => {
    test('should return verified result for Earth Alliance source', () => {
      // Arrange
      const validSource = EARTH_ALLIANCE_SOURCES[0];
      
      // Act
      const result = SourceVerificationService.verifySource(validSource.url);
      
      // Assert
      expect(result).toEqual({
        isVerified: true,
        trustRating: validSource.trustRating,
        allianceAlignment: validSource.allianceAlignment,
        verificationMethod: validSource.verificationMethod,
        warningFlags: []
      });
    });
    
    test('should return non-verified result for non-Earth Alliance source', () => {
      // Arrange
      const invalidUrl = 'https://fake-news-source.com';
      
      // Act
      const result = SourceVerificationService.verifySource(invalidUrl);
      
      // Assert
      expect(result).toEqual({
        isVerified: false,
        trustRating: 30,
        allianceAlignment: -50,
        verificationMethod: 'not-verified',
        warningFlags: ['non-earth-alliance-source', 'potential-compromised-narrative']
      });
    });
  });
  
  describe('analyzePropagandaTechniques', () => {
    test('should detect propaganda techniques in content', () => {
      // Arrange
      const contentWithPropaganda = 'According to officials, experts agree that this conspiracy theory has been debunked.';
      
      // Act
      const result = SourceVerificationService.analyzePropagandaTechniques(contentWithPropaganda);
      
      // Assert
      expect(result).toContain('appeal-to-authority');
      expect(result).toContain('bandwagon');
      expect(result).toContain('labeling');
      expect(result).toContain('dismissal-without-evidence');
      expect(result.length).toBe(4);
    });
    
    test('should return empty array for content without propaganda techniques', () => {
      // Arrange
      const cleanContent = 'This is a factual report on the events that occurred.';
      
      // Act
      const result = SourceVerificationService.analyzePropagandaTechniques(cleanContent);
      
      // Assert
      expect(result).toEqual([]);
    });
  });
  
  describe('analyzeNarrativeAlignment', () => {
    test('should return 0 for single content', () => {
      // Arrange
      const singleContent = ['This is a test content'];
      
      // Act
      const result = SourceVerificationService.analyzeNarrativeAlignment(singleContent);
      
      // Assert
      expect(result).toBe(0);
    });
    
    test('should calculate alignment percentage for multiple contents', () => {
      // Arrange
      const contents = [
        'The global reset is being prepared by the alliance for disclosure',
        'Sovereignty and whistleblower protection are key aspects of the alliance',
        'Nothing related to the keywords'
      ];
      
      // Act
      const result = SourceVerificationService.analyzeNarrativeAlignment(contents);
      
      // Assert
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(100);
    });
  });
  
  describe('checkCensorshipPatterns', () => {
    test('should detect censorship patterns for known platforms', () => {
      // Arrange
      const youtubeUrl = 'https://youtube.com/watch?v=123456';
      
      // Act
      const result = SourceVerificationService.checkCensorshipPatterns(youtubeUrl);
      
      // Assert
      expect(result).toContain('demonetization');
    });
    
    test('should return empty array for uncensored platforms', () => {
      // Arrange
      const uncensoredUrl = 'https://independent-platform.org';
      
      // Act
      const result = SourceVerificationService.checkCensorshipPatterns(uncensoredUrl);
      
      // Assert
      expect(result).toEqual([]);
    });
  });
});
