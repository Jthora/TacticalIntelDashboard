import { buildXIntentUrl, composeShareText, normalizeHashtags, DEFAULT_X_INTENT_BASE_URL, LEGACY_TWITTER_INTENT_BASE_URL } from '../socialShare';

describe('socialShare utils', () => {
  describe('composeShareText', () => {
    it('joins title and summary with separator', () => {
      const result = composeShareText({
        title: 'Urgent Intel Update',
        summary: 'Additional context for downstream analysts.'
      });

      expect(result).toBe('Urgent Intel Update — Additional context for downstream analysts.');
    });

    it('trims output and appends ellipsis when exceeding limit', () => {
      const result = composeShareText({
        title: 'A'.repeat(300),
        maxLength: 50
      });

      expect(result.length).toBeLessThanOrEqual(50);
      expect(result.endsWith('…')).toBe(true);
    });

    it('returns empty string when no inputs provided', () => {
      expect(composeShareText({})).toBe('');
    });
  });

  describe('normalizeHashtags', () => {
    it('deduplicates, trims, and lowercases hashtags', () => {
      const result = normalizeHashtags(['#OSINT', ' intel ', '#osint', '']);

      expect(result).toEqual(['osint', 'intel']);
    });
  });

  describe('buildXIntentUrl', () => {
    it('builds an intent url using default base', () => {
      const url = buildXIntentUrl({
        url: 'https://intel.local/item/123',
        title: 'Priority Intel',
        hashtags: ['#Intel']
      });

      const expectedBase = `${DEFAULT_X_INTENT_BASE_URL}?`;
      expect(url.startsWith(expectedBase)).toBe(true);
      const params = new URLSearchParams(url.replace(expectedBase, ''));
      expect(params.get('url')).toBe('https://intel.local/item/123');
      expect(params.get('text')).toContain('Priority Intel');
      expect(params.get('hashtags')).toBe('intel');
    });

    it('respects custom base url and sanitizes via handle', () => {
      const url = buildXIntentUrl({
        baseUrl: LEGACY_TWITTER_INTENT_BASE_URL,
        url: 'https://intel.local/item/456',
        title: 'Another Alert',
        via: '@TacticalIntel'
      });

      expect(url.startsWith(`${LEGACY_TWITTER_INTENT_BASE_URL}?`)).toBe(true);
      const params = new URLSearchParams(url.replace(`${LEGACY_TWITTER_INTENT_BASE_URL}?`, ''));
      expect(params.get('via')).toBe('TacticalIntel');
    });

    it('throws when url is missing', () => {
      expect(() => buildXIntentUrl({ url: '' })).toThrow('buildXIntentUrl requires a URL to be provided');
    });
  });
});
