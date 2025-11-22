import { IntelligenceSource } from '../types/ModernAPITypes';
import { isSourceEnabled } from '../utils/FeatureFlagUtil';
import {
  INVESTIGATIVE_RSS_API,
  NASA_API,
  NOAA_WEATHER_API,
  REDDIT_API
} from './APIEndpoints';
import { IntelligenceModeConfig, PRIMARY_INTELLIGENCE_SOURCES } from './ModernIntelligenceSources';

const clonePrimarySource = (
  sourceId: string,
  overrides: Partial<IntelligenceSource> = {}
): IntelligenceSource => {
  const base = PRIMARY_INTELLIGENCE_SOURCES.find(source => source.id === sourceId);
  if (!base) {
    throw new Error(`SpaceForce catalog attempted to clone unknown source: ${sourceId}`);
  }

  return {
    ...base,
    ...overrides
  };
};

export const SPACEFORCE_PRIMARY_INTELLIGENCE_SOURCES: IntelligenceSource[] = [
  {
    id: 'spaceforce-launch-watch',
    name: 'Launch Watch Network',
    description: 'Aggregated launch manifests, active countdowns, and anomaly alerts.',
    endpoint: INVESTIGATIVE_RSS_API,
    normalizer: 'normalizeSpaceLaunchRSS',
    refreshInterval: 900000,
    enabled: isSourceEnabled('spaceforce-launch-watch', true),
    tags: ['space', 'launch', 'orbital', 'missions'],
    healthScore: 94
  },
  {
    id: 'spaceforce-space-weather',
    name: 'Space Weather Alerts',
    description: 'Solar storms, geomagnetic disturbances, and CME trajectories from SWPC.',
    endpoint: NOAA_WEATHER_API,
    normalizer: 'normalizeNOAAAlert',
    refreshInterval: 600000,
    enabled: isSourceEnabled('spaceforce-space-weather', true),
    tags: ['space', 'solar', 'swpc', 'alerts'],
    healthScore: 92
  },
  clonePrimarySource('nasa-news-releases'),
  clonePrimarySource('spacenews-policy'),
  clonePrimarySource('esa-space-news'),
  clonePrimarySource('spacecom-latest'),
  clonePrimarySource('launch-library-upcoming')
];

export const SPACEFORCE_SECONDARY_INTELLIGENCE_SOURCES: IntelligenceSource[] = [
  {
    id: 'spaceforce-deep-space-network',
    name: 'Deep Space Network Telemetry',
    description: 'Mission telemetry digests from the Deep Space Network.',
    endpoint: NASA_API,
  normalizer: 'normalizeNASADSNStatus',
    refreshInterval: 1800000,
    enabled: isSourceEnabled('spaceforce-deep-space-network', false),
    tags: ['space', 'telemetry', 'deep-space', 'signals'],
    healthScore: 85
  },
  clonePrimarySource('dod-war-news', {
    enabled: isSourceEnabled('dod-war-news', true),
    tags: ['defense', 'dod', 'spaceforce-aligned']
  }),
  clonePrimarySource('breaking-defense', {
    enabled: isSourceEnabled('breaking-defense', true),
    tags: ['defense', 'acquisition', 'spaceforce']
  }),
  clonePrimarySource('c4isrnet-ops', {
    enabled: isSourceEnabled('c4isrnet-ops', true),
    tags: ['c4isr', 'signals', 'spaceforce']
  })
];

export const SPACEFORCE_SOCIAL_INTELLIGENCE_SOURCES: IntelligenceSource[] = [
  {
    id: 'spaceforce-reddit-space',
    name: 'Reddit Space Intel',
    description: 'High-signal posts from r/space and r/SpaceXLounge.',
    endpoint: REDDIT_API,
    normalizer: 'normalizeRedditPosts',
    refreshInterval: 600000,
    enabled: isSourceEnabled('spaceforce-reddit-space', true),
    tags: ['space', 'community', 'social', 'alerts'],
    healthScore: 75
  }
];

export const SPACEFORCE_INTELLIGENCE_CONFIG: IntelligenceModeConfig = {
  primarySources: SPACEFORCE_PRIMARY_INTELLIGENCE_SOURCES.filter(source => source.enabled),
  refreshIntervals: {
    critical: 300000,
    high: 900000,
    medium: 1800000,
    low: 3600000
  },
  maxConcurrentRequests: 5,
  cacheEnabled: true,
  defaultCacheAge: 300000,
  retryAttempts: 3,
  timeout: 15000
};
