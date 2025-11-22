import { describe, expect, test } from '@jest/globals';

import { PRIMARY_INTELLIGENCE_SOURCES, SOURCE_CATEGORIES } from '../ModernIntelligenceSources';
import { MODERN_INTELLIGENCE_CATEGORIES } from '../../adapters/ModernIntelSourcesAdapter';

describe('ModernIntelligenceSources Earth Alliance integration', () => {
  test('Earth Alliance News is registered as a primary intelligence source', () => {
    const earthAllianceSource = PRIMARY_INTELLIGENCE_SOURCES.find(source => source.id === 'earth-alliance-news');
    expect(earthAllianceSource).toBeDefined();
    expect(earthAllianceSource?.enabled).toBe(true);
    expect(earthAllianceSource?.normalizer).toBe('normalizeEarthAllianceNews');
  });

  test('Earth Alliance News appears in security category mappings', () => {
    expect(SOURCE_CATEGORIES.SECURITY.sources).toContain('earth-alliance-news');
    expect(MODERN_INTELLIGENCE_CATEGORIES.CYBINT.sources).toContain('earth-alliance-news');
  });

  test('Earth Alliance News augments military intelligence category listings', () => {
    expect(MODERN_INTELLIGENCE_CATEGORIES.MILINT.sources).toContain('earth-alliance-news');
  });
});

