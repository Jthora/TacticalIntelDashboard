import type { Theme } from '../contexts/ThemeContext';

export enum MissionMode {
  MILTECH = 'MILTECH',
  SPACEFORCE = 'SPACEFORCE'
}

export const DEFAULT_MISSION_MODE = MissionMode.SPACEFORCE;

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
    defaultFeedListId: 'modern-api',
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
  defaultFeedListId: 'modern-api',
    marqueeMessage: 'SpaceForce mode active — monitoring launches, anomalies, and solar storms.',
    analyticsTag: 'spaceforce_mode',
    accentColor: '#19d7ff',
    badge: '🚀'
  }
};

export const getMissionModeProfile = (mode: MissionMode): MissionModeProfile => missionModeProfiles[mode];
