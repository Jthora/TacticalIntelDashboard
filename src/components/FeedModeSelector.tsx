import React from 'react';

import { MissionMode, missionModeProfiles } from '../constants/MissionMode';
import { useMissionMode } from '../contexts/MissionModeContext';

const FeedModeSelector: React.FC = () => {
  const { mode, setMode, profile } = useMissionMode();

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMode(e.target.value as MissionMode);
  };

  return (
    <div className="feed-mode-selector">
      <label htmlFor="mission-mode">Mission Mode:</label>
      <select 
        id="mission-mode" 
        value={mode} 
        onChange={handleModeChange}
        className="feed-mode-select"
      >
        {Object.values(missionModeProfiles).map(profileOption => (
          <option key={profileOption.id} value={profileOption.id}>
            {profileOption.label}
          </option>
        ))}
      </select>
      
      <div className="mode-description">
        <span className="mode-badge earth-alliance">{profile.badge} {profile.label}</span>
        <p>{profile.description}</p>
        <small>{profile.tagline}</small>
      </div>
    </div>
  );
};

export default FeedModeSelector;