describe('ModernIntelligenceSources Investigative integration', () => {
  test('The Intercept investigative source is registered correctly', () => {
    const intercept = PRIMARY_INTELLIGENCE_SOURCES.find(source => source.id === 'intercept-investigations');
    expect(intercept).toBeDefined();
    expect(intercept?.enabled).toBe(true);
    expect(intercept?.normalizer).toBe('normalizeInvestigativeRSS');
    expect(intercept?.endpoint.id).toBe('investigative-rss');
  });

  test('Investigative source is surfaced in category mappings', () => {
    expect(SOURCE_CATEGORIES.INVESTIGATIVE.sources).toContain('intercept-investigations');
    expect(MODERN_INTELLIGENCE_CATEGORIES.OSINT.sources).toContain('intercept-investigations');
    expect(MODERN_INTELLIGENCE_CATEGORIES.INVESTIGATIVE.sources).toContain('intercept-investigations');
  });

  test('ProPublica investigative source is registered correctly', () => {
    const propublica = PRIMARY_INTELLIGENCE_SOURCES.find(source => source.id === 'propublica-investigations');
    expect(propublica).toBeDefined();
    expect(propublica?.enabled).toBe(true);
    expect(propublica?.normalizer).toBe('normalizeInvestigativeRSS');
    expect(propublica?.endpoint.id).toBe('investigative-rss');
  });

  test('ProPublica investigative source is surfaced in category mappings', () => {
    expect(SOURCE_CATEGORIES.INVESTIGATIVE.sources).toContain('propublica-investigations');
    expect(MODERN_INTELLIGENCE_CATEGORIES.OSINT.sources).toContain('propublica-investigations');
    expect(MODERN_INTELLIGENCE_CATEGORIES.INVESTIGATIVE.sources).toContain('propublica-investigations');
  });

  test('ICIJ investigative source is registered correctly', () => {
    const icij = PRIMARY_INTELLIGENCE_SOURCES.find(source => source.id === 'icij-investigations');
    expect(icij).toBeDefined();
    expect(icij?.enabled).toBe(true);
    expect(icij?.normalizer).toBe('normalizeInvestigativeRSS');
    expect(icij?.endpoint.id).toBe('investigative-rss');
  });

  test('ICIJ investigative source is surfaced in category mappings', () => {
    expect(SOURCE_CATEGORIES.INVESTIGATIVE.sources).toContain('icij-investigations');
    expect(MODERN_INTELLIGENCE_CATEGORIES.OSINT.sources).toContain('icij-investigations');
    expect(MODERN_INTELLIGENCE_CATEGORIES.INVESTIGATIVE.sources).toContain('icij-investigations');
  });

  test('Bellingcat investigative source is registered correctly', () => {
    const bellingcat = PRIMARY_INTELLIGENCE_SOURCES.find(source => source.id === 'bellingcat-investigations');
    expect(bellingcat).toBeDefined();
    expect(bellingcat?.enabled).toBe(true);
    expect(bellingcat?.normalizer).toBe('normalizeInvestigativeRSS');
    expect(bellingcat?.endpoint.id).toBe('investigative-rss');
  });

  test('Bellingcat investigative source is surfaced in category mappings', () => {
    expect(SOURCE_CATEGORIES.INVESTIGATIVE.sources).toContain('bellingcat-investigations');
    expect(MODERN_INTELLIGENCE_CATEGORIES.OSINT.sources).toContain('bellingcat-investigations');
    expect(MODERN_INTELLIGENCE_CATEGORIES.INVESTIGATIVE.sources).toContain('bellingcat-investigations');
  });

  test('DDoSecrets investigative source is registered correctly', () => {
    const ddosecrets = PRIMARY_INTELLIGENCE_SOURCES.find(source => source.id === 'ddosecrets-investigations');
    expect(ddosecrets).toBeDefined();
    expect(ddosecrets?.enabled).toBe(true);
    expect(ddosecrets?.normalizer).toBe('normalizeInvestigativeRSS');
    expect(ddosecrets?.endpoint.id).toBe('investigative-rss');
  });

  test('DDoSecrets investigative source is surfaced in category mappings', () => {
    expect(SOURCE_CATEGORIES.INVESTIGATIVE.sources).toContain('ddosecrets-investigations');
    expect(MODERN_INTELLIGENCE_CATEGORIES.OSINT.sources).toContain('ddosecrets-investigations');
    expect(MODERN_INTELLIGENCE_CATEGORIES.INVESTIGATIVE.sources).toContain('ddosecrets-investigations');
  });

  test('OCCRP investigative source is registered correctly', () => {
    const occrp = PRIMARY_INTELLIGENCE_SOURCES.find(source => source.id === 'occrp-investigations');
    expect(occrp).toBeDefined();
    expect(occrp?.enabled).toBe(true);
    expect(occrp?.normalizer).toBe('normalizeInvestigativeRSS');
    expect(occrp?.endpoint.id).toBe('investigative-rss');
  });

  test('OCCRP investigative source is surfaced in category mappings', () => {
    expect(SOURCE_CATEGORIES.INVESTIGATIVE.sources).toContain('occrp-investigations');
    expect(MODERN_INTELLIGENCE_CATEGORIES.OSINT.sources).toContain('occrp-investigations');
    expect(MODERN_INTELLIGENCE_CATEGORIES.INVESTIGATIVE.sources).toContain('occrp-investigations');
  });

  const expansionSources = [
    { id: 'krebs-security', normalizer: 'normalizeCyberSecurityRSS', endpointId: 'investigative-rss' },
    { id: 'threatpost-security', normalizer: 'normalizeCyberSecurityRSS', endpointId: 'investigative-rss' },
    { id: 'wired-security', normalizer: 'normalizeCyberSecurityRSS', endpointId: 'investigative-rss' },
    { id: 'grayzone-geopolitics', normalizer: 'normalizeGeopoliticalRSS', endpointId: 'investigative-rss' },
    { id: 'mintpress-geopolitics', normalizer: 'normalizeGeopoliticalRSS', endpointId: 'investigative-rss' },
    { id: 'geopolitical-economy-report', normalizer: 'normalizeGeopoliticalRSS', endpointId: 'investigative-rss' },
    { id: 'eff-updates', normalizer: 'normalizePrivacyAdvocacyRSS', endpointId: 'investigative-rss' },
    { id: 'privacy-international', normalizer: 'normalizePrivacyAdvocacyRSS', endpointId: 'investigative-rss' },
    { id: 'opensecrets-transparency', normalizer: 'normalizeOpenSecretsNews', endpointId: 'investigative-rss' },
    { id: 'transparency-international', normalizer: 'normalizeFinancialTransparencyRSS', endpointId: 'investigative-rss' },
    { id: 'inside-climate-news', normalizer: 'normalizeClimateResilienceRSS', endpointId: 'investigative-rss' },
    { id: 'guardian-environment', normalizer: 'normalizeClimateResilienceRSS', endpointId: 'investigative-rss' },
    { id: 'future-of-life-institute', normalizer: 'normalizeAIGovernanceRSS', endpointId: 'investigative-rss' }
  ];

  expansionSources.forEach(config => {
    test(`${config.id} source is registered with correct normalizer`, () => {
      const source = PRIMARY_INTELLIGENCE_SOURCES.find(entry => entry.id === config.id);
      expect(source).toBeDefined();
      expect(source?.enabled).toBe(true);
      expect(source?.normalizer).toBe(config.normalizer);
      expect(source?.endpoint.id).toBe(config.endpointId);
      if (config.id === 'krebs-security') {
        expect(source?.homepage).toBe('https://krebsonsecurity.com/');
      }
    });
  });

  test('Category mappings include newly onboarded sources', () => {
    expect(SOURCE_CATEGORIES.SECURITY.sources).toEqual(
      expect.arrayContaining(['krebs-security', 'threatpost-security', 'wired-security'])
    );
    expect(SOURCE_CATEGORIES.GEOPOLITICS.sources).toEqual(
      expect.arrayContaining(['grayzone-geopolitics', 'mintpress-geopolitics', 'geopolitical-economy-report'])
    );
    expect(SOURCE_CATEGORIES.PRIVACY.sources).toEqual(
      expect.arrayContaining(['eff-updates', 'privacy-international'])
    );
    expect(SOURCE_CATEGORIES.CLIMATE.sources).toEqual(
      expect.arrayContaining(['inside-climate-news', 'guardian-environment'])
    );
    expect(SOURCE_CATEGORIES.FINANCIAL.sources).toEqual(
      expect.arrayContaining(['opensecrets-transparency', 'transparency-international', 'coingecko-crypto'])
    );
    expect(SOURCE_CATEGORIES.AI_ETHICS.sources).toContain('future-of-life-institute');
  });

  test('Modern intelligence categories reference the new sources', () => {
    expect(MODERN_INTELLIGENCE_CATEGORIES.CYBINT.sources).toEqual(
      expect.arrayContaining(['krebs-security', 'threatpost-security'])
    );
    expect(MODERN_INTELLIGENCE_CATEGORIES.OSINT.sources).toEqual(
      expect.arrayContaining(['grayzone-geopolitics', 'mintpress-geopolitics', 'opensecrets-transparency'])
    );
    expect(MODERN_INTELLIGENCE_CATEGORIES.PRIVINT.sources).toEqual(
      expect.arrayContaining(['eff-updates', 'privacy-international'])
    );
    expect(MODERN_INTELLIGENCE_CATEGORIES.CLIMINT.sources).toEqual(
      expect.arrayContaining(['inside-climate-news', 'guardian-environment'])
    );
    expect(MODERN_INTELLIGENCE_CATEGORIES.AIGOV.sources).toContain('future-of-life-institute');
  });
});

