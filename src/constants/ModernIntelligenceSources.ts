/**
 * Modern Intelligence Sources Configuration
 * Defines the real-time, CORS-friendly intelligence sources for the dashboard
 */

import { IntelligenceSource } from '../types/ModernAPITypes';
import { isSourceEnabled } from '../utils/FeatureFlagUtil';
import { 
  COINGECKO_API,
  EARTH_ALLIANCE_NEWS_API,
  GITHUB_API,
  HACKERNEWS_API,
  INVESTIGATIVE_RSS_API,
  NASA_API,
  NOAA_WEATHER_API,
  REDDIT_API,
  USGS_EARTHQUAKE_API} from './APIEndpoints';

// TDD Error Tracking
const TDD_ERRORS = {
  logError: (id: string, location: string, issue: string, data?: any) => {
    console.error(`TDD_ERROR_${id}`, {
      location,
      issue,
      data,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Primary Intelligence Sources - Ready for immediate deployment
 * These sources require no authentication and have CORS enabled
 */
export const PRIMARY_INTELLIGENCE_SOURCES: IntelligenceSource[] = [
  {
    id: 'noaa-weather-alerts',
    name: 'NOAA Weather Alerts',
    description: 'Real-time weather alerts and warnings from the National Weather Service',
    endpoint: NOAA_WEATHER_API,
    normalizer: 'normalizeNOAAAlert',
    refreshInterval: 300000, // 5 minutes
    enabled: isSourceEnabled('noaa-weather-alerts', true),
    tags: ['weather', 'alerts', 'government', 'official'],
    healthScore: 100
  },
  {
    id: 'usgs-earthquakes',
    name: 'USGS Earthquake Data',
    description: 'Recent earthquake activity from the US Geological Survey',
    endpoint: USGS_EARTHQUAKE_API,
    normalizer: 'normalizeUSGSEarthquakes',
    refreshInterval: 600000, // 10 minutes
    enabled: isSourceEnabled('usgs-earthquakes', true),
    tags: ['seismic', 'geology', 'government', 'hazards'],
    healthScore: 100
  },
  {
    id: 'github-security',
    name: 'GitHub Security Advisories',
    description: 'Latest security vulnerabilities and advisories from GitHub',
    endpoint: GITHUB_API,
    normalizer: 'normalizeGitHubSecurityAdvisories',
    refreshInterval: 3600000, // 1 hour
    enabled: isSourceEnabled('github-security', true),
    tags: ['security', 'vulnerabilities', 'github', 'technology'],
    healthScore: 95
  },
  {
    id: 'hackernews-tech',
    name: 'Hacker News Technology',
    description: 'Top technology discussions and news from Hacker News',
    endpoint: HACKERNEWS_API,
    normalizer: 'normalizeHackerNewsItem',
    refreshInterval: 900000, // 15 minutes
    enabled: isSourceEnabled('hackernews-tech', true),
    tags: ['technology', 'discussion', 'innovation', 'startups'],
    healthScore: 90
  },
  {
    id: 'coingecko-crypto',
    name: 'CoinGecko Crypto',
    description: 'Cryptocurrency market data and trends from CoinGecko',
    endpoint: COINGECKO_API,
    normalizer: 'normalizeCoinGeckoData',
    refreshInterval: 600000, // 10 minutes
    enabled: isSourceEnabled('coingecko-crypto', true),
    tags: ['cryptocurrency', 'financial', 'markets', 'blockchain'],
    healthScore: 85
  },
  {
    id: 'intercept-investigations',
    name: 'The Intercept Investigations',
    description: 'Exclusive national security and accountability reporting from The Intercept',
    endpoint: INVESTIGATIVE_RSS_API,
    homepage: 'https://theintercept.com/',
    normalizer: 'normalizeInvestigativeRSS',
    refreshInterval: 900000, // 15 minutes
    enabled: isSourceEnabled('intercept-investigations', true),
    tags: ['investigative', 'osint', 'whistleblower', 'national-security'],
    healthScore: 90
  },
  {
    id: 'propublica-investigations',
    name: 'ProPublica Investigations',
    description: 'Public-interest investigations into government accountability and inequality from ProPublica',
    endpoint: INVESTIGATIVE_RSS_API,
    homepage: 'https://www.propublica.org/',
    normalizer: 'normalizeInvestigativeRSS',
    refreshInterval: 1200000, // 20 minutes
    enabled: isSourceEnabled('propublica-investigations', true),
    tags: ['investigative', 'accountability', 'public-interest', 'osint'],
    healthScore: 92
  },
  {
    id: 'icij-investigations',
    name: 'ICIJ Global Investigations',
    description: 'Cross-border reporting from the International Consortium of Investigative Journalists',
    endpoint: INVESTIGATIVE_RSS_API,
    homepage: 'https://www.icij.org/',
    normalizer: 'normalizeInvestigativeRSS',
    refreshInterval: 1200000, // 20 minutes
    enabled: isSourceEnabled('icij-investigations', true),
    tags: ['investigative', 'icij', 'global-corruption', 'osint'],
    healthScore: 91
  },
  {
    id: 'bellingcat-investigations',
    name: 'Bellingcat Investigations',
    description: 'Open-source investigative reporting and analysis from Bellingcat',
    endpoint: INVESTIGATIVE_RSS_API,
    homepage: 'https://www.bellingcat.com/',
    normalizer: 'normalizeInvestigativeRSS',
    refreshInterval: 900000, // 15 minutes
    enabled: isSourceEnabled('bellingcat-investigations', true),
    tags: ['investigative', 'bellingcat', 'osint', 'open-source-intel'],
    healthScore: 88
  },
  {
    id: 'ddosecrets-investigations',
    name: 'DDoSecrets Leaks Releases',
    description: 'Distributed Denial of Secrets torrent releases and leak disclosures',
    endpoint: INVESTIGATIVE_RSS_API,
    homepage: 'https://ddosecrets.com/',
    normalizer: 'normalizeInvestigativeRSS',
    refreshInterval: 1800000, // 30 minutes
    enabled: isSourceEnabled('ddosecrets-investigations', true),
    tags: ['investigative', 'ddosecrets', 'leaks', 'osint'],
    healthScore: 84
  },
  {
    id: 'occrp-investigations',
    name: 'OCCRP Cross-Border Investigations',
    description: 'Organized crime and corruption reporting from the OCCRP global network',
    endpoint: INVESTIGATIVE_RSS_API,
    homepage: 'https://www.occrp.org/',
    normalizer: 'normalizeInvestigativeRSS',
    refreshInterval: 1800000, // 30 minutes
    enabled: isSourceEnabled('occrp-investigations', true),
    tags: ['investigative', 'occrp', 'corruption', 'organized-crime'],
    healthScore: 90
  },
  {
    id: 'earth-alliance-news',
    name: 'Earth Alliance News',
    description: 'Strategic intelligence briefs and alliance-aligned situational updates',
    endpoint: EARTH_ALLIANCE_NEWS_API,
    homepage: 'https://earthalliance.news/',
    normalizer: 'normalizeEarthAllianceNews',
    refreshInterval: 900000, // 15 minutes
    enabled: isSourceEnabled('earth-alliance-news', true),
    tags: ['earth-alliance', 'intel', 'operations', 'security'],
    healthScore: 87
  },
  {
    id: 'krebs-security',
    name: 'Krebs on Security',
    description: 'Cybercrime investigations and threat intelligence reporting by Brian Krebs',
    endpoint: INVESTIGATIVE_RSS_API,
    homepage: 'https://krebsonsecurity.com/',
    normalizer: 'normalizeCyberSecurityRSS',
    refreshInterval: 1800000, // 30 minutes
    enabled: isSourceEnabled('krebs-security', true),
    tags: ['cybersecurity', 'krebs', 'threat-intel', 'osint'],
    healthScore: 88
  },
  {
    id: 'threatpost-security',
    name: 'Threatpost Security Briefings',
    description: 'Emerging vulnerabilities, zero-days, and threat actor activity from Threatpost',
    endpoint: INVESTIGATIVE_RSS_API,
    homepage: 'https://threatpost.com/',
    normalizer: 'normalizeCyberSecurityRSS',
    refreshInterval: 1800000, // 30 minutes
    enabled: isSourceEnabled('threatpost-security', true),
    tags: ['cybersecurity', 'threatpost', 'threat-intel', 'security'],
    healthScore: 85
  },
  {
    id: 'wired-security',
    name: 'WIRED Security',
    description: 'Security, privacy, and surveillance analysis from WIRED magazine',
    endpoint: INVESTIGATIVE_RSS_API,
    homepage: 'https://www.wired.com/category/security/',
    normalizer: 'normalizeCyberSecurityRSS',
    refreshInterval: 1800000, // 30 minutes
    enabled: isSourceEnabled('wired-security', true),
    tags: ['cybersecurity', 'wired', 'technology', 'privacy'],
    healthScore: 84
  },
  {
    id: 'grayzone-geopolitics',
    name: 'The Grayzone',
    description: 'Investigations into hybrid warfare, propaganda, and covert operations',
    endpoint: INVESTIGATIVE_RSS_API,
    homepage: 'https://thegrayzone.com/',
    normalizer: 'normalizeGeopoliticalRSS',
    refreshInterval: 1800000, // 30 minutes
    enabled: isSourceEnabled('grayzone-geopolitics', true),
    tags: ['geopolitics', 'grayzone', 'hybrid-warfare', 'analysis'],
    healthScore: 83
  },
  {
    id: 'mintpress-geopolitics',
    name: 'MintPress News',
    description: 'Foreign policy investigations and censorship coverage from MintPress',
    endpoint: INVESTIGATIVE_RSS_API,
    homepage: 'https://www.mintpressnews.com/',
    normalizer: 'normalizeGeopoliticalRSS',
    refreshInterval: 1800000, // 30 minutes
    enabled: isSourceEnabled('mintpress-geopolitics', true),
    tags: ['geopolitics', 'mintpress', 'foreign-policy', 'analysis'],
    healthScore: 82
  },
  {
    id: 'geopolitical-economy-report',
    name: 'Geopolitical Economy Report',
    description: 'Multipolar economic analysis and statecraft reporting',
    endpoint: INVESTIGATIVE_RSS_API,
    homepage: 'https://geopoliticaleconomy.com/',
    normalizer: 'normalizeGeopoliticalRSS',
    refreshInterval: 1800000, // 30 minutes
    enabled: isSourceEnabled('geopolitical-economy-report', true),
    tags: ['geopolitics', 'economics', 'multipolar', 'analysis'],
    healthScore: 82
  },
  {
    id: 'eff-updates',
    name: 'Electronic Frontier Foundation Updates',
    description: 'Civil liberties, privacy defense, and anti-surveillance campaigns from EFF',
    endpoint: INVESTIGATIVE_RSS_API,
    homepage: 'https://www.eff.org/',
    normalizer: 'normalizePrivacyAdvocacyRSS',
    refreshInterval: 1800000, // 30 minutes
    enabled: isSourceEnabled('eff-updates', true),
    tags: ['privacy', 'civil-liberties', 'eff', 'surveillance'],
    healthScore: 90
  },
  {
    id: 'privacy-international',
    name: 'Privacy International',
    description: 'Global advocacy against surveillance and biometric overreach',
    endpoint: INVESTIGATIVE_RSS_API,
    homepage: 'https://privacyinternational.org/',
    normalizer: 'normalizePrivacyAdvocacyRSS',
    refreshInterval: 1800000, // 30 minutes
    enabled: isSourceEnabled('privacy-international', true),
    tags: ['privacy', 'surveillance', 'civil-rights', 'advocacy'],
    healthScore: 88
  },
  {
    id: 'opensecrets-transparency',
    name: 'OpenSecrets Investigations',
    description: 'Campaign finance, lobbying, and dark money analysis from OpenSecrets',
    endpoint: INVESTIGATIVE_RSS_API,
    homepage: 'https://www.opensecrets.org/news/',
    normalizer: 'normalizeOpenSecretsNews',
    refreshInterval: 3600000, // 60 minutes
    enabled: isSourceEnabled('opensecrets-transparency', true),
    tags: ['financial', 'transparency', 'campaign-finance', 'anti-corruption'],
    healthScore: 83
  },
  {
    id: 'transparency-international',
    name: 'Transparency International',
    description: 'Global corruption indices and accountability briefings',
    endpoint: INVESTIGATIVE_RSS_API,
    homepage: 'https://www.transparency.org/',
    normalizer: 'normalizeFinancialTransparencyRSS',
    refreshInterval: 3600000, // 60 minutes
    enabled: isSourceEnabled('transparency-international', true),
    tags: ['anti-corruption', 'transparency', 'governance', 'accountability'],
    healthScore: 85
  },
  {
    id: 'inside-climate-news',
    name: 'Inside Climate News',
    description: 'Investigative climate journalism and environmental policy coverage',
    endpoint: INVESTIGATIVE_RSS_API,
    homepage: 'https://insideclimatenews.org/',
    normalizer: 'normalizeClimateResilienceRSS',
    refreshInterval: 1800000, // 30 minutes
    enabled: isSourceEnabled('inside-climate-news', true),
    tags: ['climate', 'environment', 'resilience', 'policy'],
    healthScore: 87
  },
  {
    id: 'guardian-environment',
    name: 'The Guardian Environment',
    description: 'Global climate justice and biodiversity reporting from The Guardian',
    endpoint: INVESTIGATIVE_RSS_API,
    homepage: 'https://www.theguardian.com/environment',
    normalizer: 'normalizeClimateResilienceRSS',
    refreshInterval: 1800000, // 30 minutes
    enabled: isSourceEnabled('guardian-environment', true),
    tags: ['climate', 'environment', 'guardian', 'policy'],
    healthScore: 86
  },
  {
    id: 'future-of-life-institute',
    name: 'Future of Life Institute',
    description: 'AI safety and emerging technology governance research from FLI',
    endpoint: INVESTIGATIVE_RSS_API,
    homepage: 'https://futureoflife.org/',
    normalizer: 'normalizeAIGovernanceRSS',
    refreshInterval: 3600000, // 60 minutes
    enabled: isSourceEnabled('future-of-life-institute', true),
    tags: ['ai', 'ethics', 'governance', 'fli'],
    healthScore: 84
  }
];

// TDD_ERROR_001: Verify sources array is defined and populated
if (!PRIMARY_INTELLIGENCE_SOURCES) {
  TDD_ERRORS.logError('001', 'ModernIntelligenceSources.PRIMARY_INTELLIGENCE_SOURCES', 'PRIMARY_INTELLIGENCE_SOURCES is undefined');
} else if (PRIMARY_INTELLIGENCE_SOURCES.length === 0) {
  TDD_ERRORS.logError('002', 'ModernIntelligenceSources.PRIMARY_INTELLIGENCE_SOURCES', 'PRIMARY_INTELLIGENCE_SOURCES is empty array');
} else {
  console.log('TDD_LOG_001: PRIMARY_INTELLIGENCE_SOURCES loaded successfully', {
    count: PRIMARY_INTELLIGENCE_SOURCES.length,
    sources: PRIMARY_INTELLIGENCE_SOURCES.map(s => ({ id: s.id, name: s.name, enabled: s.enabled }))
  });
}

// TDD_ERROR_003-007: Validate each source configuration
PRIMARY_INTELLIGENCE_SOURCES.forEach((source, index) => {
  if (!source.id) {
    TDD_ERRORS.logError(`003_${index}`, 'ModernIntelligenceSources.source.id', `Source at index ${index} missing id`, source);
  }
  if (!source.endpoint) {
    TDD_ERRORS.logError(`004_${index}`, 'ModernIntelligenceSources.source.endpoint', `Source ${source.id} missing endpoint`, source);
  }
  if (!source.normalizer) {
    TDD_ERRORS.logError(`005_${index}`, 'ModernIntelligenceSources.source.normalizer', `Source ${source.id} missing normalizer`, source);
  }
  if (!source.enabled) {
    console.warn(`TDD_WARN_${index}: Source ${source.id} is disabled`);
  }
  if (!source.endpoint?.baseUrl) {
    TDD_ERRORS.logError(`006_${index}`, 'ModernIntelligenceSources.source.endpoint.baseUrl', `Source ${source.id} missing baseUrl`, source.endpoint);
  }
  if (!source.endpoint?.endpoints) {
    TDD_ERRORS.logError(`007_${index}`, 'ModernIntelligenceSources.source.endpoint.endpoints', `Source ${source.id} missing endpoints`, source.endpoint);
  }
});

/**
 * Secondary Intelligence Sources - Require API keys but available
 */
export const SECONDARY_INTELLIGENCE_SOURCES: IntelligenceSource[] = [
  {
    id: 'nasa-space-data',
    name: 'NASA Space Intelligence',
    description: 'Space missions, astronomical events, and NASA updates',
    endpoint: NASA_API,
    normalizer: 'normalizeNASAAPOD',
    refreshInterval: 86400000, // Daily
    enabled: isSourceEnabled('nasa-space-data', false), // Requires API key
    tags: ['space', 'nasa', 'astronomy', 'science'],
    healthScore: 100
  }
];

/**
 * Social Intelligence Sources - High volume, lower trust
 */
export const SOCIAL_INTELLIGENCE_SOURCES: IntelligenceSource[] = [
  {
    id: 'reddit-worldnews',
    name: 'Reddit World News',
    description: 'Breaking news and discussions from Reddit WorldNews',
    endpoint: REDDIT_API,
    normalizer: 'normalizeRedditPosts',
    refreshInterval: 900000, // 15 minutes
    enabled: isSourceEnabled('reddit-worldnews', true),
    tags: ['news', 'discussion', 'social', 'breaking'],
    healthScore: 70
  },
  {
    id: 'reddit-security',
    name: 'Reddit Security',
    description: 'Security discussions and alerts from Reddit security communities',
    endpoint: REDDIT_API,
    normalizer: 'normalizeRedditPosts',
    refreshInterval: 1800000, // 30 minutes
    enabled: isSourceEnabled('reddit-security', true),
    tags: ['security', 'discussion', 'cybersecurity', 'threats'],
    healthScore: 75
  }
];

/**
 * All Intelligence Sources Combined
 */
export const ALL_INTELLIGENCE_SOURCES = [
  ...PRIMARY_INTELLIGENCE_SOURCES,
  ...SECONDARY_INTELLIGENCE_SOURCES,
  ...SOCIAL_INTELLIGENCE_SOURCES
];

/**
 * Default Intelligence Configuration
 * Sources that are enabled by default for new installations
 */
export interface IntelligenceModeConfig {
  primarySources: IntelligenceSource[];
  refreshIntervals: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  maxConcurrentRequests: number;
  cacheEnabled: boolean;
  defaultCacheAge: number;
  retryAttempts: number;
  timeout: number;
}

export const DEFAULT_INTELLIGENCE_CONFIG: IntelligenceModeConfig = {
  primarySources: PRIMARY_INTELLIGENCE_SOURCES.filter(source => source.enabled),
  refreshIntervals: {
    critical: 300000,    // 5 minutes
    high: 600000,        // 10 minutes
    medium: 1800000,     // 30 minutes
    low: 3600000         // 1 hour
  },
  maxConcurrentRequests: 5,
  cacheEnabled: true,
  defaultCacheAge: 300000, // 5 minutes
  retryAttempts: 3,
  timeout: 10000 // 10 seconds
};

/**
 * Intelligence Source Categories for UI Organization
 */
export const SOURCE_CATEGORIES = {
  GOVERNMENT: {
    name: 'Government & Official',
    description: 'Official government sources and agencies',
    sources: ['noaa-weather-alerts', 'usgs-earthquakes', 'nasa-space-data'],
    trustLevel: 'high',
    icon: '🏛️'
  },
  SECURITY: {
    name: 'Security & Threats',
    description: 'Cybersecurity, vulnerabilities, and threat intelligence',
    sources: ['github-security', 'reddit-security', 'earth-alliance-news', 'krebs-security', 'threatpost-security', 'wired-security'],
    trustLevel: 'high',
    icon: '🛡️'
  },
  TECHNOLOGY: {
    name: 'Technology & Innovation',
    description: 'Tech news, innovations, and industry updates',
    sources: ['hackernews-tech'],
    trustLevel: 'medium',
    icon: '💻'
  },
  FINANCIAL: {
    name: 'Financial & Markets',
    description: 'Market data, anti-corruption finance, and economic indicators',
    sources: ['coingecko-crypto', 'opensecrets-transparency', 'transparency-international'],
    trustLevel: 'medium',
    icon: '📈'
  },
  SOCIAL: {
    name: 'Social Intelligence',
    description: 'Social media discussions and crowd-sourced intelligence',
    sources: ['reddit-worldnews', 'reddit-security'],
    trustLevel: 'low',
    icon: '👥'
  },
  INVESTIGATIVE: {
    name: 'Investigative Leaks',
    description: 'Investigative journalism outlets focused on transparency and accountability',
    sources: ['intercept-investigations', 'propublica-investigations', 'icij-investigations', 'bellingcat-investigations', 'ddosecrets-investigations', 'occrp-investigations'],
    trustLevel: 'high',
    icon: '🕵️'
  },
  GEOPOLITICS: {
    name: 'Geopolitical Intelligence',
    description: 'Hybrid warfare, foreign policy, and statecraft investigations',
    sources: ['grayzone-geopolitics', 'mintpress-geopolitics', 'geopolitical-economy-report'],
    trustLevel: 'medium',
    icon: '🌐'
  },
  PRIVACY: {
    name: 'Civil Liberties & Privacy',
    description: 'Advocacy against surveillance and biometric overreach',
    sources: ['eff-updates', 'privacy-international'],
    trustLevel: 'high',
    icon: '🕶️'
  },
  CLIMATE: {
    name: 'Climate & Resilience',
    description: 'Climate justice, resilience planning, and environmental accountability',
    sources: ['inside-climate-news', 'guardian-environment'],
    trustLevel: 'medium',
    icon: '🌿'
  },
  AI_ETHICS: {
    name: 'AI Governance & Ethics',
    description: 'Research on safe, ethical, and human-centric artificial intelligence',
    sources: ['future-of-life-institute'],
    trustLevel: 'medium',
    icon: '🤖'
  }
};

/**
 * Utility Functions
 */
export const getSourcesByCategory = (category: string): IntelligenceSource[] => {
  const categoryConfig = Object.values(SOURCE_CATEGORIES).find(cat => 
    cat.name.toLowerCase().includes(category.toLowerCase())
  );
  
  if (!categoryConfig) return [];
  
  return ALL_INTELLIGENCE_SOURCES.filter(source =>
    categoryConfig.sources.includes(source.id)
  );
};

/**
 * Configuration for different deployment environments
 */
export const ENVIRONMENT_CONFIGS = {
  development: {
    enabledSources: PRIMARY_INTELLIGENCE_SOURCES.slice(0, 3), // Limit for dev
    refreshIntervals: { ...DEFAULT_INTELLIGENCE_CONFIG.refreshIntervals },
    debugMode: true
  },
  production: {
    enabledSources: PRIMARY_INTELLIGENCE_SOURCES,
    refreshIntervals: DEFAULT_INTELLIGENCE_CONFIG.refreshIntervals,
    debugMode: false
  },
  demo: {
    enabledSources: PRIMARY_INTELLIGENCE_SOURCES.slice(0, 2), // Minimal for demo
    refreshIntervals: {
      critical: 600000,  // Slower refresh for demo
      high: 1800000,
      medium: 3600000,
      low: 7200000
    },
    debugMode: false
  }
};

/**
 * Migration mapping from RSS feeds to modern APIs
 * Used for transitioning existing feed configurations
 */
export const RSS_TO_API_MIGRATION: Record<string, string> = {
  'cnn-rss': 'reddit-worldnews',
  'bbc-rss': 'reddit-worldnews', 
  'reuters-rss': 'reddit-worldnews',
  'weather-rss': 'noaa-weather-alerts',
  'security-rss': 'github-security',
  'tech-rss': 'hackernews-tech',
  'crypto-rss': 'coingecko-crypto'
};
