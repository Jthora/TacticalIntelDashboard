/**
 * Tactical Intelligence Sources
 * Professional intelligence feeds for tactical operations
 * Classification: UNCLASSIFIED
 * Generated on: 2025-07-11
 */

import { TacticalIntelSource, ClassificationLevel, IntelligenceCategory } from '../types/TacticalIntelligence';

// Professional intelligence sources for tactical operations
export const TACTICAL_INTEL_SOURCES: TacticalIntelSource[] = [
  // OSINT - Open Source Intelligence
  {
    id: 'stratfor-worldview',
    name: 'Stratfor Worldview',
    url: 'https://worldview.stratfor.com',
    category: 'OSINT',
    reliability: 9,
    classification: 'CONFIDENTIAL',
    updateFrequency: 15,
    requiresAuth: true,
    authType: 'API_KEY',
    cost: 'premium',
    region: ['GLOBAL'],
    tags: ['geopolitical', 'strategic-intelligence', 'global-analysis'],
    healthStatus: 'operational',
    verificationRequired: true,
    minimumClearance: 'CONFIDENTIAL',
    needToKnow: ['strategic-intelligence'],
    endpoint: 'https://api.stratfor.com/feeds/intelligence',
    protocol: 'API',
    format: 'json'
  },
  
  {
    id: 'janes-defence',
    name: "Jane's Defence Intelligence",
    url: 'https://www.janes.com',
    category: 'TECHINT',
    reliability: 9,
    classification: 'CONFIDENTIAL',
    updateFrequency: 30,
    requiresAuth: true,
    authType: 'API_KEY',
    cost: 'premium',
    region: ['GLOBAL'],
    tags: ['defence-technology', 'weapons-systems', 'military-capabilities'],
    healthStatus: 'operational',
    verificationRequired: true,
    minimumClearance: 'CONFIDENTIAL',
    needToKnow: ['defence-intelligence'],
    endpoint: 'https://api.janes.com/feeds/defence',
    protocol: 'API',
    format: 'json'
  },

  {
    id: 'recorded-future-threat',
    name: 'Recorded Future Threat Intelligence',
    url: 'https://www.recordedfuture.com',
    category: 'CYBINT',
    reliability: 8,
    classification: 'CONFIDENTIAL',
    updateFrequency: 10,
    requiresAuth: true,
    authType: 'API_KEY',
    cost: 'premium',
    region: ['GLOBAL'],
    tags: ['cyber-threats', 'threat-intelligence', 'indicators'],
    healthStatus: 'operational',
    verificationRequired: true,
    minimumClearance: 'CONFIDENTIAL',
    needToKnow: ['cyber-intelligence'],
    endpoint: 'https://api.recordedfuture.com/feeds/threat',
    protocol: 'API',
    format: 'json'
  },

  // GEOINT - Geospatial Intelligence
  {
    id: 'maxar-satellite',
    name: 'Maxar Satellite Intelligence',
    url: 'https://www.maxar.com',
    category: 'GEOINT',
    reliability: 9,
    classification: 'SECRET',
    updateFrequency: 60,
    requiresAuth: true,
    authType: 'API_KEY',
    cost: 'premium',
    region: ['GLOBAL'],
    tags: ['satellite-imagery', 'geospatial-analysis', 'change-detection'],
    healthStatus: 'operational',
    verificationRequired: true,
    minimumClearance: 'SECRET',
    needToKnow: ['geospatial-intelligence'],
    endpoint: 'https://api.maxar.com/feeds/intelligence',
    protocol: 'API',
    format: 'json'
  },

  // Government & Official Sources
  {
    id: 'us-state-alerts',
    name: 'US State Department Security Alerts',
    url: 'https://travel.state.gov',
    category: 'HUMINT',
    reliability: 10,
    classification: 'UNCLASSIFIED',
    updateFrequency: 60,
    requiresAuth: false,
    cost: 'free',
    region: ['GLOBAL'],
    tags: ['travel-security', 'country-conditions', 'threat-warnings'],
    healthStatus: 'operational',
    verificationRequired: false,
    minimumClearance: 'UNCLASSIFIED',
    endpoint: 'https://travel.state.gov/content/travel/en/traveladvisories/api/feed',
    protocol: 'RSS',
    format: 'rss'
  },

  {
    id: 'dhs-cybersecurity',
    name: 'DHS Cybersecurity Advisories',
    url: 'https://www.cisa.gov',
    category: 'CYBINT',
    reliability: 10,
    classification: 'UNCLASSIFIED',
    updateFrequency: 30,
    requiresAuth: false,
    cost: 'free',
    region: ['US'],
    tags: ['cybersecurity', 'vulnerabilities', 'threat-advisories'],
    healthStatus: 'operational',
    verificationRequired: false,
    minimumClearance: 'UNCLASSIFIED',
    endpoint: 'https://www.cisa.gov/cybersecurity-advisories/rss',
    protocol: 'RSS',
    format: 'rss'
  },

  {
    id: 'fbi-ic3-alerts',
    name: 'FBI IC3 Cyber Alerts',
    url: 'https://www.ic3.gov',
    category: 'CYBINT',
    reliability: 10,
    classification: 'UNCLASSIFIED',
    updateFrequency: 120,
    requiresAuth: false,
    cost: 'free',
    region: ['US'],
    tags: ['cyber-crime', 'fraud-alerts', 'threat-warnings'],
    healthStatus: 'operational',
    verificationRequired: false,
    minimumClearance: 'UNCLASSIFIED',
    endpoint: 'https://www.ic3.gov/Media/RSS',
    protocol: 'RSS',
    format: 'rss'
  },

  // SIGINT - Signals Intelligence (Open Sources)
  {
    id: 'flightradar24-military',
    name: 'FlightRadar24 Military Tracking',
    url: 'https://www.flightradar24.com',
    category: 'SIGINT',
    reliability: 7,
    classification: 'UNCLASSIFIED',
    updateFrequency: 5,
    requiresAuth: true,
    authType: 'API_KEY',
    cost: 'premium',
    region: ['GLOBAL'],
    tags: ['aircraft-tracking', 'military-flights', 'air-traffic'],
    healthStatus: 'operational',
    verificationRequired: true,
    minimumClearance: 'UNCLASSIFIED',
    needToKnow: ['air-intelligence'],
    endpoint: 'https://api.flightradar24.com/feeds/military',
    protocol: 'API',
    format: 'json'
  },

  {
    id: 'marine-traffic-security',
    name: 'MarineTraffic Security Feed',
    url: 'https://www.marinetraffic.com',
    category: 'MASINT',
    reliability: 8,
    classification: 'UNCLASSIFIED',
    updateFrequency: 15,
    requiresAuth: true,
    authType: 'API_KEY',
    cost: 'premium',
    region: ['GLOBAL'],
    tags: ['maritime-tracking', 'vessel-intelligence', 'port-security'],
    healthStatus: 'operational',
    verificationRequired: true,
    minimumClearance: 'UNCLASSIFIED',
    needToKnow: ['maritime-intelligence'],
    endpoint: 'https://api.marinetraffic.com/feeds/security',
    protocol: 'API',
    format: 'json'
  },

  // Military Intelligence (Open Sources)
  {
    id: 'defense-news',
    name: 'Defense News Intelligence',
    url: 'https://www.defensenews.com',
    category: 'MILINT',
    reliability: 7,
    classification: 'UNCLASSIFIED',
    updateFrequency: 60,
    requiresAuth: false,
    cost: 'free',
    region: ['GLOBAL'],
    tags: ['defense-industry', 'military-procurement', 'defense-policy'],
    healthStatus: 'operational',
    verificationRequired: false,
    minimumClearance: 'UNCLASSIFIED',
    endpoint: 'https://www.defensenews.com/arc/outboundfeeds/rss/',
    protocol: 'RSS',
    format: 'rss'
  },

  {
    id: 'janes-360',
    name: "Jane's 360 Intelligence",
    url: 'https://www.janes.com',
    category: 'MILINT',
    reliability: 8,
    classification: 'UNCLASSIFIED',
    updateFrequency: 30,
    requiresAuth: true,
    authType: 'API_KEY',
    cost: 'premium',
    region: ['GLOBAL'],
    tags: ['military-analysis', 'defence-intelligence', 'threat-assessment'],
    healthStatus: 'operational',
    verificationRequired: true,
    minimumClearance: 'UNCLASSIFIED',
    needToKnow: ['military-intelligence'],
    endpoint: 'https://api.janes.com/feeds/360',
    protocol: 'API',
    format: 'json'
  },

  // Technical Intelligence
  {
    id: 'nist-cybersecurity',
    name: 'NIST Cybersecurity Framework',
    url: 'https://www.nist.gov',
    category: 'TECHINT',
    reliability: 10,
    classification: 'UNCLASSIFIED',
    updateFrequency: 240,
    requiresAuth: false,
    cost: 'free',
    region: ['US'],
    tags: ['cybersecurity-framework', 'standards', 'technical-guidance'],
    healthStatus: 'operational',
    verificationRequired: false,
    minimumClearance: 'UNCLASSIFIED',
    endpoint: 'https://www.nist.gov/news/rss',
    protocol: 'RSS',
    format: 'rss'
  },

  // Regional Intelligence Sources
  {
    id: 'nato-intelligence',
    name: 'NATO Intelligence Sharing',
    url: 'https://www.nato.int',
    category: 'MILINT',
    reliability: 10,
    classification: 'SECRET',
    updateFrequency: 30,
    requiresAuth: true,
    authType: 'CERTIFICATE',
    cost: 'restricted',
    region: ['NATO'],
    tags: ['alliance-intelligence', 'collective-defense', 'threat-sharing'],
    healthStatus: 'operational',
    verificationRequired: true,
    minimumClearance: 'SECRET',
    needToKnow: ['nato-intelligence'],
    endpoint: 'https://api.nato.int/feeds/intelligence',
    protocol: 'API',
    format: 'json'
  },

  {
    id: 'europol-threat',
    name: 'Europol Threat Assessment',
    url: 'https://www.europol.europa.eu',
    category: 'HUMINT',
    reliability: 9,
    classification: 'CONFIDENTIAL',
    updateFrequency: 120,
    requiresAuth: true,
    authType: 'API_KEY',
    cost: 'restricted',
    region: ['EU'],
    tags: ['organized-crime', 'terrorism', 'threat-assessment'],
    healthStatus: 'operational',
    verificationRequired: true,
    minimumClearance: 'CONFIDENTIAL',
    needToKnow: ['law-enforcement'],
    endpoint: 'https://api.europol.europa.eu/feeds/threat',
    protocol: 'API',
    format: 'json'
  }
];

