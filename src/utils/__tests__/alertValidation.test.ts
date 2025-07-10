import { validateAlertForm, sanitizeInput, parseKeywords } from '../alertValidation';

describe('Alert Validation Utilities', () => {
  describe('validateAlertForm', () => {
    it('should validate required fields', () => {
      const invalidData = {
        name: '',
        keywords: [],
        priority: 'high',
      };

      const result = validateAlertForm(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toContain('required');
      expect(result.errors.keywords).toContain('required');
    });

    it('should validate alert name length', () => {
      const invalidData = {
        name: 'a'.repeat(101), // Too long
        keywords: ['test'],
        priority: 'high',
      };

      const result = validateAlertForm(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toContain('too long');
    });

    it('should pass validation for valid data', () => {
      const validData = {
        name: 'Test Alert',
        keywords: ['security', 'breach'],
        priority: 'high',
      };

      const result = validateAlertForm(validData);
      
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove XSS attempts', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello';
      const sanitized = sanitizeInput(maliciousInput);
      
      expect(sanitized).toBe('Hello');
      expect(sanitized).not.toContain('<script>');
    });

    it('should preserve safe content', () => {
      const safeInput = 'This is a safe alert name';
      const sanitized = sanitizeInput(safeInput);
      
      expect(sanitized).toBe(safeInput);
    });

    it('should handle empty input', () => {
      const sanitized = sanitizeInput('');
      expect(sanitized).toBe('');
    });

    it('should handle null/undefined input', () => {
      expect(sanitizeInput(null as any)).toBe('');
      expect(sanitizeInput(undefined as any)).toBe('');
    });
  });

  describe('parseKeywords', () => {
    it('should parse comma-separated keywords', () => {
      const input = 'security, breach, malware';
      const keywords = parseKeywords(input);
      
      expect(keywords).toEqual(['security', 'breach', 'malware']);
    });

    it('should handle multiple separators', () => {
      const input = 'security, breach; malware\nnews\tthreat';
      const keywords = parseKeywords(input);
      
      expect(keywords).toEqual(['security', 'breach', 'malware', 'news', 'threat']);
    });

    it('should trim whitespace and remove empty keywords', () => {
      const input = ' security ,  , breach  ,   ';
      const keywords = parseKeywords(input);
      
      expect(keywords).toEqual(['security', 'breach']);
    });

    it('should handle empty input', () => {
      const keywords = parseKeywords('');
      expect(keywords).toEqual([]);
    });

    it('should remove duplicates', () => {
      const input = 'security, breach, security, malware, breach';
      const keywords = parseKeywords(input);
      
      expect(keywords).toEqual(['security', 'breach', 'malware']);
    });

    it('should convert to lowercase for consistency', () => {
      const input = 'SECURITY, Breach, MalWare';
      const keywords = parseKeywords(input);
      
      expect(keywords).toEqual(['security', 'breach', 'malware']);
    });

    it('should validate keyword length limits', () => {
      const longKeyword = 'a'.repeat(51); // Assuming max keyword length is 50
      const input = `security, ${longKeyword}, breach`;
      const keywords = parseKeywords(input);
      
      // Should filter out overly long keywords
      expect(keywords).toEqual(['security', 'breach']);
    });

    it('should handle special characters appropriately', () => {
      const input = 'cyber-attack, data.breach, social_engineering';
      const keywords = parseKeywords(input);
      
      expect(keywords).toEqual(['cyber-attack', 'data.breach', 'social_engineering']);
    });
  });
});
