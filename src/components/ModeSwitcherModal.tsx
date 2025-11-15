import React, { useMemo, useState } from 'react';

import { MissionMode, missionModeProfiles } from '../constants/MissionMode';
import { useMissionMode } from '../contexts/MissionModeContext';

interface ModeSwitcherModalProps {
  open: boolean;
  onClose: () => void;
}

const ModeSwitcherModal: React.FC<ModeSwitcherModalProps> = ({ open, onClose }) => {
  const { mode, setMode } = useMissionMode();
  const [selectedMode, setSelectedMode] = useState<MissionMode>(mode);
  const [persistPreference, setPersistPreference] = useState(true);

  const profiles = useMemo(() => Object.values(missionModeProfiles), []);

  if (!open) {
    return null;
  }

  const handleActivate = () => {
    if (selectedMode === mode) {
      onClose();
      return;
    }

    setMode(selectedMode, {
      persist: persistPreference,
      reason: 'mode-switcher-modal'
    });
    onClose();
  };

  return (
    <div className="mode-switcher-modal" role="dialog" aria-modal="true" aria-label="Mission mode selector">
      <div className="mode-switcher-overlay" onClick={onClose} />
      <div className="mode-switcher-content">
        <header className="mode-switcher-header">
          <div>
            <p className="mode-switcher-label">Mission Mode</p>
            <h2>Choose Operational Profile</h2>
            <p className="mode-switcher-subtitle">Switching modes updates sources, theming, and mission defaults.</p>
          </div>
          <button className="mode-switcher-close" onClick={onClose} aria-label="Close mode switcher">×</button>
        </header>

        <div className="mode-switcher-grid">
          {profiles.map(profile => {
            const isActive = mode === profile.id;
            const isSelected = selectedMode === profile.id;
            return (
              <button
                key={profile.id}
                className={`mode-card ${isSelected ? 'selected' : ''} ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedMode(profile.id)}
                aria-pressed={isSelected}
              >
                <div className="mode-card-top">
                  <span className="mode-card-badge">{profile.badge} {profile.label}</span>
                  {isActive && <span className="mode-card-active">Active</span>}
                </div>
                <p className="mode-card-tagline">{profile.tagline}</p>
                <p className="mode-card-description">{profile.description}</p>
                <div className="mode-card-meta">
                  <span className="mode-card-meta-item">Default feed: {profile.defaultFeedListId}</span>
                  <span className="mode-card-meta-item">Theme: {profile.defaultTheme}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mode-switcher-footer">
          <label className="mode-switcher-default">
            <input
              type="checkbox"
              checked={persistPreference}
              onChange={e => setPersistPreference(e.target.checked)}
            />
            Set as my default mission mode
          </label>
          <div className="mode-switcher-actions">
            <button className="mode-switcher-cancel" onClick={onClose}>Cancel</button>
            <button className="mode-switcher-activate" onClick={handleActivate} disabled={selectedMode === mode}>
              Activate {missionModeProfiles[selectedMode].badge} {missionModeProfiles[selectedMode].label}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeSwitcherModal;
