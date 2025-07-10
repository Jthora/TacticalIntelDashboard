import {
  validateRSSFeed,
  validateRSSItem,
  sanitizeRSSFeed,
  sanitizeRSSItem,
  parseRSSDate,
  extractKeywords,
  RSSFeed,
  RSSItem
} from '../rssUtils';

describe('RSS Utils', () => {
  const validRSSItem: RSSItem = {
    title: 'Test Article',
    description: 'This is a test article description',
    link: 'https://example.com/article',
    pubDate: 'Mon, 01 Jan 2024 12:00:00 GMT',
    source: 'Test Source'
  };

  const validRSSFeed: RSSFeed = {
    title: 'Test Feed',
    description: 'Test feed description',
    link: 'https://example.com/feed',
    items: [validRSSItem]
  };

  describe('validateRSSFeed', () => {
    it('should validate a correct RSS feed', () => {
      const result = validateRSSFeed(validRSSFeed);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject null or undefined feed', () => {
      const result1 = validateRSSFeed(null);
      const result2 = validateRSSFeed(undefined);
      
      expect(result1.isValid).toBe(false);
      expect(result1.errors).toContain('Feed must be an object');
      expect(result2.isValid).toBe(false);
      expect(result2.errors).toContain('Feed must be an object');
    });

    it('should require feed title', () => {
      const invalidFeed = { ...validRSSFeed, title: '' };
      const result = validateRSSFeed(invalidFeed);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('title is required'))).toBe(true);
    });

    it('should require valid feed link', () => {
      const invalidFeed = { ...validRSSFeed, link: 'invalid-url' };
      const result = validateRSSFeed(invalidFeed);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('valid URL'))).toBe(true);
    });

    it('should require items to be an array', () => {
      const invalidFeed = { ...validRSSFeed, items: 'not an array' as any };
      const result = validateRSSFeed(invalidFeed);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Feed items must be an array');
    });

    it('should validate individual items in the feed', () => {
      const invalidItem = { ...validRSSItem, title: '' };
      const invalidFeed = { ...validRSSFeed, items: [invalidItem] };
      const result = validateRSSFeed(invalidFeed);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('Item 0'))).toBe(true);
    });
  });

  describe('validateRSSItem', () => {
    it('should validate a correct RSS item', () => {
      const result = validateRSSItem(validRSSItem);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject null or undefined item', () => {
      const result1 = validateRSSItem(null);
      const result2 = validateRSSItem(undefined);
      
      expect(result1.isValid).toBe(false);
      expect(result1.errors).toContain('Item must be an object');
      expect(result2.isValid).toBe(false);
      expect(result2.errors).toContain('Item must be an object');
    });

    it('should require item title', () => {
      const invalidItem = { ...validRSSItem, title: '' };
      const result = validateRSSItem(invalidItem);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Item title is required');
    });

    it('should require valid item link', () => {
      const invalidItem = { ...validRSSItem, link: 'invalid-url' };
      const result = validateRSSItem(invalidItem);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('valid URL'))).toBe(true);
    });

    it('should require valid pubDate', () => {
      const invalidItem = { ...validRSSItem, pubDate: 'invalid-date' };
      const result = validateRSSItem(invalidItem);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('valid date'))).toBe(true);
    });

    it('should require source', () => {
      const invalidItem = { ...validRSSItem, source: '' };
      const result = validateRSSItem(invalidItem);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Item source is required');
    });

    it('should allow optional description', () => {
      const itemWithoutDesc = { ...validRSSItem };
      delete (itemWithoutDesc as any).description;
      const result = validateRSSItem(itemWithoutDesc);
      
      expect(result.isValid).toBe(true);
    });
  });

  describe('sanitizeRSSFeed', () => {
    it('should sanitize feed content', () => {
      const maliciousFeed: RSSFeed = {
        title: 'Test <script>alert("xss")</script> Feed',
        description: 'Feed with <b>HTML</b> content',
        link: 'https://example.com/feed',
        items: [{
          title: 'Article <script>alert("xss")</script>',
          description: 'Content with <img src="x" onerror="alert(1)"> tags',
          link: 'https://example.com/article',
          pubDate: '2024-01-01T12:00:00Z',
          source: 'Test Source'
        }]
      };

      const sanitized = sanitizeRSSFeed(maliciousFeed);
      
      expect(sanitized.title).toBe('Test  Feed');
      expect(sanitized.description).toBe('Feed with HTML content');
      expect(sanitized.items[0].title).toBe('Article');
      expect(sanitized.items[0].description).toBe('Content with  tags');
    });

    it('should preserve valid URLs', () => {
      const sanitized = sanitizeRSSFeed(validRSSFeed);
      expect(sanitized.link).toBe('https://example.com/feed');
      expect(sanitized.items[0].link).toBe('https://example.com/article');
    });
  });

  describe('sanitizeRSSItem', () => {
    it('should remove script tags and HTML', () => {
      const maliciousItem: RSSItem = {
        title: 'Test <script>alert("xss")</script> Article',
        description: 'Content with <b>bold</b> and <script>alert("bad")</script>',
        link: 'https://example.com/article',
        pubDate: '2024-01-01T12:00:00Z',
        source: 'Test Source'
      };

      const sanitized = sanitizeRSSItem(maliciousItem);
      
      expect(sanitized.title).toBe('Test  Article');
      expect(sanitized.description).toBe('Content with bold and');
      expect(sanitized.link).toBe('https://example.com/article');
    });

    it('should handle HTML entities', () => {
      const itemWithEntities: RSSItem = {
        title: 'Test &amp; Article with &quot;quotes&quot;',
        description: 'Content with &lt;tags&gt; and &#x27;apostrophes&#x27;',
        link: 'https://example.com/article',
        pubDate: '2024-01-01T12:00:00Z',
        source: 'Test Source'
      };

      const sanitized = sanitizeRSSItem(itemWithEntities);
      
      expect(sanitized.title).toBe('Test & Article with "quotes"');
      expect(sanitized.description).toBe("Content with <tags> and 'apostrophes'");
    });
  });

  describe('parseRSSDate', () => {
    it('should parse RFC 2822 format dates', () => {
      const date1 = parseRSSDate('Mon, 01 Jan 2024 12:00:00 GMT');
      const date2 = parseRSSDate('Tue, 15 Dec 2023 08:30:45 +0000');
      
      expect(date1).toBeInstanceOf(Date);
      expect(date2).toBeInstanceOf(Date);
      expect(date1?.getFullYear()).toBe(2024);
      expect(date2?.getFullYear()).toBe(2023);
    });

    it('should parse ISO 8601 format dates', () => {
      const date1 = parseRSSDate('2024-01-01T12:00:00Z');
      const date2 = parseRSSDate('2023-12-15T08:30:45.123Z');
      
      expect(date1).toBeInstanceOf(Date);
      expect(date2).toBeInstanceOf(Date);
      expect(date1?.getFullYear()).toBe(2024);
      expect(date2?.getFullYear()).toBe(2023);
    });

    it('should handle invalid dates', () => {
      const result1 = parseRSSDate('invalid-date');
      const result2 = parseRSSDate('');
      const result3 = parseRSSDate(null as any);
      
      expect(result1).toBeNull();
      expect(result2).toBeNull();
      expect(result3).toBeNull();
    });

    it('should parse simple date formats', () => {
      const date = parseRSSDate('2024-01-01');
      expect(date).toBeInstanceOf(Date);
      expect(date).not.toBeNull();
      expect(isNaN(date!.getTime())).toBe(false);
    });
  });

  describe('extractKeywords', () => {
    it('should extract keywords from title and description', () => {
      const item: RSSItem = {
        title: 'Cybersecurity Alert: New Malware Threat Detected',
        description: 'Security researchers have identified a sophisticated malware campaign targeting financial institutions.',
        link: 'https://example.com/article',
        pubDate: '2024-01-01T12:00:00Z',
        source: 'Security News'
      };

      const keywords = extractKeywords(item);
      
      expect(keywords).toContain('cybersecurity');
      expect(keywords).toContain('alert');
      expect(keywords).toContain('malware');
      expect(keywords).toContain('threat');
      expect(keywords).toContain('detected');
      expect(keywords).toContain('security');
    });

    it('should remove HTML tags from content', () => {
      const item: RSSItem = {
        title: 'Technology <b>News</b> Update',
        description: 'This is <em>important</em> <a href="#">technology</a> news.',
        link: 'https://example.com/article',
        pubDate: '2024-01-01T12:00:00Z',
        source: 'Tech News'
      };

      const keywords = extractKeywords(item);
      
      expect(keywords).toContain('technology');
      expect(keywords).toContain('news');
      expect(keywords).toContain('update');
      expect(keywords).toContain('important');
    });

    it('should filter out stop words', () => {
      const item: RSSItem = {
        title: 'The quick brown fox jumps over the lazy dog',
        description: 'This is a test with common words that should be filtered.',
        link: 'https://example.com/article',
        pubDate: '2024-01-01T12:00:00Z',
        source: 'Test Source'
      };

      const keywords = extractKeywords(item);
      
      expect(keywords).toContain('quick');
      expect(keywords).toContain('brown');
      expect(keywords).toContain('fox');
      expect(keywords).toContain('jumps');
      expect(keywords).toContain('lazy');
      expect(keywords).toContain('dog');
      expect(keywords).toContain('test');
      expect(keywords).toContain('common');
      expect(keywords).toContain('words');
      expect(keywords).toContain('filtered');
      
      // Stop words should be filtered out
      expect(keywords).not.toContain('the');
      expect(keywords).not.toContain('is');
      expect(keywords).not.toContain('a');
      expect(keywords).not.toContain('with');
      expect(keywords).not.toContain('that');
    });

    it('should remove duplicates and limit results', () => {
      const item: RSSItem = {
        title: 'Test test test security security security',
        description: 'More test content with repeated security security words',
        link: 'https://example.com/article',
        pubDate: '2024-01-01T12:00:00Z',
        source: 'Test Source'
      };

      const keywords = extractKeywords(item);
      
      // Should only contain unique words
      const testCount = keywords.filter(k => k === 'test').length;
      const securityCount = keywords.filter(k => k === 'security').length;
      
      expect(testCount).toBe(1);
      expect(securityCount).toBe(1);
      expect(keywords.length).toBeLessThanOrEqual(20);
    });

    it('should handle empty or missing content', () => {
      const item: RSSItem = {
        title: '',
        description: '',
        link: 'https://example.com/article',
        pubDate: '2024-01-01T12:00:00Z',
        source: 'Test Source'
      };

      const keywords = extractKeywords(item);
      expect(keywords).toEqual([]);
    });
  });
});
