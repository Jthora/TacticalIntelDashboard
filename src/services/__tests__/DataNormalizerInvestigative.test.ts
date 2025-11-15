import { describe, expect, test } from '@jest/globals';

import { DataNormalizer } from '../DataNormalizer';

describe('DataNormalizer.normalizeInvestigativeRSS', () => {
  test('normalizes investigative RSS entries with investigative tagging and priority', () => {
    const sampleResponse = {
      feed: { title: 'The Intercept' },
      items: [
        {
          title: 'Exclusive: Secret Files Reveal New Surveillance Program',
          link: 'https://theintercept.com/example-article',
          description: '<p>Breaking: leaked documents expose a classified program.</p>',
          pubDate: '2025-10-01T12:15:00Z',
          categories: ['Breaking', 'Investigations'],
          author: 'Jane Reporter'
        }
      ]
    };

    const result = DataNormalizer.normalizeInvestigativeRSS(sampleResponse);

    expect(result).toHaveLength(1);
    const [item] = result;

    expect(item.source).toBe('The Intercept');
    expect(item.url).toBe('https://theintercept.com/example-article');
    expect(item.tags).toEqual(expect.arrayContaining(['investigative', 'whistleblower']));
    expect(item.priority === 'high' || item.priority === 'critical').toBe(true);
    expect(item.publishedAt instanceof Date).toBe(true);
    expect(item.metadata?.raw).toBeDefined();
    expect(item.metadata?.author).toBe('Jane Reporter');
  });

  test('handles missing links by filtering invalid items', () => {
    const sampleResponse = {
      feed: { title: 'ProPublica' },
      items: [
        {
          title: 'Investigation: Data without link',
          description: 'Should be skipped due to missing link'
        },
        {
          title: 'Document trove analysis',
          link: 'https://www.propublica.org/example',
          description: 'Analysis based on newly released documents.',
          pubDate: '2025-10-02'
        }
      ]
    };

    const result = DataNormalizer.normalizeInvestigativeRSS(sampleResponse);

    expect(result).toHaveLength(1);
    expect(result[0].source).toBe('ProPublica');
    expect(result[0].url).toBe('https://www.propublica.org/example');
  });
});