// Category mappings for source management
export const INTELLIGENCE_CATEGORIES = {
  'OSINT': {
    name: 'Open Source Intelligence',
    description: 'Publicly available information',
    color: '#28a745',
    icon: 'globe'
  },
  'HUMINT': {
    name: 'Human Intelligence',
    description: 'Information from human sources',
    color: '#6f42c1',
    icon: 'users'
  },
  'SIGINT': {
    name: 'Signals Intelligence',
    description: 'Electronic signals and communications',
    color: '#fd7e14',
    icon: 'radio'
  },
  'GEOINT': {
    name: 'Geospatial Intelligence',
    description: 'Geographic and imagery intelligence',
    color: '#20c997',
    icon: 'map'
  },
  'TECHINT': {
    name: 'Technical Intelligence',
    description: 'Technical capabilities and systems',
    color: '#6610f2',
    icon: 'cog'
  },
  'CYBINT': {
    name: 'Cyber Intelligence',
    description: 'Cyber threats and digital intelligence',
    color: '#dc3545',
    icon: 'shield'
  },
  'MILINT': {
    name: 'Military Intelligence',
    description: 'Military capabilities and operations',
    color: '#495057',
    icon: 'star'
  },
  'MASINT': {
    name: 'Measurement and Signature Intelligence',
    description: 'Technical measurements and signatures',
    color: '#e83e8c',
    icon: 'chart-line'
  }
} as const;

