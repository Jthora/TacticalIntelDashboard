import { DEFAULT_MISSION_MODE, MissionMode } from '../constants/MissionMode';
import { LocalStorageUtil } from './LocalStorageUtil';

export type SourceToggleMap = Record<string, boolean>;

type ModeToggleState = Record<MissionMode, SourceToggleMap>;

const STORAGE_KEY = 'modernFeedSourceToggles';

const createEmptyState = (): ModeToggleState => ({
  [MissionMode.MILTECH]: {},
  [MissionMode.SPACEFORCE]: {}
});

const migrateState = (raw: any): ModeToggleState => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return createEmptyState();
  }

  const hasModeKeys = Object.values(MissionMode).some(mode => raw[mode]);

  if (hasModeKeys) {
    return {
      [MissionMode.MILTECH]: { ...(raw[MissionMode.MILTECH] || {}) },
      [MissionMode.SPACEFORCE]: { ...(raw[MissionMode.SPACEFORCE] || {}) }
    };
  }

  return {
    [MissionMode.MILTECH]: { ...raw },
    [MissionMode.SPACEFORCE]: {}
  };
};

const readState = (): ModeToggleState => {
  const stored = LocalStorageUtil.getItem<ModeToggleState>(STORAGE_KEY);
  return migrateState(stored);
};

const writeState = (state: ModeToggleState): void => {
  LocalStorageUtil.setItem(STORAGE_KEY, state);
};

let currentMode: MissionMode = DEFAULT_MISSION_MODE;

const getModeState = (mode: MissionMode): SourceToggleMap => {
  const state = readState();
  return state[mode] || {};
};

const commitModeState = (mode: MissionMode, map: SourceToggleMap): void => {
  const state = readState();
  state[mode] = map;
  writeState(state);
};

export const SourceToggleStore = {
  setActiveMode(mode: MissionMode): void {
    currentMode = mode;
  },

  getOverrides(mode: MissionMode = currentMode): SourceToggleMap {
    return { ...getModeState(mode) };
  },

  getOverride(sourceId: string, mode: MissionMode = currentMode): boolean | undefined {
    const overrides = getModeState(mode);
    return overrides[sourceId];
  },

  setOverride(sourceId: string, enabled: boolean, mode: MissionMode = currentMode): void {
    const overrides = { ...getModeState(mode), [sourceId]: enabled };
    commitModeState(mode, overrides);
  },

  clearOverride(sourceId: string, mode: MissionMode = currentMode): void {
    const overrides = { ...getModeState(mode) };
    if (sourceId in overrides) {
      delete overrides[sourceId];
      commitModeState(mode, overrides);
    }
  },

  clearMode(mode: MissionMode = currentMode): void {
    commitModeState(mode, {});
  },

  resetAll(): void {
    writeState(createEmptyState());
  }
};
