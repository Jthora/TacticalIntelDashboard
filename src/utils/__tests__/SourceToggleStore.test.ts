import { MissionMode } from '../../constants/MissionMode';
import { LocalStorageUtil, setStorageAdapter } from '../../utils/LocalStorageUtil';
import { SourceToggleStore } from '../SourceToggleStore';

describe('SourceToggleStore', () => {
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

  test('returns empty overrides for new modes', () => {
    expect(SourceToggleStore.getOverrides(MissionMode.MILTECH)).toEqual({});
    expect(SourceToggleStore.getOverrides(MissionMode.SPACEFORCE)).toEqual({});
  });

  test('stores overrides per mode without leaking', () => {
    SourceToggleStore.setOverride('mil-source', false, MissionMode.MILTECH);
    SourceToggleStore.setOverride('space-source', true, MissionMode.SPACEFORCE);

    expect(SourceToggleStore.getOverride('mil-source', MissionMode.MILTECH)).toBe(false);
    expect(SourceToggleStore.getOverride('mil-source', MissionMode.SPACEFORCE)).toBeUndefined();
    expect(SourceToggleStore.getOverride('space-source', MissionMode.SPACEFORCE)).toBe(true);
    expect(SourceToggleStore.getOverride('space-source', MissionMode.MILTECH)).toBeUndefined();
  });

  test('setActiveMode influences default operations', () => {
    SourceToggleStore.setActiveMode(MissionMode.SPACEFORCE);
    SourceToggleStore.setOverride('space-only', false);

    expect(SourceToggleStore.getOverride('space-only', MissionMode.SPACEFORCE)).toBe(false);
    expect(SourceToggleStore.getOverride('space-only', MissionMode.MILTECH)).toBeUndefined();
  });

  test('legacy single-map data migrates to miltech namespace', () => {
    LocalStorageUtil.setItem('modernFeedSourceToggles', {
      'legacy-source': false
    } as any);

    const overrides = SourceToggleStore.getOverrides(MissionMode.MILTECH);
    expect(overrides['legacy-source']).toBe(false);
    expect(SourceToggleStore.getOverrides(MissionMode.SPACEFORCE)).toEqual({});
  });

  test('clearMode only wipes the targeted mission', () => {
    SourceToggleStore.setOverride('mil-source', true, MissionMode.MILTECH);
    SourceToggleStore.setOverride('space-source', true, MissionMode.SPACEFORCE);

    SourceToggleStore.clearMode(MissionMode.MILTECH);

    expect(SourceToggleStore.getOverrides(MissionMode.MILTECH)).toEqual({});
    expect(SourceToggleStore.getOverride('space-source', MissionMode.SPACEFORCE)).toBe(true);
  });
});