// Source reliability ratings
export const RELIABILITY_RATINGS = {
  10: { label: 'Completely Reliable', description: 'No doubt about authenticity', color: '#28a745' },
  9: { label: 'Usually Reliable', description: 'Minor doubt about authenticity', color: '#20c997' },
  8: { label: 'Fairly Reliable', description: 'Doubt about authenticity', color: '#ffc107' },
  7: { label: 'Not Usually Reliable', description: 'Major doubt about authenticity', color: '#fd7e14' },
  6: { label: 'Unreliable', description: 'Lack of authenticity', color: '#dc3545' },
  1: { label: 'Cannot Be Judged', description: 'No basis for evaluation', color: '#6c757d' }
} as const;

// Default source selection for new installations
export const DEFAULT_TACTICAL_SOURCES = [
  'us-state-alerts',
  'dhs-cybersecurity',
  'fbi-ic3-alerts',
  'defense-news',
  'nist-cybersecurity'
];

// Source validation function
export const validateTacticalSource = (source: TacticalIntelSource): string[] => {
  const errors: string[] = [];
  
  if (!source.id || source.id.trim() === '') {
    errors.push('Source ID is required');
  }
  
  if (!source.name || source.name.trim() === '') {
    errors.push('Source name is required');
  }
  
  if (!source.url || !isValidUrl(source.url)) {
    errors.push('Valid source URL is required');
  }
  
  if (!source.endpoint && source.requiresAuth) {
    errors.push('API endpoint is required for authenticated sources');
  }
  
  if (source.reliability < 1 || source.reliability > 10) {
    errors.push('Reliability must be between 1 and 10');
  }
  
  if (source.updateFrequency < 1) {
    errors.push('Update frequency must be at least 1 minute');
  }
  
  return errors;
};

// Helper function to validate URLs
const isValidUrl = (urlString: string): boolean => {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

// Get sources by category
export const getSourcesByCategory = (category: IntelligenceCategory): TacticalIntelSource[] => {
  return TACTICAL_INTEL_SOURCES.filter(source => source.category === category);
};

// Get sources by clearance level
export const getSourcesByClearance = (clearanceLevel: ClassificationLevel): TacticalIntelSource[] => {
  const clearanceLevels = {
    'UNCLASSIFIED': 0,
    'CONFIDENTIAL': 1,
    'SECRET': 2,
    'TOP_SECRET': 3
  };
  
  const userLevel = clearanceLevels[clearanceLevel];
  
  return TACTICAL_INTEL_SOURCES.filter(source => {
    const sourceLevel = clearanceLevels[source.minimumClearance];
    return userLevel >= sourceLevel;
  });
};

// Get free/public sources only
export const getFreeIntelSources = (): TacticalIntelSource[] => {
  return TACTICAL_INTEL_SOURCES.filter(source => source.cost === 'free');
};
