import { describe, expect, test } from '@jest/globals';

import { convertToLegacyFormat } from '../ModernIntelSourcesAdapter';
import { PRIMARY_INTELLIGENCE_SOURCES } from '../../constants/ModernIntelligenceSources';

describe('ModernIntelSourcesAdapter', () => {
  test('uses homepage for source url when provided', () => {
    const krebs = PRIMARY_INTELLIGENCE_SOURCES.find(source => source.id === 'krebs-security');
    expect(krebs).toBeDefined();

    const legacy = convertToLegacyFormat(krebs!);
    expect(legacy.url).toBe('https://krebsonsecurity.com/');
    expect(legacy.endpoint).toBe(krebs?.endpoint.baseUrl);
  });
});
