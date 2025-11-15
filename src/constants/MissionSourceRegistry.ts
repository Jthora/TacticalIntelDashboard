import { IntelligenceSource } from '../types/ModernAPITypes';
import { SourceToggleStore } from '../utils/SourceToggleStore';
import { MissionMode } from './MissionMode';
import {
  DEFAULT_INTELLIGENCE_CONFIG,
  IntelligenceModeConfig,
  PRIMARY_INTELLIGENCE_SOURCES,
  SECONDARY_INTELLIGENCE_SOURCES,
  SOCIAL_INTELLIGENCE_SOURCES
} from './ModernIntelligenceSources';
import {
  SPACEFORCE_INTELLIGENCE_CONFIG,
  SPACEFORCE_PRIMARY_INTELLIGENCE_SOURCES,
  SPACEFORCE_SECONDARY_INTELLIGENCE_SOURCES,
  SPACEFORCE_SOCIAL_INTELLIGENCE_SOURCES
} from './SpaceForceIntelligenceSources';

export interface SourceCatalog {
  mode: MissionMode;
  primary: IntelligenceSource[];
  secondary: IntelligenceSource[];
  social: IntelligenceSource[];
  defaultConfig: IntelligenceModeConfig;
}

const catalogMap: Record<MissionMode, SourceCatalog> = {
  [MissionMode.MILTECH]: {
    mode: MissionMode.MILTECH,
    primary: PRIMARY_INTELLIGENCE_SOURCES,
    secondary: SECONDARY_INTELLIGENCE_SOURCES,
    social: SOCIAL_INTELLIGENCE_SOURCES,
    defaultConfig: DEFAULT_INTELLIGENCE_CONFIG
  },
  [MissionMode.SPACEFORCE]: {
    mode: MissionMode.SPACEFORCE,
    primary: SPACEFORCE_PRIMARY_INTELLIGENCE_SOURCES,
    secondary: SPACEFORCE_SECONDARY_INTELLIGENCE_SOURCES,
    social: SPACEFORCE_SOCIAL_INTELLIGENCE_SOURCES,
    defaultConfig: SPACEFORCE_INTELLIGENCE_CONFIG
  }
};

const flattenCatalog = (catalog: SourceCatalog): IntelligenceSource[] => [
  ...catalog.primary,
  ...catalog.secondary,
  ...catalog.social
];

const mapWithOverrides = (mode: MissionMode): IntelligenceSource[] => {
  const overrides = SourceToggleStore.getOverrides(mode);
  const catalog = catalogMap[mode];

  return flattenCatalog(catalog).map(source => {
    const override = overrides[source.id];
    return typeof override === 'boolean'
      ? { ...source, enabled: override }
      : { ...source };
  });
};

export const getSourceCatalog = (mode: MissionMode): SourceCatalog => catalogMap[mode];

export const getSourcesWithRuntimeState = (mode: MissionMode): IntelligenceSource[] => mapWithOverrides(mode);

export const getEnabledSources = (mode: MissionMode): IntelligenceSource[] =>
  getSourcesWithRuntimeState(mode).filter(source => source.enabled);

export const getSourceById = (mode: MissionMode, id: string): IntelligenceSource | undefined =>
  getSourcesWithRuntimeState(mode).find(source => source.id === id);

export const getAllSources = (mode: MissionMode): IntelligenceSource[] => flattenCatalog(catalogMap[mode]);

export const getDefaultIntelligenceConfig = (mode: MissionMode): IntelligenceModeConfig =>
  catalogMap[mode].defaultConfig;
