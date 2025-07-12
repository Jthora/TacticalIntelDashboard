/**
 * Tactical Intelligence Sources - Compatibility Layer
 * Maps realistic intelligence sources to the old TacticalIntelSource interface
 * for backward compatibility while maintaining verified working sources
 */

import { REALISTIC_INTELLIGENCE_SOURCES, RealisticFeedCategory } from './RealisticIntelligenceSources';
import { TacticalIntelSource, IntelligenceCategory, ClassificationLevel, SourceCost, HealthStatus, AuthType } from '../types/TacticalIntelligence';

// Map realistic sources to tactical intel format
export const TACTICAL_INTEL_SOURCES: TacticalIntelSource[] = REALISTIC_INTELLIGENCE_SOURCES.map(source => ({
  id: source.id,
  name: source.name,
  url: source.url,
  category: mapCategoryToLegacy(source.category),
  reliability: Math.round(source.trustRating / 10), // Convert 0-100 to 0-10 scale
  classification: 'UNCLASSIFIED' as ClassificationLevel,
  updateFrequency: 60,
  requiresAuth: false,
  authType: 'NONE' as AuthType,
  cost: 'free' as SourceCost,
  region: ['GLOBAL'],
  tags: [source.category.toLowerCase().replace(/_/g, '-')],
  healthStatus: (source.verificationStatus === 'VERIFIED' ? 'operational' : 'degraded') as HealthStatus,
  verificationRequired: false,
  minimumClearance: 'UNCLASSIFIED' as ClassificationLevel,
  needToKnow: [],
  endpoint: source.url,
  protocol: 'RSS' as const,
  format: 'xml'
}));

// Map realistic categories to legacy categories
function mapCategoryToLegacy(category: RealisticFeedCategory): IntelligenceCategory {
  switch (category) {
    case RealisticFeedCategory.MAINSTREAM_NEWS:
      return 'OSINT';
    case RealisticFeedCategory.INDEPENDENT_JOURNALISM:
      return 'OSINT';
    case RealisticFeedCategory.ALTERNATIVE_ANALYSIS:
      return 'OSINT';
    case RealisticFeedCategory.TECH_SECURITY:
      return 'TECHINT';
    case RealisticFeedCategory.HEALTH_RESEARCH:
      return 'OSINT';
    case RealisticFeedCategory.CONSCIOUSNESS_RESEARCH:
      return 'OSINT';
    case RealisticFeedCategory.SCIENTIFIC_RESEARCH:
      return 'TECHINT';
    default:
      return 'OSINT';
  }
}

// Intelligence categories mapping
export const INTELLIGENCE_CATEGORIES = {
  OSINT: {
    color: '#00ffaa',
    icon: '📡',
    name: 'Open Source Intelligence',
    description: 'Publicly available information sources'
  },
  TECHINT: {
    color: '#ff6600',
    icon: '🔧',
    name: 'Technical Intelligence',
    description: 'Technology and scientific intelligence'
  },
  HUMINT: {
    color: '#ff3333',
    icon: '👤',
    name: 'Human Intelligence',
    description: 'Human-derived intelligence'
  },
  SIGINT: {
    color: '#0099ff',
    icon: '📻',
    name: 'Signals Intelligence',
    description: 'Communications and electronic intelligence'
  },
  GEOINT: {
    color: '#9933ff',
    icon: '🌍',
    name: 'Geospatial Intelligence',
    description: 'Geographic and location intelligence'
  },
  CYBINT: {
    color: '#ffff00',
    icon: '�',
    name: 'Cyber Intelligence',
    description: 'Cyber security and digital intelligence'
  },
  MILINT: {
    color: '#00ff00',
    icon: '⚔️',
    name: 'Military Intelligence',
    description: 'Military and defense intelligence'
  },
  MASINT: {
    color: '#ff9900',
    icon: '�',
    name: 'Measurement Intelligence',
    description: 'Measurement and signature intelligence'
  }
} as const;

// Re-export types for compatibility
export type { TacticalIntelSource, IntelligenceCategory, ClassificationLevel } from '../types/TacticalIntelligence';
