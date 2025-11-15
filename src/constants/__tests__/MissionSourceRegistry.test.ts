import { MissionMode } from '../MissionMode';
import {
  getSourceCatalog,
  getSourcesWithRuntimeState,
  getSourceById,
  getDefaultIntelligenceConfig
} from '../MissionSourceRegistry';
import {
  PRIMARY_INTELLIGENCE_SOURCES,
  DEFAULT_INTELLIGENCE_CONFIG
} from '../ModernIntelligenceSources';
import {
  SPACEFORCE_PRIMARY_INTELLIGENCE_SOURCES,
  SPACEFORCE_INTELLIGENCE_CONFIG
} from '../SpaceForceIntelligenceSources';
import { SourceToggleStore } from '../../utils/SourceToggleStore';
import { setStorageAdapter } from '../../utils/LocalStorageUtil';

describe('MissionSourceRegistry', () => {
  const createMemoryAdapter = () => {
    const store = new Map<string, string>();
    return {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => {
        store.clear();
      }
    };
  };

  beforeEach(() => {
    setStorageAdapter(createMemoryAdapter());
    SourceToggleStore.resetAll();
    SourceToggleStore.setActiveMode(MissionMode.MILTECH);
  });

  test('returns catalog data for each mission', () => {
    const miltechCatalog = getSourceCatalog(MissionMode.MILTECH);
    const spaceCatalog = getSourceCatalog(MissionMode.SPACEFORCE);

    expect(miltechCatalog.primary).toBe(PRIMARY_INTELLIGENCE_SOURCES);
    expect(miltechCatalog.defaultConfig).toBe(DEFAULT_INTELLIGENCE_CONFIG);

    expect(spaceCatalog.primary).toBe(SPACEFORCE_PRIMARY_INTELLIGENCE_SOURCES);
    expect(spaceCatalog.defaultConfig).toBe(SPACEFORCE_INTELLIGENCE_CONFIG);
  });

  test('getSourceById respects mission namespace', () => {
    const milId = PRIMARY_INTELLIGENCE_SOURCES[0].id;
    const spaceId = SPACEFORCE_PRIMARY_INTELLIGENCE_SOURCES[0].id;

    expect(getSourceById(MissionMode.MILTECH, milId)?.id).toBe(milId);
    expect(getSourceById(MissionMode.SPACEFORCE, spaceId)?.id).toBe(spaceId);
    expect(getSourceById(MissionMode.SPACEFORCE, milId)?.id).not.toBe(milId);
  });

  test('runtime state reflects toggle overrides per mode', () => {
    const targetId = SPACEFORCE_PRIMARY_INTELLIGENCE_SOURCES[0].id;
    SourceToggleStore.setOverride(targetId, false, MissionMode.SPACEFORCE);

    const runtimeSources = getSourcesWithRuntimeState(MissionMode.SPACEFORCE);
    const overridden = runtimeSources.find(source => source.id === targetId);
    expect(overridden?.enabled).toBe(false);

    const miltechRuntime = getSourcesWithRuntimeState(MissionMode.MILTECH);
    const milMatch = miltechRuntime.find(source => source.id === targetId);
    expect(milMatch?.enabled).not.toBe(false);
  });

  test('default config helper mirrors catalog defaults', () => {
    expect(getDefaultIntelligenceConfig(MissionMode.MILTECH)).toBe(DEFAULT_INTELLIGENCE_CONFIG);
    expect(getDefaultIntelligenceConfig(MissionMode.SPACEFORCE)).toBe(SPACEFORCE_INTELLIGENCE_CONFIG);
  });
});
