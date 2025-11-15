import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';

import { getModernIntelligenceSourcesAsLegacy } from '../adapters/ModernIntelSourcesAdapter';
import { DEFAULT_MISSION_MODE, MissionMode, MissionModeProfile, getMissionModeProfile, missionModeProfiles } from '../constants/MissionMode';
import { modernFeedService } from '../services/ModernFeedService';
import { useIntelligence } from './IntelligenceContext';
import { useSettings } from './SettingsContext';
import { useTheme } from './ThemeContext';
import { logTelemetryEvent } from '../utils/TelemetryService';

export interface SetMissionModeOptions {
  persist?: boolean;
  reason?: string;
}

interface MissionModeContextValue {
  mode: MissionMode;
  profile: MissionModeProfile;
  setMode: (mode: MissionMode, options?: SetMissionModeOptions) => void;
  availableModes: MissionModeProfile[];
}

const MissionModeContext = createContext<MissionModeContextValue | undefined>(undefined);

export const MissionModeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { settings, updateSettings } = useSettings();
  const { actions: intelActions } = useIntelligence();
  const { applyModeTheme } = useTheme();
  const initialMode = settings.general?.mode ?? DEFAULT_MISSION_MODE;
  const [mode, setModeState] = useState<MissionMode>(initialMode);
  const persistPreferenceRef = useRef(true);
  const lastChangeMetaRef = useRef<{ from: MissionMode; to: MissionMode; reason?: string }>({
    from: initialMode,
    to: initialMode,
    reason: 'initial-load'
  });
  const hasMountedRef = useRef(false);

  const setModeWithOptions = useCallback((nextMode: MissionMode, options?: SetMissionModeOptions) => {
    setModeState(prevMode => {
      persistPreferenceRef.current = options?.persist ?? true;
      const nextMeta: { from: MissionMode; to: MissionMode; reason?: string } = {
        from: prevMode,
        to: nextMode
      };
      if (options?.reason) {
        nextMeta.reason = options.reason;
      }
      lastChangeMetaRef.current = nextMeta;

      if (prevMode === nextMode) {
        return prevMode;
      }

      return nextMode;
    });
  }, []);

  // Keep local state in sync with persisted settings
  useEffect(() => {
    const settingsMode = settings.general?.mode;
    if (!settingsMode) {
      return;
    }

    setModeState(prevMode => (prevMode === settingsMode ? prevMode : settingsMode));
  }, [settings.general?.mode]);

  useEffect(() => {
    const profile = getMissionModeProfile(mode);

    modernFeedService.setMissionMode(mode);
    document.documentElement.setAttribute('data-mode', mode.toLowerCase());
    if (document.body) {
      document.body.setAttribute('data-mode', mode.toLowerCase());
    }

    applyModeTheme(profile.defaultTheme);

    intelActions.resetState();
    const defaultSources = getModernIntelligenceSourcesAsLegacy(mode);
    defaultSources.forEach(source => intelActions.addSource(source));

    const shouldPersist = persistPreferenceRef.current;
    const changeMeta = lastChangeMetaRef.current;

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      persistPreferenceRef.current = true;
      return;
    }

    if (shouldPersist && settings.general?.mode !== mode) {
      updateSettings({
        general: {
          ...settings.general!,
          mode
        }
      });
    }

    logTelemetryEvent('mission_mode_changed', {
      from: changeMeta.from,
      to: changeMeta.to,
      persisted: shouldPersist,
      reason: changeMeta.reason ?? 'unspecified'
    });

    persistPreferenceRef.current = true;

  }, [mode, applyModeTheme, intelActions, settings.general, updateSettings]);

  const value = useMemo<MissionModeContextValue>(() => ({
    mode,
    profile: getMissionModeProfile(mode),
    setMode: setModeWithOptions,
    availableModes: Object.values(missionModeProfiles)
  }), [mode, setModeWithOptions]);

  return (
    <MissionModeContext.Provider value={value}>
      {children}
    </MissionModeContext.Provider>
  );
};

export const useMissionMode = (): MissionModeContextValue => {
  const context = useContext(MissionModeContext);
  if (!context) {
    throw new Error('useMissionMode must be used within a MissionModeProvider');
  }
  return context;
};
