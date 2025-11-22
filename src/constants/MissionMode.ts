import type { Theme } from '../contexts/ThemeContext';

export enum MissionMode {
  MILTECH = 'MILTECH',
  SPACEFORCE = 'SPACEFORCE'
}

export const DEFAULT_MISSION_MODE = MissionMode.SPACEFORCE;

export const getMissionAggregateFeedId = (mode: MissionMode): string => `${mode.toLowerCase()}-intel-feed`;

export interface MissionModeProfile {
  id: MissionMode;
  label: string;
  tagline: string;
  description: string;
  defaultTheme: Theme;
  defaultFeedListId: string;
  marqueeMessage: string;
  analyticsTag: string;
  accentColor: string;
  badge: string;
}

export const missionModeProfiles: Record<MissionMode, MissionModeProfile> = {
  [MissionMode.MILTECH]: {
    id: MissionMode.MILTECH,
    label: 'MilTech Command',
    tagline: 'Cyber defense + investigative intelligence.',
    description: 'Focus on hybrid warfare, cyber defense, and investigative journalism feeds.',
    defaultTheme: 'combat',
    defaultFeedListId: getMissionAggregateFeedId(MissionMode.MILTECH),
    marqueeMessage: 'MilTech mode active — monitoring hybrid warfare and investigative feeds.',
    analyticsTag: 'miltech_mode',
    accentColor: '#00ffaa',
    badge: '⚔️'
  },
  [MissionMode.SPACEFORCE]: {
    id: MissionMode.SPACEFORCE,
    label: 'SpaceForce Command',
    tagline: 'Orbital events + space domain awareness.',
    description: 'Space launch telemetry, orbital debris alerts, and solar weather situational awareness.',
    defaultTheme: 'spaceforce',
    defaultFeedListId: getMissionAggregateFeedId(MissionMode.SPACEFORCE),
    marqueeMessage: 'SpaceForce mode active — monitoring launches, anomalies, and solar storms.',
    analyticsTag: 'spaceforce_mode',
    accentColor: '#19d7ff',
    badge: '🚀'
  }
};

export const getMissionModeProfile = (mode: MissionMode): MissionModeProfile => missionModeProfiles[mode];

const LEGACY_AGGREGATE_FEED_IDS = ['modern-api', '1', 'primary-intel', 'security-feeds'];

export const getAllMissionAggregateFeedIds = (): string[] =>
  Object.values(missionModeProfiles).map(profile => profile.defaultFeedListId);

export const isAggregateFeedId = (feedListId: string | null | undefined, mode?: MissionMode): boolean => {
  if (!feedListId) {
    return false;
  }

  if (LEGACY_AGGREGATE_FEED_IDS.includes(feedListId)) {
    return true;
  }

  const normalizedId = feedListId.trim().toLowerCase();
  if (mode && normalizedId === getMissionAggregateFeedId(mode).toLowerCase()) {
    return true;
  }

  return getAllMissionAggregateFeedIds().some(id => id.toLowerCase() === normalizedId);
};