describe('Space and defense source onboarding', () => {
  const spaceDefenseSources = [
    { id: 'nasa-news-releases', normalizer: 'normalizeSpaceAgencyRSS', endpointId: 'investigative-rss' },
    { id: 'spacenews-policy', normalizer: 'normalizeSpaceAgencyRSS', endpointId: 'investigative-rss' },
    { id: 'esa-space-news', normalizer: 'normalizeSpaceAgencyRSS', endpointId: 'investigative-rss' },
    { id: 'spacecom-latest', normalizer: 'normalizeSpaceAgencyRSS', endpointId: 'investigative-rss' },
    { id: 'dod-war-news', normalizer: 'normalizeDefenseNewsRSS', endpointId: 'investigative-rss' },
    { id: 'breaking-defense', normalizer: 'normalizeDefenseNewsRSS', endpointId: 'investigative-rss' },
    { id: 'c4isrnet-ops', normalizer: 'normalizeDefenseNewsRSS', endpointId: 'investigative-rss' },
    { id: 'launch-library-upcoming', normalizer: 'normalizeLaunchLibraryData', endpointId: 'launch-library' }
  ];

  spaceDefenseSources.forEach(config => {
    test(`${config.id} source is registered and enabled`, () => {
      const source = PRIMARY_INTELLIGENCE_SOURCES.find(entry => entry.id === config.id);
      expect(source).toBeDefined();
      expect(source?.enabled).toBe(true);
      expect(source?.normalizer).toBe(config.normalizer);
      expect(source?.endpoint.id).toBe(config.endpointId);
    });
  });

  test('Source categories capture the new space and defense feeds', () => {
    expect(SOURCE_CATEGORIES.GOVERNMENT.sources).toEqual(
      expect.arrayContaining(['nasa-news-releases', 'esa-space-news', 'launch-library-upcoming', 'dod-war-news'])
    );
    expect(SOURCE_CATEGORIES.SECURITY.sources).toEqual(
      expect.arrayContaining(['breaking-defense', 'c4isrnet-ops'])
    );
    expect(SOURCE_CATEGORIES.TECHNOLOGY.sources).toEqual(
      expect.arrayContaining(['spacenews-policy', 'spacecom-latest'])
    );
  });

  test('Modern intelligence categories map the new feeds', () => {
    expect(MODERN_INTELLIGENCE_CATEGORIES.TECHINT.sources).toEqual(
      expect.arrayContaining(['nasa-news-releases', 'spacenews-policy', 'esa-space-news', 'spacecom-latest', 'launch-library-upcoming'])
    );
    expect(MODERN_INTELLIGENCE_CATEGORIES.MILINT.sources).toEqual(
      expect.arrayContaining(['earth-alliance-news', 'dod-war-news', 'breaking-defense', 'c4isrnet-ops'])
    );
    expect(MODERN_INTELLIGENCE_CATEGORIES.OSINT.sources).toEqual(
      expect.arrayContaining(['nasa-news-releases', 'dod-war-news'])
    );
  });
});
