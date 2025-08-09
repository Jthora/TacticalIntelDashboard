import React from 'react';

import { FeedMode } from '../constants/EarthAllianceDefaultFeeds';
import { useFeedMode } from '../contexts/FeedModeContext';

const FeedModeSelector: React.FC = () => {
  const { feedMode, setFeedMode } = useFeedMode();

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFeedMode(e.target.value as FeedMode);
  };

  return (
    <div className="feed-mode-selector">
      <label htmlFor="feed-mode">Intelligence Source Mode:</label>
      <select 
        id="feed-mode" 
        value={feedMode} 
        onChange={handleModeChange}
        className="feed-mode-select"
      >
        <option value={FeedMode.EARTH_ALLIANCE}>Earth Alliance</option>
        <option value={FeedMode.MAINSTREAM}>Mainstream</option>
        <option value={FeedMode.HYBRID}>Hybrid</option>
      </select>
      
      {feedMode === FeedMode.EARTH_ALLIANCE && (
        <div className="mode-description">
          <span className="mode-badge earth-alliance">Earth Alliance</span>
          <p>Displaying vetted, trusted intelligence sources aligned with Earth Alliance priorities.</p>
        </div>
      )}
      
      {feedMode === FeedMode.MAINSTREAM && (
        <div className="mode-description">
          <span className="mode-badge mainstream">Mainstream</span>
          <p>Displaying conventional news sources for comparison purposes.</p>
        </div>
      )}
      
      {feedMode === FeedMode.HYBRID && (
        <div className="mode-description">
          <span className="mode-badge hybrid">Hybrid</span>
          <p>Displaying high-trust Earth Alliance sources alongside selected mainstream outlets.</p>
        </div>
      )}
    </div>
  );
};

export default FeedModeSelector;
